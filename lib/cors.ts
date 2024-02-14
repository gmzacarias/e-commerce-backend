import Cors from 'cors';

// Inicializa el middleware CORS con las opciones deseadas
const corsOptions = {
  origin: "*",  // Reemplaza con tu dominio permitido
  methods: ["GET", "POST","PUT","PATCH","DELETE","OPTIONS"],         // Métodos permitidos
  allowedHeaders: ['Content-Type'],            // Encabezados permitidos
};

// Inicializa el middleware CORS con las opciones
export const cors = Cors(corsOptions)
console.log(cors)
