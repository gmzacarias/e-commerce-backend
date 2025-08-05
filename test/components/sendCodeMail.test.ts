import { render as renderEmail } from "@react-email/render"
import { sendCodeMail } from "components/sendCodeMail"

describe("sendCodeMail", () => {
    it("should include the code inside the HTML", () => {
        const html = renderEmail(sendCodeMail({ code: 123456 }));
        expect(html).toContain("123456");
        expect(html).toContain("Recibimos una solicitud para iniciar sesión");
        expect(html).toContain("Este código es válido por 30 minutos");
    })

    it("should include the logo within the html", () => {
        const html = renderEmail(sendCodeMail({ code: 123456 }));
        expect(html).toContain("https://res.cloudinary.com/dkwjm2ocu/ukudm8olr7crts5seziv.png");
        expect(html).toContain('alt="Smartshop logo"');
    })

    it("should include a link in the footer", () => {
        const html = renderEmail(sendCodeMail({ code: 123456 }));
        expect(html).toContain('href="https://e-commerce-smartshop.vercel.app"');
        expect(html).toContain(">SMARTSHOP.COM<");
    })
})
