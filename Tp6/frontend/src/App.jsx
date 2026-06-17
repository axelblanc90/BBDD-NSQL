import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { Plane, Star, MapPin, Search, Plus, Trash2, Edit, X, Compass, Globe, Info, Save } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Icono marcador SVG personalizado para aeropuertos
const airportIcon = new L.DivIcon({
  html: `
    <div class="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-500/50 border-2 border-slate-900 hover:scale-110 hover:bg-indigo-500 transition-all duration-200 cursor-pointer">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 transform -rotate-45">
        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.907a.75.75 0 0 0 .702.534H12a.75.75 0 0 1 0 1.5H5.686a.75.75 0 0 0-.702.534l-2.432 7.908a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
      </svg>
    </div>
  `,
  className: 'custom-div-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

// Marcador de centro personalizado para la búsqueda geoespacial
const centerIcon = new L.DivIcon({
  html: `
    <div class="w-6 h-6 rounded-full bg-rose-500/30 border-2 border-rose-500 flex items-center justify-center animate-ping absolute"></div>
    <div class="w-4 h-4 rounded-full bg-rose-500 border border-white flex items-center justify-center relative shadow-lg shadow-rose-500/50"></div>
  `,
  className: 'center-div-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Asistente del mapa para centrar y animar el movimiento de la cámara
function MapFlyController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 6, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [center, map]);
  return null;
}

// Asistente del mapa para capturar las coordenadas al hacer clic en el mapa
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    }
  });
  return null;
}

