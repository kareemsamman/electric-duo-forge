

## Fix: Stack Service Links Vertically

Change the links container in `src/components/home/ServicesSection.tsx` (line 176) from horizontal wrapping to vertical column layout.

### Technical Details

**File: `src/components/home/ServicesSection.tsx`**
- Line 176: Change `className="flex flex-wrap gap-x-4 gap-y-1"` to `className="flex flex-col gap-y-1"` so links stack vertically instead of wrapping horizontally.

