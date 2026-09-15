# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

"""
SpaceAtlas -- CV Model Training Script (v2)
============================================
Trains a ResNet-18 classifier on 34 specific space objects.
Handles class imbalance with weighted sampling.
Optimized for RTX 2050 (4GB VRAM) with mixed precision.

Usage:
    python ml/cv/train.py
"""

import os, json, time, copy, random
import numpy as np
from pathlib import Path
from collections import Counter

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split, WeightedRandomSampler
from torchvision import datasets, transforms, models
from torch.amp import GradScaler, autocast
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

# ---- Config ---------------------------------------------------------------

DATASET_DIR = Path(__file__).parent / "dataset_v2"
MODELS_DIR = Path(__file__).parent.parent / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

BATCH_SIZE = 16
NUM_EPOCHS = 30
LEARNING_RATE = 0.001
LR_STEP_SIZE = 10
LR_GAMMA = 0.1
IMG_SIZE = 224
NUM_WORKERS = 2
TRAIN_SPLIT = 0.8
SEED = 42

random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(SEED)


# ---- Transforms -----------------------------------------------------------

train_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE + 32, IMG_SIZE + 32)),
    transforms.RandomCrop(IMG_SIZE),
    transforms.RandomHorizontalFlip(0.5),
    transforms.RandomRotation(20),
    transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.1),
    transforms.RandomGrayscale(0.05),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

val_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


class TransformSubset(torch.utils.data.Dataset):
    def __init__(self, subset, transform):
        self.subset = subset
        self.transform = transform

    def __len__(self):
        return len(self.subset)

    def __getitem__(self, idx):
        img, label = self.subset[idx]
        img = transforms.ToPILImage()(img)
        if self.transform:
            img = self.transform(img)
        return img, label


# ---- Load Data -------------------------------------------------------------

def load_data():
    print("  Loading dataset from:", DATASET_DIR.resolve())

    basic = transforms.Compose([transforms.Resize((IMG_SIZE, IMG_SIZE)), transforms.ToTensor()])
    full = datasets.ImageFolder(str(DATASET_DIR), transform=basic)
    classes = full.classes
    num_classes = len(classes)

    # Load display names from mapping
    mapping_path = DATASET_DIR / "class_mapping.json"
    display_names = {}
    if mapping_path.exists():
        with open(mapping_path, "r", encoding="utf-8") as f:
            mapping = json.load(f)
        for v in mapping.values():
            display_names[v["name"]] = v["display_name"]

    print(f"\n  {num_classes} classes, {len(full)} total images:")
    for i, cls in enumerate(classes):
        count = sum(1 for _, l in full.samples if l == i)
        dname = display_names.get(cls, cls)
        print(f"    {dname:30s} {count:>4d} images")

    # Split
    train_size = int(TRAIN_SPLIT * len(full))
    val_size = len(full) - train_size
    train_sub, val_sub = random_split(full, [train_size, val_size],
                                       generator=torch.Generator().manual_seed(SEED))

    train_ds = TransformSubset(train_sub, train_transform)
    val_ds = TransformSubset(val_sub, val_transform)

    # Weighted sampler to handle class imbalance
    train_labels = [full.targets[i] for i in train_sub.indices]
    class_counts = Counter(train_labels)
    weights = [1.0 / class_counts[l] for l in train_labels]
    sampler = WeightedRandomSampler(weights, len(weights), replacement=True)

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, sampler=sampler,
                               num_workers=NUM_WORKERS, pin_memory=True, drop_last=True)
    val_loader = DataLoader(val_ds, batch_size=BATCH_SIZE, shuffle=False,
                             num_workers=NUM_WORKERS, pin_memory=True)

    print(f"\n  Train: {len(train_ds)} | Val: {len(val_ds)}")
    print(f"  Using weighted sampling to balance classes")

    return train_loader, val_loader, classes, num_classes, display_names


# ---- Model -----------------------------------------------------------------

def create_model(num_classes, device):
    print("\n  Model: ResNet-18 (ImageNet pretrained)")
    model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)

    # Freeze all except layer4 + fc
    for param in model.parameters():
        param.requires_grad = False
    for param in model.layer4.parameters():
        param.requires_grad = True

    model.fc = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(model.fc.in_features, 256),
        nn.ReLU(),
        nn.Dropout(0.2),
        nn.Linear(256, num_classes),
    )
    model = model.to(device)

    total = sum(p.numel() for p in model.parameters())
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"  Parameters: {total:,} total, {trainable:,} trainable")
    return model


