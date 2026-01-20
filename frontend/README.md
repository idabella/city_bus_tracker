# City Bus Tracker - Frontend

React + TypeScript frontend application for the City Bus Tracker system.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Backend API running on port 3001

### Installation

```bash
# Install dependencies
npm install

# Configure environment (optional)
cp .env.example .env
# Edit .env if backend is on different URL
```

### Run Development Server

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## 🛠️ Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   │   ├── Cities.tsx
│   │   ├── Stations.tsx
│   │   ├── BusLines.tsx
│   │   ├── Buses.tsx
│   │   ├── Drivers.tsx
│   │   ├── Trips.tsx
│   │   ├── Tickets.tsx
│   │   ├── Subscriptions.tsx
│   │   ├── Maintenance.tsx
│   │   ├── Users.tsx
│   │   └── Incidents.tsx
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   │   └── api.ts       # API client
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## 🔌 API Integration

The frontend communicates with the backend API at `http://localhost:3001/api` by default.

To change the API URL, create a `.env` file:

```env
VITE_API_URL=http://your-backend-url/api
```

## 📱 Features

- **Dashboard**: Overview of bus operations
- **Fleet Management**: Manage buses and their status
- **Driver Management**: Track drivers and schedules
- **Route Planning**: Configure bus lines and stations
- **Ticketing**: Manage tickets and subscriptions
- **Maintenance**: Track bus maintenance records
- **Incidents**: Report and manage incidents
- **User Management**: Manage system users and roles
- **Analytics**: View charts and statistics

## 🎨 Styling

This project uses Tailwind CSS for styling. The configuration can be found in `tailwind.config.js`.

## 🧪 Development

```bash
# Run dev server
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Build
npm run build

# Preview production build
npm run preview
```
