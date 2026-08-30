import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

export const sendVerificationEmail = async (email, code) => {
    try {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            throw new Error("RESEND_API_KEY is missing in environment variables");
        }

        // Resend yahan initialize hoga (Function ke andar)
        const resend = new Resend(apiKey);
        const targetEmail = email ? email.trim() : "";

        const data = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: targetEmail,
            subject: 'Verify Your Email',
            html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Email Verification</h2>
                <p>Your OTP code is: <b style="font-size: 24px; color: #2563eb;">${code}</b></p>
                <p>This code expires in 10 minutes.</p>
            </div>
            `
        });

        console.log("Email Sent Successfully via Resend API:", data);
        return data;
    } catch (error) {
        console.error("EXACT EMAIL ERROR:", error.message || error);
        throw error;
    }
};