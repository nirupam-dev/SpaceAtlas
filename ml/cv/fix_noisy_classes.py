# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

"""
SpaceAtlas -- Fix Noisy Classes v2 (Wikimedia API)
===================================================
Downloads ACTUAL asteroid/comet/black_hole images via the Wikimedia
Commons API (which resolves proper thumbnail URLs) + filtered NASA API.
"""

import os, json, hashlib, time, shutil, requests
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm

DATASET_DIR = Path(__file__).parent / "dataset_v2"
NASA_API_URL = "https://images-api.nasa.gov/search"
TARGET = 60
MAX_WORKERS = 5
BBOX_COVERAGE = 0.85
UA = "SpaceAtlas/1.0 (educational astrophysics project; contact@spaceatlas.dev)"


# ── Wikimedia Commons filenames — known good images ──

WIKI_FILES = {
    "asteroid": [
        "Bennu_mosaic_OSIRIS-REx_(square).png",
        "OSIRIS-REx_-_Bennu_Full_Mosaic.png",
        "Ryugu_colored.jpg",
        "Ryugu_near-color_image_by_ONC-T_on_26Jun2018.png",
        "Eros_-_PIA02923_(color).jpg",
        "Eros_-_PIA03140.jpg",
        "Itokawa8_hayabusa.jpg",
        "Vesta_full_mosaic.jpg",
        "Ceres_-_RC3_-_Haulani_Crater_(22381131691)_(cropped).jpg",
        "243_ida_crop.jpg",
        "Ida_and_Dactyl.jpg",
        "253_Mathilde.jpg",
        "Toutatis.jpg",
        "951_Gaspra.jpg",
        "21_Lutetia_by_Rosetta_crop.jpg",
        "Steins_Rosetta.jpg",
        "Dinkinesh_and_Selam_taken_by_Lucy.png",
        "Dimorphos_seen_by_DART_(crop).png",
        "DART-Didymos-Dimorphos_(crop_2).png",
        "Arrokoth_(2014_MU69)-cropped.png",
        "PIA19185-Ceres-DwarfPlanet-20150219.jpg",
        "PIA20348-Ceres-DwarfPlanet-Dawn-4thMapOrbit-LAMO-image68-2016114.jpg",
        "Vesta_from_Dawn,_July_17,_2011.jpg",
        "Bennu_OSIRIS-REx_2018Dec03.jpg",
    ],
    "comet": [
        "Comet_67P_on_19_September_2014_NavCam_mosaic.jpg",
        "Comet_on_3_August_2014_cropped.jpg",
        "Comet_2020_F3_(NEOWISE)_on_Jul_14_2020_01.jpg",
        "Comet_Hale-Bopp_1995O1.jpg",
        "Lspn_comet_halley.jpg",
        "Giotto-P-Halley.jpg",
        "Comet_9P_Tempel_1_-_4_July_2005.jpg",
        "Wild2_3.jpg",
        "Hartley_2_close_approach_in_Nov_2010.jpg",
        "Comet_P1_McNaught02_-_23-01-07-edited.jpg",
        "ISS-46_Comet_Lovejoy.jpg",
        "Comet_Borrelly_Nucleus.jpg",
        "Comet_Leonard_on_Christmas_Day_2021.jpg",
        "C2023_A3_Tsuchinshan-ATLAS.jpg",
        "Comet_ISON_(Nov._19,_2013).jpg",
        "Comet_Holmes_in_November_2007.jpg",
        "Siding_Spring_from_MRO.jpg",
    ],
    "black_hole": [
        "Black_hole_-_Messier_87_crop_max_res.jpg",
        "EHT_Saggitarius_A_black_hole.tif",
        "BH_LMC.png",
        "Cygnus_X-1.jpg",
        "M87_jet.jpg",
        "Artist%27s_impression_of_the_black_hole_inside_NGC_300_X-1_(ESO_1004c).jpg",
        "Black_Hole_Milkyway.jpg",
        "Black_hole_consuming_star.jpg",
        "Chandra_image_of_Cygnus_X-1.jpg",
        "Artist's_rendering_ULAS_J1120+0641.jpg",
    ],
}


def get_wiki_thumb_url(filename, width=640):
    """Use Wikimedia Commons API to get a proper thumbnail URL."""
    api = "https://commons.wikimedia.org/w/api.php"
    params = {
        "action": "query",
        "titles": f"File:{filename}",
        "prop": "imageinfo",
        "iiprop": "url",
        "iiurlwidth": width,
        "format": "json",
    }
    try:
        r = requests.get(api, params=params, headers={"User-Agent": UA}, timeout=15)
        data = r.json()
        pages = data.get("query", {}).get("pages", {})
        for page in pages.values():
            ii = page.get("imageinfo", [{}])[0]
            return ii.get("thumburl") or ii.get("url")
    except:
        pass
    return None


def download(url, path):
    try:
        r = requests.get(url, headers={"User-Agent": UA}, timeout=30)
        r.raise_for_status()
        if len(r.content) < 3000:
            return False
        path.write_bytes(r.content)
        return True
    except:
        return False


