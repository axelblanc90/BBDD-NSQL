// Clase Singleton que funciona como un sistema de publicación/suscripción (Event Emitter)
// Sirve para manejar las notificaciones (carteles) de manera global sin necesidad de Context API complejo
class ToastManager {
  constructor() {
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  show(message, type = 'success') {
    const id = Date.now().toString();
    this.listeners.forEach(listener => listener({ id, message, type }));
  }

  success(message) { this.show(message, 'success'); }
  error(message) { this.show(message, 'error'); }
  marvel(message) { this.show(message, 'marvel'); }
  dc(message) { this.show(message, 'dc'); }
}

export const toast = new ToastManager();
