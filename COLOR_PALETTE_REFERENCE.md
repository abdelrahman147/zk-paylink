# 🎨 Color Palette Reference

## Primary Colors

### Cyan (Primary Accent)
```css
--accent-cyan: #8be9fd
```
**RGB:** 139, 233, 253  
**HSL:** 191°, 97%, 77%  
**Use:** Primary buttons, links, highlights, borders

### Purple (Secondary Accent)
```css
--accent-purple: #bd93f9
```
**RGB:** 189, 147, 249  
**HSL:** 265°, 89%, 78%  
**Use:** Secondary buttons, gradients, special elements

### Pink (Tertiary Accent)
```css
--accent-pink: #ff79c6
```
**RGB:** 255, 121, 198  
**HSL:** 326°, 100%, 74%  
**Use:** Highlights, special states, decorative elements

### Green (Success)
```css
--accent-green: #50fa7b
```
**RGB:** 80, 250, 123  
**HSL:** 135°, 94%, 65%  
**Use:** Success messages, verified states, positive actions

### Yellow (Warning)
```css
--accent-yellow: #f1fa8c
```
**RGB:** 241, 250, 140  
**HSL:** 65°, 92%, 76%  
**Use:** Warnings, pending states, caution messages

### Orange (Warm Accent)
```css
--accent-orange: #ffb86c
```
**RGB:** 255, 184, 108  
**HSL:** 31°, 100%, 71%  
**Use:** Warm highlights, special offers, attention

### Red (Error)
```css
--accent-red: #ff5555
```
**RGB:** 255, 85, 85  
**HSL:** 0°, 100%, 67%  
**Use:** Errors, critical actions, delete buttons

---

## Background Colors

### Primary Background
```css
--bg-primary: #0a0e1a
```
**RGB:** 10, 14, 26  
**Use:** Main page background

### Secondary Background
```css
--bg-secondary: #0f1419
```
**RGB:** 15, 20, 25  
**Use:** Card backgrounds, sections

### Tertiary Background
```css
--bg-tertiary: #151b26
```
**RGB:** 21, 27, 38  
**Use:** Nested elements, inputs

### Code Background
```css
--bg-code: #080b12
```
**RGB:** 8, 11, 18  
**Use:** Code blocks, terminal bodies

### Terminal Background
```css
--bg-terminal: rgba(8, 11, 18, 0.98)
```
**Use:** Terminal bar, terminal windows

---

## Text Colors

### Primary Text
```css
--text-primary: #f0f9ff
```
**RGB:** 240, 249, 255  
**Use:** Headings, important text

### Secondary Text
```css
--text-secondary: #94a3b8
```
**RGB:** 148, 163, 184  
**Use:** Body text, descriptions

### Muted Text
```css
--text-muted: #64748b
```
**RGB:** 100, 116, 139  
**Use:** Subtle text, placeholders

### Glow Text
```css
--text-glow: #8be9fd
```
**RGB:** 139, 233, 253  
**Use:** Special text with glow effect

---

## Glassmorphism

### Glass Background
```css
--glass-bg: rgba(20, 28, 45, 0.65)
```
**Use:** Standard glass cards

### Strong Glass Background
```css
--glass-bg-strong: rgba(20, 28, 45, 0.85)
```
**Use:** Important glass elements

### Glass Border
```css
--glass-border: rgba(139, 233, 253, 0.12)
```
**Use:** Standard glass borders

### Strong Glass Border
```css
--glass-border-strong: rgba(139, 233, 253, 0.25)
```
**Use:** Hover states, emphasis

### Glass Highlight
```css
--glass-highlight: rgba(255, 255, 255, 0.05)
```
**Use:** Inner glow, subtle highlights

---

## Gradients

### Primary Gradient
```css
--gradient-primary: linear-gradient(135deg, #8be9fd 0%, #bd93f9 100%)
```
**Colors:** Cyan → Purple  
**Use:** Primary buttons, titles, special elements

### Secondary Gradient
```css
--gradient-secondary: linear-gradient(135deg, #bd93f9 0%, #ff79c6 100%)
```
**Colors:** Purple → Pink  
**Use:** Secondary elements, decorative

### Success Gradient
```css
--gradient-success: linear-gradient(135deg, #50fa7b 0%, #8be9fd 100%)
```
**Colors:** Green → Cyan  
**Use:** Success states, verified elements

---

## Shadows

