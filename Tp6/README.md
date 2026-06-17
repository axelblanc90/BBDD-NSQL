Asegúrate de tener instalado **Docker** y **Docker Compose**.

1. **Clonar/Abrir el directorio del proyecto**:
   ```bash
   cd Tp6
   ```

2. **Levantar todos los contenedores**:
   Este comando compilará el backend, el frontend e iniciará las bases de datos en segundo plano:
   ```bash
   docker-compose up -d --build
   ```

3. **Acceder a las aplicaciones**:
   * **Frontend (Dashboard Interactivo)**: [http://localhost:5173](http://localhost:5173)
   * **Backend API**: [http://localhost:5000](http://localhost:5000)

4. **Verificación de logs (útil para ver la carga inicial)**:
   ```bash
   docker-compose logs -f backend
   ```



