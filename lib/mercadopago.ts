import { MercadoPagoConfig, MerchantOrder, Preference } from 'mercadopago';
import type { MerchantOrderGetData } from 'mercadopago/dist/clients/merchantOrder/get/types';

const accessToken = process.env.ACCESS_TOKEN
const client = new MercadoPagoConfig({ accessToken: accessToken, options: { timeout: 5000, idempotencyKey: 'abc' } });
const merchantOrder = new MerchantOrder(client)
const preference = new Preference(client);

export async function getMerchantOrderId(orderData: MerchantOrderGetData) {
    const orderId = await merchantOrder.get(orderData)
    return orderId
}

export async function createPreference(data) {
    const newPreference = await preference.create(data)
    return newPreference
}

