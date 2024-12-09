Proyecto e-commerce basado en Next.js,se utilizo Firebase para la base de datos y autenticacion, Sendgrid en el envio de mails,Airtable para la gestion flexible de productos, Algolia para la busqueda avanzada de datos,mejorando la experiencia del usuario,Yup se utiliza para validar los schemas de los endpoints. La combinación de estas tecnologías ofrece un eCommerce rápido, seguro y altamente escalable.

**Tecnologias Utilizadas**:
Next.js,Firebase,Airtable,Algolia,Yup.

**Deploy**:https://e-commerce-backend-lake.vercel.app
**Deploy Frontend**:  https://e-commerce-smartshop.vercel.app
**Collection Postman**:https://documenter.getpostman.com/view/23206998/2s9YywgL2L  

**Datos MercadoPago**

**Cuentas de prueba**  
  
**Cuenta vendedor**  
**Usuario**: TESTUSER968904680  
**Contraseña**: 8eXK9qAVqz  
  
**Cuenta comprador**
**Usuario**: TESTUSER1381110430  
**Contraseña**: Wvrf2Aacup  
  
**Tarjetas de Pruebas**: Podes testear la integración con las tarjetas que provee Mercado Pago en su documentación.  

| Tarjeta          | Numero              | Código CVC | Fecha vto. |
| ---------------- | ------------------- | ---------- | ---------- |
| Mastercard       | 5031 7557 3453 0604 | 123        | 11/25      |
| Visa             | 4509 9535 6623 3704 | 123        | 11/25      |
| American Express | 3711 803032 57522   | 1234       | 11/25      |

Para probar diferentes resultados de pago, completa el estado deseado en el nombre del titular (campo card_holder_name) de la tarjeta:

| **Estado de pago** | **Descripción**                             | **Documento de identidad** |
|--------------------|---------------------------------------------|----------------------------|
| APRO               | Pago aprobado                               | (DNI) 12345678            |
| OTHE               | Rechazado por error general                 | (DNI) 12345678            |
| CONT               | Pendiente de pago                           | -                          |
| CALL               | Rechazado con validación para autorizar     | -                          |
| FUND               | Rechazado por importe insuficiente          | -                          |
| SECU               | Rechazado por código de seguridad inválido  | -                          |
| EXPI               | Rechazado debido a un problema de fecha de vencimiento | -                |
| FORM               | Rechazado debido a un error de formulario   | -                          |
| CARD               | Rechazado por falta de card_number          | -                          |
| INST               | Rechazado por cuotas inválidas              | -                          |
| DUPL               | Rechazado por pago duplicado                | -                          |
| LOCK               | Rechazado por tarjeta deshabilitada         | -                          |
| CTNA               | Rechazado por tipo de tarjeta no permitida  | -                          |
| ATTE               | Rechazado debido a intentos excedidos del pin de la tarjeta | -              |
| BLAC               | Rechazado por estar en lista negra          | -                          |
| UNSU               | No soportado                                | -                          |
| TEST               | Usado para aplicar regla de montos          | -                          |
