// import { EmailTemplate } from "components/email-template"
// import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);

// export async function SendCodeAuth(recipient: string,code:number) {
//     try {
//         const data = await resend.emails.send({
//             from: 'onboarding@resend.dev',
//             to: [recipient],
//             subject: 'Send code Auth',
//             react: EmailTemplate({ firstName: "John", code: code }),
//         });

//         console.log(data)
//         return Response.json(data);
//     } catch (error) {
//         return Response.json({ error });
//     }
// }
