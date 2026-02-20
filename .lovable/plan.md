

# Fix Czech Currency Formatting (dot as thousands separator)

## Problem
All currency values use `.toLocaleString()` without a locale, which defaults to the browser's locale. In Czech, thousands should be separated with dots (e.g., `3.000 Kč`), but depending on the browser this may render incorrectly.

## Solution
Create a `formatCurrency` helper function that uses the correct locale based on the active language, then replace all `.toLocaleString()` calls for currency values.

Czech uses `cs-CZ` locale which formats `3000` as `3 000` (with a non-breaking space). Since the user specifically wants dots (e.g., `3.000`), we will use `de-DE` locale for Czech formatting (which uses dots) or a custom formatter.

## Changes

### 1. Add helper function in `src/pages/CalculatorPage.tsx`
Create a `formatPrice` function near the top of the component that formats numbers based on the current language:
- For Czech (`cs`): use `de-DE` locale (produces `3.000` format with dot separators)
- For German (`de`): use `de-DE` locale (same dot separators, standard for German)
- For English (`en`): use `en-US` locale (produces `3,000` format with comma separators)

### 2. Replace all `.toLocaleString()` calls in CalculatorPage
Replace every instance of `value.toLocaleString()` with `formatPrice(value)` throughout the file. This affects approximately 15-20 occurrences across:
- Feature prices in the feature selection step
- Base website price display
- Labor cost display
- Total one-time and monthly costs
- Summary/export text generation

### 3. Update `src/pages/admin/AdminLeads.tsx`
Replace the 3 `.toLocaleString()` calls for `quote_one_time` and `quote_monthly` with locale-aware formatting (admin panel can default to `de-DE` since it appears to be German-focused).

## Technical Details

```typescript
// Helper function
const formatPrice = (value: number): string => {
  if (language === 'en') {
    return value.toLocaleString('en-US');
  }
  // Czech and German both use dot as thousands separator
  return value.toLocaleString('de-DE');
};
```

This ensures:
- Czech: `3.000 Kč`
- German: `3.000 Kč`  
- English: `3,000 Kč`
