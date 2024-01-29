import * as React from 'react';
import { Html } from "@react-email/html"

type codeProps = {
    code: number
}


export function CodeMail({ code }: codeProps) {
    return (
        <Html lang="en">
            <h1>Codigo para iniciar sesion</h1>
            <h1>{code}</h1>
            <p>este codigo expira en 30 minutos</p>
        </Html>
    )
}

export function PaymentMail(props) {
    const { code } = props
    return (
        <div>
            <h1>Hola te enviamos el codigo para iniciar Sesion</h1>
            <h3>{code}</h3>
            <p>"este codigo expira en 30 minutos"</p>
        </div>
    )
}

export function SaleMail(props) {
    const { code } = props
    return (
        <div>
            <h1>Hola te enviamos el codigo para iniciar Sesion</h1>
            <h3>{code}</h3>
            <p>"este codigo expira en 30 minutos"</p>
        </div>
    )
}