import Cors from 'cors';

// Inicializa el middleware CORS
const cors = Cors({
  methods: ['GET', 'POST', 'OPTIONS'], // Puedes ajustar los métodos permitidos según tus necesidades
});

// ... Resto de tu código ...

// Agrega el middleware a tu controlador de API
export default async function handler(req, res) {
  // Habilita CORS
  await cors(req, res);

  // ... Resto de tu código ...
}