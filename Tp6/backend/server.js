const express = require('express');
const mongoose = require('mongoose');
const { createClient } = require('redis');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Habilitar CORS y parseo de JSON
app.use(cors());
app.use(express.json());

// Definición del esquema de MongoDB
const airportSchema = new mongoose.Schema({
  iata_code: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true }
});

const Airport = mongoose.model('Airport', airportSchema);

// Inicialización de clientes de Redis
const redisGeoClient = createClient({ url: process.env.REDIS_GEO_URL || 'redis://localhost:6379' });
const redisPopClient = createClient({ url: process.env.REDIS_POP_URL || 'redis://localhost:6380' });

redisGeoClient.on('error', (err) => console.error('Redis Geo Client Error:', err));
redisPopClient.on('error', (err) => console.error('Redis Pop Client Error:', err));

// Script de carga inicial de datos
async function runInitialLoad() {
  try {
    const count = await Airport.countDocuments();
    if (count > 0) {
      console.log('MongoDB already has data. Skipping initial load.');
      return;
    }

    console.log('MongoDB is empty. Starting initial data load from data_trasport.json...');
    const filePath = path.join(__dirname, 'data_trasport.json');

    if (!fs.existsSync(filePath)) {
      console.warn('Warning: data_trasport.json not found, skipping initial data load.');
      return;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Convert multiline JSON objects sequence into a valid JSON array
    const trimmedContent = fileContent.trim();
    const jsonArrayString = '[' + trimmedContent.replace(/}\s*{/g, '},{') + ']';
    
    let rawAirports;
    try {
      rawAirports = JSON.parse(jsonArrayString);
    } catch (parseErr) {
      console.error('Failed to parse data_trasport.json as JSON array:', parseErr.message);
      return;
    }

    const airportsToInsert = [];
    const seenIata = new Set();

    for (const airportObj of rawAirports) {
      const iata = (airportObj.iata_faa || '').trim().toUpperCase();
      const lat = airportObj.lat !== undefined ? airportObj.lat : airportObj.latitude;
      const lng = airportObj.lng !== undefined ? airportObj.lng : airportObj.longitude;
      const name = (airportObj.name || 'Unknown').trim();
      
      if (iata && iata.length === 3 && iata !== '\\N' && lat !== undefined && lng !== undefined) {
        if (seenIata.has(iata)) {
          continue; // Prevent duplicates in seed data
        }
        seenIata.add(iata);

        // Extract city and country
        let country = 'Unknown';
        let city = 'Unknown';
        if (airportObj.city) {
          const parts = airportObj.city.split(',');
          if (parts.length > 1) {
            country = parts[parts.length - 1].trim();
            city = parts.slice(0, -1).join(',').trim();
          } else {
            city = airportObj.city.trim();
          }
        }

        airportsToInsert.push({
          iata_code: iata,
          name: name,
          city: city,
          country: country,
          latitude: Number(lat),
          longitude: Number(lng)
        });
      }
    }

    if (airportsToInsert.length > 0) {
      // 1. Insert in MongoDB
      await Airport.insertMany(airportsToInsert);
      console.log(`Successfully loaded ${airportsToInsert.length} airports into MongoDB.`);

      // 2. Add to Redis-Geo
      const geoMembers = airportsToInsert.map(a => ({
        longitude: a.longitude,
        latitude: a.latitude,
        member: a.iata_code
      }));
      await redisGeoClient.geoAdd('airports:geo', geoMembers);
      console.log('Successfully added coordinates to Redis-Geo.');

      // 3. Clear redis-pop popularity sorted set
      await redisPopClient.del('airport:popularity');
      console.log('Cleared redis-pop popularity sorted set.');
    } else {
      console.warn('No valid airports found to insert.');
    }
  } catch (error) {
    console.error('Error in initial load script:', error);
  }
}

// ENDPOINTS REST

// 1. GET /airports/popular - Obtener los aeropuertos más visitados
app.get('/airports/popular', async (req, res) => {
  try {
    // Retrieve all entries with scores sorted from high to low using raw ZREVRANGE command
    const rawPopular = await redisPopClient.sendCommand(['ZREVRANGE', 'airport:popularity', '0', '-1', 'WITHSCORES']);
    
    const popularList = [];
    for (let i = 0; i < rawPopular.length; i += 2) {
      popularList.push({
        iata_code: rawPopular[i],
        visits: parseInt(rawPopular[i + 1], 10)
      });
    }

    // Enriquecer la lista con los detalles de MongoDB
    const detailedPopular = [];
    for (const item of popularList) {
      const airportObj = await Airport.findOne({ iata_code: item.iata_code });
      if (airportObj) {
        detailedPopular.push({
          ...airportObj.toObject(),
          visits: item.visits
        });
      }
    }

    res.json(detailedPopular);
  } catch (error) {
    console.error('Error fetching popular airports:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. GET /airports/nearby - Buscar aeropuertos cercanos
app.get('/airports/nearby', async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng || !radius) {
      return res.status(400).json({ error: 'lat, lng, and radius are required' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusVal = parseFloat(radius);

    // Llamar a GEORADIUS a través del cliente de redis-geo
    const rawResults = await redisGeoClient.sendCommand([
      'GEORADIUS',
      'airports:geo',
      longitude.toString(),
      latitude.toString(),
      radiusVal.toString(),
      'km',
      'WITHDIST',
      'ASC'
    ]);

    const parsedNearby = rawResults.map(item => ({
      iata_code: item[0],
      distance: parseFloat(item[1])
    }));

    const enrichedNearby = [];
    for (const item of parsedNearby) {
      const airportObj = await Airport.findOne({ iata_code: item.iata_code });
      if (airportObj) {
        enrichedNearby.push({
          ...airportObj.toObject(),
          distance: item.distance
        });
      }
    }

    res.json(enrichedNearby);
  } catch (error) {
    console.error('Error finding nearby airports:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. POST /airports - Crear aeropuerto
app.post('/airports', async (req, res) => {
  try {
    const { iata_code, name, city, country, latitude, longitude } = req.body;
    if (!iata_code || !name || !city || !country || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'All fields (iata_code, name, city, country, latitude, longitude) are required' });
    }

    const iata = iata_code.toUpperCase();

    // Verificar si ya existe
    const existing = await Airport.findOne({ iata_code: iata });
    if (existing) {
      return res.status(400).json({ error: `Airport with IATA code ${iata} already exists.` });
    }

    const airport = new Airport({
      iata_code: iata,
      name,
      city,
      country,
      latitude: Number(latitude),
      longitude: Number(longitude)
    });

    await airport.save();

    // Agregar a redis-geo
    await redisGeoClient.geoAdd('airports:geo', {
      longitude: Number(longitude),
      latitude: Number(latitude),
      member: iata
    });

    res.status(201).json(airport);
  } catch (error) {
    console.error('Error creating airport:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. GET /airports - Listar todos los aeropuertos
app.get('/airports', async (req, res) => {
  try {
    const airports = await Airport.find({});
    res.json(airports);
  } catch (error) {
    console.error('Error listing airports:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. GET /airports/:iata_code - Obtener un único aeropuerto (incrementa las visitas en redis-pop)
app.get('/airports/:iata_code', async (req, res) => {
  try {
    const iata = req.params.iata_code.toUpperCase();
    const airport = await Airport.findOne({ iata_code: iata });
    if (!airport) {
      return res.status(404).json({ error: `Airport with IATA code ${iata} not found` });
    }

    // Incrementar la popularidad en redis-pop
    const newVisits = await redisPopClient.zIncrBy('airport:popularity', 1, iata);
    // Establecer una expiración (EXPIRE) de 86400 segundos (1 día) en la clave
    await redisPopClient.expire('airport:popularity', 86400);

    res.json({
      airport,
      visits: parseInt(newVisits, 10)
    });
  } catch (error) {
    console.error(`Error fetching airport ${req.params.iata_code}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// 6. PUT /airports/:iata_code - Actualizar aeropuerto
app.put('/airports/:iata_code', async (req, res) => {
  try {
    const iata = req.params.iata_code.toUpperCase();
    const { name, city, country, latitude, longitude } = req.body;

    const airport = await Airport.findOne({ iata_code: iata });
    if (!airport) {
      return res.status(404).json({ error: `Airport with IATA code ${iata} not found` });
    }

    if (name) airport.name = name;
    if (city) airport.city = city;
    if (country) airport.country = country;
    
    let geoNeedsUpdate = false;
    if (latitude !== undefined) {
      airport.latitude = Number(latitude);
      geoNeedsUpdate = true;
    }
    if (longitude !== undefined) {
      airport.longitude = Number(longitude);
      geoNeedsUpdate = true;
    }

    await airport.save();

    // Sincronizar el índice geoespacial si las coordenadas cambiaron
    if (geoNeedsUpdate) {
      await redisGeoClient.geoAdd('airports:geo', {
        longitude: Number(airport.longitude),
        latitude: Number(airport.latitude),
        member: iata
      });
    }

    res.json(airport);
  } catch (error) {
    console.error(`Error updating airport ${req.params.iata_code}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// 7. DELETE /airports/:iata_code - Eliminar aeropuerto
app.delete('/airports/:iata_code', async (req, res) => {
  try {
    const iata = req.params.iata_code.toUpperCase();
    const deletedAirport = await Airport.findOneAndDelete({ iata_code: iata });
    if (!deletedAirport) {
      return res.status(404).json({ error: `Airport with IATA code ${iata} not found` });
    }

    // Eliminar de redis-geo (los índices GEO son sorted sets internamente, por lo que ZREM funciona)
    await redisGeoClient.zRem('airports:geo', iata);

    // Eliminar del sorted set de popularidad en redis-pop
    await redisPopClient.zRem('airport:popularity', iata);

    res.json({ message: `Airport ${iata} successfully deleted from databases` });
  } catch (error) {
    console.error(`Error deleting airport ${req.params.iata_code}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Manejadores de conexión a la base de datos y al servidor
async function initializeApp() {
  console.log('Initializing connection to MongoDB...');
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/airports_db');
    console.log('MongoDB connected successfully.');
  } catch (err) {
    console.error('Failed to connect to MongoDB, exiting.', err);
    process.exit(1);
  }

  console.log('Connecting to Redis-Geo...');
  try {
    await redisGeoClient.connect();
    console.log('Connected to Redis-Geo.');
  } catch (err) {
    console.error('Failed to connect to Redis-Geo, exiting.', err);
    process.exit(1);
  }

  console.log('Connecting to Redis-Pop...');
  try {
    await redisPopClient.connect();
    console.log('Connected to Redis-Pop.');
  } catch (err) {
    console.error('Failed to connect to Redis-Pop, exiting.', err);
    process.exit(1);
  }

  // Ejecutar la carga inicial de datos
  await runInitialLoad();

  app.listen(PORT, () => {
    console.log(`Backend Express server listening on port ${PORT}`);
  });
}

initializeApp();
