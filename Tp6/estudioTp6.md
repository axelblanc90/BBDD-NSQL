# Guía de Referencia Rápida - TP6 (API Aeropuertos)

## 🌐 El Panorama General
Este proyecto es una aplicación full-stack interactiva y de alto rendimiento diseñada para la administración y geolocalización de aeropuertos. Utiliza **React con Leaflet.js** en el frontend para mostrar un mapa interactivo con clustering de marcadores, **Node.js con Express** en el backend como servidor API, y una arquitectura híbrida multi-NoSQL que combina **MongoDB** (para almacenamiento estructurado y detallado de documentos) y **dos instancias separadas de Redis**: una exclusiva para búsquedas por coordenadas (Redis GEO en el puerto `6379`) y otra dedicada al ranking en tiempo real de aeropuertos más visitados (Redis Popularidad con Sorted Sets en el puerto `6380`). Toda la solución está completamente contenedorizada mediante **Docker Compose**.

---

## 🖥️ Desglose del Backend (`/backend`)

* **`server.js`**: El archivo maestro del backend. Inicializa los servidores de Express, conecta con MongoDB y ambas bases de datos Redis, ejecuta la carga inicial de datos desde el archivo JSON si la base de datos está vacía, y expone los endpoints CRUD y especializados de búsqueda geoespacial y popularidad.
* **`data_trasport.json`**: Dataset estructurado en formato JSON con la base de datos inicial de aeropuertos que el backend consume de forma automática al arrancar.
* **`package.json`**: Contiene la definición del backend y sus librerías necesarias (`express`, `mongoose`, `redis` v4, `cors`, `dotenv`).
* **`Dockerfile`**: La receta técnica que define cómo construir el contenedor de Docker para levantar el servidor backend de Express.

---

## 🎨 Desglose del Frontend (`/frontend`)

### Estructura de Configuración y Compilación
* **`index.html`**: El archivo HTML inicial donde se monta la aplicación React en el navegador.
* **`vite.config.js`**: Archivo de configuración técnica del compilador Vite.
* **`tailwind.config.js`** y **`postcss.config.js`**: Archivos de configuración para el framework de diseño estético **TailwindCSS**.
* **`package.json`**: Especifica las librerías necesarias del cliente (incluyendo `leaflet` para mapas y `react-leaflet-markercluster` para agrupación de puntos).
* **`Dockerfile`**: La receta técnica para empaquetar y levantar la app de React en un puerto de desarrollo.

### Código de la Aplicación (`/frontend/src`)
* **`main.jsx`**: Punto de arranque de JavaScript que renderiza el componente principal de React.
* **`index.css`**: Hoja de estilos global que integra las utilidades de Tailwind y carga los estilos visuales de los mapas Leaflet.
* **`App.jsx`**: El componente principal e interactivo que contiene toda la lógica visual: el panel izquierdo con formularios (CRUD de aeropuertos, búsqueda cercana y ranking de popularidad) y el panel derecho con el mapa geográfico que renderiza dinámicamente los marcadores agrupados (clustering).

---

## 📄 Archivos de Documentación en la Raíz

* **`BDD_codigo.md`**: Resumen rápido con fragmentos de código, consultas de base de datos y guías rápidas para el desarrollo NoSQL.
* **`README.md`**: Guía general del proyecto que detalla la arquitectura implementada, la base del problema y cómo ejecutar la aplicación.

---

## 🐳 La Infraestructura (Docker)

* **`Dockerfile` (en `/backend` y `/frontend`)**:
  * Archivos que le indican a Docker cómo preparar los entornos Node/Express y Node/Vite de forma aislada para su empaquetamiento.
* **`docker-compose.yml` (fuera, en la raíz del TP)**:
  * Archivo coordinador que arranca de forma simultánea 5 contenedores intercomunicados en la red interna `airports-network`:
    1. **`mongo`** (`mongo_db`): Base de datos MongoDB persistente en el puerto local `27017`.
    2. **`redis-geo`** (`redis_geo`): Instancia de Redis dedicada a la geolocalización en el puerto `6379`.
    3. **`redis-pop`** (`redis_pop`): Instancia de Redis dedicada al control de popularidad, mapeando el puerto `6380` al `6379` interno.
    4. **`backend`** (`backend_api`): El servidor de Express en el puerto `5000`.
    5. **`frontend`** (`frontend_app`): La aplicación cliente en React expuesta en el puerto `5173`.

---


### 1. El mapa interactivo se mostraba completamente invisible (Frontend)
* **Causa**: En el archivo `App.jsx`, el componente principal `<MapContainer>` de React-Leaflet estaba configurado con `class="h-full w-full"`. Al ser un componente personalizado de React y no una etiqueta HTML estándar, la propiedad `class` no se propagaba al DOM, provocando que el contenedor de Leaflet tuviera un alto de `0px`.
* **Solución**: Se cambió a `className="h-full w-full"`. Esto permitió que Tailwind CSS aplicara las dimensiones correctamente y renderizara el mapa y sus tiles en la pantalla.

