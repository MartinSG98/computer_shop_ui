/** Format an API price (a Decimal string) for display only. */
export function formatPrice(price: string, currency: string): string {
  const amount = Number(price)
  if (Number.isNaN(amount)) {
    return `${price} ${currency}`
  }
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount)
}