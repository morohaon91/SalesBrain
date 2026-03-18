# Internationalization (i18n) & RTL Implementation Guide

## Overview
This document provides complete guidance on the i18n implementation with Hebrew translation and expert-level RTL support for SalesBrain.

## ✅ Completed Setup

### 1. Infrastructure
- ✅ Installed `react-i18next` and `i18next` packages
- ✅ Created i18n configuration files:
  - `i18n.config.ts` - i18n initialization with namespace support
  - `next-i18next.config.js` - Next.js i18n configuration
  - `lib/hooks/useI18n.ts` - Custom React hook for translations
  - `components/i18n/I18nProvider.tsx` - i18n provider wrapper

### 2. Translation Files Created
Complete folder structure with English and Hebrew translations:

```
locales/
├── en/
│   ├── common.json (UI elements, navigation, buttons)
│   ├── auth.json (login, register, auth messages)
│   ├── dashboard.json (dashboard-specific content)
│   ├── conversations.json (conversations page)
│   ├── leads.json (leads management)
│   ├── simulations.json (simulations page)
│   ├── analytics.json (analytics page)
│   ├── profile.json (profile page)
│   ├── settings.json (settings page)
│   ├── errors.json (error messages)
│   └── validation.json (validation messages)
└── he/ (identical structure with Hebrew translations)
```

### 3. Language Switcher
- ✅ Created `LanguageSwitcher.tsx` component
- ✅ Integrated into Header user dropdown menu (between Settings and Sign out)
- ✅ Persists language preference to localStorage
- ✅ Dynamically updates HTML attributes for RTL

### 4. RTL Support
- ✅ Created `app/rtl.css` with comprehensive RTL styling
- ✅ Configured dynamic `dir="rtl"` and `lang="he"` attributes
- ✅ CSS logical properties for bidirectional layout support
- ✅ Sidebar flips to right side in Hebrew
- ✅ Menu items reverse for RTL

### 5. Component Updates
- ✅ Root layout wrapped with I18nProvider
- ✅ Header component updated with language switcher
- ✅ Sidebar component using translated navigation labels
- ✅ Dashboard page fully translated

---

## 📋 Remaining Work

### Phase 1: Update All Pages with Translations

Update the following pages to use `useI18n()` hook:

#### Auth Pages
- `app/(auth)/login/page.tsx` - Use `auth` namespace
- `app/(auth)/register/page.tsx` - Use `auth` namespace

**Example:**
```typescript
"use client";
import { useI18n } from "@/lib/hooks/useI18n";

export default function LoginPage() {
  const { t } = useI18n('auth');

  return (
    <div>
      <h1>{t('login.title')}</h1>
      <label>{t('login.email')}</label>
      // ... more content
    </div>
  );
}
```

#### Dashboard Pages
- `app/(dashboard)/conversations/page.tsx` - Use `conversations` namespace
- `app/(dashboard)/conversations/[id]/page.tsx` - Use `conversations` namespace
- `app/(dashboard)/leads/page.tsx` - Use `leads` namespace
- `app/(dashboard)/leads/[id]/page.tsx` - Use `leads` namespace
- `app/(dashboard)/simulations/page.tsx` - Use `simulations` namespace
- `app/(dashboard)/simulations/new/page.tsx` - Use `simulations` namespace
- `app/(dashboard)/simulations/[id]/page.tsx` - Use `simulations` namespace
- `app/(dashboard)/analytics/page.tsx` - Use `analytics` namespace
- `app/(dashboard)/profile/page.tsx` - Use `profile` namespace
- `app/(dashboard)/settings/page.tsx` - Use `settings` namespace

### Phase 2: Update UI Components

Update shared components to accept translatable labels:

#### Components to Update
- `components/ui/button.tsx` - If it has default labels
- `components/ui/input.tsx` - For placeholder translations
- `components/shared/empty-state.tsx` - For empty state messages
- `components/shared/pagination.tsx` - For pagination labels
- `components/shared/stats-card.tsx` - For stats labels
- `components/simulations/simulation-chat.tsx` - For chat messages

### Phase 3: Translation Completion Checklist

For each page/component, ensure ALL user-facing text is wrapped with `t()`:

- [ ] Page titles and headings
- [ ] Button labels (Submit, Cancel, Save, etc.)
- [ ] Navigation items
- [ ] Form labels and placeholders
- [ ] Validation messages
- [ ] Error messages
- [ ] Success/info messages
- [ ] Empty states
- [ ] Status labels
- [ ] Table headers and column names
- [ ] Tooltips and aria-labels
- [ ] Date/time displays

