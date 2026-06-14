import re

urls = {
  "falcon-9": "https://en.wikipedia.org/wiki/Special:FilePath/SpaceX_Falcon_9_v1.2_Block_5_on_pad_39A.jpg",
  "falcon-heavy": "https://en.wikipedia.org/wiki/Special:FilePath/Falcon_Heavy_Demo_Mission_(39977123164).jpg",
  "starship": "https://en.wikipedia.org/wiki/Special:FilePath/Starship_IFT-3_launch.jpg",
  "sls": "https://en.wikipedia.org/wiki/Special:FilePath/Artemis_I_Launch_-_01_(cropped).jpg",
  "ariane-6": "https://en.wikipedia.org/wiki/Special:FilePath/Ariane_6_first_flight_lift-off.jpg",
  "atlas-v": "https://en.wikipedia.org/wiki/Special:FilePath/Atlas_V_551_launching_the_Juno_spacecraft.jpg",
  "vulcan-centaur": "https://en.wikipedia.org/wiki/Special:FilePath/Vulcan_Cert_2_Launch_%28cropped%29.jpg",
  "h3": "https://en.wikipedia.org/wiki/Special:FilePath/H3_TF2_Launch.jpg"
}

with open("src/lib/data.ts", "r", encoding="utf-8") as f:
    content = f.read()

for slug, url in urls.items():
    pattern = r'(slug:\s*"' + slug + r'".*?imageUrl:\s*")[^"]+(")'
    content = re.sub(pattern, r'\1' + url + r'\2', content, flags=re.DOTALL)
    
with open("src/lib/data.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("Rocket images patched.")
