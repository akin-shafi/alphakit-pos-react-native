// Input validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{8,}$/
  return phoneRegex.test(phone)
}

export const validatePIN = (pin: string): boolean => {
  return /^\d{4,6}$/.test(pin)
}

export const validateBusinessId = (id: string): boolean => {
  return /^[A-Z0-9]{3,10}$/.test(id)
}

export const validateSKU = (sku: string): boolean => {
  return /^[A-Z0-9-]{3,20}$/.test(sku)
}
