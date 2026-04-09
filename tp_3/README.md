# Trabajo Práctico 3: API Turismo (Geo Redis)

Este proyecto es una aplicación web full-stack que permite a los usuarios buscar y registrar Puntos de Interés (Cervecerías, Universidades, Farmacias, etc.) en un radio de 5km y calcular distancias exactas. 

El proyecto consta de tres piezas principales (Contenedores) que trabajan en conjunto: un Frontend (interfaz de usuario), un Backend (lógica del servidor web) y la Base de Datos.

## Arquitectura General

- **Base de Datos:** Se utiliza **Redis**, puntualmente la funcionalidad **Geo Redis**. Permite buscar rápidamente qué puntos geográficos (latitud y longitud) están agrupados y ordenados según su distancia.
- **Backend (API):** Servidor creado con **Node.js y Express**. Recibe las peticiones del Frontend, manipula las coordenadas usando el cliente de Redis (v4) y responde con los resultados calculados.
- **Frontend (UI):** Desarrollado en **React**. Proporciona una interfaz visual, moderna y amigable para el usuario. Le habla exclusivamente al Backend mediante "llamadas API" (solicitudes web).

---

## ¿Qué hace cada archivo principal?

### `docker-compose.yml`
Es el gran "director de orquesta". Su función es encender y conectar correctamente a los 3 contenedores separados de la aplicación: la base de datos `db_redis_turismo`, el servidor `turismo_api_back` y la interfaz gráfica `turismo_api_front`.

### Carpeta `backend` (Lógica del Servidor)
- **`app.js`**: Este es el cerebro del servidor. Recibe la información del usuario e interactúa con Redis de tres formas:
  1. `POST /api/places`: Recibe los datos de un lugar nuevo (nombre y coordenadas) y lo guarda en Redis (`geoAdd`).
  2. `GET /api/places/nearby`: Toma tus coordenadas actuales y le pide a Redis (`geoSearchWith`) que devuelva todo lo que exista a 5 km a la redonda de cualquier grupo.
  3. `GET /api/places/distance`: Calcula con gran precisión (`geoDist`) la distancia entre tu ubicación y un lugar exacto seleccionado.
- **`Dockerfile`**: Son las instrucciones básicas sobre la configuración que va a tomar el contenedor de Node.js.
- **`package.json`**: Listado oficial de dependencias o librerías que utiliza el Backend (como por ejemplo, el propio cliente `redis` y `express`).

### Carpeta `fronted` (La vista / Interfaz de Usuario)
- **`src/App.js`**: Es la pantalla principal de React. Contiene los campos para escribir las coordenadas, el formulario para dar de alta nuevos lugares (farmacias, supermercados, etc.) y la vista para mostrar la lista de atractivos turísticos cercanos.
- **`src/index.css`**: Define el diseño visual. Aquí se aplican colores modernos (Dark Mode), márgenes suaves y un estilo "Glassmorphism" a las tarjetas.
- **`Dockerfile` / `package.json`**: Similar al del backend, configuran la imagen base y las dependencias que necesita React para construir la web a disposición del cliente.

---

## Cómo iniciarlo
Abre tu consola en esta carpeta y ejecuta:
```bash
docker-compose up
```
Luego ve a tu navegador y entra a `http://localhost:3000`.
