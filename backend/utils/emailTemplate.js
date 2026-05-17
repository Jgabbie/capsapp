const defaultFooterHtml = `
    <p style="font-size:10px; margin:0 0 8px; color:#94a3b8;">This is an automated message, please do not reply.</p>
    <p style="margin:3px 0; font-weight:700; color:#334155;">M&amp;RC Travel and Tours</p>
    <p style="margin:3px 0; color:#64748b;">info1@mrctravels.com</p>
    <p style="margin:3px 0; color:#64748b;">&copy; ${new Date().getFullYear()} M&amp;RC Travel and Tours. All rights reserved.</p>
`;

const defaultLogoHtml = `
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px;">
        <img src="https://mrctravelandtours.com/images/Logo.png" alt="M&RC Travel and Tours" style="width:88px; height:auto; display:block;" />
    </div>
`;

export const buildBrandedEmail = ({
    title,
    introHtml = '',
    bodyHtml = '',
    ctaText = '',
    ctaUrl = '',
    footerHtml = '',
    logoHtml = '',
    accentLabel = 'M&RC Travel and Tours',
}) => {
    const actionHtml = ctaText && ctaUrl
        ? `
            <a href="${ctaUrl}"
                style="display:inline-block; margin-top:26px; padding:12px 24px; background:#305797; color:#ffffff; text-decoration:none; border-radius:999px; font-size:12px; letter-spacing:1.4px; font-weight:700; text-transform:uppercase;">
                ${ctaText}
            </a>
        `
        : '';

    return `
        <div style="font-family: Arial, sans-serif; background:#edf3fb; padding:32px 16px;">
            <div style="max-width:620px; margin:0 auto; background:#ffffff; border:1px solid #dbe4f0; border-radius:18px; overflow:hidden; box-shadow:0 10px 30px rgba(48,87,151,0.10);">
                <div style="height:8px; background:linear-gradient(90deg, #305797 0%, #5a7cc0 100%);"></div>
                <div style="padding:30px 32px 28px; text-align:left; color:#334155;">
                    ${logoHtml || defaultLogoHtml}
                    <div style="font-size:12px; letter-spacing:1.6px; text-transform:uppercase; color:#305797; font-weight:700; margin-bottom:8px;">${accentLabel}</div>
                    <h2 style="color:#1e3a5f; margin:0 0 16px; font-size:24px; line-height:1.2;">${title}</h2>
                    ${introHtml ? `<p style="color:#475569; font-size:16px; line-height:1.7; margin:0 0 16px;">${introHtml}</p>` : ''}
                    <div style="color:#334155; font-size:15px; line-height:1.75;">${bodyHtml}</div>
                    ${actionHtml}
                    <div style="margin-top:32px; padding-top:20px; border-top:1px solid #e5ecf5; text-align:center; color:#64748b; font-size:12px; line-height:1.6;">
                        ${footerHtml || defaultFooterHtml}
                    </div>
                </div>
            </div>
        </div>
    `;
};
