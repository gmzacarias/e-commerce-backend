import * as React from 'react';
import { Html } from "@react-email/html"

type codeProps = {
    code: number
}

type paymentProps = {
    userName?: string,
    order: string
}

type saleProps = {
    userId: string,
    order: string,
    price: number,
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

export function PaymentMail({ userName, order }: paymentProps) {
    return (
        <div>
            <h1>Hola {userName} tu compra fue exitosa</h1>
            <h3>codigo de orden:{order}</h3>
            <p>Podes chequear el estado de tus compras, en mis ordenes</p>
        </div>
    )
}

export function SaleMail({ userId,order, price }: saleProps) {
    return (
        <div>
            <h1>Recibiste una aprobacion de compra</h1>
            <p>codigo de orden:{order}</p>
            <p>userId:{userId}</p>
            <p>Precio:${price}</p>
        </div>
    )
}