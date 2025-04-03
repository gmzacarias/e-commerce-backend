import type { MerchantOrderGetData } from "mercadopago/dist/clients/merchantOrder/get/types"
import { PaymentGetData } from "mercadopago/dist/clients/payment/get/types"
import { PreferenceCreateData } from "mercadopago/dist/clients/preference/create/types"
import { PreferenceGetData } from "mercadopago/dist/clients/preference/get/types"
import { merchantOrder, preference, payment } from "lib/mercadopago"

export async function getMerchantOrderId(orderData: MerchantOrderGetData) {
    try {
        const orderId = await merchantOrder.get(orderData)
        return orderId
    } catch (error) {
        console.error("hubo un problema al obtener las ordenes:", error.message)
        throw error
    }
}

export async function createPreference(data: PreferenceCreateData) {
    try {
        const newPreference = await preference.create(data)
        return newPreference
    } catch (error) {
        console.error("hubo un problema al crear la preferencia:", error.message)
        throw error
    }
}

export async function getPreference(id: PreferenceGetData) {
    try {
        const preferenceData = await preference.get(id)
        return preferenceData
    } catch (error) {
        console.error("hubo un problema al obtener la preferencia:", error.message)
        throw error
    }
}
export async function getPayment(id: PaymentGetData) {
    try {
        const paymentData = await payment.get(id)
        return paymentData
    } catch (error) {
        console.error("hubo un problema al obtener la data de payment:", error.message)
        throw error
    }
}