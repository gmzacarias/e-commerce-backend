# 🛒 SmartShop – E-commerce Full Stack con Next.js + Firebase + Airtable

Este es un proyecto completo de eCommerce desarrollado con **Next.js**, que utiliza tecnologías modernas como **Firebase**, **Airtable**, **SendGrid**, **Algolia**, **Yup** y **MercadoPago** para ofrecer una experiencia escalable, segura y rápida tanto en frontend como en backend.

---

## 🌐 Deploy

- 🔗 **Frontend**: [https://e-commerce-smartshop.vercel.app](https://e-commerce-smartshop.vercel.app)  
- 🔗 **Backend**: [https://e-commerce-backend-lake.vercel.app](https://e-commerce-backend-lake.vercel.app)  
- 📬 **API Docs**: [https://e-commerce-smartshop-api-docs.vercel.app/](https://e-commerce-smartshop-api-docs.vercel.app/)

---

## ⚙️ Tecnologías utilizadas

- ⚛️ **Next.js** – SSR y generación estática para frontend  
- 🔥 **Firebase** – Autenticación y Firestore como base de datos  
- 📨 **SendGrid** – Envío de correos electrónicos transaccionales  
- 📋 **Airtable** – Gestión de productos tipo CMS flexible  
- 🔍 **Algolia** – Búsqueda en tiempo real y filtros instantáneos  
- ✅ **Zod** – Validación de datos para formularios y endpoints  
- 💳 **MercadoPago** – Pasarela de pagos con tarjetas y cuentas de prueba  

---

## 🚀 Cómo iniciar el proyecto

### 📦 Requisitos

- Node.js >= 18.x  
- Yarn o npm  
- Firebase + SendGrid + Airtable + Algolia + MercadoPago (Sandbox)

### 🧑‍💻 1. Clonar el repositorio

```bash
git clone https://github.com/gmzacarias/e-commerce-backend.git
cd e-commerce-backend
```

### 📦 2. Instalar dependencias

#### Backend

```bash
cd backend
npm install
# o
yarn
```

### 🔐 3. Configurar variables de entorno

#### `.env` – Backend

```env
#Environment
NODE_ENV="development"
NODE_ENV="production"

# Firebase
FIREBASE_CONNECTION=

# JWT token
JWT_SECRET=

# Mercado Pago
ACCESS_TOKEN=

# Sendgrid
SENDGRID_API_KEY=
SENDGRID_SENDER=
ADMIN_EMAIL=

# Algolia
APPLICATION_ID=
ADMIN_API_KEY=

# Airtable
AIRTABLE_BASEID=
AIRTABLE_TABLENAME=
AIRTABLE_TOKEN=

# Cloudinary
CLOUDINARY_CLOUD=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Hookdeck
HOOKDECK_URL=

# Vercel
VERCEL_URL=
```

> ⚠️ Importante: No subir estos archivos al repositorio (usar `.gitignore`).

---

### 🧪 4. Ejecutar localmente

#### Backend

```bash
npm run dev
# o
yarn dev
```
API en: [http://localhost:3000/api](http://localhost:3000/api)

---

## 📬 Testeo de la API

Para testear los endpoints REST, usá directamente la interfaz Swagger acá:  
👉 [Smartshop API Docs](https://e-commerce-smartshop-api-docs.vercel.app/)

---

## 💳 Datos de prueba – MercadoPago

### 👥 Cuentas

**🟦 Vendedor**  
Usuario: `TESTUSER968904680`  
Contraseña: `8eXK9qAVqz`

**🟨 Comprador**  
Usuario: `TESTUSER1381110430`  
Contraseña: `Wvrf2Aacup`

---

### 🧾 Código de verificación

⚠️ **Importante:** En caso de que al iniciar sesión o realizar un pago con la **cuenta comprador** se solicite un código de verificación, utilizá el siguiente código de prueba:

```bash
873556
```
---

### 💳 Tarjetas de prueba
Puedes usar tarjetas de prueba de métodos de pago locales y simular diferentes respuestas de pago, sin necesidad de usar una tarjeta real.

### 💳 Tarjetas de crédito

| Tarjeta           | Número                  | Código de seguridad | Fecha de caducidad |
|-------------------|-------------------------|----------------------|---------------------|
| Mastercard        | 5031 7557 3453 0604     | 123                  | 11/30               |
| Visa              | 4509 9535 6623 3704     | 123                  | 11/30               |
| American Express  | 3711 803032 57522       | 1234                 | 11/30               |

### 💳 Tarjetas de débito

| Tarjeta    | Número                  | Código de seguridad | Fecha de caducidad |
|------------|-------------------------|----------------------|---------------------|
| Mastercard | 5287 3383 1025 3304     | 123                  | 11/30               |
| Visa       | 4002 7686 9439 5619     | 123                  | 11/30               |


---

### 🧾 Simular resultados de pago

Para probar distintos estados en las tarjetas de prueba, completá el campo `card_holder_name` con uno de los siguientes códigos. En los casos que se requiere un documento, usá el DNI: `12345678`.

| Código | Resultado                                             | DNI requerido |
|--------|-------------------------------------------------------|---------------|
| `APRO` | ✅ Pago aprobado                                       | 12345678      |
| `OTHE` | ❌ Rechazado por error general                         | 12345678      |
| `CONT` | ⏳ Pendiente de pago                                   | –             |
| `CALL` | ⚠️ Rechazado con validación para autorizar            | –             |
| `FUND` | ❌ Rechazado por importe insuficiente                  | –             |
| `SECU` | ❌ Rechazado por código de seguridad inválido          | –             |
| `EXPI` | ❌ Rechazado por problema con fecha de vencimiento     | –             |
| `FORM` | ❌ Rechazado por error de formulario                   | –             |
| `CARD` | ❌ Rechazado por falta de número de tarjeta            | –             |
| `INST` | ❌ Rechazado por cuotas inválidas                      | –             |
| `DUPL` | ❌ Rechazado por pago duplicado                        | –             |
| `LOCK` | ❌ Rechazado por tarjeta deshabilitada                 | –             |
| `CTNA` | ❌ Rechazado por tipo de tarjeta no permitida          | –             |
| `ATTE` | ❌ Rechazado por intentos excedidos del PIN            | –             |
| `BLAC` | ❌ Rechazado por tarjeta en lista negra                | –             |
| `UNSU` | ❌ Transacción no soportada                            | –             |
| `TEST` | 🔧 Usado para aplicar regla de montos                  | –             |


---

## 🧩 Funcionalidades principales

- 🛍️ Listado de productos (desde Airtable)  
- 🔍 Búsqueda instantánea con Algolia  
- 🔐 Registro/Login con Firebase  
- 🛒 Carrito persistente por usuario  
- 💸 Checkout con MercadoPago  
- 📨 Emails automáticos con SendGrid  
- ✅ Validaciones con Zod 
- 📦 Administración de órdenes  

---

## 👨‍💻 Autor

Desarrollado por Gastón Mauro Zacarias  
📧 Contacto: gastonmzacarias@gmail.com  
🌐 Portfolio: [https://github.com/gmzacarias](https://github.com/gmzacarias)
