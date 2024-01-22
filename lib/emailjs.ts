import emailjs from '@emailjs/browser';

const serviceId = process.env.SERVICE_ID
const templateId = process.env.TEMPLATE_ID_SEND_CODE_AUTH
const publicKey = process.env.PUBLIC_KEY

export async function SendCodeAuth(email, code) {
    const data = {
        email: email,
        code: code,
    }
    try {
        const sendMail = await emailjs.send(serviceId, templateId, data, publicKey)
        console.log(sendMail.status, sendMail.text)
        return sendMail
    } catch (error) {
        console.error("Send mail error", error)
    }
}
