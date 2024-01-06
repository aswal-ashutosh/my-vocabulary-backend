import nodemailer from "nodemailer";

export default abstract class NodemailerService {
    private static readonly _transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASSWORD,
        },
    });
    static async sendEmail(to: string, subject: string, html: string) {
        await NodemailerService._transporter.sendMail({
            from: "My Vocabulary",
            to,
            subject,
            html,
        });
    }
}
