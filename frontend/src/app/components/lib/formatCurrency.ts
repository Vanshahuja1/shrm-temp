export function formatCurrency(value: number) {
  return `LKR ${new Intl.NumberFormat("en-LK", {
        maximumFractionDigits: 0,
      }).format(value)}`;
}