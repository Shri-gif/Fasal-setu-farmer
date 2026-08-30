import { calculatePlatformPrice } from './calculations';
import { PlatformFeeOrderSnapshot, PlatformFeeSettings } from './types';

export const buildPlatformFeeOrderSnapshot = (
  basePrice: number,
  settings: PlatformFeeSettings
): PlatformFeeOrderSnapshot => {
  const result = calculatePlatformPrice(basePrice, settings);

  return {
    base_price_per_unit: result.basePrice,
    platform_fee_amount: result.feeAmount,
    platform_fee_type: result.feeType,
    platform_fee_value: result.feeValue,
    customer_price_per_unit: result.customerPrice,
  };
};
