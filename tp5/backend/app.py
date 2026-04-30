import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId

# Inicialización de la aplicación Flask
app = Flask(__name__)
# Habilitar CORS para permitir peticiones desde el frontend (React)
CORS(app)

# Configuración de la conexión a MongoDB
# Usamos variables de entorno para que funcione tanto en Docker como localmente
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/superheroes_db")
client = MongoClient(MONGO_URI)
db = client.get_default_database()
superheroes_collection = db["superheroes"]

# Función auxiliar para convertir el ObjectId de MongoDB a un string (JSON serializable)
def hero_to_dict(hero):
    hero["_id"] = str(hero["_id"])
    return hero

# ENDPOINT: Obtener todos los superhéroes (con filtro opcional por casa)
@app.route('/api/superheroes', methods=['GET'])
def get_superheroes():
    house = request.args.get('house')
    query = {}
    if house:
        query['house'] = house # Filtra por Marvel o DC si se provee el parámetro
    
    heroes = list(superheroes_collection.find(query))
    return jsonify([hero_to_dict(hero) for hero in heroes])

# ENDPOINT: Obtener el detalle de un solo superhéroe por su ID
@app.route('/api/superheroes/<id>', methods=['GET'])
def get_superhero(id):
    hero = superheroes_collection.find_one({"_id": ObjectId(id)})
    if hero:
        return jsonify(hero_to_dict(hero))
    return jsonify({"error": "Hero not found"}), 404

# ENDPOINT: Crear un nuevo superhéroe
@app.route('/api/superheroes', methods=['POST'])
def create_superhero():
    data = request.json
    result = superheroes_collection.insert_one(data)
    data["_id"] = str(result.inserted_id) # Agregamos el ID generado al objeto devuelto
    return jsonify(data), 201

# ENDPOINT: Actualizar un superhéroe existente
@app.route('/api/superheroes/<id>', methods=['PUT'])
def update_superhero(id):
    data = request.json
    # Usamos $set para actualizar solo los campos enviados
    result = superheroes_collection.update_one({"_id": ObjectId(id)}, {"$set": data})
    if result.modified_count == 1:
        updated_hero = superheroes_collection.find_one({"_id": ObjectId(id)})
        return jsonify(hero_to_dict(updated_hero))
    return jsonify({"error": "Hero not found or no changes made"}), 404

# ENDPOINT: Eliminar un superhéroe
@app.route('/api/superheroes/<id>', methods=['DELETE'])
def delete_superhero(id):
    result = superheroes_collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 1:
        return jsonify({"message": "Hero deleted successfully"}), 200
    return jsonify({"error": "Hero not found"}), 404

# Iniciar servidor
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
