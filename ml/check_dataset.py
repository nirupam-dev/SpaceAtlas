# -*- coding: utf-8 -*-
"""
SpaceAtlas -- Dataset Checker
Checks both ImageFolder dataset and YOLO annotations.
"""

import os
from pathlib import Path

# Check ImageFolder dataset (dataset_v2)
base_v2 = Path("ml/cv/dataset_v2")
# Check YOLO dataset
base_yolo = Path("ml/cv/dataset_yolo")


def check_classification_dataset():
    """Check the ImageFolder classification dataset."""
    if not base_v2.exists():
        print("  Classification dataset (dataset_v2) not found.\n")
        return

    print("=" * 56)
    print("  CLASSIFICATION DATASET (dataset_v2)")
    print("=" * 56)

    dirs = [d for d in os.listdir(base_v2) if os.path.isdir(os.path.join(base_v2, d))]
    total_imgs = 0
    total_labels = 0

    for d in sorted(dirs):
        path = os.path.join(base_v2, d)
        imgs = len([f for f in os.listdir(path) if f.lower().endswith((".jpg", ".png", ".jpeg"))])
        labels = len([f for f in os.listdir(path) if f.lower().endswith(".txt")])
        total_imgs += imgs
        total_labels += labels
        img_status = "OK" if imgs >= 40 else "LOW"
        lbl_status = "✓" if labels >= imgs else "✗"
        print(f"  [{img_status:3s}] {d:25s} {imgs:>4d} imgs  {labels:>4d} labels [{lbl_status}]")

    print(f"\n  Total: {total_imgs} images, {total_labels} labels across {len(dirs)} categories")
    annotation_pct = (total_labels / total_imgs * 100) if total_imgs > 0 else 0
    print(f"  Annotation coverage: {annotation_pct:.0f}%\n")


def check_yolo_dataset():
    """Check the YOLO detection dataset."""
    if not base_yolo.exists():
        print("  YOLO dataset (dataset_yolo) not found.")
        print("  Run 'python ml/cv/annotate_dataset.py' to generate it.\n")
        return

    print("=" * 56)
    print("  YOLO DETECTION DATASET (dataset_yolo)")
    print("=" * 56)

    for split in ["train", "val"]:
        img_dir = base_yolo / "images" / split
        lbl_dir = base_yolo / "labels" / split

        if not img_dir.exists():
            print(f"  {split}: directory not found")
            continue

        imgs = list(img_dir.glob("*.[jJ][pP][gG]")) + \
               list(img_dir.glob("*.[pP][nN][gG]")) + \
               list(img_dir.glob("*.[jJ][pP][eE][gG]"))
        
        labels = list(lbl_dir.glob("*.txt")) if lbl_dir.exists() else []

        # Check for orphan images (no label) and orphan labels (no image)
        img_stems = {p.stem for p in imgs}
        lbl_stems = {p.stem for p in labels}
        orphan_imgs = img_stems - lbl_stems
        orphan_lbls = lbl_stems - img_stems

        # Validate label format
        bad_labels = 0
        for lbl_path in labels:
            try:
                with open(lbl_path, "r") as f:
                    for line in f:
                        parts = line.strip().split()
                        if len(parts) != 5:
                            bad_labels += 1
                            break
                        cls_id = int(parts[0])
                        coords = [float(x) for x in parts[1:]]
                        if any(c < 0 or c > 1 for c in coords):
                            bad_labels += 1
                            break
            except:
                bad_labels += 1

        status = "OK" if len(orphan_imgs) == 0 and bad_labels == 0 else "!!"
        print(f"  [{status}] {split:5s}: {len(imgs):>5d} images, {len(labels):>5d} labels"
              f"  |  orphan imgs: {len(orphan_imgs)}, orphan lbls: {len(orphan_lbls)}, bad: {bad_labels}")

    # Check dataset.yaml
    yaml_path = base_yolo / "dataset.yaml"
    if yaml_path.exists():
        print(f"\n  dataset.yaml: {yaml_path} ✓")
    else:
        print(f"\n  dataset.yaml: NOT FOUND ✗")

    print()


if __name__ == "__main__":
    print()
    check_classification_dataset()
    check_yolo_dataset()
