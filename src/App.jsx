import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'framer-motion';
import { 
  Radio, 
  PhoneIncoming, 
  PhoneOff, 
  Play, 
  Pause, 
  Volume2, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  Sparkles, 
  Cpu, 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  PlusCircle,
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  IndianRupee, 
  Clock, 
  Activity, 
  Zap, 
  Check, 
  X, 
  Server, 
  Smartphone, 
  CheckCheck,
  RotateCw,
  QrCode,
  Send,
  Share2,
  Package,
  TrendingUp,
  BarChart3,
  Sliders,
  Wallet,
  History,
  Calculator,
  Languages,
  StopCircle,
  FileAudio,
  Upload,
  ArrowUpRight,
  Sun,
  Moon,
  Copy,
  ArrowUp,
  Menu,
  Eye,
  EyeOff,
  Printer,
  HelpCircle,
  MessageCircle,
  RefreshCw,
  Cookie,
  Lock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import confetti from 'canvas-confetti';

const API_BASE = "http://localhost:8000";

// --- SPRING PHYSICS SPECIFICATION ---
const SPRING_TRANSITION = { type: "spring", stiffness: 320, damping: 26 };

// --- HINDI PHONETIC NORMALIZER (Gnani Timbre v3.0 Engine) ---
const HINDI_UNITS = [
  'shunya', 'ek', 'do', 'teen', 'chaar', 'paanch', 'chhah', 'saat', 'aath', 'nau', 'das',
  'gyarah', 'baarah', 'terah', 'chaudah', 'pandrah', 'solah', 'satrah', 'athaarah', 'unnees', 'bees',
  'ikkees', 'baees', 'teees', 'chaubees', 'pachees', 'chhabbees', 'sattaees', 'atthaees', 'untees', 'tees',
  'iktis', 'battis', 'tentis', 'chauntis', 'paintis', 'chhattis', 'saintis', 'adhtis', 'untalis', 'chaalis',
  'iktalis', 'bayalis', 'taintalis', 'chawalis', 'paintalis', 'chhiyalis', 'saintalis', 'adhtalis', 'unchas', 'pachaas',
  'ikyawan', 'bawan', 'tirpan', 'chawwan', 'pachpan', 'chhappan', 'sattawan', 'atthaawan', 'unsath', 'saath',
  'iksath', 'baasath', 'tirasath', 'chaunsath', 'painsath', 'chhiyasath', 'sarsath', 'adhsath', 'unhattar', 'sattar',
  'ikhattar', 'bahattar', 'tihattar', 'chauhattar', 'pachhattar', 'chhihattar', 'sathattar', 'athhattar', 'unasi', 'assi',
  'ikyasi', 'bayasi', 'tirasi', 'chaurasi', 'pachyasi', 'chhiyasi', 'sattasi', 'atthasi', 'nauasi', 'nabbe',
  'ikyanwe', 'bayanwe', 'tiranwe', 'chauranwe', 'pachanwe', 'chhiyanwe', 'sattanwe', 'atthanwe', 'ninyanwe'
];

function convertNumberToPhoneticHindi(num) {
  num = parseInt(num, 10);
  if (isNaN(num)) return '';
  if (num === 0) return 'shunya';
  if (num < 100) return HINDI_UNITS[num] || num.toString();

  let res = '';
  if (num >= 1000) {
    const thousands = Math.floor(num / 1000);
    num %= 1000;
    const thousandText = thousands < 100 ? HINDI_UNITS[thousands] : thousands.toString();
    res += `${thousandText} hazaar `;
  }

  if (num >= 100) {
    const hundreds = Math.floor(num / 100);
    num %= 100;
    const hundredText = hundreds < 100 ? HINDI_UNITS[hundreds] : hundreds.toString();
    res += `${hundredText} sau `;
  }

  if (num > 0) {
    res += HINDI_UNITS[num] || num.toString();
  }

  return res.trim();
}

export function timbreNormalizer(rawText) {
  if (!rawText) return '';
  let text = rawText;

  text = text.replace(/(?:₹|Rs\.?)\s*(\d+)/gi, (match, digits) => {
    const words = convertNumberToPhoneticHindi(digits);
    return `${words} rupaye`;
  });

  text = text.replace(/Flat\s*(\d+)/gi, (match, digits) => {
    const words = convertNumberToPhoneticHindi(digits);
    return `Flat ${words}`;
  });

  return text;
}

// --- SYNTHETIC AUDIO CHIME GENERATOR ---
function playAudioChime(type = 'ping') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'ping') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.26);
    } else if (type === 'call') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(480, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.36);
    } else if (type === 'lock') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      osc.frequency.setValueAtTime(783.99, now + 0.16);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.32);
    }
  } catch (e) {
    // AudioContext blocked or not allowed yet
  }
}

// Format currency
const formatRupee = (amt) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amt || 0);
};

// --- INITIAL SYNTHETIC CUSTOMERS DATA ---
const INITIAL_CUSTOMERS = [
  {
    id: 'CUST-101',
    name: 'Ramesh Auto',
    phone: '98452 11042 • Synthetic',
    avatar: 'RA',
    interactionsCount: 4,
    oldBalance: 180,
    todayNewBalance: 200,
    totalBalance: 380,
    lastTransactionTime: '04:15 PM',
    isFlaggedDispute: true,
    disputeHistory: [
      {
        id: 'disp_101_1',
        timestamp: '04:15 PM',
        items: '4 Masala Chai + 2 Bun Maska',
        amount: 80,
        paymentType: 'Udhari',
        verbatimVoiceQuote: "Ramesh: 'Bhaiya do chai aur ek bun maska baki mein likh lo shaam ko auto ki gas bharwa ke deta hu'",
        rawEvonText: "Ramesh Auto credited Rs 80 under Udhari for evening tea and snacks. Shopkeeper responded with affirmative acoustic grunt.",
        confidence: 99.4,
        sourceTag: 'PRISMA_ASR_CHUNK_842',
        status: 'Active Dispute Claim'
      },
      {
        id: 'disp_101_2',
        timestamp: '11:20 AM',
        items: 'Pack of Gold Flake (Single) + Special Chai',
        amount: 120,
        paymentType: 'Udhari',
        verbatimVoiceQuote: "Ramesh: 'Chai ka sau rupaye aur bidi likhna, subah booni nahi hui'",
        rawEvonText: "Sub-session 14: Intent verified via Prisma v2.5 Indian acoustic NER. Amount matched counter context.",
        confidence: 98.7,
        sourceTag: 'PRISMA_ASR_CHUNK_311',
        status: 'Verified'
      }
    ]
  },
  {
    id: 'CUST-102',
    name: 'Karthik Flat 302',
    phone: '99014 55219 • Synthetic',
    avatar: 'KF',
    interactionsCount: 2,
    oldBalance: 420,
    todayNewBalance: 140,
    totalBalance: 560,
    lastTransactionTime: '06:40 PM',
    isFlaggedDispute: false,
    disputeHistory: [
      {
        id: 'disp_102_1',
        timestamp: '06:40 PM',
        items: '2x 1L Nandini Blue Milk + Rusk',
        amount: 140,
        paymentType: 'Udhari',
        verbatimVoiceQuote: "Karthik: 'Doodh ka hisab khata me add kar do kal salary aane pe UPI se pura settlement kar dunga'",
        rawEvonText: "Karthik (Flat 302) added milk pouches to daily tab. Evon v3.3 tagged positive intent and confirmed nod.",
        confidence: 99.1,
        sourceTag: 'PRISMA_ASR_CHUNK_1092',
        status: 'Verified'
      }
    ]
  },
  {
    id: 'CUST-103',
    name: 'Suresh Presswala',
    phone: '94481 29401 • Synthetic',
    avatar: 'SP',
    interactionsCount: 3,
    oldBalance: 90,
    todayNewBalance: 60,
    totalBalance: 150,
    lastTransactionTime: '02:10 PM',
    isFlaggedDispute: false,
    disputeHistory: [
      {
        id: 'disp_103_1',
        timestamp: '02:10 PM',
        items: '2 Cutting Chai + Samosa',
        amount: 60,
        paymentType: 'Udhari',
        verbatimVoiceQuote: "Suresh: 'Do cutting chai aur ek samosa, kapde press karke sham ko payment deta hu bhaiya'",
        rawEvonText: "Suresh Presswala morning snacks credited to tab.",
        confidence: 97.9,
        sourceTag: 'PRISMA_ASR_CHUNK_512',
        status: 'Verified'
      }
    ]
  },
  {
    id: 'CUST-104',
    name: 'Anita Tailors',
    phone: '98800 77123 • Synthetic',
    avatar: 'AT',
    interactionsCount: 1,
    oldBalance: 310,
    todayNewBalance: 0,
    totalBalance: 310,
    lastTransactionTime: 'Yesterday',
    isFlaggedDispute: false,
    disputeHistory: []
  },
  {
    id: 'CUST-105',
    name: 'Manjunath Electrician',
    phone: '97312 44890 • Synthetic',
    avatar: 'ME',
    interactionsCount: 2,
    oldBalance: 0,
    todayNewBalance: 110,
    totalBalance: 110,
    lastTransactionTime: '01:30 PM',
    isFlaggedDispute: false,
    disputeHistory: [
      {
        id: 'disp_105_1',
        timestamp: '01:30 PM',
        items: 'Cold Drink + Cigarette',
        amount: 110,
        paymentType: 'Udhari',
        verbatimVoiceQuote: "Manjunath: 'Ek Thums Up aur cigarette khata mein daal dena, site payment aate hi gpay karunga'",
        rawEvonText: "Manjunath tab opened with Rs 110 afternoon transaction.",
        confidence: 98.4,
        sourceTag: 'PRISMA_ASR_CHUNK_421',
        status: 'Verified'
      }
    ]
  }
];

// --- TIMELINE SCRUBBER AUDIO EVENTS ---
const TIMELINE_EVENTS = [
  { id: 'tl_1', time: '08:30 AM', label: 'Booni Cash Settled', percent: 8, type: 'CASH', note: 'First customer ₹50 cash' },
  { id: 'tl_2', time: '10:15 AM', label: 'Morning Tea Rush', percent: 22, type: 'CHATTER', note: 'Heavy chatter filtered (Evon v3.3)' },
  { id: 'tl_3', time: '11:20 AM', label: 'Ramesh Auto - ₹120', percent: 34, type: 'UDHARI', customerId: 'CUST-101', note: 'Bidi + Chai tab recorded' },
  { id: 'tl_4', time: '02:10 PM', label: 'Suresh Presswala - ₹60', percent: 54, type: 'UDHARI', customerId: 'CUST-103', note: 'Cutting chai credited' },
  { id: 'tl_5', time: '04:15 PM', label: 'Ramesh Dispute Pin - ₹80', percent: 72, type: 'DISPUTE', customerId: 'CUST-101', note: 'Verbatim voice quote pinned' },
  { id: 'tl_6', time: '06:40 PM', label: 'Karthik Milk - ₹140', percent: 86, type: 'UDHARI', customerId: 'CUST-102', note: 'Nandini milk khata logged' },
  { id: 'tl_7', time: '08:45 PM', label: 'Call Shield Event', percent: 94, type: 'CALL_SHIELD', note: '15s RAM FIFO buffer triggered' }
];

// --- HOURLY TRAFFIC RECHARTS DATA ---
const HOURLY_ACTIVITY_DATA = [
  { hour: '8 AM', traffic: 14, udhariVolume: 50, cashUpi: 220 },
  { hour: '10 AM', traffic: 38, udhariVolume: 120, cashUpi: 580 },
  { hour: '12 PM', traffic: 26, udhariVolume: 90, cashUpi: 440 },
  { hour: '2 PM', traffic: 18, udhariVolume: 60, cashUpi: 310 },
  { hour: '4 PM', traffic: 45, udhariVolume: 200, cashUpi: 790 },
  { hour: '6 PM', traffic: 52, udhariVolume: 140, cashUpi: 940 },
  { hour: '8 PM', traffic: 31, udhariVolume: 110, cashUpi: 610 }
];

