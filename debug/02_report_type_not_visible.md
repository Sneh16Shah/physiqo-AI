# Bug #2: Report Type Dropdown Not Visible

## Symptom
- On the Scan Upload page, the "Report Type" label is visible but the dropdown appears as a blank/invisible white box
- User cannot select a report type
- No errors in console — purely a UI/CSS issue

## How to Investigate

### Step 1: Browser DevTools → Inspect Element
Right-click the invisible dropdown → **Inspect**. Look at:
- **Computed Styles** → Check `color`, `background-color`, `border`
- If `color: white` AND `background-color: white` → text is invisible against background

### Step 2: Check the Component
```powershell
Get-ChildItem -Path frontend/src -Recurse -Include *.tsx | Select-String "Report Type"
```
Open the component and look at the `<select>` element's CSS classes.

## Root Cause
The app uses a **dark theme** but the `<select>` dropdown and its `<option>` elements had no explicit dark-mode styling. Browser defaults rendered:
- White text on white background (invisible)
- No visible border

## Fix Applied
- **File**: `frontend/src/features/body-composition/components/ScanUpload.tsx`
- **Change**: Added dark theme classes to the `<select>` and `<option>` elements:
  ```tsx
  <select className="bg-surface-900 border-surface-800 text-white ...">
    <option className="bg-surface-950">DEXA</option>
  </select>
  ```

## Lesson Learned
> When using dark themes, **always** style form elements explicitly (`<select>`, `<option>`, `<input>`).
> Browser default styles assume a light background.
> Test all form elements visually after adding dark mode.
