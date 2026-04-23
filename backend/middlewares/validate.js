// Validation Middleware
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map(detail => detail.message.replace(/"/g, ''));
            return res.status(400).json({
                success: false,
                message: errors[0], // Return the specific error message to the frontend
                data: { errors }
            });
        }
        next();
    };
};

module.exports = validate;