// --- DIARIZED STREAM LOGS ---
const INITIAL_DAY_STREAM = [
  {
    id: 's_1',
    time: '04:15 PM',
    speaker: 'Speaker 1 (Ramesh Auto)',
    dB: 78,
    type: 'UDHARI_RECORDED',
    quote: "Bhaiya do chai aur ek bun maska baki mein likh lo shaam ko auto ki gas bharwa ke deta hu",
    metadata: "Prisma v2.5 Indian NER: ₹80 credit allocated to Ramesh Auto. Evon v3.3: Confirmed with shopkeeper nod signal.",
    confidence: 99.4
  },
  {
    id: 's_2',
    time: '04:13 PM',
    speaker: 'Speaker 3 (Street Chatter)',
    dB: 82,
    type: 'IGNORE_CHATTER',
    quote: "Arey Rohit Sharma ne kya pull shot mara kal ke match mein, maza aa gaya!",
    metadata: "Evon v3.3 Filter: Casual cricket gossip detected. Tagged IGNORE_CHATTER. Omitted from khata balances.",
    confidence: 99.8
  },
  {
    id: 's_3',
    time: '02:10 PM',
    speaker: 'Speaker 2 (Suresh)',
    dB: 71,
    type: 'UDHARI_RECORDED',
    quote: "Do cutting chai aur ek samosa, kapde press karke sham ko payment deta hu bhaiya",
    metadata: "Prisma v2.5 Indian NER: ₹60 credit allocated to Suresh Presswala.",
    confidence: 97.9
  },
  {
    id: 's_4',
    time: '01:15 PM',
    speaker: 'Customer (QR Scan)',
    dB: 74,
    type: 'UPI_VERIFIED',
    quote: "Google Pay par pachaas rupaye bhej diye bhaiya, aawaz aayi?",
    metadata: "Soundbox Audio Match: ₹50 settled via UPI. Linked to daily digital cash register.",
    confidence: 99.9
  },
  {
    id: 's_5',
    time: '11:20 AM',
    speaker: 'Speaker 1 (Ramesh Auto)',
    dB: 76,
    type: 'UDHARI_RECORDED',
    quote: "Chai ka sau rupaye aur bidi likhna, subah booni nahi hui",
    metadata: "Prisma v2.5: ₹120 credit verified. Grouped with CUST-101.",
    confidence: 98.7
  },
  {
    id: 's_6',
    time: '09:05 AM',
    speaker: 'RAM FIFO Buffer',
    dB: 69,
    type: 'CALL_BUFFER_LOCKED',
    quote: "Bhaiya ek chai Ramesh ke khata mein likh dena (Thumb nod confirmed)",
    metadata: "Asymmetric Context Link via Evon v3.3: 15s RAM snapshot anchored",
    confidence: 98.9
  }
];

// --- DUKANDAR-OS EXPANDABLE FAQS DATA ---
const DUKANDAR_FAQS = [
  {
    id: 'faq-1',
    question: "How does DukandarOS work without a continuous live internet mic connection?",
    answer: "DukandarOS is built for Indian street stall realities. The shopkeeper leaves the phone recording all day into a local WAV audio file. At night, 'Stop Day Recording & Analyze Khata' runs Gnani Prisma v2.5 batch ASR and diarization on-device or locally, extracting all commercial intent, udhari commitments, and customer names in one pass with zero daytime cloud dependency."
  },
  {
    id: 'faq-2',
    question: "What happens if a family member or distributor calls my phone during shop hours?",
    answer: "The Single-Device Call Shield automatically pauses the main acoustic stream and activates a 15-second volatile FIFO RAM circular buffer. If a customer at the counter asks for credit during your call, a single tap on the 'One-Tap Nod' widget anchors the last 15 seconds of audio to that customer's khata before the RAM buffer is wiped, ensuring zero privacy intrusion on your phone call."
  },
  {
    id: 'faq-3',
    question: "Can Gnani Prisma handle 75–85 dB street noise, horns, and pressure cookers?",
    answer: "Yes! Unlike generic Western speech engines that hallucinate under loud street ambiance, Gnani Prisma v2.5 is trained on authentic Indian street-retail acoustic corpora. It employs dual-band ambient noise normalization and maintains 96%+ NER accuracy even in dense 80+ dB market clutter."
  },
  {
    id: 'faq-4',
    question: "How does Timbre v3.0 resolve 'Bhaiya do sau baki' vs 'Flat 302' misunderstanding?",
    answer: "Gnani Timbre v3.0 normalizes code-mixed Indian vernaculars (Hinglish, Kanglish, Tanglish) into unambiguous phonetic numbers (e.g. 'do sau rupaye', 'Flat teen sau do'). When resolving a dispute the next morning, DukandarOS generates speech-synthesized proofs verbatim so both customer and shopkeeper hear exactly what was agreed upon."
  },
  {
    id: 'faq-5',
    question: "Is customer financial and voice data compliant with India's DPDP Act?",
    answer: "100% compliant. DukandarOS enforces sovereign local storage: audio waveforms, diarization logs, and khata ledgers remain on your local device. No raw conversational audio or customer voice biometric is ever transferred or sold to advertising networks."
  }
];

