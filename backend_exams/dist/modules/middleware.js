"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleInputErrors = void 0;
const express_validator_1 = require("express-validator");
const handleInputErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        console.error("Validation errors:", errors.array());
        return res.status(400).json({
            errors: errors.array(),
            message: 'Validation failed.',
        });
    }
    next();
};
exports.handleInputErrors = handleInputErrors;
