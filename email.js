import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

export const sendVerificationEmail = async (email, code) => {
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
            subject: 'Verify Your Email - URL Shortener',
            html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verify Your Email</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
                <tr>
                  <td align="center" style="padding: 40px 10px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);">
                      
                      <!-- Header -->
                      <tr>
                        <td align="center" style="background-color: #2563eb; padding: 30px 20px;">
                          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">URL Shortener</h1>
                        </td>
                      </tr>

                      <!-- Body Content -->
                      <tr>
                        <td style="padding: 40px 30px; text-align: center;">
                          <h2 style="color: #1f2937; margin-top: 0; margin-bottom: 12px; font-size: 20px; font-weight: 600;">Verify Your Email Address</h2>
                          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 28px 0;">
                            Thank you for joining us! Please use the verification code below to complete your registration.
                          </p>

                          <!-- OTP Box -->
                          <div style="background-color: #eff6ff; border: 2px dashed #2563eb; border-radius: 8px; padding: 18px 20px; display: inline-block; margin-bottom: 28px;">
                            <span style="font-size: 32px; font-weight: 700; color: #2563eb; letter-spacing: 6px; font-family: monospace;">${code}</span>
                          </div>

                          <!-- Notice -->
                          <p style="color: #dc2626; font-size: 13px; margin: 0 0 20px 0; font-weight: 500;">
                            ⏰ This OTP code will expire in 10 minutes.
                          </p>

                          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />

                          <p style="color: #9ca3af; font-size: 13px; margin: 0;">
                            If you didn't request this email, you can safely ignore it.
                          </p>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td align="center" style="background-color: #f9fafb; padding: 20px; border-top: 1px solid #f3f4f6;">
                          <p style="color: #6b7280; font-size: 12px; margin: 0;">
                            © 2026 URL Shortener. All rights reserved.
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            `
        });

        console.log("Styled Email Sent Successfully via Resend:", data);
        return data;
    } catch (error) {
        console.error("EXACT EMAIL ERROR:", error.message || error);
        throw error;
    }
};