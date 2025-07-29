import { sendCodeAuth } from "services/sendgrid";
import { render } from "@react-email/render";
import { sendCodeMail } from "components/sendCodeMail";
import { sgMail } from "lib/sendgrid";

jest.mock("@react-email/render");
jest.mock("components/sendCodeMail");
jest.mock("lib/sendgrid", () => ({
    sgMail: { send: jest.fn() },
    sender: "test@smartshop.com",
}));

describe("test in function sendCodeAuth", () => {
    it("should render the email and send it", async () => {
        const email = "user@test.com";
        const code = 123456;
        (sendCodeMail as jest.Mock).mockReturnValue({ component: "mailComponent" });
        (render as jest.Mock).mockReturnValue("<html>email content</html>");
        await sendCodeAuth(email, code);
        expect(sendCodeMail).toHaveBeenCalledWith({ code });
        expect(render).toHaveBeenCalledWith({ component: "mailComponent" });
        expect(sgMail.send).toHaveBeenCalledWith({
            to: email,
            from: "test@smartshop.com",
            subject: "🔐 Código de verificación para iniciar sesión en Smartshop",
            html: "<html>email content</html>",
        });
    })

    it("should throw an error when sgmail fails to send the email", async () => {
        const error = new Error("hubo un problema al enviar el email");
        (sendCodeMail as jest.Mock).mockReturnValue({ component: "mailComponent" });
        (render as jest.Mock).mockReturnValue("<html>email content</html>");
        (sgMail.send as jest.Mock).mockRejectedValueOnce(error);
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        await sendCodeAuth("test@test.com", 111111);
        expect(consoleSpy).toHaveBeenCalledWith("Email no enviado", error.message);
        expect(sendCodeMail).toHaveBeenCalledWith({ code: 123456 });
        expect(render).toHaveBeenCalledWith({ component: "mailComponent" });
        expect(sgMail.send).toHaveBeenCalledWith({
            to: "user@test.com",
            from: "test@smartshop.com",
            subject: "🔐 Código de verificación para iniciar sesión en Smartshop",
            html: "<html>email content</html>",
        });
    })
});