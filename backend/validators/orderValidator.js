const Joi = require('joi');

exports.createOrderSchema = Joi.object({
    delivery_name: Joi.string().min(2).max(100).required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({'string.pattern.base': 'Phone number must be exactly 10 digits'}),
    delivery_address: Joi.string().min(5).required(),
    pin_code: Joi.string().pattern(/^[0-9]{6}$/).required().messages({'string.pattern.base': 'PIN code must be exactly 6 digits'}),
    payment_method: Joi.string().valid('COD', 'UPI', 'CARD').required(),
    upi_id: Joi.string().pattern(/^[\w.-]+@[\w.-]+$/).optional().allow(null, ''),
    card_number: Joi.string().optional().allow(null, ''),
    coupon_id: Joi.string().optional().allow(null, ''),
    payment_status: Joi.string().optional()
});
