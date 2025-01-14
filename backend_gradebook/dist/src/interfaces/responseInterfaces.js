"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createErrorResponse = exports.createSuccessResponse = void 0;
const createSuccessResponse = (data, message) => ({
    data,
    message
});
exports.createSuccessResponse = createSuccessResponse;
const createErrorResponse = (message) => ({
    message
});
exports.createErrorResponse = createErrorResponse;
