import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

export const sendResetVerificationEmail = async (email, otp, userName) => {
    try {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            throw new Error("RESEND_API_KEY is missing in environment variables");
        }

        const resend = new Resend(apiKey);
        const targetEmail = email ? email.trim() : "";

        const data = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: targetEmail,
            subject: 'Reset Your Password - OTP',
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>

            <body style="
                margin:0;
                padding:0;
                background:#f1f5f9;
                font-family:Arial,sans-serif;
            ">

                <div style="
                    max-width:600px;
                    margin:40px auto;
                    background:#ffffff;
                    border-radius:12px;
                    overflow:hidden;
                    box-shadow:0 4px 20px rgba(0,0,0,0.08);
                ">

                    <!-- Header -->
                    <div style="
                        background:#2563eb;
                        padding:22px;
                        text-align:center;
                        color:#ffffff;
                    ">
                        <h2 style="margin:0;">
                            🔐 URL-Shortener
                        </h2>
                    </div>

                    <!-- Content -->
                    <div style="padding:35px 30px;">

                        <h1 style="
                            color:#111827;
                            font-size:24px;
                        ">
                            Reset Your Password
                        </h1>

                        <p style="
                            color:#374151;
                            font-size:15px;
                        ">
                            Hi <strong>${userName || 'User'}</strong>,
                        </p>

                        <p style="
                            color:#6b7280;
                            line-height:1.6;
                            font-size:14px;
                        ">
                            We received a request to reset your password.
                            Use the OTP below to continue.
                        </p>

                        <!-- OTP -->
                        <div style="
                            text-align:center;
                            margin:30px 0;
                        ">

                            <div style="
                                display:inline-block;
                                background:#eff6ff;
                                border:2px dashed #2563eb;
                                border-radius:10px;
                                padding:18px 35px;
                            ">

                                <span style="
                                    color:#1d4ed8;
                                    font-size:32px;
                                    font-weight:bold;
                                    letter-spacing:8px;
                                ">
                                    ${otp}
                                </span>

                            </div>

                        </div>

                        <p style="
                            text-align:center;
                            color:#ef4444;
                            font-size:14px;
                            font-weight:bold;
                        ">
                            ⏱ This OTP is valid for 2 minutes.
                        </p>

                        <hr style="
                            border:0;
                            border-top:1px solid #e5e7eb;
                            margin:30px 0;
                        ">

                        <p style="
                            color:#6b7280;
                            font-size:13px;
                            line-height:1.6;
                        ">
                            If you did not request a password reset,
                            you can safely ignore this email.
                        </p>

                        <p style="
                            color:#374151;
                            font-size:14px;
                            margin-top:25px;
                        ">
                            Stay secure 🔒
                        </p>

                    </div>

                    <!-- Footer -->
                    <div style="
                        background:#f8fafc;
                        padding:20px;
                        text-align:center;
                    ">

                        <p style="
                            margin:0;
                            color:#6b7280;
                            font-size:12px;
                        ">
                            © 2026 URL-Shortener. All rights reserved.
                        </p>

                    </div>

                </div>

            </body>
            </html>
            `
        });

        console.log("Reset Email sent successfully via Resend:", data);
        return data;

    } catch (error) {
        console.error("Reset Email sending error:", error.message || error);
        throw error;
    }
};