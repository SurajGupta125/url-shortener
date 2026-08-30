import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendVerificationEmail = async (email, code) => {
    try {
        const targetEmail = email ? email.trim() : "";
        if (!targetEmail) {
            throw new Error("Target email address is missing");
        }
        
        const info = await transporter.sendMail({
            from: `"URL Shortener" <${process.env.EMAIL_USER}>`,
            to: targetEmail,
            subject: "Verify Your Email",
            text: `Your OTP is: ${code}`,
            html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Email Verification</h2>
                <p>Your OTP code is: <b style="font-size: 24px; color: #2563eb;">${code}</b></p>
                <p>This code expires in 10 minutes.</p>
            </div>
            `
        });

        console.log("Email Sent Successfully to:", targetEmail, "ID:", info.messageId);
        return info;
    } catch (error) {
        console.error("EXACT EMAIL ERROR:", error.message || error);
        throw error;
    }
};