export function paymentMail({ userName, order }: paymentProps) {
    return (
        <div>
            <h1>Hola {userName} tu compra fue exitosa</h1>
            <h3>codigo de orden:{order}</h3>
            <p>Podes chequear el estado de tus compras, en mis ordenes</p>
        </div>
    )
}