# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

"""
SpaceAtlas -- Fix Asteroid Dataset
===================================
The NASA Images API returns press conferences, rocket launches, and people
when searching "asteroid" generically. This script:
  1. Wipes the bad asteroid images
  2. Re-downloads with highly specific queries targeting actual asteroid imagery
  3. Also reviews and fixes other potentially noisy classes

Usage:
    python ml/cv/fix_asteroid_dataset.py
"""

import os
import json
import hashlib
import time
import shutil
import requests
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm

DATASET_DIR = Path(__file__).parent / "cv" / "dataset_v2"
NASA_API_URL = "https://images-api.nasa.gov/search"
TARGET = 80
MAX_WORKERS = 5
BBOX_COVERAGE = 0.85


# ── Targeted queries — images of the ACTUAL object, not press events ──

FIX_CLASSES = {
    "asteroid": {
        "queries": [
            # OSIRIS-REx / Bennu — actual asteroid surface images
            "bennu asteroid surface",
            "bennu OSIRIS-REx closeup",
            "bennu asteroid sample",
            "bennu asteroid mosaic",
            # Ryugu — Hayabusa2
            "ryugu asteroid",
            "ryugu asteroid surface",
            # Eros — NEAR Shoemaker
            "eros asteroid NEAR",
            "eros asteroid surface",
            "433 eros asteroid",
            # Itokawa — Hayabusa
            "itokawa asteroid",
            # Vesta — Dawn
            "vesta asteroid Dawn",
            "vesta asteroid surface",
            "vesta crater Dawn",
            # Ceres — Dawn (dwarf planet / large asteroid)
            "ceres dawn asteroid",
            "ceres surface dawn",
            # Ida & Dactyl — Galileo
            "ida asteroid galileo",
            "ida dactyl asteroid",
            # Mathilde — NEAR
            "mathilde asteroid",
            # Generic actual asteroid images
            "asteroid closeup spacecraft",
            "asteroid surface NASA spacecraft",
            "near earth asteroid image",
        ],
        "display": "Asteroid",
        "nuke": True,  # Delete all existing images first
    },
    "comet": {
        "queries": [
            # Actual comet images (not press events)
            "comet NEOWISE night sky",
            "comet 67P churyumov rosetta",
            "comet 67P surface rosetta",
            "comet halley nucleus",
            "comet hale bopp",
            "comet tempel deep impact",
            "comet wild 2 stardust",
            "comet hartley EPOXI",
            "comet borrelly deep space",
            "comet tail astrophotography",
            "comet nucleus closeup",
            "comet ISON sun",
        ],
        "display": "Comet",
        "nuke": True,
    },
    "black_hole": {
        "queries": [
            # Actual black hole images and visualizations
            "black hole M87 event horizon telescope",
            "black hole Sagittarius A star",
            "black hole accretion disk",
            "black hole simulation NASA",
            "black hole X-ray chandra",
            "black hole jet NASA",
            "black hole gravitational lensing",
            "supermassive black hole visualization",
            "black hole artist concept NASA",
            "cygnus X-1 black hole",
        ],
        "display": "Black Hole",
        "nuke": True,
    },
}


def search_nasa(query, page_size=100):
    try:
        resp = requests.get(NASA_API_URL, params={
            "q": query, "media_type": "image", "page_size": page_size
        }, timeout=30)
        resp.raise_for_status()
        return resp.json().get("collection", {}).get("items", [])
    except Exception as e:
        print(f"    [WARN] Failed: {query}: {e}")
        return []


def get_image_url(item):
    for link in item.get("links", []):
        if link.get("rel") == "preview" and link.get("href", "").endswith((".jpg", ".png", ".jpeg")):
            return link["href"].replace("~thumb", "~medium").replace("~small", "~medium")
    return None


