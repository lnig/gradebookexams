"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleInputErrors = void 0;
const express_validator_1 = require("express-validator");
const handleInputErrors = (req, res, next) => {
    const result = (0, express_validator_1.validationResult)(req);
    if (!result.isEmpty()) {
        res.status(400).json({ errors: result.array() });
    }
    else {
        next();
    }
};
exports.handleInputErrors = handleInputErrors;
