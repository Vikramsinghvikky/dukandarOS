# DUKANDAR-OS — SOVEREIGN ACOUSTIC KHATA & DISPUTE COPILOT (GLASS EDITION)
## Master Frontend & Architecture Specification Prompt

> **Role & Objective:** Act as an Elite Principal Frontend Architect and Motion Designer. Build the complete, production-ready, interactive single-page SaaS dashboard for **DukandarOS — Sovereign AI End-of-Day Acoustic Khata & Next-Day Dispute Resolver**, specifically styled with a **Tactile Frosted-Glass (Glassmorphism) Design System** on top of a vibrant Mint/Emerald brand aesthetic, paired with rich motion physics, instant offline demo data, and full database persistence.

---

### 1. DESIGN SYSTEM: FROSTED GLASS & MINT MONOLITH

* **Aesthetic Classification:** Tactile Frosted Glassmorphism + Indian Retail Fintech Dashboard.
* **Color Palette & Atmosphere:**
  * **Brand Primary:** Sovereign Mint & Emerald (`#10B981`, `#059669`, `#34D399`, `#A7F3D0`).
  * **Brand Secondary (Alert / Credit):** Warm Amber Gold (`#F59E0B`, `#D97706`).
  * **Brand Danger (Disputes):** Coral Rose (`#F43F5E`).
  * **Dark Glass Theme (Default):** Deep carbon obsidian canvas (`#06090E`), translucent frosted cards (`bg-[#0B121C]/75 backdrop-blur-2xl border border-white/[0.09] shadow-2xl`), elevated inner panels (`bg-[#0F1826]/80 border border-white/[0.06]`), and soft mint ambient radial glows (`bg-emerald-500/[0.08] blur-[140px]`).
  * **Light Glass Theme:** Crisp pearl-white canvas (`#F4F7FB` or `#F0FDF4`), crystalline frosted glass cards (`bg-white/80 backdrop-blur-2xl border border-emerald-900/[0.08] shadow-xl shadow-emerald-950/5`), elevated inner panels (`bg-emerald-50/60 border border-emerald-500/10`), high-contrast dark text (`#0F172A`), and soft emerald ambient glow.
* **Depth & Glass Hierarchy:**
  * Multi-layer glass depth: Level 0 (Canvas with ambient gradient lights) ➔ Level 1 (Frosted bento cards with 1px specular highlight borders) ➔ Level 2 (Inner elevated inputs, waveform containers, and table headers) ➔ Level 3 (Floating modals, popovers, and sticky toolbars).
* **Typography Discipline:**
  * Primary Font: `'Plus Jakarta Sans'` or `'Inter'` for UI labels, titles, and body copy.
  * Monospace Standard: Strictly `'JetBrains Mono'` (`font-mono tabular-nums`) for all monetary values (`₹`), timestamps (`04:15 PM`), noise decibels (`76 dB`), phonetic transcripts, and calculation formulas.

---

### 2. MOTION PHYSICS & MICRO-INTERACTIONS

* **Spring Physics Standard:** Use `framer-motion` with consistent spring configurations: `stiffness: 320, damping: 26, mass: 1` for snappy, zero-lag tactile feel.
* **Staggered Card Entrances:** Page load initiates a subtle staggered fade-and-slide entrance (`opacity: 0, y: 16` ➔ `opacity: 1, y: 0`) for header, scrubber, KPI grid, and workspace columns.
* **Tactile Hover & Tap States:**
  * Cards lift subtly on hover (`hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-emerald-500/10 transition-all duration-200`).
  * Interactive buttons shrink on click (`active:scale-[0.97]`).
  * Primary CTAs include a soft sweeping shimmer scanline animation (`shimmer-sweep`).
* **Animated Waveform & Equalizers:**
  * 64-bar acoustic density audio scrubber with sinusoidal height variance.
  * Active voice proof playback triggers a lively 10-bar micro-equalizer waveform animation.
* **Count-Up Numbers for Financials:**
  * Changing or settling rupee values triggers count-up or flash-pulse micro-transitions to highlight updated ledger state.
* **Page & Drawer Transitions:**
  * Smooth slide-overs for Mobile Menu, Customer Detail Drawer, Search Command Palette, and Settlement Modals with backdrop blur.

---

### 3. EXISTING CORE MODULES (EXACT SCREEN RECREATION)

Recreate the complete layout and behavior of the original DukandarOS dashboard:

