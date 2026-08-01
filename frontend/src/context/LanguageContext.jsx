import React, { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

const nameTokenMap = {
  // --- Telugu Names (First Names) ---
  'Anand': 'ఆనంద్', 'Chari': 'చారి', 'Murthy': 'మూర్తి', 'Prasad': 'ప్రసాద్',
  'Anjaneyulu': 'ఆంజనేయులు', 'Reddy': 'రెడ్డి', 'Ashok': 'అశోక్',
  'Lokesh': 'లోకేష్', 'Sharma': 'శర్మ', 'Madhav': 'మాధవ్', 'Rao': 'రావు',
  'Gopal': 'గోపాల్', 'Kumar': 'కుమార్', 'Subba': 'సుబ్బా', 'Chowdary': 'చౌదరి',
  'Lakshmana': 'లక్ష్మణ', 'Koundinya': 'కౌండిన్య', 'Babu': 'బాబు',
  'Suresh': 'సురేష్', 'Venkateswara': 'వేంకటేశ్వర', 'Satyanarayana': 'సత్యనారాయణ',
  'Ramesh': 'రమేష్', 'Murali': 'మురళి', 'Balaji': 'బాలాజీ', 'Annapurna': 'అన్నపూర్ణ',
  'Krishna': 'కృష్ణ', 'Rama': 'రామ', 'Vijaya': 'విజయ', 'Durga': 'దుర్గా',
  'Lakshmi': 'లక్ష్మీ', 'Naidu': 'నాయుడు', 'Raju': 'రాజు', 'Venkatesh': 'వెంకటేష్',
  'Srinivas': 'శ్రీనివాస్', 'Srinivasa': 'శ్రీనివాస', 'Narayana': 'నారాయణ',
  'Koteswara': 'కోటేశ్వర', 'Siva': 'శివ', 'Shiva': 'శివ', 'Shankar': 'శంకర్',
  'Sankar': 'శంకర్', 'Sekhar': 'శేఖర్', 'Shekhar': 'శేఖర్', 'Venkat': 'వెంకట్',
  'Chandra': 'చంద్ర', 'Mohan': 'మోహన్', 'Kiran': 'కిరణ్', 'Rajesh': 'రాజేష్',
  'Naresh': 'నరేష్', 'Mahesh': 'మహేష్', 'Dinesh': 'దినేష్', 'Ganesh': 'గణేష్',
  'Bhanu': 'భాను', 'Prakash': 'ప్రకాష్', 'Jagadeesh': 'జగదీష్', 'Venu': 'వేణు',
  'Bhaskar': 'భాస్కర్', 'Venkataramana': 'వేంకటరమణ', 'Ramana': 'రమణ',
  'Apparao': 'అప్పారావు', 'Subbarao': 'సుబ్బారావు', 'Nageswara': 'నాగేశ్వర',
  'Nagendra': 'నాగేంద్ర', 'Phani': 'ఫణి', 'Pavan': 'పవన్', 'Pawan': 'పవన్',
  'Kalyan': 'కళ్యాణ్', 'Venkata': 'వెంకట', 'Sundar': 'సుందర్', 'Gupta': 'గుప్తా',
  'Jagadeeshwara': 'జగదీశ్వర', 'Varma': 'వర్మ', 'Verma': 'వర్మ',
  'Chandrasekhar': 'చంద్రశేఖర్', 'Chandrashekar': 'చంద్రశేఖర్',
  'Chandrashekhar': 'చంద్రశేఖర్', 'Chenna': 'చెన్న', 'Sudhakar': 'సుధాకర్',
  'Prabhakar': 'ప్రభాకర్', 'Ratnakar': 'రత్నాకర్', 'Madhukar': 'మధుకర్',
  'Diwakar': 'దివాకర్', 'Somasekhar': 'సోమశేఖర్', 'Rajashekhar': 'రాజశేఖర్',
  'Rajashekar': 'రాజశేఖర్', 'Gopala': 'గోపాల', 'Govinda': 'గోవింద',
  'Subrahmanyam': 'సుబ్రహ్మణ్యం', 'Subramanyam': 'సుబ్రహ్మణ్యం',
  'Venkatrao': 'వెంకటరావు', 'Suryanarayana': 'సూర్యనారాయణ',
  'Lakshminarayana': 'లక్ష్మీనారాయణ', 'Radhakrishna': 'రాధాకృష్ణ',
  'Ramakrishna': 'రామకృష్ణ', 'Sitarama': 'సీతారామ', 'Sitaram': 'సీతారామ్',
  'Hanumantha': 'హనుమంత', 'Veerabhadra': 'వీరభద్ర', 'Kondal': 'కొండల్',
  'Mallikarjuna': 'మల్లికార్జున', 'Narsimha': 'నరసింహ', 'Narasimha': 'నరసింహ',
  'Simhachalam': 'సింహాచలం', 'Tirupati': 'తిరుపతి', 'Tirupathi': 'తిరుపతి',
  'Sastry': 'శాస్త్రి', 'Shastri': 'శాస్త్రి', 'Satish': 'సతీష్',
  'Harish': 'హరీష్', 'Girish': 'గిరీష్', 'Nagesh': 'నాగేష్', 'Singh': 'సింగ్',
  'Joshi': 'జోషి', 'Moorthy': 'మూర్తి', 'Choudhary': 'చౌదరి',
  // Additional farmer names from database
  'Bharata': 'భరత', 'Dharmendra': 'ధర్మేంద్ర', 'Gopi': 'గోపి',
  'Hemant': 'హేమంత్', 'Jagan': 'జగన్', 'Jitendra': 'జితేంద్ర',
  'Kishore': 'కిషోర్', 'Madhusudhan': 'మధుసూదన్', 'Narendra': 'నరేంద్ర',
  'Parandhama': 'పరంధామ', 'Pradeep': 'ప్రదీప్', 'Purushottam': 'పురుషోత్తమ్',
  'Raghava': 'రాఘవ', 'Ramachandra': 'రామచంద్ర', 'Ravindra': 'రవీంద్ర',
  'Sambasiva': 'సాంబశివ', 'Santosh': 'సంతోష్', 'Shatrughna': 'శత్రుఘ్న',
  'Sudheer': 'సుధీర్', 'Surendra': 'సురేంద్ర', 'Swamy': 'స్వామి',
  'Tarun': 'తరుణ్', 'Upendra': 'ఉపేంద్ర', 'Vijay': 'విజయ్',
  // --- Mill / Business Terms ---
  'Sri': 'శ్రీ', 'Sree': 'శ్రీ', 'Rice': 'రైస్', 'Mill': 'మిల్లు',
  'Agro': 'ఆగ్రో', 'Industries': 'ఇండస్ట్రీస్', 'Processing': 'ప్రాసెసింగ్',
  'Unit': 'యూనిట్', 'Modern': 'మోడర్న్', 'Oil': 'ఆయిల్', 'New': 'న్యూ',
  'Old': 'ఓల్డ్', 'Nagar': 'నగర్', 'Colony': 'కాలనీ', 'Street': 'స్ట్రీట్',
  'Village': 'గ్రామం', 'Town': 'టౌన్', 'City': 'సిటీ', 'District': 'జిల్లా',
  'Mandal': 'మండలం', 'State': 'రాష్ట్రం', 'Royal': 'రాయల్',
  'Kakatiya': 'కాకతీయ', 'Andhra': 'ఆంధ్ర', 'Pradesh': 'ప్రదేశ్',
  'Telangana': 'తెలంగాణ',
  // --- Crop / Produce Terms ---
  'Paddy': 'వరి', 'Fine': 'ఫైన్', 'Common': 'కామన్', 'Sona': 'సోనా',
  'Masuri': 'మసూరి', 'BPT': 'బిపిటి', 'MTU': 'ఎమ్టియు',
  'Chilli': 'మిరప', 'Black': 'నల్ల', 'Gram': 'మినుములు',
  'Groundnut': 'వేరుశనగ', 'Cotton': 'పత్తి', 'Maize': 'మొక్కజొన్న',
  'bags': 'బస్తాలు', 'qtl': 'క్వింటాళ్ళు', 'Quintal': 'క్వింటాల్',
  // --- Locations, Villages & Roads ---
  'Armoor': 'ఆర్మూర్', 'Nandyal': 'నంద్యాల', 'Highway': 'హైవే',
  'Port': 'పోర్ట్', 'Road': 'రోడ్డు', 'Kakinada': 'కాకినాడ',
  'Kurnool': 'కర్నూలు', 'Nizamabad': 'నిజామాబాద్', 'Autonagar': 'ఆటోనగర్',
  'Vijayawada': 'విజయవాడ', 'Warangal': 'వరంగల్', 'Jangaon': 'జనగామ',
  'Industrial': 'ఇండస్ట్రియల్', 'Estate': 'ఎస్టేట్',
  'Miryalaguda': 'మిర్యాలగూడ', 'Bypass': 'బైపాస్', 'Eluru': 'ఏలూరు',
  'Piduguralla': 'పిడుగురాళ్ళ', 'Main': 'మెయిన్', 'Huzurabad': 'హుజూరాబాద్',
  'Khammam': 'ఖమ్మం', 'Suryapet': 'సూర్యాపేట', 'Tenali': 'తెనాలి',
  'Guntur': 'గుంటూరు', 'Hyderabad': 'హైదరాబాద్', 'Kodad': 'కోదాడ',
  // Farmer villages from database
  'Alamuru': 'ఆలమూరు', 'Angalakuduru': 'ఆంగలకుదురు', 'Anksapur': 'అంక్సాపూర్',
  'Bhattiprolu': 'భట్టిప్రోలు', 'Challapalli': 'చల్లపల్లి',
  'Chivvemla': 'చివ్వెమ్ల', 'Ganapavaram': 'గణపవరం', 'Jonnada': 'జొన్నాడ',
  'Karlapalem': 'కర్లపాలెం', 'Korutla': 'కొరుట్ల', 'Kuchipudi': 'కూచిపూడి',
  'Mallial': 'మల్లియాల్', 'Mantada': 'మంతాడ', 'Nidumolu': 'నిడుమోలు',
  'Pedana': 'పెదన', 'Pentapadu': 'పెంటపాడు', 'Pippara': 'పిప్పర',
  'Relangi': 'రేలంగి', 'Rudravaram': 'రుద్రవరం', 'Ryali': 'ర్యాలి',
  'Sirikonda': 'సిరికొండ', 'Tripuraram': 'త్రిపురారం', 'Undi': 'ఉండి',
  'Veldurthi': 'వెల్దుర్తి', 'Vemulapally': 'వేములపల్లి',
  // State abbreviations
  'AP': 'ఆంధ్రప్రదేశ్', 'TS': 'తెలంగాణ',
  // Single-letter initials
  'M': 'ఎమ్', 'V': 'వి', 'P': 'పి', 'Ch': 'సిహెచ్', 'G': 'జి',
  'K': 'కే', 'S': 'ఎస్', 'R': 'ఆర్', 'B': 'బి', 'D': 'డి', 'T': 'టి',
  'A': 'ఎ', 'N': 'ఎన్', 'L': 'ఎల్', 'H': 'హెచ్', 'J': 'జే', 'C': 'సి',
  // Common English words in context
  'Aadhaar': 'ఆధార్', 'Bank': 'బ్యాంక్', 'Account': 'ఖాతా', 'Total': 'మొత్తం',
  'Paid': 'చెల్లించిన', 'Pending': 'పెండింగ్', 'Active': 'యాక్టివ్',
  'Inactive': 'నిష్క్రియ', 'Yes': 'అవును', 'No': 'కాదు',
}

// Build a case-insensitive lookup from nameTokenMap
const nameTokenMapLower = {}
for (const key in nameTokenMap) {
  nameTokenMapLower[key.toLowerCase()] = nameTokenMap[key]
}

// ============================================================
// Proper syllable-based English-to-Telugu auto-transliteration
// This handles consonant + vowel matra combinations correctly
// ============================================================

// Telugu consonant base characters
const teluguConsonants = {
  // Multi-character consonants (check first, longest match wins)
  'shh': 'ష', 'sh': 'శ', 'chh': 'ఛ', 'ch': 'చ',
  'th': 'త', 'dh': 'ద', 'bh': 'భ', 'ph': 'ఫ',
  'gh': 'ఘ', 'jh': 'ఝ', 'kh': 'ఖ',
  // Single consonants (dental d/t for Indian names)
  'k': 'క', 'g': 'గ', 'c': 'క', 'j': 'జ',
  't': 'త', 'd': 'ద', 'n': 'న', 'p': 'ప',
  'b': 'బ', 'm': 'మ', 'y': 'య', 'r': 'ర',
  'l': 'ల', 'v': 'వ', 'w': 'వ', 's': 'స',
  'h': 'హ', 'f': 'ఫ', 'z': 'జ', 'q': 'క', 'x': 'క్స',
}

// Telugu vowel matras (applied after consonant character)
const teluguVowelMatras = {
  'aa': 'ా', 'ai': 'ై', 'au': 'ౌ',
  'ee': 'ీ', 'ea': 'ీ', 'ei': 'ై',
  'oo': 'ూ', 'ou': 'ౌ',
  'ii': 'ీ', 'uu': 'ూ',
  'a': '',   'e': 'ె',  'i': 'ి',
  'o': 'ొ',  'u': 'ు',
}

// Telugu standalone vowels (word-initial or after another vowel)
const teluguStandaloneVowels = {
  'aa': 'ఆ', 'ai': 'ఐ', 'au': 'ఔ',
  'ee': 'ఈ', 'ea': 'ఈ', 'ei': 'ఐ',
  'oo': 'ఊ', 'ou': 'ఔ',
  'ii': 'ఈ', 'uu': 'ఊ',
  'a': 'అ',  'e': 'ఎ',  'i': 'ఇ',
  'o': 'ఒ',  'u': 'ఉ',
}

const HALANT = '్' // Telugu virama - suppresses inherent vowel

function isVowelChar(ch) {
  return 'aeiou'.includes(ch)
}

function autoTransliterateToTelugu(word) {
  if (!word || typeof word !== 'string') return word
  if (/[\u0C00-\u0C7F]/.test(word)) return word // Already Telugu
  if (/^\d+$/.test(word)) return word            // Pure numbers
  if (/^[^a-zA-Z]+$/.test(word)) return word     // Non-alphabetic

  const lower = word.toLowerCase()
  let result = ''
  let i = 0

  while (i < lower.length) {
    // 1. Try to match a consonant (longest match first: 3, 2, 1)
    let consonant = null
    let cLen = 0
    for (let len = 3; len >= 1; len--) {
      const sub = lower.substring(i, i + len)
      if (teluguConsonants[sub]) {
        consonant = teluguConsonants[sub]
        cLen = len
        break
      }
    }

    if (consonant) {
      i += cLen
      // 2. After consonant, look for a vowel to form a syllable
      let vowelMatra = null
      let vLen = 0
      for (let len = 2; len >= 1; len--) {
        const sub = lower.substring(i, i + len)
        if (teluguVowelMatras[sub] !== undefined) {
          vowelMatra = teluguVowelMatras[sub]
          vLen = len
          break
        }
      }

      if (vowelMatra !== null) {
        // Consonant + vowel matra (e.g., క + ు = కు for "ku")
        result += consonant + vowelMatra
        i += vLen
      } else if (i < lower.length && !isVowelChar(lower[i])) {
        // Consonant followed by another consonant → add halant
        result += consonant + HALANT
      } else if (i >= lower.length) {
        // Consonant at end of word → add halant to suppress inherent 'a'
        result += consonant + HALANT
      } else {
        // Fallback
        result += consonant
      }
    } else if (isVowelChar(lower[i])) {
      // 3. Standalone vowel (word-initial or after another vowel)
      let vowel = null
      let vLen = 0
      for (let len = 2; len >= 1; len--) {
        const sub = lower.substring(i, i + len)
        if (teluguStandaloneVowels[sub]) {
          vowel = teluguStandaloneVowels[sub]
          vLen = len
          break
        }
      }
      if (vowel) {
        result += vowel
        i += vLen
      } else {
        result += lower[i]
        i++
      }
    } else {
      // 4. Unknown character (numbers, symbols, etc.) - keep as-is
      result += lower[i]
      i++
    }
  }

  return result
}

function transliterateNameToTelugu(nameStr) {
  if (!nameStr || typeof nameStr !== 'string') return nameStr
  // Don't transliterate pure numbers, dates, currency, or codes like FRM00201
  if (/^\d/.test(nameStr) || /^[₹$€]/.test(nameStr)) return nameStr
  if (/^[A-Z]{2,5}\d+/.test(nameStr)) return nameStr // Codes like FRM00201, DISP-2026

  const tokens = nameStr.split(/(\s+|\(|\)|\/|-|,|\.|&|:)/)
  return tokens.map((token) => {
    // 1. Exact dictionary match (case-sensitive)
    if (nameTokenMap[token]) return nameTokenMap[token]
    const trimmed = token.trim()
    if (nameTokenMap[trimmed]) return nameTokenMap[trimmed]
    // 2. Case-insensitive dictionary match
    const lowerTrimmed = trimmed.toLowerCase()
    if (nameTokenMapLower[lowerTrimmed]) return nameTokenMapLower[lowerTrimmed]
    // 3. For unknown alphabetic words (2+ chars), auto-transliterate phonetically
    if (/^[a-zA-Z]{2,}$/.test(trimmed)) {
      return autoTransliterateToTelugu(trimmed)
    }
    return token
  }).join('')
}

export const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    farmers: 'Farmers',
    mills: 'Mills',
    dispatch: 'Dispatch',
    purchases: 'Purchases',
    sales: 'Sales',
    stock: 'Stock',
    payments: 'Payments',
    expenses: 'Expenses',
    reports: 'Reports',
    
    // Header & Banner
    enterprise_control_tower: 'Enterprise Control Tower',
    system_status: 'System Status: Optimal',
    welcome_back: 'Welcome back',
    realtime_procurement: 'Real-time procurement analytics across 200 registered farmers, mill dispatches, and warehouse inventory.',
    farmers_directory: 'Farmers Directory',
    new_dispatch: 'New Dispatch',
    
    // Dashboard Cards
    todays_purchases: "Today's Purchases",
    todays_sales: "Today's Sales",
    live_grain_stock: 'Live Grain Stock',
    pending_farmer_payouts: 'Pending Farmer Payouts',
    pending_mill_receivables: 'Pending Mill Receivables',
    registered_farmers: 'Registered Farmers',
    monthly_purchases: 'Monthly Purchases',
    monthly_mill_sales: 'Monthly Mill Sales',
    daily_farmer_procurement: 'Daily farmer procurement',
    daily_mill_dispatches: 'Daily mill dispatches',
    available_warehouse_stock: 'Available warehouse stock',
    outstanding_balance_to_pay: 'Outstanding balance to pay',
    collections_due_from_mills: 'Collections due from mills',
    active_farmer_network: 'Active farmer network',
    mtd_total_procurement: 'MTD total procurement',
    mtd_total_mill_sales: 'MTD total mill sales',
    
    // Common Actions & Headers
    search_placeholder: 'Search records...',
    filters: 'Filters',
    export: 'Export (CSV)',
    export_statement: 'Export Statement',
    reset: 'Reset',
    actions: 'Actions',
    status: 'Status',
    date: 'Date',
    amount: 'Amount',
    view: 'View',
    edit: 'Edit',
    ledger: 'Ledger',
    active: 'Active',
    inactive: 'Inactive',
    unloaded: 'Unloaded',
    in_transit: 'In Transit',

    // Column Labels (direct matching)
    code: 'CODE',
    farmer: 'FARMER NAME',
    mill: 'RICE MILL NAME',
    target_mill: 'TARGET MILL',
    produce_variety: 'PRODUCE VARIETY',
    location_address: 'LOCATION / ADDRESS',
    contact: 'CONTACT',
    bags: 'BAGS',
    weight_qtl: 'WEIGHT (QTL)',
    total_cost: 'TOTAL COST',
    moisture_mc: 'MOISTURE (MC)',
    code_col: 'CODE',
    farmer_col: 'FARMER NAME',
    mill_col: 'RICE MILL NAME',
    target_mill_col: 'TARGET MILL',
    variety_col: 'PRODUCE VARIETY',
    quantity_bags_col: 'QUANTITY (BAGS)',
    rate_col: 'RATE / UNIT (₹)',
    unit_col: 'UNIT',
    gross_col: 'GROSS AMT',
    net_col: 'NET PAYABLE (₹)',
    status_col: 'APPROVAL STATUS',
    contact_col: 'CONTACT',
    contact_person_col: 'CONTACT PERSON',
    location_col: 'LOCATION ADDRESS',
    bank_account_col: 'BANK ACCOUNT',
    gstin_col: 'GSTIN / TIN',
    capacity_col: 'CAPACITY (QTL)',
    sale_no_col: 'SALE NO.',
    unit_price_col: 'UNIT PRICE (₹)',
    total_received_col: 'TOTAL RECEIVED (QTL)',
    total_dispatched_col: 'TOTAL DISPATCHED (QTL)',
    stock_balance_col: 'STOCK BALANCE (QTL)',
    payment_mode_col: 'PAYMENT MODE',
    settlement_type_col: 'SETTLEMENT TYPE',
    reference_no_col: 'REFERENCE NO.',
    
    // Produce Variety Names
    'Paddy - Fine': 'Paddy - Fine',
    'Paddy - Common': 'Paddy - Common',
    'Paddy - Sona Masuri': 'Paddy - Sona Masuri',
    'Paddy - BPT 5204': 'Paddy - BPT 5204',
    'Paddy - MTU 1010': 'Paddy - MTU 1010',
    'Chilli': 'Chilli',
    'Black Gram': 'Black Gram',
    'Groundnut': 'Groundnut',
    'Cotton': 'Cotton',
    'Maize': 'Maize',
    
    // Mandals & Districts
    'Mandal': 'Mandal',
    'Gudivada': 'Gudivada',
    'Krishna': 'Krishna',
    'Bhattiprolu': 'Bhattiprolu',
    'Repalle': 'Repalle',
    'Guntur': 'Guntur',
    'Pentapadu': 'Pentapadu',
    'Tadepalligudem': 'Tadepalligudem',
    'West Godavari': 'West Godavari',
    'East Godavari': 'East Godavari',
    'Korutla': 'Korutla',
    'Jagtial': 'Jagtial',
    'Karimnagar': 'Karimnagar',
    'Tenali': 'Tenali',
    'Pedana': 'Pedana',
    'Suryapet': 'Suryapet',
    'Nizamabad': 'Nizamabad',
    'Kurnool': 'Kurnool',
    
    // Mill Names
    'Sri Lakshmi Venkateswara Rice Mill': 'Sri Lakshmi Venkateswara Rice Mill',
    'Sri Vijaya Durga Rice & Oil Mill': 'Sri Vijaya Durga Rice & Oil Mill',
    'Kakatiya Agro Industries': 'Kakatiya Agro Industries',
    'Sri Rama Agro Industries': 'Sri Rama Agro Industries',
    'Sri Krishna Modern Rice Mill': 'Sri Krishna Modern Rice Mill',
    'Balaji Modern Rice Mill': 'Balaji Modern Rice Mill',
    'Annapurna Rice Mill': 'Annapurna Rice Mill',
    'Royal Agro Processing Unit': 'Royal Agro Processing Unit',
    
    // Notifications
    notif_title: 'Notifications',
    notif_1_title: 'Low Grain Stock Alert',
    notif_1_msg: 'Paddy - MTU 1010 warehouse stock is running low (< 10%).',
    notif_2_title: 'Mill Unload Pending',
    notif_2_msg: 'Pass DISP-2026-0003 is in transit to Kakatiya Agro.',
    notif_3_title: 'Pending Farmer Disbursal',
    notif_3_msg: '₹8,89,515 payout balance outstanding across 200 farmers.',
    
    // Purchases Page
    procurement_purchases: 'Procurement & Purchases',
    purchase_subtitle: '100 purchase vouchers recorded from farmers',
    new_purchase_order: '+ New Purchase Order',
    
    // Farmers Page
    farmer_directory: 'Farmer Directory & Ledgers',
    farmer_subtitle: 'Managing 200 active farmers across AP & Telangana',
    add_farmer: '+ Register New Farmer',
    
    // Mills Page
    mill_directory: 'Rice Mill Partners Directory',
    mill_subtitle: '8 processing and storage mills associated',
    add_mill: '+ Add Rice Mill',

    // Dispatch Page
    dispatch_title: 'Mill Dispatch Logistics & Gate Pass',
    dispatch_sub: 'Track vehicle gate passes from procurement to mill unloading',
    new_dispatch_pass: '+ Create Gate Pass',
    
    // Sales Page
    sales_title: 'Mill Sales & Revenue Invoices',
    sales_sub: 'Billing invoices issued to partner rice mills',
    new_sales_invoice: '+ New Sale Invoice',
    
    // Stock Page
    stock_title: 'Live Inventory & Warehouse Stock',
    stock_sub: 'Real-time stock calculations across all produce varieties',
    add_stock: '+ Adjust Stock',
    
    // Payments Page
    payments_title: 'Farmer Disbursal Payments',
    payments_sub: 'Tracking all financial transactions and payment receipts',
    farmer_payouts: 'Farmer Payouts',
    mill_collections: 'Mill Collections',
    record_farmer_payment: '+ Record Farmer Payment',
    
    // Reports Page
    reports_title: 'Enterprise Reports & Statements',
    reports_sub: 'Audit reports, financial ledgers, and procurement statements',
    total_purchases_val: 'Total Purchases Value',
    total_sales_billed: 'Total Sales Billed',
    rep_1_title: 'Farmer Procurement Statement',
    rep_1_desc: 'Comprehensive list of all 200 farmers, quantities harvested, moisture readings, and total costs.',
    rep_2_title: 'Mill Dispatch & Settlement Report',
    rep_2_desc: 'Dispatches, gate pass numbers, target mills, unload statuses, and settlement balances.',
    rep_3_title: 'Financial Purchases & Sales Ledger',
    rep_3_desc: 'Complete MTD & YTD purchase vouchers vs mill sale invoices summary.',
    rep_4_title: 'Warehouse Grain Inventory Audit',
    rep_4_desc: 'Stock balances across Paddy, Maize, Cotton, Chilli, Black Gram, and Groundnut.',
    
    // DataTable Controls
    showing: 'Showing',
    to_str: 'to',
    of_str: 'of',
    entries: 'entries',
    rows_per_page: 'Rows per page:',
    page_str: 'Page'
  },
  te: {
    // Navigation
    dashboard: 'డాష్‌బోర్డ్',
    farmers: 'రైతులు',
    mills: 'మిల్లులు',
    dispatch: 'డిస్పాచ్',
    purchases: 'కొనుగోళ్లు',
    sales: 'అమ్మకాలు',
    stock: 'స్టాక్ బ్యాలెన్స్',
    payments: 'చెల్లింపులు',
    expenses: 'ఖర్చులు',
    reports: 'రిపోర్టులు',
    
    // Header & Banner
    enterprise_control_tower: 'ఎంటర్‌ప్రైజ్ కంట్రోల్ టవర్',
    system_status: 'వ్యవస్థ పరిస్థితి: ఉత్తమం',
    welcome_back: 'స్వాగతం',
    realtime_procurement: '200 మంది రైతులు, మిల్లు డిస్పాచ్‌లు మరియు వేర్‌హౌస్ స్టాక్ వివరాలు.',
    farmers_directory: 'రైతుల జాబితా',
    new_dispatch: 'కొత్త డిస్పాచ్',
    
    // Dashboard Cards
    todays_purchases: 'ఈరోజు కొనుగోళ్లు',
    todays_sales: 'ఈరోజు అమ్మకాలు',
    live_grain_stock: 'లైవ్ ధాన్యం స్టాక్',
    pending_farmer_payouts: 'రైతులకు బాకీ చెల్లింపులు',
    pending_mill_receivables: 'మిల్లుల నుండి రావలసినవి',
    registered_farmers: 'నమోదైన రైతులు',
    monthly_purchases: 'ఈ నెల మొత్తం కొనుగోళ్లు',
    monthly_mill_sales: 'ఈ నెల మిల్లు అమ్మకాలు',
    daily_farmer_procurement: 'రోజువారీ రైతు కొనుగోలు',
    daily_mill_dispatches: 'రోజువారీ మిల్లు డిస్పాచ్',
    available_warehouse_stock: 'వేర్‌హౌస్‌లో అందుబాటులో ఉన్న స్టాక్',
    outstanding_balance_to_pay: 'రైతులకు చెల్లించాల్సిన బకాయి',
    collections_due_from_mills: 'మిల్లుల నుండి వసూలు కావాల్సినవి',
    active_farmer_network: 'యాక్టివ్ రైతు నెట్‌వర్క్',
    mtd_total_procurement: 'ఈ నెల మొత్తం కొనుగోలు విలువ',
    mtd_total_mill_sales: 'ఈ నెల మొత్తం మిల్లు అమ్మకాలు',
    
    // Common Actions & Headers
    search_placeholder: 'వెతకండి...',
    filters: 'ఫిల్టర్లు',
    export: 'ఎగుమతి (CSV)',
    export_statement: 'స్టేట్‌మెంట్ డౌన్‌లోడ్',
    reset: 'రీసెట్',
    actions: 'చర్యలు',
    status: 'స్థితి',
    date: 'తేదీ',
    amount: 'మొత్తం (₹)',
    view: 'చూడు',
    edit: 'సవరించు',
    ledger: 'ఖాతా పుస్తకం',
    active: 'యాక్టివ్',
    inactive: 'ఇన్‌యాక్టివ్',
    unloaded: 'అన్‌లోడ్ అయింది',
    in_transit: 'రవాణాలో ఉంది',

    // Column Labels (Telugu)
    code: 'రైతు కోడ్',
    farmer: 'రైతు పేరు',
    mill: 'రైస్ మిల్లు పేరు',
    target_mill: 'లక్ష్య మిల్లు',
    produce_variety: 'పంట రకం',
    location_address: 'చిరునామా / ప్రాంతం',
    contact: 'ఫోన్ నంబరు',
    bags: 'సంచుల సంఖ్య',
    weight_qtl: 'బరువు (క్వింటాళ్ళు)',
    total_cost: 'మొత్తం విలువ (₹)',
    moisture_mc: 'తేమ శాతం (MC)',
    code_col: 'కోడ్',
    farmer_col: 'రైతు పేరు',
    mill_col: 'రైస్ మిల్లు పేరు',
    target_mill_col: 'లక్ష్య మిల్లు',
    variety_col: 'పంట రకం',
    quantity_bags_col: 'సంచుల సంఖ్య',
    rate_col: 'ధర / క్వింటాల్ (₹)',
    unit_col: 'కొలత ప్రమాణం',
    gross_col: 'మొత్తం విలువ (₹)',
    net_col: 'నికర చెల్లింపు (₹)',
    status_col: 'ఆమోద పరిస్థితి',
    contact_col: 'ఫోన్ నంబరు',
    contact_person_col: 'సంప్రదించాల్సిన వ్యక్తి',
    location_col: 'చిరునామా / ప్రాంతం',
    bank_account_col: 'బ్యాంకు ఖాతా',
    gstin_col: 'జిఎస్టి నంబరు',
    capacity_col: 'సామర్థ్యం (క్వింటాళ్ళు)',
    sale_no_col: 'అమ్మకం బిల్లు నెం.',
    unit_price_col: 'ధర / క్వింటాల్ (₹)',
    total_received_col: 'మొత్తం స్వీకరించినది (క్వింటాళ్ళు)',
    total_dispatched_col: 'మొత్తం డిస్పాచ్ అయింది (క్వింటాళ్ళు)',
    stock_balance_col: 'మిగిలిన నిల్వ (క్వింటాళ్ళు)',
    payment_mode_col: 'చెల్లింపు విధానం',
    settlement_type_col: 'సెటిల్మెంట్ రకం',
    reference_no_col: 'రెఫరెన్స్ నంబరు',
    
    // Produce Variety Names (Telugu)
    'Paddy - Fine': 'వరి - సన్నాలు',
    'Paddy - Common': 'వరి - రకం',
    'Paddy - Sona Masuri': 'వరి - సోనా మసూరి',
    'Paddy - BPT 5204': 'వరి - BPT 5204',
    'Paddy - MTU 1010': 'వరి - MTU 1010',
    'Chilli': 'మిర్చి / మిరప',
    'Black Gram': 'మినుములు',
    'Groundnut': 'వేరుశనగ',
    'Cotton': 'పత్తి',
    'Maize': 'మొక్కజొన్న',
    'QUINTAL': 'క్వింటాల్',
    
    // Mandals & Districts (Telugu)
    'Mandal': 'మండలం',
    'Gudivada': 'గుడివాడ',
    'Krishna': 'కృష్ణా జిల్లా',
    'Bhattiprolu': 'భట్టిప్రోలు',
    'Repalle': 'రేపల్లె',
    'Guntur': 'గుంటూరు జిల్లా',
    'Pentapadu': 'పెంటపాడు',
    'Tadepalligudem': 'తాడేపల్లిగూడెం',
    'West Godavari': 'పశ్చిమ గోదావరి జిల్లా',
    'East Godavari': 'తూర్పు గోదావరి జిల్లా',
    'Korutla': 'కోరుట్ల',
    'Jagtial': 'జగిత్యాల',
    'Karimnagar': 'కరీంనగర్ జిల్లా',
    'Tenali': 'తెనాలి',
    'Pedana': 'పెడన',
    'Suryapet': 'సూర్యాపేట జిల్లా',
    'Nizamabad': 'నిజామాబాద్ జిల్లా',
    'Kurnool': 'కర్నూలు జిల్లా',
    
    // Mill Names (Telugu Transliteration)
    'Sri Lakshmi Venkateswara Rice Mill': 'శ్రీ లక్ష్మీ వేంకటేశ్వర రైస్ మిల్లు',
    'Sri Vijaya Durga Rice & Oil Mill': 'శ్రీ విజయదుర్గా రైస్ & ఆయిల్ మిల్లు',
    'Kakatiya Agro Industries': 'కాకతీయ ఆలీవ్ & ఆగ్రో ఇండస్ట్రీస్',
    'Sri Rama Agro Industries': 'శ్రీ రామా ఆగ్రో ఇండస్ట్రీస్',
    'Sri Krishna Modern Rice Mill': 'శ్రీ కృష్ణ మోడర్న్ రైస్ మిల్లు',
    'Balaji Modern Rice Mill': 'బాలాజీ మోడర్న్ రైస్ మిల్లు',
    'Annapurna Rice Mill': 'అన్నపూర్ణ రైస్ మిల్లు',
    'Royal Agro Processing Unit': 'రాయల్ ఆగ్రో ప్రొసెసింగ్ యూనిట్',
    
    // Location Names (Telugu)
    'Tenali Road, Guntur, AP': 'తెనాలి రోడ్డు, గుంటూరు, ఆంధ్రప్రదేశ్',
    'Autonagar, Vijayawada, AP': 'ఆటోనగర్, విజయవాడ, ఆంధ్రప్రదేశ్',
    'Warangal Highway, Jangaon, TS': 'వరంగల్ హైవే, జనగామ, తెలంగాణ',
    'Industrial Estate, Miryalaguda, TS': 'ఇండస్ట్రియల్ ఎస్టేట్, మిర్యాలగూడ, తెలంగాణ',
    'Bypass Road, Eluru, AP': 'బైపాస్ రోడ్డు, ఏలూరు, ఆంధ్రప్రదేశ్',
    'Guntur Road, Piduguralla, AP': 'గుంటూరు రోడ్డు, పిడుగురాళ్ళ, ఆంధ్రప్రదేశ్',
    'Main Road, Huzurabad, TS': 'మెయిన్ రోడ్డు, హుజూరాబాద్, తెలంగాణ',
    'Khammam Road, Suryapet, TS': 'ఖమ్మం రోడ్డు, సూర్యాపేట, తెలంగాణ',
    
    // Contact Person Names (Telugu)
    'V. Koteswara Rao': 'వి. కోటేశ్వరరావు',
    'M. Satyanarayana': 'ఎమ్. సత్యనారాయణ',
    'P. Ramesh Reddy': 'పి. రమేష్ రెడ్డి',
    'Ch. Venkat': 'సిహెచ్. వెంకట్',
    'G. Murali': 'జి. మురళి',
    'K. Balaji': 'కే. బాలాజీ',
    'S. Annapurna': 'ఎస్. అన్నపూర్ణ',
    'R. Royal Rao': 'ఆర్. రాయల్ రావు',
    
    // Notifications (Telugu)
    notif_title: 'నోటిఫికేషన్లు',
    notif_1_title: 'లైవ్ ధాన్యం స్టాక్ హెచ్చరిక',
    notif_1_msg: 'వేర్‌హౌస్‌లో వరి - MTU 1010 ధాన్యం నిల్వలు తక్కువగా ఉన్నాయి (< 10%).',
    notif_2_title: 'మిల్లు అన్‌లోడ్ పెండింగ్',
    notif_2_msg: 'రవాణా పాస్ DISP-2026-0003 కాకతీయ మిల్లుకు రవాణాలో ఉంది.',
    notif_3_title: 'రైతు బకాయిల చెల్లింపు',
    notif_3_msg: '200 మంది రైతులకు ₹8,89,515 చెల్లించాల్సిన బకాయి ఉంది.',

    // Purchases Page
    procurement_purchases: 'సేకరణ మరియు కొనుగోళ్లు',
    purchase_subtitle: 'రైతుల నుండి నమోదైన 100 కొనుగోలు వోచర్లు',
    new_purchase_order: '+ కొత్త కొనుగోలు ఆర్డర్',
    
    // Farmers Page
    farmer_directory: 'రైతుల వివరాల జాబితా',
    farmer_subtitle: 'ఆంధ్రప్రదేశ్ మరియు తెలంగాణలో 200 మంది రైతులు',
    add_farmer: '+ కొత్త రైతు నమోదు',
    
    // Mills Page
    mill_directory: 'రైస్ మిల్లు భాగస్వామ్యుల జాబితా',
    mill_subtitle: 'ధాన్యం శుద్ధి మరియు నిల్వ చేసే 8 భాగస్వామ్య మిల్లులు',
    add_mill: '+ కొత్త మిల్లు నమోదు',

    // Dispatch Page
    dispatch_title: 'మిల్లు డిస్పాచ్ మరియు గేట్ పాస్',
    dispatch_sub: 'రైతుల నుండి మిల్లుల వరకు వాహనాల రవాణా సేవలు',
    new_dispatch_pass: '+ కొత్త గేట్ పాస్ సృష్టించు',
    
    // Sales Page
    sales_title: 'మిల్లు అమ్మకాలు మరియు ఇన్వాయిస్ బిల్లులు',
    sales_sub: 'భాగస్వామ్య రైస్ మిల్లులకు జారీ చేసిన ఇన్వాయిస్ రశీదులు',
    new_sales_invoice: '+ కొత్త అమ్మకం ఇన్వాయిస్',
    
    // Stock Page
    stock_title: 'వేర్‌హౌస్ ధాన్యం నిల్వలు',
    stock_sub: 'పంట రకాల వారీగా అందుబాటులో ఉన్న ప్రత్యక్ష స్టాక్ బ్యాలెన్స్',
    add_stock: '+ స్టాక్ సర్దుబాటు',
    
    // Payments Page
    payments_title: 'రైతు చెల్లింపులు మరియు బకాయిల వివరాలు',
    payments_sub: 'అన్ని ఆర్థిక లావాదేవీలు మరియు చెల్లింపు రశీదుల ట్రాకింగ్',
    farmer_payouts: 'రైతు చెల్లింపులు',
    mill_collections: 'మిల్లు వసూళ్లు',
    record_farmer_payment: '+ రైతు చెల్లింపు నమోదు',
    
    // Reports Page
    reports_title: 'ఎంటర్‌ప్రైజ్ నివేదికలు మరియు ఖాతా పుస్తకాలు',
    reports_sub: 'ఆడిట్ నివేదికలు, ఆర్థిక లెడ్జర్లు మరియు సేకరణ స్టేట్‌మెంట్లు',
    total_purchases_val: 'మొత్తం కొనుగోళ్ల విలువ',
    total_sales_billed: 'మొత్తం మిల్లు అమ్మకాల బిల్లు',
    rep_1_title: 'రైతుల సేకరణ వివరాల నివేదిక',
    rep_1_desc: '200 మంది రైతులు, ధాన్యం దిగుబడి, తేమ శాతం మరియు మొత్తం చెల్లింపుల పూర్తి వివరాలు.',
    rep_2_title: 'మిల్లు డిస్పాచ్ మరియు సెటిల్మెంట్ నివేదిక',
    rep_2_desc: 'డిస్పాచ్ రవాణా, గేట్ పాస్ నంబర్లు, మిల్లు అన్‌లోడ్ స్థితులు మరియు బకాయిల లెక్కలు.',
    rep_3_title: 'కొనుగోళ్లు మరియు అమ్మకాల ఆర్థిక నివేదిక',
    rep_3_desc: 'రైతుల కొనుగోలు వోచర్లు మరియు మిల్లు ఇన్వాయిస్ అమ్మకాల సమగ్ర సారాంశం.',
    rep_4_title: 'వేర్‌హౌస్ ధాన్యం నిల్వల ఆడిట్',
    rep_4_desc: 'వరి, జొన్న, పత్తి, మిర్చి, మినుములు, వేరుశనగ పంటల ప్రత్యక్ష నిల్వలు.',
    
    // DataTable Controls
    showing: 'చూపిస్తున్నవి',
    to_str: 'నుండి',
    of_str: 'మొత్తం',
    entries: 'నమోదులు',
    rows_per_page: 'పేజీకి వరుసలు:',
    page_str: 'పేజీ'
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('agroledger_lang') || 'en'
  })

  // Dynamic API Translation cache stored in localStorage
  const [apiCache, setApiCache] = useState(() => {
    try {
      const stored = localStorage.getItem('agroledger_trans_cache')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })

  const pendingRequests = useRef(new Set())

  useEffect(() => {
    localStorage.setItem('agroledger_lang', lang)
  }, [lang])

  useEffect(() => {
    try {
      localStorage.setItem('agroledger_trans_cache', JSON.stringify(apiCache))
    } catch (e) {
      console.warn('Failed to save translation cache', e)
    }
  }, [apiCache])

  const toggleLanguage = (selectedLang) => {
    setLang(selectedLang)
  }

  // Fetch neural translation from backend API for unknown strings
  const fetchApiTranslation = (text) => {
    if (!text || typeof text !== 'string') return
    const clean = text.trim()
    if (!clean || clean.length < 2) return
    const cacheKey = clean.toLowerCase()

    if (apiCache[cacheKey] || pendingRequests.current.has(cacheKey)) return

    pendingRequests.current.add(cacheKey)

    fetch(`http://localhost:2028/api/translate?text=${encodeURIComponent(clean)}&target_lang=te`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.translated) {
          setApiCache((prev) => ({
            ...prev,
            [cacheKey]: data.translated
          }))
        }
      })
      .catch((err) => {
        console.error('Translation API error:', err)
      })
      .finally(() => {
        pendingRequests.current.delete(cacheKey)
      })
  }

  const t = (key) => {
    if (!key) return ''
    if (typeof key !== 'string') return key

    const translated = translations[lang]?.[key] || translations['en']?.[key]
    if (translated) return translated

    if (lang === 'te') {
      const trimmedKey = key.trim()
      const cacheKey = trimmedKey.toLowerCase()

      // 1. Check API neural translation cache
      if (apiCache[cacheKey]) {
        return apiCache[cacheKey]
      }

      // 2. Check static transliteration dictionary & rules
      const dictionaryOrRulesResult = transliterateNameToTelugu(key)

      // 3. Trigger background fetch from Google Translate NMT API if not in cache
      if (/^[a-zA-Z]/.test(trimmedKey) && !apiCache[cacheKey]) {
        fetchApiTranslation(trimmedKey)
      }

      return dictionaryOrRulesResult
    }

    return key
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang: toggleLanguage, t, isTelugu: lang === 'te' }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
