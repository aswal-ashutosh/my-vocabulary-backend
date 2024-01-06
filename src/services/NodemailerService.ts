import nodemailer from "nodemailer";
import Config from "../config";

export default abstract class NodemailerService {
    private static readonly _transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: Config.NODEMAILER_USER,
            pass: Config.NODEMAILER_PASSWORD,
        },
    });
    static async sendOTPVerificationMail(to: string, otp: number) {
        const mailContent = `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Email Verification</title>
                    <style>
                        body {
                        font-family: 'Arial', sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f4;
                        }

                        .container {
                        max-width: 600px;
                        margin: 30px auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 5px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        }

                        h2 {
                        color: #333333;
                        }

                        p {
                        color: #666666;
                        }

                        .otp-container {
                        margin-top: 20px;
                        padding: 15px;
                        background-color: #e6e6e6;
                        border-radius: 5px;
                        text-align: center;
                        font-size: 24px;
                        color: #333333;
                        }

                        .footer {
                        margin-top: 20px;
                        text-align: center;
                        color: #666666;
                        }
                    </style>
                </head>

                <body>
                    <div class="container">
                        <h2>Email Verification</h2>
                        <p>Dear user,</p>
                        <p>Thank you for registering with our platform. To complete your registration, please use the following OTP (One-Time Password) code:</p>

                        <div class="otp-container">
                            <strong>${otp}</strong>
                        </div>

                        <p>This OTP is valid for a limited time. Do not share it with anyone.</p>

                        <div class="footer">
                            <p>If you didn't request this verification, please ignore this email.</p>
                            <p>Thank you,<br>My Vocabulary</p>
                        </div>
                    </div>
                </body>

            </html>
        `;
        await NodemailerService._transporter.sendMail({
            from: "My Vocabulary",
            to,
            subject: "My Vocabulary Verification",
            html: mailContent,
        });
    }
}
