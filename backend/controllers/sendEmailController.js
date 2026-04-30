import transporter from '../config/nodemailer.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Setup directory paths to fetch the Logo from your frontend assets folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendContactEmail = async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Use SMTP_USER (verified Brevo sender) for best deliverability
    const senderEmail = process.env.SMTP_USER || process.env.EMAIL_USER;
    const companyEmail = process.env.COMPANY_EMAIL;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    console.log('Received contact form submission:', { name, normalizedEmail, subject, companyEmail });

    if (!name || !normalizedEmail || !subject || !message) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (!senderEmail || !companyEmail) {
        return res.status(500).json({ message: 'Email service is not configured. Missing SMTP_USER or COMPANY_EMAIL.' });
    }

    const logoPath = path.join(__dirname, '../../assets/images/Logo.png');
    const logoAttachment = fs.existsSync(logoPath)
        ? {
            filename: 'Logo.png',
            path: logoPath,
            cid: 'companyLogo',
            contentDisposition: 'inline',
            contentType: 'image/png'
        }
        : null;

    try {
        // 1. Email sent to the Company (Admin)
        const companyResult = await transporter.sendMail({
            from: senderEmail,
            to: companyEmail,
            replyTo: normalizedEmail,
            subject: `New Inquiry from ${name} - ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; background:#305797; padding:40px 16px;">
                    <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:8px; padding:30px 32px; text-align:left; color:#333; box-shadow:0 4px 15px rgba(0,0,0,0.2);">
                        <h2 style="color: #305797; margin-bottom:15px; font-size: 22px;">New Inquiry Details</h2>
                        
                        <p style="color:#555; font-size:15px; margin-bottom: 8px;"><strong>Subject:</strong> ${subject}</p>
                        <p style="color:#555; font-size:15px; margin-bottom: 8px;"><strong>Name:</strong> ${name}</p>
                        <p style="color:#555; font-size:15px; margin-bottom: 15px;"><strong>Email:</strong> ${normalizedEmail}</p>
                        <p style="color:#555; font-size:15px; margin-bottom: 8px;"><strong>Message:</strong></p>
                        
                        <div style="background: #f4f6f8; padding: 15px; border-left: 4px solid #305797; white-space: pre-wrap; margin-bottom:10px;">${message}</div>
                        
                        <hr style="margin:25px 0; border:none; border-top:1px solid #eee;" />
                        
                        <div style="text-align:center; color:#555; font-size:12px; margin-top: 15px;">
                            <p style="font-size:10px; margin-bottom:8px; color: #999;">This is an automated message, please do not reply.</p>
                            <p style="margin: 3px 0; font-weight: bold;">M&RC Travel and Tours</p>
                            <p style="margin: 3px 0;">info1@mrctravels.com</p>
                            <p style="margin: 3px 0;">&copy; ${new Date().getFullYear()} M&RC Travel and Tours. All rights reserved.</p>
                        </div>
                    </div>
                </div>`
        });

        console.log('✅ Contact email sent to admin:', companyEmail, '| Message ID:', companyResult?.messageId);

        // 2. Auto-reply sent to the Customer
        const customerResult = await transporter.sendMail({
            from: senderEmail,
            to: normalizedEmail,
            subject: 'We received your inquiry: ' + subject,
            html: `
                <div style="font-family:Arial, sans-serif; background:#305797; padding:40px 16px;">
                    <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:8px; padding:30px 32px; text-align:left; box-shadow:0 4px 15px rgba(0,0,0,0.2);">
                        <h2 style="color:#305797; margin-bottom:15px; font-size: 22px;">Welcome to M&RC Travel and Tours</h2>
                        
                        <p style="color:#555; font-size:16px; margin-bottom: 12px;">Hello <b>${name}</b>,</p>
                        
                        <p style="color:#555; font-size:15px; line-height:1.6; margin-bottom: 12px;">
                            Your message has been received and we will get back to you soon.
                        </p>
                        
                        <p style="color:#555; font-size:15px; line-height:1.6; margin-bottom: 12px;">
                            Thank you for contacting us.
                        </p>
                        
                        <p style="color:#777; font-size:13px; margin-top:35px; margin-bottom: 25px;">
                            If you did not submit this message, please ignore this email.
                        </p>
                        
                        <hr style="margin:25px 0; border:none; border-top:1px solid #eee;" />
                        
                        <div style="text-align:center; color:#555; font-size:12px; margin-top: 15px;">
                            <p style="font-size:10px; margin-bottom:8px; color: #999;">This is an automated message, please do not reply.</p>
                            <p style="margin: 3px 0; font-weight: bold;">M&RC Travel and Tours</p>
                            <p style="margin: 3px 0;">info1@mrctravels.com</p>
                            <p style="margin: 3px 0;">&copy; ${new Date().getFullYear()} M&RC Travel and Tours. All rights reserved.</p>
                        </div>
                    </div>
                </div>`
        });

        console.log('✅ Auto-reply sent to customer:', normalizedEmail, '| Message ID:', customerResult?.messageId);

        res.status(200).json({ success: true, message: 'Message sent successfully' });

    } catch (error) {
        console.error('❌ Email error:', error.message);
        res.status(500).json({ message: 'Failed to send email', error: error.message });
    }
};