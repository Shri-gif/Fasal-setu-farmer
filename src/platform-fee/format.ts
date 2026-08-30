export const formatPlatformCurrency = (amount: number) =>
  `₹${(Number(amount) || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
