// server.ts
import express from 'express';
import cors from 'cors';
import { oracle } from './utils/oracle.js';

const app = express();
const PORT = 3001;

const parseNumericId = (value: string) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const sanitizeSubscriptionPayload = (body: any) => {
  const {
    user_name,
    user_email,
    bus_line_id,
    type,
    start_date,
    end_date,
    price,
    status,
  } = body || {};

  const payload: Record<string, any> = {};

  if (user_name !== undefined) payload.user_name = user_name;
  if (user_email !== undefined) payload.user_email = user_email;
  if (bus_line_id !== undefined) payload.bus_line_id = bus_line_id;
  if (type !== undefined) payload.type = type;
  if (start_date !== undefined) payload.start_date = start_date;
  if (end_date !== undefined) payload.end_date = end_date;
  if (price !== undefined) payload.price = price;
  if (status !== undefined) payload.status = status;

  return payload;
};

// Middleware
app.use(cors());
app.use(express.json());

// ============ CITIES ROUTES ============

app.get('/api/cities', async (req, res) => {
  try {
    const result = await oracle.select('CITIES', '*');
    if (result.error) throw new Error(result.error);
    res.json({ data: result.data || [], error: null });
  } catch (error: any) {
    console.error('GET /api/cities error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.post('/api/cities', async (req, res) => {
  try {
    const { name, region, code_postal, country } = req.body;
    const result = await oracle.insert('CITIES', {
      name,
      region,
      code_postal,
      country
    });
    if (result.error) throw new Error(result.error);
    res.status(201).json({ data: result.data, error: null });
  } catch (error: any) {
    console.error('POST /api/cities error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.put('/api/cities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, region, code_postal, country } = req.body;

    const result = await oracle.update('CITIES', {
      name,
      region,
      code_postal,
      country
    }, `id_city = ${id}`);

    if (result.error) throw new Error(result.error);
    res.json({ data: result.data, error: null });
  } catch (error: any) {
    console.error('PUT /api/cities error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.delete('/api/cities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await oracle.delete('CITIES', `id_city = ${id}`);
    if (result.error) throw new Error(result.error);
    res.json({ data: { success: true }, error: null });
  } catch (error: any) {
    console.error('DELETE /api/cities error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

// ============ STATIONS ROUTES ============

app.get('/api/stations', async (req, res) => {
  try {
    const result = await oracle.select('STATIONS', '*');
    if (result.error) throw new Error(result.error);
    res.json({ data: result.data || [], error: null });
  } catch (error: any) {
    console.error('GET /api/stations error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.post('/api/stations', async (req, res) => {
  try {
    const result = await oracle.insert('STATIONS', req.body);
    if (result.error) throw new Error(result.error);
    res.status(201).json({ data: result.data, error: null });
  } catch (error: any) {
    console.error('POST /api/stations error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.put('/api/stations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // ✅ Correction: utiliser id_station au lieu de id
    const result = await oracle.update('STATIONS', req.body, `id_station = ${id}`);
    if (result.error) throw new Error(result.error);
    res.json({ data: result.data, error: null });
  } catch (error: any) {
    console.error('PUT /api/stations error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.delete('/api/stations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // ✅ Correction: utiliser id_station au lieu de id
    const result = await oracle.delete('STATIONS', `id_station = ${id}`);
    if (result.error) throw new Error(result.error);
    res.json({ data: { success: true }, error: null });
  } catch (error: any) {
    console.error('DELETE /api/stations error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

// ============ BUS_LINES ROUTES ============

app.get('/api/bus_lines', async (req, res) => {
  try {
    const result = await oracle.select('BUS_LINES', '*');
    if (result.error) throw new Error(result.error);
    res.json({ data: result.data || [], error: null });
  } catch (error: any) {
    console.error('GET /api/bus_lines error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.post('/api/bus_lines', async (req, res) => {
  try {
    const result = await oracle.insert('BUS_LINES', req.body);
    if (result.error) throw new Error(result.error);
    res.status(201).json({ data: result.data, error: null });
  } catch (error: any) {
    console.error('POST /api/bus_lines error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.put('/api/bus_lines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNumber = parseNumericId(id);
    if (idNumber === null) {
      return res.status(400).json({ data: null, error: 'Invalid bus line id' });
    }
    const result = await oracle.update('BUS_LINES', req.body, `id_line = ${idNumber}`);
    if (result.error) throw new Error(result.error);
    res.json({ data: result.data, error: null });
  } catch (error: any) {
    console.error('PUT /api/bus_lines error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.delete('/api/bus_lines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNumber = parseNumericId(id);
    if (idNumber === null) {
      return res.status(400).json({ data: null, error: 'Invalid bus line id' });
    }
    const result = await oracle.delete('BUS_LINES', `id_line = ${idNumber}`);
    if (result.error) throw new Error(result.error);
    res.json({ data: { success: true }, error: null });
  } catch (error: any) {
    console.error('DELETE /api/bus_lines error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

// ============ BUSES ROUTES ============

app.get('/api/buses', async (req, res) => {
  try {
    const result = await oracle.select('BUSES', '*');
    if (result.error) throw new Error(result.error);
    res.json({ data: result.data || [], error: null });
  } catch (error: any) {
    console.error('GET /api/buses error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.post('/api/buses', async (req, res) => {
  try {
    const result = await oracle.insert('BUSES', req.body);
    if (result.error) throw new Error(result.error);
    res.status(201).json({ data: result.data, error: null });
  } catch (error: any) {
    console.error('POST /api/buses error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.put('/api/buses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNumber = parseNumericId(id);
    if (idNumber === null) {
      return res.status(400).json({ data: null, error: 'Invalid bus id' });
    }
    const result = await oracle.update('BUSES', req.body, `id_bus = ${idNumber}`);
    if (result.error) throw new Error(result.error);
    res.json({ data: result.data, error: null });
  } catch (error: any) {
    console.error('PUT /api/buses error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.delete('/api/buses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNumber = parseNumericId(id);
    if (idNumber === null) {
      return res.status(400).json({ data: null, error: 'Invalid bus id' });
    }
    const result = await oracle.delete('BUSES', `id_bus = ${idNumber}`);
    if (result.error) throw new Error(result.error);
    res.json({ data: { success: true }, error: null });
  } catch (error: any) {
    console.error('DELETE /api/buses error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

// ============ DRIVERS ROUTES ============

app.get('/api/drivers', async (req, res) => {
  try {
    const result = await oracle.select('DRIVERS', '*');
    if (result.error) throw new Error(result.error);
    res.json({ data: result.data || [], error: null });
  } catch (error: any) {
    console.error('GET /api/drivers error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.post('/api/drivers', async (req, res) => {
  try {
    const result = await oracle.insert('DRIVERS', req.body);
    if (result.error) throw new Error(result.error);
    res.status(201).json({ data: result.data, error: null });
  } catch (error: any) {
    console.error('POST /api/drivers error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.put('/api/drivers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNumber = parseNumericId(id);
    if (idNumber === null) {
      return res.status(400).json({ data: null, error: 'Invalid driver id' });
    }
    const result = await oracle.update('DRIVERS', req.body, `id_driver = ${idNumber}`);
    if (result.error) throw new Error(result.error);
    res.json({ data: result.data, error: null });
  } catch (error: any) {
    console.error('PUT /api/drivers error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.delete('/api/drivers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNumber = parseNumericId(id);
    if (idNumber === null) {
      return res.status(400).json({ data: null, error: 'Invalid driver id' });
    }
    const result = await oracle.delete('DRIVERS', `id_driver = ${idNumber}`);
    if (result.error) throw new Error(result.error);
    res.json({ data: { success: true }, error: null });
  } catch (error: any) {
    console.error('DELETE /api/drivers error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

// ============ TRIPS ROUTES ============

app.get('/api/trips', async (req, res) => {
  try {
    const result = await oracle.select('TRIPS', '*');
    if (result.error) throw new Error(result.error);
    res.json({ data: result.data || [], error: null });
  } catch (error: any) {
    console.error('GET /api/trips error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.post('/api/trips', async (req, res) => {
  try {
    const result = await oracle.insert('TRIPS', req.body);
    if (result.error) throw new Error(result.error);
    res.status(201).json({ data: result.data, error: null });
  } catch (error: any) {
    console.error('POST /api/trips error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.put('/api/trips/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNumber = parseNumericId(id);
    if (idNumber === null) {
      return res.status(400).json({ data: null, error: 'Invalid trip id' });
    }
    const result = await oracle.update('TRIPS', req.body, `id_trip = ${idNumber}`);
    if (result.error) throw new Error(result.error);
    res.json({ data: result.data, error: null });
  } catch (error: any) {
    console.error('PUT /api/trips error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.delete('/api/trips/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNumber = parseNumericId(id);
    if (idNumber === null) {
      return res.status(400).json({ data: null, error: 'Invalid trip id' });
    }
    const result = await oracle.delete('TRIPS', `id_trip = ${idNumber}`);
    if (result.error) throw new Error(result.error);
    res.json({ data: { success: true }, error: null });
  } catch (error: any) {
    console.error('DELETE /api/trips error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

// ============ TICKETS ROUTES ============

app.get('/api/tickets', async (req, res) => {
  try {
    const result = await oracle.select('TICKETS', '*');
    if (result.error) throw new Error(result.error);
    res.json({ data: result.data || [], error: null });
  } catch (error: any) {
    console.error('GET /api/tickets error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.post('/api/tickets', async (req, res) => {
  try {
    const result = await oracle.insert('TICKETS', req.body);
    if (result.error) throw new Error(result.error);
    res.status(201).json({ data: result.data, error: null });
  } catch (error: any) {
    console.error('POST /api/tickets error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.put('/api/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNumber = parseNumericId(id);
    if (idNumber === null) {
      return res.status(400).json({ data: null, error: 'Invalid ticket id' });
    }
    const result = await oracle.update('TICKETS', req.body, `id_ticket = ${idNumber}`);
    if (result.error) throw new Error(result.error);
    res.json({ data: result.data, error: null });
  } catch (error: any) {
    console.error('PUT /api/tickets error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.delete('/api/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNumber = parseNumericId(id);
    if (idNumber === null) {
      return res.status(400).json({ data: null, error: 'Invalid ticket id' });
    }
    const result = await oracle.delete('TICKETS', `id_ticket = ${idNumber}`);
    if (result.error) throw new Error(result.error);
    res.json({ data: { success: true }, error: null });
  } catch (error: any) {
    console.error('DELETE /api/tickets error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

// ============ SUBSCRIPTIONS ROUTES ============

app.get('/api/subscriptions', async (req, res) => {
  try {
    const result = await oracle.select('SUBSCRIPTIONS', '*');
    if (result.error) throw new Error(result.error);
    res.json({ data: result.data || [], error: null });
  } catch (error: any) {
    console.error('GET /api/subscriptions error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.post('/api/subscriptions', async (req, res) => {
  try {
    const payload = sanitizeSubscriptionPayload(req.body);
    const result = await oracle.insert('SUBSCRIPTIONS', payload);
    if (result.error) throw new Error(result.error);
    res.status(201).json({ data: result.data, error: null });
  } catch (error: any) {
    console.error('POST /api/subscriptions error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.put('/api/subscriptions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNumber = parseNumericId(id);
    if (idNumber === null) {
      return res.status(400).json({ data: null, error: 'Invalid subscription id' });
    }
    const payload = sanitizeSubscriptionPayload(req.body);
    const result = await oracle.update('SUBSCRIPTIONS', payload, `id_subscription = ${idNumber}`);
    if (result.error) throw new Error(result.error);
    res.json({ data: result.data, error: null });
  } catch (error: any) {
    console.error('PUT /api/subscriptions error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.delete('/api/subscriptions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNumber = parseNumericId(id);
    if (idNumber === null) {
      return res.status(400).json({ data: null, error: 'Invalid subscription id' });
    }
    const result = await oracle.delete('SUBSCRIPTIONS', `id_subscription = ${idNumber}`);
    if (result.error) throw new Error(result.error);
    res.json({ data: { success: true }, error: null });
  } catch (error: any) {
    console.error('DELETE /api/subscriptions error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

// ============ MAINTENANCE ROUTES ============

app.get('/api/maintenance', async (req, res) => {
  try {
    const result = await oracle.select('MAINTENANCE', '*');
    if (result.error) throw new Error(result.error);
    res.json({ data: result.data || [], error: null });
  } catch (error: any) {
    console.error('GET /api/maintenance error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.post('/api/maintenance', async (req, res) => {
  try {
    const result = await oracle.insert('MAINTENANCE', req.body);
    if (result.error) throw new Error(result.error);
    res.status(201).json({ data: result.data, error: null });
  } catch (error: any) {
    console.error('POST /api/maintenance error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.put('/api/maintenance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNumber = parseNumericId(id);
    if (idNumber === null) {
      return res.status(400).json({ data: null, error: 'Invalid maintenance id' });
    }
    const result = await oracle.update('MAINTENANCE', req.body, `id_maintenance = ${idNumber}`);
    if (result.error) throw new Error(result.error);
    res.json({ data: result.data, error: null });
  } catch (error: any) {
    console.error('PUT /api/maintenance error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.delete('/api/maintenance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNumber = parseNumericId(id);
    if (idNumber === null) {
      return res.status(400).json({ data: null, error: 'Invalid maintenance id' });
    }
    const result = await oracle.delete('MAINTENANCE', `id_maintenance = ${idNumber}`);
    if (result.error) throw new Error(result.error);
    res.json({ data: { success: true }, error: null });
  } catch (error: any) {
    console.error('DELETE /api/maintenance error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

// ============ USERS ROUTES ============

app.get('/api/users', async (req, res) => {
  try {
    const { username } = req.query;
    let result;

    if (username) {
      // Filter by username if provided
      result = await oracle.select('USERS', '*', `username = '${username}'`);
    } else {
      // Get all users
      result = await oracle.select('USERS', '*');
    }

    if (result.error) throw new Error(result.error);
    res.json({ data: result.data || [], error: null });
  } catch (error: any) {
    console.error('GET /api/users error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const result = await oracle.insert('USERS', req.body);
    if (result.error) throw new Error(result.error);
    res.status(201).json({ data: result.data, error: null });
  } catch (error: any) {
    console.error('POST /api/users error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNumber = parseNumericId(id);
    if (idNumber === null) {
      return res.status(400).json({ data: null, error: 'Invalid user id' });
    }
    const result = await oracle.update('USERS', req.body, `id_user = ${idNumber}`);
    if (result.error) throw new Error(result.error);
    res.json({ data: result.data, error: null });
  } catch (error: any) {
    console.error('PUT /api/users error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNumber = parseNumericId(id);
    if (idNumber === null) {
      return res.status(400).json({ data: null, error: 'Invalid user id' });
    }
    const result = await oracle.delete('USERS', `id_user = ${idNumber}`);
    if (result.error) throw new Error(result.error);
    res.json({ data: { success: true }, error: null });
  } catch (error: any) {
    console.error('DELETE /api/users error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

// ============ INCIDENTS ROUTES ============

app.get('/api/incidents', async (req, res) => {
  try {
    const result = await oracle.select('INCIDENTS', '*');
    if (result.error) throw new Error(result.error);
    res.json({ data: result.data || [], error: null });
  } catch (error: any) {
    console.error('GET /api/incidents error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.post('/api/incidents', async (req, res) => {
  try {
    const result = await oracle.insert('INCIDENTS', req.body);
    if (result.error) throw new Error(result.error);
    res.status(201).json({ data: result.data, error: null });
  } catch (error: any) {
    console.error('POST /api/incidents error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.put('/api/incidents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNumber = parseNumericId(id);
    if (idNumber === null) {
      return res.status(400).json({ data: null, error: 'Invalid incident id' });
    }
    const result = await oracle.update('INCIDENTS', req.body, `id_incident = ${idNumber}`);
    if (result.error) throw new Error(result.error);
    res.json({ data: result.data, error: null });
  } catch (error: any) {
    console.error('PUT /api/incidents error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.delete('/api/incidents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idNumber = parseNumericId(id);
    if (idNumber === null) {
      return res.status(400).json({ data: null, error: 'Invalid incident id' });
    }
    const result = await oracle.delete('INCIDENTS', `id_incident = ${idNumber}`);
    if (result.error) throw new Error(result.error);
    res.json({ data: { success: true }, error: null });
  } catch (error: any) {
    console.error('DELETE /api/incidents error:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

// ============ HEALTH CHECK ============

app.get('/api/health', async (req, res) => {
  try {
    const result = await oracle.testConnection();
    res.json({
      status: result.success ? 'healthy' : 'unhealthy',
      database: 'Oracle',
      error: result.error
    });
  } catch (error: any) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`✅ Routes configured:`);
  console.log(`   - /api/users`);
  console.log(`   - /api/cities`);
  console.log(`   - /api/stations`);
  console.log(`   - /api/bus_lines`);
  console.log(`   - /api/buses`);
  console.log(`   - /api/drivers`);
  console.log(`   - /api/trips`);
  console.log(`   - /api/tickets`);
  console.log(`   - /api/subscriptions`);
  console.log(`   - /api/maintenance`);
  console.log(`   - /api/incidents`);
});