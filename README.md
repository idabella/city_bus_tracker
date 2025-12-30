<div align="center">


# 🚌 Système de Gestion de Transport Public

[![Oracle](https://img.shields.io/badge/Oracle-F80000?style=flat&logo=oracle&logoColor=white)](https://www.oracle.com/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)


<img src="./images/logo.png" alt="Bus Transport Logo" width="300"/>


*Full-stack public bus transportation management system for Morocco*

</div>

---

## 🎯 Overview

Modern web application for managing public bus transportation: fleet, drivers, routes, schedules, tickets, and analytics. Built with React, TypeScript, Express, and Oracle Database.

**Key Features:** Fleet Management • Driver Scheduling • Route Planning • Ticketing System • Real-time Analytics

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Oracle Database 19c+
- Oracle Instant Client

### Installation

```bash
# Clone and install
git clone https://github.com/idabella/city_bus_tracker.git
cd city_bus_tracker/project
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Oracle credentials
```

### Database Setup

```bash
# 1. As SYS/SYSDBA
sqlplus sys/password@XE as sysdba
@scripts/setup_infrastructure.sql

# 2. As BUS_ADMIN
sqlplus bus_admin/Admin2025@XE
@scripts/tables_objects.sql
@scripts/Triggers.sql
@scripts/Functions.sql
@scripts/Procedures.sql
@scripts/grant_privileges.sql
```

### Run Application

```bash
# Option 1: Start both together
npm run dev:all

# Option 2: Start separately
npm run server  # Backend API on port 3000
npm run dev     # Frontend on port 5173
```

**Access:**
- Frontend: http://localhost:5173
- API: http://localhost:3000/api

---

## 📁 Project Structure

```
project/
├── src/                    # Frontend (React + TypeScript)
│   ├── components/         # UI components
│   ├── pages/             # App pages
│   └── types/             # Type definitions
├── scripts/               # Database SQL scripts
└── server.ts              # Express API server
```

---

## 🔐 Default Users

| Username | Password | Role |
|----------|----------|------|
| `bus_admin` | Admin2025 | Administrator |
| `bus_manager1` | Manager2025 | Manager |
| `chauffeur1` | Chauffeur2025 | Driver |

---

## 🛠️ Tech Stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Recharts  
**Backend:** Express 5, Oracle Database 19c, TypeScript  
**Database:** 13 Tables, 50+ Procedures, 14 Functions, 6 Triggers

---

## 📊 Database Architecture

### Core Tables
- **AUTOBUS**: Fleet management (registration, model, capacity, status)
- **CHAUFFEURS**: Driver information (name, phone, license details)
- **LIGNES**: Bus lines and routes configuration
- **STATIONS**: Bus stops with GPS coordinates
- **TRAJETS**: Trip records linking buses, drivers, and schedules
- **BILLETS**: Ticket management with dynamic pricing
- **HORAIRES**: Schedule management (departure/arrival times)
- **ITINERAIRES**: Route details and stop sequences
- **ABONNEMENTS**: Subscription and pass management
- **INCIDENTS**: Incident tracking and reporting
- **ENTRETIENS**: Maintenance records and history
- **UTILISATEURS**: User accounts with role-based access
- **TARIFS**: Pricing configuration and fare rules

### Database Objects
- **50+ Procedures**: 
  - `manage_bus()`, `manage_driver()`, `manage_trip()`
  - `calculate_fare()`, `generate_ticket()`
  - `get_all_buses()`, `get_bus_details()`
- **14 Functions**: 
  - `calculate_distance()`, `check_bus_availability()`
  - `calculate_ticket_price()`, `check_license_expiry()`
- **6 Triggers**: 
  - Auto-increment IDs, validation checks
  - Audit logging, status updates
- **RBAC**: 6 roles with granular permissions
  - `BUS_ADMIN_ROLE`, `BUS_MANAGER_ROLE`, `BUS_DRIVER_ROLE`
  - `BUS_MAINTENANCE_ROLE`, `BUS_COMMERCIAL_ROLE`, `BUS_ANALYSTE_ROLE`

---

## 🔌 API Endpoints

```
GET/POST/PUT/DELETE  /api/buses
GET/POST/PUT         /api/drivers
GET/POST/PUT/DELETE  /api/trips
GET/POST             /api/tickets
GET                  /api/lines
GET                  /api/stations
GET                  /api/analytics/dashboard
```

---

## 👥 Authors

**Mustapha Idabella** • **Abdessamad Lahlaoui** • **Othman Gadrouz**

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

<div align="center">

**Made with ❤️ in Morocco 🇲🇦**

[Report Bug](https://github.com/your-username/Systeme_de_Gestion_Transport_Public/issues) • [Request Feature](https://github.com/your-username/Systeme_de_Gestion_Transport_Public/issues)

</div>
