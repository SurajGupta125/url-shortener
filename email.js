import nodemailer from 'nodemailer'

import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendVerificationEmail = async (email, code) => {

    try {

        await transporter.sendMail({

            from: process.env.EMAIL_USER,

            to: email,

            subject: "Verify Your Email",

            html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Email Verification</title>
</head>

<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0"
style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 0 15px rgba(0,0,0,.1);">

<tr>
<td style="background:#2563eb;padding:25px;text-align:center;">

<h1 style="color:#ffffff;margin:0;">
Email Verification
</h1>

</td>
</tr>

<tr>
<td style="padding:35px;">

<h2 style="margin-top:0;color:#111827;">
Hello 👋
</h2>

<p style="font-size:16px;color:#4b5563;line-height:1.7;">
Thank you for registering.
Use the verification code below to verify your email address.
</p>

<div style="margin:35px 0;text-align:center;">

<div style="
display:inline-block;
background:#eff6ff;
border:2px dashed #2563eb;
padding:18px 40px;
border-radius:10px;
font-size:34px;
font-weight:bold;
letter-spacing:8px;
color:#2563eb;
">

${code}

</div>

</div>

<p style="font-size:15px;color:#ef4444;text-align:center;">
⏰ This OTP is valid for only <b>10 minutes</b>.
</p>

<hr style="border:none;border-top:1px solid #e5e7eb;margin:30px 0;">

<p style="font-size:14px;color:#6b7280;line-height:1.7;">
If you didn't request this verification,
please ignore this email.
</p>

</td>
</tr>

<tr>
<td style="background:#f9fafb;padding:20px;text-align:center;">

<p style="margin:0;font-size:13px;color:#6b7280;">
© 2026 URL Shortener
</p>

<p style="margin-top:8px;font-size:12px;color:#9ca3af;">
Secure Authentication System
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

        console.log("Email Sent Successfully");

    } catch (error) {

        console.log(error);

    }

};