# Sidebar Structure & Features Guide

## Sidebar Layout

```
┌──────────────────────────────────┐
│  HEADER (Blue Gradient)          │
├──────────────────────────────────┤
│ 📍 Visited Places                │
│ 5 locations                      │
│                                  │
│ [X] Close/Collapse               │
│                                  │
├──────────────────────────────────┤
│                                  │
│ LOCATION CARD 1                  │
│ ┌─────────────────────────────┐ │
│ │ ①                           │ │
│ │ Downtown Coffee Meeting     │ │
│ │ 📍 5th Avenue, New York    │ │
│ │ 📅 Jan 21, 2026           │ │
│ │ ⏰ 9:30 AM                 │ │
│ │ 📝 Note                    │ │
│ │ "Had important discussion.."│ │
│ │                           ► │
│ └─────────────────────────────┘ │
│                                  │
├──────────────────────────────────┤
│                                  │
│ LOCATION CARD 2                  │
│ ┌─────────────────────────────┐ │
│ │ ②                           │ │
│ │ Coffee with Sarah          │ │
│ │ 📍 Broadway Café, NYC      │ │
│ │ 📅 Jan 21, 2026           │ │
│ │ ⏰ 11:15 AM                │ │
│ │ ⏰ Reminder                │ │
│ │ "Don't forget to call Mom" │ │
│ │                           ► │ │
│ └─────────────────────────────┘ │
│                                  │
├──────────────────────────────────┤
│ ... MORE CARDS (Scroll down) ...  │
│                                  │
└──────────────────────────────────┘

Legend:
① = Sequential number (color-coded)
📍 = Location name (from reverse geocoding)
📅 = Date visited
⏰ = Time visited (or type if reminder)
📝 = Activity type
► = Click indicator / Chevron
```

---

## Card Color Coding

### Number Circle Colors

```
🟢 GREEN (#10b981)          🔵 BLUE (#3b82f6)           🔴 RED (#ef4444)
First location              Middle locations            Last location
(Start of day)             (Journey points)            (End of day)
```

Example:
```
① Green   - "Downtown" (9:30 AM - first place you went)
② Blue    - "Coffee Shop" (11:15 AM - somewhere in between)
③ Blue    - "Park" (2:45 PM - somewhere in between)
④ Blue    - "Restaurant" (6:30 PM - somewhere in between)
⑤ Red     - "Home" (8:00 PM - last place you were)
```

### Type Badges

```
📝 Note                          ⏰ Reminder
Background: Emerald green        Background: Orange amber
Text: Dark green                 Text: Dark orange
```

---

## Interactive States

### Normal State
```
┌─────────────────────────────────┐
│ ②                              │
│ Coffee Shop                     │
│ 📍 Broadway, NYC               │
│ Border-left: Light gray         │
│ Background: White               │
└─────────────────────────────────┘
```

### Hover State
```
┌─────────────────────────────────┐
│ ②                              │
│ Coffee Shop                     │
│ 📍 Broadway, NYC               │
│ Border-left: Light gray         │
│ Background: Light gray/white    │
│ Shadow: Subtle                  │
└─────────────────────────────────┘
```

### Selected State (Active)
```
┌─────────────────────────────────┐
│ ② ← HIGHLIGHTED!               │
│ Coffee Shop                     │
│ 📍 Broadway, NYC               │
│ Border-left: BLUE (#2563eb)     │
│ Background: LIGHT BLUE          │
│ Chevron: ► (visible & blue)     │
└─────────────────────────────────┘
```

---

## Card Content Sections

### Section 1: Title Bar
```
┌─────────────────────────────────┐
│ ②  Coffee Shop                  │ ← Number + Title
└─────────────────────────────────┘
```
- Left: Colored number circle
- Middle: Activity title/name
- Right: (empty space)

### Section 2: Location Details
```
┌─────────────────────────────────┐
│ 📍 Broadway Café, New York     │ ← Place name in blue
└─────────────────────────────────┘
```
- MapPin icon: Shows real place
- Blue text: Highlights location
- Truncated if too long

### Section 3: Date & Time
```
┌─────────────────────────────────┐
│ 📅 Jan 21, 2026                │
│ ⏰ 11:15 AM                    │
└─────────────────────────────────┘
```
- Calendar icon for date
- Clock icon for time
- In small gray text
- Separate lines for readability

### Section 4: Type Badge
```
┌─────────────────────────────────┐
│ 📝 Note    or    ⏰ Reminder    │ ← Activity type
└─────────────────────────────────┘
```
- Colored background badge
- Icon + text
- Clickable (shows details)

### Section 5: Description Preview
```
┌─────────────────────────────────┐
│ "Great chat about project      │ ← First 100 chars
│ timeline and next steps..."    │ ← 2 lines max
└─────────────────────────────────┘
```
- Italic text (gray)
- First 100 characters only
- Truncated with ellipsis (...)
- Up to 2 lines display

### Section 6: Interaction Indicator
```
┌─────────────────────────────────┐
│                              ► │ ← Chevron (clickable)
└─────────────────────────────────┘
```
- Right-aligned chevron icon
- Changes color when selected
- Slides right on hover
- Shows interactivity

