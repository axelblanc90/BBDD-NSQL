# Superheroes SPA - Marvel & DC 

Esta es una Single Page Application (SPA) full-stack que permite consultar, agregar, editar y eliminar superhéroes tanto del universo de **Marvel** como de **DC**.

La aplicación está completamente dockerizada («recetas en Docker Compose») para facilitar su despliegue y ejecución en cualquier computadora que tenga Docker instalado, sin necesidad de configurar Node.js, React ni bases de datos de forma manual.

## Tecnologías Utilizadas 
* **Frontend**: React.js (Vite), React Router, Axios, CSS puro con diseño moderno «Glassmorphism».
* **Backend**: Node.js, Express.js.
* **Base de Datos**: MongoDB (Mongoose).
* **Orquestación**: Docker & Docker Compose (3 contenedores).

---

##  Cómo ejecutar el proyecto en otra PC

Para correr el proyecto en una computadora diferente, solamente necesitas trasladar esta carpeta (asegurándote de llevar los directorios `frontend`, `backend` y el archivo `docker-compose.yml`) a la otra máquina.

### Requisitos previos fundamentales
La otra computadora **únicamente** necesita tener instalado:
1. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (si es Windows o Mac) o **Docker Engine** (si es Linux).
2. Asegúrate de que Docker esté abierto y ejecutándose en segundo plano.

### Pasos para levantar el proyecto

1. **Abre una terminal** (Símbolo del sistema, PowerShell o cualquier consola).
2. **Navega hasta la carpeta** raíz del proyecto (donde se encuentra el archivo `docker-compose.yml`).
3. Ejecuta el siguiente comando para construir las imágenes y levantar todos los contenedores al mismo tiempo:

   ```bash
   docker-compose up -d --build
   ```
   *(Nota: Dependiendo de la versión de Docker, el comando puede ser `docker compose up -d --build` sin el guion).*

4. **¡Espera unos momentos!** La primera vez tardará uno o dos minutos mientras descarga las imágenes de Node y MongoDB, y compila la aplicación.
5. Una vez que termine, el servidor backend insertará automáticamente **40 superhéroes predeterminados** (20 de Marvel y 20 de DC) si detecta que la base de datos está vacía.

### Direcciones de Acceso 
* **Aplicación Frontend (Interfaz Gráfica)**: Abre tu navegador y ve a [http://localhost:5173](http://localhost:5173)
* **Backend API REST**: Corre de fondo y responde a [http://localhost:5000/api/superheroes](http://localhost:5000/api/superheroes)

###  Cómo detener la aplicación
Para apagar los contenedores y liberar recursos de la computadora, regresa a la terminal en la misma carpeta del proyecto y ejecuta:

```bash
docker-compose down
```
*(No te preocupes por perder los superhéroes creados; la base de datos se guarda de forma persistente en un "volumen" de Docker llamado `mongo-data`).*
