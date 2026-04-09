import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const API_URL = 'http://localhost:3002/api';

const GROUPS = [
  { id: 'cervecerias', label: 'Cervecerías Artesanales' },
  { id: 'universidades', label: 'Universidades' },
  { id: 'farmacias', label: 'Farmacias' },
  { id: 'emergencias', label: 'Centro de Atención de Emergencias' },
  { id: 'supermercados', label: 'Supermercados' }
];

function App() {
  // User Location State
  const [userLat, setUserLat] = useState('-34.6037'); // Default: Buenos Aires
  const [userLng, setUserLng] = useState('-58.3816');
  
  // Add POI State
  const [poiName, setPoiName] = useState('');
  const [poiLat, setPoiLat] = useState('');
  const [poiLng, setPoiLng] = useState('');
  const [poiGroup, setPoiGroup] = useState(GROUPS[0].id);

  // List State
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [loading, setLoading] = useState(false);

  // Selected Place State
  const [selectedPlaceInfo, setSelectedPlaceInfo] = useState(null);

  const fetchNearbyPlaces = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/places/nearby`, {
        params: { lat: userLat, lng: userLng }
      });
      setNearbyPlaces(response.data);
      setSelectedPlaceInfo(null); // Reset selection
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      alert('Error fetching places');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNearbyPlaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLat, userLng]);

  const handleCreatePoi = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/places`, {
        group: poiGroup,
        name: poiName,
        lat: parseFloat(poiLat),
        lng: parseFloat(poiLng)
      });
      alert('Punto de interés agregado correctamente');
      setPoiName('');
      setPoiLat('');
      setPoiLng('');
      // Refresh list
      fetchNearbyPlaces();
    } catch (error) {
      console.error('Error creating place:', error);
      alert('Error al crear el punto');
    }
  };

  const handleSelectPlace = async (place) => {
    try {
      const response = await axios.get(`${API_URL}/places/distance`, {
        params: {
          userLat,
          userLng,
          group: place.group,
          placeName: place.name
        }
      });
      setSelectedPlaceInfo(response.data);
    } catch (error) {
      console.error('Error fetching exact distance:', error);
      alert('Error calculando distancia exacta');
    }
  };

  // Group the flat array into an object mapping group -> array[places]
  const placesByGroup = nearbyPlaces.reduce((acc, place) => {
    if (!acc[place.group]) {
      acc[place.group] = [];
    }
    acc[place.group].push(place);
    return acc;
  }, {});

  return (
    <div className="app-container">
      <h1 className="main-title">Api Turismo Explorer</h1>
      
      <div className="grid-layout">
        <div className="left-column">
          
          <div className="glass-card" style={{ marginBottom: '2rem' }}>
            <h2 className="card-title">🚀 Mi Ubicación</h2>
            <div className="form-group">
              <label>Latitud</label>
              <input 
                type="number" 
                step="any" 
                value={userLat} 
                onChange={(e) => setUserLat(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label>Longitud</label>
              <input 
                type="number" 
                step="any" 
                value={userLng} 
                onChange={(e) => setUserLng(e.target.value)} 
              />
            </div>
            <button onClick={fetchNearbyPlaces}>
              Refrescar a 5 km
            </button>
          </div>

          <div className="glass-card">
            <h2 className="card-title">➕ Agregar Lugar</h2>
            <form onSubmit={handleCreatePoi}>
              <div className="form-group">
                <label>Categoría (Grupo)</label>
                <select value={poiGroup} onChange={(e) => setPoiGroup(e.target.value)}>
                  {GROUPS.map(g => (
                    <option key={g.id} value={g.id}>{g.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Nombre del Lugar</label>
                <input 
                  required 
                  type="text" 
                  value={poiName} 
                  onChange={(e) => setPoiName(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Latitud</label>
                <input 
                  required 
                  type="number" 
                  step="any" 
                  value={poiLat} 
                  onChange={(e) => setPoiLat(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Longitud</label>
                <input 
                  required 
                  type="number" 
                  step="any" 
                  value={poiLng} 
                  onChange={(e) => setPoiLng(e.target.value)} 
                />
              </div>
              <button type="submit">Guardar Lugar</button>
            </form>
          </div>

        </div>

        <div className="right-column glass-card">
          <h2 className="card-title">🌍 Lugares en 5 km</h2>
          
          {loading && <p>Cargando lugares...</p>}
          
          {!loading && nearbyPlaces.length === 0 && (
            <p className="no-results">No hay puntos de interés cercanos (5 km).</p>
          )}

          {!loading && Object.keys(placesByGroup).map(groupKey => (
            <div key={groupKey} className="group-section">
              <h3 className="group-title">
                {GROUPS.find(g => g.id === groupKey)?.label || groupKey}
              </h3>
              {placesByGroup[groupKey].map(place => (
                <div 
                  key={place.name} 
                  className="poi-item"
                  onClick={() => handleSelectPlace(place)}
                >
                  <div className="poi-info">
                    <strong>{place.name}</strong>
                  </div>
                  <div className="poi-distance">
                    {parseFloat(place.distance).toFixed(2)} km
                  </div>
                </div>
              ))}
            </div>
          ))}

          {selectedPlaceInfo && (
            <div className="selected-info">
              <h3>Cálculo Exacto de Distancia</h3>
              <p>Distancia desde tu posición actual hasta <strong>{selectedPlaceInfo.name}</strong>:</p>
              <div className="distance-highlight">
                {parseFloat(selectedPlaceInfo.distance).toFixed(3)} km
              </div>
              <p style={{color: 'var(--text-muted)'}}>(vía Redis GEODIST)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;