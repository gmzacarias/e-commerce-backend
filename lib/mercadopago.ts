import { MercadoPagoConfig, MerchantOrder, Preference, Payment } from 'mercadopago';

if (!process.env.ACCESS_TOKEN) {
    throw new Error("faltan credenciales de MercadoPago en las variables de entorno")
}

const accessToken = process.env.ACCESS_TOKEN
const client = new MercadoPagoConfig({ accessToken: accessToken, options: { timeout: 5000, idempotencyKey: 'abc' } });
const merchantOrder = new MerchantOrder(client)
const preference = new Preference(client);
const payment = new Payment(client)

export { merchantOrder, preference, payment }
