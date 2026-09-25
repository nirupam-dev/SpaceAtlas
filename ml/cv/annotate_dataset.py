# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

"""
SpaceAtlas -- Convert Classification Dataset → YOLO Detection Format
=====================================================================
Converts the existing ImageFolder dataset (dataset_v2/) into YOLO
detection format with bounding box annotations.

Since each image in our dataset contains predominantly its target object
(e.g., a folder "jupiter/" contains images of Jupiter), we auto-annotate
each image as a full-frame centered bounding box for its class.

Input:
    ml/cv/dataset_v2/
    ├── jupiter/
    │   ├── jupiter_abc123.jpg
    │   └── ...
    ├── saturn/
    │   └── ...
    └── class_mapping.json

Output:
    ml/cv/dataset_yolo/
    ├── dataset.yaml
    ├── images/
    │   ├── train/
    │   └── val/
    └── labels/
        ├── train/
        └── val/

Usage:
    python ml/cv/annotate_dataset.py
"""

import os
import json
import random
import shutil
from pathlib import Path
from PIL import Image
from tqdm import tqdm

# ── Config ──────────────────────────────────────────────────────
SEED = 42
TRAIN_SPLIT = 0.8

SRC_DIR = Path(__file__).parent / "dataset_v2"
DST_DIR = Path(__file__).parent / "dataset_yolo"

# Bounding box coverage — how much of the frame the auto-bbox covers
# 0.85 means the bbox spans 85% of width and height, centered
BBOX_COVERAGE = 0.85

random.seed(SEED)


def get_class_list():
    """Get sorted list of class names from dataset folders."""
    mapping_path = SRC_DIR / "class_mapping.json"
    if mapping_path.exists():
        with open(mapping_path, "r", encoding="utf-8") as f:
            mapping = json.load(f)
        # Build sorted class list from mapping
        classes = []
        for idx in sorted(mapping.keys(), key=int):
            classes.append(mapping[idx]["name"])
        return classes

    # Fallback: sorted directory names
    return sorted([
        d.name for d in SRC_DIR.iterdir()
        if d.is_dir() and not d.name.startswith(".")
    ])


def create_yolo_annotation(img_path, class_idx):
    """
    Create a YOLO-format annotation for an image.
    
    YOLO format: <class_id> <x_center> <y_center> <width> <height>
    All values are normalized to [0, 1] relative to image dimensions.
    
    We create a centered bounding box covering BBOX_COVERAGE of the frame.
    """
    try:
        with Image.open(img_path) as img:
            w, h = img.size
            if w < 10 or h < 10:
                return None
    except Exception:
        return None

    # Centered bounding box at BBOX_COVERAGE of frame
    x_center = 0.5
    y_center = 0.5
    box_w = BBOX_COVERAGE
    box_h = BBOX_COVERAGE

    return f"{class_idx} {x_center:.6f} {y_center:.6f} {box_w:.6f} {box_h:.6f}"


def main():
    print("=" * 60)
    print("  SpaceAtlas -- Dataset Converter: Classification → YOLO")
    print("=" * 60 + "\n")

    if not SRC_DIR.exists():
        print(f"  ERROR: Source dataset not found: {SRC_DIR.resolve()}")
        return

    classes = get_class_list()
    num_classes = len(classes)
    print(f"  Classes: {num_classes}")
    print(f"  Source:  {SRC_DIR.resolve()}")
    print(f"  Output:  {DST_DIR.resolve()}")
    print(f"  BBox coverage: {BBOX_COVERAGE:.0%}")
    print(f"  Train/Val split: {TRAIN_SPLIT:.0%}/{1-TRAIN_SPLIT:.0%}\n")

    # Create output directory structure
    for split in ["train", "val"]:
        (DST_DIR / "images" / split).mkdir(parents=True, exist_ok=True)
        (DST_DIR / "labels" / split).mkdir(parents=True, exist_ok=True)

    # Process each class
    total_train, total_val = 0, 0
    skipped = 0

    for class_idx, class_name in enumerate(classes):
        class_dir = SRC_DIR / class_name
        if not class_dir.exists():
            print(f"  [SKIP] {class_name:30s} — folder not found")
            continue

        # Get all images
        images = sorted([
            f for f in class_dir.iterdir()
            if f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp")
        ])

        if not images:
            print(f"  [SKIP] {class_name:30s} — no images")
            continue

        # Shuffle and split
        random.shuffle(images)
        split_idx = int(len(images) * TRAIN_SPLIT)
        train_imgs = images[:split_idx]
        val_imgs = images[split_idx:]

        train_ok, val_ok = 0, 0

        for img_path in train_imgs:
            annotation = create_yolo_annotation(img_path, class_idx)
            if annotation is None:
                skipped += 1
                continue

            # Copy image
            dst_img = DST_DIR / "images" / "train" / img_path.name
            # Handle name collisions by prefixing class name
            if dst_img.exists():
                dst_img = DST_DIR / "images" / "train" / f"{class_name}_{img_path.name}"
            shutil.copy2(img_path, dst_img)

            # Write label
            label_name = dst_img.stem + ".txt"
            label_path = DST_DIR / "labels" / "train" / label_name
            label_path.write_text(annotation + "\n", encoding="utf-8")
            train_ok += 1

        for img_path in val_imgs:
            annotation = create_yolo_annotation(img_path, class_idx)
            if annotation is None:
                skipped += 1
                continue

            dst_img = DST_DIR / "images" / "val" / img_path.name
            if dst_img.exists():
                dst_img = DST_DIR / "images" / "val" / f"{class_name}_{img_path.name}"
            shutil.copy2(img_path, dst_img)

            label_name = dst_img.stem + ".txt"
            label_path = DST_DIR / "labels" / "val" / label_name
            label_path.write_text(annotation + "\n", encoding="utf-8")
            val_ok += 1

        total_train += train_ok
        total_val += val_ok
        print(f"  [OK] {class_name:30s} train={train_ok:>4d}  val={val_ok:>3d}")

    # Write dataset.yaml
    yaml_content = f"""# SpaceAtlas YOLO Dataset Configuration
# Auto-generated by annotate_dataset.py

path: {DST_DIR.resolve().as_posix()}
train: images/train
val: images/val

nc: {num_classes}
names:
"""
    for i, name in enumerate(classes):
        yaml_content += f"  {i}: {name}\n"

    yaml_path = DST_DIR / "dataset.yaml"
    yaml_path.write_text(yaml_content, encoding="utf-8")

    # Also copy to ml/cv/ for convenience
    convenience_yaml = Path(__file__).parent / "dataset.yaml"
    convenience_yaml.write_text(yaml_content, encoding="utf-8")

    # Summary
    print("\n" + "=" * 60)
    print("  CONVERSION COMPLETE")
    print("=" * 60)
    print(f"  Train images: {total_train}")
    print(f"  Val images:   {total_val}")
    print(f"  Skipped:      {skipped}")
    print(f"  Classes:      {num_classes}")
    print(f"  Dataset YAML: {yaml_path}")
    print(f"  Output:       {DST_DIR.resolve()}")
    print("=" * 60)
    print("\n  Next: python ml/cv/train.py\n")


if __name__ == "__main__":
    main()
