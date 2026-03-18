claude chat -p /mnt/skills/public/frontend-design/SKILL.md
```

Then use this prompt:
```
Implement COMPLETE internationalization (i18n) with Hebrew translation and expert-level RTL support across the ENTIRE codebase.

**CRITICAL REQUIREMENTS - DO NOT MISS ANYTHING:**

1. **i18n Infrastructure Setup**
   - Install and configure react-i18next (or next-i18next if Next.js)
   - Create proper folder structure with ORGANIZED translation files:
```
     /locales/en/
       - common.json (shared: buttons, actions, navigation)
       - dashboard.json
       - conversations.json
       - leads.json
       - simulations.json
       - analytics.json
       - profile.json
       - settings.json
       - auth.json
       - errors.json
       - validation.json
     /locales/he/
       - (same structure)
```
   - **IMPORTANT:** Split translation files by feature/page categories for maintainability
   - Set up language detection and switching mechanism
   - Configure fallback language handling
   - Configure namespace loading for split files
   - **Add language switcher INSIDE the user dropdown menu (see screenshot) - between Settings and Sign out**

2. **Language Switcher in User Dropdown**
   - Add language toggle option in the user dropdown menu (Profile → Settings → **Language [EN/HE]** → Sign out)
   - Design should match the existing menu items style
   - Show current language with toggle or selection UI
   - Options: "English" / "עברית"
   - Persist language preference in localStorage
   - Immediately apply RTL/LTR changes when switched
   - Update all UI text instantly on language change

3. **Translation Coverage - 100% REQUIRED**
   Scan and wrap EVERY piece of user-facing text:
   - All page titles, headings, paragraphs
   - All button labels and CTAs ("Start Simulation", "View Conversations", etc.)
   - All navigation items ("Dashboard", "Conversations", "Leads", etc.)
   - All form labels, placeholders, validation messages
   - All empty states ("No data yet")
   - All status messages, tooltips, aria-labels
   - All time/date displays with proper formatting
   - Numbers with proper locale formatting
   - **User dropdown menu items:** "Profile", "Settings", "Language", "Sign out"
   - User info: "Demo User", "OWNER", email display
   
   **Create comprehensive translation files with ALL strings organized by context/page/feature**

4. **Translation File Organization**
   - Analyze the codebase structure and intelligently categorize translations
   - If there are many translations (50+ keys), SPLIT into multiple category files
   - Use clear namespacing: `t('dashboard:welcome')` or `t('common:buttons.submit')`
   - Keep common/shared strings in common.json
   - Put page-specific content in dedicated files
   - Document the namespace structure clearly

5. **Hebrew Translation - Professional Quality**
   - Translate ALL English strings to natural, professional Hebrew
   - Use proper Hebrew terminology for SaaS/business terms:
     - "Dashboard" → "לוח בקרה"
     - "Conversations" → "שיחות"
     - "Leads" → "לידים" (or "פניות")
     - "Simulations" → "סימולציות"
     - "Analytics" → "אנליטיקה"
     - "Qualified Leads" → "לידים מוסמכים"
     - "Profile" → "פרופיל"
     - "Settings" → "הגדרות"
     - "Language" → "שפה"
     - "Sign out" → "התנתק"
     - "OWNER" → "בעלים"
   - Ensure formal/professional tone (not casual)
   - Handle pluralization correctly in Hebrew
   - Format numbers, dates, percentages in Hebrew locale

6. **RTL Implementation - EXPERT LEVEL**
   - Add `dir="rtl"` and `lang="he"` to <html> tag dynamically
   - Review and fix EVERY layout for RTL:
     - Flex/Grid direction reversals (flex-row-reverse when needed)
     - Padding/margin logical properties (use padding-inline-start instead of padding-left)
     - Text alignment (text-start instead of text-left)
     - Icons/arrows that need flipping (use transform: scaleX(-1) for RTL)
     - Border radius adjustments (border-top-left → border-top-right in RTL)
     - Box shadows direction
     - Animations/transitions that move horizontally
   - Ensure sidebar flips to RIGHT side in Hebrew
   - Fix all absolute positioning for RTL (left/right swaps)
   - **User dropdown menu:** should anchor to LEFT in RTL (currently anchors right in screenshot)
   - Test dropdowns, modals, tooltips positioning in RTL
   - Ensure proper text input cursor direction
   - Icons in menu items should flip sides in RTL (icon on right, text on left)

7. **Design System RTL Integration**
   - Update design system to use logical properties everywhere:
     - margin-left → margin-inline-start
     - padding-right → padding-inline-end
     - border-left → border-inline-start
     - left/right → inset-inline-start/end
   - Create RTL-specific utility classes if needed
   - Ensure all spacing/layout tokens work bidirectionally
   - Test all components in both LTR and RTL
   - Add CSS custom properties for directional values if helpful

8. **Code Quality Standards**
   - Use translation keys with clear namespacing (e.g., "dashboard:welcome", "common:buttons.startSimulation")
   - No hard-coded strings should remain
   - Add TypeScript types for translation keys if using TS
   - Proper error handling for missing translations
   - Lazy load translation namespaces for better performance

**DELIVERABLE:**
- Complete i18n setup with configuration files
- Organized translation files split by category/feature (multiple JSON files per language)
- Full English translation files (extracted from current code)
- Full Hebrew translation files (professional translations)
- Updated EVERY component/page with t() functions using proper namespaces
- RTL stylesheet adjustments across entire app
- **Language switcher component integrated into user dropdown menu (between Settings and Sign out)**
- Testing checklist for RTL verification
- Documentation on:
  - Translation file structure and categories
  - Adding new translations
  - Namespace usage guidelines
  - How to use the language switcher

**QUALITY CHECKPOINT:**
After implementation, verify:
✓ Not a single hard-coded user-facing string remains
✓ Translation files are well-organized by category (not one massive file)
✓ App looks pixel-perfect in both English (LTR) and Hebrew (RTL)
✓ Language switcher appears in user dropdown menu and works perfectly
✓ Sidebar appears on RIGHT in Hebrew, LEFT in English
✓ User dropdown menu anchors correctly in both directions
✓ Profile dropdown and all menus open correctly in both directions
✓ All interactive elements work naturally in RTL (hovers, clicks, navigation flow)
✓ Hebrew text is professional and contextually accurate
✓ Design system maintains consistency in both directions
✓ No layout breaks, overlaps, or alignment issues in RTL
✓ Icons and visual elements that should flip are flipped
✓ Menu item icons appear on correct side in each direction
✓ Language preference persists across sessions

Treat this as a PRODUCTION-READY, ENTERPRISE-GRADE implementation. DO NOT SKIP ANYTHING. This should work flawlessly like apps built by Israeli companies (Wix, Monday.com level quality).