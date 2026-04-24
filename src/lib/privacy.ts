/**
 * Privacy utilities for data protection
 */

/**
 * Masks mobile number for privacy
 * Example: 9876543210 -> 9876XXXX10
 */
export function maskMobileNumber(mobile: string): string {
  if (!mobile || mobile.length < 4) {
    return mobile;
  }
  
  // Remove any non-digit characters
  const cleanMobile = mobile.replace(/\D/g, '');
  
  if (cleanMobile.length <= 4) {
    return mobile;
  }
  
  const start = cleanMobile.slice(0, 4);
  const end = cleanMobile.slice(-2);
  const middleLength = cleanMobile.length - 6;
  const middle = 'X'.repeat(Math.max(middleLength, 4));
  
  return `${start}${middle}${end}`;
}

/**
 * Masks email address for privacy
 * Example: user@example.com -> u***@example.com
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) {
    return email;
  }
  
  const [username, domain] = email.split('@');
  if (username.length <= 2) {
    return email;
  }
  
  const maskedUsername = username[0] + '*'.repeat(username.length - 2) + username[username.length - 1];
  return `${maskedUsername}@${domain}`;
}

/**
 * Checks if user data should be masked based on context
 */
export function shouldMaskData(currentUserId?: string, targetUserId?: string): boolean {
  // If there's no current user ID, we're in a public context
  if (!currentUserId) {
    return true;
  }
  
  // If there's no target user ID, mask for safety
  if (!targetUserId) {
    return true;
  }
  
  // Mask if current user is not the target user
  return currentUserId !== targetUserId;
}
