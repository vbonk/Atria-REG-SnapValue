// server/services/MultiNotifier.js
const winston = require('winston');

class MultiNotifier {
    constructor(notifiers = []) {
        this.notifiers = notifiers;
        
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            transports: [
                new winston.transports.File({ filename: '/logs/notifications.log' }),
                new winston.transports.Console()
            ]
        });
    }

    /**
     * Send lead notification through all configured channels
     * @param {Object} leadData - Lead information
     * @param {Object} reportData - Report details
     * @param {string} requestId - Request ID for tracing
     */
    async sendLead(leadData, reportData = {}, requestId = null) {
        if (this.notifiers.length === 0) {
            this.logger.warn('No notification channels configured', {
                requestId,
                event: 'no_notifiers_configured'
            });
            return { success: true, results: [] };
        }

        const results = [];
        const startTime = Date.now();

        // Send notifications in parallel
        const promises = this.notifiers.map(async (notifier) => {
            const notifierName = notifier.constructor.name;
            
            try {
                const result = await notifier.sendLeadNotification(leadData, reportData, requestId);
                
                results.push({
                    channel: notifierName,
                    success: result.success,
                    details: result
                });

                this.logger.info('Notification sent', {
                    requestId,
                    channel: notifierName,
                    success: result.success,
                    leadId: leadData.email,
                    event: 'notification_sent'
                });

                return result;
            } catch (error) {
                results.push({
                    channel: notifierName,
                    success: false,
                    error: error.message
                });

                this.logger.error('Notification failed', {
                    requestId,
                    channel: notifierName,
                    error: error.message,
                    leadId: leadData.email,
                    event: 'notification_failed'
                });

                // Don't throw - we want to try all channels
                return { success: false, error: error.message };
            }
        });

        // Wait for all notifications to complete
        await Promise.allSettled(promises);

        const duration = Date.now() - startTime;
        const successCount = results.filter(r => r.success).length;

        this.logger.info('Multi-notification complete', {
            requestId,
            totalChannels: this.notifiers.length,
            successCount,
            duration,
            leadId: leadData.email,
            event: 'multi_notification_complete'
        });

        return {
            success: successCount > 0, // Success if at least one channel succeeded
            results,
            successCount,
            totalChannels: this.notifiers.length,
            duration
        };
    }

    /**
     * Test all configured notification channels
     * @param {string} requestId - Request ID for tracing
     */
    async testAll(requestId = null) {
        const results = [];

        for (const notifier of this.notifiers) {
            const notifierName = notifier.constructor.name;
            
            try {
                if (typeof notifier.testWebhook === 'function') {
                    await notifier.testWebhook(requestId);
                } else if (typeof notifier.sendTestEmail === 'function') {
                    await notifier.sendTestEmail();
                }
                
                results.push({
                    channel: notifierName,
                    success: true
                });
            } catch (error) {
                results.push({
                    channel: notifierName,
                    success: false,
                    error: error.message
                });
            }
        }

        return results;
    }
}

module.exports = MultiNotifier;