# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

"""
SpaceAtlas -- Complete Space Object Dataset Collector (v3)
==========================================================
~35 specific classes covering planets, rockets, structures,
celestial objects, moons, and phenomena.
"""

import os
import json
import hashlib
import time
import requests
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm

DATASET_DIR = Path(__file__).parent / "cv" / "dataset_v2"
NASA_API_URL = "https://images-api.nasa.gov/search"
TARGET_PER_CLASS = 80
MAX_WORKERS = 5

OBJECTS = {
    # ═══ PLANETS (8) ═══
    "mercury": {
        "queries": ["mercury planet messenger", "mercury planet surface", "mercury planet NASA", "mercury closest sun"],
        "display": "Mercury",
        "path": "/solar-system/mercury",
    },
    "venus": {
        "queries": ["venus planet", "venus planet clouds", "venus planet magellan", "venus surface radar"],
        "display": "Venus",
        "path": "/solar-system/venus",
    },
    "earth": {
        "queries": ["earth from space", "earth blue marble", "earth planet ISS", "earth full disk space"],
        "display": "Earth",
        "path": "/solar-system/earth",
    },
    "mars": {
        "queries": ["mars planet", "mars red planet", "mars surface orbital", "mars valles marineris"],
        "display": "Mars",
        "path": "/solar-system/mars",
    },
    "jupiter": {
        "queries": ["jupiter planet", "jupiter great red spot", "jupiter juno", "jupiter bands clouds"],
        "display": "Jupiter",
        "path": "/solar-system/jupiter",
    },
    "saturn": {
        "queries": ["saturn planet rings", "saturn cassini", "saturn planet NASA", "saturn rings closeup"],
        "display": "Saturn",
        "path": "/solar-system/saturn",
    },
    "uranus": {
        "queries": ["uranus planet", "uranus planet voyager", "uranus blue green", "uranus NASA planet"],
        "display": "Uranus",
        "path": "/solar-system/uranus",
    },
    "neptune": {
        "queries": ["neptune planet", "neptune planet voyager", "neptune blue planet NASA"],
        "display": "Neptune",
        "path": "/solar-system/neptune",
    },
    "pluto": {
        "queries": ["pluto planet", "pluto new horizons", "pluto dwarf planet", "pluto heart"],
        "display": "Pluto",
        "path": "/solar-system/pluto",
    },

    # ═══ SUN & MOON (2) ═══
    "sun": {
        "queries": ["sun solar NASA SDO", "sun corona", "sun solar flare", "sun ultraviolet NASA"],
        "display": "Sun",
        "path": "/solar-system/sun",
    },
    "moon": {
        "queries": ["moon surface NASA", "moon crater closeup", "moon full NASA", "lunar surface apollo"],
        "display": "Moon",
        "path": "/solar-system/moon",
    },

    # ═══ FAMOUS MOONS (3) ═══
    "europa": {
        "queries": ["europa moon jupiter", "europa ice moon", "europa jupiter NASA galileo"],
        "display": "Europa",
        "path": "/solar-system",
    },
    "titan": {
        "queries": ["titan moon saturn", "titan saturn cassini", "titan moon huygens"],
        "display": "Titan",
        "path": "/solar-system",
    },
    "io": {
        "queries": ["io moon jupiter", "io volcanic moon", "io jupiter galileo NASA"],
        "display": "Io",
        "path": "/solar-system",
    },

    # ═══ ROCKETS (6) ═══
    "falcon_9": {
        "queries": ["falcon 9 launch", "falcon 9 landing", "falcon 9 SpaceX", "falcon 9 rocket"],
        "display": "Falcon 9",
        "path": "/rockets/falcon-9",
    },
    "space_shuttle": {
        "queries": ["space shuttle launch", "space shuttle NASA", "space shuttle orbiter", "space shuttle landing"],
        "display": "Space Shuttle",
        "path": "/rockets/space-shuttle",
    },
    "saturn_v": {
        "queries": ["saturn v rocket", "saturn v launch", "saturn v apollo", "saturn v NASA"],
        "display": "Saturn V",
        "path": "/rockets/saturn-v",
    },
    "starship": {
        "queries": ["SpaceX starship", "starship rocket launch", "starship super heavy", "starship steel rocket"],
        "display": "Starship",
        "path": "/rockets/starship",
    },
    "sls": {
        "queries": ["SLS rocket", "space launch system", "SLS artemis NASA", "SLS launch"],
        "display": "SLS",
        "path": "/rockets/sls",
    },
    "soyuz": {
        "queries": ["soyuz rocket launch", "soyuz rocket", "soyuz spacecraft launch", "soyuz NASA"],
        "display": "Soyuz",
        "path": "/rockets/soyuz-2",
    },

    # ═══ SPACE STRUCTURES (3) ═══
    "iss": {
        "queries": ["international space station", "ISS orbit", "ISS exterior NASA", "ISS solar panels space"],
        "display": "International Space Station",
        "path": "/satellites/iss",
    },
    "hubble_telescope": {
        "queries": ["hubble space telescope", "hubble telescope orbit", "hubble telescope NASA"],
        "display": "Hubble Space Telescope",
        "path": "/satellites/hubble",
    },
    "jwst": {
        "queries": ["james webb space telescope", "JWST telescope", "JWST mirror gold", "JWST NASA deploy"],
        "display": "James Webb Space Telescope",
        "path": "/satellites/jwst",
    },

    # ═══ GALAXIES (3) ═══
    "andromeda_galaxy": {
        "queries": ["andromeda galaxy", "andromeda galaxy M31", "andromeda galaxy hubble NASA"],
        "display": "Andromeda Galaxy",
        "path": "/solar-system",
    },
    "milky_way": {
        "queries": ["milky way galaxy", "milky way night sky", "milky way center NASA", "milky way panorama"],
        "display": "Milky Way",
        "path": "/solar-system",
    },
    "whirlpool_galaxy": {
        "queries": ["whirlpool galaxy M51", "whirlpool galaxy hubble", "M51 galaxy"],
        "display": "Whirlpool Galaxy",
        "path": "/solar-system",
    },

    # ═══ NEBULAE (4) ═══
    "orion_nebula": {
        "queries": ["orion nebula", "orion nebula hubble M42", "orion nebula NASA"],
        "display": "Orion Nebula",
        "path": "/solar-system",
    },
    "pillars_of_creation": {
        "queries": ["pillars of creation", "pillars creation eagle nebula", "pillars of creation JWST hubble"],
        "display": "Pillars of Creation",
        "path": "/solar-system",
    },
    "crab_nebula": {
        "queries": ["crab nebula", "crab nebula hubble", "crab nebula M1 NASA"],
        "display": "Crab Nebula",
        "path": "/solar-system",
    },
    "carina_nebula": {
        "queries": ["carina nebula", "carina nebula JWST", "carina nebula hubble NASA"],
        "display": "Carina Nebula",
        "path": "/solar-system",
    },

    # ═══ PHENOMENA (3) ═══
    "black_hole": {
        "queries": ["black hole M87", "black hole event horizon", "black hole NASA", "supermassive black hole"],
        "display": "Black Hole",
        "path": "/solar-system",
    },
    "comet": {
        "queries": ["comet NEOWISE", "comet NASA", "comet tail space", "comet halley"],
        "display": "Comet",
        "path": "/solar-system",
    },
    "asteroid": {
        "queries": ["asteroid bennu", "asteroid ryugu", "asteroid NASA", "asteroid belt closeup"],
        "display": "Asteroid",
        "path": "/solar-system",
    },

    # ═══ SURFACE / ROVERS (2) ═══
    "mars_rover": {
        "queries": ["mars rover curiosity", "mars rover perseverance", "mars rover surface NASA"],
        "display": "Mars Rover",
        "path": "/missions",
    },
    "lunar_lander": {
        "queries": ["lunar lander moon", "apollo lunar module", "lunar lander NASA artemis"],
        "display": "Lunar Lander",
        "path": "/missions",
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


def collect_class(class_name, config):
    class_dir = DATASET_DIR / class_name
    class_dir.mkdir(parents=True, exist_ok=True)

    existing = set(f.name for f in class_dir.iterdir() if f.suffix in (".jpg", ".png", ".jpeg"))
    current = len(existing)

    if current >= TARGET_PER_CLASS:
        print(f"  [OK]  {config['display']:30s} {current} images")
        return current

    needed = TARGET_PER_CLASS - current
    print(f"  >>    {config['display']:30s} have {current}, need {needed} more...")

    seen = set()
    tasks = []

    for query in config["queries"]:
        if len(tasks) >= needed:
            break
        items = search_nasa(query)
        time.sleep(0.3)
        for item in items:
            if len(tasks) >= needed:
                break
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

    final = current + ok
    status = "OK" if final >= TARGET_PER_CLASS * 0.4 else "LOW"
    print(f"  [{status:3s}] {config['display']:30s} {final} images (+{ok} new)")
    return final


def main():
    print("=" * 60)
    print("  SpaceAtlas -- Complete Space Object Dataset (v3)")
    print("  35 specific objects from NASA's public image library")
    print("=" * 60 + "\n")

    print(f"  Classes: {len(OBJECTS)}")
    print(f"  Target: {TARGET_PER_CLASS} images per class")
    print(f"  Output: {DATASET_DIR.resolve()}\n")

    DATASET_DIR.mkdir(parents=True, exist_ok=True)

    stats = {}

    # Group by category for nice output
    categories = {
        "PLANETS": ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"],
        "SUN & MOON": ["sun", "moon"],
        "MOONS": ["europa", "titan", "io"],
        "ROCKETS": ["falcon_9", "space_shuttle", "saturn_v", "starship", "sls", "soyuz"],
        "STRUCTURES": ["iss", "hubble_telescope", "jwst"],
        "GALAXIES": ["andromeda_galaxy", "milky_way", "whirlpool_galaxy"],
        "NEBULAE": ["orion_nebula", "pillars_of_creation", "crab_nebula", "carina_nebula"],
        "PHENOMENA": ["black_hole", "comet", "asteroid"],
        "SURFACE": ["mars_rover", "lunar_lander"],
    }

    for cat_name, class_names in categories.items():
        print(f"\n  --- {cat_name} ---")
        for cn in class_names:
            stats[cn] = collect_class(cn, OBJECTS[cn])

    # Save class mapping
    mapping = {}
    sorted_names = sorted(OBJECTS.keys())
    for i, class_name in enumerate(sorted_names):
        mapping[str(i)] = {
            "name": class_name,
            "display_name": OBJECTS[class_name]["display"],
            "spaceatlas_path": OBJECTS[class_name]["path"],
        }

    mapping_path = DATASET_DIR / "class_mapping.json"
    with open(mapping_path, "w", encoding="utf-8") as f:
        json.dump(mapping, f, indent=2)

    # Summary
    print("\n" + "=" * 60)
    print("  DATASET SUMMARY")
    print("=" * 60)
    total = 0
    for name in sorted(OBJECTS.keys()):
        count = stats.get(name, 0)
        total += count
        bar = "#" * min(count // 3, 20) + "." * max(0, 20 - count // 3)
        display = OBJECTS[name]["display"]
        print(f"  {display:30s} [{bar}] {count}")
    print("-" * 60)
    print(f"  Total: {total} images | Classes: {len(OBJECTS)}")
    print("=" * 60)
    print("\n  Done! Now run: python ml/cv/train.py\n")


if __name__ == "__main__":
    main()