### Phase 4: Testing RTL Layout

After implementing i18n across all pages, test RTL rendering:

**Checklist:**
- [ ] Switch to Hebrew in language menu
- [ ] Verify sidebar appears on RIGHT side
- [ ] Verify header user dropdown anchors to LEFT
- [ ] Check all text aligns to right
- [ ] Verify form inputs have proper direction
- [ ] Test all dropdowns/menus open correctly
- [ ] Check icon positioning (should flip in RTL)
- [ ] Verify mobile layout works in RTL
- [ ] Test all navigation links work in both directions
- [ ] Check animations move in correct direction

---

## 🔧 How to Use the i18n Hook

### Basic Usage
```typescript
import { useI18n } from "@/lib/hooks/useI18n";

export default function MyComponent() {
  const { t } = useI18n('common'); // Specify namespace

  return <h1>{t('navigation.dashboard')}</h1>;
}
```

### With Multiple Namespaces
```typescript
const { t } = useI18n(['common', 'auth']);

return (
  <>
    <h1>{t('common:navigation.dashboard')}</h1>
    <p>{t('auth:login.title')}</p>
  </>
);
```

### With RTL Detection
```typescript
const { t, isHebrew, dir } = useI18n('common');

return (
  <div dir={dir} lang={isHebrew ? 'he' : 'en'}>
    {t('navigation.dashboard')}
  </div>
);
```

---

## 📝 Adding New Translations

### 1. Add to Translation File
```json
{
  "newFeature": {
    "title": "Feature Title",
    "description": "Feature description"
  }
}
```

### 2. Use in Component
```typescript
const { t } = useI18n('namespace');
<h1>{t('newFeature.title')}</h1>
```

### 3. Update Hebrew Translation
Add matching keys to the Hebrew translation file with proper Hebrew translations.

---

## 🎯 CSS Logical Properties Reference

For RTL support, use logical properties instead of directional ones:

| LTR Property | RTL Equivalent | Logical Property |
|---|---|---|
| `margin-left` | `margin-right` | `margin-inline-start` |
| `padding-right` | `padding-left` | `padding-inline-end` |
| `border-left` | `border-right` | `border-inline-start` |
| `left` | `right` | `inset-inline-start` |
| `flex-row` | `flex-row-reverse` | Use `[dir=rtl]` selector |
| `text-left` | `text-right` | `text-start` / `text-end` |

---

## 🚀 Deployment Checklist

- [ ] All pages use i18n hooks
- [ ] All hardcoded strings removed
- [ ] Translation files complete and reviewed
- [ ] Hebrew translations professionally reviewed
- [ ] RTL layout tested in all browsers
- [ ] Mobile RTL layout tested
- [ ] Language switcher functional
- [ ] Language preference persists across sessions
- [ ] No console errors or warnings
- [ ] Build passes without errors
- [ ] Accessibility tests pass (ARIA labels, direction, etc.)

---

## 📚 Useful Resources

- **i18next Documentation**: https://www.i18next.com/
- **react-i18next**: https://react.i18next.com/
- **CSS Logical Properties**: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties
- **RTL Best Practices**: https://www.w3.org/International/questions/qa-html-dir

---

## 🔍 Quick Reference: Translation Keys

### Common Namespace
```
common:
  - navigation.* (dashboard, conversations, leads, simulations, analytics, profile, settings)
  - buttons.* (submit, cancel, save, delete, etc.)
  - user.* (profile, settings, language, signOut)
  - menu.* (profile, settings, language, signOut)
  - sidebar.* (trialPlan, upgradePlan, etc.)
  - status.* (loading, success, error, warning, info)
```

### Feature Namespaces
```
auth: login/register related
dashboard: dashboard page
conversations: conversations page
leads: leads management
simulations: simulations page
analytics: analytics page
profile: profile management
settings: user settings
errors: error messages
validation: form validation
```

---

## 💡 Pro Tips

1. **Keep translations organized** - Use nested keys like `feature:section.item`
2. **Use clear key names** - Avoid abbreviations
3. **Test both directions** - Always test LTR and RTL
4. **Review Hebrew translations** - Ensure professional tone and correct terminology
5. **Use interpolation** - For dynamic content: `t('key', { name: user.name })`
6. **Set up fallbacks** - All missing keys fall back to English

---

## 📞 Support

For issues or questions about the i18n implementation, refer to:
- i18next documentation
- React-i18next documentation
- This implementation guide
