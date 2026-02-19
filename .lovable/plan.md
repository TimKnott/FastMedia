
# Navbar Spacing Improvement and Global Language Switcher

## What will change

### 1. Navbar Layout Refinement
- Add more breathing room around the FastMedia.Pro logo with increased left padding/margin
- Reduce the gap between nav links from `gap-8` to `gap-5` or `gap-6` to fit better while keeping the logo spacious
- Add a subtle separator (vertical divider) between the logo and the navigation links
- Increase the navbar height slightly on desktop for a more premium feel
- Ensure the logo area has dedicated space that doesn't get crowded by nav links

### 2. Language Switcher on Calculator Page
- Add the same Globe dropdown language switcher (already in the main Navbar) to the calculator page header, replacing the empty spacer `div` on the right side
- This ensures users can switch languages while using the calculator

### 3. Language Switcher on Demo Pages
- Add the language switcher to the DemoLayout component header so all 16 trade demo pages get language switching capability

## Technical Details

**Files to modify:**

1. **`src/components/Navbar.tsx`**
   - Change the logo `Link` to include more right margin (`mr-8` or `mr-10`)
   - Reduce desktop nav links gap from `gap-8` to `gap-5`
   - Optionally add a vertical separator element between logo and nav
   - Increase container padding for more whitespace

2. **`src/pages/CalculatorPage.tsx`**
   - Replace the empty `<div className="w-24" />` spacer (line 323) with the language dropdown (Globe icon + DropdownMenu)
   - Import the necessary dropdown components and Globe icon

3. **`src/components/DemoLayout.tsx`**
   - Add the language switcher dropdown to the demo page header area
   - Import dropdown components and Globe icon

All three files will reuse the same language switcher pattern already established in the Navbar (Globe icon, DropdownMenu with three language options: CS, EN, DE).
