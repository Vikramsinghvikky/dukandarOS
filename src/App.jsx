import React, { useState, useEffect, useMemo } from 'react';
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
  Sparkles, 
  Cpu, 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  PlusCircle,
  ChevronRight, 
  ChevronDown, 
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
  ArrowUpRight
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

  text = text.replace(/Shop\s*(\d+)/gi, (match, digits) => {
    const words = convertNumberToPhoneticHindi(digits);
    return `Shop ${words}`;
  });

  text = text.replace(/\b(\d+)\s*(chai|samosa|cutting|roti|dosa|tea)\b/gi, (match, digits, item) => {
    const words = convertNumberToPhoneticHindi(digits);
    return `${words} ${item}`;
  });

  return text;
}

// Strict Tabular Rupee Currency Formatter
const formatRupee = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

// Subtle Web Audio Chime Generator
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
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'lock') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      osc.frequency.setValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc.start(now);
      osc.stop(now + 0.32);
    } else if (type === 'call') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch (e) {
    // Autoplay policy safe fallback
  }
}

// Synthetic Dataset adhering strictly to No-PII rules
const INITIAL_CUSTOMERS = [
  {
    id: 'CUST-101',
    name: 'Ramesh Auto',
    phone: '98XXXXXX01 • Synthetic',
    avatar: 'RA',
    interactionsCount: 4,
    oldBalance: 180,
    todayNewBalance: 200,
    totalBalance: 380,
    lastTransactionTime: '04:15 PM',
    isFlaggedDispute: true,
    disputeHistory: [
      {
        id: 'disp_101',
        timestamp: '04:15 PM',
        items: '3x Chai, 2x Samosa',
        amount: 80,
        paymentType: 'Udhari',
        verbatimVoiceQuote: "Ramesh: 'Bhaiya Ramesh bol raha, yeh 80 rupaye khata mein daal dena, kal auto chalake aate waqt de dunga.'",
        rawEvonText: "Ramesh auto udhari Rs 80 for 3 chai and 2 samosa logged at 04:15 PM",
        confidence: 98.6,
        sourceTag: 'PRISMA_BATCH',
        status: 'Unresolved'
      },
      {
        id: 'disp_102',
        timestamp: '11:30 AM',
        items: '4x Special Tea, Bun Maska',
        amount: 120,
        paymentType: 'Udhari',
        verbatimVoiceQuote: "Ramesh: 'Bhaiya subah ka 120 likh lo khata mein, shaam ko chukta karenge.'",
        rawEvonText: "Ramesh auto morning udhari Rs 120 for 4 tea and bun maska",
        confidence: 97.4,
        sourceTag: 'PRISMA_BATCH',
        status: 'Unresolved'
      }
    ]
  },
  {
    id: 'CUST-102',
    name: 'Karthik Flat 302',
    phone: '97XXXXXX02 • Synthetic',
    avatar: 'KF',
    interactionsCount: 3,
    oldBalance: 250,
    todayNewBalance: 150,
    totalBalance: 400,
    lastTransactionTime: '04:22 PM',
    isFlaggedDispute: false,
    disputeHistory: [
      {
        id: 'disp_201',
        timestamp: '04:22 PM',
        items: '2x Amul Milk, 1x Brown Bread',
        amount: 150,
        paymentType: 'Udhari',
        verbatimVoiceQuote: "Karthik: 'Bhaiya Flat 302 ka khata mein 150 likh do, Amul milk aur bread ka.'",
        rawEvonText: "Flat 302 Karthik udhari Rs 150 for milk and bread at 04:22 PM",
        confidence: 99.1,
        sourceTag: 'PRISMA_BATCH',
        status: 'Verified'
      }
    ]
  },
  {
    id: 'CUST-103',
    name: 'Suresh Presswala',
    phone: '94XXXXXX03 • Synthetic',
    avatar: 'SP',
    interactionsCount: 2,
    oldBalance: 70,
    todayNewBalance: 90,
    totalBalance: 160,
    lastTransactionTime: '03:45 PM',
    isFlaggedDispute: false,
    disputeHistory: [
      {
        id: 'disp_301',
        timestamp: '03:45 PM',
        items: '2x Masala Chai, 1x Cigarette Pack',
        amount: 90,
        paymentType: 'Udhari',
        verbatimVoiceQuote: "Suresh: 'Bhaiya Suresh presswala, dopahar ka 90 rupaye khata mein chada do.'",
        rawEvonText: "Suresh presswala udhari Rs 90 logged at 03:45 PM",
        confidence: 96.8,
        sourceTag: 'PRISMA_BATCH',
        status: 'Verified'
      }
    ]
  },
  {
    id: 'CUST-104',
    name: 'Anita Tailors',
    phone: '96XXXXXX04 • Synthetic',
    avatar: 'AT',
    interactionsCount: 3,
    oldBalance: 0,
    todayNewBalance: 120,
    totalBalance: 120,
    lastTransactionTime: '05:05 PM',
    isFlaggedDispute: false,
    disputeHistory: [
      {
        id: 'disp_401',
        timestamp: '05:05 PM',
        items: '4x Ginger Tea, 2x Khari Biscuit',
        amount: 120,
        paymentType: 'Udhari',
        verbatimVoiceQuote: "Anita: 'Bhaiya sham ka 4 chai aur biscuit ka 120 khata note karna.'",
        rawEvonText: "Anita tailors udhari Rs 120 recorded at 05:05 PM",
        confidence: 98.2,
        sourceTag: 'PRISMA_BATCH',
        status: 'Verified'
      }
    ]
  },
  {
    id: 'CUST-105',
    name: 'Mahesh Carpenter',
    phone: '98XXXXXX05 • Synthetic',
    avatar: 'MC',
    interactionsCount: 1,
    oldBalance: 0,
    todayNewBalance: 30,
    totalBalance: 30,
    lastTransactionTime: '02:10 PM',
    isFlaggedDispute: false,
    disputeHistory: [
      {
        id: 'disp_501',
        timestamp: '02:10 PM',
        items: '2x Special Chai',
        amount: 30,
        paymentType: 'Udhari',
        verbatimVoiceQuote: "Mahesh: 'Bhaiya do special chai 30 rupaye khata mein.'",
        rawEvonText: "Mahesh carpenter udhari Rs 30 recorded at 02:10 PM",
        confidence: 97.5,
        sourceTag: 'PRISMA_BATCH',
        status: 'Verified'
      }
    ]
  },
  {
    id: 'CUST-106',
    name: 'Pooja Xerox',
    phone: '94XXXXXX06 • Synthetic',
    avatar: 'PX',
    interactionsCount: 1,
    oldBalance: 0,
    todayNewBalance: 20,
    totalBalance: 20,
    lastTransactionTime: '01:30 PM',
    isFlaggedDispute: false,
    disputeHistory: [
      {
        id: 'disp_601',
        timestamp: '01:30 PM',
        items: '1x Cutting Chai',
        amount: 20,
        paymentType: 'Udhari',
        verbatimVoiceQuote: "Pooja: 'Ek cutting chai 20 rupaye khata mein.'",
        rawEvonText: "Pooja xerox udhari Rs 20 recorded at 01:30 PM",
        confidence: 99.4,
        sourceTag: 'PRISMA_BATCH',
        status: 'Verified'
      }
    ]
  }
];

