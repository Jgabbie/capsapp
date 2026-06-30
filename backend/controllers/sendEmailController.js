import transporter from '../config/nodemailer.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { buildBrandedEmail } from '../utils/emailTemplate.js';

//setup directory paths to fetch the Logo from your frontend assets folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


//send contact email function
export const sendContactEmail = async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Use SMTP_USER (verified Brevo sender) for best deliverability
    const senderEmail = process.env.SENDER_EMAIL;
    const companyEmail = process.env.COMPANY_EMAIL;
    const normalizedEmail = String(email || "").trim().toLowerCase();

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
            cid: 'companyLogo', // This ID is used to display the image in the HTML
            contentDisposition: 'inline',
            contentType: 'image/png'
        }
        : null;

    //  FIXED: We now actually insert the image into the HTML!
    const logoHtml = logoAttachment
        ? `<div style="text-align: center; margin-bottom: 20px;"><img src="cid:companyLogo" alt="M&RC Travel and Tours" style="max-width: 150px; height: auto;" /></div>`
        : ``;

    try {
        // 1. Email sent to the Company (Admin)
        const companyResult = await transporter.sendMail({
            from: `"M&RC Travel and Tours" <${senderEmail}>`, //  STRICT FORMATTING TO PREVENT SILENT DROPS
            to: companyEmail,
            replyTo: normalizedEmail,
            subject: `New Inquiry from ${name} - ${subject}`,
            html: buildBrandedEmail({
                title: 'New Inquiry Details',
                introHtml: `You received a new inquiry from <b>${name}</b>.`,
                bodyHtml: `
                    <div style="background:#f8fafc; border:1px solid #dbe4f0; border-radius:14px; padding:16px 18px; margin-bottom:18px;">
                        <p style="color:#475569; font-size:14px; margin:0 0 8px;"><strong>Subject:</strong> ${subject}</p>
                        <p style="color:#475569; font-size:14px; margin:0 0 8px;"><strong>Name:</strong> ${name}</p>
                        <p style="color:#475569; font-size:14px; margin:0 0 12px;"><strong>Email:</strong> ${normalizedEmail}</p>
                        <p style="color:#475569; font-size:14px; margin:0 0 8px;"><strong>Message:</strong></p>
                        <div style="background:#ffffff; border-left:4px solid #305797; padding:14px 16px; white-space:pre-wrap; color:#334155;">${message}</div>
                    </div>
                `,
                logoHtml,
            })
        });

        // 2. Auto-reply sent to the Customer
        const customerResult = await transporter.sendMail({
            from: `"M&RC Travel and Tours" <${senderEmail}>`, //  STRICT FORMATTING
            to: normalizedEmail,
            subject: 'We received your inquiry: ' + subject,
            html: buildBrandedEmail({
                title: 'We received your inquiry',
                introHtml: `Hello <b>${name}</b>, your message about <b>${subject}</b> has been received.`,
                bodyHtml: `
                    <p style="margin:0 0 12px;">We will get back to you soon.</p>
                    <p style="margin:0; color:#64748b;">Thank you for contacting us.</p>
                `,
                logoHtml,
            })
        });

        console.log(' Auto-reply sent to customer:', normalizedEmail, '| Message ID:', customerResult?.messageId);

        res.status(200).json({ success: true, message: 'Message sent successfully' });

    } catch (error) {
        console.error('Email error:', error.message);
        res.status(500).json({ message: 'Failed to send email', error: error.message });
    }
};

export {
    sendContactEmail
}