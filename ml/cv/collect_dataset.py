# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

"""
SpaceAtlas -- NASA Image Dataset Collector
==========================================
Downloads space images from NASA's free public API and organizes them
into category folders for training an image classification model.

Usage:
    python ml/cv/collect_dataset.py

Each category folder will contain ~100-150 images downloaded from
images.nasa.gov (all public domain, no API key required for this endpoint).

Output structure:
    ml/cv/dataset/
    ├── galaxy/
    ├── nebula/
    ├── planet/
    ├── rocket/
    ├── space_station/
    ├── satellite/
    ├── astronaut/
    ├── mars_surface/
    ├── earth_from_space/
    └── moon/
"""

import os
import sys
import json
import time
import hashlib
import requests
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm

# ─── Configuration ──────────────────────────────────────────────

DATASET_DIR = Path(__file__).parent / "dataset"
IMAGES_PER_CATEGORY = 150  # Target images per class
NASA_API_URL = "https://images-api.nasa.gov/search"
MAX_WORKERS = 5  # Parallel downloads
REQUEST_DELAY = 0.3  # Seconds between API calls (be nice to NASA)

# ─── Search Queries Per Category ────────────────────────────────
# Multiple queries per category to get diverse results

CATEGORIES = {
    "galaxy": [
        "spiral galaxy hubble",
        "elliptical galaxy",
        "galaxy cluster",
        "andromeda galaxy",
        "milky way galaxy",
        "galaxy deep field",
    ],
    "nebula": [
        "nebula hubble",
        "planetary nebula",
        "orion nebula",
        "eagle nebula pillars",
        "crab nebula",
        "supernova remnant",
    ],
    "planet": [
        "jupiter planet",
        "saturn planet rings",
        "mars planet surface",
        "venus planet",
        "neptune planet",
        "mercury planet",
        "uranus planet",
        "exoplanet artist",
    ],
    "rocket": [
        "rocket launch",
        "falcon 9 launch",
        "space shuttle launch",
        "atlas rocket launch",
        "soyuz rocket launch",
        "SLS rocket",
        "saturn v rocket",
        "ariane rocket launch",
    ],
    "space_station": [
        "international space station",
        "ISS space station",
        "space station orbit",
        "ISS exterior",
        "space station cupola",
        "tiangong space station",
    ],
    "satellite": [
        "satellite orbit",
        "hubble space telescope",
        "james webb space telescope",
        "communication satellite",
        "earth observation satellite",
        "satellite deployment",
    ],
    "astronaut": [
        "astronaut spacewalk",
        "astronaut EVA",
        "astronaut space suit",
        "astronaut ISS",
        "astronaut moon",
        "cosmonaut space",
    ],
    "mars_surface": [
        "mars rover surface",
        "mars curiosity rover",
        "mars perseverance",
        "mars crater surface",
        "mars landscape",
        "mars terrain",
    ],
    "earth_from_space": [
        "earth from space",
        "earth ISS",
        "earth blue marble",
        "earth atmosphere space",
        "earth night lights space",
        "earth sunrise orbit",
    ],
    "moon": [
        "moon surface",
        "moon crater",
        "lunar surface apollo",
        "moon landing",
        "full moon telescope",
        "moon close up",
    ],
}


