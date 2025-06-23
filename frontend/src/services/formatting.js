export function formatCurrency(amount, withSymbol = true) {
  const hasDecimal = amount % 1 !== 0;

  const formatter = new Intl.NumberFormat('en-MY', {
    style: withSymbol ? 'currency' : 'decimal',
    currency: 'MYR',
    minimumFractionDigits: hasDecimal ? 2 : 0,
    maximumFractionDigits: hasDecimal ? 2 : 0,
  });

  return formatter.format(amount);
}
