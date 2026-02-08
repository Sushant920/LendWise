# LendWise – Product Design Document

## UX & UI Design Specification

Style Direction: Modern, Minimalistic, Corporate Fintech

---

## 1. Design Principles

The LendWise interface should reflect professionalism, trust, and clarity. The visual language should avoid visual noise and rely on whitespace, clean typography, and subtle hierarchy.

Core principles:

1. Clarity over decoration
2. Minimal steps for task completion
3. Transparent decision communication
4. Calm and trustworthy tone
5. Consistent layouts across dashboards and workflows

The interface should feel similar to modern SaaS dashboards used in banking, payments, and enterprise analytics.

---

## 2. Visual Style Guidelines

### Color Philosophy

* Neutral base palette (white, soft greys)
* One primary accent color (deep blue or muted teal)
* Limited use of status colors:

  * Green for approved
  * Amber for processing
  * Red for rejected

Avoid gradients, neon colors, or overly vibrant palettes.

---

### Typography

* Clean sans-serif fonts
* Strong hierarchy:

  * Page titles: Large, bold
  * Section headers: Medium weight
  * Body text: Regular
  * Metadata: Light grey, smaller size

Readable spacing and generous line height are essential.

---

### Layout Style

* Grid-based layout
* Card-based content blocks
* Large whitespace areas
* Subtle shadows or borders
* Soft rounded corners (not exaggerated)

---

### UI Components Style

Buttons:

* Primary: Solid accent color
* Secondary: Outline or neutral grey
* Tertiary: Text-only

Cards:

* Light border
* Minimal shadow
* Consistent padding

Tables:

* Clean rows
* Subtle separators
* No heavy borders

---

## 3. Information Architecture

### Merchant Side

Login
→ Dashboard
→ New Application Flow
→ Results Screen
→ Application History

### Admin Side

Admin Login
→ Admin Dashboard
→ Merchant List
→ Application List
→ Application Detail
→ Risk Breakdown

---

## 4. Merchant Experience Design

## 4.1 Login & Signup

Design Goals:

* Simple
* Fast
* Trustworthy

Layout:

* Centered card
* Logo at top
* Email + password
* Primary CTA: Sign In
* Secondary link: Create Account

Minimal distractions. No marketing clutter.

---

## 4.2 Merchant Dashboard

Purpose:
Give merchants immediate visibility and quick action.

Layout Structure:

Top Bar:

* Logo
* Profile menu
* Logout

Main Area:

Section 1: Summary Cards

* Active Applications
* Last Decision
* Average Risk Score

Section 2: Applications Table
Columns:

* Application ID
* Loan Type
* Status
* Date
* Action

Primary CTA (Top Right):
Start New Application

Design Notes:

* Use calm neutral backgrounds
* Avoid dense tables
* Use spacing to separate sections

---

## 4.3 Loan Application Flow

Design Goal:
Make the process feel guided and effortless.

Structure:
Multi-step form with progress indicator.

Steps:

1. Loan Type
2. Business Details
3. Document Upload
4. Review & Submit

---

### Step Design Pattern

Top:
Progress bar (Step 1 of 4)

Middle:
Form card

Bottom:
Back / Continue buttons

---

### Business Details Form

Fields grouped logically:

* Business Info
* Financial Info

Avoid long vertical forms. Use 2-column layout where appropriate.

Inline validation only.

---

### Document Upload Screen

Design:
Large upload zone
Clear instructions
File preview after upload
Upload progress indicator

Secondary text:
"Your documents are securely processed."

---

## 4.4 Review & Submit

Show summary in sections:

* Loan Type
* Business Info
* Uploaded Documents

Edit buttons beside each section.

Primary CTA:
Submit Application

---

## 4.5 Results Screen

This is the most important experience.

Layout:

Top Banner:
Decision Status

Middle Section:
Cards:

* Risk Score
* Eligible Loan Range
* Interest Range
* Tenure Suggestion

Bottom Section:
Decision Reason
Improvement Tips

Design Goals:

* No technical jargon
* Easy scanning
* Calm tone even in rejection

---

## 5. Admin Experience Design

## 5.1 Admin Dashboard

Purpose:
Operational visibility and control.

Layout:

Top Metrics:

* Total Applications
* Approved
* Rejected
* Pending

Main Section:
Applications Table

Filters:

* Status
* Date range
* Loan type
* Risk score

---

## 5.2 Merchant List

Table Columns:

* Merchant Name
* Business Type
* Applications
* Average Risk Score
* Status

Search bar at top.

---

## 5.3 Application Detail View

Sections:

1. Merchant Info
2. Financial Metrics
3. Extracted Document Data
4. Risk Score Breakdown
5. Decision Summary

Layout:
Two-column information layout for readability.

---

## 6. AI Document Analysis Display

Design:
Show extracted metrics in a structured card:

Average Monthly Revenue
Highest Revenue
Lowest Revenue
Average Balance
Negative Days
Volatility
Financial Summary

Keep presentation neutral and factual.

---

## 7. Risk Score Visualization

Display as:

* Circular score indicator OR horizontal bar
* Color range:

  * Low risk: green
  * Medium risk: amber
  * High risk: red

Show explanation below.

---

## 8. Navigation Design

Left Sidebar Navigation:

Merchant:

* Dashboard
* Applications
* New Application

Admin:

* Dashboard
* Merchants
* Applications

Sidebar should be collapsible.

---

## 9. Interaction Design

Microinteractions:

* Button hover states
* Upload progress animations
* Loading skeletons
* Success confirmations

Avoid excessive animations.

---

## 10. Responsive Design

Breakpoints:

* Desktop (primary)
* Tablet (secondary)
* Mobile (basic usability)

Mobile:

* Stacked cards
* Simplified tables
* Step forms optimized for touch

---

## 11. Empty States

Examples:
"No applications yet"
"Upload your first document"
"No results found"

Each empty state should:

* Explain clearly
* Provide a next action

---

## 12. Error States

Principles:

* Clear language
* Non-technical wording
* Actionable guidance

Example:
"Upload failed. Please try again."

---

## 13. Accessibility

* Minimum contrast ratio compliance
* Keyboard navigation support
* Large clickable targets
* Form labels always visible

---

## 14. Tone of Voice

Text should feel:

* Professional
* Calm
* Transparent
* Supportive

Avoid:

* Aggressive language
* Complex financial jargon

Example:

Instead of:
"Application rejected due to insufficient liquidity metrics."

Use:
"Your current cash flow is lower than the required range for this loan."

---

## 15. Future Design Extensions

* Dark mode (corporate theme)
* Multi-lender comparison screen
* Portfolio analytics dashboard
* Merchant credit improvement insights panel

---

End of Document
