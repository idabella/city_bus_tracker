export interface City {
  id: string;
  name: string;
  country: string;
  created_at?: string;
}

export interface Station {
  id: string;
  name: string;
  city_id: string;
  city?: City;
  address: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
}

export interface BusLine {
  id: string;
  name: string;
  code: string;
  origin_station_id: string;
  destination_station_id: string;
  origin_station?: Station;
  destination_station?: Station;
  distance_km: number;
  duration_minutes: number;
  status: 'active' | 'inactive' | 'maintenance';
  created_at?: string;
}

export interface Bus {
  id: string;
  plate_number: string;
  model: string;
  capacity: number;
  year: number;
  status: 'available' | 'in_service' | 'maintenance' | 'retired';
  last_maintenance_date?: string;
  created_at?: string;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  license_number: string;
  license_expiry: string;
  status: 'active' | 'inactive' | 'on_leave';
  created_at?: string;
}

export interface Trip {
  id: string;
  bus_line_id: string;
  bus_line?: BusLine;
  bus_id: string;
  bus?: Bus;
  driver_id: string;
  driver?: Driver;
  departure_time: string;
  arrival_time: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  available_seats: number;
  price: number;
  created_at?: string;
}

export interface Ticket {
  id: string;
  trip_id: string;
  trip?: Trip;
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
  seat_number: string;
  price: number;
  status: 'booked' | 'confirmed' | 'cancelled' | 'used';
  booking_date: string;
  created_at?: string;
}

export interface Subscription {
  id: string;
  user_name: string;
  user_email: string;
  bus_line_id: string;
  bus_line?: BusLine;
  type: 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string;
  price: number;
  status: 'active' | 'expired' | 'cancelled';
  created_at?: string;
}

export interface Maintenance {
  id: string;
  bus_id: string;
  bus?: Bus;
  type: 'routine' | 'repair' | 'inspection';
  description: string;
  scheduled_date: string;
  completed_date?: string;
  cost: number;
  status: 'scheduled' | 'in_progress' | 'completed';
  created_at?: string;
}

export interface Incident {
  id: string;
  trip_id?: string;
  trip?: Trip;
  bus_id: string;
  bus?: Bus;
  driver_id?: string;
  driver?: Driver;
  type: 'accident' | 'breakdown' | 'delay' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  incident_date: string;
  resolved_date?: string;
  status: 'open' | 'investigating' | 'resolved';
  created_at?: string;
}

export interface DashboardStats {
  totalBuses: number;
  activeBuses: number;
  totalTrips: number;
  todayTrips: number;
  totalTickets: number;
  todayRevenue: number;
  openIncidents: number;
  maintenancePending: number;
}
