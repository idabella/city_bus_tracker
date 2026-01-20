# City Bus Tracker - Backend API

Express.js backend server with Oracle Database integration for the City Bus Tracker application.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Oracle Database 19c+
- Oracle Instant Client (see requirements.txt)

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Oracle credentials
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Oracle Database Configuration
ORACLE_USER=bus_admin
ORACLE_PASSWORD=Admin2025
ORACLE_CONNECTION_STRING=localhost:1521/XE

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Run Server

```bash
# Development mode with auto-reload
npm run dev

# Production build
npm run build
npm start
```

Server will run on `http://localhost:3001`

## 📡 API Endpoints

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

### Tickets
- `GET /api/tickets` - Get all tickets
- `POST /api/tickets` - Create new ticket
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket

### Subscriptions
- `GET /api/subscriptions` - Get all subscriptions
- `POST /api/subscriptions` - Create new subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Delete subscription

### Maintenance
- `GET /api/maintenance` - Get all maintenance records
- `POST /api/maintenance` - Create new maintenance record
- `PUT /api/maintenance/:id` - Update maintenance record
- `DELETE /api/maintenance/:id` - Delete maintenance record

### Users
- `GET /api/users` - Get all users (supports ?username=xxx filter)
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Incidents
- `GET /api/incidents` - Get all incidents
- `POST /api/incidents` - Create new incident
- `PUT /api/incidents/:id` - Update incident
- `DELETE /api/incidents/:id` - Delete incident

### Health Check
- `GET /api/health` - Check API and database health

## 🗄️ Database

This backend connects to an Oracle Database. See the `oracle/migrations` folder in the root directory for database schema and setup scripts.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express 5
- **Database**: Oracle Database 19c
- **Language**: TypeScript
- **Database Driver**: oracledb

## 📁 Project Structure

```
backend/
├── src/
│   ├── server.ts          # Main Express server
│   └── utils/
│       └── oracle.ts      # Oracle database utilities
├── package.json
├── tsconfig.json
├── requirements.txt       # System dependencies
└── README.md
```
