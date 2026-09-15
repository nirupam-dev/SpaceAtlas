import os

base = "ml/cv/dataset"
dirs = [d for d in os.listdir(base) if os.path.isdir(os.path.join(base, d))]
total = 0
for d in sorted(dirs):
    path = os.path.join(base, d)
    count = len([f for f in os.listdir(path) if f.lower().endswith((".jpg", ".png", ".jpeg"))])
    total += count
    status = "OK" if count >= 100 else "LOW"
    print(f"  [{status:3s}] {d:20s} {count} images")

print(f"\n  Total: {total} images across {len(dirs)} categories")
