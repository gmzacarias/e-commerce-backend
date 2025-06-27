import {
    Html,
    Head,
    Body,
    Container,
    Img,
    Link,
    Section,
    Text,
    Button,
    Row,
    Column,
} from "@react-email/components";

const main = {
    backgroundColor: "#FFF",
};

const container = {
    backgroundColor: "#F4F4F4",
    padding: "10px",
    width: "100%",
};

const imageSection = {
    borderBottom: "solid 1px #B7C7C8",
    padding: "10px 0",
    textAlign: "center" as const,
};

const orderDetailsSection = {
    paddingBottom: "10px",
};
const footerSection = {
    borderTop: "solid 1px #B7C7C8",
    paddingTop: "10px",
    height: 30,
    textAlign: "center" as const,
};

const orderSummaryRow = {
    border: "solid 1px #B7C7C8",
};

const productContainer = {
    backgroundColor: "#F4F4F4",
    borderLeft: "solid 1px #B7C7C8",
    borderRight: "solid 1px #B7C7C8",
    borderBottom: "solid 1px #B7C7C8",
    textAlign: "left" as const,
};

const productItem = {
    borderBottom: "solid 1px #B7C7C8",
};

const text = {
    fontFamily: "sans-serif",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#0E0E0E",
    margin: 0,
    padding: 5,
    lineHeight: "none",
};

const descriptionText = {
    ...text,
    fontSize: "12px",
};

const linkText = {
    ...descriptionText,
    textDecoration: "none",
};

const button = {
    ...descriptionText,
    backgroundColor: "#0E0E0E",
    borderRadius: 5,
    width: "50%",
    padding: 10,
    textAlign: "center" as const,
    color: "#F4F4F4",
};

export function paymentMail({ userName, order }: paymentProps) {
    return (
        <Html>
            <Head />
            <Body style={main}>
                <Container style={container}>
                    <Section style={imageSection}>
                        <Img
                            src="https://res.cloudinary.com/dkwjm2ocu/ukudm8olr7crts5seziv.png"
                            width="178"
                            height="68"
                            alt="Smartshop logo"
                            style={{ display: "block", margin: "0 auto" }}
                        />
                    </Section>
                    <Section>
                        <Text style={text}>
                            Hola {userName} 👋 <br />
                            <br />
                            ¡Gracias por comprar en Smartshop! <br />
                            Tu pedido #{order.orderId} ha sido confirmado con éxito el dia {order.created as any}.
                        </Text>
                    </Section>
                    <Section>
                        <Text style={{ ...text, textAlign: "left" }}>
                            Resumen del pedido
                        </Text>
                        <Row style={orderSummaryRow}>
                            <Column
                                width={"60%"}
                                style={{ borderRight: "solid 1px #B7C7C8" }}
                            >
                                <Text
                                    style={{
                                        ...descriptionText,
                                        textAlign: "center",
                                    }}
                                >
                                    Productos
                                </Text>
                            </Column>
                            <Column
                                width={"20%"}
                                style={{ borderRight: "solid 1px #B7C7C8" }}
                            >
                                <Text
                                    style={{
                                        ...descriptionText,
                                        textAlign: "center",
                                    }}
                                >
                                    Cantidad
                                </Text>
                            </Column>
                            <Column width={"20%"}>
                                <Text style={{ ...descriptionText, textAlign: "center" }}>
                                    Precio
                                </Text>
                            </Column>
                        </Row>
                        <Section style={productContainer}>
                            {order.products.map((product, index) => (
                                <Row key={index} style={productItem}>
                                    <Column
                                        width={"60%"}
                                        style={{ borderRight: "solid 1px #B7C7C8" }}
                                    >
                                        <Row>
                                            <Column align="left" width={75}>
                                                <Img
                                                    src={product.photo}
                                                    alt={product.model}
                                                    width="75"
                                                    height="75"
                                                    style={{ display: "block", margin: "0 auto" }}
                                                />
                                            </Column>
                                            <Column>
                                                <Text
                                                    style={{ ...descriptionText, paddingLeft: "10px" }}
                                                >
                                                    {product.brand} <br />
                                                    {product.familyModel} {product.model}
                                                </Text>
                                            </Column>
                                        </Row>
                                    </Column>
                                    <Column
                                        width={"20%"}
                                        style={{ borderRight: "solid 1px #B7C7C8" }}
                                    >
                                        <Text style={{ ...descriptionText, textAlign: "center" }}>
                                            {product.quantity}
                                        </Text>
                                    </Column>
                                    <Column width={"20%"}>
                                        <Text style={{ ...descriptionText, textAlign: "center" }}>
                                            ${product.price * product.quantity}
                                        </Text>
                                    </Column>
                                </Row>
                            ))}
                            <Row>
                                <Column width={"80%"}>
                                    <Text
                                        style={{
                                            ...descriptionText,
                                            paddingLeft: "5px",
                                            textAlign: "right",
                                        }}
                                    >
                                        Precio total de la compra:
                                    </Text>
                                </Column>
                                <Column width={"20%"}>
                                    <Text style={{ ...descriptionText, textAlign: "center" }}>
                                        ${order.payment.transactionTotalAmount}
                                    </Text>
                                </Column>
                            </Row>
                        </Section>
                    </Section>
                    <Section style={orderDetailsSection}>
                        <Text style={descriptionText}>
                            👉 Podés ver el estado de tu pedido en cualquier momento desde tu
                            cuenta:
                        </Text>
                        <Row>
                            <Column align="center">
                                <Button
                                    href={`https://e-commerce-smartshop.vercel.app/me/myOrders/${order.orderId}`}
                                    style={button}
                                >
                                    Ver mi pedido
                                </Button>
                            </Column>
                        </Row>
                    </Section>
                    <Text style={text}>
                        ¡Gracias por elegirnos! <br />
                        El equipo de Smartshop.
                    </Text>
                    <Section style={footerSection}>
                        <Link
                            href="https://e-commerce-smartshop.vercel.app"
                            target="_blank"
                            style={linkText}
                        >
                            SMARTSHOP.COM
                        </Link>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}