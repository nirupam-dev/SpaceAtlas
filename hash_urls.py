import hashlib
def url(f):
    h = hashlib.md5(f.replace(' ', '_').encode('utf-8')).hexdigest()
    return f"https://upload.wikimedia.org/wikipedia/commons/{h[0]}/{h[0:2]}/{f.replace(' ', '_')}"

print("F9:", url("SpaceX Falcon 9 v1.2 Block 5 on pad 39A.jpg"))
print("FH:", url("Falcon Heavy Demo Mission (39977123164).jpg"))
print("Starship:", url("Starship IFT-3 launch.jpg"))
print("Artemis:", url("Artemis I Launch - 01 (cropped).jpg"))
print("LVM3:", url("LVM3 M4 Chandrayaan-3 launch.jpg"))
print("Ariane:", url("Ariane 6 first flight lift-off.jpg"))
print("LongMarch:", url("Long March 5B Y1 lifting off from Wenchang (1).jpg"))
print("PSLV:", url("PSLV-C25 lifting off with Mars Orbiter Spacecraft on board.jpg"))
