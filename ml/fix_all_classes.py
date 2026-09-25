# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

"""
SpaceAtlas — Comprehensive Dataset Fix
========================================
Fixes ALL 16 problem classes using:
  1. Wikimedia Commons API (curated, real images)
  2. Strictly filtered NASA Images API
  3. YOLO annotation for every downloaded image

NO nuking — only ADDS missing images to reach target count.
"""

import os, json, hashlib, time, shutil, requests
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm

DATASET_DIR = Path(__file__).parent / "cv" / "dataset_v2"
NASA_API = "https://images-api.nasa.gov/search"
WIKI_API = "https://commons.wikimedia.org/w/api.php"
TARGET = 50  # target per class
MAX_WORKERS = 5
BBOX = 0.85
UA = "SpaceAtlas/1.0 (educational astrophysics project)"

# ══════════════════════════════════════════════════════════════
#  CURATED WIKIMEDIA FILENAMES — guaranteed real space images
# ══════════════════════════════════════════════════════════════

WIKI_FILES = {
    "andromeda_galaxy": [
        "Andromeda_Galaxy_(with_h-alpha).jpg",
        "Andromeda_galaxy_2.jpg",
        "M31_Andromeda_Galaxy_(8242928124).jpg",
        "The_Andromeda_Galaxy_-_M31.jpg",
        "Andromeda_Galaxy_560mm_FL.jpg",
    ],
    "asteroid": [
        "Bennu_mosaic_OSIRIS-REx_(square).png",
        "Ryugu_colored.jpg",
        "Eros_-_PIA02923_(color).jpg",
        "Itokawa8_hayabusa.jpg",
        "Vesta_full_mosaic.jpg",
        "243_ida_crop.jpg",
        "Ida_and_Dactyl.jpg",
        "253_Mathilde.jpg",
        "951_Gaspra.jpg",
        "21_Lutetia_by_Rosetta_crop.jpg",
        "Steins_Rosetta.jpg",
        "Dinkinesh_and_Selam_taken_by_Lucy.png",
        "Dimorphos_seen_by_DART_(crop).png",
        "DART-Didymos-Dimorphos_(crop_2).png",
        "Arrokoth_(2014_MU69)-cropped.png",
        "Bennu_OSIRIS-REx_2018Dec03.jpg",
        "PIA19185-Ceres-DwarfPlanet-20150219.jpg",
        "Vesta_from_Dawn,_July_17,_2011.jpg",
        "Toutatis.jpg",
        "Eros_-_PIA03140.jpg",
    ],
    "black_hole": [
        "Black_hole_-_Messier_87_crop_max_res.jpg",
        "EHT_Saggitarius_A_black_hole.tif",
        "BH_LMC.png",
        "Cygnus_X-1.jpg",
        "M87_jet.jpg",
        "Black_Hole_Milkyway.jpg",
        "Chandra_image_of_Cygnus_X-1.jpg",
    ],
    "callisto": [
        "Callisto.jpg",
        "Callisto,_Europa_and_Io_-_GPN-2003-000003.jpg",
        "PIA03456_Asgard_on_Callisto.jpg",
        "Callisto_Valhalla.jpg",
        "Ganymede,_moon_of_Jupiter,_NASA.jpg",
    ],
    "carina_nebula": [
        "Carina_Nebula_by_Harel_Boren_(151851961,_modified).jpg",
        "Eta_Carinae_and_the_Homunculus_Nebula.jpg",
        "NASA-Carina_Nebula-Webb-20220712.png",
        "Carina_Nebula_by_ESO.jpg",
        "Carina_Nebula_(Trumpler_14).jpg",
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
        "Comet_Holmes_in_November_2007.jpg",
        "Siding_Spring_from_MRO.jpg",
    ],
    "crab_nebula": [
        "Crab_Nebula.jpg",
        "Crab_Nebula_in_multiwavelength.png",
        "HST-Crab_Nebula.jpg",
        "Crab_nebula_JWST.jpg",
        "Chandra-crab.jpg",
    ],
    "enceladus": [
        "Enceladus_from_Voyager.jpg",
        "PIA17202_-_Approaching_Enceladus.jpg",
        "Enceladus_geysers_artist.jpg",
        "False_color_Cassini_image_of_Enceladus.jpg",
    ],
    "ganymede": [
        "Ganymede_g1_true-edit1.jpg",
        "Ganymede,_moon_of_Jupiter,_NASA.jpg",
        "PIA24681-Juno_Ganymede.jpg",
    ],
    "phobos": [
        "Phobos_colour_2008.jpg",
        "PSP_007769_9010_IRB_Phobos.jpg",
        "221831main_PIA10368.png",
    ],
    "pillars_of_creation": [
        "Pillars_of_creation_2014_HST_WFC3-UVIS_full-res_denoised.jpg",
        "Webb%27s_NIRCam_image_of_the_Pillars_of_Creation.png",
        "Eagle_nebula_pillars.jpg",
        "Heic0506b.jpg",
    ],
    "saturn": [
        "Saturn_during_Equinox.jpg",
        "Saturn_from_Hubble.png",
        "Saturn_PIA06077.jpg",
        "Saturn_eclipse.jpg",
        "Saturn_(planet)_large.jpg",
        "Saturn_with_Titan_-_GPN-2003-000003_(cropped).jpg",
        "Cassini_Saturn_Orbit_Insertion.jpg",
        "Saturn_Cassini_July_2004.jpg",
    ],
    "starship": [
        "SpaceX_Starship_SN8_in_flight.jpg",
        "SpaceX_Starship_SN10_at_dawn.jpg",
        "Mechazilla_Catching_Starship_Super_Heavy_Booster.jpg",
        "SpX_Starship_SN15_after_landing_(51171659065).jpg",
    ],
    "titan": [
        "Titan_in_true_color.jpg",
        "PIA06230_Titan%27s_surface.jpg",
        "Titan_multi_spectral_overlay.jpg",
        "Titan_globe.jpg",
    ],
    "triton": [
        "Triton_moon_mosaic_Voyager_2_(large).jpg",
        "PIA00317-Triton-NeptuneFullDisc.jpg",
        "Triton_(moon).jpg",
    ],
    "uranus": [
        "Uranus_true_colour.jpg",
        "Uranus2.jpg",
        "Uranus_as_seen_by_NASA%27s_Voyager_2_(remastered)_-_JPEG_converted.jpg",
        "James_Webb_Uranus_2023.png",
        "PIA18182_Uranus_rings.jpg",
    ],
}

