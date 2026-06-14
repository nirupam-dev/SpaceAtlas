import urllib.request
import json
import sys

titles = [
    'File:SpaceX_Falcon_9_v1.2_Block_5_on_pad_39A.jpg',
    'File:Falcon_Heavy_Demo_Mission_(39977123164).jpg',
    'File:Starship_IFT-3_launch.jpg',
    'File:Artemis_I_Launch_-_01_(cropped).jpg',
    'File:LVM3_M4_Chandrayaan-3_launch.jpg',
    'File:Ariane_6_first_flight_lift-off.jpg',
    'File:Long_March_5B_Y1_lifting_off_from_Wenchang_(1).jpg',
    'File:PSLV-C25_lifting_off_with_Mars_Orbiter_Spacecraft_on_board.jpg'
]

req = urllib.request.Request(
    f'https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&format=json&titles={"|".join(titles)}',
    headers={'User-Agent': 'SpaceAtlasBot/1.0'}
)
try:
    res = urllib.request.urlopen(req)
    data = json.loads(res.read())
    for p in data['query']['pages'].values():
        print(p.get('title'), '->', p.get('imageinfo', [{}])[0].get('url'))
except Exception as e:
    print(e)
