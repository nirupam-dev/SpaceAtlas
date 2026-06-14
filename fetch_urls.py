import urllib.request
import json
import sys

def get_images(titles):
    req = urllib.request.Request(
        f'https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles={"|".join(titles)}',
        headers={'User-Agent': 'SpaceAtlasBot/1.0'}
    )
    res = urllib.request.urlopen(req)
    data = json.loads(res.read())
    results = {}
    for page_id, page_info in data['query']['pages'].items():
        results[page_info['title']] = page_info.get('original', {}).get('source', 'No image')
    return results

print("--- ASTRONAUTS ---")
print(json.dumps(get_images(["Neil_Armstrong", "Buzz_Aldrin", "Kalpana_Chawla", "Yuri_Gagarin", "Sunita_Williams", "Chris_Hadfield"]), indent=2))

print("--- ROCKETS ---")
print(json.dumps(get_images(["Falcon_9", "Falcon_Heavy", "SpaceX_Starship", "Saturn_V", "Space_Launch_System", "Polar_Satellite_Launch_Vehicle", "Geosynchronous_Satellite_Launch_Vehicle_Mark_III", "Ariane_6", "Long_March_5"]), indent=2))

print("--- MISSIONS ---")
print(json.dumps(get_images(["Apollo_11", "Artemis_1", "Chandrayaan-3", "Mars_Orbiter_Mission", "Voyager_1", "James_Webb_Space_Telescope"]), indent=2))

print("--- AGENCIES ---")
print(json.dumps(get_images(["NASA", "Indian_Space_Research_Organisation", "European_Space_Agency", "JAXA", "China_National_Space_Administration", "Roscosmos"]), indent=2))
