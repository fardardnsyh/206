const currencyFormatter = Intl.NumberFormat('en-UK', {
  style: 'currency',
  currency: 'GBP',
});

export default function formatCurrency(amount: number) {
  return currencyFormatter.format(amount);
}
