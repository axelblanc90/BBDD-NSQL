from flask import Flask, render_template, redirect, url_for, request
from redis import Redis

app = Flask(__name__)

# 1. Conexión a Redis
r = Redis(host='localhost', port=6379, decode_responses=True)

# 2. Nuestra base de datos estática de capítulos de The Mandalorian
capitulos = [
    # Temporada 1
    {"id": 1, "temp": 1, "titulo": "Capítulo 1: El mandaloriano", "precio": 500},
    {"id": 2, "temp": 1, "titulo": "Capítulo 2: El niño", "precio": 500},
    {"id": 3, "temp": 1, "titulo": "Capítulo 3: El pecado", "precio": 500},
    {"id": 4, "temp": 1, "titulo": "Capítulo 4: Santuario", "precio": 500},
    {"id": 5, "temp": 1, "titulo": "Capítulo 5: El pistolero", "precio": 500},
    {"id": 6, "temp": 1, "titulo": "Capítulo 6: El prisionero", "precio": 500},
    {"id": 7, "temp": 1, "titulo": "Capítulo 7: El ajuste de cuentas", "precio": 500},
    {"id": 8, "temp": 1, "titulo": "Capítulo 8: Redención", "precio": 500},
    # Temporada 2
    {"id": 9, "temp": 2, "titulo": "Capítulo 9: El mariscal", "precio": 500},
    {"id": 10, "temp": 2, "titulo": "Capítulo 10: La pasajera", "precio": 500},
    {"id": 11, "temp": 2, "titulo": "Capítulo 11: La heredera", "precio": 500},
    {"id": 12, "temp": 2, "titulo": "Capítulo 12: El asedio", "precio": 500},
    {"id": 13, "temp": 2, "titulo": "Capítulo 13: La Jedi", "precio": 500},
    {"id": 14, "temp": 2, "titulo": "Capítulo 14: La tragedia", "precio": 500},
    {"id": 15, "temp": 2, "titulo": "Capítulo 15: El creyente", "precio": 500},
    {"id": 16, "temp": 2, "titulo": "Capítulo 16: El rescate", "precio": 500},
    # Temporada 3
    {"id": 17, "temp": 3, "titulo": "Capítulo 17: El apóstata", "precio": 500},
    {"id": 18, "temp": 3, "titulo": "Capítulo 18: Las minas de Mandalore", "precio": 500},
    {"id": 19, "temp": 3, "titulo": "Capítulo 19: El converso", "precio": 500},
    {"id": 20, "temp": 3, "titulo": "Capítulo 20: El huérfano", "precio": 500},
    {"id": 21, "temp": 3, "titulo": "Capítulo 21: El pirata", "precio": 500},
    {"id": 22, "temp": 3, "titulo": "Capítulo 22: Pistoleros a sueldo", "precio": 500},
    {"id": 23, "temp": 3, "titulo": "Capítulo 23: Los espías", "precio": 500},
    {"id": 24, "temp": 3, "titulo": "Capítulo 24: El regreso", "precio": 500}
]

@app.route('/')
def index():
    # Punto 1: Listar los capítulos indicando si están disponibles, alquilados o reservados.
    datos_completos = []
    
    for cap in capitulos:
        # Preguntamos a Redis por el estado usando la clave "mando:ID"
        estado_redis = r.get(f"mando:{cap['id']}")
        
        # Lógica de estados
        if not estado_redis:
            estado_actual = "Disponible"
        else:
            estado_actual = estado_redis # Será "Reservado" o "Alquilado"
            
        # Armamos el diccionario final que mandamos al HTML
        datos_completos.append({
            "id": cap["id"],
            "temp": cap["temp"],
            "titulo": cap["titulo"],
            "precio": cap["precio"],
            "estado": estado_actual
        })
        
    return render_template('index.html', capitulos=datos_completos)

@app.route('/reservar/<int:id_cap>')
def reservar(id_cap):
    # Redis borrará esto automáticamente si no se paga.
    r.setex(f"mando:{id_cap}", 240, "Reservado")
    return redirect(url_for('index'))

@app.route('/pagar/<int:id_cap>')
def pagar(id_cap):

    # En la vida real aquí verificaríamos la tarjeta, pero lo simulamos directo:
    r.setex(f"mando:{id_cap}", 86400, "Alquilado")
    return redirect(url_for('index'))

if __name__ == '__main__':
    # Usamos el puerto 5001 como lo configuraste con tu profe
    app.run(host='0.0.0.0', port=5001, debug=True)