// Interactive Timeline Events (Feature 2)
const TIMELINE_EVENTS = [
  {
    id: 'tl_1',
    time: '09:10 AM',
    percent: 12,
    customerId: 'CUST-102',
    label: 'Karthik Flat 302',
    amount: 200,
    type: 'UDHARI',
    note: '+₹200 Udhari milk & groceries'
  },
  {
    id: 'tl_2',
    time: '10:05 AM',
    percent: 24,
    customerId: null,
    label: 'Street Gossip Filtered',
    amount: 0,
    type: 'CHATTER',
    note: 'Weather banter pruned (IGNORE_CHATTER)'
  },
  {
    id: 'tl_3',
    time: '01:20 PM',
    percent: 46,
    customerId: 'CUST-102',
    label: 'Karthik Meals Parcel',
    amount: 210,
    type: 'UDHARI',
    note: '+₹210 Udhari afternoon lunch pack'
  },
  {
    id: 'tl_4',
    time: '02:40 PM',
    percent: 58,
    customerId: 'CUST-101',
    label: 'Personal Call Shield',
    amount: 15,
    type: 'CALL_SHIELD',
    note: '15s RAM buffer + Thumb nod (+₹15)'
  },
  {
    id: 'tl_5',
    time: '04:15 PM',
    percent: 72,
    customerId: 'CUST-101',
    label: 'Ramesh Auto Chai+Samosa',
    amount: 80,
    type: 'UDHARI',
    note: '+₹80 Udhari logged at counter'
  },
  {
    id: 'tl_6',
    time: '06:10 PM',
    percent: 88,
    customerId: null,
    label: 'Low Stock Mutter',
    amount: 0,
    type: 'INVENTORY',
    note: 'Vendor: Nandini Milk & Tea Dust Low'
  }
];

// Single-Theme Recharts Hourly Store Activity (Feature 6)
const HOURLY_CHART_DATA = [
  { hour: '08 AM', settled: 420, udhari: 120 },
  { hour: '10 AM', settled: 850, udhari: 200 },
  { hour: '12 PM', settled: 1420, udhari: 180 },
  { hour: '02 PM', settled: 980, udhari: 240 },
  { hour: '04 PM', settled: 1650, udhari: 380 },
  { hour: '06 PM', settled: 1850, udhari: 210 },
  { hour: '08 PM', settled: 1220, udhari: 90 },
];

const INITIAL_DAY_STREAM = [
  {
    id: 'stream_1',
    time: '04:15 PM',
    speaker: 'Speaker_1 (Ramesh Auto)',
    dB: 74,
    type: 'UDHARI_RECORDED',
    quote: "Bhaiya Ramesh bol raha, yeh 80 rupaye khata mein daal dena.",
    metadata: "Extracted via Gnani Prisma v2.5 Indian NER -> Tagged to Ramesh Auto",
    confidence: 98.6
  },
  {
    id: 'stream_2',
    time: '04:18 PM',
    speaker: 'Speaker_3 (Pedestrian)',
    dB: 78,
    type: 'IGNORE_CHATTER',
    quote: "Arre aaj Bengaluru mein baarish tez hogi lagta hai, traffic jam pakka...",
    metadata: "Filtered by Evon v3.3: Street gossip / non-financial chit-chat discarded",
    confidence: 99.2
  },
  {
    id: 'stream_3',
    time: '04:22 PM',
    speaker: 'Speaker_2 (Karthik Flat 302)',
    dB: 72,
    type: 'UDHARI_RECORDED',
    quote: "Flat 302 mein 150 rupaye likh do milk aur bread ka.",
    metadata: "Extracted: Flat 302 | ₹150 | Entity: Karthik",
    confidence: 99.1
  },
  {
    id: 'stream_4',
    time: '04:30 PM',
    speaker: 'Speaker_0 (Shopkeeper)',
    dB: 76,
    type: 'CASH_SETTLED',
    quote: "Yeh lo 20 rupaye ka chutta, payment done.",
    metadata: "Settled: ₹50 Cash direct in drawer counter",
    confidence: 97.8
  },
  {
    id: 'stream_5',
    time: '04:45 PM',
    speaker: 'Speaker_4 (Bystander)',
    dB: 82,
    type: 'IGNORE_CHATTER',
    quote: "India match jeet gayi kal raat ko! Last over mein 12 run chahiye the...",
    metadata: "Filtered by Evon v3.3: Cricket banter discarded",
    confidence: 99.5
  },
  {
    id: 'stream_6',
    time: '05:10 PM',
    speaker: 'Speaker_5 (Soundbox IoT)',
    dB: 75,
    type: 'UPI_VERIFIED',
    quote: "Soundbox: 'PhonePe par 120 rupaye prapt hue.'",
    metadata: "UPI Audio Ack matched with QR payment hash #7890",
    confidence: 99.9
  },
  {
    id: 'stream_7',
    time: '05:35 PM',
    speaker: 'RAM Ring Buffer (Call Shield)',
    dB: 71,
    type: 'CALL_BUFFER_LOCKED',
    quote: "Bhaiya ek chai Ramesh ke khata mein likh dena (Thumb nod confirmed)",
    metadata: "Asymmetric Context Link via Evon v3.3: 15s RAM snapshot anchored",
    confidence: 98.9
  }
];

