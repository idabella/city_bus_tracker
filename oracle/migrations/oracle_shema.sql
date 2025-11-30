

-- 2. Créer la table CITIES avec id_city comme clé primaire
CREATE TABLE cities (
  id_city NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR2(100) NOT NULL,
  region VARCHAR2(100) NOT NULL,
  code_postal VARCHAR2(20) NOT NULL,
  country VARCHAR2(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Créer la table STATIONS qui référence id_city
CREATE TABLE stations (
  id_station NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR2(100) NOT NULL,
  city_id NUMBER NOT NULL,  -- ✅ Maintenant c'est un NUMBER
  address VARCHAR2(500) NOT NULL,
  latitude NUMBER(10, 8),
  longitude NUMBER(11, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_stations_city FOREIGN KEY (city_id) 
    REFERENCES cities(id_city) ON DELETE CASCADE  -- ✅ Pointe vers id_city
);

CREATE INDEX idx_stations_city_id ON stations(city_id);

-- 4. Créer la table BUS_LINES qui référence id_station
CREATE TABLE bus_lines (
  id_line NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR2(100) NOT NULL,
  code VARCHAR2(50) UNIQUE NOT NULL,
  origin_station_id NUMBER NOT NULL,
  destination_station_id NUMBER NOT NULL,
  distance_km NUMBER(10, 2) NOT NULL,
  duration_minutes NUMBER NOT NULL,
  status VARCHAR2(20) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lines_origin FOREIGN KEY (origin_station_id) 
    REFERENCES stations(id_station),
  CONSTRAINT fk_lines_destination FOREIGN KEY (destination_station_id) 
    REFERENCES stations(id_station)
);

CREATE INDEX idx_bus_lines_origin ON bus_lines(origin_station_id);
CREATE INDEX idx_bus_lines_destination ON bus_lines(destination_station_id);

-- 5. Créer la table BUSES
CREATE TABLE buses (
  id_bus NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  plate_number VARCHAR2(20) UNIQUE NOT NULL,
  model VARCHAR2(100) NOT NULL,
  capacity NUMBER NOT NULL,
  year NUMBER NOT NULL,
  status VARCHAR2(20) DEFAULT 'available' NOT NULL,
  last_maintenance_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Créer la table DRIVERS
CREATE TABLE drivers (
  id_driver NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR2(100) NOT NULL,
  email VARCHAR2(100) UNIQUE NOT NULL,
  phone VARCHAR2(20) NOT NULL,
  license_number VARCHAR2(50) UNIQUE NOT NULL,
  license_expiry DATE NOT NULL,
  status VARCHAR2(20) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Créer la table TRIPS
CREATE TABLE trips (
  id_trip NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  bus_line_id NUMBER NOT NULL,
  bus_id NUMBER NOT NULL,
  driver_id NUMBER NOT NULL,
  departure_time TIMESTAMP NOT NULL,
  arrival_time TIMESTAMP NOT NULL,
  status VARCHAR2(20) DEFAULT 'scheduled' NOT NULL,
  available_seats NUMBER NOT NULL,
  price NUMBER(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_trips_line FOREIGN KEY (bus_line_id) 
    REFERENCES bus_lines(id_line) ON DELETE CASCADE,
  CONSTRAINT fk_trips_bus FOREIGN KEY (bus_id) 
    REFERENCES buses(id_bus),
  CONSTRAINT fk_trips_driver FOREIGN KEY (driver_id) 
    REFERENCES drivers(id_driver)
);

CREATE INDEX idx_trips_bus_line ON trips(bus_line_id);
CREATE INDEX idx_trips_bus ON trips(bus_id);
CREATE INDEX idx_trips_driver ON trips(driver_id);

-- 8. Créer la table TICKETS
CREATE TABLE tickets (
  id_ticket NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  trip_id NUMBER NOT NULL,
  passenger_name VARCHAR2(100) NOT NULL,
  passenger_phone VARCHAR2(20) NOT NULL,
  seat_number VARCHAR2(10) NOT NULL,
  price NUMBER(10, 2) NOT NULL,
  status VARCHAR2(20) DEFAULT 'booked' NOT NULL,
  booking_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tickets_trip FOREIGN KEY (trip_id) 
    REFERENCES trips(id_trip) ON DELETE CASCADE
);

CREATE INDEX idx_tickets_trip ON tickets(trip_id);

-- 9. Créer la table SUBSCRIPTIONS
CREATE TABLE subscriptions (
  id_subscription NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_name VARCHAR2(100) NOT NULL,
  user_email VARCHAR2(100) NOT NULL,
  bus_line_id NUMBER NOT NULL,
  type VARCHAR2(20) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price NUMBER(10, 2) NOT NULL,
  status VARCHAR2(20) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_subs_line FOREIGN KEY (bus_line_id) 
    REFERENCES bus_lines(id_line) ON DELETE CASCADE
);

CREATE INDEX idx_subscriptions_bus_line ON subscriptions(bus_line_id);

-- 10. Créer la table MAINTENANCE
CREATE TABLE maintenance (
  id_maintenance NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  bus_id NUMBER NOT NULL,
  type VARCHAR2(50) NOT NULL,
  description CLOB NOT NULL,
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  cost NUMBER(10, 2) NOT NULL,
  status VARCHAR2(20) DEFAULT 'scheduled' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_maint_bus FOREIGN KEY (bus_id) 
    REFERENCES buses(id_bus) ON DELETE CASCADE
);

CREATE INDEX idx_maintenance_bus ON maintenance(bus_id);

-- 11. Créer la table INCIDENTS
CREATE TABLE incidents (
  id_incident NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  trip_id NUMBER,
  bus_id NUMBER NOT NULL,
  driver_id NUMBER,
  type VARCHAR2(50) NOT NULL,
  description CLOB NOT NULL,
  severity VARCHAR2(20) NOT NULL,
  incident_date DATE NOT NULL,
  resolved_date DATE,
  status VARCHAR2(20) DEFAULT 'open' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_incidents_trip FOREIGN KEY (trip_id) 
    REFERENCES trips(id_trip) ON DELETE SET NULL,
  CONSTRAINT fk_incidents_bus FOREIGN KEY (bus_id) 
    REFERENCES buses(id_bus) ON DELETE CASCADE,
  CONSTRAINT fk_incidents_driver FOREIGN KEY (driver_id) 
    REFERENCES drivers(id_driver) ON DELETE SET NULL
);

CREATE INDEX idx_incidents_trip ON incidents(trip_id);
CREATE INDEX idx_incidents_bus ON incidents(bus_id);
CREATE INDEX idx_incidents_driver ON incidents(driver_id);

-- 12. Insérer des données de test
-- Insérer quelques villes
INSERT INTO cities (name, region, code_postal, country) 
VALUES ('Casablanca', 'Casablanca-Settat', '20000', 'Morocco');

INSERT INTO cities (name, region, code_postal, country) 
VALUES ('Rabat', 'Rabat-Salé-Kénitra', '10000', 'Morocco');

INSERT INTO cities (name, region, code_postal, country) 
VALUES ('Marrakech', 'Marrakech-Safi', '40000', 'Morocco');

COMMIT;

-- Vérifier les villes créées
SELECT id_city, name, country FROM cities;

-- Maintenant vous pouvez créer des stations!
-- INSERT INTO stations (name, city_id, address, latitude, longitude)
-- VALUES ('Station Central', 1, '123 Main St', 33.5731, -7.5898);