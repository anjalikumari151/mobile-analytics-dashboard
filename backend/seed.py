"""
Seed script — inserts 30 days of synthetic mobile analytics data.
Run once: python seed.py
"""
import random
import json
from datetime import datetime, timedelta
from database import engine, SessionLocal, Base
import models  # noqa: F401 — ensures tables are registered

# ── helpers ──────────────────────────────────────────────────────────────────
def rand_date(days_ago_max: int = 30) -> datetime:
    offset = random.randint(0, days_ago_max * 24 * 60)
    return datetime.utcnow() - timedelta(minutes=offset)


OS_LIST = ["iOS", "Android"]
IOS_VERSIONS = ["16.0", "16.5", "17.0", "17.2", "17.4"]
ANDROID_VERSIONS = ["12", "13", "14"]
DEVICES = [
    "iPhone 13", "iPhone 14", "iPhone 15",
    "Samsung Galaxy S22", "Samsung Galaxy S23",
    "Google Pixel 7", "Google Pixel 8",
    "OnePlus 11", "Xiaomi 13", "Oppo Find X6",
]
COUNTRIES = [
    ("United States", "New York"), ("United States", "Los Angeles"),
    ("India", "Mumbai"), ("India", "Bangalore"),
    ("United Kingdom", "London"), ("Germany", "Berlin"),
    ("Brazil", "São Paulo"), ("Canada", "Toronto"),
    ("Australia", "Sydney"), ("Japan", "Tokyo"),
]
NETWORK_TYPES = ["Wi-Fi", "4G", "5G", "3G"]
APP_VERSIONS = ["1.0.0", "1.1.0", "1.2.0", "1.3.0", "2.0.0"]
SCREENS = ["Home", "Search", "Profile", "Settings", "Cart", "Checkout", "Onboarding", "Login"]
EVENT_TYPES = ["app_open", "screen_view", "button_click", "purchase", "sign_up", "add_to_cart", "share", "logout"]
NOTIF_TYPES = ["promotional", "transactional", "reminder", "update"]

USER_COUNT = 200
SESSION_COUNT = 800
EVENT_COUNT = 3000
CRASH_COUNT = 60
NOTIF_COUNT = 400


def make_user_id() -> str:
    return f"user_{random.randint(1, USER_COUNT):04d}"


def make_device():
    os = random.choice(OS_LIST)
    os_version = random.choice(IOS_VERSIONS if os == "iOS" else ANDROID_VERSIONS)
    device = random.choice([d for d in DEVICES if ("iPhone" in d if os == "iOS" else "iPhone" not in d)] or DEVICES)
    return os, os_version, device


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # ── Sessions ──────────────────────────────────────────────────────────────
    sessions = []
    for i in range(SESSION_COUNT):
        os, os_version, device = make_device()
        country, city = random.choice(COUNTRIES)
        start = rand_date(30)
        duration = random.uniform(30, 900)
        end = start + timedelta(seconds=duration)
        s = models.Session(
            session_id=f"sess_{i:05d}",
            user_id=make_user_id(),
            start_time=start,
            end_time=end,
            duration_seconds=round(duration, 1),
            screen_count=random.randint(1, 12),
            os=os,
            os_version=os_version,
            device_model=device,
            country=country,
            city=city,
            network_type=random.choice(NETWORK_TYPES),
            app_version=random.choice(APP_VERSIONS),
        )
        sessions.append(s)
    db.bulk_save_objects(sessions)
    db.commit()
    print(f"  ✓ {SESSION_COUNT} sessions inserted")

    # ── Events ────────────────────────────────────────────────────────────────
    events = []
    for i in range(EVENT_COUNT):
        os, os_version, device = make_device()
        country, city = random.choice(COUNTRIES)
        props = json.dumps({"load_ms": random.randint(100, 2000)})
        e = models.Event(
            event_type=random.choice(EVENT_TYPES),
            user_id=make_user_id(),
            session_id=f"sess_{random.randint(0, SESSION_COUNT - 1):05d}",
            screen=random.choice(SCREENS),
            timestamp=rand_date(30),
            os=os,
            os_version=os_version,
            device_model=device,
            country=country,
            city=city,
            network_type=random.choice(NETWORK_TYPES),
            app_version=random.choice(APP_VERSIONS),
            properties=props,
        )
        events.append(e)
    db.bulk_save_objects(events)
    db.commit()
    print(f"  ✓ {EVENT_COUNT} events inserted")

    # ── Crashes ───────────────────────────────────────────────────────────────
    errors = [
        "NullPointerException in MainActivity",
        "IndexOutOfBoundsException in RecyclerView",
        "NetworkTimeoutException",
        "MemoryAllocationError",
        "UIThreadException in CartView",
    ]
    crashes = []
    for _ in range(CRASH_COUNT):
        os, os_version, device = make_device()
        crashes.append(models.Crash(
            user_id=make_user_id(),
            timestamp=rand_date(30),
            os=os,
            os_version=os_version,
            device_model=device,
            app_version=random.choice(APP_VERSIONS),
            error_message=random.choice(errors),
        ))
    db.bulk_save_objects(crashes)
    db.commit()
    print(f"  ✓ {CRASH_COUNT} crashes inserted")

    # ── Notifications ─────────────────────────────────────────────────────────
    notifs = []
    for _ in range(NOTIF_COUNT):
        delivered = random.random() > 0.08  # 92% delivery rate
        opened = delivered and random.random() > 0.65  # ~35% open rate
        notifs.append(models.Notification(
            user_id=make_user_id(),
            timestamp=rand_date(30),
            notification_type=random.choice(NOTIF_TYPES),
            delivered=delivered,
            opened=opened,
        ))
    db.bulk_save_objects(notifs)
    db.commit()
    print(f"  ✓ {NOTIF_COUNT} notifications inserted")

    # ── Alert configs ─────────────────────────────────────────────────────────
    alert_configs = [
        models.AlertConfig(metric_name="crash_rate", operator="gt", threshold=5.0, severity="critical"),
        models.AlertConfig(metric_name="dau", operator="lt", threshold=10.0, severity="warning"),
        models.AlertConfig(metric_name="notification_open_rate", operator="lt", threshold=20.0, severity="warning"),
    ]
    db.bulk_save_objects(alert_configs)
    db.commit()
    print(f"  ✓ {len(alert_configs)} alert configs inserted")

    db.close()
    print("\nSeeding complete! analytics.db is ready.")


if __name__ == "__main__":
    seed()
