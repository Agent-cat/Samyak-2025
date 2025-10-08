import nodemailer from 'nodemailer';
import { Buffer } from 'buffer';
import dotenv from "dotenv"
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { PDFDocument as PDFLib, rgb, StandardFonts } from 'pdf-lib';
dotenv.config();


const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',    
        port: 587,
        secure: false,
auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
},
    tls:{
    rejectUnauthorized:false
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


const generateIdCardPdfBuffer = async (user, qrCodeDataUrl) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: [350, 550], margin: 24 }); 
            const chunks = [];
            doc.on('data', (c) => chunks.push(c));
            doc.on('end', () => resolve(Buffer.concat(chunks)));

            
            const primary = '#111827'; 
            const accent = '#ef4444'; 
            const light = '#ffffff';

            // Card background
            doc.rect(0, 0, doc.page.width, doc.page.height).fill(primary);

           
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

          
            doc.moveTo(left, contentTop + 110).lineTo(doc.page.width - left, contentTop + 110).strokeColor('#374151').lineWidth(1).stroke();

           
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

export const generateCertificatePdfBuffer = async ({
  fullName,
  college,
  collegeId,
  eventTitle,
  templateImagePath,
}) => {
  // Preferred: draw on provided Backend/certificate.pdf template using pdf-lib
  try {
    // IMPORTANT: server runs from Backend/, so the template is at ./certificate.pdf
    const templatePath = path.resolve(process.cwd(), 'certificate.pdf');
    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFLib.load(templateBytes);
    const page = pdfDoc.getPages()[0];

    const { width, height } = page.getSize();
    // Use Helvetica font variants
    const helv = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helvBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Helper to center text at (y), with font and size
    const drawCentered = (text, y, size = 18, bold = false, color = rgb(0, 0, 0)) => {
      const font = bold ? helvBold : helv;
      const textWidth = font.widthOfTextAtSize(text, size);
      const x = (width - textWidth) / 2;
      page.drawText(text, { x, y, size, font, color });
    };

    // Helper config reader
    const num = (key, def) => {
      const raw = process.env[key];
      const n = raw !== undefined ? Number(raw) : NaN;
      return Number.isFinite(n) ? n : def;
    };
    const str = (key, def) => (process.env[key] ?? def);

    // EASY POSITION CONTROLS (y is from bottom; +y moves up)
    // Name
    const NAME_Y = num('CERT_NAME_Y', height - 405);
    const NAME_SIZE = num('CERT_NAME_SIZE', 20);
    const NAME_X_OFFSET = num('CERT_NAME_X_OFFSET', -170); // shifts from centered X (negative left, positive right)
    // ID
    const ID_Y = num('CERT_ID_Y', height - 405);
    const ID_SIZE = num('CERT_ID_SIZE', 16);
    const ID_X = process.env.CERT_ID_X !== undefined ? num('CERT_ID_X', (width - 160)) : null; // absolute X (takes priority)
    const ID_RIGHT_MARGIN = num('CERT_ID_RIGHT_MARGIN', 160); // if CERT_ID_X not set, align from right edge
    // College
    const COLLEGE_Y = num('CERT_COLLEGE_Y', height - 445);
    const COLLEGE_SIZE = num('CERT_COLLEGE_SIZE', 18);
    const COLLEGE_X_OFFSET = num('CERT_COLLEGE_X_OFFSET', -300);
    // Event Title
    const EVENT_Y = num('CERT_EVENT_Y', height - 485);
    const EVENT_SIZE = num('CERT_EVENT_SIZE', 20);
    const EVENT_X_OFFSET = num('CERT_EVENT_X_OFFSET', -420);

    // Render Name (centered + optional X offset)
    if (fullName) {
      const text = String(fullName);
      const font = helvBold;
      const size = NAME_SIZE;
      const textWidth = font.widthOfTextAtSize(text, size);
      const cx = (width - textWidth) / 2;
      const x = cx + NAME_X_OFFSET;
      page.drawText(text, { x, y: NAME_Y, size, font, color: rgb(0, 0, 0) });
    }

    // Render ID (absolute X if provided, else right-aligned with margin)
    if (collegeId) {
      const text = String(collegeId);
      const font = helvBold;
      const size = ID_SIZE;
      const textWidth = font.widthOfTextAtSize(text, size);
      const x = ID_X !== null ? ID_X : (width - textWidth - ID_RIGHT_MARGIN);
      page.drawText(text, { x, y: ID_Y, size, font, color: rgb(0, 0, 0) });
    }

    // College (centered + offset)
    if (college) {
      const text = String(college);
      const font = helvBold;
      const size = COLLEGE_SIZE;
      const textWidth = font.widthOfTextAtSize(text, size);
      const cx = (width - textWidth) / 2;
      const x = cx + COLLEGE_X_OFFSET;
      page.drawText(text, { x, y: COLLEGE_Y, size, font, color: rgb(0, 0, 0) });
    }

    // Event title (centered + offset)
    if (eventTitle) {
      const text = String(eventTitle);
      const font = helvBold;
      const size = EVENT_SIZE;
      const textWidth = font.widthOfTextAtSize(text, size);
      const cx = (width - textWidth) / 2;
      const x = cx + EVENT_X_OFFSET;
      page.drawText(text, { x, y: EVENT_Y, size, font, color: rgb(0, 0, 0) });
    }

    const out = await pdfDoc.save();
    return Buffer.from(out);
  } catch (err) {
    // Fallback to previous dynamic rendering if template missing
    return await new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
        const chunks = [];
        doc.on('data', (c) => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        doc.rect(0, 0, pageWidth, pageHeight).fill('#ffffff');
        doc.fill('#000').font('Helvetica-Bold').fontSize(26).text('CERTIFICATE OF PARTICIPATION', 0, 120, { width: pageWidth, align: 'center' });
        const lineYStart = 210;
        doc.font('Helvetica').fontSize(14).fill('#111111');
        doc.text(`This is to certify that  Mr./Ms. ${fullName || ''} , bearing ID No. ${collegeId || ''} ,`, 80, lineYStart, { width: pageWidth - 160, align: 'center' });
        doc.text(`from ${college || ''} has participated in Technical / Non-Technical event:`, 80, lineYStart + 28, { width: pageWidth - 160, align: 'center' });
        doc.font('Helvetica-Bold').text(`${eventTitle || ''}`, 80, lineYStart + 54, { width: pageWidth - 160, align: 'center' });
        doc.end();
      } catch (e2) { reject(e2); }
    });
  }
};

export const sendCertificateEmail = async ({ toEmail, fullName, college, collegeId, eventTitle, templateImagePath }) => {
  try {
    const pdfBuffer = await generateCertificatePdfBuffer({ fullName, college, collegeId, eventTitle, templateImagePath });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: `Certificate of Participation - ${eventTitle || 'SAMYAK 2025'}`,
      html: `<p>Dear ${fullName || 'Participant'},</p>
             <p>Thank you for your participation in SAMYAK 2025. Please find attached your Certificate of Participation.</p>
             <p>Regards,<br/>SAMYAK Team</p>`,
      attachments: [
        {
          filename: `Certificate-${(eventTitle || 'SAMYAK').toString().replace(/[^a-z0-9_-]/gi, '_')}-${(collegeId || 'participant').toString().replace(/[^a-z0-9_-]/gi, '_')}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('sendCertificateEmail error:', err);
    return false;
  }
};
