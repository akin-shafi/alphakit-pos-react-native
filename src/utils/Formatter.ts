// Value formatting utilities
export const formatCurrency = (amount: number, currencyCode: string = "NGN"): string => {
  const symbols: Record<string, string> = {
    NGN: "₦",
    USD: "$",
    GBP: "£",
    EUR: "€",
  }
  const symbol = symbols[currencyCode] || symbols.NGN
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