def search_nasa_images(query: str, page_size: int = 50) -> list[dict]:
    """Search NASA Image API and return image metadata."""
    params = {
        "q": query,
        "media_type": "image",
        "page_size": min(page_size, 100),
    }

    try:
        resp = requests.get(NASA_API_URL, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        items = data.get("collection", {}).get("items", [])
        return items
    except Exception as e:
        print(f"    [WARN] Search failed for '{query}': {e}")
        return []


def get_image_url(item: dict) -> str | None:
    """Extract the best image URL from a NASA API item."""
    links = item.get("links", [])
    for link in links:
        if link.get("rel") == "preview" and link.get("href", "").endswith((".jpg", ".png", ".jpeg")):
            # Get medium resolution version
            href = link["href"]
            # Try to get the larger "medium" version instead of thumbnail
            medium_url = href.replace("~thumb", "~medium").replace("~small", "~medium")
            return medium_url
    return None


def download_image(url: str, save_path: Path) -> bool:
    """Download a single image to disk."""
    try:
        resp = requests.get(url, timeout=30, stream=True)
        resp.raise_for_status()

        content_type = resp.headers.get("content-type", "")
        if "image" not in content_type and "octet" not in content_type:
            return False

        # Check minimum size (skip tiny thumbnails)
        content = resp.content
        if len(content) < 5000:  # Less than 5KB is probably a broken image
            return False

        save_path.write_bytes(content)
        return True
    except Exception:
        return False


def collect_category(category: str, queries: list[str]) -> int:
    """Collect images for a single category."""
    category_dir = DATASET_DIR / category
    category_dir.mkdir(parents=True, exist_ok=True)

    # Check existing images
    existing = set(f.name for f in category_dir.iterdir() if f.suffix in (".jpg", ".png", ".jpeg"))
    target = IMAGES_PER_CATEGORY
    collected = len(existing)

    if collected >= target:
        print(f"  [OK] {category}: Already has {collected} images (target: {target})")
        return collected

    print(f"  >> {category}: Have {collected}/{target} images, collecting more...")

    # Collect unique image URLs from all queries
    seen_urls = set()
    download_tasks = []

    for query in queries:
        if collected + len(download_tasks) >= target:
            break

        items = search_nasa_images(query)
        time.sleep(REQUEST_DELAY)

        for item in items:
            if collected + len(download_tasks) >= target:
                break

            url = get_image_url(item)
            if not url or url in seen_urls:
                continue
            seen_urls.add(url)

            # Generate unique filename from URL
            url_hash = hashlib.md5(url.encode()).hexdigest()[:12]
            filename = f"{category}_{url_hash}.jpg"

            if filename in existing:
                continue

            save_path = category_dir / filename
            download_tasks.append((url, save_path))

    # Download in parallel
    success = 0
    if download_tasks:
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
            futures = {pool.submit(download_image, url, path): (url, path)
                      for url, path in download_tasks}

            pbar = tqdm(as_completed(futures), total=len(futures),
                       desc=f"    ↓ {category}", unit="img", leave=False)

            for future in pbar:
                if future.result():
                    success += 1
                pbar.set_postfix(ok=success)

    total = collected + success
    status = "[OK]" if total >= target * 0.7 else "[!!]"
    print(f"  {status} {category}: {total} images total ({success} new)")
    return total


def print_dataset_summary():
    """Print a summary of the collected dataset."""
    print("\n" + "=" * 56)
    print("  DATASET SUMMARY")
    print("=" * 56)

    total = 0
    for category in sorted(CATEGORIES.keys()):
        category_dir = DATASET_DIR / category
        if category_dir.exists():
            count = len([f for f in category_dir.iterdir()
                        if f.suffix in (".jpg", ".png", ".jpeg")])
            bar = "#" * (count // 5) + "." * max(0, 30 - count // 5)
            print(f"  {category:<20} [{bar}] {count}")
            total += count
        else:
            print(f"  {category:<20} [{'.' * 30}] 0")

    print("-" * 56)
    print(f"  Total images: {total}")
    print(f"  Categories: {len(CATEGORIES)}")
    print(f"  Output: {DATASET_DIR.resolve()}")
    print("=" * 56)


def create_class_mapping():
    """Create a JSON file mapping class indices to names."""
    mapping = {i: name for i, name in enumerate(sorted(CATEGORIES.keys()))}
    mapping_path = DATASET_DIR / "class_mapping.json"
    with open(mapping_path, "w", encoding="utf-8") as f:
        json.dump(mapping, f, indent=2)
    print(f"\n  Class mapping saved: {mapping_path}")
    return mapping


def main():
    print("=" * 56)
    print("  SpaceAtlas -- NASA Image Dataset Collector")
    print("  Downloads public domain space images for training")
    print("=" * 56 + "\n")

    print(f"  Output directory: {DATASET_DIR.resolve()}")
    print(f"  Target: {IMAGES_PER_CATEGORY} images x {len(CATEGORIES)} categories")
    print(f"  Source: images.nasa.gov (public domain, no API key)\n")

    DATASET_DIR.mkdir(parents=True, exist_ok=True)

    stats = {}
    for category, queries in CATEGORIES.items():
        stats[category] = collect_category(category, queries)

    # Save class mapping
    mapping = create_class_mapping()

    # Print summary
    print_dataset_summary()

    print("\n  Dataset collection complete!")
    print("  Next step: Run 'python ml/cv/train.py' to train the model.\n")


if __name__ == "__main__":
    main()
