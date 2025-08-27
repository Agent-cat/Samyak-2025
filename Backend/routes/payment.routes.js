import express from 'express';
import { initiatePayment, handlePaymentCallback } from '../controllers/payment.controller.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/initiate', protect, initiatePayment);
router.post('/callback', handlePaymentCallback);

export default router; 