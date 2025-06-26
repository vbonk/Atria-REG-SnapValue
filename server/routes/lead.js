// server/routes/lead.js
const express = require('express');
const { z } = require('zod');
const { prisma } = require('../db');
const { EmailNotifier } = require('../services/EmailNotifier');
const WebhookNotifier = require('../services/WebhookNotifier');
const MultiNotifier = require('../services/MultiNotifier');
const { logger } = require('../utils/logger');

const router = express.Router();

// Validation schema
const leadSchema = z.object({
    email: z.string().email(),
    phone: z.string().min(10),
    contactMe: z.boolean(),
    reportId: z.string().uuid()
});

// Initialize notification channels based on environment
const initializeNotifiers = () => {
    const channels = [];
    const configuredChannels = process.env.NOTIFIER_CHANNELS?.split(',').map(c => c.trim()) || [];
    
    if (configuredChannels.includes('email')) {
        try {
            channels.push(new EmailNotifier());
            logger.info('Email notifier initialized');
        } catch (error) {
            logger.error('Failed to initialize email notifier', { error: error.message });
        }
    }
    
    if (configuredChannels.includes('webhook') && process.env.WEBHOOK_URL) {
        try {
            channels.push(new WebhookNotifier(
                process.env.WEBHOOK_URL,
                process.env.WEBHOOK_SECRET
            ));
            logger.info('Webhook notifier initialized', { 
                url: process.env.WEBHOOK_URL,
                hasSecret: !!process.env.WEBHOOK_SECRET 
            });
        } catch (error) {
            logger.error('Failed to initialize webhook notifier', { error: error.message });
        }
    }
    
    return new MultiNotifier(channels);
};

// Initialize multi-notifier
const multiNotifier = initializeNotifiers();

/**
 * POST /api/lead
 * Save contact information and send notifications
 */
router.post('/api/lead', async (req, res) => {
    const requestId = req.id; // Assuming middleware adds this
    
    try {
        // Validate request body
        const validatedData = leadSchema.parse(req.body);
        const { email, phone, contactMe, reportId } = validatedData;

        // Check if report exists
        const report = await prisma.report.findUnique({
            where: { id: reportId },
            include: {
                lead: true // Check if lead already exists
            }
        });

        if (!report) {
            return res.status(404).json({ 
                error: 'Report not found',
                requestId 
            });
        }

        // If lead already exists for this report, return success
        if (report.lead) {
            logger.info('Lead already exists for report', {
                requestId,
                reportId,
                leadId: report.lead.id,
                event: 'lead_duplicate_attempt'
            });

            return res.status(200).json({ 
                success: true,
                leadId: report.lead.id,
                message: 'Lead information already saved'
            });
        }

        // Create lead record
        const lead = await prisma.lead.create({
            data: {
                email,
                phone,
                contactRequested: contactMe,
                reportId,
                capturedAt: new Date()
            }
        });

        logger.info('Lead created', {
            requestId,
            leadId: lead.id,
            reportId,
            contactRequested: contactMe,
            event: 'lead_created'
        });

        // Send notifications asynchronously
        setImmediate(async () => {
            try {
                const reportData = {
                    city: report.city,
                    state: report.state,
                    timeline: report.timeline,
                    budget: report.budget
                };
                
                const result = await multiNotifier.sendLead(
                    validatedData, 
                    reportData,
                    requestId
                );
                
                logger.info('Lead notifications sent', {
                    requestId,
                    leadId: lead.id,
                    successCount: result.successCount,
                    totalChannels: result.totalChannels,
                    event: 'lead_notifications_complete'
                });
            } catch (error) {
                // Log but don't fail the request
                logger.error('Lead notifications failed', {
                    requestId,
                    leadId: lead.id,
                    error: error.message,
                    event: 'lead_notifications_error'
                });
            }
        });

        // Return success response
        res.status(201).json({
            success: true,
            leadId: lead.id,
            message: 'Contact information saved successfully'
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.warn('Lead validation failed', {
                requestId,
                errors: error.errors,
                event: 'lead_validation_error'
            });

            return res.status(400).json({
                error: 'Invalid lead data',
                details: error.errors,
                requestId
            });
        }

        logger.error('Lead creation failed', {
            requestId,
            error: error.message,
            event: 'lead_creation_error'
        });

        res.status(500).json({
            error: 'Failed to save contact information',
            requestId
        });
    }
});

module.exports = router;