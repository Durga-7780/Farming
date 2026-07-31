import React, { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

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
    
    // Charts & Titles
    trend_title: 'Purchases vs Sales Trend (Last 14 Days)',
    trend_sub: 'Comparing financial flow between farmer buys and mill billing',
    produce_share: 'Produce Share',
    produce_sub: 'Harvest volume proportion by variety',
    district_dist: 'District Procurement Distribution',
    district_sub: 'Total harvested volume (quintals) across AP & Telangana districts',
    top_farmers: 'Top Farmers by Purchase Value',
    recent_dispatches: 'Recent Mill Dispatches Feed',
    full_analytics: 'Full Analytics',
    view_all_200: 'View All 200',
    dispatch_gate: 'Dispatch Gate',
    
    // Common Actions & Headers
    search_placeholder: 'Search records...',
    filters: 'Filters',
    export: 'Export',
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
    
    // Purchases Page
    procurement_purchases: 'Procurement & Purchases',
    purchase_subtitle: '100 purchase vouchers recorded from farmers',
    new_purchase_order: '+ New Purchase Order',
    search_purchases: 'Search procurement & purchases...',
    purchase_no: 'PURCHASE NO.',
    farmer: 'FARMER',
    variety: 'VARIETY',
    quantity_bags: 'QUANTITY (BAGS)',
    rate_unit: 'RATE / UNIT (₹)',
    gross_amt: 'GROSS AMT',
    net_payable: 'NET PAYABLE (₹)',
    approval_status: 'APPROVAL STATUS',
    approved: 'Approved',
    pending: 'Pending',
    
    // Farmers Page
    farmer_directory: 'Farmer Directory & Ledgers',
    farmer_subtitle: 'Managing 200 active farmers across AP & Telangana',
    add_farmer: '+ Register New Farmer',
    code: 'CODE',
    contact: 'CONTACT',
    location_address: 'LOCATION / ADDRESS',
    produce_variety: 'Produce Variety',
    bags: 'Bags',
    weight_qtl: 'Weight (qtl)',
    moisture_mc: 'Moisture (MC)',
    total_cost: 'Total Cost',
    
    // Mills Page
    mill_directory: 'Rice Mills & Processing Units',
    mill_subtitle: 'Partner processing mills receiving grain dispatches',
    add_mill: '+ Add Rice Mill',
    gstin: 'GSTIN / TIN',
    contact_person: 'Contact Person',
    capacity: 'Capacity (qtl)',

    // Dispatch Page
    dispatch_title: 'Mill Dispatch Logistics & Gate Pass',
    dispatch_sub: 'Track vehicle gate passes from procurement to mill unloading',
    new_dispatch_pass: '+ Create Gate Pass',
    vehicle_no: 'VEHICLE NO.',
    driver_name: 'DRIVER NAME',
    gate_pass_no: 'GATE PASS NO.',
    
    // Sales Page
    sales_title: 'Mill Sales & Revenue Invoices',
    sales_sub: 'Billing invoices issued to partner rice mills',
    new_sales_invoice: '+ New Sale Invoice',
    invoice_no: 'INVOICE NO.',
    unit_price: 'UNIT PRICE (₹)',
    payment_status: 'PAYMENT STATUS',
    
    // Stock Page
    stock_title: 'Live Grain Warehouse Stock',
    stock_sub: 'Real-time inventory levels by crop produce variety',
    add_stock: '+ Adjust Stock',
    total_received: 'Total Received (qtl)',
    total_dispatched: 'Total Dispatched (qtl)',
    stock_balance: 'Stock Balance (qtl)',
    
    // Payments Page
    payments_title: 'Farmer Payouts & Mill Collections',
    farmer_payouts: 'Farmer Payouts',
    mill_collections: 'Mill Collections',
    record_farmer_payment: '+ Record Farmer Payment',
    record_mill_collection: '+ Record Mill Collection',
    payment_mode: 'Payment Mode',
    settlement_type: 'Settlement Type',
    reference_no: 'Reference No.',
    
    // Expenses Page
    expenses_title: 'Operational Expenses',
    expenses_sub: 'Logistics, labor, bag purchases, and warehouse costs',
    add_expense: '+ Add Expense',
    category: 'Category',
    vendor_payee: 'Vendor / Payee',
    
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
    
    // Charts & Titles
    trend_title: 'కొనుగోళ్లు vs అమ్మకాలు (గత 14 రోజులు)',
    trend_sub: 'రైతుల కొనుగోళ్లు మరియు మిల్లు బిల్లింగ్ మధ్య ఆర్థిక పోలిక',
    produce_share: 'పంటల వాటా',
    produce_sub: 'రకాల వారీగా ధాన్యం ఉత్పత్తి శాతం',
    district_dist: 'జిల్లా వారీ సేకరణ పంపిణీ',
    district_sub: 'ఆంధ్రప్రదేశ్ & తెలంగాణ జిల్లాల వారీగా మొత్తం దిగుబడి (క్వింటాళ్ళు)',
    top_farmers: 'అత్యధిక సేకరణ పొందిన రైతులు',
    recent_dispatches: 'ఇటీవలి మిల్లు డిస్పాచ్‌ల వివరాలు',
    full_analytics: 'పూర్తి విశ్లేషణ',
    view_all_200: 'మొత్తం 200 చూడండి',
    dispatch_gate: 'డిస్పాచ్ గేట్',
    
    // Common Actions & Headers
    search_placeholder: 'వెతకండి...',
    filters: 'ఫిల్టర్లు',
    export: 'ఎగుమతి (CSV)',
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
    
    // Purchases Page
    procurement_purchases: 'సేకరణ మరియు కొనుగోళ్లు',
    purchase_subtitle: 'రైతుల నుండి నమోదైన 100 కొనుగోలు వోచర్లు',
    new_purchase_order: '+ కొత్త కొనుగోలు ఆర్డర్',
    search_purchases: 'కొనుగోలు వోచర్ల వివరాలు వెతకండి...',
    purchase_no: 'కొనుగోలు రశీదు నెం.',
    farmer: 'రైతు పేరు',
    variety: 'పంట రకం',
    quantity_bags: 'సంచుల సంఖ్య',
    rate_unit: 'ధర / క్వింటాల్ (₹)',
    gross_amt: 'మొత్తం విలువ (₹)',
    net_payable: 'నికర చెల్లింపు (₹)',
    approval_status: 'ఆమోద పరిస్థితి',
    approved: 'ఆమోదించబడింది',
    pending: 'పెండింగ్',
    
    // Farmers Page
    farmer_directory: 'రైతుల వివరాల జాబితా',
    farmer_subtitle: 'ఆంధ్రప్రదేశ్ మరియు తెలంగాణలో 200 మంది రైతులు',
    add_farmer: '+ కొత్త రైతు నమోదు',
    code: 'రైతు కోడ్',
    contact: 'ఫోన్ నంబరు',
    location_address: 'చిరునామా / గ్రామం',
    produce_variety: 'పంట రకం',
    bags: 'సంచులు',
    weight_qtl: 'బరువు (క్వింటాళ్ళు)',
    moisture_mc: 'తేమ శాతం (MC)',
    total_cost: 'మొత్తం విలువ (₹)',
    
    // Mills Page
    mill_directory: 'రైస్ మిల్లుల జాబితా',
    mill_subtitle: 'ధాన్యం సరఫరా పొందుతున్న భాగస్వామ్య మిల్లులు',
    add_mill: '+ కొత్త మిల్లు నమోదు',
    gstin: 'జిఎస్టి నంబరు',
    contact_person: 'సంప్రదించాల్సిన వ్యక్తి',
    capacity: 'సామర్థ్యం (క్వింటాళ్ళు)',

    // Dispatch Page
    dispatch_title: 'మిల్లు డిస్పాచ్ మరియు గేట్ పాస్',
    dispatch_sub: 'రైతుల నుండి మిల్లుల వరకు వాహనాల రవాణా సేవలు',
    new_dispatch_pass: '+ కొత్త గేట్ పాస్ సృష్టించు',
    vehicle_no: 'వాహన నంబరు',
    driver_name: 'డ్రైవర్ పేరు',
    gate_pass_no: 'గేట్ పాస్ నంబరు',
    
    // Sales Page
    sales_title: 'మిల్లు అమ్మకాలు మరియు బిల్లులు',
    sales_sub: 'రైస్ మిల్లులకు జారీ చేసిన ఇన్వాయిస్ రశీదులు',
    new_sales_invoice: '+ కొత్త అమ్మకం ఇన్వాయిస్',
    invoice_no: 'ఇన్వాయిస్ నంబరు',
    unit_price: 'ధర / క్వింటాల్ (₹)',
    payment_status: 'చెల్లింపు స్థితి',
    
    // Stock Page
    stock_title: 'వేర్‌హౌస్ ధాన్యం నిల్వలు',
    stock_sub: 'పంట రకాల వారీగా అందుబాటులో ఉన్న లైవ్ స్టాక్',
    add_stock: '+ స్టాక్ సర్దుబాటు',
    total_received: 'మొత్తం స్వీకరించినది (క్వింటాళ్ళు)',
    total_dispatched: 'మొత్తం డిస్పాచ్ అయినది (క్వింటాళ్ళు)',
    stock_balance: 'మిగిలిన స్టాక్ (క్వింటాళ్ళు)',
    
    // Payments Page
    payments_title: 'రైతు బకాయిలు మరియు మిల్లు చెల్లింపులు',
    farmer_payouts: 'రైతు చెల్లింపులు',
    mill_collections: 'మిల్లు వసూళ్లు',
    record_farmer_payment: '+ రైతు చెల్లింపు నమోదు',
    record_mill_collection: '+ మిల్లు వసూలు నమోదు',
    payment_mode: 'చెల్లింపు విధానం',
    settlement_type: 'సెటిల్మెంట్ రకం',
    reference_no: 'రెఫరెన్స్ నంబరు',
    
    // Expenses Page
    expenses_title: 'వ్యాపార నిర్వహణ ఖర్చులు',
    expenses_sub: 'లారీ అద్దెలు, హమాలీ కూలీ, సంచులు మరియు వేర్‌హౌస్ ఖర్చులు',
    add_expense: '+ కొత్త ఖర్చు నమోదు',
    category: 'ఖర్చు రకం',
    vendor_payee: 'స్వీకర్త / వ్యక్తి',
    
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

  useEffect(() => {
    localStorage.setItem('agroledger_lang', lang)
  }, [lang])

  const toggleLanguage = (selectedLang) => {
    setLang(selectedLang)
  }

  const t = (key) => {
    if (!key) return ''
    return translations[lang]?.[key] || translations['en']?.[key] || key
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
