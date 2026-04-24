import { NextResponse } from "next/server";
import { maskMobileNumber, maskEmail, shouldMaskData } from "./privacy";

export function apiSuccess<T>(data: T, message = "OK", init?: ResponseInit, options?: { currentUserId?: string; targetUserId?: string }) {
  const processedData = applyPrivacyMasking(data, options);
  return NextResponse.json({ success: true, message, data: processedData }, init);
}

export function apiError(message: string, status = 400, errorCode?: string) {
  return NextResponse.json({ success: false, message, errorCode }, { status });
}

/**
 * Recursively apply privacy masking to sensitive data
 */
function applyPrivacyMasking(data: any, options?: { currentUserId?: string; targetUserId?: string }): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // Check if we should mask data
  const shouldMask = shouldMaskData(options?.currentUserId, options?.targetUserId);

  if (Array.isArray(data)) {
    return data.map(item => applyPrivacyMasking(item, options));
  }

  const masked = { ...data };

  // Mask mobile numbers
  if (masked.mobile && shouldMask) {
    masked.mobile = maskMobileNumber(masked.mobile);
  }

  // Mask emails
  if (masked.email && shouldMask) {
    masked.email = maskEmail(masked.email);
  }

  // Recursively process nested objects
  Object.keys(masked).forEach(key => {
    if (typeof masked[key] === 'object' && masked[key] !== null) {
      masked[key] = applyPrivacyMasking(masked[key], options);
    }
  });

  return masked;
}
