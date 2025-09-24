import nodemailer from 'nodemailer';
import { Buffer } from 'buffer';
import dotenv from "dotenv"
dotenv.config();

console.log(process.env.EMAIL_USER,process.env.EMAIL_PASSWORD)
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
            subject: 'Email Verification - Samyak Fest By Kl University',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6b46c1;">Verify Your Email</h2>
          <p> Your OTP for Email Verification to register in samyak fest is:</p>
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
        
        const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
        const qrCodeBuffer = Buffer.from(base64Data, 'base64');

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Registration QR Code',
            html: `
        <p>Thank you for registering for KL SAMYAK. </p> 
        <h1>Note: Please present this QR code at the gate for entry into the college on october 9,10 and 11.</h1>
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

export const sendKLUApprovalEmail = async (email, password) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Samyak Account Created - KL University',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
          <h2 style="color: #6b46c1;">Welcome to Samyak</h2>
          <p>Thanks for paying the event fee in the ERP portal. Your account has been created.</p>
          <div style="background:#f4f4f5; padding:12px 16px; border-radius:8px; margin:16px 0;">
            <p style="margin:0;">Login Email: <strong>${email}</strong></p>
            <p style="margin:4px 0 0;">Temporary Password: <strong>${password}</strong></p>
          </div>
          <p style="margin-top:12px;">Please log in and change your password after your first login.</p>
        </div>
      `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error in sendKLUApprovalEmail:', error);
        return false;
    }
};
