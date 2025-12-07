// Value formatting utilities
export const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`
}

export const formatNumber = (num: number): string => {
  return num.toLocaleString("en-US")
}

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + "..."
}
