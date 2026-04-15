export function formatMoney(
  value,
  symbol = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'đ'
) {
  const num = typeof value === 'number' ? value : Number(value) || 0;

  const formatted = new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);

  return `${formatted} ${symbol}`;
}