import { createPaymentRequest } from '../payment.js';
import User from '../models/user.model.js';

export const initiatePayment = async (req, res) => {
    try {
        const { userId } = req.user;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const orderData = {
            orderId: `SURABHI_${Date.now()}_${userId}`,
            amount: "500.00", // Registration fee
            email: user.email,
            phoneNumber: user.phoneNumber,
            fullName: user.fullName
        };

        const encryptedRequest = await createPaymentRequest(orderData);

        // Save order details
        user.paymentDetails = {
            orderId: orderData.orderId,
            amount: orderData.amount,
            status: 'initiated'
        };
        await user.save();

        res.json({
            paymentUrl: `${process.env.HDFC_API_URL}/pay`,
            encryptedRequest
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const handlePaymentCallback = async (req, res) => {
    try {
        const { encryptedResponse } = req.body;
        // Decrypt and verify response
        // Update payment status
        // Redirect to appropriate page
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 