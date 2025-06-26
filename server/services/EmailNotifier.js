// server/services/EmailNotifier.js
const nodemailer = require('nodemailer');
const winston = require('winston');

class EmailNotifier {
    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            transports: [
                new winston.transports.File({ filename: '/logs/email.log' }),
                new winston.transports.Console()
            ]
        });

        // Initialize transporter based on EMAIL_PROVIDER
        if (process.env.EMAIL_PROVIDER === 'smtp') {
            this.transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true, // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
        } else if (process.env.EMAIL_PROVIDER === 'resend') {
            // Placeholder for Resend implementation
            throw new Error('Resend provider not implemented yet');
        } else {
            throw new Error(`Invalid EMAIL_PROVIDER: ${process.env.EMAIL_PROVIDER}`);
        }

        // Verify connection configuration
        this.verifyConnection();
    }

    async verifyConnection() {
        try {
            await this.transporter.verify();
            this.logger.info('Email service connected successfully');
        } catch (error) {
            this.logger.error('Email service connection failed:', error);
            throw error;
        }
    }

    /**
     * Send lead notification email
     * @param {Object} leadData - Lead information
     * @param {string} leadData.email - Lead email
     * @param {string} leadData.phone - Lead phone
     * @param {boolean} leadData.contactMe - Contact preference
     * @param {string} leadData.reportId - Associated report ID
     * @param {Object} reportData - Report details
     * @param {string} requestId - Request ID for tracing
     */
    async sendLeadNotification(leadData, reportData = {}, requestId = null) {
        const { email, phone, contactMe, reportId } = leadData;
        const { city, state, timeline, budget } = reportData;

        try {
            // Format the email content
            const subject = `New SnapValue Lead: ${email}`;
            
            const htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #B91C1C;">New SnapValue Lead Captured</h2>
                    
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Lead Information</h3>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Phone:</strong> ${phone}</p>
                        <p><strong>Contact Requested:</strong> ${contactMe ? 'Yes' : 'No'}</p>
                        <p><strong>Report ID:</strong> ${reportId}</p>
                    </div>
                    
                    ${city || state ? `
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Property Details</h3>
                        ${city && state ? `<p><strong>Location:</strong> ${city}, ${state}</p>` : ''}
                        ${timeline ? `<p><strong>Timeline:</strong> ${timeline}</p>` : ''}
                        ${budget ? `<p><strong>Budget:</strong> $${budget}</p>` : ''}
                    </div>
                    ` : ''}
                    
                    <div style="margin-top: 30px; padding: 20px; background-color: ${contactMe ? '#fef3c7' : '#e5e7eb'}; border-radius: 8px;">
                        ${contactMe ? 
                            '<p style="margin: 0; color: #92400e;"><strong>⚡ This lead requested contact!</strong> Follow up within 24 hours.</p>' :
                            '<p style="margin: 0; color: #6b7280;">This lead downloaded the report but did not request contact.</p>'
                        }
                    </div>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                    
                    <p style="font-size: 12px; color: #6b7280;">
                        This notification was sent from the SnapValue application. 
                        Lead captured at: ${new Date().toLocaleString()}
                    </p>
                </div>
            `;

            const textContent = `
New SnapValue Lead Captured

Lead Information:
- Email: ${email}
- Phone: ${phone}
- Contact Requested: ${contactMe ? 'Yes' : 'No'}
- Report ID: ${reportId}

${city || state ? `Property Details:
${city && state ? `- Location: ${city}, ${state}` : ''}
${timeline ? `- Timeline: ${timeline}` : ''}
${budget ? `- Budget: $${budget}` : ''}` : ''}

${contactMe ? '⚡ This lead requested contact! Follow up within 24 hours.' : 'This lead downloaded the report but did not request contact.'}

---
Lead captured at: ${new Date().toLocaleString()}
            `;

            // Send email
            const info = await this.transporter.sendMail({
                from: `"SnapValue App" <${process.env.SMTP_USER}>`,
                to: process.env.LEAD_EMAIL,
                subject: subject,
                text: textContent,
                html: htmlContent
            });

            this.logger.info('Lead notification sent', {
                messageId: info.messageId,
                leadId: email,
                reportId: reportId,
                requestId: requestId,
                event: 'lead_notification_sent'
            });

            return { success: true, messageId: info.messageId };

        } catch (error) {
            this.logger.error('Failed to send lead notification', {
                error: error.message,
                leadId: email,
                reportId: reportId,
                requestId: requestId,
                event: 'lead_notification_failed'
            });
            
            // Don't throw - we don't want email failures to break the lead capture flow
            return { success: false, error: error.message };
        }
    }

    /**
     * Send test email to verify configuration
     */
    async sendTestEmail() {
        try {
            const info = await this.transporter.sendMail({
                from: `"SnapValue Test" <${process.env.SMTP_USER}>`,
                to: process.env.LEAD_EMAIL,
                subject: 'SnapValue Email Configuration Test',
                text: 'This is a test email from SnapValue. If you received this, your email configuration is working correctly!',
                html: '<p>This is a test email from SnapValue. If you received this, your email configuration is working correctly!</p>'
            });

            this.logger.info('Test email sent successfully', { messageId: info.messageId });
            return { success: true, messageId: info.messageId };
        } catch (error) {
            this.logger.error('Test email failed', { error: error.message });
            throw error;
        }
    }
}

// Export singleton instance
let emailNotifier;

module.exports = {
    getEmailNotifier: () => {
        if (!emailNotifier) {
            emailNotifier = new EmailNotifier();
        }
        return emailNotifier;
    },
    EmailNotifier
};