### 2. No se cargaba ningún aeropuerto de los datos semilla (Backend)
* **Causa**: El script de carga masiva inicial (`runInitialLoad` en `server.js`) intentaba parsear el archivo `data_trasport.json` línea por línea asumiendo que era formato NDJSON. Sin embargo, el archivo era una secuencia de objetos JSON multilínea con formato legible. Adicionalmente, el script buscaba claves inexistentes (`iata_code`, `latitude`, `longitude`) en lugar de las presentes en el archivo (`iata_faa`, `lat`, `lng`), y omitía el campo obligatorio `country`.
* **Solución**:
  - Se adaptó el lector de archivos para convertir la secuencia multilínea en un array JSON sintácticamente válido mediante expresiones regulares antes de parsearlo.
  - Se mapearon correctamente los campos del origen a las propiedades del esquema de MongoDB (`iata_faa` -> `iata_code`, `lat` -> `latitude`, `lng` -> `longitude`).
  - Se extrajo el país (`country`) dividiendo la cadena en el campo `city` por comas (ej. `"Goroka, Papua New Guinea"` -> ciudad `"Goroka"`, país `"Papua New Guinea"`).
  - Se incorporó un control con un `Set` en memoria para descartar códigos IATA duplicados en la semilla y evitar fallos por restricción única en MongoDB.

### 🏁 Resolución del Proyecto (API Aeropuertos)
Se resolvió implementando una API REST en Node/Express ([server.js]/backend/server.js#L1-L391)) que gestiona el CRUD de aeropuertos en MongoDB y sincroniza ubicaciones mediante coordenadas (GEOADD/GEORADIUS) y visitas temporales de popularidad (ZINCRBY/ZREVRANGE con TTL de 24h) usando dos instancias de Redis, conectada a una interfaz de mapa interactivo con clustering Leaflet en [App.jsx]frontend/src/App.jsx#L1-L705), y todo orquestado en contenedores de Docker mediante [docker-compose.yml]docker-compose.yml#L1-L71).

#### Detalle de Implementación:
1. **Carga Inicial de Datos**:
   * Implementada en la función `runInitialLoad()` en [server.js]backend/server.js#L36-128). Se ejecuta automáticamente al arrancar si la colección en MongoDB está vacía. Lee `data_trasport.json`, limpia duplicados usando un `Set`, inserta en MongoDB, indexa coordenadas en Redis GEO con `GEOADD` ([server.js]backend/server.js#L110-117)), y vacía/prepara el set de popularidad en Redis.
2. **API REST – Funcionalidades Mínimas (CRUD)**:
   * Implementados en Express en [server.js]backend/server.js#L130-351).
     * **POST `/airports`**: Guarda en MongoDB y agrega a Redis GEO con `GEOADD`.
     * **GET `/airports`**: Devuelve la lista completa desde MongoDB.
     * **GET `/airports/:iata_code`**: Recupera datos de MongoDB y suma `+1` en Redis Popularidad usando `ZINCRBY` ([server.js]backend/server.js#L274)).
     * **PUT `/airports/:iata_code`**: Modifica datos en MongoDB y actualiza coordenadas en Redis GEO.
     * **DELETE `/airports/:iata_code`**: Elimina del almacenamiento de MongoDB y de ambos servidores Redis.
3. **Redis GEO (Geolocalización y Búsqueda Cercana)**:
   * Los aeropuertos se almacenan en la clave `airports:geo` en Redis GEO. Para la búsqueda, el endpoint **GET `/airports/nearby`** en [server.js](backend/server.js#L165-210) ejecuta el comando `GEORADIUS` con los parámetros recibidos, retornando los aeropuertos cercanos ordenados por distancia.
4. **Expiración de Redis Popularidad**:
   * Se utiliza un sorted set en la clave `airport:popularity`. Para cumplir con la expiración automática, en cada llamada a la obtención individual se ejecuta `expire('airport:popularity', 86400)` en [server.js]backend/server.js#L276), asignando un TTL de 1 día (86400 segundos) a la clave.
5. **Frontend con Leaflet**:
   * En [App.jsx]frontend/src/App.jsx#L631-700) se renderiza el componente `<MapContainer>` con estilos oscuros y `<MarkerClusterGroup>` para agrupar marcadores. Al hacer clic en un marcador, se dispara `handleSelectAirport` ([App.jsx]frontend/src/App.jsx#L126-161)), enviando un `GET` del aeropuerto al backend para incrementar su popularidad y abrir un `<Popup>` interactivo con sus datos actualizados.
6. **Contenedor de Base de Datos MongoDB (Docker)**:
   * En [docker-compose.yml]docker-compose.yml#L1-L71), se define el servicio `mongo_db`. Utiliza la imagen oficial de MongoDB (última versión), mapea el puerto `27017` al contenedor y monta un volumen (`mongodb_data`) para asegurar la persistencia de los datos incluso si el contenedor se reinicia. El contenedor se nombra `mongo` y forma parte de la red interna `airports-network`.
