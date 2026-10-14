export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
}

export function formatPercentage(num) {
  return `${(num || 0).toFixed(2)}%`;
}
