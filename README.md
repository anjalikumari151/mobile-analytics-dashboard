# Mobile Usage Analytics Dashboard

A full-stack web application for mobile usage analytics, built with **Python + FastAPI** (backend) and **React + TypeScript** (frontend), running entirely on localhost.

---

## Prerequisites

| Tool | Version |
|---|---|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |

> **Node.js not installed?** Download from https://nodejs.org/en/download (LTS version recommended).

---

## Quick Start

### 1. Backend

```bash
cd mobile-analytics-dashboard/backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate          # macOS/Linux
# .\venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Seed the database with 30 days of synthetic data (run once)
python seed.py

# Start the API server
uvicorn main:app --reload --port 8000
```

Backend is live at: http://localhost:8000  
Swagger UI (API docs): http://localhost:8000/docs

---

### 2. Frontend

```bash
cd mobile-analytics-dashboard/frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend is live at: http://localhost:3000

---

## Login Credentials

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `admin123` |

---

## Dashboard Modules

| Module | Description |
|---|---|
| 📈 Engagement | DAU/WAU/MAU trends, session stats, retention curves |
| 📱 Devices | OS distribution, top devices, app versions, network types |
| 🌍 Geography | Sortable user distribution by country and city |
| ⚡ Performance | Crash rate trend, screen load time P50/P90 |
| 🎯 Events & Funnel | Top custom events, conversion funnel |
| 🔔 Notifications | Delivery and open rate trends |
| 🚨 Alerts | Rule-based threshold alerts |

---

## Ingestion API — curl Examples

### Ingest an event
```bash
curl -X POST http://localhost:8000/ingest/event \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "screen_view",
    "user_id": "user_0042",
    "session_id": "sess_99999",
    "screen": "Home",
    "os": "iOS",
    "os_version": "17.2",
    "device_model": "iPhone 15",
    "country": "United States",
    "city": "New York",
    "network_type": "Wi-Fi",
    "app_version": "2.0.0"
  }'
```

### Ingest a crash
```bash
curl -X POST http://localhost:8000/ingest/crash \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_0042",
    "os": "Android",
    "os_version": "14",
    "device_model": "Samsung Galaxy S23",
    "app_version": "1.3.0",
    "error_message": "NullPointerException in MainActivity"
  }'
```

### Login and get a token
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

---

## Project Structure

```
mobile-analytics-dashboard/
├── README.md
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # SQLAlchemy engine + session
│   ├── models.py            # ORM table definitions
│   ├── schemas.py           # Pydantic request/response models
│   ├── auth.py              # JWT auth
│   ├── analytics.py         # SQL aggregation logic
│   ├── alert_engine.py      # Rule-based alert evaluation
│   ├── seed.py              # Synthetic data seeder
│   ├── requirements.txt
│   └── routers/
│       ├── ingest.py        # POST /ingest/*
│       └── metrics.py       # GET /metrics/*
└── frontend/
    ├── index.html
    ├── vite.config.ts
    ├── package.json
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── utils/api.ts
        ├── context/FilterContext.tsx
        ├── layouts/DashboardLayout.tsx
        ├── components/
        │   ├── Sidebar.tsx
        │   ├── TopBar.tsx
        │   ├── KpiCard.tsx
        │   └── ProtectedRoute.tsx
        └── pages/
            ├── LoginPage.tsx
            ├── DashboardPage.tsx
            └── sections/
                ├── EngagementSection.tsx
                ├── DeviceSection.tsx
                ├── GeoSection.tsx
                ├── PerformanceSection.tsx
                ├── EventsSection.tsx
                ├── NotificationsSection.tsx
                └── AlertsSection.tsx
```
