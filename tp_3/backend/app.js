const redis = require('redis');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Conexión a Redis v4 (Promises)
const redisClient = redis.createClient({
    url: 'redis://db-turismo:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Lista de grupos válidos según consigna
const validGroups = [
    'cervecerias',
    'universidades',
    'farmacias',
    'emergencias',
    'supermercados'
];

async function startServer() {
    await redisClient.connect();
    console.log("Conectado a Redis exitosamente");

    // Endpoint para agregar lugar
    app.post('/api/places', async (req, res) => {
        try {
            const { group, name, lat, lng } = req.body;
            if (!validGroups.includes(group)) {
                return res.status(400).json({ error: 'Grupo inválido' });
            }
            if (!name || isNaN(lat) || isNaN(lng)) {
                return res.status(400).json({ error: 'Datos incompletos' });
            }

            // Agrega el punto (longitud, luego latitud)
            await redisClient.geoAdd(group, {
                longitude: parseFloat(lng),
                latitude: parseFloat(lat),
                member: name
            });

            res.json({ success: true, message: 'Lugar agregado correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error del servidor' });
        }
    });

    // Endpoint para obtener lugares cercanos a 5km
    app.get('/api/places/nearby', async (req, res) => {
        try {
            const { lat, lng } = req.query;
            if (isNaN(lat) || isNaN(lng)) {
                return res.status(400).json({ error: 'Faltan coordenadas del usuario' });
            }

            let allPlaces = [];

            for (const group of validGroups) {
                // geosearch busca miembros en un radio. v4 api
                // usando ANY, BY_RADIUS
                try {
                    const results = await redisClient.geoSearchWith(
                        group,
                        { longitude: parseFloat(lng), latitude: parseFloat(lat) }, // origin
                        { radius: 5, unit: 'km' }, // BY_RADIUS
                        ['WITHDIST'] // options
                    );
                    
                    if (results && results.length > 0) {
                        results.forEach(item => {
                            allPlaces.push({
                                group,
                                name: item.member,
                                distance: item.distance // devuelto por WITHDIST
                            });
                        });
                    }
                } catch (e) {
                    // Si el grupo (key) no existe, tira error o devuelve vacío
                    // ignoramos y seguimos
                }
            }

            // Ordenamos todos de menor a mayor distancia
            allPlaces.sort((a, b) => a.distance - b.distance);

            res.json(allPlaces);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error del servidor' });
        }
    });

    // Endpoint para calcular distancia exacta entre usuario y punto específico
    // Por si es requerido como punto separado
    app.get('/api/places/distance', async (req, res) => {
        try {
             // El usuario quiere saber la distancia a un punto dado (name/group)
             const { userLat, userLng, group, placeName } = req.query;
             if (!userLat || !userLng || !group || !placeName) {
                 return res.status(400).json({ error: 'Faltan parámetros' });
             }

             // Para calcular la distancia usando Redis con la ubicación del usuario, 
             // podemos añadir temporalmente la ubicación del usuario, calcular y eliminar.
             const tempUserMember = "TEMP_USER_LOCATION_" + Date.now();
             await redisClient.geoAdd(group, {
                 longitude: parseFloat(userLng),
                 latitude: parseFloat(userLat),
                 member: tempUserMember
             });

             const distance = await redisClient.geoDist(group, tempUserMember, placeName, 'km');
             
             // Opcionalmente eliminar el punto temporal
             await redisClient.zRem(group, tempUserMember);

             if (distance !== null) {
                 res.json({ name: placeName, group, distance });
             } else {
                 res.status(404).json({ error: 'Lugar no encontrado en la base de datos' });
             }

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error del servidor' });
        }
    });

    app.listen(3002, () => {
        console.log('Servidor backend API Turismo corriendo en puerto 3002');
    });
}

startServer();
