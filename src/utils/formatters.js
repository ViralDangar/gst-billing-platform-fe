/**
 * Format currency in Indian Rupees
 */
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '₹0.00'
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Format number with Indian numbering system (lakhs, crores)
 */
export function formatNumber(num, decimals = 2) {
  if (num == null || isNaN(num)) return '0'
  
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num)
}

/**
 * Format date for display
 */
export function formatDate(dateString, options = {}) {
  if (!dateString) return '-'
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '-'
  
  const defaultOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options
  }
  
  return new Intl.DateTimeFormat('en-IN', defaultOptions).format(date)
}

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  
  return date.toISOString().split('T')[0]
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate() {
  return new Date().toISOString().split('T')[0]
}

/**
 * Format GSTIN for display
 */
export function formatGstin(gstin) {
  if (!gstin) return '-'
  return gstin.toUpperCase()
}

/**
 * Validate GSTIN format
 */
export function isValidGstin(gstin) {
  if (!gstin) return false
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  return gstinRegex.test(gstin.toUpperCase())
}

/**
 * Get state name from GSTIN state code
 */
export function getStateFromGstin(gstin) {
  if (!gstin || gstin.length < 2) return null
  
  const stateCode = gstin.substring(0, 2)
  return INDIAN_STATES[stateCode] || null
}

/**
 * Indian States with GST codes
 */
export const INDIAN_STATES = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '25': 'Daman and Diu',
  '26': 'Dadra and Nagar Haveli',
  '27': 'Maharashtra',
  '28': 'Andhra Pradesh (Old)',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh'
}

/**
 * GST rate options
 */
export const GST_RATES = [
  { value: 0, label: '0%' },
  { value: 0.25, label: '0.25%' },
  { value: 3, label: '3%' },
  { value: 5, label: '5%' },
  { value: 12, label: '12%' },
  { value: 18, label: '18%' },
  { value: 28, label: '28%' }
]

/**
 * Unit options
 */
export const UNIT_OPTIONS = [
  { value: 'NOS', label: 'Numbers (NOS)' },
  { value: 'PCS', label: 'Pieces (PCS)' },
  { value: 'KGS', label: 'Kilograms (KGS)' },
  { value: 'GMS', label: 'Grams (GMS)' },
  { value: 'LTR', label: 'Litres (LTR)' },
  { value: 'MTR', label: 'Metres (MTR)' },
  { value: 'SQM', label: 'Square Metres (SQM)' },
  { value: 'BOX', label: 'Box (BOX)' },
  { value: 'SET', label: 'Set (SET)' },
  { value: 'HRS', label: 'Hours (HRS)' },
  { value: 'DAY', label: 'Days (DAY)' }
]

/**
 * Convert number to words (Indian format)
 */
export function numberToWords(num) {
  if (num === 0) return 'Zero Rupees Only'
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  
  function convertLessThanThousand(n) {
    if (n === 0) return ''
    if (n < 20) return ones[n]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '')
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '')
  }
  
  let rupees = Math.floor(num)
  let paise = Math.round((num - rupees) * 100)
  
  let result = ''
  
  if (rupees >= 10000000) {
    result += convertLessThanThousand(Math.floor(rupees / 10000000)) + ' Crore '
    rupees %= 10000000
  }
  if (rupees >= 100000) {
    result += convertLessThanThousand(Math.floor(rupees / 100000)) + ' Lakh '
    rupees %= 100000
  }
  if (rupees >= 1000) {
    result += convertLessThanThousand(Math.floor(rupees / 1000)) + ' Thousand '
    rupees %= 1000
  }
  if (rupees > 0) {
    result += convertLessThanThousand(rupees)
  }
  
  result = result.trim() + ' Rupees'
  
  if (paise > 0) {
    result += ' and ' + convertLessThanThousand(paise) + ' Paise'
  }
  
  return result + ' Only'
}