---

## Spacing & Layout

### Vertical Spacing
```
Header: 16px padding
Card top: 16px margin
Number circle: 8px × 8px (flex-shrink-0)
Gap between items: 8px
Card padding: 16px
Border-left width: 4px
Dividing line between cards: 1px gray
```

### Horizontal Spacing
```
Left margin (number): 0px
Gap between number and content: 12px
Gap between icons and text: 8px
Right padding: 16px
Chevron right position: 16px from edge
```

### Text Styling
```
Title: Bold, 14px, Dark gray (#1f2937)
Place name: Bold, 12px, Blue (#2563eb)
Date/Time: Regular, 12px, Gray (#4b5563)
Badge: Bold, 12px, Colored
Preview: Italic, 12px, Light gray (#6b7280)
```

---

## Scrolling Behavior

### When List is Full
```
┌──────────────────────┐
│ HEADER (fixed)       │
├──────────────────────┤
│ Card 1               │
├──────────────────────┤ ←─ Scrollable area
│ Card 2               │    (flex-1 overflow-y-auto)
├──────────────────────┤
│ Card 3               │
├──────────────────────┤
│ Card 4               │
├──────────────────────┤
│ Card 5               │
│ [Scroll down ↓]      │
└──────────────────────┘
```

- Header stays fixed at top
- Cards scroll in middle section
- Footer (if any) scrolls away
- Scrollbar appears on right
- Smooth scrolling enabled

### Scroll States

**At Top**
```
[Header visible]
[All cards visible from top]
[Scroll bar at top]
```

**In Middle**
```
[Header visible]
[Some cards cut off above]
[Some cards visible]
[Some cards cut off below]
[Scroll bar in middle]
```

**At Bottom**
```
[Header visible]
[All cards visible from bottom]
[Scroll bar at bottom]
```

---

## Empty State

### When No Locations
```
┌──────────────────────────────────┐
│  HEADER                          │
├──────────────────────────────────┤
│                                  │
│                                  │
│     📍 No activities with       │
│        locations yet.            │
│     Add locations to your        │
│     notes!                       │
│                                  │
│                                  │
└──────────────────────────────────┘
```

- Centered message
- Light gray text
- Large icon
- Helpful hint

---

## Animation Effects

### Card Hover
```javascript
// CSS
transition: all 0.15s ease-in-out
background-color: hover:#f9fafb
box-shadow: hover:0 4px 6px rgba(...)
```

### Chevron Active
```javascript
// On select
transform: translateX(4px)
color: #2563eb
```

### Fade In
```javascript
// When card appears
animation: fadeIn 0.3s ease-in
opacity: 0 → 1
```

---

## Responsive Sidebar

### Desktop (1200px+)
```
Sidebar width: 384px (w-96)
Card padding: 16px
Font size: 12-14px
All sections visible
```

### Tablet (768px-1200px)
```
Sidebar width: 320px
Card padding: 12px
Font size: 11-13px
Description truncated to 1 line
```

### Mobile (< 768px)
```
Sidebar: Full width or stacked
Card padding: 12px
Font size: 11px
Number circle: Smaller
Chevron: Larger touch target
```

---

## Accessibility Features

### Keyboard Navigation
- Tab through cards
- Enter to select
- Shift+Tab to go back
- Arrow keys to navigate

### Screen Reader Support
- Semantic HTML structure
- ARIA labels on interactive elements
- Descriptive alt text for icons
- Clear heading hierarchy

### Visual Indicators
- Color-coded numbers (not just color)
- Clear text labels
- High contrast ratios
- Large touch targets (44px minimum)

### Focus Indicators
```
Active card shows:
• Blue border-left
• Light blue background
• Chevron highlight
```

---

## Code Structure

```typescript
// Sidebar Container
<div className="w-96 flex flex-col bg-white rounded-xl shadow-lg">
  
  // Header
  <div className="bg-gradient-to-r from-blue-600 to-indigo-600">
    <h3>📍 Visited Places</h3>
    <p>{locationMarkers.length} location(s)</p>
  </div>

  // Scrollable Area
  <div className="flex-1 overflow-y-auto">
    {locationMarkers.map(marker => (
      // Location Card
      <div className="p-4 border-l-4 cursor-pointer">
        
        // Number + Title
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full">
            {marker.index}
          </div>
          <div>
            <h4>{marker.title}</h4>
            <p className="text-blue-600">
              📍 {marker.placeName}
            </p>
          </div>
        </div>

        // Date & Time
        <div className="mt-3 ml-11 space-y-1">
          <div>📅 {marker.date}</div>
          <div>⏰ {marker.time}</div>
          <div>{marker.type}</div>
        </div>

        // Description
        {marker.description && (
          <p className="text-xs mt-3">{preview}</p>
        )}

        // Chevron
        <ChevronRight className="..." />
      </div>
    ))}
  </div>
</div>
```

---

**The sidebar is the heart of the Timeline Map experience!** 💙
It bridges the gap between the visual map and the detailed data.
