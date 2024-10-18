/**
 * Converts a Dart color (0xffXXXXXX) to a CSS-compatible number (0xXXXXXXFF).
 *
 * @param dartColor - The Dart color represented as a 32-bit integer (0xffXXXXXX).
 * @returns A number representing the color in CSS format (0xXXXXXXFF).
 */
export const convertDartColorToCssNumber = (dartColor: number): number => {
  const alpha = (dartColor >> 24) & 0xff // Extract alpha (high 8 bits)
  const rgb = dartColor & 0xffffff // Extract RGB (low 24 bits)

  // Return color as 0xXXXXXXFF (CSS format: RGB + alpha)
  return (rgb << 8) | alpha
}

/**
 * Converts a CSS color (0xXXXXXXFF) to HSL format.
 *
 * @param cssColor - The CSS color represented as a 32-bit integer (0xXXXXXXFF).
 * @returns An object with HSL values {h, s, l}.
 */
export const cssColorToHslString = (cssColor: number): string => {
  const r = ((cssColor >> 24) & 0xff) / 255 // Extract red channel
  const g = ((cssColor >> 16) & 0xff) / 255 // Extract green channel
  const b = ((cssColor >> 8) & 0xff) / 255 // Extract blue channel

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  let l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return `${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`
}

/**
 * Trims and attempts to fix the phone number by:
 * - Removing all non-numeric characters
 * - Ensuring it starts with a '0'
 * @param phone - The input phone number string
 * @returns The cleaned phone number
 */
export function tryFixPhoneNumber(phone: string): string {
  phone = phone.trim() // Remove leading/trailing spaces
  // Remove all non-numeric characters
  phone = phone.replace(/\D/g, '')
  // Ensure the phone number starts with '0'
  if (!phone.startsWith('0')) {
    phone = '0' + phone
  }
  return phone
}

/**
 * Validates the phone number based on specific rules:
 * - Cannot be empty or just "0"
 * - Must start with '05', '06', '07', or '02'
 * - Must be 10 digits for mobile numbers (05, 06, 07)
 * - Must be 9 digits for landline numbers (02)
 * @param phone - The input phone number string
 * @returns Error message if validation fails, otherwise null
 */
export function validatePhoneNumber(phone: string): string | null {
  // Helper function to handle length overflow/underflow messages
  const getLengthError = (requiredLength: number, actualLength: number): string => {
    const difference = actualLength - requiredLength
    if (difference > 0) {
      return `عدد الأرقام زائد عن ${requiredLength} رقماً بـ ${difference}`
    } else {
      const missingDigits = -difference
      if (missingDigits === 1) return 'ينقصك رقم واحد'
      if (missingDigits === 2) return 'ينقصك رقمان'
      return `ينقصك ${missingDigits} أرقام`
    }
  }

  if (phone === '0') {
    return 'اكمل رقم الهاتف'
  }

  // Check if phone number is empty
  if (!phone) {
    return 'رقم الهاتف لا يمكن أن يكون فارغاً.'
  }

  // Check if phone number contains only digits
  if (!/^\d+$/.test(phone)) {
    return 'رقم الهاتف يجب أن يحتوي فقط على أرقام.'
  }

  // Ensure the phone starts with valid prefixes
  if (!/^(05|06|07|02)/.test(phone)) {
    return 'يجب أن يبدأ بـ 05, 06, 07, أو 02'
  }

  const length = phone.length

  // Validate mobile numbers (05, 06, 07 should be 10 digits)
  if (/^(05|06|07)/.test(phone)) {
    if (length !== 10) {
      return getLengthError(10, length)
    }
  }

  // Validate landline numbers (02 should be 9 digits)
  else if (phone.startsWith('02')) {
    if (length !== 9) {
      return getLengthError(9, length)
    }
  }

  // If all checks pass, return null (no errors)
  return null
}
