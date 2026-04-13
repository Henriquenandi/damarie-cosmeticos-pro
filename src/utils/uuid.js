/**
 * Utility functions for UUID generation and other common operations
 */

/**
 * Generate a random UUID v4
 * Uses the native crypto.randomUUID() when available, falls back to manual generation
 * @returns {string} A valid UUID v4 string
 */
export const generateUUID = () => {
  // Use native crypto.randomUUID() if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Generate a short ID (8 characters) for codes, vouchers, etc.
 * @returns {string} A short alphanumeric ID
 */
export const generateShortId = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

/**
 * Generate a voucher code with prefix
 * @param {string} prefix - Optional prefix (default: 'VOUCHER')
 * @returns {string} A voucher code like 'VOUCHER-ABC123XY'
 */
export const generateVoucherCode = (prefix = 'VOUCHER') => {
  return `${prefix}-${generateShortId()}`;
};

/**
 * Validate if a string is a valid UUID
 * @param {string} uuid - The string to validate
 * @returns {boolean} True if valid UUID
 */
export const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};