export function createPageUrl(pageName: string) {
    return '/' + pageName.replace(/ /g, '-');
}

// Re-export UUID utilities
export { generateUUID, generateShortId, generateVoucherCode, isValidUUID } from './uuid.js';

// Re-export business helpers
export { createCompleteSale, createVoucher, createCreditPayment, createStockEntry } from './businessHelpers.js';

// Re-export image helpers
export { uploadImage, deleteImage } from './imageHelpers.js';