FARMER MODULE

Paste folder: src/platform-fee/

RULE: Farmer price stays BASE PRICE. Never add the fee into price_per_unit while saving.

Import:
import { calculatePlatformPrice, loadPlatformFeeSettings, formatPlatformCurrency, PlatformFeeSettings } from '../platform-fee';

State:
const [platformSettings, setPlatformSettings] = useState<PlatformFeeSettings | null>(null);

Load:
useEffect(() => {
  loadPlatformFeeSettings().then(setPlatformSettings);
}, []);

Preview:
const pricePreview = calculatePlatformPrice(Number(price) || 0, platformSettings);

Save unchanged:
price_per_unit: Number(price)

Show:
Platform fee: {formatPlatformCurrency(pricePreview.feeAmount)}
Customer price: {formatPlatformCurrency(pricePreview.customerPrice)}
