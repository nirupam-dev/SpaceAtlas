# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

"""
SpaceAtlas -- Download 5 Major Moons from NASA Images API
Moons: Ganymede, Callisto, Enceladus, Triton, Phobos

Downloads images AND generates YOLO-format annotation files.
"""

import os
import json
import hashlib
import time
import requests
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

DATASET_DIR = Path(__file__).parent / "cv" / "dataset_v2"
NASA_API_URL = "https://images-api.nasa.gov/search"
TARGET_PER_CLASS = 60
MAX_WORKERS = 6
BBOX_COVERAGE = 0.85

MOONS = {
    "ganymede": {
        "queries": ["ganymede moon jupiter", "ganymede surface galileo NASA", "ganymede juno spacecraft", "ganymede full disk"],
        "display": "Ganymede",
        "path": "/solar-system",
    },
    "callisto": {
        "queries": ["callisto moon jupiter", "callisto craters NASA", "callisto galileo NASA", "callisto surface jupiter"],
        "display": "Callisto",
        "path": "/solar-system",
    },
    "enceladus": {
        "queries": ["enceladus moon saturn", "enceladus geysers cassini", "enceladus plumes NASA", "enceladus tiger stripes"],
        "display": "Enceladus",
        "path": "/solar-system",
    },
    "triton": {
        "queries": ["triton moon neptune", "triton voyager 2 NASA", "triton surface neptune", "triton geysers voyager"],
        "display": "Triton",
        "path": "/solar-system",
    },
    "phobos": {
        "queries": ["phobos moon mars", "phobos surface NASA", "phobos mars reconnaissance orbiter", "phobos crater stickney"],
        "display": "Phobos",
        "path": "/solar-system",
    },
}


def _get_class_idx(class_name):
    """Get the YOLO class index for a class name from class_mapping.json."""
    mapping_path = DATASET_DIR / "class_mapping.json"
    if mapping_path.exists():
        with open(mapping_path, "r", encoding="utf-8") as f:
            mapping = json.load(f)
        for idx_str, info in mapping.items():
            if info["name"] == class_name:
                return int(idx_str)
    # Fallback: compute from sorted dir list
    all_dirs = sorted(d.name for d in DATASET_DIR.iterdir() if d.is_dir())
    if class_name in all_dirs:
        return all_dirs.index(class_name)
    return 0


def search_nasa(query, page_size=100):
    try:
        resp = requests.get(NASA_API_URL, params={
            "q": query, "media_type": "image", "page_size": page_size
        }, timeout=25)
        resp.raise_for_status()
        return resp.json().get("collection", {}).get("items", [])
    except Exception as e:
        print(f"    [WARN] NASA search failed for '{query}': {e}")
        return []


def get_image_url(item):
    for link in item.get("links", []):
        href = link.get("href", "")
        if link.get("rel") == "preview" and href.lower().endswith((".jpg", ".png", ".jpeg")):
            # prefer medium resolution over tiny thumb
            return href.replace("~thumb", "~medium").replace("~small", "~medium")
    return None


def download_image(url, save_path):
    try:
        resp = requests.get(url, timeout=20)
        resp.raise_for_status()
        if len(resp.content) < 4000:
            return False
        save_path.write_bytes(resp.content)
        return True
    except Exception:
        return False


def write_yolo_annotation(img_path, class_idx):
    """Write a YOLO-format .txt annotation file for the image."""
    label_path = img_path.with_suffix(".txt")
    annotation = f"{class_idx} 0.500000 0.500000 {BBOX_COVERAGE:.6f} {BBOX_COVERAGE:.6f}\n"
    label_path.write_text(annotation, encoding="utf-8")