1. **Sticky Header & Noise Stress-Tester:**
   * Radio brand mark, DukandarOS title, and Sovereign AI for India badge.
   * Street Noise Stress-Tester slider (55 dB – 92 dB) with real-time recalculation of **Gnani Prisma NER Accuracy** (e.g. 99.4% down to 92.8% at maximum noise).
   * Backend connectivity status badge (`Offline Local Ledger Mode` / `FastAPI Connected`).
   * "Simulate Call" trigger button: Arms the 15-second volatile FIFO RAM Call Shield for personal phone calls.
   * "Stop Day & Analyze" primary CTA: Launches the 3-stage Batch AI processing overlay.
2. **11.5-Hour Counter Acoustic Scrubber (08:00 AM – 09:30 PM):**
   * Audio source dropdown (`day_stall_recording_oct31.wav`, `evening_rush.wav`).
   * Dual-layer audio density waveform with clickable time pins:
     * `08:30 AM` (Booni Cash Settled)
     * `10:15 AM` (Morning Tea Rush / Chatter filtered)
     * `11:20 AM` (Ramesh Auto ₹120 Credit)
     * `02:10 PM` (Suresh Presswala ₹60 Credit)
     * `04:15 PM` (Ramesh Dispute Pin ₹80)
     * `06:40 PM` (Karthik Milk ₹140 Credit)
     * `08:45 PM` (Call Shield Event).
   * Scrubbing the playhead updates active event preview and links to customer accounts.
3. **Zone 3: Explicit 4-Card Financial KPI Bento:**
   * **Card 1: Today's Settled Cash/UPI** (Cash + UPI breakdown, verified status).
   * **Card 2: Previous Old Udhari** (Carry-forward historical credit).
   * **Card 3: + Today's New Udhari** (Extracted from acoustic day stream, highlighted in Amber).
   * **Card 4: = Total Closing Due** (Explicit equation: `Old Balance + Today's New = Closing Due` in bold emerald monospace).
4. **Customer Khata Ledger Table:**
   * Search filter & category dropdown (`All Accounts`, `> ₹200 Due`, `Call Shield Locked`).
   * Columns: Customer profile (avatar, name, synthetic phone), Old Balance, + Today's New Credit, = Total Closing Due, and inline "Settle" action button.
   * Clicking a row selects the active customer and syncs Dispute Vault and Dialect Normalizer.
5. **Next-Day Dispute Evidence Vault:**
   * Displays timestamped voice evidence with confidence ratings (e.g. 99.4%) and verbatim transcribed audio quotes.
   * Integrated **Web Speech API (TTS)** to speak the proof out loud in natural Indian English/Hindi voice.
   * Action buttons to acknowledge and resolve active dispute claims.
6. **Gnani Timbre v3.0 Dialect Normalizer:**
   * Interactive switcher between **Hinglish**, **Kanglish** (Kannada-English), and **Tanglish** (Tamil-English).
   * Displays normalized vernacular text and provides voice playback.
7. **Ambient Low-Stock Inventory Radar:**
   * Automatically displays acoustic inventory alerts detected from vendor chatter (e.g., "Nandini milk khatam hone wala hai", "Chai patti naya packet kholna padega").
   * "Broadcast Wholesale Voice PO" action button with toast confirmation.
8. **Call Shield & One-Tap Nod Widget:**
   * Floating bottom-right widget active during incoming phone calls.
   * 15-second circular FIFO RAM buffer ticker.
   * Quick-add chips (`+₹10 Chai`, `+₹20 Bun Maska`, `+₹50 Samosa`) allowing the shopkeeper to nod and anchor customer credit to memory before RAM is flushed.
9. **3-Stage Batch AI Stepper Modal:**
   * Animated multi-step stepper simulating `Prisma v2.5` (Acoustic NER) ➔ `Evon v3.3` (Chatter Filter) ➔ `Timbre v3.0` (Phonetic Lock) with terminal logs and celebratory confetti.

---

### 4. NEW REQUIRED FEATURES

Implement the following 4 new capabilities seamlessly into the glass dashboard:

#### 4.1 Day-Summary Analytics with Interactive Charts
* Integrated Recharts visualization panel with tabbed views:
  * **Cash Flow vs. Udhari Velocity (Area Chart):** Compares settled revenue vs. credit granted across 2-hour intervals from 8 AM to 8 PM.
  * **Hourly Stall Traffic Density (Bar Chart):** Shows footfall peaks (Morning Tea rush 10 AM, Evening Snacks 6 PM).
  * **Settlement Split (Donut/Progress Chart):** UPI (63%) vs. Cash (37%) vs. Pending Credit ratio.
