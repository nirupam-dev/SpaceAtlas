import re
import urllib.request
import json
import time

def fetch_wikipedia_summary(title):
    search_title = urllib.parse.quote(title)
    url = f"https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=false&explaintext=true&titles={search_title}&format=json"
    
    retries = 3
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'SpaceAtlasDataBot/1.0 (contact@spaceatlas.local)'})
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read())
                pages = data['query']['pages']
                page = list(pages.values())[0]
                if 'extract' in page:
                    extract = page['extract']
                    paragraphs = extract.split('\n')
                    clean_paras = [p.strip() for p in paragraphs if p.strip() and not p.startswith('==')]
                    summary = " ".join(clean_paras[:3])
                    if len(summary) > 2500:
                        summary = summary[:2500] + "..."
                    return summary.strip()
                else:
                    return None
        except urllib.error.HTTPError as e:
            if e.code == 429:
                print(f"  [429] Rate limited. Waiting {2**(i+1)} seconds...")
                time.sleep(2**(i+1))
            else:
                print(f"Failed to fetch {title}: {e}")
                break
        except Exception as e:
            print(f"Failed to fetch {title}: {e}")
            break
    return None

with open('src/lib/data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

wiki_map = {
    "Saturn V": "Saturn V", "Falcon 9": "Falcon 9", "Starship": "SpaceX Starship",
    "Space Launch System (SLS)": "Space Launch System", "Soyuz": "Soyuz (rocket family)",
    "Atlas V": "Atlas V", "Delta IV Heavy": "Delta IV Heavy", "Electron": "Electron (rocket)",
    "PSLV": "Polar Satellite Launch Vehicle", "Ariane 6": "Ariane 6", "NASA": "NASA",
    "SpaceX": "SpaceX", "ESA": "European Space Agency", "ISRO": "Indian Space Research Organisation",
    "JAXA": "JAXA", "CNSA": "China National Space Administration", "Roscosmos": "Roscosmos",
    "Rocket Lab": "Rocket Lab", "ULA": "United Launch Alliance", "UK Space Agency": "UK Space Agency",
    "Canadian Space Agency": "Canadian Space Agency", "Sun": "Sun", "Mercury": "Mercury (planet)",
    "Venus": "Venus", "Earth": "Earth", "Mars": "Mars", "Jupiter": "Jupiter", "Saturn": "Saturn",
    "Uranus": "Uranus", "Neptune": "Neptune", "Apollo 11": "Apollo 11", "Apollo 13": "Apollo 13",
    "Artemis I": "Artemis 1", "Voyager 1": "Voyager 1", "James Webb Space Telescope": "James Webb Space Telescope",
    "Hubble Space Telescope": "Hubble Space Telescope", "Cassini-Huygens": "Cassini–Huygens",
    "Perseverance Rover": "Perseverance (rover)", "New Horizons": "New Horizons", "Rosetta": "Rosetta (spacecraft)",
    "Chandrayaan-3": "Chandrayaan-3", "Mangalyaan (MOM)": "Mars Orbiter Mission", "Neil Armstrong": "Neil Armstrong",
    "Buzz Aldrin": "Buzz Aldrin", "Yuri Gagarin": "Yuri Gagarin", "Valentina Tereshkova": "Valentina Tereshkova",
    "Sally Ride": "Sally Ride", "Mae Jemison": "Mae Jemison", "John Glenn": "John Glenn",
    "Alan Shepard": "Alan Shepard", "Chris Hadfield": "Chris Hadfield", "Peggy Whitson": "Peggy Whitson",
    "Kalpana Chawla": "Kalpana Chawla", "Sunita Williams": "Sunita Williams", "H3": "H3 (rocket)",
    "Vulcan Centaur": "Vulcan Centaur", "GSLV Mk III": "Geosynchronous Satellite Launch Vehicle Mark III",
    "Long March 5": "Long March 5", "Enceladus": "Enceladus", "Europa": "Europa (moon)", "Ganymede": "Ganymede (moon)",
    "Moon": "Moon"
}

# Find all blocks and evaluate them
matches = re.finditer(r'(name:\s*"([^"]+)".*?(?:description|biography):\s*")([^"]+)(")', content, flags=re.DOTALL)

for match in matches:
    full_text = match.group(0)
    name = match.group(2)
    desc = match.group(3)
    
    # If the description is already long enough, skip it
    if len(desc) > 300:
        continue
        
    wiki_title = wiki_map.get(name, name)
    print(f"Fetching data for: {name} (Wiki: {wiki_title})")
    summary = fetch_wikipedia_summary(wiki_title)
    
    if summary:
        # Escape quotes and formatting
        summary = summary.replace('"', '\\"').replace('\n', ' ')
        
        # Replace ONLY this specific occurrence in content by finding the exact `full_text`
        new_text = full_text.replace(desc, summary)
        content = content.replace(full_text, new_text, 1)
        
        time.sleep(1.5) # Be very nice to Wikipedia API
    else:
        print(f"  -> No summary found for {name}")

with open('src/lib/data.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Finished updating descriptions!")
