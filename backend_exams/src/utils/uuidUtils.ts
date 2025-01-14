import { Buffer } from 'buffer';

export const uuidStringify = (buffer: Buffer): string => {
    const hex = buffer.toString('hex');
    return [
        hex.substring(0, 8),
        hex.substring(8, 12),
        hex.substring(12, 16),
        hex.substring(16, 20),
        hex.substring(20, 32)
    ].join('-');
};


export const convertBuffersToUUIDs = (obj: any): any => {
    if (Buffer.isBuffer(obj)) {
        return uuidStringify(obj);
    } else if (Array.isArray(obj)) {
        return obj.map(item => convertBuffersToUUIDs(item));
    } else if (obj !== null && typeof obj === 'object') {
        const newObj: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                newObj[key] = convertBuffersToUUIDs(obj[key]);
            }
        }
        return newObj;
    } else {
        return obj;
    }
};
