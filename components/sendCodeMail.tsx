import {
    Html,
    Head,
    Body,
    Container,
    Img,
    Link,
    Section,
    Text,
} from "@react-email/components";

const main = {
    backgroundColor: "#FFF",
};

const container = {
    backgroundColor: "#F4F4F4",
    padding: "10px",
    width: "100%",
};

const text = {
    fontFamily: "sans-serif",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#0E0E0E",
};

const imageSection = {
    borderBottom: "solid 1px #B7C7C8",
    padding: "10px 0",
    textAlign: "center" as const,
};

const codeContainer = {
    backgroundColor: "#E2E5DE",
    padding: "5px 0",
    width: "50%",
    textAlign: "center" as const,
};

const footerSection = {
    borderTop: "solid 1px #B7C7C8",
    textAlign: "center" as const,
    height: 30,
    paddingTop: "10px",
};

const mainText = {
    ...text,
    fontSize: "18px",
};

const codeText = {
    ...text,
    fontSize: "32px",
};

const linkText = {
    ...text,
    fontSize: "12px",
    textDecoration: "none",
};

export function sendCodeMail({ code }: codeProps) {
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
                        <Text style={mainText}>
                            Hola 👋 <br /><br />
                            Recibimos una solicitud para iniciar sesión en tu cuenta de
                            Smartshop. <br />
                            Usá el siguiente código para continuar:
                        </Text>
                    </Section>
                    <Section style={codeContainer}>
                        <Text style={codeText}>{code}</Text>
                    </Section>
                    <Section>
                        <Text style={text}>
                            Este código es válido por 30 minutos. <br />
                            Si no fuiste vos quien solicitó este código, podés ignorar este
                            correo de forma segura.
                        </Text>
                        <Text style={text}>
                            Gracias. <br />
                            El equipo de Smartshop.
                        </Text>
                    </Section>
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
