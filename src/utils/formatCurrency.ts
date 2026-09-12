// 39Production — Currency Formatting Utility

/**
 * Format a number to Indonesian Rupiah (Rp) format
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a number with thousands separator (Indonesian locale)
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

/**
 * Format price range
 */
export function formatPriceRange(min: number, max?: number): string {
  if (max) {
    return `${formatCurrency(min)} – ${formatCurrency(max)}`;
  }
  return `Mulai dari ${formatCurrency(min)}`;
}
