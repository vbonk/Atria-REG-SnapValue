// server/services/WebhookNotifier.js
const axios = require('axios');
const winston = require('winston');

class WebhookNotifier {
    constructor(webhookUrl, webhookSecret = null) {
        if (!webhookUrl) {
            throw new Error('Webhook URL is required');
        }
        
        this.webhookUrl = webhookUrl;
        this.webhookSecret = webhookSecret;
        
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            transports: [
                new winston.transports.File({ filename: '/logs/webhook.log' }),
                new winston.transports.Console()
            ]
        });
    }

    /**
     * Send lead notification via webhook
     * @param {Object} leadData - Lead information
     * @param {string} leadData.email - Lead email
     * @param {string} leadData.phone - Lead phone
     * @param {boolean} leadData.contactMe - Contact preference
     * @param {string} leadData.reportId - Associated report ID
     * @param {Object} reportData - Report details
     * @param {string} requestId - Request ID for tracing
     */
    async sendLeadNotification(leadData, reportData = {}, requestId = null) {
        const payload = {
            event: 'lead_captured',
            timestamp: new Date().toISOString(),
            lead: {
                email: leadData.email,
                phone: leadData.phone,
                contactRequested: leadData.contactMe,
                reportId: leadData.reportId
            },
            property: {
                city: reportData.city,
                state: reportData.state,
                timeline: reportData.timeline,
                budget: reportData.budget
            },
            metadata: {
                source: 'SnapValue',
                requestId: requestId
            }
        };

        const headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'SnapValue/1.0'
        };

        // Add secret header if configured
        if (this.webhookSecret) {
            headers['X-Snap-Secret'] = this.webhookSecret;
        }

        try {
            const startTime = Date.now();
            const response = await axios.post(this.webhookUrl, payload, {
                headers,
                timeout: 10000, // 10 second timeout
                validateStatus: (status) => status < 500 // Don't throw on 4xx
            });
            
            const duration = Date.now() - startTime;

            this.logger.info('Webhook sent successfully', {
                requestId,
                webhookUrl: this.webhookUrl,
                status: response.status,
                duration,
                leadId: leadData.email,
                reportId: leadData.reportId,
                event: 'webhook_sent'
            });

            return { 
                success: response.status < 400,
                status: response.status,
                duration
            };

        } catch (error) {
            this.logger.error('Webhook failed', {
                requestId,
                webhookUrl: this.webhookUrl,
                error: error.message,
                leadId: leadData.email,
                reportId: leadData.reportId,
                event: 'webhook_failed',
                errorCode: error.code,
                errorResponse: error.response?.data
            });
            
            return { 
                success: false, 
                error: error.message,
                errorCode: error.code 
            };
        }
    }

    /**
     * Test webhook configuration
     */
    async testWebhook(requestId = null) {
        const testPayload = {
            event: 'test',
            timestamp: new Date().toISOString(),
            message: 'This is a test webhook from SnapValue',
            metadata: {
                source: 'SnapValue',
                requestId: requestId
            }
        };

        const headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'SnapValue/1.0'
        };

        if (this.webhookSecret) {
            headers['X-Snap-Secret'] = this.webhookSecret;
        }

        try {
            const response = await axios.post(this.webhookUrl, testPayload, {
                headers,
                timeout: 10000
            });

            this.logger.info('Test webhook sent successfully', {
                requestId,
                webhookUrl: this.webhookUrl,
                status: response.status,
                event: 'webhook_test_success'
            });

            return { success: true, status: response.status };
        } catch (error) {
            this.logger.error('Test webhook failed', {
                requestId,
                webhookUrl: this.webhookUrl,
                error: error.message,
                event: 'webhook_test_failed'
            });
            
            throw error;
        }
    }
}

module.exports = WebhookNotifier;