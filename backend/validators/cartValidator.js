const Joi = require('joi');

exports.addToCartSchema = Joi.object({
    productId: Joi.number().integer().required(),
    quantity: Joi.number().integer().min(1).optional()
});

exports.syncCartSchema = Joi.object({
    cart: Joi.array().items(
        Joi.object({
            id: Joi.number().integer().required(),
            quantity: Joi.number().integer().min(1).required()
        })
    ).required()
});

exports.updateCartQtySchema = Joi.object({
    quantity: Joi.number().integer().min(1).required()
});
