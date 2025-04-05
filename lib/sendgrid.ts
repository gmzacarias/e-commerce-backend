import sgMail from "@sendgrid/mail"
import { render } from "@react-email/render"
import { CodeMail, PaymentMail, SaleMail } from "components/mails"


if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_SENDER || process.env.ADMIN_EMAIL) {
    throw new Error("faltan credenciales de Sendgrid en las variables de entorno")
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const sender = process.env.SENDGRID_SENDER
const adminEmail = process.env.ADMIN_EMAIL

export {sgMail,sender,adminEmail}