# ══════════════════════════════════════════════════════════════
#  NASA QUERIES — strictly filtered, object-focused
# ══════════════════════════════════════════════════════════════

NASA_QUERIES = {
    "andromeda_galaxy": ["andromeda galaxy M31 hubble", "andromeda galaxy spiral", "M31 galaxy NASA image"],
    "asteroid": [
        "OSIRIS-REx bennu asteroid surface mosaic",
        "asteroid Vesta Dawn image surface",
        "asteroid Eros NEAR Shoemaker surface",
        "Ryugu Hayabusa2 asteroid surface",
        "DART Dimorphos asteroid impact image",
        "asteroid Ceres Dawn image surface",
        "Itokawa asteroid Hayabusa image",
    ],
    "black_hole": [
        "M87 black hole shadow image EHT",
        "Sagittarius A star black hole image",
        "black hole accretion disk X-ray",
        "event horizon telescope black hole",
    ],
    "callisto": ["callisto moon jupiter Galileo image", "callisto surface crater", "callisto Voyager"],
    "carina_nebula": ["carina nebula JWST", "carina nebula hubble", "eta carinae nebula"],
    "comet": [
        "67P comet Rosetta NAVCAM image",
        "comet NEOWISE sky tail photograph",
        "comet Tempel Deep Impact nucleus",
        "comet Hartley EPOXI close image",
    ],
    "crab_nebula": ["crab nebula hubble", "crab nebula Chandra X-ray", "crab nebula JWST image"],
    "enceladus": ["enceladus moon Cassini", "enceladus plume geyser", "enceladus surface Cassini"],
    "ganymede": ["ganymede moon Jupiter image", "ganymede Juno flyby", "ganymede Galileo"],
    "phobos": ["phobos mars moon", "phobos surface MRO", "phobos Mars Express"],
    "pillars_of_creation": ["pillars creation hubble", "pillars creation JWST", "eagle nebula pillars"],
    "saturn": ["saturn planet rings Cassini", "saturn hubble", "saturn rings closeup", "saturn Cassini image"],
    "starship": ["SpaceX starship launch", "starship spacecraft", "SpaceX super heavy booster"],
    "titan": ["titan moon Cassini image", "titan surface Huygens", "titan atmosphere Cassini"],
    "triton": ["triton moon Neptune Voyager", "triton surface Voyager"],
    "uranus": ["uranus planet Voyager", "uranus planet hubble", "uranus JWST rings image"],
}

