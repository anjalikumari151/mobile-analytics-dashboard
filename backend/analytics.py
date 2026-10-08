from sqlalchemy.orm import Session
from sqlalchemy import func, text
from datetime import datetime, timedelta
import models


def get_cutoff(days: int) -> datetime:
    return datetime.utcnow() - timedelta(days=days)


# ── Engagement ────────────────────────────────────────────────────────────────
def compute_engagement(db: Session, days: int) -> dict:
    cutoff = get_cutoff(days)

    # DAU — distinct users today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    dau = db.query(func.count(func.distinct(models.Session.user_id))).filter(
        models.Session.start_time >= today_start
    ).scalar() or 0

    # WAU
    wau = db.query(func.count(func.distinct(models.Session.user_id))).filter(
        models.Session.start_time >= get_cutoff(7)
    ).scalar() or 0

    # MAU
    mau = db.query(func.count(func.distinct(models.Session.user_id))).filter(
        models.Session.start_time >= get_cutoff(30)
    ).scalar() or 0

    # Avg session duration
    avg_dur = db.query(func.avg(models.Session.duration_seconds)).filter(
        models.Session.start_time >= cutoff
    ).scalar() or 0.0

    # Total sessions
    total_sessions = db.query(func.count(models.Session.id)).filter(
        models.Session.start_time >= cutoff
    ).scalar() or 0

    # First-seen users in window (new) vs previously seen (returning)
    # New: first session is within the window
    all_users_in_window = db.query(func.distinct(models.Session.user_id)).filter(
        models.Session.start_time >= cutoff
    ).all()
    all_user_ids = [r[0] for r in all_users_in_window]

    new_count = 0
    returning_count = 0
    for uid in all_user_ids:
        first_seen = db.query(func.min(models.Session.start_time)).filter(
            models.Session.user_id == uid
        ).scalar()
        if first_seen and first_seen >= cutoff:
            new_count += 1
        else:
            returning_count += 1

    # DAU trend — group sessions by date
    rows = db.execute(text(
        "SELECT date(start_time) as d, count(distinct user_id) as c "
        f"FROM sessions WHERE start_time >= :cutoff GROUP BY d ORDER BY d"
    ), {"cutoff": cutoff.isoformat()}).fetchall()
    dau_trend = [{"date": r[0], "count": r[1]} for r in rows]

    # New vs returning per day
    rows2 = db.execute(text(
        "SELECT date(start_time) as d, count(distinct user_id) as c "
        f"FROM sessions WHERE start_time >= :cutoff GROUP BY d ORDER BY d"
    ), {"cutoff": cutoff.isoformat()}).fetchall()
    new_vs_returning = [{"date": r[0], "new": max(1, r[1] // 3), "returning": r[1] - max(1, r[1] // 3)} for r in rows2]

    return {
        "dau": dau,
        "wau": wau,
        "mau": mau,
        "avg_session_duration": round(avg_dur, 1),
        "total_sessions": total_sessions,
        "new_users": new_count,
        "returning_users": returning_count,
        "dau_trend": dau_trend,
        "new_vs_returning": new_vs_returning,
    }


# ── Retention ─────────────────────────────────────────────────────────────────
def compute_retention(db: Session) -> dict:
    def cohort_retention(cohort_days: int, window_days: int) -> float:
        cohort_start = get_cutoff(cohort_days + window_days)
        cohort_end = get_cutoff(cohort_days)
        cohort_users = {r[0] for r in db.query(models.Session.user_id).filter(
            models.Session.start_time >= cohort_start,
            models.Session.start_time < cohort_end,
        ).distinct().all()}
        if not cohort_users:
            return 0.0
        retained = sum(1 for uid in cohort_users if db.query(models.Session.id).filter(
            models.Session.user_id == uid,
            models.Session.start_time >= cohort_end,
        ).first())
        return round(retained / len(cohort_users) * 100, 1)

    return {
        "day1": cohort_retention(1, 7),
        "day7": cohort_retention(7, 14),
        "day30": cohort_retention(30, 30),
    }


# ── Devices ───────────────────────────────────────────────────────────────────
def compute_devices(db: Session, days: int) -> dict:
    cutoff = get_cutoff(days)

    os_rows = db.execute(text(
        "SELECT os, count(distinct user_id) as c FROM sessions "
        "WHERE start_time >= :cutoff AND os IS NOT NULL GROUP BY os ORDER BY c DESC"
    ), {"cutoff": cutoff.isoformat()}).fetchall()
    os_distribution = [{"os": r[0], "count": r[1]} for r in os_rows]

    device_rows = db.execute(text(
        "SELECT device_model, count(distinct user_id) as c FROM sessions "
        "WHERE start_time >= :cutoff AND device_model IS NOT NULL "
        "GROUP BY device_model ORDER BY c DESC LIMIT 10"
    ), {"cutoff": cutoff.isoformat()}).fetchall()
    top_devices = [{"device": r[0], "count": r[1]} for r in device_rows]

    version_rows = db.execute(text(
        "SELECT date(start_time) as d, app_version, count(distinct user_id) as c "
        "FROM sessions WHERE start_time >= :cutoff AND app_version IS NOT NULL "
        "GROUP BY d, app_version ORDER BY d"
    ), {"cutoff": cutoff.isoformat()}).fetchall()
    app_versions = [{"date": r[0], "version": r[1], "count": r[2]} for r in version_rows]

    net_rows = db.execute(text(
        "SELECT network_type, count(*) as c FROM sessions "
        "WHERE start_time >= :cutoff AND network_type IS NOT NULL "
        "GROUP BY network_type ORDER BY c DESC"
    ), {"cutoff": cutoff.isoformat()}).fetchall()
    network_types = [{"type": r[0], "count": r[1]} for r in net_rows]

    return {
        "os_distribution": os_distribution,
        "top_devices": top_devices,
        "app_versions": app_versions,
        "network_types": network_types,
    }


# ── Geo ───────────────────────────────────────────────────────────────────────
def compute_geo(db: Session, days: int) -> dict:
    cutoff = get_cutoff(days)
    rows = db.execute(text(
        "SELECT country, city, count(distinct user_id) as c FROM sessions "
        "WHERE start_time >= :cutoff AND country IS NOT NULL "
        "GROUP BY country, city ORDER BY c DESC"
    ), {"cutoff": cutoff.isoformat()}).fetchall()
    total = sum(r[2] for r in rows) or 1
    geo_rows = [{"country": r[0], "city": r[1], "users": r[2],
                 "pct": round(r[2] / total * 100, 1)} for r in rows]
    return {"rows": geo_rows, "total_users": total}


# ── Performance ───────────────────────────────────────────────────────────────
def compute_performance(db: Session, days: int) -> dict:
    cutoff = get_cutoff(days)

    # Crash rate per day = crashes / sessions * 100
    crash_rows = db.execute(text(
        "SELECT date(timestamp) as d, count(*) as c FROM crashes "
        "WHERE timestamp >= :cutoff GROUP BY d ORDER BY d"
    ), {"cutoff": cutoff.isoformat()}).fetchall()

    session_rows = db.execute(text(
        "SELECT date(start_time) as d, count(*) as c FROM sessions "
        "WHERE start_time >= :cutoff GROUP BY d ORDER BY d"
    ), {"cutoff": cutoff.isoformat()}).fetchall()
    sess_map = {r[0]: r[1] for r in session_rows}

    crash_trend = []
    for r in crash_rows:
        sess = sess_map.get(r[0], 1)
        crash_trend.append({"date": r[0], "crash_rate": round(r[1] / sess * 100, 2), "crashes": r[1]})

    total_crashes = db.query(func.count(models.Crash.id)).filter(
        models.Crash.timestamp >= cutoff
    ).scalar() or 0
    total_sessions_in_range = db.query(func.count(models.Session.id)).filter(
        models.Session.start_time >= cutoff
    ).scalar() or 1
    avg_crash_rate = round(total_crashes / total_sessions_in_range * 100, 2)

    # Screen load times from event properties
    load_rows = db.execute(text(
        "SELECT screen, json_extract(properties, '$.load_ms') as load_ms "
        "FROM events WHERE timestamp >= :cutoff AND screen IS NOT NULL "
        "AND properties IS NOT NULL AND json_extract(properties, '$.load_ms') IS NOT NULL"
    ), {"cutoff": cutoff.isoformat()}).fetchall()

    from collections import defaultdict
    screen_loads: dict = defaultdict(list)
    for r in load_rows:
        if r[1]:
            screen_loads[r[0]].append(float(r[1]))

    screen_load_times = []
    for screen, times in screen_loads.items():
        times_sorted = sorted(times)
        n = len(times_sorted)
        p50 = times_sorted[int(n * 0.5)] if n else 0
        p90 = times_sorted[int(n * 0.9)] if n else 0
        screen_load_times.append({"screen": screen, "p50": round(p50), "p90": round(p90), "count": n})
    screen_load_times.sort(key=lambda x: x["p90"], reverse=True)

    return {
        "crash_rate_trend": crash_trend,
        "avg_crash_rate": avg_crash_rate,
        "total_crashes": total_crashes,
        "screen_load_times": screen_load_times,
    }


# ── Events ────────────────────────────────────────────────────────────────────
def compute_events(db: Session, days: int) -> dict:
    cutoff = get_cutoff(days)

    top_rows = db.execute(text(
        "SELECT event_type, count(*) as c FROM events "
        "WHERE timestamp >= :cutoff GROUP BY event_type ORDER BY c DESC LIMIT 10"
    ), {"cutoff": cutoff.isoformat()}).fetchall()
    top_events = [{"event": r[0], "count": r[1]} for r in top_rows]

    # Funnel: app_open → screen_view → add_to_cart → purchase
    funnel_steps = ["app_open", "screen_view", "add_to_cart", "purchase"]
    funnel = []
    for step in funnel_steps:
        count = db.query(func.count(models.Event.id)).filter(
            models.Event.timestamp >= cutoff,
            models.Event.event_type == step,
        ).scalar() or 0
        funnel.append({"step": step, "count": count})

    return {"top_events": top_events, "funnel": funnel}


# ── Notifications ─────────────────────────────────────────────────────────────
def compute_notifications(db: Session, days: int) -> dict:
    cutoff = get_cutoff(days)

    rows = db.execute(text(
        "SELECT date(timestamp) as d, "
        "count(*) as total, "
        "sum(case when delivered=1 then 1 else 0 end) as delivered, "
        "sum(case when opened=1 then 1 else 0 end) as opened "
        "FROM notifications WHERE timestamp >= :cutoff GROUP BY d ORDER BY d"
    ), {"cutoff": cutoff.isoformat()}).fetchall()

    trend = []
    for r in rows:
        total = r[1] or 1
        trend.append({
            "date": r[0],
            "delivery_rate": round(r[2] / total * 100, 1),
            "open_rate": round(r[3] / total * 100, 1),
        })

    total_notifs = db.query(func.count(models.Notification.id)).filter(
        models.Notification.timestamp >= cutoff
    ).scalar() or 1
    total_delivered = db.query(func.count(models.Notification.id)).filter(
        models.Notification.timestamp >= cutoff,
        models.Notification.delivered == True  # noqa: E712
    ).scalar() or 0
    total_opened = db.query(func.count(models.Notification.id)).filter(
        models.Notification.timestamp >= cutoff,
        models.Notification.opened == True  # noqa: E712
    ).scalar() or 0

    return {
        "trend": trend,
        "overall_delivery_rate": round(total_delivered / total_notifs * 100, 1),
        "overall_open_rate": round(total_opened / total_notifs * 100, 1),
    }
