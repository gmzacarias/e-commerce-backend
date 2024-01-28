import emailjs from '@emailjs/browser';

const serviceId = process.env.SERVICE_ID
const templateId = process.env.TEMPLATE_ID_SEND_CODE_AUTH
const publicKey = process.env.EMAILJS_KEY

type sendData = {
    email: string,
    code: number
}

export async function SendCodeAuth(email: string, code: number) {
    const data: sendData = {
        email: email,
        code: code,
    }
    
    try {
        const sendMail = await emailjs.send(serviceId, templateId, data, publicKey)
        console.log(`Envio de mail: status${sendMail.status}, text:${sendMail.text}`)
        return sendMail
    } catch (error) {
        console.error("Send mail error", error.message)
        return null
    }
}