export default function App() {
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

  // Trigger Subtle Emerald Confetti blast
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

  const stopVoiceProof = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingPhonetic(false);
    setPlayingDisputeId(null);
  };

  // Feature 4: Open Settlement Modal
  const handleOpenSettlement = (cust) => {
    setSettlementTargetCust(cust);
    setIsSettlementModalOpen(true);
    playAudioChime('ping');
  };

  // Feature 4: Confirm Full Settlement
  const handleConfirmSettlement = (mode = 'UPI') => {
    if (!settlementTargetCust) return;
    const settleAmt = settlementTargetCust.totalBalance;
    if (settleAmt <= 0) {
      showToast('Zero Balance', 'Customer has no outstanding debt to settle.', 'warning');
      setIsSettlementModalOpen(false);
      return;
    }

    playAudioChime('lock');

    if (mode === 'UPI') {
      setSettledUpi(prev => prev + settleAmt);
    } else {
      setSettledCash(prev => prev + settleAmt);
    }

    setCustomers(prev => prev.map(c => {
      if (c.id === settlementTargetCust.id) {
        return {
          ...c,
          oldBalance: 0,
          todayNewBalance: 0,
          totalBalance: 0,
          lastTransactionTime: 'Just Now',
          isFlaggedDispute: false,
          disputeHistory: [
            {
              id: `settle_${Date.now()}`,
              timestamp: 'Just Now',
              items: `Settled in Full (${mode})`,
              amount: settleAmt,
              paymentType: mode,
              verbatimVoiceQuote: `${c.name}: 'Pura hisaab ${formatRupee(settleAmt)} ${mode} se chukta ho gaya'`,
              rawEvonText: `Full balance of Rs ${settleAmt} cleared via ${mode}`,
              confidence: 100,
              sourceTag: 'SETTLED_IN_FULL',
              status: 'Settled & Verified'
            },
            ...c.disputeHistory
          ]
        };
      }
      return c;
    }));

    const settleStreamItem = {
      id: `stream_settle_${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      speaker: `Payment Soundbox (${mode})`,
      dB: 72,
      type: mode === 'UPI' ? 'UPI_VERIFIED' : 'CASH_SETTLED',
      quote: `Payment Verified: ${formatRupee(settleAmt)} received from ${settlementTargetCust.name}. Khata balance zeroed.`,
      metadata: `Vasooli Engine: Instant Settlement via ${mode} logged successfully`,
      confidence: 100
    };
    setStreamLogs(prev => [settleStreamItem, ...prev]);

    setHighlightedRowId(settlementTargetCust.id);
    setTimeout(() => setHighlightedRowId(null), 3000);

    setIsSettlementModalOpen(false);
    fireConfetti();
    showToast(
      'Settlement Successful!',
      `${formatRupee(settleAmt)} collected from ${settlementTargetCust.name} via ${mode}. Khata cleared.`,
      'success'
    );

    fetch(`${API_BASE}/api/settle-balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: settlementTargetCust.id,
        amount: settleAmt,
        paymentType: mode
      })
    }).catch(() => {});
  };

  // Feature 6: Broadcast Wholesaler Order
  const handleBroadcastWholesaleOrder = () => {
    setIsBroadcastingWholesale(true);
    playAudioChime('ping');

    setTimeout(() => {
      setIsBroadcastingWholesale(false);
      playAudioChime('lock');
      fireConfetti();
      showToast(
        'Wholesaler Order Sent',
        'Voice Note dispatched: 20x Nandini Milk, 5kg Assam Tea, 10L Refined Oil.',
        'success'
      );
    }, 1600);
  };

  // Feature 7: One-Tap Nod Action (Call Shield)
  const handleCallShieldOneTap = (itemName, amount) => {
    playAudioChime('lock');
    const targetCust = customers.find(c => c.id === callShieldCustomer);
    if (!targetCust) return;

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

    fetch(`${API_BASE}/api/add-interrupt-note`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: targetCust.id,
        item: itemName,
        amount: amount,
        timestamp: timeStamp
      })
    }).catch(() => {});
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
    }, 5200);
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
    if (!newCustName.trim()) return;

    const oldBal = parseFloat(newCustOldBal) || 0;
    const todayAdd = parseFloat(newCustAddToday) || 0;
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

    setCustomers(prev => [newCustomerObj, ...prev]);
    setSelectedCustomerId(newId);
    setIsManualModalOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustOldBal('');
    setNewCustAddToday('');

    fireConfetti();
    playAudioChime('lock');
    showToast('Customer Added', `${newCustomerObj.name} added with Total Due ${formatRupee(total)}`, 'success');
  };

  // Resolve single dispute item
  const handleResolveDisputeItem = (disputeId) => {
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

    fetch(`${API_BASE}/api/resolve-dispute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disputeId, customerId: selectedCustomerId })
    }).catch(() => {});
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

  // Filtered diarized stream logs
  const filteredStreamLogs = useMemo(() => {
    return streamLogs.filter(s => {
      if (streamFilter === 'UDHARI') return s.type === 'UDHARI_RECORDED' || s.type === 'CALL_BUFFER_LOCKED';
      if (streamFilter === 'CHATTER') return s.type === 'IGNORE_CHATTER';
      if (streamFilter === 'UPI_CASH') return s.type === 'CASH_SETTLED' || s.type === 'UPI_VERIFIED';
      return true;
    });
  }, [streamLogs, streamFilter]);

  return (
    <div className={`min-h-screen bg-[#06090E] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200 pb-28 relative overflow-x-hidden ${
      isCallActive ? 'screen-call-shield-active' : ''
    }`}>
      
      {/* Unified Ambient Top-Center Glow (Subtle Sovereign Emerald) */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/[0.06] blur-[140px] pointer-events-none z-0" />

      {/* Screen Perimeter Glow during active Call Shield */}
      {isCallActive && (
        <div className="fixed inset-0 pointer-events-none z-50 border-2 border-amber-500/40 animate-pulse" />
      )}

      {/* Floating Dynamic Micro Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={SPRING_TRANSITION}
            className={`fixed top-4 right-5 z-50 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border backdrop-blur-2xl shadow-xl ${
              toastMessage.type === 'success' 
                ? 'bg-[#0B1017]/95 border-emerald-500/30 text-emerald-200' 
                : 'bg-[#0B1017]/95 border-amber-500/30 text-amber-200'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 size={13} strokeWidth={1.75} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle size={13} strokeWidth={1.75} className="text-amber-400 shrink-0" />
            )}
            <div>
              <div className="font-semibold text-xs tracking-tight text-slate-100">{toastMessage.title}</div>
              <div className="text-[11px] text-slate-400">{toastMessage.subtitle}</div>
            </div>
            <button 
              onClick={() => setToastMessage(null)}
              className="ml-1 p-1 hover:bg-white/[0.06] rounded-md text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={12} strokeWidth={1.75} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 py-4 space-y-4">

        {/* ========================================================================= */}
        {/* ZONE 1: STICKY OBSIDIAN HEADER (py-3 px-5)                                */}
        {/* ========================================================================= */}
        <header className="sticky top-2.5 z-30 rounded-2xl bg-[#0B1017]/85 backdrop-blur-xl border border-white/[0.07] hover:border-emerald-500/30 shadow-2xl py-3 px-5 flex flex-wrap items-center justify-between gap-3.5 transition-colors">
          
          {/* Left Brand + Radio Micro-Mark + Sovereign AI Badges */}
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
              <Radio size={15} strokeWidth={1.75} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-white">
                  Dukandar<span className="text-emerald-400">OS</span>
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.07em] bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 rounded-md">
                  <Sparkles size={11} strokeWidth={1.75} />
                  <span>Sovereign AI for India</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span>Acoustic Khata & Dispute Copilot</span>
                <span className="inline-block w-1 h-1 rounded-full bg-slate-600" />
                <span className="font-mono text-[10px] text-emerald-400">Gnani Ecosystem</span>
              </p>
            </div>
          </div>

          {/* Center: Street Noise Stress-Tester Slider */}
          <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#0F1620] border border-white/[0.07]">
            <div className="flex items-center gap-1.5 text-slate-300 text-xs font-semibold">
              <Sliders size={13} strokeWidth={1.75} className="text-emerald-400" />
              <span>Street Noise:</span>
            </div>
            <input
              type="range"
              min="55"
              max="92"
              value={noiseSliderDb}
              onChange={(e) => setNoiseSliderDb(parseInt(e.target.value, 10))}
              className="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <span className="font-mono tabular-nums text-xs font-bold text-emerald-400 w-10">
              {noiseSliderDb} dB
            </span>
            <div className="flex items-center gap-1 text-[11px] font-mono tabular-nums border-l border-white/[0.07] pl-2.5 text-slate-400">
              <span>Prisma NER:</span>
              <span className="text-emerald-400 font-bold">{prismaConfidence}%</span>
            </div>
          </div>

          {/* Right Toolbar Actions */}
          <div className="flex items-center gap-2.5 ml-auto flex-wrap">
            
            {/* Backend status micro-pill */}
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono tabular-nums border ${
              backendConnected 
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                : 'bg-white/[0.04] border-white/[0.07] text-slate-400'
            }`}>
              <Server size={12} strokeWidth={1.75} />
              <span>{syncStatusText}</span>
            </div>

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
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 animate-call-shield'
                  : 'bg-[#0F1620] hover:bg-slate-800 border-white/[0.07] text-slate-300 hover:text-white'
              }`}
            >
              {isCallActive ? (
                <>
                  <PhoneIncoming size={13} strokeWidth={1.75} className="text-amber-400 animate-bounce" />
                  <span>Call Shield Active</span>
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
              <span>Stop Day & Analyze</span>
            </motion.button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* ZONE 2: MIC-LESS AUDIO SOURCE BAR & 11.5-HR TIMELINE SCRUBBER             */}
        {/* ========================================================================= */}
        <div className="rounded-2xl bg-[#0B1017]/85 backdrop-blur-xl border border-white/[0.07] hover:border-emerald-500/30 p-3.5 transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-emerald-400">
                <FileAudio size={14} strokeWidth={1.75} />
              </div>
              <span className="text-xs font-bold text-slate-200">11.5-Hour Counter Acoustic Scrubber</span>
              <span className="text-[11px] font-mono tabular-nums text-slate-400">(08:00 AM – 09:30 PM)</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Source:</span>
              <select
                value={selectedAudioSource}
                onChange={(e) => setSelectedAudioSource(e.target.value)}
                className="bg-[#0F1620] border border-white/[0.08] rounded-md px-2.5 py-1 text-xs font-mono text-slate-300 cursor-pointer focus:outline-none focus:border-emerald-500"
              >
                <option value="day_stall_recording_oct31.wav">day_stall_recording_oct31.wav (11.5 hrs)</option>
                <option value="evening_rush_hinglish_kanglish.wav">evening_rush_hinglish_kanglish.wav (4.2 hrs)</option>
                <option value="dispute_verification_clip.wav">dispute_verification_clip.wav (45 mins)</option>
              </select>
            </div>
          </div>

          {/* Timeline Waveform & Clickable Pins */}
          <div className="relative w-full h-12 bg-[#0F1620] rounded-xl border border-white/[0.06] p-2 flex items-center overflow-hidden">
            
            {/* Audio Density Bars */}
            <div className="absolute inset-0 flex items-center justify-between px-3 opacity-25 pointer-events-none">
              {[...Array(64)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-emerald-400 rounded-full"
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
                      ? 'bg-[#0B1017] text-slate-300 border-white/[0.1] hover:border-emerald-500/50'
                      : ev.type === 'CHATTER'
                      ? 'bg-[#0B1017] text-slate-500 border-white/[0.05]'
                      : 'bg-[#0B1017] text-amber-300 border-amber-500/30'
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
              className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 shadow-md pointer-events-none z-20"
              style={{ left: `${scrubberPosition}%` }}
            />
          </div>

          {/* Active Event Preview */}
          {activeTimelinePin && (
            <div className="mt-2 px-3 py-1 rounded-lg bg-[#0F1620] border border-white/[0.06] text-xs font-mono tabular-nums flex items-center justify-between text-slate-300">
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <Clock size={12} strokeWidth={1.75} />
                <span>{TIMELINE_EVENTS.find(e => e.id === activeTimelinePin)?.label}</span>
              </span>
              <span className="text-slate-400">{TIMELINE_EVENTS.find(e => e.id === activeTimelinePin)?.note}</span>
              <span className="text-slate-500 text-[11px]">Scrubbed to {TIMELINE_EVENTS.find(e => e.id === activeTimelinePin)?.time}</span>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* ZONE 3: 4 HERO KPI BENTO CARDS (gap-3.5)                                  */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* Card 1: Today Settled Revenue (Cash + UPI) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_TRANSITION, delay: 0.05 }}
            className="rounded-2xl bg-[#0B1017]/85 backdrop-blur-xl border border-white/[0.07] hover:border-emerald-500/30 p-4 shadow-xl transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-400">
                Today Settled Revenue
              </span>
              <div className="h-6 w-6 rounded-md bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-emerald-400">
                <Wallet size={14} strokeWidth={1.75} />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl font-extrabold font-mono tabular-nums text-emerald-400 tracking-tight">
                {formatRupee(totalSettledToday)}
              </div>
              <div className="mt-2.5 space-y-1.5 border-t border-white/[0.06] pt-2">
                <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden flex">
                  <div 
                    className="h-full bg-emerald-500" 
                    style={{ width: `${(settledCash / totalSettledToday) * 100}%` }} 
                  />
                  <div 
                    className="h-full bg-emerald-400/50" 
                    style={{ width: `${(settledUpi / totalSettledToday) * 100}%` }} 
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-mono tabular-nums text-slate-400">
                  <span>Cash: <strong className="text-slate-200">{formatRupee(settledCash)}</strong></span>
                  <span>UPI: <strong className="text-slate-200">{formatRupee(settledUpi)}</strong></span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Previous Old Udhari Balance */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_TRANSITION, delay: 0.1 }}
            className="rounded-2xl bg-[#0B1017]/85 backdrop-blur-xl border border-white/[0.07] hover:border-emerald-500/30 p-4 shadow-xl transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-400">
                Previous Old Udhari
              </span>
              <div className="h-6 w-6 rounded-md bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-slate-300">
                <History size={14} strokeWidth={1.75} />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl font-extrabold font-mono tabular-nums text-slate-300 tracking-tight">
                {formatRupee(totalOldUdhari)}
              </div>
              <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400 border-t border-white/[0.06] pt-2">
                <span className="font-mono tabular-nums text-slate-500">Carry-forward before opening</span>
                <span className="px-1.5 py-0.2 rounded bg-[#0F1620] text-[10px] text-slate-400 font-mono">
                  Base Debt
                </span>
              </div>
            </div>
          </motion.div>

          {/* Card 3: + Today's New Udhari Added (Muted Gold Amber) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_TRANSITION, delay: 0.15 }}
            className="rounded-2xl bg-[#0B1017]/85 backdrop-blur-xl border border-amber-500/25 p-4 shadow-xl transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-400">
                + Today's New Udhari
              </span>
              <div className="h-6 w-6 rounded-md bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                <TrendingUp size={14} strokeWidth={1.75} />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl font-extrabold font-mono tabular-nums text-amber-400 tracking-tight flex items-center gap-1">
                <span>+</span>
                <span>{formatRupee(totalTodayNewUdhari)}</span>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 text-xs text-amber-400/90 border-t border-white/[0.06] pt-2">
                <Sparkles size={12} strokeWidth={1.75} className="text-amber-400 shrink-0" />
                <span>Extracted from today's audio log</span>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Total Closing Udhari Due (Old + New) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_TRANSITION, delay: 0.2 }}
            className="rounded-2xl bg-[#0B1017]/85 backdrop-blur-xl border border-emerald-500/30 p-4 shadow-xl transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-emerald-400">
                Total Closing Due
              </span>
              <div className="h-6 w-6 rounded-md bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <Calculator size={14} strokeWidth={1.75} />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl font-extrabold font-mono tabular-nums text-white tracking-tight">
                {formatRupee(totalClosingUdhariDue)}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs font-mono tabular-nums border-t border-white/[0.06] pt-2 text-slate-300">
                <span className="text-[10px] text-slate-400">Equation:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/20 text-[11px]">
                  {formatRupee(totalOldUdhari)} + {formatRupee(totalTodayNewUdhari)} = {formatRupee(totalClosingUdhariDue)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ========================================================================= */}
        {/* ZONE 4: MAIN 12-COLUMN ASYMMETRIC WORKSPACE (gap-5)                       */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* ----------------------------------------------------------------------- */}
          {/* LEFT 7 COLUMNS: Customer Khata Ledger + Diarized Feed + Recharts       */}
          {/* ----------------------------------------------------------------------- */}
          <div className="lg:col-span-7 space-y-4">

            {/* CUSTOMER KHATA LEDGER TABLE */}
            <div className="rounded-2xl bg-[#0B1017]/85 backdrop-blur-xl border border-white/[0.07] hover:border-emerald-500/30 shadow-2xl overflow-hidden transition-colors">
              
              {/* Table Command Bar */}
              <div className="p-4 border-b border-white/[0.07] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-6 w-6 rounded-md bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-emerald-400">
                    <FileText size={14} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-100 tracking-tight">Customer Khata Ledger</h2>
                    <p className="text-[11px] text-slate-400">Equation: Old Balance + Today's New = Total Due</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto flex-wrap">
                  {/* Search Input */}
                  <div className="relative">
                    <Search size={13} strokeWidth={1.75} className="text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search customer, ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-36 sm:w-44 pl-7 pr-2.5 py-1 bg-[#0F1620] border border-white/[0.08] rounded-md text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 text-xs">
                    {[
                      { id: 'ALL', label: 'All' },
                      { id: 'HIGH_UDHARI', label: 'Udhari' },
                      { id: 'CALL_SHIELD', label: 'Call Shield' }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setFilterType(f.id)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                          filterType === f.id
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold'
                            : 'bg-[#0F1620] text-slate-400 hover:text-white border border-white/[0.04]'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Add Customer Manual */}
                  <button
                    onClick={() => setIsManualModalOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Plus size={13} strokeWidth={1.75} />
                    <span>Add Manual</span>
                  </button>
                </div>
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-[#0F1620]/60 text-[10px] font-semibold uppercase tracking-[0.07em] text-slate-400">
                      <th className="py-2.5 px-4">Customer Profile</th>
                      <th className="py-2.5 px-3 text-right">Old Balance</th>
                      <th className="py-2.5 px-3 text-right">+ Today's New</th>
                      <th className="py-2.5 px-3 text-right">= Total Due</th>
                      <th className="py-2.5 px-4 text-center">Settlement & Dispute Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-xs">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-500">
                          No matching customer accounts found.
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((cust) => {
                        const isSelected = cust.id === selectedCustomerId;
                        const isHighlighted = cust.id === highlightedRowId;

                        return (
                          <motion.tr
                            key={cust.id}
                            onClick={() => setSelectedCustomerId(cust.id)}
                            animate={isHighlighted ? { backgroundColor: ['rgba(245,158,11,0.2)', 'rgba(16,185,129,0.15)', 'rgba(11,16,23,0.85)'] } : {}}
                            transition={{ duration: 1.2 }}
                            className={`cursor-pointer transition-colors duration-150 group ${
                              isSelected
                                ? 'bg-emerald-500/10 hover:bg-emerald-500/15 border-l-2 border-l-emerald-500'
                                : 'hover:bg-[#0F1620]/60'
                            }`}
                          >
                            {/* 1. Customer Profile */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs ${
                                  isSelected
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-[#0F1620] text-slate-300 border border-white/[0.06]'
                                }`}>
                                  {cust.avatar}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-slate-100 group-hover:text-white">
                                      {cust.name}
                                    </span>
                                    <span className="px-1 py-0.2 rounded font-mono text-[9px] bg-slate-800 text-slate-400">
                                      {cust.id}
                                    </span>
                                    {cust.isFlaggedDispute && (
                                      <span className="px-1 py-0.2 rounded text-[9px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/25">
                                        Dispute Flag
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono tabular-nums mt-0.5">
                                    {cust.phone} • {cust.interactionsCount} items • Last: {cust.lastTransactionTime}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* 2. Old Balance (with micro History icon) */}
                            <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-300">
                              <span className="inline-flex items-center gap-1">
                                <History size={11} strokeWidth={1.75} className="text-slate-500" />
                                <span>{formatRupee(cust.oldBalance)}</span>
                              </span>
                            </td>

                            {/* 3. + Today's New Credit (with micro Plus icon) */}
                            <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold">
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/25">
                                <Plus size={11} strokeWidth={1.75} />
                                <span>{formatRupee(cust.todayNewBalance)}</span>
                              </span>
                            </td>

                            {/* 4. = Total Balance Due (with micro IndianRupee icon) */}
                            <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-sm text-slate-100 group-hover:text-emerald-400">
                              <span className="inline-flex items-center gap-0.5">
                                <span>{formatRupee(cust.totalBalance)}</span>
                              </span>
                            </td>

                            {/* 5. Settlement & Dispute Action Buttons */}
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenSettlement(cust);
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold transition-all cursor-pointer"
                                  title="Instant UPI QR & WhatsApp Settlement"
                                >
                                  <QrCode size={12} strokeWidth={1.75} />
                                  <span>Settle</span>
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCustomerId(cust.id);
                                  }}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all ${
                                    isSelected
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : 'bg-[#0F1620] hover:bg-slate-800 text-slate-300 hover:text-white border border-white/[0.06]'
                                  }`}
                                >
                                  <Volume2 size={12} strokeWidth={1.75} />
                                  <span>Proof</span>
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="p-2.5 bg-[#0F1620]/60 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400 font-mono tabular-nums">
                <span>Displaying {filteredCustomers.length} active customer accounts</span>
                <span className="text-emerald-400 font-bold">
                  Closing Total: {formatRupee(totalClosingUdhariDue)}
                </span>
              </div>
            </div>

            {/* SINGLE-THEME RECHARTS HOURLY MINI-CHART (Feature 6) */}
            <div className="rounded-2xl bg-[#0B1017]/85 backdrop-blur-xl border border-white/[0.07] hover:border-emerald-500/30 p-4 shadow-xl transition-colors">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-emerald-400">
                    <BarChart3 size={14} strokeWidth={1.75} />
                  </div>
                  <h3 className="text-xs font-bold text-slate-100">Hourly Activity (Settled vs Udhari)</h3>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Settled</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>Udhari</span>
                  </span>
                </div>
              </div>

              <div className="w-full h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={HOURLY_CHART_DATA} margin={{ top: 8, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                    <XAxis dataKey="hour" stroke="#475569" fontSize={10} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0B1017', borderColor: '#ffffff15', borderRadius: '6px', fontSize: '11px' }}
                      formatter={(value) => formatRupee(value)}
                    />
                    <Area type="monotone" dataKey="settled" stroke="#10b981" strokeWidth={1.75} fillOpacity={1} fill="url(#emeraldGrad)" name="Settled" />
                    <Area type="monotone" dataKey="udhari" stroke="#475569" strokeWidth={1.5} fillOpacity={0} name="Udhari Added" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* PRISMA V2.5 DIARIZED DAY STREAM & EVON V3.3 GOSSIP FILTER LOG */}
            <div className="rounded-2xl bg-[#0B1017]/85 backdrop-blur-xl border border-white/[0.07] hover:border-emerald-500/30 p-4 shadow-xl space-y-3 transition-colors">
              
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-emerald-400">
                    <Activity size={14} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      <span>Prisma v2.5 Acoustic Stream & Evon Filter</span>
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs">
                  {[
                    { id: 'ALL', label: 'All' },
                    { id: 'UDHARI', label: 'Udhari' },
                    { id: 'CHATTER', label: 'Filtered Gossip' },
                    { id: 'UPI_CASH', label: 'Cash & UPI' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setStreamFilter(tab.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                        streamFilter === tab.id
                          ? 'bg-[#0F1620] text-emerald-300 font-semibold border border-white/[0.1]'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stream Feed Items */}
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredStreamLogs.map((log) => {
                  const isIgnored = log.type === 'IGNORE_CHATTER';
                  const isUdhari = log.type === 'UDHARI_RECORDED';
                  const isCallLock = log.type === 'CALL_BUFFER_LOCKED';

                  return (
                    <div
                      key={log.id}
                      className={`p-2.5 rounded-lg border text-xs transition-all ${
                        isIgnored
                          ? 'bg-[#06090E]/60 border-white/[0.04] opacity-55'
                          : isCallLock
                          ? 'bg-amber-500/[0.06] border-amber-500/25'
                          : 'bg-[#0F1620] border-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono tabular-nums text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock size={11} strokeWidth={1.75} className="text-slate-500" />
                            <span>{log.time}</span>
                          </span>
                          <span className="font-mono tabular-nums text-[10px] px-1 py-0.2 rounded bg-black/40 text-slate-400">
                            {log.dB} dB
                          </span>
                          <span className="font-semibold text-slate-200 text-[11px]">
                            {log.speaker}
                          </span>
                        </div>

                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold ${
                          isIgnored
                            ? 'bg-slate-800 text-slate-500'
                            : isCallLock
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                        }`}>
                          {log.type}
                        </span>
                      </div>

                      <p className={`mt-1.5 font-sans italic text-[11px] ${isIgnored ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                        "{log.quote}"
                      </p>

                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 font-mono tabular-nums">
                        <span>{log.metadata}</span>
                        <span className="text-slate-500">Confidence: {log.confidence}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* RIGHT 5 COLUMNS: Dispute Vault + Dialect Switcher + Inventory Radar    */}
          {/* ----------------------------------------------------------------------- */}
          <div className="lg:col-span-5 space-y-4">

            {/* NEXT-DAY DISPUTE EVIDENCE VAULT ("Kal Maine Kya Liya Tha?") */}
            <div className="rounded-2xl bg-[#0B1017]/85 backdrop-blur-xl border border-white/[0.07] hover:border-emerald-500/30 p-4 shadow-xl space-y-3.5 transition-colors">
              
              {/* Vault Header */}
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-emerald-400">
                    <ShieldAlert size={14} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-100">Dispute Evidence Vault</h3>
                    <p className="text-[10px] text-slate-400">Next-Day Proof Resolver</p>
                  </div>
                </div>

                <button
                  onClick={() => activeCustomer && handleOpenSettlement(activeCustomer)}
                  className="px-2 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center gap-1 cursor-pointer"
                >
                  <QrCode size={12} strokeWidth={1.75} />
                  <span>Settle {formatRupee(activeCustomer?.totalBalance || 0)}</span>
                </button>
              </div>

              {/* Compact Equation Header */}
              {activeCustomer && (
                <div className="p-3 rounded-xl bg-[#0F1620] border border-white/[0.06]">
                  <div className="text-[10px] font-bold uppercase tracking-[0.07em] text-slate-400 flex items-center justify-between">
                    <span>{activeCustomer.name} Balance Breakdown</span>
                    <span className="text-emerald-400 font-mono">Live Formula</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-1.5 rounded-lg bg-black/40 border border-white/[0.05]">
                      <div className="text-[9px] text-slate-400">Old Balance</div>
                      <div className="font-mono tabular-nums font-bold text-slate-300 mt-0.5">
                        {formatRupee(activeCustomer.oldBalance)}
                      </div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25">
                      <div className="text-[9px] text-amber-300">+ Today's Added</div>
                      <div className="font-mono tabular-nums font-bold text-amber-400 mt-0.5">
                        + {formatRupee(activeCustomer.todayNewBalance)}
                      </div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25">
                      <div className="text-[9px] text-emerald-300">= Total Due</div>
                      <div className="font-mono tabular-nums font-bold text-emerald-400 mt-0.5">
                        {formatRupee(activeCustomer.totalBalance)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Chronological Proof Cards */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                  <span>Timestamped Proof Cards ({activeCustomer?.disputeHistory?.length || 0})</span>
                  <span className="text-[10px] text-slate-500 font-mono">Diarized Audio Clips</span>
                </div>

                {!activeCustomer?.disputeHistory || activeCustomer.disputeHistory.length === 0 ? (
                  <div className="p-5 text-center text-slate-500 text-xs border border-dashed border-white/[0.06] rounded-xl">
                    No dispute or credit records for this customer today.
                  </div>
                ) : (
                  activeCustomer.disputeHistory.map((item) => {
                    const isPlaying = playingDisputeId === item.id;

                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-[#0F1620] border border-white/[0.06] hover:border-emerald-500/30 transition-colors space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 font-mono tabular-nums text-xs">
                            <span className="text-slate-300 font-bold flex items-center gap-1">
                              <Clock size={11} strokeWidth={1.75} className="text-emerald-400" />
                              <span>{item.timestamp}</span>
                            </span>
                            <span className="text-slate-600">|</span>
                            <span className="text-slate-200 font-semibold">{item.items}</span>
                          </div>

                          <div className="font-mono tabular-nums font-bold text-xs text-amber-400">
                            {formatRupee(item.amount)}
                          </div>
                        </div>

                        {/* Verbatim Voice Quote */}
                        <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.05] text-xs space-y-1">
                          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                            <span>VERBATIM DIARIZED VOICE PROOF</span>
                            <span className="text-emerald-400">{item.confidence}% Match</span>
                          </div>
                          <p className="font-sans italic text-slate-200 text-[11px]">
                            "{item.verbatimVoiceQuote}"
                          </p>
                        </div>

                        {/* 10-Bar Micro Audio Equalizer & Play Button */}
                        <div className="flex items-center justify-between gap-2.5 pt-0.5">
                          <div className="flex items-center gap-1 flex-1 h-7 px-2 rounded-lg bg-black/30 border border-white/[0.05]">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                            {[...Array(10)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-0.5 rounded-full transition-all ${
                                  isPlaying 
                                    ? `bg-emerald-400 ${i % 3 === 0 ? 'anim-micro-1' : i % 2 === 0 ? 'anim-micro-3' : 'anim-micro-2'}` 
                                    : 'bg-slate-700 h-1.5'
                                }`}
                                style={{ height: isPlaying ? undefined : `${(i % 3 + 2) * 2.5}px` }}
                              />
                            ))}
                          </div>

                          <button
                            onClick={() => {
                              if (isPlaying) {
                                stopVoiceProof();
                              } else {
                                setPlayingDisputeId(item.id);
                                playVoiceProof(item.verbatimVoiceQuote);
                              }
                            }}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                              isPlaying
                                ? 'bg-amber-500 text-black shadow-sm'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                            }`}
                          >
                            {isPlaying ? (
                              <>
                                <Pause size={12} strokeWidth={1.75} />
                                <span>Playing</span>
                              </>
                            ) : (
                              <>
                                <Play size={12} strokeWidth={1.75} className="fill-current" />
                                <span>Speak Proof</span>
                              </>
                            )}
                          </button>
                        </div>

                        {item.status !== 'Resolved & Acknowledged' ? (
                          <div className="flex justify-end pt-0.5">
                            <button
                              onClick={() => handleResolveDisputeItem(item.id)}
                              className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 size={11} strokeWidth={1.75} />
                              <span>Customer Acknowledged & Settled</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end pt-0.5 text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                            <Check size={11} strokeWidth={1.75} className="text-emerald-400" />
                            <span>Resolved & Archived</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* FEATURE 5: GNANI TIMBRE V3.0 MULTI-LANGUAGE DIALECT SWITCHER */}
            <div className="rounded-2xl bg-[#0B1017]/85 backdrop-blur-xl border border-white/[0.07] hover:border-emerald-500/30 p-4 shadow-xl space-y-3 transition-colors">
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-emerald-400">
                    <Languages size={14} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-100">Timbre v3.0 Dialect Normalizer</h3>
                  </div>
                </div>
              </div>

              {/* Language Pills */}
              <div className="flex items-center gap-1.5 text-xs">
                {[
                  { id: 'hi-IN', label: 'Hinglish (hi-IN)' },
                  { id: 'kn-IN', label: 'Kanglish (kn-IN)' },
                  { id: 'ta-IN', label: 'Tanglish (ta-IN)' },
                ].map(dial => (
                  <button
                    key={dial.id}
                    onClick={() => {
                      setSelectedDialect(dial.id);
                      playAudioChime('ping');
                    }}
                    className={`flex-1 py-1 px-1.5 rounded-md text-center font-semibold text-[11px] transition-all cursor-pointer ${
                      selectedDialect === dial.id
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-[#0F1620] text-slate-400 hover:text-white border border-white/[0.04]'
                    }`}
                  >
                    {dial.label}
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-[#0F1620] border border-white/[0.06] space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>PRE-TTS PHONETIC OUTPUT ({dialectTranslations.label})</span>
                  <span className="text-emerald-400">Verified</span>
                </div>
                <p className="font-mono text-slate-200 text-[11px] leading-relaxed">
                  "{dialectTranslations.summary}"
                </p>
                <div className="pt-1.5 flex justify-end">
                  <button
                    onClick={() => playVoiceProof(dialectTranslations.audioText)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-all cursor-pointer"
                  >
                    <Volume2 size={12} strokeWidth={1.75} />
                    <span>Play Timbre Voice</span>
                  </button>
                </div>
              </div>
            </div>

            {/* FEATURE 6: AMBIENT LOW-STOCK INVENTORY RADAR CARD */}
            <div className="rounded-2xl bg-[#0B1017]/85 backdrop-blur-xl border border-white/[0.07] hover:border-emerald-500/30 p-4 shadow-xl space-y-3 transition-colors">
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-slate-300">
                    <Package size={14} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-100">Ambient Inventory Radar</h3>
                    <p className="text-[10px] text-slate-400">Extracted from counter mutters</p>
                  </div>
                </div>

                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono text-slate-400 bg-[#0F1620]">
                  {inventoryAlerts.length} Low Items
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-1.5 text-xs">
                {inventoryAlerts.map(alert => (
                  <div key={alert.id} className="p-2 rounded-lg bg-[#0F1620] border border-white/[0.04] flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-200 text-[11px]">{alert.name}</div>
                      <div className="text-[10px] font-mono text-slate-500 italic">"{alert.audioProof}"</div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white/[0.04] text-slate-300 border border-white/[0.06] font-mono">
                      {alert.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <button
                onClick={handleBroadcastWholesaleOrder}
                disabled={isBroadcastingWholesale}
                className="w-full py-2 px-3 rounded-lg bg-[#0F1620] hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-white/[0.07] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isBroadcastingWholesale ? (
                  <>
                    <RotateCw size={13} strokeWidth={1.75} className="animate-spin" />
                    <span>Broadcasting to Wholesaler...</span>
                  </>
                ) : (
                  <>
                    <Send size={13} strokeWidth={1.75} className="text-emerald-400" />
                    <span>Send Wholesaler Voice Note</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FEATURE 4: INSTANT UPI QR & WHATSAPP SETTLEMENT MODAL                     */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {isSettlementModalOpen && settlementTargetCust && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.96, y: 16 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, y: 16 }}
                transition={SPRING_TRANSITION}
                className="max-w-md w-full rounded-2xl bg-[#0B1017] border border-emerald-500/30 p-5 shadow-2xl space-y-3.5 relative"
              >
                <div className="flex items-center justify-between border-b border-white/[0.07] pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                      <QrCode size={14} strokeWidth={1.75} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        Instant UPI & WhatsApp Settlement
                      </h3>
                      <p className="text-[11px] text-slate-400">Vasooli Engine • {settlementTargetCust.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSettlementModalOpen(false)}
                    className="p-1 rounded-md text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X size={13} strokeWidth={1.75} />
                  </button>
                </div>

                {/* Amount Highlight */}
                <div className="p-3 rounded-xl bg-[#0F1620] border border-emerald-500/25 text-center">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Balance Outstanding</div>
                  <div className="text-2xl font-extrabold font-mono tabular-nums text-emerald-400 mt-0.5">
                    {formatRupee(settlementTargetCust.totalBalance)}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    Old: {formatRupee(settlementTargetCust.oldBalance)} + Today: {formatRupee(settlementTargetCust.todayNewBalance)}
                  </div>
                </div>

                {/* Scannable Dynamic UPI QR Code */}
                <div className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-white text-slate-900 shadow-inner">
                  <svg className="w-32 h-32" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M10 10h30v30h-30z M15 15h20v20h-20z M60 10h30v30h-30z M65 15h20v20h-20z M10 60h30v30h-30z M15 65h20v20h-20z M20 20h10v10h-10z M70 20h10v10h-10z M20 70h10v10h-10z M45 10h10v10h-10z M45 30h10v20h-10z M10 45h20v10h-20z M35 45h10v10h-10z M60 45h20v10h-20z M85 45h5v20h-5z M45 65h10v25h-10z M60 65h15v10h-15z M80 65h10v10h-10z M65 80h25v10h-25z" />
                  </svg>
                  <div className="text-center mt-1.5 font-mono text-[11px] font-bold text-slate-800">
                    Scan with PhonePe / GPay / Paytm
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    upi://pay?pa=dukandar@upi&am={settlementTargetCust.totalBalance}
                  </div>
                </div>

                {/* WhatsApp Receipt Preview */}
                <div className="p-2.5 rounded-lg bg-[#0F1620] border border-white/[0.06] text-xs font-mono space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                    <Share2 size={12} strokeWidth={1.75} />
                    <span>WhatsApp Voice-Proof Receipt</span>
                  </div>
                  <div className="text-slate-400 text-[10px] leading-relaxed">
                    "Namaste {settlementTargetCust.name} ji, DukandarOS khata balance {formatRupee(settlementTargetCust.totalBalance)}. Voice proof: 'Bhaiya 80 rupaye khata mein...' Settle: upi://pay?pa=dukandar@upi"
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleConfirmSettlement('Cash')}
                    className="flex-1 py-2 rounded-lg bg-[#0F1620] hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-white/[0.07] transition-all cursor-pointer"
                  >
                    Mark Paid via Cash
                  </button>
                  <button
                    onClick={() => handleConfirmSettlement('UPI')}
                    className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <CheckCheck size={13} strokeWidth={1.75} />
                    <span>Confirm UPI Payment</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* FEATURE 7: FLOATING CALL SHIELD WIDGET (15s RAM FIFO)                     */}
        {/* ========================================================================= */}
        <div className="fixed bottom-4 right-4 z-40 max-w-sm w-full">
          <div className="rounded-2xl bg-[#0B1017]/95 backdrop-blur-2xl border border-amber-500/30 shadow-2xl overflow-hidden">
            
            <div className="px-3.5 py-2 bg-[#0F1620] border-b border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="text-xs font-bold text-amber-300">Call Shield & One-Tap Nod</span>
              </div>

              <button
                onClick={() => setIsCallShieldMinimized(!isCallShieldMinimized)}
                className="p-1 text-slate-400 hover:text-white rounded-md text-xs cursor-pointer"
              >
                {isCallShieldMinimized ? <ChevronRight size={13} strokeWidth={1.75} /> : <ChevronDown size={13} strokeWidth={1.75} />}
              </button>
            </div>

            <AnimatePresence>
              {!isCallShieldMinimized && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={SPRING_TRANSITION}
                  className="p-3.5 space-y-3"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-300">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Smartphone size={12} strokeWidth={1.75} className="text-amber-400" />
                      <span>{isCallActive ? 'Call Active (Mic Guarded)' : 'Standby Mode'}</span>
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/25">
                      15s FIFO RAM
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-medium">Customer Standing at Stall:</label>
                    <div className="relative">
                      <select
                        value={callShieldCustomer}
                        onChange={(e) => setCallShieldCustomer(e.target.value)}
                        className="w-full appearance-none bg-[#0F1620] border border-white/[0.08] rounded-lg px-2.5 py-1 pr-7 text-xs font-semibold text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer font-mono tabular-nums"
                      >
                        {customers.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} (Old: {formatRupee(c.oldBalance)})
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={12} strokeWidth={1.75} className="text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* One-Tap Nod Chips */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-semibold text-amber-300 flex items-center justify-between">
                      <span>One-Tap Thumb Action (Silent Nod):</span>
                      <span className="text-slate-500 font-mono">15s audio link</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-xs">
                      <button
                        onClick={() => handleCallShieldOneTap('Special Chai', 15)}
                        className="p-2 rounded-lg bg-[#0F1620] hover:bg-amber-500/15 border border-white/[0.06] hover:border-amber-500/40 text-left transition-all cursor-pointer"
                      >
                        <div className="font-bold text-amber-300 font-mono tabular-nums">+₹15</div>
                        <div className="text-[10px] text-slate-400 truncate">Chai</div>
                      </button>

                      <button
                        onClick={() => handleCallShieldOneTap('Chai + Samosa', 45)}
                        className="p-2 rounded-lg bg-[#0F1620] hover:bg-amber-500/15 border border-white/[0.06] hover:border-amber-500/40 text-left transition-all cursor-pointer"
                      >
                        <div className="font-bold text-amber-300 font-mono tabular-nums">+₹45</div>
                        <div className="text-[10px] text-slate-400 truncate">Chai+Samosa</div>
                      </button>

                      <button
                        onClick={() => handleCallShieldOneTap('Masala Dosa', 60)}
                        className="p-2 rounded-lg bg-[#0F1620] hover:bg-amber-500/15 border border-white/[0.06] hover:border-amber-500/40 text-left transition-all cursor-pointer"
                      >
                        <div className="font-bold text-amber-300 font-mono tabular-nums">+₹60</div>
                        <div className="text-[10px] text-slate-400 truncate">Dosa</div>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs pt-0.5">
                    <input
                      type="text"
                      placeholder="Item (e.g. Bun Maska)"
                      value={customItemText}
                      onChange={(e) => setCustomItemText(e.target.value)}
                      className="w-1/2 px-2 py-1 bg-[#0F1620] border border-white/[0.08] rounded-md text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="number"
                      placeholder="₹"
                      value={customItemAmount}
                      onChange={(e) => setCustomItemAmount(e.target.value)}
                      className="w-16 px-2 py-1 bg-[#0F1620] border border-white/[0.08] rounded-md text-xs font-mono tabular-nums text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={() => {
                        const amt = parseFloat(customItemAmount);
                        if (!customItemText.trim() || isNaN(amt) || amt <= 0) return;
                        handleCallShieldOneTap(customItemText.trim(), amt);
                      }}
                      className="px-2 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shrink-0 cursor-pointer"
                    >
                      <PlusCircle size={13} strokeWidth={1.75} />
                    </button>
                  </div>

                  {lastAsymmetricLink && (
                    <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300 flex items-center justify-between font-mono tabular-nums">
                      <span>Linked: +₹{lastAsymmetricLink.amount} to {lastAsymmetricLink.customerName}</span>
                      <span>{lastAsymmetricLink.time}</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3-STAGE ANIMATED BATCH AI PROCESSING OVERLAY                              */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {isBatchPipelineActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.96, y: 16 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, y: 16 }}
                transition={SPRING_TRANSITION}
                className="max-w-xl w-full rounded-2xl bg-[#0B1017] border border-emerald-500/30 p-5 shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                      <Cpu size={15} strokeWidth={1.75} className="animate-spin" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">
                        Sovereign Acoustic Khata Pipeline
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Prisma v2.5 $\rightarrow$ Evon v3.3 $\rightarrow$ Timbre v3.0
                      </p>
                    </div>
                  </div>

                  {pipelineProgress === 100 && (
                    <button
                      onClick={closeBatchPipeline}
                      className="p-1 rounded-md text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X size={13} strokeWidth={1.75} />
                    </button>
                  )}
                </div>

                <div className="mt-4 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                      <span className="text-slate-400">Pipeline Execution:</span>
                      <span className="text-emerald-400 font-bold">{pipelineProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#0F1620] overflow-hidden">
                      <motion.div
                        className="h-full bg-emerald-500"
                        animate={{ width: `${pipelineProgress}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className={`p-2.5 rounded-xl border transition-all ${
                      pipelineStage >= 1 
                        ? 'bg-emerald-500/[0.08] border-emerald-500/30 text-emerald-200' 
                        : 'bg-[#0F1620] border-white/[0.05] text-slate-500'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px]">Prisma v2.5</span>
                        {pipelineStage > 1 && <CheckCircle2 size={12} className="text-emerald-400" />}
                      </div>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        Diarizing {noiseSliderDb} dB audio & NER
                      </p>
                    </div>

                    <div className={`p-2.5 rounded-xl border transition-all ${
                      pipelineStage >= 2 
                        ? 'bg-emerald-500/[0.08] border-emerald-500/30 text-emerald-200' 
                        : 'bg-[#0F1620] border-white/[0.05] text-slate-500'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px]">Evon v3.3</span>
                        {pipelineStage > 2 && <CheckCircle2 size={12} className="text-emerald-400" />}
                      </div>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        Filtering street gossip & structuring
                      </p>
                    </div>

                    <div className={`p-2.5 rounded-xl border transition-all ${
                      pipelineStage >= 3 
                        ? 'bg-emerald-500/[0.08] border-emerald-500/30 text-emerald-200' 
                        : 'bg-[#0F1620] border-white/[0.05] text-slate-500'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px]">Timbre v3.0</span>
                        {pipelineProgress === 100 && <CheckCircle2 size={12} className="text-emerald-400" />}
                      </div>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        Normalizing phonetics & locking proof
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/60 border border-white/[0.06] font-mono tabular-nums text-[10px] space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
                    {pipelineLogs.map((log, index) => (
                      <div key={index} className="flex items-start gap-1.5 text-slate-300">
                        <span className="text-emerald-400 select-none">&gt;</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>

                  {pipelineProgress === 100 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-end pt-1"
                    >
                      <button
                        onClick={closeBatchPipeline}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check size={13} strokeWidth={1.75} />
                        <span>Done & View Updated Ledgers</span>
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* ADD NEW CUSTOMER / MANUAL ENTRY MODAL                                    */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {isManualModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.96, y: 16 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, y: 16 }}
                transition={SPRING_TRANSITION}
                className="max-w-md w-full rounded-2xl bg-[#0B1017] border border-white/[0.1] p-5 shadow-2xl space-y-3.5"
              >
                <div className="flex items-center justify-between border-b border-white/[0.07] pb-2.5">
                  <div className="flex items-center gap-2">
                    <Plus size={14} strokeWidth={1.75} className="text-emerald-400" />
                    <h3 className="text-sm font-bold text-white tracking-tight">Add Customer / Manual Credit</h3>
                  </div>
                  <button
                    onClick={() => setIsManualModalOpen(false)}
                    className="p-1 rounded-md text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X size={13} strokeWidth={1.75} />
                  </button>
                </div>

                <form onSubmit={handleAddManualCustomer} className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Customer / Stall Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Auto / Flat 401"
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#0F1620] border border-white/[0.08] rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Mobile Tag (Synthetic)</label>
                    <input
                      type="text"
                      placeholder="98XXXXXX99 • Synthetic"
                      value={newCustPhone}
                      onChange={(e) => setNewCustPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#0F1620] border border-white/[0.08] rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500 font-mono tabular-nums"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Old Carry-Forward (₹)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={newCustOldBal}
                        onChange={(e) => setNewCustOldBal(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#0F1620] border border-white/[0.08] rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500 font-mono tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">+ Today's Credit (₹)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={newCustAddToday}
                        onChange={(e) => setNewCustAddToday(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#0F1620] border border-white/[0.08] rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500 font-mono tabular-nums text-amber-300"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#0F1620] border border-white/[0.06] text-slate-300 font-mono tabular-nums text-xs flex justify-between items-center">
                    <span>Resulting Closing Balance:</span>
                    <strong className="text-emerald-400 font-bold text-sm">
                      {formatRupee((parseFloat(newCustOldBal) || 0) + (parseFloat(newCustAddToday) || 0))}
                    </strong>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsManualModalOpen(false)}
                      className="px-3 py-1.5 rounded-lg bg-[#0F1620] hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 cursor-pointer"
                    >
                      Save Customer Entry
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