# ── Red-flag words for NASA title filtering ──
REJECT_TITLE_WORDS = [
    "portrait", "headshot", "administrator", "director", "press",
    "briefing", "conference", "ceremony", "building", "facility",
    "clean room", "team", "group", "staff", "engineer", "logo",
    "patch", "insignia", "chart", "diagram", "infographic",
    "artist", "illustration", "concept", "rendering", "tweet",
    "social media", "signing", "award", "ribbon",
]


# ══════════════════════════════════════════════════════════════
#  UTILITIES
# ══════════════════════════════════════════════════════════════

def get_wiki_url(filename, width=640):
    """Get thumbnail URL from Wikimedia Commons API."""
    try:
        r = requests.get(WIKI_API, params={
            "action": "query", "titles": f"File:{filename}",
            "prop": "imageinfo", "iiprop": "url",
            "iiurlwidth": width, "format": "json",
        }, headers={"User-Agent": UA}, timeout=15)
        pages = r.json().get("query", {}).get("pages", {})
        for page in pages.values():
            ii = page.get("imageinfo", [{}])[0]
            return ii.get("thumburl") or ii.get("url")
    except:
        pass
    return None


def download(url, path):
    """Download image, return True on success."""
    try:
        r = requests.get(url, headers={"User-Agent": UA}, timeout=30)
        r.raise_for_status()
        if len(r.content) < 3000:
            return False
        path.write_bytes(r.content)
        return True
    except:
        return False


def search_nasa_strict(query):
    """Search NASA API, return only URLs whose titles pass strict filtering."""
    try:
        r = requests.get(NASA_API, params={
            "q": query, "media_type": "image", "page_size": 100
        }, timeout=30)
        r.raise_for_status()
        items = r.json().get("collection", {}).get("items", [])
    except:
        return []

    urls = []
    for item in items:
        meta = (item.get("data") or [{}])[0]
        title = (meta.get("title", "") or "").lower()
        # Reject if title contains people/event words
        if any(w in title for w in REJECT_TITLE_WORDS):
            continue
        for link in item.get("links", []):
            href = link.get("href", "")
            if link.get("rel") == "preview" and href.endswith((".jpg", ".png", ".jpeg")):
                urls.append(href.replace("~thumb", "~medium").replace("~small", "~medium"))
                break
    return urls


def get_class_idx(class_name):
    mapping_path = DATASET_DIR / "class_mapping.json"
    if mapping_path.exists():
        with open(mapping_path, "r", encoding="utf-8") as f:
            mapping = json.load(f)
        for idx_str, info in mapping.items():
            if info["name"] == class_name:
                return int(idx_str)
    return 0


def write_annotation(img_path, class_idx):
    label_path = img_path.with_suffix(".txt")
    label_path.write_text(f"{class_idx} 0.500000 0.500000 {BBOX:.6f} {BBOX:.6f}\n")


# ══════════════════════════════════════════════════════════════
#  MAIN FIX LOGIC
# ══════════════════════════════════════════════════════════════

