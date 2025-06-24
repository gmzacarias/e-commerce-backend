import { render } from "@react-email/render";
import { sendCodeMail } from "components/sendCodeMail";
import { paymentMail } from "components/paymentMail";
import { saleMail } from "components/saleMail";
import { sender, sgMail, adminEmail } from "lib/sendgrid";

export async function sendCodeAuth(email: string, code: number) {
    const mailHtml = render(sendCodeMail({ code: code }))
    const msg = {
        to: email,
        from: sender, // Use the email address or domain you verified above
        subject: '🔐 Código de verificación para iniciar sesión en Smartshop',
        html: mailHtml,
    };
    try {
        await sgMail.send(msg)
    } catch (error) {
        console.error("Email no enviado", error.message)
    }
}

async function sendPaymentConfirmed(email: string, userName: string, order: string) {
    const mailHtml = render(paymentMail({ userName: userName, order: order }))
    const msg = {
        to: email,
        from: sender, // Use the email address or domain you verified above
        subject: 'Notificacion de compra confirmada',
        html: mailHtml,
    };
    try {
        await sgMail.send(msg)
    } catch (error) {
        console.error("Email no enviado", error.message)
    }
}

async function sendSaleConfirmed(userId: string, order: string, price: number) {
    const mailHtml = render(saleMail({ userId: userId, order: order, price: price }))
    const msg = {
        to: adminEmail,
        from: sender, // Use the email address or domain you verified above
        subject: 'Notificacion de compra confirmada',
        html: mailHtml,
    };
    try {
        await sgMail.send(msg)
    } catch (error) {
        console.error("Email no enviado", error.message)
    }
}

export async function purchaseAlert(email: string, userName: string, order: string) {
    try {
        const data = await sendPaymentConfirmed(email, userName, order)
        return data
    } catch (error) {
        console.error("No se pudo enviar el mail ", error.message)
    }
}

export async function saleAlert(userId: string, order: string, price: number) {
    try {
        const data = await sendSaleConfirmed(userId, order, price)
        return data
    } catch (error) {
        console.error("No se pudo enviar el mail ", error.message)
    }
}