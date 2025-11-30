-- Create USERS table for authentication
CREATE TABLE users (
  id_user NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username VARCHAR2(50) UNIQUE NOT NULL,
  password VARCHAR2(255) NOT NULL,  -- In production, this should store hashed passwords
  display_name VARCHAR2(100) NOT NULL,
  email VARCHAR2(100),
  phone VARCHAR2(20),
  role VARCHAR2(50) DEFAULT 'role_consultation' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on username for faster lookups
CREATE INDEX idx_users_username ON users(username);

-- Insert a default admin user for testing
-- Password is 'admin123' (in production, this should be hashed!)
INSERT INTO users (username, password, display_name, email, role) 
VALUES ('admin', 'admin123', 'Administrator', 'admin@busmanager.com', 'role_administrateur');

-- Insert a test gestionnaire user
INSERT INTO users (username, password, display_name, email, role) 
VALUES ('gestionnaire', 'gest123', 'Gestionnaire Test', 'gest@busmanager.com', 'role_gestionnaire');

-- Insert a test driver user
INSERT INTO users (username, password, display_name, email, role) 
VALUES ('chauffeur', 'driver123', 'Chauffeur Test', 'driver@busmanager.com', 'role_chauffeur_consultation');

COMMIT;

-- Verify the users were created
SELECT id_user, username, display_name, role FROM users;