def search_nasa_filtered(query):
    """Search NASA API with strict title-based filtering."""
    try:
        resp = requests.get(NASA_API_URL, params={
            "q": query, "media_type": "image", "page_size": 100
        }, timeout=30)
        resp.raise_for_status()
        items = resp.json().get("collection", {}).get("items", [])
    except:
        return []

    results = []
    reject = ["portrait", "headshot", "administrator", "director", "press",
              "briefing", "conference", "ceremony", "building", "facility",
              "clean room", "team", "group", "staff", "engineer", "logo",
              "patch", "insignia", "chart", "diagram", "infographic",
              "artist", "illustration", "concept"]

    for item in items:
        meta = (item.get("data") or [{}])[0]
        title = (meta.get("title", "") or "").lower()
        if any(kw in title for kw in reject):
            continue
        for link in item.get("links", []):
            href = link.get("href", "")
            if link.get("rel") == "preview" and href.endswith((".jpg", ".png", ".jpeg")):
                results.append(href.replace("~thumb", "~medium").replace("~small", "~medium"))
                break
    return results


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
    label_path.write_text(f"{class_idx} 0.500000 0.500000 {BBOX_COVERAGE:.6f} {BBOX_COVERAGE:.6f}\n")


NASA_QUERIES = {
    "asteroid": [
        "OSIRIS-REx bennu asteroid surface mosaic",
        "asteroid Vesta Dawn image surface",
        "asteroid Eros NEAR Shoemaker surface",
        "Ryugu Hayabusa2 asteroid surface",
        "DART Dimorphos asteroid impact image",
        "asteroid Ceres Dawn image surface crater",
        "asteroid Ida Gaspra Galileo image",
        "asteroid Bennu sample collection image",
        "Itokawa asteroid Hayabusa image",
        "asteroid Lutetia Rosetta flyby image",
    ],
    "comet": [
        "67P comet Rosetta NAVCAM image",
        "comet nucleus spacecraft surface image",
        "comet NEOWISE sky tail photograph",
        "comet Tempel Deep Impact nucleus image",
        "comet Hartley EPOXI close image",
        "comet Wild2 Stardust nucleus image",
    ],
    "black_hole": [
        "M87 black hole shadow image EHT",
        "Sagittarius A star black hole image",
        "black hole accretion disk X-ray image",
        "black hole jet X-ray Chandra image",
        "event horizon telescope black hole",
        "gravitational lensing black hole image",
    ],
}


def fix_class(class_name):
    class_dir = DATASET_DIR / class_name
    class_idx = _get_class_idx(class_name)

    # Nuke existing bad images
    if class_dir.exists():
        old = len([f for f in class_dir.iterdir() if f.suffix.lower() in (".jpg", ".png", ".jpeg")])
        print(f"\n  [{class_name.upper()}] Wiping {old} existing images...")
        shutil.rmtree(class_dir)
    class_dir.mkdir(parents=True, exist_ok=True)

    # Step 1: Download via Wikimedia Commons API
    wiki_files = WIKI_FILES.get(class_name, [])
    print(f"  [{class_name.upper()}] Downloading {len(wiki_files)} curated Wikimedia images...")

    wiki_ok = 0
    for fname in tqdm(wiki_files, desc=f"    {class_name} wiki", leave=False):
        url = get_wiki_thumb_url(fname)
        if not url:
            continue
        h = hashlib.md5(fname.encode()).hexdigest()[:12]
        ext = ".jpg" if fname.lower().endswith((".jpg", ".jpeg", ".tif", ".tiff")) else ".png"
        dst = class_dir / f"{class_name}_wiki_{h}{ext}"
        if download(url, dst):
            write_yolo_annotation(dst, class_idx)
            wiki_ok += 1
        time.sleep(0.2)

    print(f"  [{class_name.upper()}] Wikimedia: {wiki_ok}/{len(wiki_files)}")

    # Step 2: Supplement with filtered NASA API
    current = len([f for f in class_dir.iterdir() if f.suffix.lower() in (".jpg", ".jpeg", ".png")])
    if current < TARGET:
        needed = TARGET - current
        print(f"  [{class_name.upper()}] NASA supplement: need {needed} more...")

        seen = set()
        tasks = []
        for query in NASA_QUERIES.get(class_name, []):
            if len(tasks) >= needed * 2:
                break
            urls = search_nasa_filtered(query)
            for url in urls:
                if url in seen or len(tasks) >= needed * 2:
                    continue
                seen.add(url)
                h = hashlib.md5(url.encode()).hexdigest()[:12]
                dst = class_dir / f"{class_name}_nasa_{h}.jpg"
                if not dst.exists():
                    tasks.append((url, dst))
            time.sleep(0.3)

        nasa_ok = 0
        if tasks:
            with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
                futs = {pool.submit(download, u, p): (u, p) for u, p in tasks}
                for f in tqdm(as_completed(futs), total=len(futs), desc=f"    {class_name} nasa", leave=False):
                    if f.result():
                        nasa_ok += 1
                        _, p = futs[f]
                        write_yolo_annotation(p, class_idx)

        print(f"  [{class_name.upper()}] NASA: +{nasa_ok}")

    final = len([f for f in class_dir.iterdir() if f.suffix.lower() in (".jpg", ".jpeg", ".png")])
    print(f"  [{'OK' if final >= 15 else '!!'}] {class_name:25s} {final} images total\n")
    return final


def main():
    print("=" * 60)
    print("  SpaceAtlas -- Fix Noisy Classes v2 (Wikimedia API)")
    print("=" * 60)

    totals = {}
    for cn in ["asteroid", "comet", "black_hole"]:
        totals[cn] = fix_class(cn)

    print("=" * 60)
    print("  RESULTS:")
    for cn, count in totals.items():
        print(f"    {cn:20s} {count} images")
    print("=" * 60)
    print("  Next: python ml/cv/annotate_dataset.py")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
