"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertBuffersToUUIDs = exports.uuidStringify = void 0;
const buffer_1 = require("buffer");
const uuidStringify = (buffer) => {
    const hex = buffer.toString('hex');
    return [
        hex.substring(0, 8),
        hex.substring(8, 12),
        hex.substring(12, 16),
        hex.substring(16, 20),
        hex.substring(20, 32)
    ].join('-');
};
exports.uuidStringify = uuidStringify;
const convertBuffersToUUIDs = (obj) => {
    if (buffer_1.Buffer.isBuffer(obj)) {
        return (0, exports.uuidStringify)(obj);
    }
    else if (Array.isArray(obj)) {
        return obj.map(item => (0, exports.convertBuffersToUUIDs)(item));
    }
    else if (obj !== null && typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                newObj[key] = (0, exports.convertBuffersToUUIDs)(obj[key]);
            }
        }
        return newObj;
    }
    else {
        return obj;
    }
};
exports.convertBuffersToUUIDs = convertBuffersToUUIDs;
