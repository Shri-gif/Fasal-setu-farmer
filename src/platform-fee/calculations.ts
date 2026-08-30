import { PlatformFeeSettings, PlatformPriceBreakdown, PlatformFeeType } from './types';

const money = (value: number) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export const normalizeFeeType = (value: unknown): PlatformFeeType =>
  String(value || 'percentage').toLowerCase() === 'fixed' ? 'fixed' : 'percentage';

export const calculatePlatformPrice = (
  basePriceInput: number,
  settings?: Partial<PlatformFeeSettings> | null
): PlatformPriceBreakdown => {
  const basePrice = Math.max(0, Number(basePriceInput) || 0);
  const feeValue = Math.max(0, Number(settings?.platform_fee) || 0.10);
  const feeType = normalizeFeeType(settings?.platform_fee_type);

  const feeAmount = feeType === 'fixed'
    ? feeValue
    : money((basePrice * feeValue) / 100);

  return {
    basePrice: money(basePrice),
    feeAmount: money(feeAmount),
    customerPrice: money(basePrice + feeAmount),
    feeType,
    feeValue,
  };
};

export const calculateCustomerPrice = (
  basePrice: number,
  settings?: Partial<PlatformFeeSettings> | null
) => calculatePlatformPrice(basePrice, settings).customerPrice;
