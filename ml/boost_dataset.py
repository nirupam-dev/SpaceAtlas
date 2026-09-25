# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

"""Boost low classes with extra search queries. Generates YOLO annotations."""

import os, hashlib, time, json, requests
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm

DATASET_DIR = Path(__file__).parent / "cv" / "dataset_v2"
NASA_API_URL = "https://images-api.nasa.gov/search"
TARGET = 40  # Minimum threshold
MAX_WORKERS = 5
BBOX_COVERAGE = 0.85

# Extra queries for classes that came in too low
BOOST = {
    "saturn": [
        "saturn planet", "saturn NASA", "saturn space", "saturn solar system",
        "saturn voyager", "saturn cassini mission", "saturn beautiful rings",
        "cassini saturn images", "saturn aurora", "saturn moons system",
    ],
    "moon": [
        "moon NASA", "moon surface", "full moon", "moon crescent",
        "moon apollo NASA", "moon high resolution", "moon phases",
        "lunar NASA", "moon telescope", "moon dark side",
    ],
    "pillars_of_creation": [
        "pillars creation", "eagle nebula pillars", "M16 eagle nebula",
        "eagle nebula NASA", "pillars creation NASA",
    ],
    "crab_nebula": [
        "crab nebula NASA", "M1 nebula", "crab nebula supernova",
        "crab nebula Chandra", "crab nebula X-ray",
    ],
    "carina_nebula": [
        "carina nebula NASA", "eta carinae nebula", "carina JWST images",
        "NGC 3372 nebula", "carina star forming",
    ],
    "titan": [
        "titan saturn moon NASA", "titan cassini huygens", "titan atmosphere moon",
        "titan surface cassini", "titan methane lakes",
    ],
    "uranus": [
        "uranus planet NASA", "uranus ice giant", "uranus JWST",
        "uranus rings NASA", "uranus moons", "uranus Hubble",
    ],
    "andromeda_galaxy": [
        "andromeda galaxy NASA", "M31 andromeda", "andromeda Hubble space",
        "andromeda galaxy infrared", "andromeda nearest galaxy",
    ],
    "orion_nebula": [
        "orion nebula NASA space", "M42 nebula hubble", "orion star forming",
        "orion nebula JWST", "orion trapezium",
    ],
    "starship": [
        "starship SpaceX launch", "SpaceX starship test flight",
        "starship IFT", "starship steel rocket SpaceX", "super heavy booster",
    ],
    "whirlpool_galaxy": [
        "whirlpool galaxy NASA", "M51 hubble galaxy", "whirlpool spiral",
        "NGC 5194 galaxy", "M51 interacting galaxy",
    ],
    "io": [
        "io moon jupiter volcanic", "io jupiter NASA", "io galileo moon",
        "io volcanic eruption", "io surface NASA",
    ],
    "jupiter": [
        "jupiter NASA juno", "jupiter clouds NASA", "jupiter atmosphere",
        "jupiter great red spot closeup", "jupiter auroras", "jupiter moons system",
    ],
    "mars": [
        "mars planet NASA orbital", "mars atmosphere", "mars polar ice cap",
        "mars Viking NASA", "mars global surveyor", "mars reconnaissance",
    ],
}


def _get_class_idx(class_name):
    """Get the YOLO class index for a class name."""
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
        }, timeout=30)
        resp.raise_for_status()
        return resp.json().get("collection", {}).get("items", [])
    except:
        return []


def get_image_url(item):
    for link in item.get("links", []):
        if link.get("rel") == "preview" and link.get("href", "").endswith((".jpg", ".png", ".jpeg")):
            return link["href"].replace("~thumb", "~medium").replace("~small", "~medium")
    return None


def download(url, path):
    try:
        resp = requests.get(url, timeout=30)
        resp.raise_for_status()
        if len(resp.content) < 3000:
            return False
        path.write_bytes(resp.content)
        return True
    except:
        return False


def write_yolo_annotation(img_path, class_idx):
    """Write a YOLO-format .txt annotation file for the image."""
    label_path = img_path.with_suffix(".txt")
    annotation = f"{class_idx} 0.500000 0.500000 {BBOX_COVERAGE:.6f} {BBOX_COVERAGE:.6f}\n"
    label_path.write_text(annotation, encoding="utf-8")


def boost(name, queries):
    d = DATASET_DIR / name
    d.mkdir(parents=True, exist_ok=True)
    existing = set(f.name for f in d.iterdir() if f.suffix in (".jpg", ".png", ".jpeg"))
    current = len(existing)

    class_idx = _get_class_idx(name)

    if current >= TARGET:
        print(f"  [OK]  {name:25s} {current} images (already enough)")
        return current

    needed = TARGET - current
    print(f"  >>    {name:25s} have {current}, need {needed} more...")

    seen, tasks = set(), []
    for q in queries:
        if len(tasks) >= needed * 2:
            break
        for item in search_nasa(q):
            if len(tasks) >= needed * 2:
                break
            url = get_image_url(item)
            if not url or url in seen:
                continue
            seen.add(url)
            h = hashlib.md5(url.encode()).hexdigest()[:12]
            fn = f"{name}_{h}.jpg"
            if fn in existing:
                continue
            tasks.append((url, d / fn))
        time.sleep(0.3)

    ok = 0
    if tasks:
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
            futs = {pool.submit(download, u, p): (u, p) for u, p in tasks}
            for f in tqdm(as_completed(futs), total=len(futs), desc=f"    {name:20s}", leave=False):
                if f.result():
                    ok += 1
                    # Write YOLO annotation
                    _, img_path = futs[f]
                    write_yolo_annotation(img_path, class_idx)

    final = current + ok
    print(f"  [{'OK' if final >= TARGET else '!!':3s}] {name:25s} {final} images (+{ok} new)")
    return final


def main():
    print("=" * 55)
    print("  Boosting low classes (with YOLO annotations)")
    print("=" * 55 + "\n")

    for name, queries in BOOST.items():
        boost(name, queries)

    # Final check
    print("\n" + "-" * 55)
    total = 0
    for d in sorted(DATASET_DIR.iterdir()):
        if d.is_dir():
            c = len([f for f in d.iterdir() if f.suffix in (".jpg", ".png", ".jpeg")])
            total += c
            s = "LOW" if c < 20 else "OK"
            print(f"  [{s:3s}] {d.name:25s} {c}")
    print(f"\n  Total: {total} images")


if __name__ == "__main__":
    main()
