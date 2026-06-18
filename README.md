# EcoTrack
EcoTrack bridges the gap between environmental awareness and actionable sustainability. By visualizing personal carbon footprints and offering data-driven recommendations, the platform encourages environmentally responsible behavior and supports the goals of SDG 13: Climate Action.

# 🌿 EcoTrack — Smart Carbon Footprint Calculator

> SDG 13: Climate Action | Full-Stack Web App

EcoTrack helps individuals measure, monitor, and reduce their carbon footprint through daily activity tracking, analytics dashboards, and personalized eco-recommendations.

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JS, Chart.js |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) + bcrypt |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v16+
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com) free tier)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT_SECRET
npm start
# Server runs at http://localhost:5000
```

### 2. Frontend Setup

```bash
# Option A: VS Code Live Server (recommended)
# Right-click frontend/login.html → "Open with Live Server"

# Option B: Python simple server
cd frontend
python3 -m http.server 3000
# Visit http://localhost:3000/login.html

# Option C: Node http-server
npx http-server frontend -p 3000
```

> **Important**: If your frontend port ≠ 5000, update `API_BASE` in `frontend/js/api.js`

---

## 🌍 Features

### ✅ Implemented
- **User Auth** — Register, login, JWT-protected routes
- **Carbon Calculator** — Transport, energy, lifestyle inputs with live emission preview
- **Dashboard** — Stat cards, monthly trend chart, category doughnut chart
- **History** — Paginated log with date filters, color-coded bar chart, delete entries
- **Eco Tips** — Personalized recommendations based on recent data
- **Responsive UI** — Works on mobile, tablet, desktop

### 📊 Emission Factors Used
| Activity | Factor | Source |
|----------|--------|--------|
| Petrol Car | 0.21 kg CO₂/km | IPCC |
| Public Transport | 0.089 kg CO₂/km | DEFRA |
| Flight | 0.255 kg CO₂/km | ICAO |
| Electricity (India) | 0.82 kg CO₂/kWh | CEA India |
| Meat meal | 3.3 kg CO₂/meal | Oxford study |

---

## 🗂 Project Structure

```
ecotrack/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── middleware/
│   │   └── auth.js             # JWT middleware
│   ├── models/
│   │   ├── User.js             # User schema
│   │   └── CarbonEntry.js      # Entry schema + auto-calc
│   ├── routes/
│   │   ├── auth.js             # /api/auth/*
│   │   └── entries.js          # /api/entries/*
│   ├── server.js               # Express app entry
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── css/
    │   └── style.css           # Full design system
    ├── js/
    │   └── api.js              # Auth + HTTP client + utils
    ├── login.html
    ├── register.html
    ├── dashboard.html          # Analytics + charts
    ├── calculator.html         # Emission input + live preview
    ├── history.html            # Entry log + filters
    └── tips.html               # Recommendations
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Carbon Entries
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/entries` | Create entry |
| GET | `/api/entries` | List entries (with filters) |
| GET | `/api/entries/stats` | Dashboard statistics |
| GET | `/api/entries/recommendations` | Eco recommendations |
| PUT | `/api/entries/:id` | Update entry |
| DELETE | `/api/entries/:id` | Delete entry |

---

## 🎯 SDG 13 Alignment

- **Awareness**: Users see real kg CO₂e data with context (vs India/world averages)
- **Behavior change**: Personalized tips with concrete savings estimates
- **Tracking**: Historical data shows progress over time
- **Education**: Emission factor transparency in UI

---

## 🛠 Future Enhancements

- [ ] OAuth (Google login)
- [ ] Carbon offset marketplace integration
- [ ] Group/family footprint tracking
- [ ] Export to PDF/CSV reports
- [ ] Push notification reminders
- [ ] Integration with smart home APIs

---

## 📄 License
MIT — Free to use and modify
