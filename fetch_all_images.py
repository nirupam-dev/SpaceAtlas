import urllib.request
import urllib.parse
import json
import sys

titles = [
    "Falcon_9", "Falcon_Heavy", "SpaceX_Starship", "Saturn_V", "Space_Launch_System", "Polar_Satellite_Launch_Vehicle", "Geosynchronous_Satellite_Launch_Vehicle_Mark_III", "Ariane_6", "Long_March_5", "Electron_(rocket)", "Soyuz-2", "Atlas_V", "Delta_IV_Heavy", "Vulcan_Centaur", "H3_(rocket)",
    "NASA", "Indian_Space_Research_Organisation", "European_Space_Agency", "JAXA", "China_National_Space_Administration", "Roscosmos", "UK_Space_Agency", "Canadian_Space_Agency", "Rocket_Lab", "United_Launch_Alliance",
    "Apollo_11", "Artemis_1", "Chandrayaan-3", "Mars_Orbiter_Mission", "Voyager_1", "James_Webb_Space_Telescope", "Apollo_13", "Perseverance_(rover)", "Cassini–Huygens", "New_Horizons", "Rosetta_(spacecraft)", "Hubble_Space_Telescope",
    "Neil_Armstrong", "Buzz_Aldrin", "Kalpana_Chawla", "Yuri_Gagarin", "Sunita_Williams", "Chris_Hadfield", "Sally_Ride", "Valentina_Tereshkova", "Peggy_Whitson", "John_Glenn", "Alan_Shepard", "Mae_Jemison",
    "Mercury_(planet)", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "Ceres_(dwarf_planet)", "Titan_(moon)", "Europa_(moon)", "Moon", "Enceladus", "Ganymede_(moon)"
]

def chunk_list(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

results = {}
for chunk in chunk_list(titles, 20):
    encoded_titles = urllib.parse.quote("|".join(chunk))
    req = urllib.request.Request(
        f'https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles={encoded_titles}',
        headers={'User-Agent': 'SpaceAtlasBot/1.0'}
    )
    res = urllib.request.urlopen(req)
    data = json.loads(res.read())
    
    for page_id, page_info in data['query']['pages'].items():
        results[page_info['title']] = page_info.get('original', {}).get('source', 'No image')

with open('image_urls.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2)
