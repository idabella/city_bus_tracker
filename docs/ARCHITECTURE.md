# City Bus Tracker - Architecture Overview

## System Architecture

The City Bus Tracker is built using a **three-tier architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                      │
│                    (React + TypeScript)                      │
│                      Port: 5173                              │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/REST API
┌───────────────────────────▼─────────────────────────────────┐
│                      Application Layer                       │
│                    (Express + TypeScript)                    │
│                      Port: 3001                              │
└───────────────────────────┬─────────────────────────────────┘
                            │ Oracle Client
┌───────────────────────────▼─────────────────────────────────┐
│                        Data Layer                            │
│                    (Oracle Database 19c)                     │
│                      Port: 1521                              │
└─────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### Frontend (Presentation Layer)

**Technology**: React 19 + TypeScript + Vite

**Key Components**:
- **Pages**: 11 main pages (Cities, Stations, Bus Lines, Buses, Drivers, Trips, Tickets, Subscriptions, Maintenance, Users, Incidents)
- **Components**: Reusable UI components (forms, tables, modals, charts)
- **Context**: Global state management for authentication and app state
- **Hooks**: Custom React hooks for data fetching and state management
- **Utils**: API client for backend communication

**Styling**: Tailwind CSS with custom design system

**Routing**: React Router v7 for client-side navigation

### Backend (Application Layer)

**Technology**: Express 5 + TypeScript + Node.js

**Key Features**:
- **RESTful API**: CRUD operations for all entities
- **Oracle Integration**: Database connection via oracledb driver
- **Error Handling**: Centralized error handling and logging
- **CORS**: Configured for frontend communication
- **Validation**: Input validation and sanitization

**API Structure**:
```
/api
├── /cities
├── /stations
├── /bus_lines
├── /buses
├── /drivers
├── /trips
├── /tickets
├── /subscriptions
├── /maintenance
├── /users
├── /incidents
└── /health
```

### Database (Data Layer)

**Technology**: Oracle Database 19c

**Schema Design**:
- **13 Tables**: Normalized relational database design
- **50+ Procedures**: Business logic encapsulation
- **14 Functions**: Reusable calculations and validations
- **6 Triggers**: Automated data management
- **RBAC**: 6 roles with granular permissions

**Key Relationships**:
```
CITIES ──┐
         ├─→ STATIONS ──→ BUS_LINES ──→ TRIPS
         │                    │           │
DRIVERS ─┘                    │           ├─→ TICKETS
                              │           │
BUSES ───────────────────────┘           └─→ INCIDENTS
   │
   └─→ MAINTENANCE
```

## Data Flow

### Example: Creating a New Trip

1. **User Action**: User fills out trip form in frontend
2. **Frontend**: Validates input and sends POST request to `/api/trips`
3. **Backend**: 
   - Receives request
   - Validates data
   - Calls Oracle procedure `manage_trip()`
4. **Database**:
   - Executes stored procedure
   - Validates business rules (bus availability, driver schedule)
   - Inserts trip record
   - Returns result
5. **Backend**: Sends response to frontend
6. **Frontend**: Updates UI with new trip data

## Security

### Authentication & Authorization
- Role-based access control (RBAC)
- 6 user roles with different permissions
- Database-level security with Oracle roles

### Data Protection
- Environment variables for sensitive data
- SQL injection prevention via parameterized queries
- Input validation and sanitization

## Scalability Considerations

### Current Architecture
- Monolithic backend (single Express server)
- Direct database connections
- Client-side rendering

### Future Enhancements
- **Microservices**: Split backend into separate services
- **Caching**: Redis for frequently accessed data
- **Load Balancing**: Multiple backend instances
- **CDN**: Static asset delivery
- **Database Replication**: Read replicas for scalability

## Development Workflow

```
Developer
    │
    ├─→ Frontend Development
    │   ├─ Edit React components
    │   ├─ Vite hot reload
    │   └─ Test in browser
    │
    └─→ Backend Development
        ├─ Edit Express routes
        ├─ tsx auto-restart
        └─ Test with API client
```

## Deployment Architecture

### Development
- Frontend: Vite dev server (port 5173)
- Backend: tsx dev server (port 3001)
- Database: Local Oracle instance

### Production (Recommended)
- Frontend: Static files served by Nginx/Apache
- Backend: PM2 process manager with clustering
- Database: Oracle Database Enterprise Edition
- Reverse Proxy: Nginx for SSL termination and load balancing

## Technology Choices

### Why React?
- Component-based architecture
- Large ecosystem and community
- Excellent TypeScript support
- Virtual DOM for performance

### Why Express?
- Lightweight and flexible
- Excellent middleware ecosystem
- Easy to integrate with Oracle
- TypeScript support

### Why Oracle Database?
- Enterprise-grade reliability
- Advanced features (procedures, functions, triggers)
- Excellent performance for complex queries
- Strong ACID compliance

### Why TypeScript?
- Type safety reduces bugs
- Better IDE support
- Improved code documentation
- Easier refactoring