export default function App() {
  const [airports, setAirports] = useState([]);
  const [selectedAirport, setSelectedAirport] = useState(null);
  
  // Estados de búsqueda cercana
  const [nearbyRadius, setNearbyRadius] = useState(500); // por defecto 500km
  const [nearbyAirports, setNearbyAirports] = useState([]);
  const [isSearchingNearby, setIsSearchingNearby] = useState(false);
  const [searchCenter, setSearchCenter] = useState(null);

  // Estados de la lista de popularidad
  const [popularAirports, setPopularAirports] = useState([]);

  // Estados del formulario
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    iata_code: '',
    name: '',
    city: '',
    country: '',
    latitude: '',
    longitude: ''
  });

  // Notificaciones
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Cargas iniciales
  useEffect(() => {
    fetchAirports();
    fetchPopularList();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 5000);
  };

  const fetchAirports = async () => {
    try {
      const res = await fetch(`${API_URL}/airports`);
      const data = await res.json();
      if (res.ok) {
        setAirports(data);
      } else {
        showNotification('error', data.error || 'Error al obtener aeropuertos');
      }
    } catch (err) {
      console.error(err);
      showNotification('error', 'No se pudo conectar con el servidor backend');
    }
  };

  const fetchPopularList = async () => {
    try {
      const res = await fetch(`${API_URL}/airports/popular`);
      const data = await res.json();
      if (res.ok) {
        setPopularAirports(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Clic en el marcador del mapa -> Obtener detalles -> Incrementar popularidad -> Actualizar lista
  const handleSelectAirport = async (iataCode) => {
    try {
      // Limpiar la superposición de búsqueda cercana al seleccionar un nuevo aeropuerto
      setNearbyAirports([]);
      setSearchCenter(null);
      setIsSearchingNearby(false);

      const res = await fetch(`${API_URL}/airports/${iataCode}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedAirport(data.airport);
        // Mostrar el incremento de visitas actual en la interfaz
        showNotification('success', `Visita registrada para ${iataCode.toUpperCase()}. Popularidad actual: ${data.visits}`);
        
        // Actualizar la lista de ranking de popularidad
        fetchPopularList();
        
        // Preparar detalles del formulario de edición por si acaso
        setFormData({
          iata_code: data.airport.iata_code,
          name: data.airport.name,
          city: data.airport.city,
          country: data.airport.country,
          latitude: data.airport.latitude,
          longitude: data.airport.longitude
        });
        setIsEditing(false);
        setShowAddForm(false);
      } else {
        showNotification('error', data.error || 'Error al obtener el aeropuerto');
      }
    } catch (err) {
      console.error(err);
      showNotification('error', 'Error al comunicar con la base de datos');
    }
  };

  // Envío de formulario para crear aeropuerto
  const handleCreateAirport = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/airports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('success', `Aeropuerto ${data.iata_code} creado exitosamente.`);
        fetchAirports();
        setSelectedAirport(data);
        setShowAddForm(false);
        setFormData({ iata_code: '', name: '', city: '', country: '', latitude: '', longitude: '' });
      } else {
        showNotification('error', data.error || 'Error al guardar aeropuerto');
      }
    } catch (err) {
      console.error(err);
      showNotification('error', 'Error de red al crear el aeropuerto');
    }
  };

  // Envío de formulario para actualizar aeropuerto
  const handleUpdateAirport = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/airports/${selectedAirport.iata_code}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('success', `Aeropuerto ${data.iata_code} actualizado.`);
        fetchAirports();
        setSelectedAirport(data);
        setIsEditing(false);
      } else {
        showNotification('error', data.error || 'Error al actualizar');
      }
    } catch (err) {
      console.error(err);
      showNotification('error', 'Error de red al actualizar');
    }
  };

  // Eliminar aeropuerto
  const handleDeleteAirport = async (iataCode) => {
    if (!window.confirm(`¿Estás seguro de eliminar el aeropuerto ${iataCode}? Esto lo removerá de MongoDB y Redis.`)) return;
    try {
      const res = await fetch(`${API_URL}/airports/${iataCode}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showNotification('success', `Aeropuerto ${iataCode} eliminado.`);
        setSelectedAirport(null);
        setNearbyAirports([]);
        setSearchCenter(null);
        fetchAirports();
        fetchPopularList();
      } else {
        showNotification('error', data.error || 'Error al eliminar');
      }
    } catch (err) {
      console.error(err);
      showNotification('error', 'Error de red al eliminar');
    }
  };

  // Búsqueda geoespacial (aeropuertos cercanos)
  const handleFindNearby = async () => {
    if (!selectedAirport) return;
    try {
      setIsSearchingNearby(true);
      const { latitude, longitude } = selectedAirport;
      setSearchCenter([latitude, longitude]);

      const res = await fetch(`${API_URL}/airports/nearby?lat=${latitude}&lng=${longitude}&radius=${nearbyRadius}`);
      const data = await res.json();
      if (res.ok) {
        // Filtrar el propio aeropuerto seleccionado de la lista de cercanos
        const filtered = data.filter(a => a.iata_code !== selectedAirport.iata_code);
        setNearbyAirports(filtered);
        showNotification('success', `Búsqueda geoespacial completada. Se encontraron ${filtered.length} aeropuertos en ${nearbyRadius}km.`);
      } else {
        showNotification('error', data.error || 'Error de búsqueda geoespacial');
      }
    } catch (err) {
      console.error(err);
      showNotification('error', 'Error de red en la consulta geoespacial');
    } finally {
      setIsSearchingNearby(false);
    }
  };

  // Manejador de clic en el mapa -> autocompleta coordenadas en el formulario de creación
  const handleMapClick = (latlng) => {
    if (showAddForm) {
      setFormData(prev => ({
        ...prev,
        latitude: latlng.lat.toFixed(6),
        longitude: latlng.lng.toFixed(6)
      }));
      showNotification('info', `Coordenadas capturadas del mapa: ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
    }
  };

  return (
    <div class="h-screen w-screen flex flex-row overflow-hidden bg-slate-950 font-sans">
      
      {/* Notificación Toast */}
      {notification.message && (
        <div class={`fixed top-4 right-4 z-[9999] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border transition-all duration-300 transform scale-100 ${
          notification.type === 'success' ? 'bg-indigo-950/90 border-indigo-500/50 text-indigo-200' :
          notification.type === 'error' ? 'bg-rose-950/90 border-rose-500/50 text-rose-200' :
          'bg-slate-900/95 border-slate-700/50 text-slate-200'
        }`}>
          {notification.type === 'success' && <Star class="w-5 h-5 text-indigo-400 animate-spin" />}
          {notification.type === 'error' && <X class="w-5 h-5 text-rose-400" />}
          {notification.type === 'info' && <Compass class="w-5 h-5 text-sky-400" />}
          <span class="text-sm font-semibold">{notification.message}</span>
        </div>
      )}

      {/* BARRA LATERAL (Panel Izquierdo - 32%) */}
      <div class="w-[32%] h-full flex flex-col bg-slate-900/90 border-r border-slate-800/60 z-20 shadow-2xl overflow-y-auto">
        
        {/* Encabezado y Marca */}
        <div class="p-6 border-b border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-indigo-950/40 to-slate-900">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Plane class="w-6 h-6 text-white transform -rotate-45" />
            </div>
            <div>
              <h1 class="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-200 to-white bg-clip-text text-transparent">API Aeropuertos</h1>
              <p class="text-xs text-indigo-400 font-medium tracking-wide">REDIS GEO & MONGO DASHBOARD</p>
            </div>
          </div>
          {!showAddForm && (
            <button 
              onClick={() => {
                setShowAddForm(true);
                setIsEditing(false);
                setSelectedAirport(null);
                setFormData({ iata_code: '', name: '', city: '', country: '', latitude: '', longitude: '' });
              }}
              class="p-2 rounded-lg bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 hover:border-transparent transition-all duration-200"
              title="Registrar nuevo aeropuerto"
            >
              <Plus class="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Cuerpo de la Barra Lateral */}
        <div class="p-6 flex-1 flex flex-col gap-6">

          {/* 1. Formulario de Creación / Edición de Aeropuerto */}
          {(showAddForm || isEditing) && (
            <div class="glass-card p-5 rounded-2xl border border-indigo-500/15 shadow-xl relative animate-fadeIn">
              <button 
                onClick={() => {
                  setShowAddForm(false);
                  setIsEditing(false);
                  if (selectedAirport) {
                    setFormData(selectedAirport);
                  }
                }}
                class="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <X class="w-4 h-4" />
              </button>

              <h2 class="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                {isEditing ? <Edit class="w-4 h-4" /> : <Plus class="w-4 h-4" />}
                {isEditing ? `Editar Aeropuerto ${formData.iata_code}` : 'Registrar Aeropuerto'}
              </h2>

              <form onSubmit={isEditing ? handleUpdateAirport : handleCreateAirport} class="space-y-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-400 mb-1">Código IATA (3 Letras)</label>
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="E.g. EZE"
                    required
                    disabled={isEditing}
                    value={formData.iata_code}
                    onChange={(e) => setFormData({ ...formData, iata_code: e.target.value.toUpperCase() })}
                    class="w-full px-3 py-2 text-sm rounded-lg glass-input uppercase disabled:opacity-50"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-400 mb-1">Nombre Oficial</label>
                  <input
                    type="text"
                    placeholder="E.g. Ministro Pistarini"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    class="w-full px-3 py-2 text-sm rounded-lg glass-input"
                  />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1">Ciudad</label>
                    <input
                      type="text"
                      placeholder="Buenos Aires"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      class="w-full px-3 py-2 text-sm rounded-lg glass-input"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1">País</label>
                    <input
                      type="text"
                      placeholder="Argentina"
                      required
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      class="w-full px-3 py-2 text-sm rounded-lg glass-input"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1">Latitud</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="-34.8222"
                      required
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      class="w-full px-3 py-2 text-sm rounded-lg glass-input"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-1">Longitud</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="-58.5358"
                      required
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      class="w-full px-3 py-2 text-sm rounded-lg glass-input"
                    />
                  </div>
                </div>

                {!isEditing && (
                  <p class="text-[10px] text-slate-400 italic">
                    💡 Tip: Puedes hacer clic en cualquier punto del mapa para autocompletar la latitud y longitud.
                  </p>
                )}

                <button
                  type="submit"
                  class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                >
                  <Save class="w-4 h-4" />
                  {isEditing ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </form>
            </div>
          )}

          {/* 2. Detalles de Información del Aeropuerto */}
          {selectedAirport && !isEditing && !showAddForm && (
            <div class="glass-card p-5 rounded-2xl border border-indigo-500/10 shadow-xl relative animate-fadeIn bg-slate-900/40">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="px-2.5 py-0.5 text-xs font-bold bg-indigo-950 border border-indigo-500/40 text-indigo-300 rounded-md">
                      {selectedAirport.iata_code}
                    </span>
                    <h2 class="text-lg font-bold text-white tracking-tight">{selectedAirport.city}</h2>
                  </div>
                  <p class="text-xs text-slate-400 font-medium mt-1">{selectedAirport.name}</p>
                </div>
                <div class="flex gap-1.5">
                  <button 
                    onClick={() => {
                      setFormData(selectedAirport);
                      setIsEditing(true);
                    }}
                    class="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-400 transition-all border border-slate-700/50 hover:border-transparent"
                    title="Editar detalles"
                  >
                    <Edit class="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteAirport(selectedAirport.iata_code)}
                    class="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 transition-all border border-slate-700/50 hover:border-transparent"
                    title="Eliminar del mapa"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Cuadrícula de Especificaciones */}
              <div class="grid grid-cols-2 gap-4 py-3 my-3 border-t border-b border-slate-800/60 text-xs">
                <div>
                  <span class="text-slate-500 block">País</span>
                  <span class="font-medium text-slate-300 flex items-center gap-1.5 mt-0.5">
                    <Globe class="w-3.5 h-3.5 text-slate-400" />
                    {selectedAirport.country}
                  </span>
                </div>
                <div>
                  <span class="text-slate-500 block">Coordenadas</span>
                  <span class="font-medium text-slate-300 block mt-0.5">
                    {selectedAirport.latitude.toFixed(4)}, {selectedAirport.longitude.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Herramienta de Cercanía (Redis-Geo) */}
              <div class="mt-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
                <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Compass class="w-4 h-4 text-indigo-400" />
                  Herramienta de Cercanía (Redis-Geo)
                </h3>
                <div class="flex gap-2">
                  <div class="relative flex-1">
                    <input
                      type="number"
                      value={nearbyRadius}
                      onChange={(e) => setNearbyRadius(Number(e.target.value))}
                      placeholder="Radio en km"
                      class="w-full pl-3 pr-8 py-1.5 text-xs rounded-lg glass-input"
                    />
                    <span class="absolute right-2.5 top-1.5 text-[10px] text-slate-500 font-bold">KM</span>
                  </div>
                  <button
                    onClick={handleFindNearby}
                    disabled={isSearchingNearby}
                    class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1"
                  >
                    <Search class="w-3.5 h-3.5" />
                    Buscar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. Lista de Resultados de Aeropuertos Cercanos */}
          {searchCenter && (
            <div class="glass-card p-5 rounded-2xl border border-rose-500/10 shadow-xl bg-slate-900/20 max-h-[250px] flex flex-col overflow-hidden animate-slideUp">
              <div class="flex justify-between items-center mb-3">
                <h3 class="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin class="w-4 h-4" />
                  Cercanos a {selectedAirport?.iata_code} ({nearbyRadius} km)
                </h3>
                <button
                  onClick={() => {
                    setNearbyAirports([]);
                    setSearchCenter(null);
                  }}
                  class="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-0.5 transition-colors"
                >
                  <X class="w-3.5 h-3.5" /> Limpiar
                </button>
              </div>

              <div class="overflow-y-auto space-y-2 flex-1">
                {nearbyAirports.length === 0 ? (
                  <p class="text-xs text-slate-500 italic py-3 text-center">No se encontraron otros aeropuertos.</p>
                ) : (
                  nearbyAirports.map(airport => (
                    <div 
                      key={airport.iata_code}
                      onClick={() => handleSelectAirport(airport.iata_code)}
                      class="p-2.5 rounded-lg bg-slate-950/40 hover:bg-slate-800/40 border border-slate-800/80 hover:border-slate-700/80 cursor-pointer flex justify-between items-center transition-all group"
                    >
                      <div>
                        <div class="flex items-center gap-1.5">
                          <span class="font-bold text-xs text-white group-hover:text-indigo-400 transition-colors">{airport.iata_code}</span>
                          <span class="text-slate-400 text-xs truncate max-w-[120px]">{airport.city}</span>
                        </div>
                        <span class="text-[10px] text-slate-500">{airport.name}</span>
                      </div>
                      <span class="text-[10px] font-bold text-indigo-400 bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-900/50">
                        {airport.distance.toFixed(1)} km
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 4. Tabla de Clasificación / Lista de Populares (Sorted Set ZREVRANGE de Redis-Pop) */}
          <div class="flex-1 flex flex-col min-h-[220px]">
            <h3 class="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Star class="w-4 h-4 text-indigo-500" />
              Aeropuertos Más Visitados (Redis-Pop ZSET)
            </h3>
            
            <div class="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {popularAirports.length === 0 ? (
                <div class="text-center py-8 bg-slate-950/20 rounded-xl border border-slate-800/40">
                  <Info class="w-5 h-5 text-slate-600 mx-auto mb-2" />
                  <p class="text-xs text-slate-500 italic">No hay registros de visitas de popularidad todavía.</p>
                </div>
              ) : (
                popularAirports.map((airport, index) => (
                  <div
                    key={airport.iata_code}
                    onClick={() => handleSelectAirport(airport.iata_code)}
                    class={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all duration-200 group ${
                      selectedAirport?.iata_code === airport.iata_code 
                        ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-950/20' 
                        : 'bg-slate-950/40 border-slate-900 hover:bg-slate-850 hover:border-slate-800'
                    }`}
                  >
                    <div class="flex items-center gap-3">
                      {/* Insignia con número de puesto */}
                      <span class={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shadow-sm ${
                        index === 0 ? 'bg-amber-500 text-slate-950' :
                        index === 1 ? 'bg-slate-300 text-slate-950' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <div class="flex items-center gap-1.5">
                          <span class="text-xs font-bold text-white group-hover:text-indigo-400 transition-all">{airport.iata_code}</span>
                          <span class="text-xs text-slate-400 font-medium truncate max-w-[140px]">{airport.city}</span>
                        </div>
                        <span class="text-[10px] text-slate-500 block truncate max-w-[180px]">{airport.name}</span>
                      </div>
                    </div>
                    
                    <span class="px-2.5 py-1 text-xs font-extrabold rounded-lg bg-indigo-950/80 border border-indigo-500/20 text-indigo-300 flex items-center gap-1">
                      <Star class="w-3 h-3 fill-indigo-400 text-indigo-400" />
                      {airport.visits}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* LIENZO DEL MAPA (Panel Derecho - 68%) */}
      <div class="flex-1 h-full relative z-10">
        
        {/* Banner de Ayuda */}
        <div class="absolute top-4 left-4 z-[1000] bg-slate-950/85 backdrop-blur-md border border-slate-800/80 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2.5 max-w-md shadow-2xl">
          <Info class="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <p class="text-slate-300 leading-normal">
            Haz clic en un marcador de <strong class="text-indigo-400">aeropuerto</strong> para ver detalles e incrementar su popularidad en tiempo real.
          </p>
        </div>

        <MapContainer 
          center={[-25.0, -60.0]} // Argentinian/South American center as general viewport root
          zoom={4} 
          className="h-full w-full"
          zoomControl={true}
        >
          {/* Capa de mapa CartoDB Dark Matter para una interfaz oscura elegante y premium */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Envoltorio para el callback de clic en el mapa del usuario */}
          <MapClickHandler onMapClick={handleMapClick} />

          {/* Manejador del movimiento de la cámara */}
          {selectedAirport && (
            <MapFlyController center={[selectedAirport.latitude, selectedAirport.longitude]} />
          )}

          {/* Indicador de radio circular de proximidad visual (alcance de consulta Redis-Geo) */}
          {searchCenter && (
            <>
              <Circle
                center={searchCenter}
                radius={nearbyRadius * 1000} // radius in meters
                pathOptions={{
                  fillColor: 'rgba(244, 63, 94, 0.08)',
                  fillOpacity: 0.2,
                  color: '#f43f5e',
                  weight: 1.5,
                  dashArray: '5, 8'
                }}
              />
              <Marker position={searchCenter} icon={centerIcon} />
            </>
          )}

          {/* Marcadores agrupados de aeropuertos */}
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={40}
            showCoverageOnHover={false}
          >
            {airports.map((airport) => (
              <Marker
                key={airport.iata_code}
                position={[airport.latitude, airport.longitude]}
                icon={airportIcon}
                eventHandlers={{
                  click: () => handleSelectAirport(airport.iata_code)
                }}
              >
                <Popup>
                  <div class="p-1 font-sans text-xs">
                    <div class="flex items-center gap-1.5 mb-1.5">
                      <span class="px-1.5 py-0.5 bg-indigo-950 border border-indigo-500/30 text-indigo-400 font-bold rounded">
                        {airport.iata_code}
                      </span>
                      <strong class="text-white text-sm">{airport.city}</strong>
                    </div>
                    <p class="text-slate-300 font-medium leading-tight mb-1">{airport.name}</p>
                    <p class="text-slate-400 text-[10px]">{airport.country}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

    </div>
  );
}