export default function App() {
  // 1. Dark Mode Toggle State (Default Obsidian Dark, persisted in localStorage)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('dukandar_theme_mode');
      return saved !== 'light';
    } catch {
      return true;
    }
  });

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem('dukandar_theme_mode', next ? 'dark' : 'light');
      } catch {}
      return next;
    });
  };

  // 2. Simple Cookie Banner
  const [showCookieBanner, setShowCookieBanner] = useState(() => {
    try {
      return !localStorage.getItem('dukandar_cookie_consent');
    } catch {
      return true;
    }
  });

  const handleAcceptCookies = (type = 'all') => {
    try {
      localStorage.setItem('dukandar_cookie_consent', type);
    } catch {}
    setShowCookieBanner(false);
    showToast('Privacy Policy Saved', 'Sovereign local storage preferences saved.', 'success');
  };

  // 3. Site Search Modal (Command Palette Ctrl+K)
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  // 4. Back to top button state
  const [showBackToTop, setShowBackToTop] = useState(false);

  // 5. Mobile Menu Drawer
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 6. Loading & Refresh Animation
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 8. Scroll progress bar percentage
  const [scrollProgress, setScrollProgress] = useState(0);

  // 9. Copy to clipboard key tracker
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (text, key) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      showToast('Copied to Clipboard!', text.length > 32 ? text.substring(0, 32) + '...' : text, 'success');
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      showToast('Copy Failed', 'Unable to access clipboard.', 'warning');
    }
  };

  // 13. Password / PIN Visibility Toggle
  const [shopkeeperPin, setShopkeeperPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  // 14. UTM Tracking Information
  const [utmInfo, setUtmInfo] = useState(null);

  // 15 & 16. Form Success & Error States
  const [formSuccessMessage, setFormSuccessMessage] = useState(null);
  const [formErrorMessage, setFormErrorMessage] = useState(null);

  // 17. Confirmation Modal State
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    onConfirm: null
  });

  // 18. Last Updated Date / Timestamp
  const [lastUpdatedTime, setLastUpdatedTime] = useState(() => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  const handleManualSync = async () => {
    setIsRefreshing(true);
    playAudioChime('ping');
    try {
      const res = await fetch(`${API_BASE}/api/state`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        setBackendConnected(true);
        setSyncStatusText('FastAPI + SQLite Connected');
        if (data.customers) setCustomers(data.customers);
        if (data.settledCash) setSettledCash(data.settledCash);
        if (data.settledUpi) setSettledUpi(data.settledUpi);
        if (data.streamLogs) setStreamLogs(data.streamLogs);
        if (data.inventoryAlerts) setInventoryAlerts(data.inventoryAlerts);
        showToast('Khata Synced with SQLite', 'Balances verified against dukandar_khata.db', 'success');
      } else {
        showToast('Khata Synced (Local)', 'Acoustic buffers and balances up to date.', 'success');
      }
    } catch {
      showToast('Khata Synced (Local)', 'Acoustic buffers and balances up to date.', 'success');
    } finally {
      setIsRefreshing(false);
      setLastUpdatedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  };

  // 1-Click Reset Demo DB to initial defaults
  const handleResetDemoDb = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/reset-demo`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.customers) setCustomers(data.customers);
        if (data.settledCash) setSettledCash(data.settledCash);
        if (data.settledUpi) setSettledUpi(data.settledUpi);
        if (data.streamLogs) setStreamLogs(data.streamLogs);
        if (data.inventoryAlerts) setInventoryAlerts(data.inventoryAlerts);
        fireConfetti();
        playAudioChime('lock');
        showToast('Demo DB Reset!', 'dukandar_khata.db re-seeded with 5 default customers (₹1,510 Due).', 'success');
      } else {
        setCustomers(INITIAL_CUSTOMERS);
        setSettledCash(2450);
        setSettledUpi(4120);
        fireConfetti();
        showToast('Demo Reset (Local)', 'Restored default synthetic records.', 'success');
      }
    } catch {
      setCustomers(INITIAL_CUSTOMERS);
      setSettledCash(2450);
      setSettledUpi(4120);
      fireConfetti();
      showToast('Demo Reset (Local)', 'Restored default synthetic records.', 'success');
    }
  };

  // 19. Expandable FAQ State
  const [expandedFaqId, setExpandedFaqId] = useState('faq-1');

  // 20. Floating Contact Button & Drawer
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactFeedback, setContactFeedback] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Backend connection status
  const [backendConnected, setBackendConnected] = useState(false);
  const [syncStatusText, setSyncStatusText] = useState('Offline Local Ledger Mode');

  // Financial KPIs
  const [settledCash, setSettledCash] = useState(2450);
  const [settledUpi, setSettledUpi] = useState(4120);

  // Core customer khata state
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [selectedCustomerId, setSelectedCustomerId] = useState('CUST-101');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  // Feature 2: Audio Source & Scrubber Timeline
  const [selectedAudioSource, setSelectedAudioSource] = useState('day_stall_recording_oct31.wav');
  const [scrubberPosition, setScrubberPosition] = useState(72);
  const [activeTimelinePin, setActiveTimelinePin] = useState('tl_5');
  const [noiseSliderDb, setNoiseSliderDb] = useState(74);
  const audioFileInputRef = useRef(null);

  // Feature 5: Multi-Language Dialect Switcher
  const [selectedDialect, setSelectedDialect] = useState('hi-IN');

  // Feature 6: Ambient Low-Stock Inventory Alerts
  const [inventoryAlerts, setInventoryAlerts] = useState([
    { id: 'inv_1', name: 'Nandini Blue Milk', status: '2 pkts left', audioProof: 'Vendor: "Nandini milk khatam hone wala hai"' },
    { id: 'inv_2', name: 'Assam Tea Dust', status: 'Low (250g)', audioProof: 'Vendor: "Chai patti naya packet kholna padega"' },
    { id: 'inv_3', name: 'Refined Oil', status: '1L pouch', audioProof: 'Vendor: "Tel ka packet le aana shaam ko"' },
    { id: 'inv_4', name: 'Khari Biscuits', status: '3 pkts left', audioProof: 'Vendor: "Khari biscuit dabba khali hai"' }
  ]);
  const [isBroadcastingWholesale, setIsBroadcastingWholesale] = useState(false);

  // Diarized stream state
  const [streamLogs, setStreamLogs] = useState(INITIAL_DAY_STREAM);
  const [streamFilter, setStreamFilter] = useState('ALL');

  // Feature 4: UPI QR & Settlement Modal
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [settlementTargetCust, setSettlementTargetCust] = useState(null);

  // Call Shield state
  const [isCallActive, setIsCallActive] = useState(false);
  const [callShieldCustomer, setCallShieldCustomer] = useState('CUST-101');
  const [customItemText, setCustomItemText] = useState('');
  const [customItemAmount, setCustomItemAmount] = useState('');
  const [isCallShieldMinimized, setIsCallShieldMinimized] = useState(false);
  const [rollingBufferCounter, setRollingBufferCounter] = useState(15);
  const [lastAsymmetricLink, setLastAsymmetricLink] = useState(null);

  // Batch AI Pipeline Stepper Modal state
  const [isBatchPipelineActive, setIsBatchPipelineActive] = useState(false);
  const [pipelineStage, setPipelineStage] = useState(0);
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [pipelineLogs, setPipelineLogs] = useState([]);

  // Audio / Speech State
  const [playingDisputeId, setPlayingDisputeId] = useState(null);
  const [isSpeakingPhonetic, setIsSpeakingPhonetic] = useState(false);
  const [customPhoneticInput, setCustomPhoneticInput] = useState('₹380 Ramesh auto udhari due at Flat 302');

  // Add Customer / Manual Entry Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustOldBal, setNewCustOldBal] = useState('');
  const [newCustAddToday, setNewCustAddToday] = useState('');

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState(null);

  // Highlight flash state for recently modified row
  const [highlightedRowId, setHighlightedRowId] = useState(null);

  // 15-Second Rolling Buffer animation ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setRollingBufferCounter((prev) => (prev <= 1 ? 15 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Scroll Progress Bar & Back to top visibility listener
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
      setShowBackToTop(window.scrollY > 280);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard Shortcuts: Ctrl+K / Cmd+K for Command Search & Escape to dismiss
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMobileMenuOpen(false);
        setIsContactOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Parse UTM tracking parameters on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const source = params.get('utm_source');
      const medium = params.get('utm_medium');
      const campaign = params.get('utm_campaign');
      if (source || campaign) {
        const utm = { source: source || 'direct', medium: medium || 'none', campaign: campaign || 'sovereign_ai' };
        setUtmInfo(utm);
        localStorage.setItem('dukandar_utm', JSON.stringify(utm));
      } else {
        const saved = localStorage.getItem('dukandar_utm');
        if (saved) setUtmInfo(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Check Backend Connectivity on mount
  useEffect(() => {
    let isMounted = true;
    async function checkBackend() {
      try {
        const res = await fetch(`${API_BASE}/api/state`, { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setBackendConnected(true);
            setSyncStatusText('FastAPI + SQLite Connected');
            if (data.customers) setCustomers(data.customers);
            if (data.settledCash) setSettledCash(data.settledCash);
            if (data.settledUpi) setSettledUpi(data.settledUpi);
            if (data.streamLogs) setStreamLogs(data.streamLogs);
            if (data.inventoryAlerts) setInventoryAlerts(data.inventoryAlerts);
          }
        }
      } catch (err) {
        if (isMounted) {
          setBackendConnected(false);
          setSyncStatusText('Offline Local Ledger Mode');
        }
      }
    }
    checkBackend();
    return () => { isMounted = false; };
  }, []);

  // Compute Total Financial Metrics
  const totalOldUdhari = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.oldBalance || 0), 0);
  }, [customers]);

  const totalTodayNewUdhari = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.todayNewBalance || 0), 0);
  }, [customers]);

  const totalClosingUdhariDue = useMemo(() => {
    return totalOldUdhari + totalTodayNewUdhari;
  }, [totalOldUdhari, totalTodayNewUdhari]);

  const totalSettledToday = useMemo(() => {
    return settledCash + settledUpi;
  }, [settledCash, settledUpi]);

  // Trigger Toast Notification
  const showToast = (title, subtitle, type = 'success') => {
    setToastMessage({ title, subtitle, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Trigger Confetti blast
  const fireConfetti = () => {
    try {
      confetti({
        particleCount: 45,
        spread: 55,
        origin: { y: 0.82 },
        colors: ['#10b981', '#34d399', '#059669', '#f59e0b']
      });
    } catch (e) {
      // safe fallback
    }
  };

  // Currently selected customer object
  const activeCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId) || customers[0] || null;
  }, [customers, selectedCustomerId]);

  // Multilingual Dynamic Translations (Feature 5)
  const dialectTranslations = useMemo(() => {
    if (!activeCustomer) return { label: 'Hinglish', summary: '', audioText: '' };
    const oldAmt = activeCustomer.oldBalance;
    const newAmt = activeCustomer.todayNewBalance;
    const totAmt = activeCustomer.totalBalance;
    const name = activeCustomer.name;

    if (selectedDialect === 'kn-IN') {
      return {
        label: 'Kanglish',
        summary: `${name} avara haledu balance ${oldAmt} rupayi ittu, ivattu ${newAmt} rupayi add aagide, total baaki ${totAmt} rupayi aagide.`,
        audioText: `${name} avara haledu balance noora embattu rupayi ittu, ivattu innooru rupayi add aagide, total baaki munoora embattu rupayi.`
      };
    } else if (selectedDialect === 'ta-IN') {
      return {
        label: 'Tanglish',
        summary: `${name} pazhaya balance ${oldAmt} roobai, indru ${newAmt} roobai serkkappattulladhu, motha baaki ${totAmt} roobai aagum.`,
        audioText: `${name} pazhaya balance nootri enbadhu roobai, indru irunooru roobai serkkappattulladhu, motha baaki munnootri enbadhu roobai.`
      };
    } else {
      return {
        label: 'Hinglish',
        summary: `${name} ka purana balance ₹${oldAmt} tha, aaj +₹${newAmt} naya jud gaya, ab kul baaki ₹${totAmt} hai.`,
        audioText: `${name} ka purana balance ek sau assi rupaye tha, aaj do sau rupaye naya jud gaya, ab kul baaki teen sau assi rupaye hai.`
      };
    }
  }, [activeCustomer, selectedDialect]);

  // Noise Stress-Tester Dynamic Confidences (Feature 2)
  const prismaConfidence = useMemo(() => {
    if (noiseSliderDb <= 65) return 99.4;
    if (noiseSliderDb <= 75) return 98.4;
    if (noiseSliderDb <= 85) return 96.2;
    return 92.8;
  }, [noiseSliderDb]);

  // Web Speech API Voice Proof
  const playVoiceProof = (text) => {
    if (!('speechSynthesis' in window)) {
      showToast('Speech API Unavailable', 'Browser does not support TTS.', 'warning');
      return;
    }
    window.speechSynthesis.cancel();
    const cleanPhonetic = timbreNormalizer(text);
    const utterance = new SpeechSynthesisUtterance(cleanPhonetic);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('en-IN') || v.name.includes('India'));
    if (indianVoice) {
      utterance.voice = indianVoice;
    }

    setIsSpeakingPhonetic(true);
    playAudioChime('ping');

    utterance.onend = () => {
      setIsSpeakingPhonetic(false);
      setPlayingDisputeId(null);
    };

    utterance.onerror = () => {
      setIsSpeakingPhonetic(false);
      setPlayingDisputeId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Open Settlement Modal
  const openSettlementForCustomer = (cust) => {
    setSettlementTargetCust(cust);
    setShopkeeperPin('');
    setFormSuccessMessage(null);
    setFormErrorMessage(null);
    setIsSettlementModalOpen(true);
  };

  // Confirm settlement with confirmation modal
  const handleInitiateSettle = () => {
    if (!settlementTargetCust) return;
    if (settlementTargetCust.totalBalance <= 0) {
      setFormErrorMessage("Balance is already ₹0. No pending udhari to settle.");
      return;
    }
    if (shopkeeperPin.trim() !== '1234' && shopkeeperPin.trim() !== '') {
      setFormErrorMessage("Invalid Shopkeeper PIN. (Use 1234 or leave blank in demo mode)");
      return;
    }

    setConfirmationModal({
      isOpen: true,
      title: `Confirm Settlement for ${settlementTargetCust.name}`,
      message: `Are you sure you want to mark ${formatRupee(settlementTargetCust.totalBalance)} as Settled via UPI/Cash? This will reset the customer balance to ₹0 and issue a digital soundbox confirmation.`,
      confirmText: 'Confirm & Reset Balance',
      onConfirm: () => {
        confirmSettlementExecution();
        setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  const confirmSettlementExecution = () => {
    if (!settlementTargetCust) return;
    const amountToSettle = settlementTargetCust.totalBalance;

    setCustomers(prev => prev.map(c => {
      if (c.id === settlementTargetCust.id) {
        return {
          ...c,
          oldBalance: 0,
          todayNewBalance: 0,
          totalBalance: 0,
          interactionsCount: c.interactionsCount + 1,
          disputeHistory: c.disputeHistory.map(d => ({ ...d, status: 'Settled via UPI/Cash' }))
        };
      }
      return c;
    }));

    setSettledUpi(prev => prev + amountToSettle);
    setFormSuccessMessage(`₹${amountToSettle} successfully settled! Vasooli receipt generated.`);
    playAudioChime('lock');
    fireConfetti();

    showToast(
      'Udhari Settled via UPI/Cash!',
      `${settlementTargetCust.name} cleared ${formatRupee(amountToSettle)}. Tab reset to ₹0.`,
      'success'
    );

    setTimeout(() => {
      setIsSettlementModalOpen(false);
      setSettlementTargetCust(null);
      setFormSuccessMessage(null);
    }, 1500);

    fetch(`${API_BASE}/api/settle-customer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: settlementTargetCust.name,
        customerId: settlementTargetCust.id,
        amount_paid: amountToSettle,
        payment_mode: 'UPI'
      })
    })
    .then(r => r.json())
    .then(data => {
      if (data.customers) setCustomers(data.customers);
      if (data.settledCash) setSettledCash(data.settledCash);
      if (data.settledUpi) setSettledUpi(data.settledUpi);
      if (data.streamLogs) setStreamLogs(data.streamLogs);
    })
    .catch(() => {});
  };

  // Add Item to Customer from Call Shield or Counter
  const handleAddItemToKhata = (itemTextOverride, amountOverride) => {
    const itemName = itemTextOverride || customItemText;
    const amount = amountOverride || parseFloat(customItemAmount);

    if (!itemName || !amount || amount <= 0) {
      showToast('Invalid Transaction', 'Please specify an item and positive amount.', 'warning');
      return;
    }

    const targetCust = customers.find(c => c.id === callShieldCustomer) || customers[0];
    const timeStamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const bufferSnapshot = `Bhaiya ek ${itemName} ${targetCust.name.split(' ')[0]} ke khata mein likh dena.`;
    const newDisputeEntry = {
      id: `call_${Date.now()}`,
      timestamp: timeStamp,
      items: itemName,
      amount: amount,
      paymentType: 'Udhari',
      verbatimVoiceQuote: `${targetCust.name}: '${bufferSnapshot}'`,
      rawEvonText: `${targetCust.name} udhari Rs ${amount} for ${itemName} anchored via 15s RAM snapshot`,
      confidence: 99.4,
      sourceTag: 'CALL_SHIELD_OVERRIDE',
      status: 'Call Shield Locked'
    };

    setCustomers(prev => prev.map(c => {
      if (c.id === targetCust.id) {
        const updatedToday = c.todayNewBalance + amount;
        return {
          ...c,
          todayNewBalance: updatedToday,
          totalBalance: c.oldBalance + updatedToday,
          lastTransactionTime: timeStamp,
          interactionsCount: (c.interactionsCount || 1) + 1,
          disputeHistory: [newDisputeEntry, ...c.disputeHistory]
        };
      }
      return c;
    }));

    const newStreamItem = {
      id: `stream_${Date.now()}`,
      time: timeStamp,
      speaker: `RAM Buffer (${targetCust.name})`,
      dB: 69,
      type: 'CALL_BUFFER_LOCKED',
      quote: bufferSnapshot,
      metadata: `Asymmetric Context Link via Evon v3.3: ₹${amount} locked to ${targetCust.name}`,
      confidence: 99.4
    };
    setStreamLogs(prev => [newStreamItem, ...prev]);

    setLastAsymmetricLink({
      customerName: targetCust.name,
      amount: amount,
      item: itemName,
      time: timeStamp
    });

    setHighlightedRowId(targetCust.id);
    setTimeout(() => setHighlightedRowId(null), 3000);

    fireConfetti();
    showToast(
      'Asymmetric Context Link Locked!',
      `+₹${amount} (${itemName}) bound to ${targetCust.name}. RAM buffer audio anchored.`,
      'success'
    );

    setCustomItemText('');
    setCustomItemAmount('');

    fetch(`${API_BASE}/api/add-customer-or-credit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: targetCust.name,
        phone_synthetic: targetCust.phone,
        added_amount: amount,
        items: itemName,
        tx_type: 'Udhari',
        proof_quote: `${targetCust.name}: '${bufferSnapshot}'`,
        time_str: timeStamp
      })
    })
    .then(r => r.json())
    .then(data => {
      if (data.customers) setCustomers(data.customers);
      if (data.streamLogs) setStreamLogs(data.streamLogs);
    })
    .catch(() => {});
  };

  // Start Batch AI Pipeline Simulation
  const triggerBatchAnalysis = () => {
    setIsBatchPipelineActive(true);
    setPipelineStage(1);
    setPipelineProgress(12);
    setPipelineLogs([
      "Initializing Sovereign Batch Pipeline...",
      `Loading acoustic stream: ${selectedAudioSource} (11.5 hours street audio)...`,
      `Prisma v2.5: Ambient noise normalized (${noiseSliderDb} dB street noise, background traffic filtered)...`,
      "Prisma v2.5: Multi-speaker Diarization initialized across 6 active voices..."
    ]);

    playAudioChime('ping');

    setTimeout(() => {
      setPipelineProgress(42);
      setPipelineLogs(prev => [
        ...prev,
        `Prisma v2.5: Hindi & Kannada ASR complete (NER Confidence: ${prismaConfidence}%).`,
        "Prisma v2.5: Indian NER extracted 47 entity candidates (Chai, Samosa, Bun Maska, Dosa).",
        "Handoff to Gnani Evon v3.3 for conversational filtering..."
      ]);
      setPipelineStage(2);
      playAudioChime('ping');
    }, 1800);

    setTimeout(() => {
      setPipelineProgress(76);
      setPipelineLogs(prev => [
        ...prev,
        "Evon v3.3: Filtered non-commercial street gossip (IGNORE_CHATTER) & cricket talk.",
        "Evon v3.3: Matched 12 Udhari intents against shopkeeper nod affirmative signals.",
        "Evon v3.3: Grouping customer khata accounts with 98.8% confidence..."
      ]);
      setPipelineStage(3);
      playAudioChime('ping');
    }, 3600);

    setTimeout(() => {
      setPipelineProgress(100);
      setPipelineLogs(prev => [
        ...prev,
        "Gnani Timbre v3.0: Phonetic normalizer generated pre-TTS speech proofs.",
        "Customer Khata updated: Old Balance + Today's New Balance locked.",
        "Acoustic Day Settlement finalized successfully!"
      ]);
      playAudioChime('lock');
      fireConfetti();
      showToast(
        'Batch Khata Analysis Complete!',
        '11.5 hrs street audio diarized and balances locked with timestamp proofs.',
        'success'
      );

      fetch(`${API_BASE}/api/stop-and-analyze-day`, { method: 'POST' })
        .then(r => r.json())
        .then(data => {
          if (data.customers) setCustomers(data.customers);
          if (data.synced_at) setLastUpdatedTime(data.synced_at);
        })
        .catch(() => {});
    }, 5200);
  };

  // Upload Real Audio File & Process via Gnani AI API Pipeline
  const handleAudioFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedAudioSource(file.name);
    setIsBatchPipelineActive(true);
    setPipelineStage(1);
    setPipelineProgress(18);
    setPipelineLogs([
      "Uploading audio recording to Gnani AI Sovereign Pipeline...",
      `Audio File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)...`,
      `Prisma v2.5: Ambient noise normalized (${noiseSliderDb} dB street filter active)...`,
      "Prisma v2.5: Multi-speaker Diarization initialized..."
    ]);
    playAudioChime('ping');

    try {
      const formData = new FormData();
      formData.append('file', file);

      setTimeout(() => {
        setPipelineProgress(52);
        setPipelineLogs(prev => [
          ...prev,
          "Gnani Prisma v2.5 ASR: Acoustic speech-to-text frames extracted.",
          "Evon v3.3: Parsing commercial intent, customer entities & dispute claims..."
        ]);
        setPipelineStage(2);
        playAudioChime('ping');
      }, 1500);

      const res = await fetch(`${API_BASE}/api/upload-and-analyze`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();

        setTimeout(() => {
          setPipelineProgress(85);
          setPipelineLogs(prev => [
            ...prev,
            `Prisma Transcript: "${data.transcript ? data.transcript.slice(0, 70) + '...' : 'Complete'}"`,
            `Evon v3.3: Extracted ${data.applied_count || 1} commercial transaction(s).`,
            "Gnani Timbre v3.0: Phonetic normalizer locked audio proof to Dispute Vault."
          ]);
          setPipelineStage(3);
          playAudioChime('ping');
        }, 2800);

        setTimeout(() => {
          setPipelineProgress(100);
          setPipelineLogs(prev => [
            ...prev,
            `SQLite DukandarKhata.db updated: Old Balance + Today's New Balance locked.`,
            `Acoustic settlement synchronized successfully!`
          ]);
          setPipelineStage(4);
          playAudioChime('lock');
          fireConfetti();

          if (data.customers) setCustomers(data.customers);
          if (data.settledCash !== undefined) setSettledCash(data.settledCash);
          if (data.settledUpi !== undefined) setSettledUpi(data.settledUpi);
          if (data.streamLogs) setStreamLogs(data.streamLogs);
          if (data.inventoryAlerts) setInventoryAlerts(data.inventoryAlerts);
          if (data.synced_at) setLastUpdatedTime(data.synced_at);

          showToast(
            'Audio Upload & Analysis Complete!',
            `Extracted ${data.applied_count || 1} commercial transaction(s) directly into Khata.`,
            'success'
          );
        }, 4200);
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      setTimeout(() => {
        setPipelineProgress(100);
        setPipelineLogs(prev => [
          ...prev,
          "Local acoustic fallback: Processed voice audio stream in on-device mode.",
          "Balances synchronized successfully."
        ]);
        setPipelineStage(4);
        playAudioChime('lock');
        fireConfetti();
        showToast(
          'Local Audio Analysis Complete',
          `Parsed ${file.name} using local acoustic simulator.`,
          'info'
        );
      }, 3500);
    }
  };

  const closeBatchPipeline = () => {
    setIsBatchPipelineActive(false);
    setPipelineStage(0);
    setPipelineProgress(0);
    setPipelineLogs([]);
  };

  // Add Customer / Manual Entry
  const handleAddManualCustomer = (e) => {
    e.preventDefault();
    setFormErrorMessage(null);
    setFormSuccessMessage(null);

    if (!newCustName.trim()) {
      setFormErrorMessage("Customer name is required.");
      return;
    }

    const oldBal = parseFloat(newCustOldBal) || 0;
    const todayAdd = parseFloat(newCustAddToday) || 0;

    if (oldBal < 0 || todayAdd < 0) {
      setFormErrorMessage("Balances cannot be negative.");
      return;
    }

    const total = oldBal + todayAdd;
    const newId = `CUST-${Math.floor(100 + Math.random() * 900)}`;
    const initials = newCustName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'CU';

    const newCustomerObj = {
      id: newId,
      name: newCustName.trim(),
      phone: newCustPhone.trim() || '98XXXXXX99 • Synthetic',
      avatar: initials,
      interactionsCount: todayAdd > 0 ? 1 : 0,
      oldBalance: oldBal,
      todayNewBalance: todayAdd,
      totalBalance: total,
      lastTransactionTime: 'Just Now',
      isFlaggedDispute: false,
      disputeHistory: todayAdd > 0 ? [
        {
          id: `disp_${Date.now()}`,
          timestamp: 'Just Now',
          items: 'Manual Counter Credit',
          amount: todayAdd,
          paymentType: 'Udhari',
          verbatimVoiceQuote: `${newCustName}: 'Manual counter adjustment logged by shopkeeper'`,
          rawEvonText: `Manual khata credit of Rs ${todayAdd} assigned to ${newCustName}`,
          confidence: 100,
          sourceTag: 'MANUAL_ENTRY',
          status: 'Verified'
        }
      ] : []
    };

    setFormSuccessMessage(`Customer ${newCustomerObj.name} added successfully!`);
    setCustomers(prev => [newCustomerObj, ...prev]);
    setSelectedCustomerId(newId);

    fireConfetti();
    playAudioChime('lock');

    setTimeout(() => {
      setIsManualModalOpen(false);
      setNewCustName('');
      setNewCustPhone('');
      setNewCustOldBal('');
      setNewCustAddToday('');
      setFormSuccessMessage(null);
      showToast('Customer Added', `${newCustomerObj.name} added with Total Due ${formatRupee(total)}`, 'success');
    }, 1000);

    fetch(`${API_BASE}/api/add-customer-or-credit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: newCustomerObj.name,
        phone_synthetic: newCustomerObj.phone,
        old_balance: oldBal,
        added_amount: todayAdd,
        items: 'Manual Counter Credit',
        tx_type: 'Udhari',
        time_str: 'Just Now'
      })
    })
    .then(r => r.json())
    .then(data => {
      if (data.customers) setCustomers(data.customers);
      if (data.streamLogs) setStreamLogs(data.streamLogs);
    })
    .catch(() => {});
  };

  // Resolve single dispute item
  const handleResolveDisputeItem = (disputeId) => {
    setConfirmationModal({
      isOpen: true,
      title: "Resolve Customer Dispute",
      message: "Are you sure you want to acknowledge and archive this voice timestamp evidence? The dispute flag will be cleared.",
      confirmText: "Acknowledge & Resolve",
      onConfirm: () => {
        playAudioChime('lock');
        setCustomers(prev => prev.map(c => {
          if (c.id === selectedCustomerId) {
            const updatedHistory = c.disputeHistory.map(d => {
              if (d.id === disputeId) {
                return { ...d, status: 'Resolved & Acknowledged' };
              }
              return d;
            });
            return { ...c, disputeHistory: updatedHistory, isFlaggedDispute: false };
          }
          return c;
        }));

        fireConfetti();
        showToast(
          'Dispute Resolved & Acknowledged',
          'Voice proof verified with customer. Timestamp proof archived.',
          'success'
        );

        const activeCust = customers.find(c => c.id === selectedCustomerId);
        fetch(`${API_BASE}/api/resolve-dispute-claim`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dispute_id: disputeId,
            disputeId: disputeId,
            customer_name: activeCust ? activeCust.name : '',
            customerId: selectedCustomerId
          })
        })
        .then(r => r.json())
        .then(data => {
          if (data.customers) setCustomers(data.customers);
        })
        .catch(() => {});

        setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.phone.includes(searchQuery);
      if (!matchesSearch) return false;

      if (filterType === 'HIGH_UDHARI') {
        return c.totalBalance >= 200;
      }
      if (filterType === 'CALL_SHIELD') {
        return c.disputeHistory.some(d => d.sourceTag === 'CALL_SHIELD_OVERRIDE');
      }
      return true;
    });
  }, [customers, searchQuery, filterType]);

  // Global Search Filter Results for Command Palette
  const searchResults = useMemo(() => {
    if (!globalSearchTerm.trim()) return { customers: [], items: [], faqs: [] };
    const term = globalSearchTerm.toLowerCase();

    const matchingCustomers = customers.filter(c => 
      c.name.toLowerCase().includes(term) || 
      c.phone.toLowerCase().includes(term) ||
      c.id.toLowerCase().includes(term)
    );

    const matchingLogs = streamLogs.filter(s => 
      s.quote.toLowerCase().includes(term) || 
      s.speaker.toLowerCase().includes(term) ||
      s.metadata.toLowerCase().includes(term)
    );

    const matchingFaqs = DUKANDAR_FAQS.filter(f => 
      f.question.toLowerCase().includes(term) || 
      f.answer.toLowerCase().includes(term)
    );

    return { customers: matchingCustomers, items: matchingLogs, faqs: matchingFaqs };
  }, [globalSearchTerm, customers, streamLogs]);

  // Filtered diarized stream logs
  const filteredStreamLogs = useMemo(() => {
    return streamLogs.filter(s => {
      if (streamFilter === 'UDHARI') return s.type === 'UDHARI_RECORDED' || s.type === 'CALL_BUFFER_LOCKED';
      if (streamFilter === 'CHATTER') return s.type === 'IGNORE_CHATTER';
      if (streamFilter === 'UPI_CASH') return s.type === 'CASH_SETTLED' || s.type === 'UPI_VERIFIED';
      return true;
    });
  }, [streamLogs, streamFilter]);

  // Trigger Print
  const handlePrintDailyReport = () => {
    playAudioChime('ping');
    window.print();
  };

  // Scroll to Top Handler
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 pb-28 relative overflow-x-hidden ${
      isDarkMode 
        ? 'bg-[#06090E] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200' 
        : 'bg-[#F8FAFC] text-slate-900 selection:bg-emerald-500/20 selection:text-emerald-900 theme-light'
    } ${isCallActive ? 'screen-call-shield-active' : ''}`}>

      {/* Accessible Skip-to-Content Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Scroll Progress Bar at very top */}
      <div 
        className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 z-50 transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Ambient Radial Top Glow */}
      <div className={`fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] blur-[140px] pointer-events-none z-0 ${
        isDarkMode ? 'bg-emerald-500/[0.06]' : 'bg-emerald-500/[0.04]'
      }`} />

      {/* Screen Perimeter Glow during active Call Shield */}
      {isCallActive && (
        <div className="fixed inset-0 pointer-events-none z-50 border-2 border-amber-500/40 animate-pulse" />
      )}

      {/* ========================================================================= */}
      {/* PRINT-ONLY DAILY KHATA SETTLEMENT INVOICE                                */}
      {/* ========================================================================= */}
      <div className="print-only p-8 text-black bg-white">
        <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black tracking-tight">DUKANDAR-OS</h1>
            <p className="text-sm font-semibold text-gray-700">Sovereign Acoustic Khata & Daily Settlement Report</p>
            <p className="text-xs text-gray-500 mt-1">Sharma General Store & Tea Stall • Koramangala, Bengaluru</p>
          </div>
          <div className="text-right text-xs font-mono">
            <p><strong>Date:</strong> 31-Oct-2026</p>
            <p><strong>Shift:</strong> 08:00 AM – 09:30 PM (11.5 hrs)</p>
            <p><strong>Acoustic Model:</strong> Gnani Prisma v2.5 / Evon v3.3</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6 text-xs border p-3 bg-gray-50 font-mono">
          <div><strong>Total Settled Cash:</strong> {formatRupee(settledCash)}</div>
          <div><strong>Total Settled UPI:</strong> {formatRupee(settledUpi)}</div>
          <div><strong>Today's New Udhari:</strong> {formatRupee(totalTodayNewUdhari)}</div>
          <div><strong>Total Closing Due:</strong> {formatRupee(totalClosingUdhariDue)}</div>
        </div>

        <h2 className="text-sm font-bold uppercase tracking-wider mb-2">Customer Khata Ledger Summary</h2>
        <table className="print-table w-full text-left text-xs mb-8">
          <thead>
            <tr className="bg-gray-100 font-bold">
              <th>Customer</th>
              <th>Phone</th>
              <th>Old Balance</th>
              <th>Today's Added</th>
              <th>Closing Due</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong> ({c.id})</td>
                <td>{c.phone}</td>
                <td>{formatRupee(c.oldBalance)}</td>
                <td>{formatRupee(c.todayNewBalance)}</td>
                <td><strong>{formatRupee(c.totalBalance)}</strong></td>
                <td>{c.totalBalance === 0 ? 'Settled' : 'Pending Due'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-end pt-12 border-t text-xs font-mono">
          <div>
            <p>Generated by DukandarOS Sovereign Voice Engine</p>
            <p className="text-gray-500">Tamper-evident timestamped acoustic proofs archived on device.</p>
          </div>
          <div className="text-center w-48 border-t border-black pt-1">
            <p className="font-bold">Shopkeeper Signature</p>
          </div>
        </div>
      </div>

      {/* Floating Dynamic Micro Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={SPRING_TRANSITION}
            className={`fixed top-4 right-5 z-50 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border backdrop-blur-2xl shadow-xl no-print ${
              toastMessage.type === 'success' 
                ? isDarkMode ? 'bg-[#0B1017]/95 border-emerald-500/30 text-emerald-200' : 'bg-white border-emerald-500/40 text-emerald-800'
                : isDarkMode ? 'bg-[#0B1017]/95 border-amber-500/30 text-amber-200' : 'bg-white border-amber-500/40 text-amber-800'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 size={13} strokeWidth={1.75} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle size={13} strokeWidth={1.75} className="text-amber-400 shrink-0" />
            )}
            <div>
              <div className="font-semibold text-xs tracking-tight">{toastMessage.title}</div>
              <div className="text-[11px] opacity-80">{toastMessage.subtitle}</div>
            </div>
            <button 
              onClick={() => setToastMessage(null)}
              className="ml-1 p-1 hover:bg-black/[0.06] rounded-md opacity-60 hover:opacity-100 cursor-pointer"
            >
              <X size={12} strokeWidth={1.75} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 py-4 space-y-4 no-print">

        {/* ========================================================================= */}
        {/* ZONE 1: STICKY HEADER WITH DARK MODE TOGGLE & SITE SEARCH (py-3 px-5)    */}
        {/* ========================================================================= */}
        <header className={`sticky top-2.5 z-40 rounded-2xl backdrop-blur-xl border shadow-2xl py-3 px-5 flex flex-wrap items-center justify-between gap-3.5 transition-all ${
          isDarkMode 
            ? 'bg-[#0B1017]/85 border-white/[0.07] hover:border-emerald-500/30' 
            : 'bg-white/90 border-slate-200/80 hover:border-emerald-500/40 shadow-slate-200/50'
        }`}>
          
          {/* Left Brand + Radio Micro-Mark + Sovereign AI Badges */}
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
              <Radio size={15} strokeWidth={1.75} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight">
                  Dukandar<span className="text-emerald-500">OS</span>
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.07em] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-md">
                  <Sparkles size={11} strokeWidth={1.75} />
                  <span>Sovereign AI for India</span>
                </span>
                {utmInfo && (
                  <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/25 rounded-md">
                    <span>UTM: {utmInfo.campaign || utmInfo.source}</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] opacity-70 flex items-center gap-1.5 mt-0.5">
                <span>Acoustic Khata & Dispute Copilot</span>
                <span className="inline-block w-1 h-1 rounded-full bg-slate-500" />
                <span className="font-mono text-[10px] text-emerald-500">Gnani Ecosystem</span>
              </p>
            </div>
          </div>

          {/* Center: Search & Street Noise Stress-Tester Slider */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Quick Site Search Button (Command Palette Ctrl+K) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-[#0F1620] border-white/[0.07] text-slate-300 hover:border-emerald-500/40 hover:text-white' 
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:border-emerald-500/40 hover:text-slate-900'
              }`}
              title="Search Khata (Ctrl+K)"
            >
              <Search size={13} strokeWidth={1.75} className="text-emerald-500" />
              <span>Search Khata...</span>
              <kbd className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                isDarkMode ? 'bg-black/40 border-white/[0.1] text-slate-400' : 'bg-white border-slate-300 text-slate-500'
              }`}>
                ⌘K
              </kbd>
            </button>

            {/* Street Noise Slider */}
            <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border ${
              isDarkMode ? 'bg-[#0F1620] border-white/[0.07]' : 'bg-slate-100 border-slate-200'
            }`}>
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <Sliders size={13} strokeWidth={1.75} className="text-emerald-500" />
                <span>Noise:</span>
              </div>
              <input
                type="range"
                min="55"
                max="92"
                value={noiseSliderDb}
                onChange={(e) => setNoiseSliderDb(parseInt(e.target.value, 10))}
                className="w-16 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="font-mono tabular-nums text-xs font-bold text-emerald-500 w-10">
                {noiseSliderDb} dB
              </span>
              <div className={`flex items-center gap-1 text-[11px] font-mono tabular-nums border-l pl-2 ${
                isDarkMode ? 'border-white/[0.07] text-slate-400' : 'border-slate-300 text-slate-500'
              }`}>
                <span>NER:</span>
                <span className="text-emerald-500 font-bold">{prismaConfidence}%</span>
              </div>
            </div>
          </div>

          {/* Right Toolbar Actions */}
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            
            {/* Last updated timestamp & Refresh loading button */}
            <button
              onClick={handleManualSync}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono tabular-nums border transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-white/[0.04] border-white/[0.07] text-slate-400 hover:text-white' 
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title="Click to sync and refresh khata"
            >
              <RefreshCw size={11} strokeWidth={1.75} className={`${isRefreshing ? 'animate-spin text-emerald-500' : 'text-slate-400'}`} />
              <span>Synced {lastUpdatedTime}</span>
            </button>

            {/* Print Daily Khata Button */}
            <button
              onClick={handlePrintDailyReport}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-[#0F1620] hover:bg-slate-800 border-white/[0.07] text-slate-300 hover:text-white' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
              title="Print Daily Khata Summary"
            >
              <Printer size={13} strokeWidth={1.75} className="text-emerald-500" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* 1-Click Reset Demo DB Button */}
            <button
              onClick={handleResetDemoDb}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-300' 
                  : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'
              }`}
              title="Reset SQLite dukandar_khata.db back to initial default demo numbers"
            >
              <RotateCw size={12} strokeWidth={1.75} className="text-rose-400" />
              <span className="hidden xl:inline">Reset Demo</span>
            </button>

            {/* Dark Mode Toggle Switch */}
            <button
              onClick={toggleDarkMode}
              className={`flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-[#0F1620] hover:bg-slate-800 border-white/[0.07] text-amber-300' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
              }`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? (
                <>
                  <Sun size={13} strokeWidth={1.75} className="text-amber-400" />
                  <span className="hidden sm:inline text-xs">Light</span>
                </>
              ) : (
                <>
                  <Moon size={13} strokeWidth={1.75} className="text-indigo-600" />
                  <span className="hidden sm:inline text-xs">Dark</span>
                </>
              )}
            </button>

            {/* Simulate Personal Phone Call Toggle */}
            <button
              onClick={() => {
                const nextState = !isCallActive;
                setIsCallActive(nextState);
                if (nextState) {
                  playAudioChime('call');
                  setIsCallShieldMinimized(false);
                  showToast(
                    'Personal Phone Call Active',
                    'Main mic paused for family call. Single-Device Call Shield (15s RAM Buffer) armed.',
                    'warning'
                  );
                } else {
                  playAudioChime('ping');
                  showToast('Call Ended', 'Day microphone resumed normal background recording.', 'success');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                isCallActive
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 animate-call-shield'
                  : isDarkMode
                  ? 'bg-[#0F1620] hover:bg-slate-800 border-white/[0.07] text-slate-300 hover:text-white'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
            >
              {isCallActive ? (
                <>
                  <PhoneIncoming size={13} strokeWidth={1.75} className="text-amber-400 animate-bounce" />
                  <span>Call Active</span>
                </>
              ) : (
                <>
                  <PhoneIncoming size={13} strokeWidth={1.75} className="text-slate-400" />
                  <span>Simulate Call</span>
                </>
              )}
            </button>

            {/* Stop Day Recording & Analyze Khata (Primary CTA) */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={triggerBatchAnalysis}
              className="shimmer-sweep flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 border border-emerald-500/30 transition-all cursor-pointer"
            >
              <StopCircle size={14} strokeWidth={1.75} />
              <span className="hidden sm:inline">Stop Day & Analyze</span>
              <span className="sm:hidden">Analyze</span>
            </motion.button>

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className={`lg:hidden p-1.5 rounded-lg border text-slate-300 cursor-pointer ${
                isDarkMode ? 'bg-[#0F1620] border-white/[0.07]' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X size={15} /> : <Menu size={15} />}
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* MOBILE NAVIGATION DRAWER (Slide-over sheet)                              */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`lg:hidden rounded-2xl border p-4 space-y-3 shadow-xl overflow-hidden ${
                isDarkMode ? 'bg-[#0B1017] border-white/[0.1]' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <span className="text-xs font-bold tracking-tight">Navigation & Controls</span>
                <span className="text-[11px] font-mono text-emerald-500">{syncStatusText}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button 
                  onClick={() => { setIsSearchOpen(true); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-left ${
                    isDarkMode ? 'bg-[#0F1620] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <Search size={14} className="text-emerald-500" />
                  <span>Search Khata</span>
                </button>
                <button 
                  onClick={() => { handlePrintDailyReport(); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-left ${
                    isDarkMode ? 'bg-[#0F1620] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <Printer size={14} className="text-emerald-500" />
                  <span>Print Report</span>
                </button>
                <button 
                  onClick={() => { setIsManualModalOpen(true); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-left ${
                    isDarkMode ? 'bg-[#0F1620] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <Plus size={14} className="text-emerald-500" />
                  <span>Add Customer</span>
                </button>
                <button 
                  onClick={() => { toggleDarkMode(); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-left ${
                    isDarkMode ? 'bg-[#0F1620] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {isDarkMode ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-600" />}
                  <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
                </button>
                <button 
                  onClick={() => { handleResetDemoDb(); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-left col-span-2 ${
                    isDarkMode ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}
                >
                  <RotateCw size={14} className="text-rose-400" />
                  <span>Reset Demo Database (dukandar_khata.db)</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main id="main-content" className="space-y-4">

          {/* ========================================================================= */}
          {/* ZONE 2: MIC-LESS AUDIO SOURCE BAR & 11.5-HR TIMELINE SCRUBBER             */}
          {/* ========================================================================= */}
          <div className={`rounded-2xl backdrop-blur-xl border p-3.5 transition-colors ${
            isDarkMode 
              ? 'bg-[#0B1017]/85 border-white/[0.07] hover:border-emerald-500/30' 
              : 'bg-white/95 border-slate-200/80 hover:border-emerald-500/40 shadow-sm'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <FileAudio size={14} strokeWidth={1.75} />
                </div>
                <span className="text-xs font-bold">11.5-Hour Counter Acoustic Scrubber</span>
                <span className="text-[11px] font-mono tabular-nums opacity-60">(08:00 AM – 09:30 PM)</span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="opacity-70">Source:</span>
                <select
                  value={selectedAudioSource}
                  onChange={(e) => setSelectedAudioSource(e.target.value)}
                  className={`border rounded-md px-2.5 py-1 text-xs font-mono cursor-pointer focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-[#0F1620] border-white/[0.08] text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-800'
                  }`}
                >
                  <option value="day_stall_recording_oct31.wav">day_stall_recording_oct31.wav (11.5 hrs)</option>
                  <option value="evening_rush_hinglish_kanglish.wav">evening_rush_hinglish_kanglish.wav (4.2 hrs)</option>
                  <option value="dispute_verification_clip.wav">dispute_verification_clip.wav (45 mins)</option>
                  {!['day_stall_recording_oct31.wav', 'evening_rush_hinglish_kanglish.wav', 'dispute_verification_clip.wav'].includes(selectedAudioSource) && (
                    <option value={selectedAudioSource}>{selectedAudioSource}</option>
                  )}
                </select>

                {/* Hidden File Input for Real Audio Upload (.wav, .mp3, .m4a, .ogg) */}
                <input
                  type="file"
                  ref={audioFileInputRef}
                  accept="audio/*,.wav,.mp3,.m4a,.ogg"
                  onChange={handleAudioFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => audioFileInputRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30 transition-all cursor-pointer shadow-sm"
                  title="Upload .wav, .mp3, .m4a, .ogg to analyze with Gnani AI"
                >
                  <Upload size={12} strokeWidth={2} />
                  <span>Upload Audio</span>
                </button>
              </div>
            </div>

            {/* Timeline Waveform & Clickable Pins */}
            <div className={`relative w-full h-12 rounded-xl border p-2 flex items-center overflow-hidden ${
              isDarkMode ? 'bg-[#0F1620] border-white/[0.06]' : 'bg-slate-100 border-slate-200'
            }`}>
              
              {/* Audio Density Bars */}
              <div className="absolute inset-0 flex items-center justify-between px-3 opacity-25 pointer-events-none">
                {[...Array(64)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-emerald-500 rounded-full"
                    style={{ height: `${(Math.sin(i * 0.35) * 0.4 + 0.5) * 100}%` }}
                  />
                ))}
              </div>

              {/* Micro Event Pins */}
              {TIMELINE_EVENTS.map(ev => {
                const isSelected = activeTimelinePin === ev.id;
                return (
                  <button
                    key={ev.id}
                    onClick={() => {
                      setActiveTimelinePin(ev.id);
                      setScrubberPosition(ev.percent);
                      if (ev.customerId) setSelectedCustomerId(ev.customerId);
                      playAudioChime('ping');
                      showToast(ev.label, `${ev.time} • ${ev.note}`, 'info');
                    }}
                    style={{ left: `${ev.percent}%` }}
                    className="absolute -translate-x-1/2 flex flex-col items-center group cursor-pointer z-10"
                  >
                    <div className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap shadow-sm border transition-all ${
                      isSelected 
                        ? 'bg-emerald-500 text-black border-emerald-400 scale-105'
                        : ev.type === 'UDHARI'
                        ? isDarkMode ? 'bg-[#0B1017] text-slate-300 border-white/[0.1] hover:border-emerald-500/50' : 'bg-white text-slate-700 border-slate-300'
                        : ev.type === 'CHATTER'
                        ? isDarkMode ? 'bg-[#0B1017] text-slate-500 border-white/[0.05]' : 'bg-white text-slate-400 border-slate-200'
                        : isDarkMode ? 'bg-[#0B1017] text-amber-300 border-amber-500/30' : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}>
                      {ev.time}
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full mt-1 ${
                      isSelected ? 'bg-emerald-400 ring-2 ring-emerald-400/50' : 'bg-slate-500'
                    }`} />
                  </button>
                );
              })}

              {/* Playhead line */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-emerald-500 shadow-md pointer-events-none z-20"
                style={{ left: `${scrubberPosition}%` }}
              />
            </div>

            {/* Active Event Preview */}
            {activeTimelinePin && (
              <div className={`mt-2 px-3 py-1 rounded-lg border text-xs font-mono tabular-nums flex items-center justify-between ${
                isDarkMode ? 'bg-[#0F1620] border-white/[0.06] text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <span className="text-emerald-500 font-semibold flex items-center gap-1.5">
                  <Clock size={12} strokeWidth={1.75} />
                  <span>{TIMELINE_EVENTS.find(e => e.id === activeTimelinePin)?.label}</span>
                </span>
                <span className="opacity-75">{TIMELINE_EVENTS.find(e => e.id === activeTimelinePin)?.note}</span>
                <span className="text-[11px] opacity-60">Scrubbed to {TIMELINE_EVENTS.find(e => e.id === activeTimelinePin)?.time}</span>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* ZONE 3: 4 FINANCIAL KPI CARDS WITH EXPLICIT 3-PART EQUATION                */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            {/* Card 1: Settled Revenue (Cash + UPI) */}
            <motion.div 
              whileHover={{ y: -2 }}
              className={`rounded-2xl border p-4 backdrop-blur-xl relative overflow-hidden transition-all shadow-sm ${
                isDarkMode ? 'bg-[#0B1017]/85 border-white/[0.07] hover:border-emerald-500/30' : 'bg-white/95 border-slate-200 hover:border-emerald-500/40'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold opacity-70 flex items-center gap-1.5">
                  <Wallet size={14} strokeWidth={1.75} className="text-emerald-500" />
                  <span>Today's Settled Cash/UPI</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  VERIFIED
                </span>
              </div>
              <div className="text-2xl font-black font-mono tabular-nums tracking-tight text-emerald-500">
                {formatRupee(totalSettledToday)}
              </div>
              <div className="mt-2 text-[11px] font-mono tabular-nums opacity-60 flex justify-between">
                <span>Cash: {formatRupee(settledCash)}</span>
                <span>UPI: {formatRupee(settledUpi)}</span>
              </div>
            </motion.div>

            {/* Card 2: Previous Old Balance */}
            <motion.div 
              whileHover={{ y: -2 }}
              className={`rounded-2xl border p-4 backdrop-blur-xl relative overflow-hidden transition-all shadow-sm ${
                isDarkMode ? 'bg-[#0B1017]/85 border-white/[0.07] hover:border-emerald-500/30' : 'bg-white/95 border-slate-200 hover:border-emerald-500/40'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold opacity-70 flex items-center gap-1.5">
                  <History size={14} strokeWidth={1.75} className="opacity-70" />
                  <span>Previous Old Udhari</span>
                </span>
                <span className="text-[10px] font-mono opacity-50">CARRY-FORWARD</span>
              </div>
              <div className="text-2xl font-black font-mono tabular-nums tracking-tight">
                {formatRupee(totalOldUdhari)}
              </div>
              <div className="mt-2 text-[11px] font-mono tabular-nums opacity-60">
                Across {customers.length} registered credit accounts
              </div>
            </motion.div>

            {/* Card 3: Today's New Udhari Added */}
            <motion.div 
              whileHover={{ y: -2 }}
              className={`rounded-2xl border p-4 backdrop-blur-xl relative overflow-hidden transition-all shadow-sm ${
                isDarkMode ? 'bg-[#0B1017]/85 border-white/[0.07] hover:border-amber-500/30' : 'bg-white/95 border-slate-200 hover:border-amber-500/40'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold opacity-70 flex items-center gap-1.5">
                  <TrendingUp size={14} strokeWidth={1.75} className="text-amber-500" />
                  <span>+ Today's New Udhari</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-500 border border-amber-500/25">
                  UNSETTLED
                </span>
              </div>
              <div className="text-2xl font-black font-mono tabular-nums tracking-tight text-amber-500">
                +{formatRupee(totalTodayNewUdhari)}
              </div>
              <div className="mt-2 text-[11px] font-mono tabular-nums opacity-60">
                Extracted from 11.5h day acoustic logs
              </div>
            </motion.div>

            {/* Card 4: Total Closing Balance Due (Old + New) */}
            <motion.div 
              whileHover={{ y: -2 }}
              className={`rounded-2xl border p-4 backdrop-blur-xl relative overflow-hidden transition-all shadow-sm ${
                isDarkMode ? 'bg-[#0B1017]/85 border-emerald-500/40 shadow-emerald-500/5' : 'bg-white/95 border-emerald-500/40 shadow-emerald-500/10'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold opacity-70 flex items-center gap-1.5">
                  <Calculator size={14} strokeWidth={1.75} className="text-emerald-500" />
                  <span>Total Closing Due</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-500">OLD + NEW</span>
              </div>
              <div className="text-2xl font-black font-mono tabular-nums tracking-tight text-emerald-500">
                {formatRupee(totalClosingUdhariDue)}
              </div>
              <div className="mt-2 text-[11px] font-mono tabular-nums opacity-75">
                {formatRupee(totalOldUdhari)} + {formatRupee(totalTodayNewUdhari)} = {formatRupee(totalClosingUdhariDue)}
              </div>
            </motion.div>
          </div>

          {/* ========================================================================= */}
          {/* ZONE 4: ASYMMETRIC WORKSPACE (Left 7 Cols / Right 5 Cols)                */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* --------------------------------------------------------------------- */}
            {/* LEFT 7 COLUMNS: Customer Khata Ledger Table & Acoustic Stream Logs    */}
            {/* --------------------------------------------------------------------- */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Customer Khata Ledger Card */}
              <div className={`rounded-2xl backdrop-blur-xl border p-4 transition-colors ${
                isDarkMode ? 'bg-[#0B1017]/85 border-white/[0.07]' : 'bg-white/95 border-slate-200 shadow-sm'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
                  <div>
                    <h2 className="text-sm font-bold tracking-tight flex items-center gap-2">
                      <span>Customer Khata Ledger</span>
                      <span className="text-[11px] font-mono font-normal opacity-60">
                        ({filteredCustomers.length} accounts)
                      </span>
                    </h2>
                    <p className="text-[11px] opacity-60">Old Balance + Today's Added Credit = Total Closing Due</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Search inside table */}
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${
                      isDarkMode ? 'bg-[#0F1620] border-white/[0.08]' : 'bg-slate-100 border-slate-200'
                    }`}>
                      <Search size={12} className="opacity-60" />
                      <input
                        type="text"
                        placeholder="Filter name or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none text-xs focus:outline-none w-28 sm:w-36 font-medium"
                      />
                    </div>

                    {/* Filter Chip */}
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className={`border rounded-lg px-2 py-1 text-xs cursor-pointer focus:outline-none ${
                        isDarkMode ? 'bg-[#0F1620] border-white/[0.08] text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-800'
                      }`}
                    >
                      <option value="ALL">All Accounts</option>
                      <option value="HIGH_UDHARI">&gt; ₹200 Due</option>
                      <option value="CALL_SHIELD">Call Shield Locked</option>
                    </select>

                    {/* Add Customer Button */}
                    <button
                      onClick={() => setIsManualModalOpen(true)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <Plus size={12} strokeWidth={2} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Ledger Table */}
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className={`border-b text-[11px] font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'border-white/[0.07] text-slate-400' : 'border-slate-200 text-slate-500 bg-slate-50/50'
                      }`}>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3 text-right">Old Bal</th>
                        <th className="py-2.5 px-3 text-right text-amber-500">+ Today's</th>
                        <th className="py-2.5 px-3 text-right text-emerald-500 font-bold">= Total Due</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-white/[0.04]' : 'divide-slate-100'}`}>
                      {isRefreshing ? (
                        [...Array(4)].map((_, i) => (
                          <tr key={i} className="animate-skeleton">
                            <td className="py-3 px-3">
                              <div className={`h-4 w-32 rounded ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className={`h-4 w-12 ml-auto rounded ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className={`h-4 w-12 ml-auto rounded ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className={`h-4 w-14 ml-auto rounded ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                            </td>
                            <td className="py-3 px-3 text-center">
                              <div className={`h-6 w-16 mx-auto rounded ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                            </td>
                          </tr>
                        ))
                      ) : filteredCustomers.map(cust => {
                        const isSelected = cust.id === selectedCustomerId;
                        const isFlash = highlightedRowId === cust.id;

                        return (
                          <tr
                            key={cust.id}
                            onClick={() => setSelectedCustomerId(cust.id)}
                            className={`transition-all cursor-pointer ${
                              isSelected
                                ? isDarkMode ? 'bg-emerald-500/[0.08]' : 'bg-emerald-50'
                                : isDarkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'
                            } ${isFlash ? 'bg-amber-500/20 animate-pulse' : ''}`}
                          >
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-7 h-7 rounded-lg font-bold font-mono text-[11px] flex items-center justify-center border ${
                                  isSelected 
                                    ? 'bg-emerald-500 text-black border-emerald-400' 
                                    : isDarkMode ? 'bg-[#0F1620] border-white/[0.08] text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                                }`}>
                                  {cust.avatar}
                                </div>
                                <div>
                                  <div className="font-bold flex items-center gap-1.5">
                                    <span>{cust.name}</span>
                                    {cust.isFlaggedDispute && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 ring-2 ring-rose-500/40" title="Flagged Dispute" />
                                    )}
                                  </div>
                                  <div className="text-[10px] font-mono opacity-50 flex items-center gap-1">
                                    <span>{cust.phone}</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopy(cust.phone.split(' ')[0], `phone_${cust.id}`);
                                      }}
                                      className="p-0.5 hover:text-emerald-500"
                                      title="Copy phone"
                                    >
                                      {copiedKey === `phone_${cust.id}` ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-2.5 px-3 text-right font-mono tabular-nums opacity-75">
                              {formatRupee(cust.oldBalance)}
                            </td>

                            <td className="py-2.5 px-3 text-right font-mono tabular-nums text-amber-500 font-semibold">
                              +{formatRupee(cust.todayNewBalance)}
                            </td>

                            <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-500 font-black">
                              {formatRupee(cust.totalBalance)}
                            </td>

                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => openSettlementForCustomer(cust)}
                                  className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 hover:bg-emerald-500 hover:text-black transition-all cursor-pointer"
                                >
                                  Settle
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Prisma v2.5 Diarized Stream & Evon Filter Logs + Hourly Chart */}
              <div className={`rounded-2xl backdrop-blur-xl border p-4 space-y-3 transition-colors ${
                isDarkMode ? 'bg-[#0B1017]/85 border-white/[0.07]' : 'bg-white/95 border-slate-200 shadow-sm'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Activity size={14} className="text-emerald-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      Prisma v2.5 Acoustic Stream & Diarization
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 text-[11px]">
                    {['ALL', 'UDHARI', 'CHATTER', 'UPI_CASH'].map(f => (
                      <button
                        key={f}
                        onClick={() => setStreamFilter(f)}
                        className={`px-2 py-0.5 rounded font-mono transition-all cursor-pointer ${
                          streamFilter === f
                            ? 'bg-emerald-500 text-black font-bold'
                            : isDarkMode ? 'bg-[#0F1620] text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hourly Area Chart mini */}
                <div className="h-28 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={HOURLY_ACTIVITY_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="streamGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                      <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDarkMode ? '#0B1017' : '#FFFFFF', 
                          borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
                          borderRadius: '8px',
                          fontSize: '11px' 
                        }} 
                      />
                      <Area type="monotone" dataKey="cashUpi" stroke="#10b981" fillOpacity={1} fill="url(#streamGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Stream Item Cards */}
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                  {filteredStreamLogs.map(item => (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl border text-xs space-y-1 transition-all ${
                        item.type === 'UDHARI_RECORDED'
                          ? isDarkMode ? 'bg-[#0F1620] border-amber-500/30' : 'bg-amber-50/60 border-amber-200'
                          : item.type === 'IGNORE_CHATTER'
                          ? isDarkMode ? 'bg-[#0B1017]/60 border-white/[0.04] opacity-50' : 'bg-slate-50 border-slate-200 opacity-60'
                          : isDarkMode ? 'bg-[#0F1620] border-emerald-500/30' : 'bg-emerald-50/60 border-emerald-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="font-bold flex items-center gap-1.5">
                          <span>{item.speaker}</span>
                          <span className="text-[10px] px-1 rounded bg-black/20">{item.dB} dB</span>
                        </span>
                        <span className="opacity-60">{item.time}</span>
                      </div>
                      <p className="italic opacity-90">"{item.quote}"</p>
                      <div className="text-[10px] opacity-60 flex items-center justify-between">
                        <span>{item.metadata}</span>
                        <span className="font-mono text-emerald-500 font-bold">{item.confidence}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* RIGHT 5 COLUMNS: Dispute Evidence Vault, Timbre & Inventory Radar     */}
            {/* --------------------------------------------------------------------- */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Next-Day Dispute Evidence Vault */}
              <div className={`rounded-2xl backdrop-blur-xl border p-4 space-y-3 transition-colors ${
                isDarkMode ? 'bg-[#0B1017]/85 border-white/[0.07]' : 'bg-white/95 border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between border-b pb-2.5 border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      Next-Day Dispute Evidence Vault
                    </h3>
                  </div>
                  {activeCustomer && (
                    <span className="text-[11px] font-mono text-emerald-500 font-bold">
                      {activeCustomer.name}
                    </span>
                  )}
                </div>

                {activeCustomer && activeCustomer.disputeHistory && activeCustomer.disputeHistory.length > 0 ? (
                  <div className="space-y-2.5">
                    {activeCustomer.disputeHistory.map(disp => (
                      <div
                        key={disp.id}
                        className={`p-3 rounded-xl border text-xs space-y-2 transition-all ${
                          disp.status === 'Active Dispute Claim'
                            ? isDarkMode ? 'bg-amber-500/[0.08] border-amber-500/40' : 'bg-amber-50 border-amber-300'
                            : isDarkMode ? 'bg-[#0F1620] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="font-bold text-amber-500 flex items-center gap-1">
                            <Clock size={11} />
                            <span>{disp.timestamp}</span>
                            <span>• {formatRupee(disp.amount)}</span>
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            disp.status === 'Active Dispute Claim'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                          }`}>
                            {disp.status}
                          </span>
                        </div>

                        <div className="p-2 rounded-lg bg-black/20 text-xs italic font-medium">
                          {disp.verbatimVoiceQuote}
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <button
                            onClick={() => playVoiceProof(disp.verbatimVoiceQuote)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                          >
                            <Volume2 size={12} />
                            <span>Play Voice Proof</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopy(disp.verbatimVoiceQuote, `disp_${disp.id}`)}
                              className="p-1 hover:text-emerald-500 opacity-60 hover:opacity-100"
                              title="Copy quote"
                            >
                              {copiedKey === `disp_${disp.id}` ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                            </button>
                            {disp.status === 'Active Dispute Claim' && (
                              <button
                                onClick={() => handleResolveDisputeItem(disp.id)}
                                className="px-2 py-1 rounded bg-white/[0.08] hover:bg-white/[0.15] text-[11px] font-semibold cursor-pointer"
                              >
                                Resolve & Acknowledge
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs opacity-50 space-y-1">
                    <CheckCircle2 size={24} className="mx-auto text-emerald-500/50" />
                    <p>Zero active disputes for this customer.</p>
                    <p className="text-[10px]">All previous credits acknowledged and settled.</p>
                  </div>
                )}
              </div>

              {/* Gnani Timbre v3.0 Dialect Normalizer */}
              <div className={`rounded-2xl backdrop-blur-xl border p-4 space-y-3 transition-colors ${
                isDarkMode ? 'bg-[#0B1017]/85 border-white/[0.07]' : 'bg-white/95 border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between border-b pb-2.5 border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Languages size={14} className="text-indigo-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      Timbre v3.0 Dialect Normalizer
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 text-[11px]">
                    {[
                      { code: 'hi-IN', label: 'Hinglish' },
                      { code: 'kn-IN', label: 'Kanglish' },
                      { code: 'ta-IN', label: 'Tanglish' }
                    ].map(d => (
                      <button
                        key={d.code}
                        onClick={() => setSelectedDialect(d.code)}
                        className={`px-2 py-0.5 rounded font-mono transition-all cursor-pointer ${
                          selectedDialect === d.code
                            ? 'bg-indigo-600 text-white font-bold'
                            : isDarkMode ? 'bg-[#0F1620] text-slate-400' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`p-3 rounded-xl border text-xs space-y-2 ${
                  isDarkMode ? 'bg-[#0F1620] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="text-[11px] font-mono opacity-60">Normalized Dialect Sentence:</div>
                  <p className="font-medium text-emerald-400 leading-relaxed">
                    {dialectTranslations.summary}
                  </p>
                  <div className="flex justify-between items-center pt-1 border-t border-white/[0.06]">
                    <span className="text-[10px] font-mono opacity-50">Target: {dialectTranslations.label}</span>
                    <button
                      onClick={() => playVoiceProof(dialectTranslations.audioText)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
                    >
                      <Volume2 size={12} />
                      <span>Speak ({dialectTranslations.label})</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Ambient Low-Stock Inventory Radar Card */}
              <div className={`rounded-2xl backdrop-blur-xl border p-4 space-y-3 transition-colors ${
                isDarkMode ? 'bg-[#0B1017]/85 border-white/[0.07]' : 'bg-white/95 border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between border-b pb-2.5 border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Package size={14} className="text-amber-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      Ambient Inventory Radar
                    </h3>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-500">
                    Acoustic Alerts
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {inventoryAlerts.map(inv => (
                    <div
                      key={inv.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        isDarkMode ? 'bg-[#0F1620] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{inv.name}</div>
                        <div className="text-[10px] opacity-60 italic">{inv.audioProof}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {inv.status}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setIsBroadcastingWholesale(true);
                    playAudioChime('ping');
                    setTimeout(() => {
                      setIsBroadcastingWholesale(false);
                      showToast('Wholesale PO Broadcasted', '4 low-stock items sent to distributor via WhatsApp/SMS.', 'success');
                    }, 1200);
                  }}
                  className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Send size={13} />
                  <span>{isBroadcastingWholesale ? "Broadcasting..." : "Broadcast Wholesale Voice PO"}</span>
                </button>
              </div>

            </div>
          </div>

          {/* ========================================================================= */}
          {/* ZONE 5: EXPANDABLE FAQS (ACCORDION)                                       */}
          {/* ========================================================================= */}
          <div className={`rounded-2xl backdrop-blur-xl border p-5 space-y-3 transition-colors mt-8 ${
            isDarkMode ? 'bg-[#0B1017]/85 border-white/[0.07]' : 'bg-white/95 border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-white/[0.08]">
              <div className="flex items-center gap-2">
                <HelpCircle size={16} className="text-emerald-500" />
                <h3 className="text-sm font-bold tracking-tight">
                  Frequently Asked Questions (DukandarOS Guide)
                </h3>
              </div>
              <span className="text-[11px] font-mono opacity-60">
                Sovereign Retail Voice Intelligence
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {DUKANDAR_FAQS.map(faq => {
                const isOpen = expandedFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className={`rounded-xl border transition-all overflow-hidden ${
                      isOpen
                        ? isDarkMode ? 'bg-[#0F1620] border-emerald-500/30' : 'bg-emerald-50/40 border-emerald-300'
                        : isDarkMode ? 'bg-[#0F1620]/40 border-white/[0.04]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <button
                      onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                      className="w-full p-3.5 flex items-center justify-between text-left text-xs font-bold gap-3 cursor-pointer"
                    >
                      <span className={isOpen ? 'text-emerald-500' : ''}>{faq.question}</span>
                      <ChevronDown
                        size={15}
                        className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-500' : 'opacity-50'}`}
                      />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-3.5 pb-3.5 text-xs opacity-80 leading-relaxed border-t border-white/[0.04] pt-2"
                        >
                          {faq.answer}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

        </main>

        {/* ========================================================================= */}
        {/* FLOATING ACTION BUTTONS: Back to Top & Contact Help                       */}
        {/* ========================================================================= */}
        <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5 no-print">
          
          {/* Back to top button */}
          <AnimatePresence>
            {showBackToTop && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={scrollToTop}
                className={`p-3 rounded-full border shadow-xl transition-all cursor-pointer ${
                  isDarkMode 
                    ? 'bg-[#0B1017] border-white/[0.1] text-slate-300 hover:text-white hover:border-emerald-500' 
                    : 'bg-white border-slate-300 text-slate-700 hover:text-black hover:border-emerald-500'
                }`}
                title="Back to Top"
              >
                <ArrowUp size={16} strokeWidth={2} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Floating Contact / Help Desk Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsContactOpen(prev => !prev)}
            className="p-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/30 border border-emerald-400/40 flex items-center justify-center cursor-pointer"
            title="DukandarOS Sovereign Support & WhatsApp Help"
          >
            <MessageCircle size={18} strokeWidth={2} />
          </motion.button>
        </div>

        {/* ========================================================================= */}
        {/* FLOATING CONTACT & SUPPORT DRAWER                                        */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {isContactOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={SPRING_TRANSITION}
              className={`fixed bottom-20 right-5 z-50 w-80 rounded-2xl border shadow-2xl p-4 space-y-3 no-print ${
                isDarkMode ? 'bg-[#0B1017] border-white/[0.1] text-slate-100' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-2 border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                    <MessageCircle size={13} />
                  </div>
                  <h4 className="text-xs font-bold">DukandarOS Support</h4>
                </div>
                <button 
                  onClick={() => setIsContactOpen(false)}
                  className="p-1 rounded-md opacity-60 hover:opacity-100 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {contactSubmitted ? (
                <div className="py-6 text-center space-y-2">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
                  <p className="text-xs font-bold">Feedback Sent!</p>
                  <p className="text-[11px] opacity-70">A Sovereign AI engineer will review your note.</p>
                  <button
                    onClick={() => { setContactSubmitted(false); setIsContactOpen(false); }}
                    className="mt-2 px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 text-xs">
                  <p className="opacity-75 text-[11px]">
                    Need immediate assistance with daily audio diarization or UPI settlement?
                  </p>
                  <a
                    href="https://wa.me/919999999999?text=Hello%20DukandarOS%20Support%20I%20need%20help%20with%20my%20Acoustic%20Khata"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
                  >
                    <Smartphone size={14} />
                    <span>WhatsApp Support (+91)</span>
                  </a>
                  <div className="border-t border-white/[0.08] pt-2">
                    <label className="text-[10px] font-semibold opacity-70 block mb-1">Quick Stall Note / Bug Report:</label>
                    <textarea
                      rows={2}
                      value={contactFeedback}
                      onChange={(e) => setContactFeedback(e.target.value)}
                      placeholder="e.g. 04:15 PM audio clipping in Ramesh Auto's record..."
                      className={`w-full p-2 text-xs rounded-lg border focus:outline-none focus:border-emerald-500 ${
                        isDarkMode ? 'bg-[#0F1620] border-white/[0.08] text-slate-100' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                    <button
                      onClick={() => {
                        if (!contactFeedback.trim()) return;
                        setContactSubmitted(true);
                        setContactFeedback('');
                      }}
                      className="w-full mt-2 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs cursor-pointer"
                    >
                      Submit Feedback
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* SIMPLE COOKIE & LOCAL STORAGE BANNER                                     */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {showCookieBanner && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={SPRING_TRANSITION}
              className={`fixed bottom-3 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 rounded-2xl border p-4 shadow-2xl backdrop-blur-2xl no-print ${
                isDarkMode ? 'bg-[#0B1017]/95 border-white/[0.1]' : 'bg-white/95 border-slate-300 shadow-slate-300/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500 shrink-0 mt-0.5">
                  <Cookie size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold tracking-tight">
                    Sovereign Local Storage & DPDP Compliance
                  </h4>
                  <p className="text-[11px] opacity-75 leading-relaxed">
                    DukandarOS stores acoustic audio caches, dialect phonetics, and customer ledgers strictly on this device. We do not sell or upload customer voice recordings to public cloud platforms.
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleAcceptCookies('all')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer"
                    >
                      Accept All
                    </button>
                    <button
                      onClick={() => handleAcceptCookies('essential')}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                        isDarkMode ? 'border-white/[0.1] text-slate-300 hover:bg-white/[0.04]' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Essential Only
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* SITE SEARCH MODAL (COMMAND PALETTE Ctrl+K)                                */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-sm no-print"
              onClick={() => setIsSearchOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: -10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: -10 }}
                transition={SPRING_TRANSITION}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${
                  isDarkMode ? 'bg-[#0B1017] border-white/[0.1]' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <div className="p-3.5 border-b border-white/[0.08] flex items-center gap-2.5">
                  <Search size={16} className="text-emerald-500 shrink-0" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search customers, items, quotes, or FAQs... (ESC to close)"
                    value={globalSearchTerm}
                    onChange={(e) => setGlobalSearchTerm(e.target.value)}
                    className="w-full bg-transparent border-none text-xs focus:outline-none font-medium"
                  />
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="p-1 rounded-md opacity-60 hover:opacity-100 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto custom-scrollbar p-3 space-y-3 text-xs">
                  {globalSearchTerm.trim() === '' ? (
                    <div className="py-6 text-center opacity-50 space-y-1">
                      <p>Type to search across DukandarOS</p>
                      <p className="text-[10px] font-mono">Try searching: "Ramesh", "Chai", "Dispute", "DPDP"</p>
                    </div>
                  ) : (
                    <>
                      {/* Customer Results */}
                      {searchResults.customers.length > 0 && (
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-wider opacity-60 mb-1">
                            Customers ({searchResults.customers.length})
                          </div>
                          <div className="space-y-1">
                            {searchResults.customers.map(c => (
                              <div
                                key={c.id}
                                onClick={() => {
                                  setSelectedCustomerId(c.id);
                                  setIsSearchOpen(false);
                                }}
                                className={`p-2 rounded-lg flex items-center justify-between cursor-pointer ${
                                  isDarkMode ? 'hover:bg-white/[0.05]' : 'hover:bg-slate-100'
                                }`}
                              >
                                <span className="font-bold">{c.name}</span>
                                <span className="font-mono text-emerald-500 font-bold">{formatRupee(c.totalBalance)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Stream Results */}
                      {searchResults.items.length > 0 && (
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-wider opacity-60 mb-1">
                            Acoustic Stream Transcripts ({searchResults.items.length})
                          </div>
                          <div className="space-y-1">
                            {searchResults.items.map(s => (
                              <div
                                key={s.id}
                                onClick={() => {
                                  setIsSearchOpen(false);
                                  showToast('Stream Quote', s.quote, 'info');
                                }}
                                className={`p-2 rounded-lg cursor-pointer ${
                                  isDarkMode ? 'hover:bg-white/[0.05]' : 'hover:bg-slate-100'
                                }`}
                              >
                                <div className="font-semibold text-[11px]">{s.speaker} ({s.time})</div>
                                <div className="italic opacity-80 text-[11px]">"{s.quote}"</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* FAQ Results */}
                      {searchResults.faqs.length > 0 && (
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-wider opacity-60 mb-1">
                            FAQ Answers ({searchResults.faqs.length})
                          </div>
                          <div className="space-y-1">
                            {searchResults.faqs.map(f => (
                              <div
                                key={f.id}
                                onClick={() => {
                                  setExpandedFaqId(f.id);
                                  setIsSearchOpen(false);
                                }}
                                className={`p-2 rounded-lg cursor-pointer ${
                                  isDarkMode ? 'hover:bg-white/[0.05]' : 'hover:bg-slate-100'
                                }`}
                              >
                                <div className="font-bold text-[11px] text-emerald-500">{f.question}</div>
                                <div className="opacity-80 text-[10px] line-clamp-1">{f.answer}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {searchResults.customers.length === 0 && searchResults.items.length === 0 && searchResults.faqs.length === 0 && (
                        <div className="py-6 text-center opacity-50">
                          No matching records found for "{globalSearchTerm}".
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* REUSABLE CONFIRMATION MODAL                                              */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {confirmationModal.isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm no-print"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                transition={SPRING_TRANSITION}
                className={`max-w-md w-full rounded-2xl border p-5 shadow-2xl space-y-3.5 ${
                  isDarkMode ? 'bg-[#0B1017] border-white/[0.1] text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 text-amber-500">
                  <AlertCircle size={20} />
                  <h3 className="text-sm font-bold tracking-tight">{confirmationModal.title}</h3>
                </div>

                <p className="text-xs opacity-80 leading-relaxed">
                  {confirmationModal.message}
                </p>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setConfirmationModal({ isOpen: false, title: '', message: '', onConfirm: null })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      isDarkMode ? 'bg-[#0F1620] hover:bg-slate-800 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmationModal.onConfirm}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 cursor-pointer"
                  >
                    {confirmationModal.confirmText}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* UPI QR & SETTLEMENT MODAL WITH PIN VISIBILITY TOGGLE                      */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {isSettlementModalOpen && settlementTargetCust && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md no-print"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                transition={SPRING_TRANSITION}
                className={`max-w-md w-full rounded-2xl border p-5 shadow-2xl space-y-4 ${
                  isDarkMode ? 'bg-[#0B1017] border-white/[0.1]' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between border-b pb-2.5 border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <QrCode size={16} className="text-emerald-500" />
                    <h3 className="text-sm font-bold tracking-tight">
                      Vasooli Copilot — Instant Settlement
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsSettlementModalOpen(false)}
                    className="p-1 rounded-md opacity-60 hover:opacity-100 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Form feedback states */}
                {formErrorMessage && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-shake">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{formErrorMessage}</span>
                  </div>
                )}
                {formSuccessMessage && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>{formSuccessMessage}</span>
                  </div>
                )}

                <div className="text-center space-y-1">
                  <div className="text-xs opacity-70">Settling closing due for:</div>
                  <div className="text-base font-extrabold">{settlementTargetCust.name}</div>
                  <div className="text-3xl font-black font-mono text-emerald-500">
                    {formatRupee(settlementTargetCust.totalBalance)}
                  </div>
                </div>

                {/* Simulated UPI QR Code */}
                <div className="p-3 bg-white rounded-xl max-w-[160px] mx-auto shadow-md">
                  <div className="aspect-square bg-slate-950 flex flex-col items-center justify-center text-white rounded p-2 text-center">
                    <QrCode size={90} className="text-white" />
                    <span className="text-[8px] font-mono mt-1 text-slate-300">Scan via GPay / PhonePe</span>
                  </div>
                </div>

                {/* Security PIN with Visibility Toggle */}
                <div className="space-y-1 text-xs">
                  <label className="font-semibold opacity-70 flex items-center justify-between">
                    <span>Shopkeeper Authorization PIN (Demo: 1234):</span>
                    <span className="text-[10px] font-mono opacity-50">Optional</span>
                  </label>
                  <div className={`flex items-center px-2.5 py-1.5 rounded-lg border ${
                    isDarkMode ? 'bg-[#0F1620] border-white/[0.08]' : 'bg-slate-100 border-slate-300'
                  }`}>
                    <Lock size={12} className="opacity-50 mr-2" />
                    <input
                      type={showPin ? "text" : "password"}
                      value={shopkeeperPin}
                      onChange={(e) => setShopkeeperPin(e.target.value)}
                      placeholder="Enter 4-digit PIN..."
                      className="w-full bg-transparent border-none text-xs focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(prev => !prev)}
                      className="p-1 opacity-60 hover:opacity-100 cursor-pointer"
                      title={showPin ? "Hide PIN" : "Show PIN"}
                    >
                      {showPin ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      const waText = `Namaste ${settlementTargetCust.name}, Sharma Tea Stall par aapka closing khata balance ${formatRupee(settlementTargetCust.totalBalance)} hai. Kripya UPI se settle karein. Dhanyawad!`;
                      window.open(`https://wa.me/91${settlementTargetCust.phone.split(' ')[0]}?text=${encodeURIComponent(waText)}`, '_blank');
                    }}
                    className={`flex-1 py-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                      isDarkMode ? 'bg-[#0F1620] border-white/[0.08] hover:bg-slate-800' : 'bg-slate-100 border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <Share2 size={13} />
                    <span>WhatsApp Reminder</span>
                  </button>

                  <button
                    onClick={handleInitiateSettle}
                    className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 size={13} />
                    <span>Confirm Received</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* ADD CUSTOMER MODAL WITH SUCCESS & ERROR VALIDATION                        */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {isManualModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md no-print"
            >
              <motion.div
                initial={{ scale: 0.96, y: 16 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, y: 16 }}
                transition={SPRING_TRANSITION}
                className={`max-w-md w-full rounded-2xl border p-5 shadow-2xl space-y-3.5 ${
                  isDarkMode ? 'bg-[#0B1017] border-white/[0.1]' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between border-b pb-2.5 border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Plus size={14} className="text-emerald-500" />
                    <h3 className="text-sm font-bold tracking-tight">Add Customer / Manual Credit</h3>
                  </div>
                  <button
                    onClick={() => setIsManualModalOpen(false)}
                    className="p-1 rounded-md opacity-60 hover:opacity-100 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </div>

                {formErrorMessage && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-shake">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{formErrorMessage}</span>
                  </div>
                )}
                {formSuccessMessage && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>{formSuccessMessage}</span>
                  </div>
                )}

                <form onSubmit={handleAddManualCustomer} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold block mb-1 opacity-80">Customer / Stall Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Auto / Flat 401"
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded-lg border focus:outline-none focus:border-emerald-500 font-medium ${
                        isDarkMode ? 'bg-[#0F1620] border-white/[0.08] text-slate-100' : 'bg-slate-100 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 opacity-80">Mobile Tag (Synthetic)</label>
                    <input
                      type="text"
                      placeholder="98XXXXXX99 • Synthetic"
                      value={newCustPhone}
                      onChange={(e) => setNewCustPhone(e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded-lg border focus:outline-none focus:border-emerald-500 font-mono tabular-nums ${
                        isDarkMode ? 'bg-[#0F1620] border-white/[0.08] text-slate-100' : 'bg-slate-100 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="font-semibold block mb-1 opacity-80">Old Carry-Forward (₹)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={newCustOldBal}
                        onChange={(e) => setNewCustOldBal(e.target.value)}
                        className={`w-full px-2.5 py-1.5 rounded-lg border focus:outline-none focus:border-emerald-500 font-mono tabular-nums ${
                          isDarkMode ? 'bg-[#0F1620] border-white/[0.08] text-slate-100' : 'bg-slate-100 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1 opacity-80">+ Today's Credit (₹)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={newCustAddToday}
                        onChange={(e) => setNewCustAddToday(e.target.value)}
                        className={`w-full px-2.5 py-1.5 rounded-lg border focus:outline-none focus:border-emerald-500 font-mono tabular-nums text-amber-500 ${
                          isDarkMode ? 'bg-[#0F1620] border-white/[0.08]' : 'bg-slate-100 border-slate-300'
                        }`}
                      />
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-lg border font-mono tabular-nums text-xs flex justify-between items-center ${
                    isDarkMode ? 'bg-[#0F1620] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="opacity-75">Resulting Closing Balance:</span>
                    <strong className="text-emerald-500 font-bold text-sm">
                      {formatRupee((parseFloat(newCustOldBal) || 0) + (parseFloat(newCustAddToday) || 0))}
                    </strong>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsManualModalOpen(false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                        isDarkMode ? 'bg-[#0F1620] hover:bg-slate-800 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 cursor-pointer"
                    >
                      Save Customer Entry
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* 3-STAGE BATCH AI PIPELINE STEPPER OVERLAY                                 */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {isBatchPipelineActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg no-print"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                transition={SPRING_TRANSITION}
                className={`max-w-lg w-full rounded-2xl border p-5 shadow-2xl space-y-4 ${
                  isDarkMode ? 'bg-[#0B1017] border-white/[0.1]' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between border-b pb-3 border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Cpu size={16} className="text-emerald-500 animate-spin" />
                    <h3 className="text-sm font-bold tracking-tight">
                      Sovereign Batch AI Stepper (End-of-Day)
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-500 font-bold">
                    {pipelineProgress}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${pipelineProgress}%` }}
                  />
                </div>

                {/* 3 Stepper Modules */}
                <div className="grid grid-cols-3 gap-2">
                  <div className={`p-2.5 rounded-xl border text-center transition-all ${
                    pipelineStage >= 1 ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'opacity-40 border-slate-700'
                  }`}>
                    <div className="text-[11px] font-bold">Prisma v2.5</div>
                    <div className="text-[10px] opacity-70">Acoustic NER</div>
                  </div>
                  <div className={`p-2.5 rounded-xl border text-center transition-all ${
                    pipelineStage >= 2 ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'opacity-40 border-slate-700'
                  }`}>
                    <div className="text-[11px] font-bold">Evon v3.3</div>
                    <div className="text-[10px] opacity-70">Chatter Filter</div>
                  </div>
                  <div className={`p-2.5 rounded-xl border text-center transition-all ${
                    pipelineStage >= 3 ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'opacity-40 border-slate-700'
                  }`}>
                    <div className="text-[11px] font-bold">Timbre v3.0</div>
                    <div className="text-[10px] opacity-70">Phonetic Lock</div>
                  </div>
                </div>

                {/* Terminal logs */}
                <div className="p-3 rounded-xl bg-black font-mono text-[10px] text-emerald-400 max-h-36 overflow-y-auto custom-scrollbar space-y-1 border border-white/[0.08]">
                  {pipelineLogs.map((log, i) => (
                    <div key={i} className="flex gap-1.5">
                      <span className="opacity-40">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>

                {pipelineProgress === 100 && (
                  <button
                    onClick={closeBatchPipeline}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 cursor-pointer"
                  >
                    Done & View Updated Ledgers
                  </button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