def is_likely_good_image(item, class_name):
    """
    Heuristic filter to reject press events, portraits, and non-space imagery.
    Checks the image title and description for red flags.
    """
    data_list = item.get("data", [])
    if not data_list:
        return True  # No metadata, can't filter

    meta = data_list[0]
    title = (meta.get("title", "") or "").lower()
    description = (meta.get("description", "") or "").lower()
    combined = title + " " + description

    # Red flags — images of people, press events, facilities
    red_flags = [
        "press conference", "press briefing", "media briefing",
        "portrait", "headshot", "official photo",
        "administrator", "director", "manager", "engineer",
        "signing", "ceremony", "award", "ribbon cutting",
        "building", "facility", "clean room",
        "group photo", "team photo", "staff",
        "logo", "patch", "insignia", "banner",
        "illustration", "infographic", "diagram", "chart",
        "tweet", "social media",
    ]

    for flag in red_flags:
        if flag in combined:
            return False

    # For asteroids specifically, require space-related keywords
    if class_name == "asteroid":
        good_keywords = [
            "asteroid", "bennu", "ryugu", "eros", "vesta", "ceres",
            "itokawa", "ida", "mathilde", "near earth", "surface",
            "spacecraft", "closeup", "mosaic", "crater",
        ]
        if not any(kw in combined for kw in good_keywords):
            return False

    return True


def download(url, path):
    try:
        resp = requests.get(url, timeout=30)
        resp.raise_for_status()
        if len(resp.content) < 5000:
            return False
        path.write_bytes(resp.content)
        return True
    except:
        return False


def _get_class_idx(class_name):
    mapping_path = DATASET_DIR / "class_mapping.json"
    if mapping_path.exists():
        with open(mapping_path, "r", encoding="utf-8") as f:
            mapping = json.load(f)
        for idx_str, info in mapping.items():
            if info["name"] == class_name:
                return int(idx_str)
    return 0


def write_yolo_annotation(img_path, class_idx):
    label_path = img_path.with_suffix(".txt")
    annotation = f"{class_idx} 0.500000 0.500000 {BBOX_COVERAGE:.6f} {BBOX_COVERAGE:.6f}\n"
    label_path.write_text(annotation, encoding="utf-8")


def fix_class(class_name, config):
    class_dir = DATASET_DIR / class_name
    class_idx = _get_class_idx(class_name)

    # Nuke existing bad images if flagged
    if config.get("nuke") and class_dir.exists():
        old_count = len([f for f in class_dir.iterdir() if f.suffix in (".jpg", ".png", ".jpeg")])
        print(f"\n  [{class_name.upper()}] Wiping {old_count} bad images...")
        shutil.rmtree(class_dir)

    class_dir.mkdir(parents=True, exist_ok=True)
    existing = set(f.name for f in class_dir.iterdir() if f.suffix in (".jpg", ".png", ".jpeg"))
    current = len(existing)

    print(f"  [{class_name.upper()}] Collecting with targeted queries (have {current}, target {TARGET})...")

    seen = set()
    tasks = []

    for query in config["queries"]:
        if len(tasks) + current >= TARGET * 1.5:  # Get extra to account for filtering
            break

        items = search_nasa(query)
        time.sleep(0.3)

        for item in items:
            if len(tasks) + current >= TARGET * 1.5:
                break

            # Apply content filter
            if not is_likely_good_image(item, class_name):
                continue

            url = get_image_url(item)
            if not url or url in seen:
                continue
            seen.add(url)

            h = hashlib.md5(url.encode()).hexdigest()[:12]
            fname = f"{class_name}_{h}.jpg"
            if fname in existing:
                continue
            tasks.append((url, class_dir / fname))

    ok = 0
    if tasks:
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
            futs = {pool.submit(download, u, p): (u, p) for u, p in tasks}
            for f in tqdm(as_completed(futs), total=len(futs), desc=f"    {class_name:20s}", leave=False):
                if f.result():
                    ok += 1
                    _, img_path = futs[f]
                    write_yolo_annotation(img_path, class_idx)

    final = len([f for f in class_dir.iterdir() if f.suffix in (".jpg", ".png", ".jpeg")])
    status = "OK" if final >= 30 else "LOW"
    print(f"  [{status:3s}] {config['display']:25s} {final} images ({ok} new)")
    return final


def main():
    print("=" * 60)
    print("  SpaceAtlas -- Fix Noisy Dataset Classes")
    print("  Wipe bad images, re-download with targeted queries")
    print("=" * 60)

    for class_name, config in FIX_CLASSES.items():
        fix_class(class_name, config)

    print("\n" + "=" * 60)
    print("  DONE. Run 'python ml/cv/annotate_dataset.py' to rebuild YOLO format.")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
