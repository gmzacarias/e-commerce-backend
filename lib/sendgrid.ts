import sgMail from "@sendgrid/mail"
import { render } from "@react-email/render"
import { CodeMail, PaymentMail, SaleMail } from "components/mails"

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const sender = process.env.SENDGRID_SENDER
const adminEmail=process.env.ADMIN_EMAIL

export async function sendCodeAuth(email: string, code: number) {
    const mailHtml = render(CodeMail({ code: code }))
    const msg = {
        to: email,
        from: sender, // Use the email address or domain you verified above
        subject: 'Codigo Inicio de sesion',
        html: mailHtml,
    };
    try {
        await sgMail.send(msg)
    } catch (error) {
        console.error("Email no enviado", error.message)
    }
}

export async function sendPaymentConfirmed(email: string, userName: string, order: string) {
    const mailHtml = render(PaymentMail({ userName: userName, order: order }))
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

export async function sendSaleConfirmed(userId: string, order: string, price: number) {
    const mailHtml = render(SaleMail({ userId: userId, order: order, price: price }))
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

