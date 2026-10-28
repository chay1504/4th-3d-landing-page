import os
import glob
from PIL import Image
from concurrent.futures import ProcessPoolExecutor

BASE_DIR = r"f:/Work/4th - 3d website"
HERO_CLIPS = [
    os.path.join(BASE_DIR, "frames", "hero section", "clip-1"),
    os.path.join(BASE_DIR, "frames", "hero section", "clip-2"),
    os.path.join(BASE_DIR, "frames", "hero section", "clip-3")
]
DISMANTLE_DIR = os.path.join(BASE_DIR, "frames", "dismantle", "ezgif-4e95e9670c7f3a08-jpg")

OUT_DIRS = [
    os.path.join(BASE_DIR, "frames", "hero"),
    os.path.join(BASE_DIR, "frames", "hero-mobile"),
    os.path.join(BASE_DIR, "frames", "explode"),
    os.path.join(BASE_DIR, "frames", "explode-mobile"),
    os.path.join(BASE_DIR, "cars"),
    os.path.join(BASE_DIR, "public", "frames", "hero"),
    os.path.join(BASE_DIR, "public", "frames", "hero-mobile"),
    os.path.join(BASE_DIR, "public", "frames", "explode"),
    os.path.join(BASE_DIR, "public", "frames", "explode-mobile"),
    os.path.join(BASE_DIR, "public", "cars")
]

for d in OUT_DIRS:
    os.makedirs(d, exist_ok=True)

def process_frame(task):
    src_path, dst_desktop, dst_mobile, quality_dt, quality_mb = task
    try:
        with Image.open(src_path) as img:
            rgb_img = img.convert("RGB")
            # Save desktop
            rgb_img.save(dst_desktop, "WEBP", quality=quality_dt)
            # Save mobile (640x360)
            mob_img = rgb_img.resize((640, 360), Image.Resampling.LANCZOS)
            mob_img.save(dst_mobile, "WEBP", quality=quality_mb)
        
        # Mirror to public
        rel_dt = os.path.relpath(dst_desktop, BASE_DIR)
        rel_mb = os.path.relpath(dst_mobile, BASE_DIR)
        pub_dt = os.path.join(BASE_DIR, "public", rel_dt)
        pub_mb = os.path.join(BASE_DIR, "public", rel_mb)
        
        import shutil
        shutil.copy2(dst_desktop, pub_dt)
        shutil.copy2(dst_mobile, pub_mb)
        return True
    except Exception as e:
        print(f"Error processing {src_path}: {e}")
        return False

def convert_all():
    print("Gathering tasks...")
    tasks = []
    
    # Hero frames (450 total)
    frame_idx = 1
    for clip_path in HERO_CLIPS:
        files = sorted(glob.glob(os.path.join(clip_path, "*.jpg")))
        for f in files:
            name = f"frame_{frame_idx:04d}.webp"
            dst_dt = os.path.join(BASE_DIR, "frames", "hero", name)
            dst_mb = os.path.join(BASE_DIR, "frames", "hero-mobile", name)
            tasks.append((f, dst_dt, dst_mb, 80, 72))
            frame_idx += 1
    print(f"Total hero tasks: {len(tasks)}")

    # Explode frames (180 total)
    dis_files = sorted(glob.glob(os.path.join(DISMANTLE_DIR, "*.jpg")))
    dis_idx = 1
    for f in dis_files:
        name = f"frame_{dis_idx:04d}.webp"
        dst_dt = os.path.join(BASE_DIR, "frames", "explode", name)
        dst_mb = os.path.join(BASE_DIR, "frames", "explode-mobile", name)
        tasks.append((f, dst_dt, dst_mb, 80, 72))
        dis_idx += 1
    print(f"Total tasks including explode: {len(tasks)}")

    print("Converting frames in parallel...")
    with ProcessPoolExecutor(max_workers=os.cpu_count()) as executor:
        results = list(executor.map(process_frame, tasks))
    print(f"Completed {sum(results)} / {len(tasks)} frames converted successfully!")

    # Now convert lineup cars
    generated_cars = {
        "gt-e.webp": r"C:\Users\hp\.gemini\antigravity-ide\brain\fa8ab064-409c-4d8f-8833-cb7188b4276e\noctis_lineup_gte_1793175584020.jpg",
        "s.webp": r"C:\Users\hp\.gemini\antigravity-ide\brain\fa8ab064-409c-4d8f-8833-cb7188b4276e\noctis_lineup_s_1793175543615.jpg",
        "x.webp": r"C:\Users\hp\.gemini\antigravity-ide\brain\fa8ab064-409c-4d8f-8833-cb7188b4276e\noctis_lineup_x_1793175624991.jpg",
        "r.webp": r"C:\Users\hp\.gemini\antigravity-ide\brain\fa8ab064-409c-4d8f-8833-cb7188b4276e\noctis_lineup_r_1793175665424.jpg",
        "one.webp": r"C:\Users\hp\.gemini\antigravity-ide\brain\fa8ab064-409c-4d8f-8833-cb7188b4276e\noctis_lineup_one_1793175697744.jpg"
    }
    
    import shutil
    for car_name, gen_path in generated_cars.items():
        dst_car = os.path.join(BASE_DIR, "cars", car_name)
        pub_car = os.path.join(BASE_DIR, "public", "cars", car_name)
        with Image.open(gen_path) as img:
            rgb = img.convert("RGB")
            rgb.save(dst_car, "WEBP", quality=88)
            shutil.copy2(dst_car, pub_car)
        print(f"Saved {car_name}")

if __name__ == "__main__":
    convert_all()