* Custom frosted-glass tooltip showing tabular values and percentage shares on hover.

#### 4.2 WhatsApp-Style Payment Reminder Composer
* Accessible from Customer Ledger and Settlement Modal.
* Interactive WYSIWYG WhatsApp message card:
  * WhatsApp chat bubble preview with green checkmarks and shopkeeper branding.
  * Language selector (`English`, `Hindi / Hinglish`, `Kannada`, `Tamil`).
  * Dynamic message templates with automated placeholders: `{customer_name}`, `{closing_balance}`, `{old_balance}`, `{today_items}`, and `{upi_qr_link}`.
  * Editable text area with character counter.
  * 1-Click "Send via WhatsApp" button opening `https://wa.me/{phone}?text={encoded_msg}`.

#### 4.3 Customer Detail Slide-Over Page / Drawer
* Clicking any customer profile opens an expansive, frosted-glass slide-over drawer:
  * Customer header: Large avatar, VIP/Regular badge, total lifetime credit cleared, current outstanding due.
  * Direct action bar: Call, WhatsApp Reminder, Settle Balance, Add Manual Credit.
  * **Complete Chronological Ledger History:** Every transaction, date, item breakdown, payment method (Cash/UPI/Udhari), and acoustic recording origin.
  * **Associated Voice Proof Archive:** Dedicated list of all audio recordings where this customer's voice was diarized and acknowledged.

#### 4.4 Dark Glass / Light Glass Mode Switcher
* Header toggle button with Sun and Moon icons.
* Seamless transition between **Obsidian Carbon Glass** (night street-stall mode) and **Pearl Mint Glass** (high-brightness daytime mode).
* State persisted in `localStorage` under `dukandar_glass_theme`.

---

### 5. DATA ARCHITECTURE & DUAL PERSISTENCE

* **Zero-Setup Instant Demo Seed:**
  * App boots instantly with realistic synthetic Indian micro-retail data (`Ramesh Auto`, `Karthik Flat 302`, `Suresh Presswala`, `Anita Tailors`, `Manjunath Electrician`).
  * Initial financial state: Settled Cash ₹2,450, Settled UPI ₹4,120, Old Udhari ₹1,000, Today's New Udhari ₹510, Total Closing Due ₹1,510.
* **Real Database & API Persistence:**
  * Configure `API_BASE = "http://localhost:8000"`.
  * Support backend endpoints:
    * `GET /api/state`: Fetches persistent ledger, disputes, and stream logs.
    * `POST /api/settle-balance`: Persists balance settlements.
    * `POST /api/add-transaction`: Adds new counter udhari transactions.
    * `POST /api/resolve-dispute`: Archives resolved dispute proofs.
    * `POST /api/broadcast-po`: Logs wholesale inventory orders.
  * Wrap all network requests in resilient `try/catch` fallbacks that synchronize immediately to `localStorage` so the UI remains 100% interactive and persistent even when running standalone or offline.

---

### 6. PRACTICAL GUARDRAILS & ACCESSIBILITY

* **Responsive Spatial Hierarchy:**
  * Desktop (12-column bento grid, 7 cols left / 5 cols right).
  * Tablet (Single column stack with horizontal scrolling for timeline and analytics).
  * Mobile (<768px): Collapsible mobile navigation drawer, swipeable metric cards, sticky bottom action bar, and min 44px tap targets.
* **Contrast & Sunlight Readability:**
  * Background blur (`backdrop-blur-2xl` / `backdrop-blur-xl`) paired with high-opacity backing surfaces (`bg-slate-900/80` or `bg-white/90`) to ensure text never washes out over glowing gradients.
  * Strict adherence to WCAG AA contrast for text labels, rupee amounts, and status badges.
* **Reduced-Motion Support:**
  * Respect `prefers-reduced-motion: reduce` by dampening spring animations, disabling continuous keyframe equalizer loops, and using simple opacity fades.
* **Accessibility Fundamentals:**
  * Skip to main content link (`#main-content`).
  * Keyboard navigation with `Ctrl+K` / `Cmd+K` command palette search.
  * Explicit ARIA labels on audio playback, theme switchers, and icon buttons.

