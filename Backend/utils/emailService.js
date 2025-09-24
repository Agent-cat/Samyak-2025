import nodemailer from 'nodemailer';
import { Buffer } from 'buffer';
import dotenv from "dotenv"
import PDFDocument from 'pdfkit';
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

// Generate an ID Card PDF buffer with user's details and QR code
const generateIdCardPdfBuffer = async (user, qrCodeDataUrl) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: [350, 550], margin: 24 }); // portrait small card
            const chunks = [];
            doc.on('data', (c) => chunks.push(c));
            doc.on('end', () => resolve(Buffer.concat(chunks)));

            // Colors
            const primary = '#111827'; // gray-900
            const accent = '#ef4444'; // red-500
            const light = '#ffffff';

            // Card background
            doc.rect(0, 0, doc.page.width, doc.page.height).fill(primary);

            // Header strip
            doc.save();
            doc.rect(0, 0, doc.page.width, 70).fill(accent);
            doc.fill(light).fontSize(20).font('Helvetica-Bold').text('SAMYAK 2025', 24, 22);
            doc.restore();

            // Profile image (optional)
            let profileBuffer = null;
            try {
                if (user?.profileImage && /^https?:\/\//i.test(user.profileImage)) {
                    const res = await fetch(user.profileImage);
                    if (res.ok) {
                        profileBuffer = Buffer.from(await res.arrayBuffer());
                    }
                }
            } catch (_) { /* ignore image errors */ }

            const contentTop = 90;
            const left = 24;

            if (profileBuffer) {
                // Draw circular backdrop; image rendered on top
                const imgSize = 90;
                doc.circle(left + imgSize/2, contentTop + imgSize/2, imgSize/2).fill(light);
                doc.image(profileBuffer, left, contentTop, { width: imgSize, height: imgSize });
            }

            // User details
            const textLeft = profileBuffer ? left + 110 : left;
            doc.fill(light).font('Helvetica-Bold').fontSize(16).text(user?.fullName || 'Participant', textLeft, contentTop);
            doc.font('Helvetica').fontSize(12).fill('#d1d5db').text(`College: ${user?.college || 'N/A'}`, textLeft, contentTop + 24);
            if (user?.collegeId) {
                doc.text(`ID: ${user.collegeId}`, textLeft, contentTop + 42);
            }

            // Divider
            doc.moveTo(left, contentTop + 110).lineTo(doc.page.width - left, contentTop + 110).strokeColor('#374151').lineWidth(1).stroke();

            // QR code image from data URL
            const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
            const qrBuffer = Buffer.from(base64Data, 'base64');
            const qrSize = 180;
            const qrX = (doc.page.width - qrSize) / 2;
            const qrY = contentTop + 130;
            doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

            // Footer text
            doc.fill('#9ca3af').fontSize(10).text('Present this ID at the gate with a valid photo ID.', left, qrY + qrSize + 16, { width: doc.page.width - left * 2, align: 'center' });
            doc.fill('#9ca3af').text('Valid for entry on Oct 9, 10, 11.', left, qrY + qrSize + 30, { width: doc.page.width - left * 2, align: 'center' });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

export const sendEmailWithAttachment = async (email, qrCodeDataUrl, user) => {
    try {
        const pdfBuffer = await generateIdCardPdfBuffer(user || {}, qrCodeDataUrl);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Samyak ID Card (with QR)',
            html: `
        <p>Thank you for registering for KL SAMYAK.</p>
        <p>Your ID card is attached as a PDF. It contains your details and QR for entry.</p>
        <p><strong>Note:</strong> Please present this ID card and a valid photo ID at the gate on Oct 9, 10, and 11.</p>
      `,
            attachments: [
                {
                    filename: `Samyak-ID-${(user?.collegeId || user?.fullName || 'participant').toString().replace(/[^a-z0-9_-]/gi, '_')}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
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
