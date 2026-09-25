# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

"""
SpaceAtlas -- YOLOv8 Object Detection Training Script
======================================================
Trains a YOLOv8n (nano) detector on 39 space object classes.
Produces bounding box predictions with class labels and confidence.
Optimized for RTX 2050 (4GB VRAM).

Prerequisites:
    1. Run annotate_dataset.py first to convert dataset → YOLO format
    2. pip install -r ml/requirements.txt

Usage:
    python ml/cv/train.py
"""

import os, json, time, shutil
from pathlib import Path

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

import torch
from ultralytics import YOLO

# ── Config ──────────────────────────────────────────────────────

DATASET_YAML = Path(__file__).parent / "dataset_yolo" / "dataset.yaml"
MODELS_DIR = Path(__file__).parent.parent / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Training hyperparameters — tuned for RTX 2050 (4GB VRAM)
IMG_SIZE = 640
BATCH_SIZE = 8          # Conservative for 4GB VRAM
NUM_EPOCHS = 50
PATIENCE = 10           # Early stopping patience
BASE_MODEL = "yolov8n.pt"  # Nano variant — fast, lightweight (~6MB)

SEED = 42


def check_prerequisites():
    """Verify dataset exists and is in YOLO format."""
    if not DATASET_YAML.exists():
        print("\n  ERROR: Dataset YAML not found!")
        print(f"  Expected: {DATASET_YAML.resolve()}")
        print("  Run 'python ml/cv/annotate_dataset.py' first to convert the dataset.\n")
        return False

    dataset_dir = DATASET_YAML.parent
    train_imgs = dataset_dir / "images" / "train"
    val_imgs = dataset_dir / "images" / "val"

    if not train_imgs.exists() or not val_imgs.exists():
        print("\n  ERROR: YOLO dataset directories not found!")
        print(f"  Expected: {train_imgs} and {val_imgs}")
        print("  Run 'python ml/cv/annotate_dataset.py' first.\n")
        return False

    train_count = len(list(train_imgs.glob("*.[jJ][pP][gG]")) + 
                      list(train_imgs.glob("*.[pP][nN][gG]")) +
                      list(train_imgs.glob("*.[jJ][pP][eE][gG]")))
    val_count = len(list(val_imgs.glob("*.[jJ][pP][gG]")) + 
                    list(val_imgs.glob("*.[pP][nN][gG]")) +
                    list(val_imgs.glob("*.[jJ][pP][eE][gG]")))

    print(f"  Dataset: {train_count} train + {val_count} val images")
    return True


def train():
    """Train YOLOv8n detector."""
    print(f"\n  Loading base model: {BASE_MODEL}")
    model = YOLO(BASE_MODEL)

    print(f"  Starting training for {NUM_EPOCHS} epochs...")
    print(f"  Image size: {IMG_SIZE}")
    print(f"  Batch size: {BATCH_SIZE}")
    print(f"  Patience:   {PATIENCE}")
    print("-" * 65)

    results = model.train(
        data=str(DATASET_YAML.resolve()),
        epochs=NUM_EPOCHS,
        imgsz=IMG_SIZE,
        batch=BATCH_SIZE,
        patience=PATIENCE,
        seed=SEED,
        device=0 if torch.cuda.is_available() else "cpu",
        workers=2,
        # Augmentation
        augment=True,
        hsv_h=0.015,
        hsv_s=0.5,
        hsv_v=0.3,
        degrees=15.0,
        translate=0.1,
        scale=0.4,
        fliplr=0.5,
        mosaic=0.8,
        mixup=0.1,
        # Output
        project=str(MODELS_DIR),
        name="yolo_train",
        exist_ok=True,
        save=True,
        plots=True,
        verbose=True,
    )

    return model, results


def export_and_save(model):
    """Export trained model to deployable formats and save artifacts."""
    # The best model is saved by ultralytics during training
    train_dir = MODELS_DIR / "yolo_train"
    best_pt = train_dir / "weights" / "best.pt"

    if not best_pt.exists():
        print("  WARNING: best.pt not found, using last.pt")
        best_pt = train_dir / "weights" / "last.pt"

    if not best_pt.exists():
        print("  ERROR: No trained weights found!")
        return

    # Copy best weights to models dir
    final_pt = MODELS_DIR / "space-detector.pt"
    shutil.copy2(best_pt, final_pt)
    print(f"\n  Saved PyTorch model: {final_pt}")
    print(f"  Size: {final_pt.stat().st_size / (1024*1024):.1f} MB")

    # Export to ONNX
    print("\n  Exporting to ONNX...")
    best_model = YOLO(str(final_pt))
    onnx_path_str = best_model.export(format="onnx", imgsz=IMG_SIZE, opset=17, simplify=True)
    
    # Move ONNX to models dir if needed
    onnx_src = Path(onnx_path_str)
    onnx_dst = MODELS_DIR / "space-detector.onnx"
    if onnx_src != onnx_dst:
        shutil.move(str(onnx_src), str(onnx_dst))
    print(f"  Saved ONNX model: {onnx_dst}")
    print(f"  Size: {onnx_dst.stat().st_size / (1024*1024):.1f} MB")

    # Read class names from dataset yaml and save as labels JSON
    import yaml
    with open(DATASET_YAML, "r", encoding="utf-8") as f:
        ds_config = yaml.safe_load(f)

    class_names = ds_config.get("names", {})
    labels_data = {
        "model": "YOLOv8n",
        "task": "detection",
        "num_classes": ds_config.get("nc", len(class_names)),
        "classes": class_names,
        "img_size": IMG_SIZE,
    }

    labels_path = MODELS_DIR / "class_labels.json"
    with open(labels_path, "w", encoding="utf-8") as f:
        json.dump(labels_data, f, indent=2)
    print(f"  Saved class labels: {labels_path}")

    # Copy training plots if they exist
    for plot_name in ["results.png", "confusion_matrix.png", "P_curve.png", "R_curve.png"]:
        src = train_dir / plot_name
        if src.exists():
            shutil.copy2(src, MODELS_DIR / plot_name)

    return final_pt, onnx_dst


def main():
    print("=" * 65)
    print("  SpaceAtlas -- Space Object Detector (YOLOv8n)")
    print("  39 Classes | Transfer Learning | Object Detection")
    print("=" * 65)

    device = "CPU"
    if torch.cuda.is_available():
        name = torch.cuda.get_device_name(0)
        mem = torch.cuda.get_device_properties(0).total_memory / (1024**3)
        device = f"{name} ({mem:.1f} GB)"
    print(f"\n  Device: {device}")

    if not check_prerequisites():
        return

    t0 = time.time()
    model, results = train()
    elapsed = (time.time() - t0) / 60

    print(f"\n  Training complete in {elapsed:.1f} minutes")

    export_and_save(model)

    print("\n" + "=" * 65)
    print(f"  DONE | Training time: {elapsed:.1f} min")
    print(f"  Model files: {MODELS_DIR.resolve()}")
    print("=" * 65 + "\n")


if __name__ == "__main__":
    main()
