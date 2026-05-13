/**
 * Rifa Security Utilities
 * Implements "Smart Regex" to prevent off-platform communication loopholes.
 */

const PHONE_REGEX = /(\+?\d{1,4}[\s-])?(\d{10})|(\d{3}[\s-]\d{3}[\s-]\d{4})|(\d{5}[\s-]\d{5})/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

/**
 * Detects and masks phone numbers and email addresses in a string.
 * Replaces them with [CONTACT INFO MASKED] to ensure on-platform communication.
 */
export const maskContactInfo = (text: string): string => {
    let masked = text;
    
    // Mask Emails
    masked = masked.replace(EMAIL_REGEX, '[EMAIL MASKED]');
    
    // Mask Phone Numbers
    masked = masked.replace(PHONE_REGEX, '[PHONE MASKED]');
    
    return masked;
};

/**
 * Returns true if the text contains potential contact information.
 */
export const containsContactInfo = (text: string): boolean => {
    return PHONE_REGEX.test(text) || EMAIL_REGEX.test(text);
};
