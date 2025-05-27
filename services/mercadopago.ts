import type { MerchantOrderGetData } from "mercadopago/dist/clients/merchantOrder/get/types"
import type { MerchantOrderResponse } from "mercadopago/dist/clients/merchantOrder/commonTypes"
import type { PreferenceCreateData } from "mercadopago/dist/clients/preference/create/types"
import type { PaymentGetData } from "mercadopago/dist/clients/payment/get/types"
import type { PreferenceResponse } from "mercadopago/dist/clients/preference/commonTypes"
import type {PaymentResponse} from "mercadopago/dist/clients/payment/commonTypes"
import { merchantOrder, preference, payment } from "lib/mercadopago"

export async function getMerchantOrderId(orderData: MerchantOrderGetData): Promise<MerchantOrderResponse> {
    try {
        const orderId = await merchantOrder.get(orderData)
        return orderId
    } catch (error) {
        console.error("hubo un problema al obtener las ordenes:", error.message)
        throw error
    }
}

export async function createPreference(data: PreferenceCreateData): Promise<PreferenceResponse> {
    try {
        const newPreference = await preference.create(data)
        return newPreference
    } catch (error) {
        console.error("hubo un problema al crear la preferencia:", error.message)
        throw error
    }
}

export async function getPayment(id: PaymentGetData): Promise<PaymentResponse> {
    try {
        const paymentData = await payment.get(id)
        return paymentData
    } catch (error) {
        console.error("hubo un problema al obtener la data de payment:", error.message)
        throw error
    }
}