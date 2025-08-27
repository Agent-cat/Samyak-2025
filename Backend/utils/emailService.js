import nodemailer from 'nodemailer';
import { Buffer } from 'buffer';

const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});

export const sendOTPEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Verification - Surabhi Fest By Kl University',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6b46c1;">Verify Your Email</h2>
          <p> Your OTP for Email Verification to register in Surabhi fest is:</p>
          <h1 style="color: #6b46c1; font-size: 32px; letter-spacing: 5px; margin: 20px 0;">${otp}</h1>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
        </div>
      `
        };

        console.log('Sending mail with options:', { ...mailOptions, html: '[HIDDEN]' });

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error in sendOTPEmail:', error);
        if (error.code === 'EAUTH') {
            console.error('Authentication error - check email credentials');
        }
        return false;
    }
};

export const sendEmailWithAttachment = async (email, qrCodeDataUrl) => {
    try {
        // Convert data URL to a buffer
        const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
        const qrCodeBuffer = Buffer.from(base64Data, 'base64');

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Registration QR Code',
            html: `
        <p>Thank you for registering for KL SURABHI. </p> 
        <h1>Note: Please present this QR code at the gate for entry into the college on March 7 and 8.</h1>
        <p>Your QR code is attached below </p>
      `,
            attachments: [
                {
                    filename: 'qr-code.png',
                    content: qrCodeBuffer,
                    contentType: 'image/png'
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error in sendEmailWithAttachment:', error);
        return false;
    }
}; 