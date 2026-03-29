import transporter from '../config/nodemailer.js';

export const sendContactEmail = async (req, res) => {
    const { name, email, message } = req.body;
    console.log('Received contact form submission:', { name, email, message });

    if (!name || !email || !message) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        await transporter.sendMail({
            from: `"M&RC Travel and Tours" <${process.env.SENDER_EMAIL}>`,
            to: process.env.SENDER_EMAIL,
            replyTo: email,
            subject: `Contact Form Submission from ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #305797;">New Inquiry Details</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Message:</strong></p>
                    <div style="background: #f4f6f8; padding: 15px; border-left: 4px solid #305797; white-space: pre-wrap;">${message}</div>
                </div>`
        });

        await transporter.sendMail({
            from: `"M&RC Travel and Tours" <${process.env.SENDER_EMAIL}>`,
            to: email,
            subject: 'Email Received - M&RC Travel and Tours',
            html: `
            <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:40px;">
            <div style="max-width:500px; margin:auto; background:#ffffff; border-radius:10px; padding:30px; text-align:center; box-shadow:0 4px 10px rgba(0,0,0,0.05);">

                <h2 style="color:#305797; margin-bottom:10px;">
                    Welcome to M&RC Travel and Tours
                </h2>

                <p style="color:#555; font-size:16px;">
                    Hello <b>${name}</b>,
                </p>

                <p style="color:#555; font-size:15px; line-height:1.6;">
                    Your message has been received and we will get back to you soon.
                </p>

                <p style="color:#555; font-size:15px; line-height:1.6;">
                    Thank you for contacting us.
                </p>

                <p style="color:#777; font-size:13px; margin-top:30px;">
                    If you did not submit this message, please ignore this email.
                </p>

                <hr style="margin:30px 0; border:none; border-top:1px solid #eee;" />

                <p style="color:#aaa; font-size:12px;">
                    © ${new Date().getFullYear()} M&RC Travel and Tours <br/>
                    Making your travel dreams come true.
                </p>

            </div>
        </div>
            `
        });

        res.status(200).json({ message: 'Email sent successfully' });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email' });
    }
};