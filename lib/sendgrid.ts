import sgMail from "@sendgrid/mail"
import { render } from "@react-email/render"
import { CodeMail } from "components/mails"

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const sender = process.env.SENDGRID_SENDER

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

async function sendPaymentConfirmed() {

}

async function sendSaleConfirmed() {

}

