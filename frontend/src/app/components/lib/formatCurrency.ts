export function formatCurrency(value: number, currency: 'INR' | 'USD' = 'INR') {
  return `LKR ${new Intl.NumberFormat("en-LK", {
        maximumFractionDigits: 0,
      }).format(value)}`;
}