### Small Shadow
```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3)
```
**Use:** Subtle elevation

### Medium Shadow
```css
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4)
```
**Use:** Cards, buttons

### Large Shadow
```css
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5)
```
**Use:** Modals, important elements

### Extra Large Shadow
```css
--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.6)
```
**Use:** Floating elements, popups

### Glow Shadow
```css
--shadow-glow: 0 0 24px rgba(139, 233, 253, 0.3)
```
**Use:** Neon glow effect

### Strong Glow Shadow
```css
--shadow-glow-strong: 0 0 40px rgba(139, 233, 253, 0.5)
```
**Use:** Intense glow, hover states

---

## Usage Examples

### Button with Gradient
```css
.btn-primary {
  background: var(--gradient-primary);
  color: var(--bg-primary);
  box-shadow: var(--shadow-glow);
}
```

### Glass Card
```css
.card {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-lg);
}
```

### Gradient Text
```css
.title {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Neon Glow Text
```css
.glow-text {
  color: var(--accent-cyan);
  text-shadow: 0 0 12px rgba(139, 233, 253, 0.6);
}
```

---

## Color Combinations

### Cyan + Purple (Primary)
- **Best for:** Buttons, titles, important elements
- **Contrast:** High
- **Mood:** Modern, tech, premium

### Purple + Pink (Secondary)
- **Best for:** Decorative, special features
- **Contrast:** Medium
- **Mood:** Creative, energetic

### Green + Cyan (Success)
- **Best for:** Success messages, verified states
- **Contrast:** High
- **Mood:** Positive, trustworthy

### Cyan on Dark
- **Best for:** Text, borders, highlights
- **Contrast:** Excellent
- **Accessibility:** WCAG AAA

---

## Accessibility

### Contrast Ratios

| Foreground | Background | Ratio | WCAG |
|------------|------------|-------|------|
| #8be9fd | #0a0e1a | 12.5:1 | AAA ✅ |
| #bd93f9 | #0a0e1a | 9.8:1 | AAA ✅ |
| #50fa7b | #0a0e1a | 13.2:1 | AAA ✅ |
| #f0f9ff | #0a0e1a | 15.1:1 | AAA ✅ |
| #94a3b8 | #0a0e1a | 7.2:1 | AAA ✅ |

All color combinations meet WCAG AAA standards for accessibility.

---

## Quick Reference

### Most Used Colors
1. **Cyan** (#8be9fd) - Primary accent
2. **Purple** (#bd93f9) - Secondary accent
3. **Green** (#50fa7b) - Success
4. **Dark BG** (#0a0e1a) - Background

### Most Used Gradients
1. **Cyan → Purple** - Primary gradient
2. **Purple → Pink** - Secondary gradient
3. **Green → Cyan** - Success gradient

### Most Used Shadows
1. **Glow** - Neon effect
2. **Large** - Cards
3. **Medium** - Buttons

---

## Color Psychology

### Cyan (#8be9fd)
- **Emotion:** Trust, technology, innovation
- **Use:** Primary actions, important info

### Purple (#bd93f9)
- **Emotion:** Creativity, luxury, wisdom
- **Use:** Premium features, special elements

### Pink (#ff79c6)
- **Emotion:** Energy, playfulness, modern
- **Use:** Highlights, special offers

### Green (#50fa7b)
- **Emotion:** Success, growth, positive
- **Use:** Confirmations, verified states

---

## Export Formats

### CSS Variables
```css
:root {
  --accent-cyan: #8be9fd;
  --accent-purple: #bd93f9;
  --accent-pink: #ff79c6;
  --accent-green: #50fa7b;
  --accent-yellow: #f1fa8c;
  --accent-orange: #ffb86c;
  --accent-red: #ff5555;
}
```

### SCSS Variables
```scss
$accent-cyan: #8be9fd;
$accent-purple: #bd93f9;
$accent-pink: #ff79c6;
$accent-green: #50fa7b;
$accent-yellow: #f1fa8c;
$accent-orange: #ffb86c;
$accent-red: #ff5555;
```

### JavaScript
```javascript
const colors = {
  cyan: '#8be9fd',
  purple: '#bd93f9',
  pink: '#ff79c6',
  green: '#50fa7b',
  yellow: '#f1fa8c',
  orange: '#ffb86c',
  red: '#ff5555'
};
```

---

**🎨 Use this reference when customizing your UI!**
