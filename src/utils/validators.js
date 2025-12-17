/**
 * Validate required field
 */
export function required(value, fieldName = 'This field') {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`
  }
  return null
}

/**
 * Validate minimum length
 */
export function minLength(value, min, fieldName = 'This field') {
  if (value && value.length < min) {
    return `${fieldName} must be at least ${min} characters`
  }
  return null
}

/**
 * Validate maximum length
 */
export function maxLength(value, max, fieldName = 'This field') {
  if (value && value.length > max) {
    return `${fieldName} must be at most ${max} characters`
  }
  return null
}

/**
 * Validate email format
 */
export function email(value, fieldName = 'Email') {
  if (!value) return null
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) {
    return `${fieldName} is not valid`
  }
  return null
}

/**
 * Validate GSTIN format
 */
export function gstin(value, fieldName = 'GSTIN') {
  if (!value) return null
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  if (!gstinRegex.test(value.toUpperCase())) {
    return `${fieldName} format is invalid`
  }
  return null
}

/**
 * Validate PAN format
 */
export function pan(value, fieldName = 'PAN') {
  if (!value) return null
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
  if (!panRegex.test(value.toUpperCase())) {
    return `${fieldName} format is invalid`
  }
  return null
}

/**
 * Validate HSN/SAC code
 */
export function hsnSac(value, fieldName = 'HSN/SAC') {
  if (!value) return null
  const hsnRegex = /^[0-9]{4,8}$/
  if (!hsnRegex.test(value)) {
    return `${fieldName} must be 4-8 digits`
  }
  return null
}

/**
 * Validate IFSC code
 */
export function ifsc(value, fieldName = 'IFSC') {
  if (!value) return null
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
  if (!ifscRegex.test(value.toUpperCase())) {
    return `${fieldName} format is invalid`
  }
  return null
}

/**
 * Validate positive number
 */
export function positiveNumber(value, fieldName = 'This field') {
  if (value === null || value === undefined || value === '') return null
  const num = parseFloat(value)
  if (isNaN(num) || num < 0) {
    return `${fieldName} must be a positive number`
  }
  return null
}

/**
 * Validate phone number (Indian)
 */
export function phone(value, fieldName = 'Phone') {
  if (!value) return null
  const phoneRegex = /^[6-9]\d{9}$/
  if (!phoneRegex.test(value.replace(/\D/g, ''))) {
    return `${fieldName} must be a valid 10-digit Indian mobile number`
  }
  return null
}

/**
 * Validate pincode (Indian)
 */
export function pincode(value, fieldName = 'Pincode') {
  if (!value) return null
  const pincodeRegex = /^[1-9][0-9]{5}$/
  if (!pincodeRegex.test(value)) {
    return `${fieldName} must be a valid 6-digit pincode`
  }
  return null
}

/**
 * Validate account number
 */
export function accountNumber(value, fieldName = 'Account Number') {
  if (!value) return null
  if (value.length < 9 || value.length > 18) {
    return `${fieldName} must be between 9-18 digits`
  }
  if (!/^\d+$/.test(value)) {
    return `${fieldName} must contain only digits`
  }
  return null
}

/**
 * Run multiple validations on a value
 */
export function validate(value, validators) {
  for (const validator of validators) {
    const error = validator(value)
    if (error) return error
  }
  return null
}

/**
 * Validate form object
 */
export function validateForm(form, rules) {
  const errors = {}
  let isValid = true

  for (const [field, validators] of Object.entries(rules)) {
    const error = validate(form[field], validators)
    if (error) {
      errors[field] = error
      isValid = false
    }
  }

  return { isValid, errors }
}