# ---- Train -----------------------------------------------------------------

def train(model, train_loader, val_loader, device):
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()),
                           lr=LEARNING_RATE, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.StepLR(optimizer, LR_STEP_SIZE, LR_GAMMA)
    scaler = GradScaler("cuda")

    best_wts = copy.deepcopy(model.state_dict())
    best_acc = 0.0
    history = {"train_loss": [], "val_loss": [], "train_acc": [], "val_acc": []}

    print(f"\n  Training: {NUM_EPOCHS} epochs, batch={BATCH_SIZE}, lr={LEARNING_RATE}")
    print("-" * 65)

    t0 = time.time()
    for epoch in range(NUM_EPOCHS):
        te = time.time()

        # Train
        model.train()
        rloss, rcorr, rtotal = 0.0, 0, 0
        for x, y in train_loader:
            x, y = x.to(device, non_blocking=True), y.to(device, non_blocking=True)
            optimizer.zero_grad()
            with autocast("cuda"):
                out = model(x)
                loss = criterion(out, y)
            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()
            _, p = torch.max(out, 1)
            rloss += loss.item() * x.size(0)
            rcorr += (p == y).sum().item()
            rtotal += x.size(0)

        tl, ta = rloss / rtotal, rcorr / rtotal

        # Val
        model.eval()
        vloss, vcorr, vtotal = 0.0, 0, 0
        with torch.no_grad():
            for x, y in val_loader:
                x, y = x.to(device, non_blocking=True), y.to(device, non_blocking=True)
                with autocast("cuda"):
                    out = model(x)
                    loss = criterion(out, y)
                _, p = torch.max(out, 1)
                vloss += loss.item() * x.size(0)
                vcorr += (p == y).sum().item()
                vtotal += x.size(0)

        vl, va = vloss / vtotal, vcorr / vtotal
        scheduler.step()

        history["train_loss"].append(tl)
        history["val_loss"].append(vl)
        history["train_acc"].append(ta)
        history["val_acc"].append(va)

        mark = ""
        if va > best_acc:
            best_acc = va
            best_wts = copy.deepcopy(model.state_dict())
            mark = " << BEST"

        elapsed = time.time() - te
        print(f"  Epoch {epoch+1:>2}/{NUM_EPOCHS} | "
              f"Train: {tl:.4f}/{ta:.3f} | Val: {vl:.4f}/{va:.3f} | "
              f"{elapsed:.1f}s{mark}")

    print("-" * 65)
    print(f"  Done in {(time.time()-t0)/60:.1f} min | Best val acc: {best_acc:.1%}")

    model.load_state_dict(best_wts)
    return model, history, best_acc


# ---- Evaluate --------------------------------------------------------------

def evaluate(model, val_loader, classes, display_names, device):
    print("\n  Evaluating...")
    model.eval()
    preds, labels = [], []
    with torch.no_grad():
        for x, y in val_loader:
            x = x.to(device, non_blocking=True)
            with autocast("cuda"):
                out = model(x)
            _, p = torch.max(out, 1)
            preds.extend(p.cpu().numpy())
            labels.extend(y.numpy())

    preds, labels = np.array(preds), np.array(labels)
    names = [display_names.get(c, c) for c in classes]

    report = classification_report(labels, preds, target_names=names,
                                    output_dict=True, zero_division=0)
    print("\n" + classification_report(labels, preds, target_names=names, zero_division=0))

    cm = confusion_matrix(labels, preds)
    return report, cm


# ---- Save ------------------------------------------------------------------

