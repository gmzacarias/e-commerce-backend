import Cors from 'cors';

// Inicializa el middleware CORS con las opciones deseadas
const corsOptions = {
  origin: 'http://tu-dominio-permitido.com',  // Reemplaza con tu dominio permitido
  methods: ['GET', 'POST', 'OPTIONS'],         // Métodos permitidos
  allowedHeaders: ['Content-Type'],            // Encabezados permitidos
};

// Inicializa el middleware CORS con las opciones
export const cors = Cors(corsOptions)