def fix_class(class_name):
    class_dir = DATASET_DIR / class_name
    class_dir.mkdir(parents=True, exist_ok=True)
    class_idx = get_class_idx(class_name)

    existing = set()
    for f in class_dir.iterdir():
        if f.suffix.lower() in (".jpg", ".jpeg", ".png"):
            existing.add(f.name)
    current = len(existing)

    if current >= TARGET:
        print(f"  [SKIP] {class_name:>25s}  {current} images (already >= {TARGET})")
        return current

    needed = TARGET - current
    print(f"\n  [{class_name.upper()}] Have {current}, need {needed} more to reach {TARGET}...")

    added = 0

    # ── Step 1: Wikimedia curated images ──
    wiki_files = WIKI_FILES.get(class_name, [])
    if wiki_files:
        for fname in tqdm(wiki_files, desc=f"    {class_name} wiki", leave=False):
            if added >= needed:
                break
            url = get_wiki_url(fname)
            if not url:
                continue
            h = hashlib.md5(fname.encode()).hexdigest()[:12]
            ext = ".png" if fname.lower().endswith(".png") else ".jpg"
            dst_name = f"{class_name}_wiki_{h}{ext}"
            if dst_name in existing:
                continue
            dst = class_dir / dst_name
            if download(url, dst):
                write_annotation(dst, class_idx)
                existing.add(dst_name)
                added += 1
            time.sleep(0.2)
        print(f"  [{class_name.upper()}] Wiki: +{added}")

    # ── Step 2: NASA API supplement (strict filter) ──
    still_needed = TARGET - len(existing)
    if still_needed > 0:
        queries = NASA_QUERIES.get(class_name, [])
        seen_urls = set()
        tasks = []

        for query in queries:
            if len(tasks) >= still_needed * 2:
                break
            urls = search_nasa_strict(query)
            for url in urls:
                if url in seen_urls or len(tasks) >= still_needed * 2:
                    continue
                seen_urls.add(url)
                h = hashlib.md5(url.encode()).hexdigest()[:12]
                dst_name = f"{class_name}_nasa_{h}.jpg"
                if dst_name in existing:
                    continue
                tasks.append((url, class_dir / dst_name, dst_name))
            time.sleep(0.3)

        nasa_added = 0
        if tasks:
            with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
                futs = {pool.submit(download, u, p): (u, p, n) for u, p, n in tasks}
                for f in tqdm(as_completed(futs), total=len(futs), desc=f"    {class_name} nasa", leave=False):
                    if f.result():
                        nasa_added += 1
                        _, p, n = futs[f]
                        write_annotation(p, class_idx)
                        existing.add(n)
        added += nasa_added
        print(f"  [{class_name.upper()}] NASA: +{nasa_added}")

    final = len([f for f in class_dir.iterdir() if f.suffix.lower() in (".jpg", ".jpeg", ".png")])
    status = "OK" if final >= 30 else "LOW"
    print(f"  [{status:>3}] {class_name:>25s}  {final} images total (+{added} new)\n")
    return final


def main():
    print("=" * 65)
    print("  SpaceAtlas — Comprehensive Dataset Fix")
    print("  Wikimedia Commons API + Strict NASA Filter")
    print("  Target: {} images per class".format(TARGET))
    print("=" * 65)

    problem_classes = list(WIKI_FILES.keys())
    results = {}

    for cn in problem_classes:
        results[cn] = fix_class(cn)

    print("\n" + "=" * 65)
    print("  RESULTS")
    print("-" * 65)
    all_ok = True
    for cn, count in results.items():
        status = "OK" if count >= 30 else "LOW"
        if status != "OK":
            all_ok = False
        print(f"  [{status:>3}] {cn:>25s}  {count} images")
    print("=" * 65)

    if all_ok:
        print("  ALL classes at 30+ images. Ready to annotate and train!")
    else:
        print("  Some classes still low. May need manual curation.")

    print("  Next: python ml/cv/annotate_dataset.py")
    print("  Then: python ml/cv/train.py")
    print("=" * 65)


if __name__ == "__main__":
    main()