def save_plots(history, cm, classes, display_names):
    # Training curves
    fig, (a1, a2) = plt.subplots(1, 2, figsize=(14, 5))
    ep = range(1, len(history["train_loss"]) + 1)
    a1.plot(ep, history["train_loss"], "b-", label="Train", lw=2)
    a1.plot(ep, history["val_loss"], "r-", label="Val", lw=2)
    a1.set(xlabel="Epoch", ylabel="Loss", title="Loss Curves")
    a1.legend(); a1.grid(alpha=0.3)
    a2.plot(ep, history["train_acc"], "b-", label="Train", lw=2)
    a2.plot(ep, history["val_acc"], "r-", label="Val", lw=2)
    a2.set(xlabel="Epoch", ylabel="Accuracy", title="Accuracy Curves")
    a2.legend(); a2.grid(alpha=0.3)
    plt.tight_layout()
    plt.savefig(MODELS_DIR / "training_curves.png", dpi=150)
    plt.close()
    print(f"  Saved: {MODELS_DIR / 'training_curves.png'}")

    # Confusion matrix
    names = [display_names.get(c, c) for c in classes]
    fig, ax = plt.subplots(figsize=(16, 14))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
                xticklabels=names, yticklabels=names, ax=ax)
    ax.set(xlabel="Predicted", ylabel="Actual")
    ax.set_title("SpaceAtlas - Confusion Matrix", fontsize=14)
    plt.xticks(rotation=45, ha="right", fontsize=7)
    plt.yticks(rotation=0, fontsize=7)
    plt.tight_layout()
    plt.savefig(MODELS_DIR / "confusion_matrix.png", dpi=150)
    plt.close()
    print(f"  Saved: {MODELS_DIR / 'confusion_matrix.png'}")


def export_onnx(model, num_classes, classes, display_names, device):
    print("\n  Exporting to ONNX...")
    model.eval()
    dummy = torch.randn(1, 3, IMG_SIZE, IMG_SIZE).to(device)
    path = MODELS_DIR / "space-classifier.onnx"

    torch.onnx.export(model, dummy, str(path), export_params=True,
                       opset_version=17, do_constant_folding=True,
                       input_names=["image"], output_names=["predictions"],
                       dynamic_axes={"image": {0: "batch"}, "predictions": {0: "batch"}})

    labels_path = MODELS_DIR / "class_labels.json"
    labels_data = {
        "classes": classes,
        "num_classes": num_classes,
        "display_names": {c: display_names.get(c, c) for c in classes},
    }
    with open(labels_path, "w", encoding="utf-8") as f:
        json.dump(labels_data, f, indent=2)

    sz = path.stat().st_size / (1024 * 1024)
    print(f"  ONNX: {path} ({sz:.1f} MB)")
    print(f"  Labels: {labels_path}")


# ---- Main ------------------------------------------------------------------

def main():
    print("=" * 65)
    print("  SpaceAtlas -- Space Object Classifier (34 classes)")
    print("  ResNet-18 | Transfer Learning | Mixed Precision")
    print("=" * 65)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    if torch.cuda.is_available():
        name = torch.cuda.get_device_name(0)
        mem = torch.cuda.get_device_properties(0).total_memory / (1024**3)
        print(f"\n  GPU: {name} ({mem:.1f} GB)")
    else:
        print("\n  WARNING: No GPU, training on CPU")

    train_loader, val_loader, classes, num_classes, display_names = load_data()
    model = create_model(num_classes, device)
    model, history, best_acc = train(model, train_loader, val_loader, device)
    report, cm = evaluate(model, val_loader, classes, display_names, device)

    # Save model
    torch.save({"model_state_dict": model.state_dict(), "classes": classes,
                "num_classes": num_classes, "best_acc": best_acc, "img_size": IMG_SIZE,
                "display_names": {c: display_names.get(c, c) for c in classes}},
               MODELS_DIR / "space-classifier.pth")
    print(f"\n  Model saved: {MODELS_DIR / 'space-classifier.pth'}")

    # Save metrics
    metrics = {"best_val_accuracy": best_acc, "classes": classes, "num_classes": num_classes,
               "epochs": NUM_EPOCHS, "model": "ResNet-18", "history": history,
               "classification_report": report}
    with open(MODELS_DIR / "training_metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    save_plots(history, cm, classes, display_names)
    export_onnx(model, num_classes, classes, display_names, device)

    print("\n" + "=" * 65)
    print(f"  DONE | Accuracy: {best_acc:.1%} | Classes: {num_classes}")
    print(f"  Files: {MODELS_DIR.resolve()}")
    print("=" * 65 + "\n")


if __name__ == "__main__":
    main()
