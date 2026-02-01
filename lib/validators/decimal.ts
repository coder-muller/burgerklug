/**
 * Validators for decimal/monetary values
 * These are pure validation functions to be used with Zod's .refine()
 */

/**
 * Normalizes decimal values from various input formats:
 * - number -> "123.45"
 * - "1.234,56" -> "1234.56" (Brazilian format: '.' as thousands, ',' as decimal)
 * - "1234,56" -> "1234.56"
 * - "1234.56" -> "1234.56"
 *
 * @param raw - Raw value to normalize (number, string, null, undefined)
 * @returns Normalized string or undefined if input is null/empty/invalid
 * @example
 * normalizeDecimal("1.234,56") // "1234.56"
 * normalizeDecimal("1234,56") // "1234.56"
 * normalizeDecimal(123.45) // "123.45"
 * normalizeDecimal(null) // undefined
 */
export function normalizeDecimal(raw: unknown): string | undefined {
  if (raw === null || raw === undefined) return undefined;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return String(raw);
  }

  let s = String(raw).trim();
  if (s === "") return undefined;

  // Handle common thousands/decimal separators:
  // If contains both '.' and ',', assume '.' is thousands separator and ',' is decimal (Brazilian style)
  if (s.includes(".") && s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else {
    // otherwise just replace comma with dot (so "123,45" -> "123.45")
    s = s.replace(",", ".");
  }

  // remove spaces
  s = s.replace(/\s+/g, "");

  // final numeric check
  const n = Number(s);
  if (!Number.isFinite(n)) return undefined;

  return s;
}

/**
 * Validates precision and scale for decimal values
 * @param normalized - Normalized decimal string (e.g., "1234.56")
 * @param maxDigits - Maximum total digits (default: 12)
 * @param maxScale - Maximum decimal places (default: 4)
 * @returns true if precision and scale are valid
 * @example
 * validateDecimalPrecision("123456789012.1234", 12, 4) // true (12 digits total, 4 decimal places)
 * validateDecimalPrecision("1234567890123.1234", 12, 4) // false (13 digits total)
 */
export function validateDecimalPrecision(
  normalized: string,
  maxDigits: number = 12,
  maxScale: number = 4
): boolean {
  // split on dot
  const [intPartRaw, fracPartRaw] = normalized.split(".");
  // remove leading minus and leading zeros for counting integer digits
  const intPart = (intPartRaw ?? "").replace(/^0+/, "") || "0";
  const fracPart = fracPartRaw ?? "";

  const totalDigits = intPart.replace(/[^0-9]/g, "").length + fracPart.replace(/[^0-9]/g, "").length;
  const scale = fracPart.length;

  if (totalDigits > maxDigits) return false;
  if (scale > maxScale) return false;
  return true;
}

/**
 * Options for decimal validation
 */
export interface ValidateDecimalOptions {
  /** Whether the value is required (default: false) */
  required?: boolean;
  /** Whether negative values are allowed (default: false) */
  allowNegative?: boolean;
  /** Maximum total digits (default: 12) */
  maxDigits?: number;
  /** Maximum decimal places (default: 4) */
  maxScale?: number;
}

/**
 * Validates a decimal value completely (normalizes + validates)
 * @param value - Value to validate (can be number, string, null, undefined)
 * @param options - Validation options
 * @returns true if valid decimal value
 * @example
 * validateDecimal("1.234,56", { required: true }) // true
 * validateDecimal("1234.56", { maxDigits: 10 }) // true
 * validateDecimal(null, { required: true }) // false
 */
export function validateDecimal(
  value: unknown,
  options: ValidateDecimalOptions = {}
): boolean {
  const {
    required = false,
    allowNegative = false,
    maxDigits = 12,
    maxScale = 4,
  } = options;

  const normalized = normalizeDecimal(value);

  // Check if required
  if (normalized === undefined) {
    return !required;
  }

  // Check if numeric
  const num = Number(normalized);
  if (!Number.isFinite(num)) return false;

  // Check if negative
  if (!allowNegative && num < 0) return false;

  // Check precision and scale
  if (!validateDecimalPrecision(normalized, maxDigits, maxScale)) return false;

  return true;
}
