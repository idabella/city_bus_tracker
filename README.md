<div align="center">

# 🚌 Système de Gestion de Transport Public Marocain

### Modern Public Transportation Management System

[![Oracle](https://img.shields.io/badge/Oracle-F80000?style=for-the-badge&logo=oracle&logoColor=white)](https://www.oracle.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

*A comprehensive full-stack solution for managing public bus transportation in Morocco*



</div>

---

## 📋 Overview

The **Système de Gestion de Transport Public Marocain** is a modern, full-stack web application designed to streamline the management of public bus transportation services. Built with a robust Oracle database backend and a sleek React frontend, this system provides comprehensive tools for managing buses, drivers, routes, schedules, tickets, and more.

### 🎯 Key Objectives

- **Centralized Management**: Single platform for all transportation operations
- **Real-time Monitoring**: Track buses, trips, and incidents in real-time
- **Role-based Access**: Secure access control for different user types
- **Data-driven Decisions**: Comprehensive analytics and reporting

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🚍 Fleet Management
- Bus registration and tracking
- Vehicle maintenance scheduling
- Status monitoring (Available, In Service, Maintenance)
- Capacity management

### 👨‍✈️ Driver Management
- Driver profiles and licensing
- License expiry tracking
- Assignment to routes and trips
- Performance monitoring

### 🛣️ Route Management
- Bus line configuration
- Station mapping
- Stop order management
- Distance calculations

</td>
<td width="50%">

### 🎫 Ticketing System
- Ticket generation and validation
- Multiple ticket types (Standard, Student, Senior, Child)
- Automatic pricing based on distance
- Subscription management

### 📅 Scheduling
- Trip scheduling and planning
- Real-time schedule updates
- Conflict detection
- Service type management (Weekday, Weekend, Holiday)

### 📊 Analytics & Reporting
- Interactive dashboard
- Revenue tracking
- Utilization reports
- Incident analysis

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI Library |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool |
| **Tailwind CSS** | Styling |
| **Framer Motion** | Animations |
| **Recharts** | Data Visualization |
| **Lucide React** | Icons |
| **React Router** | Navigation |

### Backend
| Technology | Purpose |
|------------|---------|
| **Express 5** | API Server |
| **Oracle Database** | Data Storage |
| **oracledb** | Oracle Driver |
| **TypeScript** | Type Safety |

### Database
| Component | Count |
|-----------|-------|
| **Tables** | 13 |
| **Triggers** | 6 |
| **Functions** | 14 |
| **Procedures** | 50+ |
| **Sequences** | 11 |
| **Indexes** | 30+ |

---

## 📁 Project Structure

```
Systeme_de_Gestion_Transport_Public/
├── 📂 project/                     # Main application
│   ├── 📂 src/                     # Frontend source
│   │   ├── 📂 components/          # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Table.tsx
│   │   │   └── ...
│   │   ├── 📂 pages/               # Application pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Buses.tsx
│   │   │   ├── Drivers.tsx
│   │   │   ├── Trips.tsx
│   │   │   ├── Tickets.tsx
│   │   │   └── ...
│   │   ├── 📂 context/             # React context providers
│   │   ├── 📂 hooks/               # Custom React hooks
│   │   ├── 📂 types/               # TypeScript definitions
│   │   └── 📂 utils/               # Utility functions
│   ├── 📂 oracle/                  # Database migrations
│   ├── server.ts                   # Express API server
│   ├── package.json
│   └── vite.config.ts
│
├── 📂 scripts/                     # SQL scripts
│   ├── setup_infrastructure.sql   # Tablespaces & users (run as SYS)
│   ├── tables_objects.sql         # Tables & indexes (run as bus_admin)
│   ├── Triggers.sql               # Database triggers
│   ├── Functions.sql              # PL/SQL functions
│   ├── Procedures.sql             # PL/SQL procedures
│   ├── grant_privileges.sql       # Role permissions
│   └── EXECUTION_ORDER.md         # Setup documentation
│
└── README.md
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Oracle Database** 19c+ (XE, Standard, or Enterprise)
- **Oracle Instant Client** (for Node.js oracledb driver)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Systeme_de_Gestion_Transport_Public.git
cd Systeme_de_Gestion_Transport_Public
```

### 2. Install Dependencies

```bash
cd project
npm install
```

### 3. Configure Environment

Create a `.env` file in the `project` directory:

```env
# Oracle Database Connection
ORACLE_USER=bus_admin
ORACLE_PASSWORD=Admin2025
ORACLE_CONNECTION_STRING=localhost:1521/XE

# Server Configuration
PORT=3000
```

---

## 🗄️ Database Setup

> ⚠️ **IMPORTANT**: Follow this exact order to avoid ORA-04089 errors!

### Step 1: Run as SYS/SYSDBA

Connect to Oracle as SYS and create the infrastructure:

```bash
sqlplus sys/your_password@XE as sysdba
```

```sql
@scripts/setup_infrastructure.sql
```

This creates:
- ✅ Tablespaces (`BUS_DATA`, `BUS_TEMP`)
- ✅ Users (`bus_admin`, `bus_manager1`, `chauffeur1`, etc.)
- ✅ Roles (`BUS_ADMIN_ROLE`, `BUS_MANAGER_ROLE`, etc.)

### Step 2: Run as BUS_ADMIN

Connect as the application user:

```bash
sqlplus bus_admin/Admin2025@XE
```

```sql
-- Create tables, sequences, indexes
@scripts/tables_objects.sql

-- Create triggers
@scripts/Triggers.sql

-- Create functions
@scripts/Functions.sql

-- Create procedures
@scripts/Procedures.sql

-- Grant privileges
@scripts/grant_privileges.sql
```

### Step 3: Verify Installation

```sql
SELECT object_type, COUNT(*) 
FROM user_objects 
GROUP BY object_type 
ORDER BY object_type;
```

Expected output:
| OBJECT_TYPE | COUNT |
|-------------|-------|
| FUNCTION | 14 |
| INDEX | 30+ |
| PROCEDURE | 50+ |
| SEQUENCE | 11 |
| TABLE | 13 |
| TRIGGER | 6 |

---

## 💻 Usage

### Development Mode

Start both the frontend and backend concurrently:

```bash
cd project
npm run dev:all
```

Or start them separately:

```bash
# Terminal 1: Start API server
npm run server

# Terminal 2: Start frontend
npm run dev
```

### Access the Application

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **API Server** | http://localhost:3000 |

### Default Credentials

| User | Password | Role |
|------|----------|------|
| `bus_admin` | Admin2025 | Administrator |
| `bus_manager1` | Manager2025 | Manager |
| `chauffeur1` | Chauffeur2025 | Driver |
| `bus_commercial` | Commercial2025 | Commercial |
| `bus_analyste` | Analyste2025 | Analyst |

---

## 🔐 Security Features

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to all tables and operations |
| **Manager** | Manage trips, drivers, schedules, incidents |
| **Driver** | View schedules, update trip status, report incidents |
| **Maintenance** | Manage buses and maintenance records |
| **Commercial** | Manage tickets and subscriptions |
| **Analyst** | Read-only access to all data |

### Database Security

- 🔒 Encrypted passwords
- 🔒 Session auditing enabled
- 🔒 Quota limits per user
- 🔒 Trigger-based validation

---


## 🧪 API Endpoints

### Core Resources

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/buses` | List all buses |
| POST | `/api/buses` | Create a new bus |
| PUT | `/api/buses/:id` | Update a bus |
| DELETE | `/api/buses/:id` | Delete a bus |
| GET | `/api/drivers` | List all drivers |
| GET | `/api/trips` | List all trips |
| GET | `/api/tickets` | List all tickets |
| GET | `/api/lines` | List all bus lines |
| GET | `/api/stations` | List all stations |
| GET | `/api/schedules` | List all schedules |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👥 Authors

<table>
<tr>
<td align="center">
<strong>Mustapha Idabella</strong><br>
<a href="#">@mustaphaidabella</a>
</td>
<td align="center">
<strong>Abdessamad Lahlaoui</strong><br>
<a href="#">@abdessamadlahlaoui</a>
</td>
<td align="center">
<strong>Othman Gadrouz</strong><br>
<a href="#">@othmangadrouz</a>
</td>
</tr>
</table>



---

<div align="center">



</div>

