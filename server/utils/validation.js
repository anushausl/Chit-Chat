/* ============================================
   VALIDATION UTILITIES
   ============================================ */

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate username format
function isValidUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
}

// Validate password strength
function isValidPassword(password) {
    return password && password.length >= 6;
}

// Validate message content
function isValidMessage(content) {
    return content && 
           typeof content === 'string' && 
           content.trim().length > 0 && 
           content.length <= 500;
}

// Sanitize message content
function sanitizeMessage(content) {
    return content
        .trim()
        .replace(/[<>]/g, '') // Remove angle brackets
        .substring(0, 500);    // Limit length
}

module.exports = {
    isValidEmail,
    isValidUsername,
    isValidPassword,
    isValidMessage,
    sanitizeMessage
};
