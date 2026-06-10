<div align="center">

# 🚌 City Bus Tracker

[![Oracle](https://img.shields.io/badge/Oracle-F80000?style=flat&logo=oracle&logoColor=white)](https://www.oracle.com/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

<img src="./images/logo.png" alt="Bus Transport Logo" width="300"/>

**Full-stack public bus transportation management system for Morocco**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [API](#-api-endpoints) • [Contributing](#-contributing)

</div>

---

##  Overview

Modern web application for managing public bus transportation operations including fleet management, driver scheduling, route planning, ticketing system, and real-time analytics. Built with React, TypeScript, Express, and Oracle Database.

### Key Features

✅ **Fleet Management** - Track buses, maintenance, and availability  
✅ **Driver Scheduling** - Manage driver assignments and shifts  
✅ **Route Planning** - Configure bus lines, stations, and schedules  
✅ **Ticketing System** - Handle tickets and subscriptions  
✅ **Real-time Analytics** - Dashboard with charts and statistics  
✅ **Incident Tracking** - Report and manage operational incidents  
✅ **User Management** - Role-based access control (RBAC)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Oracle Database** 19c+ ([Download](https://www.oracle.com/database/))
- **Oracle Instant Client** ([Download](https://www.oracle.com/database/technologies/instant-client/downloads.html))

### Installation

```bash
# 1. Clone repository
git clone https://github.com/idabella/city_bus_tracker.git
cd city_bus_tracker

# 2. Install backend dependencies
cd backend
npm install
cp .env.example .env
# Edit .env with your Oracle credentials

# 3. Install frontend dependencies
cd ../frontend
npm install
```

### Database Setup

```bash
# 1. Connect as SYS/SYSDBA
sqlplus sys/password@XE as sysdba
@oracle/migrations/setup_infrastructure.sql

# 2. Connect as BUS_ADMIN
sqlplus bus_admin/Admin2025@XE
@oracle/migrations/tables_objects.sql
# Run additional migration scripts as needed
```

### Run Application

**Option 1: Run separately (recommended for development)**

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Backend runs on http://localhost:3001

# Terminal 2 - Frontend
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

**Option 2: Use convenience scripts from root**

```bash
# Install all dependencies
npm run install:all

# Run backend
npm run dev:backend

# Run frontend
npm run dev:frontend

# Build everything
npm run build:all
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

---

## 📁 Project Structure

```
city_bus_tracker/
├── backend/                    # Backend API Server
│   ├── src/
│   │   ├── server.ts          # Express server with API routes
│   │   └── utils/
│   │       └── oracle.ts      # Oracle DB connection & utilities
│   ├── package.json           # Backend dependencies
│   ├── tsconfig.json          # TypeScript config
│   ├── requirements.txt       # System dependencies
│   ├── .env.example           # Environment template
│   └── README.md              # Backend documentation
│
├── frontend/                   # Frontend React App
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Utilities & API client
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # Entry point
│   ├── package.json          # Frontend dependencies
│   ├── vite.config.ts        # Vite configuration
│   ├── tailwind.config.js    # Tailwind CSS config
│   ├── .env.example          # Environment template
│   └── README.md             # Frontend documentation
│
├── oracle/                    # Database Scripts
│   └── migrations/           # SQL migration files
│
├── images/                    # Project images & assets
├── .gitignore                # Git ignore rules
├── package.json              # Root package with scripts
├── README.md                 # This file
├── CONTRIBUTING.md           # Contribution guidelines
└── LICENSE                   # MIT License
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5
- **Language**: TypeScript
- **Database Driver**: oracledb

### Database
- **DBMS**: Oracle Database 19c
- **Tables**: 13 core tables
- **Procedures**: 50+ stored procedures
- **Functions**: 14 database functions
- **Triggers**: 6 automated triggers
- **RBAC**: 6 role-based access levels

---

## 📊 Database Architecture

### Core Tables

| Table | Description |
|-------|-------------|
| **CITIES** | City information (name, region, postal code, country) |
| **STATIONS** | Bus stops with GPS coordinates |
| **BUS_LINES** | Bus lines and route configurations |
| **BUSES** | Fleet management (registration, model, capacity, status) |
| **DRIVERS** | Driver information (name, phone, license details) |
| **TRIPS** | Trip records linking buses, drivers, and schedules |
| **TICKETS** | Ticket management with dynamic pricing |
| **SUBSCRIPTIONS** | Subscription and pass management |
| **MAINTENANCE** | Maintenance records and history |
| **INCIDENTS** | Incident tracking and reporting |
| **USERS** | User accounts with role-based access |

### Database Objects

- **50+ Procedures**: `manage_bus()`, `manage_driver()`, `calculate_fare()`, `generate_ticket()`
- **14 Functions**: `calculate_distance()`, `check_bus_availability()`, `calculate_ticket_price()`
- **6 Triggers**: Auto-increment IDs, validation checks, audit logging
- **RBAC Roles**: `BUS_ADMIN_ROLE`, `BUS_MANAGER_ROLE`, `BUS_DRIVER_ROLE`, `BUS_MAINTENANCE_ROLE`, `BUS_COMMERCIAL_ROLE`, `BUS_ANALYSTE_ROLE`

---

## 🔌 API Endpoints

### Cities
- `GET /api/cities` - Get all cities
- `POST /api/cities` - Create new city
- `PUT /api/cities/:id` - Update city
- `DELETE /api/cities/:id` - Delete city

### Stations
- `GET /api/stations` - Get all stations
- `POST /api/stations` - Create new station
- `PUT /api/stations/:id` - Update station
- `DELETE /api/stations/:id` - Delete station

### Bus Lines
- `GET /api/bus_lines` - Get all bus lines
- `POST /api/bus_lines` - Create new bus line
- `PUT /api/bus_lines/:id` - Update bus line
- `DELETE /api/bus_lines/:id` - Delete bus line

### Buses
- `GET /api/buses` - Get all buses
- `POST /api/buses` - Create new bus
- `PUT /api/buses/:id` - Update bus
- `DELETE /api/buses/:id` - Delete bus

### Drivers
- `GET /api/drivers` - Get all drivers
- `POST /api/drivers` - Create new driver
- `PUT /api/drivers/:id` - Update driver
- `DELETE /api/drivers/:id` - Delete driver

### Trips
- `GET /api/trips` - Get all trips
- `POST /api/trips` - Create new trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip

### Tickets & Subscriptions
- `GET /api/tickets` - Get all tickets
- `POST /api/tickets` - Create new ticket
- `GET /api/subscriptions` - Get all subscriptions
- `POST /api/subscriptions` - Create new subscription

### Maintenance & Incidents
- `GET /api/maintenance` - Get maintenance records
- `POST /api/maintenance` - Create maintenance record
- `GET /api/incidents` - Get all incidents
- `POST /api/incidents` - Report new incident

### Users & Health
- `GET /api/users` - Get all users (supports `?username=xxx` filter)
- `POST /api/users` - Create new user
- `GET /api/health` - Check API and database health

> 📖 **Full API documentation** available in [backend/README.md](backend/README.md)

---

## 🔐 Default Users

| Username | Password | Role |
|----------|----------|------|
| `bus_admin` | Admin2025 | Administrator |
| `bus_manager1` | Manager2025 | Manager |
| `chauffeur1` | Chauffeur2025 | Driver |

---

## Documentation

- **[Backend Documentation](backend/README.md)** - API endpoints, setup, and configuration
- **[Frontend Documentation](frontend/README.md)** - Component structure, styling, and features
- **[Contributing Guidelines](CONTRIBUTING.md)** - How to contribute to the project
- **[License](LICENSE)** - MIT License details

---


## 👥 Authors

**Mustapha Idabella** • **Abdessamad Lahlaoui** • **Othman Gadrouz**

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---