def collect_moon(name, config):
    folder = DATASET_DIR / name
    folder.mkdir(parents=True, exist_ok=True)

    class_idx = _get_class_idx(name)

    existing = [f for f in folder.iterdir() if f.is_file() and f.suffix.lower() in [".jpg", ".jpeg", ".png"]]
    current_count = len(existing)
    if current_count >= TARGET_PER_CLASS:
        print(f"[{name.upper()}] Already has {current_count} images. Skipping.")
        # Ensure annotations exist
        _ensure_annotations(folder, class_idx)
        return current_count

    print(f"\n[{name.upper()}] Collecting {TARGET_PER_CLASS - current_count} more images...")
    seen_urls = set()
    all_urls = []

    for query in config["queries"]:
        items = search_nasa(query)
        for item in items:
            img_url = get_image_url(item)
            if img_url and img_url not in seen_urls:
                seen_urls.add(img_url)
                all_urls.append(img_url)

    print(f"  Found {len(all_urls)} candidate URLs for {name}")

    downloaded = 0
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_map = {}
        for url in all_urls:
            if current_count + downloaded >= TARGET_PER_CLASS:
                break
            h = hashlib.md5(url.encode()).hexdigest()[:12]
            filename = f"{name}_{h}.jpg"
            target_file = folder / filename
            if target_file.exists():
                continue
            future = executor.submit(download_image, url, target_file)
            future_map[future] = target_file

        for future in as_completed(future_map):
            if future.result():
                downloaded += 1
                # Write YOLO annotation
                img_path = future_map[future]
                write_yolo_annotation(img_path, class_idx)
                if (current_count + downloaded) % 10 == 0 or (current_count + downloaded) >= TARGET_PER_CLASS:
                    print(f"  Downloaded: {current_count + downloaded}/{TARGET_PER_CLASS}")
                if current_count + downloaded >= TARGET_PER_CLASS:
                    break

    # Ensure all images have annotations
    _ensure_annotations(folder, class_idx)

    final_count = len([f for f in folder.iterdir() if f.is_file() and f.suffix.lower() in [".jpg", ".jpeg", ".png"]])
    print(f"[{name.upper()}] Total images: {final_count}")
    return final_count


def _ensure_annotations(class_dir, class_idx):
    """Make sure every image in the class dir has a matching .txt annotation."""
    for img_path in class_dir.iterdir():
        if img_path.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp"):
            label_path = img_path.with_suffix(".txt")
            if not label_path.exists():
                write_yolo_annotation(img_path, class_idx)


def update_class_mapping():
    mapping_file = DATASET_DIR / "class_mapping.json"
    
    # scan all folders in dataset_v2
    all_dirs = sorted([d.name for d in DATASET_DIR.iterdir() if d.is_dir()])
    
    mapping = {}
    for idx, dir_name in enumerate(all_dirs):
        # display name formatting
        display = dir_name.replace("_", " ").title()
        if dir_name in MOONS:
            display = MOONS[dir_name]["display"]
        elif dir_name == "iss":
            display = "International Space Station"
        elif dir_name == "jwst":
            display = "James Webb Space Telescope"
        elif dir_name == "sls":
            display = "Space Launch System (SLS)"
        elif dir_name == "falcon_9":
            display = "Falcon 9"
        elif dir_name == "saturn_v":
            display = "Saturn V"
        elif dir_name == "soyuz":
            display = "Soyuz"

        mapping[str(idx)] = {
            "name": dir_name,
            "display_name": display,
            "spaceatlas_path": f"/solar-system/{dir_name}" if dir_name in ["mercury","venus","earth","mars","jupiter","saturn","uranus","neptune","pluto","moon","sun"] else "/solar-system"
        }

    mapping_file.write_text(json.dumps(mapping, indent=2), encoding="utf-8")
    print(f"\n[MAPPING] Updated class_mapping.json with {len(mapping)} classes!")


def main():
    print("==================================================")
    print("SpaceAtlas -- Downloading 5 Major Moons (with YOLO annotations)")
    print("==================================================")
    for name, config in MOONS.items():
        collect_moon(name, config)
    
    update_class_mapping()
    print("\nAll 5 moons collected and class mapping updated!")

if __name__ == "__main__":
    main()
