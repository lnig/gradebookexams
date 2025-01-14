"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDeleteRequest = exports.sendPatchRequest = exports.sendGetRequest = exports.sendPostRequest = void 0;
const node_http_1 = __importDefault(require("node:http"));
const validateEnv_1 = require("../../src/modules/validateEnv");
const sendPostRequest = async (path, postData, bearerToken) => {
    const dataString = JSON.stringify(postData);
    const options = {
        hostname: 'localhost',
        port: validateEnv_1.PORT,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(dataString),
            'Authorization': bearerToken ? `Bearer ${bearerToken}` : `Bearer ${validateEnv_1.BEARER_TOKEN}`
        },
    };
    return new Promise((resolve, reject) => {
        const req = node_http_1.default.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    body: JSON.parse(data),
                });
            });
        });
        req.on('error', (e) => {
            reject(e);
        });
        req.write(dataString);
        req.end();
    });
};
exports.sendPostRequest = sendPostRequest;
const sendGetRequest = async (path) => {
    const options = {
        hostname: 'localhost',
        port: validateEnv_1.PORT,
        path: path,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${validateEnv_1.BEARER_TOKEN}`
        },
    };
    return new Promise((resolve, reject) => {
        const req = node_http_1.default.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    body: JSON.parse(data),
                });
            });
        });
        req.on('error', (e) => {
            reject(e);
        });
        req.end();
    });
};
exports.sendGetRequest = sendGetRequest;
const sendPatchRequest = async (path, patchData) => {
    const dataString = JSON.stringify(patchData);
    const options = {
        hostname: 'localhost',
        port: validateEnv_1.PORT,
        path: path,
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(dataString),
            'Authorization': `Bearer ${validateEnv_1.BEARER_TOKEN}`
        },
    };
    return new Promise((resolve, reject) => {
        const req = node_http_1.default.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    body: JSON.parse(data),
                });
            });
        });
        req.on('error', (e) => {
            reject(e);
        });
        req.write(dataString);
        req.end();
    });
};
exports.sendPatchRequest = sendPatchRequest;
const sendDeleteRequest = async (path) => {
    const options = {
        hostname: 'localhost',
        port: validateEnv_1.PORT,
        path: path,
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${validateEnv_1.BEARER_TOKEN}`
        },
    };
    return new Promise((resolve, reject) => {
        const req = node_http_1.default.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    body: JSON.parse(data),
                });
            });
        });
        req.on('error', (e) => {
            reject(e);
        });
        req.end();
    });
};
exports.sendDeleteRequest = sendDeleteRequest;
