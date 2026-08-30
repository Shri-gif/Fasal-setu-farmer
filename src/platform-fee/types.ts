export type PlatformFeeType = 'percentage' | 'fixed';

export interface PlatformFeeSettings {
  platform_fee: number;
  platform_fee_type: PlatformFeeType;
}

export interface PlatformPriceBreakdown {
  basePrice: number;
  feeAmount: number;
  customerPrice: number;
  feeType: PlatformFeeType;
  feeValue: number;
}

export interface PlatformFeeOrderSnapshot {
  base_price_per_unit: number;
  platform_fee_amount: number;
  platform_fee_type: PlatformFeeType;
  platform_fee_value: number;
  customer_price_per_unit: number;
}
