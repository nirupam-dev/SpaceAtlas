import re
import json

urls = {
  "Ariane 6": "https://upload.wikimedia.org/wikipedia/commons/d/d8/Ariane6_logo.svg",
  "atlas-v": "https://upload.wikimedia.org/wikipedia/commons/2/2d/Atlas_V_logo.svg",
  "cnsa": "https://en.wikipedia.org/wiki/Special:FilePath/China_National_Space_Administration_logo.svg",
  "delta-iv-heavy": "https://en.wikipedia.org/wiki/Special:FilePath/Delta_IV_Heavy_NROL-44.jpg",
  "electron": "https://en.wikipedia.org/wiki/Special:FilePath/Electron_on_LC-1_(1).jpg",
  "esa": "https://upload.wikimedia.org/wikipedia/commons/9/96/ESA_Headquarters_in_Paris.jpg",
  "falcon-9": "https://upload.wikimedia.org/wikipedia/commons/a/a9/Falcon_9_logo.svg",
  "falcon-heavy": "https://upload.wikimedia.org/wikipedia/commons/8/83/Falcon_Heavy_logo.svg",
  "gslv-mk3": "https://en.wikipedia.org/wiki/Special:FilePath/LVM3_M4_Chandrayaan-3_launch.jpg",
  "h3": "https://upload.wikimedia.org/wikipedia/commons/7/7e/H3_logo.svg",
  "isro": "https://en.wikipedia.org/wiki/Special:FilePath/ISRO_Logo.svg",
  "jaxa": "https://upload.wikimedia.org/wikipedia/commons/8/85/Jaxa_logo.svg",
  "long-march-5": "https://upload.wikimedia.org/wikipedia/commons/b/b7/Launching_Tianhe_Core_Module.jpg",
  "nasa": "https://upload.wikimedia.org/wikipedia/commons/a/ae/NASA_seal.svg",
  "pslv": "https://upload.wikimedia.org/wikipedia/commons/1/16/PSLVC62.webp",
  "saturn-v": "https://upload.wikimedia.org/wikipedia/commons/1/16/Apollo_11_Launch_-_GPN-2000-000630.jpg",
  "soyuz": "https://upload.wikimedia.org/wikipedia/commons/f/f6/Soyuz_2.1b_GLONASS-K2_13L_launch_01.jpg",
  "starship": "https://upload.wikimedia.org/wikipedia/commons/4/4a/SpaceX_Starship_ignition_during_IFT-5.jpg",
  "sls": "https://upload.wikimedia.org/wikipedia/commons/b/b1/Artemis_II_launch_%28SLS_MAF_20260401_ArtemisIILaunch_02%29_crop.jpg",
  "vulcan-centaur": "https://upload.wikimedia.org/wikipedia/commons/0/0d/Vulcan_logo.svg",
  "apollo-11": "https://upload.wikimedia.org/wikipedia/commons/4/41/A_Man_on_the_Moon%2C_AS11-40-5903_%28cropped%29.jpg",
  "apollo-13": "https://upload.wikimedia.org/wikipedia/commons/a/ac/Apollo_13-insignia.png",
  "artemis-1": "https://en.wikipedia.org/wiki/Special:FilePath/Artemis_I_Launch_-_01_(cropped).jpg",
  "buzz-aldrin": "https://upload.wikimedia.org/wikipedia/commons/d/dc/Buzz_Aldrin.jpg",
  "csa": "https://upload.wikimedia.org/wikipedia/commons/f/f1/Canadian_Space_Agency_Arms.svg",
  "cassini": "https://upload.wikimedia.org/wikipedia/commons/b/b2/Cassini_Saturn_Orbit_Insertion.jpg",
  "chandrayaan-3": "https://upload.wikimedia.org/wikipedia/commons/a/aa/Chandrayaan-3_%E2%80%93_Image_of_Vikram_lander_on_lunar_surface_taken_by_Pragyan_rover_navcam_at_1104_IST%2C_30_August_2023_from_15_meters_away_%28with_text%29.webp",
  "hubble": "https://upload.wikimedia.org/wikipedia/commons/8/8e/STS-109-HST-s109e5700.jpg",
  "james-webb": "https://upload.wikimedia.org/wikipedia/commons/2/2a/JWST_spacecraft_model_3.png",
  "kalpana-chawla": "https://upload.wikimedia.org/wikipedia/commons/9/9c/Kalpana_Chawla%2C_NASA_photo_portrait_in_orange_suit.jpg",
  "mangalyaan": "https://upload.wikimedia.org/wikipedia/commons/6/6b/Mars_Orbiter_Mission_Over_Mars_%2815237158879%29.jpg",
  "neil-armstrong": "https://upload.wikimedia.org/wikipedia/commons/0/0d/Neil_Armstrong_pose.jpg",
  "new-horizons": "https://upload.wikimedia.org/wikipedia/commons/e/ee/New_Horizons_spacecraft_model_1.png",
  "perseverance": "https://upload.wikimedia.org/wikipedia/commons/a/a4/Perseverance-Selfie-at-Rochette-Horizontal-V2.gif",
  "rocket-lab": "https://upload.wikimedia.org/wikipedia/commons/c/cc/Rocket_Lab_logo.svg",
  "roscosmos": "https://upload.wikimedia.org/wikipedia/commons/6/6e/Roscosmos_logo_en.svg",
  "rosetta": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Rosetta_spacecraft_model.png",
  "uksa": "https://en.wikipedia.org/wiki/Special:FilePath/UK_Space_Agency_logo.svg",
  "ula": "https://upload.wikimedia.org/wikipedia/commons/8/8c/Vulcan_Cert_2_Launch_%28cropped%29.jpg",
  "voyager-1": "https://upload.wikimedia.org/wikipedia/commons/6/60/Voyager_spacecraft_model.png",
  "alan-shepard": "https://upload.wikimedia.org/wikipedia/commons/9/9b/Business_suit_portrait_of_Al_Shepard.jpg",
  "ceres": "https://upload.wikimedia.org/wikipedia/commons/7/76/Ceres_-_RC3_-_Haulani_Crater_%2822381131691%29_%28cropped%29.jpg",
  "chris-hadfield": "https://upload.wikimedia.org/wikipedia/commons/0/0c/Chris_Hadfield_2011.jpg",
  "earth": "https://upload.wikimedia.org/wikipedia/commons/2/2d/Meteosat-12-fci-march-equinox-2025-noon.jpg",
  "john-glenn": "https://upload.wikimedia.org/wikipedia/commons/e/e3/John_Glenn_Low_Res.jpg",
  "jupiter": "https://upload.wikimedia.org/wikipedia/commons/e/e2/Jupiter_OPAL_2024.png",
  "mae-jemison": "https://upload.wikimedia.org/wikipedia/commons/5/55/Mae_Carol_Jemison.jpg",
  "mars": "https://upload.wikimedia.org/wikipedia/commons/0/0c/Mars_-_August_30_2021_-_Flickr_-_Kevin_M._Gill.png",
  "mercury": "https://upload.wikimedia.org/wikipedia/commons/4/4a/Mercury_in_true_color.jpg",
  "neptune": "https://upload.wikimedia.org/wikipedia/commons/b/b9/Neptune_Voyager2_color_calibrated.png",
  "peggy-whitson": "https://upload.wikimedia.org/wikipedia/commons/6/62/Peggy_Whitson_Friday_at_the_Smithsonian%27s_National_Air_and_Space_Museum_on_March_2%2C_2018_%28cropped%29.jpg",
  "pluto": "https://upload.wikimedia.org/wikipedia/commons/c/ca/Pluto_in_True_Color_-_High-Res.png",
  "sally-ride": "https://upload.wikimedia.org/wikipedia/commons/0/0c/Sally_Ride_%281984%29.jpg",
  "saturn": "https://upload.wikimedia.org/wikipedia/commons/c/c7/Saturn_during_Equinox.jpg",
  "sunita-williams": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Sunita_Williams_in_2018.jpg",
  "titan": "https://upload.wikimedia.org/wikipedia/commons/f/fe/Titan_in_true_color_by_Kevin_M._Gill.jpg",
  "uranus": "https://upload.wikimedia.org/wikipedia/commons/6/69/Uranus_Voyager2_color_calibrated.png",
  "valentina-tereshkova": "https://upload.wikimedia.org/wikipedia/commons/e/e9/Valentina_Tereshkova_%282024-02-29%29_crop.jpg",
  "venus": "https://upload.wikimedia.org/wikipedia/commons/b/b2/Venus_2_Approach_Image.jpg",
  "yuri-gagarin": "https://upload.wikimedia.org/wikipedia/commons/d/d8/Yuri_Gagarin_with_awards_%28cropped%29_2.jpg",
  "enceladus": "https://upload.wikimedia.org/wikipedia/commons/8/83/PIA17202_-_Approaching_Enceladus.jpg",
  "europa": "https://upload.wikimedia.org/wikipedia/commons/b/b3/Europa_-_Perijove_45_%28cropped%29.png",
  "ganymede": "https://upload.wikimedia.org/wikipedia/commons/2/21/Ganymede_-_Perijove_34_Composite.png",
  "moon": "https://upload.wikimedia.org/wikipedia/commons/e/e1/FullMoon2010.jpg"
}

with open("src/lib/data.ts", "r", encoding="utf-8") as f:
    content = f.read()

# For each object matching `id: "slug",` or `slug: "slug",` update its imageUrl
for slug, url in urls.items():
    # Regex to find the block for the given slug and replace its imageUrl
    # The block starts somewhere and contains `slug: "{slug}"` or `id: "{slug}"`
    # We will just find `slug: "{slug}"` and the next `imageUrl: "..."` and replace it
    
    # We can split the content to handle each match
    pattern = r'(slug:\s*"' + slug + r'".*?imageUrl:\s*")[^"]+(")'
    content = re.sub(pattern, r'\1' + url + r'\2', content, flags=re.DOTALL)
    
with open("src/lib/data.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("Replacement complete.")
