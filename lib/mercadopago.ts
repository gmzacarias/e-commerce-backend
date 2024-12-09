import { MercadoPagoConfig, MerchantOrder, Preference, Payment } from 'mercadopago';
import type { MerchantOrderGetData } from "mercadopago/dist/clients/merchantOrder/get/types"
import { PaymentGetData } from 'mercadopago/dist/clients/payment/get/types';
import { PreApprovalGetData } from 'mercadopago/dist/clients/preApproval/get/types';
import { PreferenceCreateData } from 'mercadopago/dist/clients/preference/create/types';
import { PreferenceGetData } from 'mercadopago/dist/clients/preference/get/types';

const accessToken = process.env.ACCESS_TOKEN
const client = new MercadoPagoConfig({ accessToken: accessToken, options: { timeout: 5000, idempotencyKey: 'abc' } });
const merchantOrder = new MerchantOrder(client)
const preference = new Preference(client);
const payment = new Payment(client)

export async function getMerchantOrderId(orderData: MerchantOrderGetData) {
    const orderId = await merchantOrder.get(orderData)
    return orderId
}

export async function createPreference(data: PreferenceCreateData) {
    const newPreference = await preference.create(data)
    return newPreference
}

export async function getPreference(id: PreferenceGetData) {
    const preferenceData = await preference.get(id)
    return preferenceData
}

export async function getPayment(id: PaymentGetData) {
    const paymentData = await payment.get(id)
    return paymentData
}
