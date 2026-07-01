import React, { useState, useEffect, useMemo, useRef } from 'react'
import { 
  Smartphone, 
  Calculator, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Database, 
  Copy, 
  Trash2, 
  RefreshCw, 
  ArrowRight, 
  Battery, 
  Cpu, 
  Info,
  DollarSign,
  ListTodo,
  ChevronDown,
  User,
  Hash,
  Search,
  Sliders,
  Archive,
  Palette,
  Printer,
  Edit3,
  X,
  Eye
} from 'lucide-react'
import { supabase, isSupabaseConfigured, localDb, supabaseInitError } from './supabase'
import logo from './assets/logo.png'

// Matrix de Taxas do Gateway
const GATEWAY_RATES = {
  "Dinheiro / Pix": {
    hasDebit: true,
    debitRate: 0,
    creditRates: { 1: 0 }
  },
  "Stone Visa/Master": {
    hasDebit: true,
    debitRate: 1.09,
    creditRates: {
      1: 3.19, 2: 4.32, 3: 5.01, 4: 5.69, 5: 6.37, 6: 7.06, 7: 7.06,
      8: 7.75, 9: 8.44, 10: 9.13, 11: 9.82, 12: 10.51, 13: 11.20,
      14: 11.89, 15: 12.58, 16: 13.27, 17: 13.95, 18: 14.64
    }
  },
  "Stone Elo": {
    hasDebit: true,
    debitRate: 1.69,
    creditRates: {
      1: 4.05, 2: 5.12, 3: 5.79, 4: 6.47, 5: 7.15, 6: 7.83, 7: 8.94,
      8: 9.62, 9: 10.29, 10: 10.97, 11: 11.64, 12: 12.32, 13: 12.99,
      14: 13.67, 15: 14.34, 16: 15.02, 17: 15.69, 18: 16.37
    }
  },
  "Stone Amex": {
    hasDebit: false,
    debitRate: null,
    creditRates: {
      1: 4.14, 2: 4.95, 3: 5.63, 4: 6.31, 5: 6.99, 6: 7.67, 7: 8.48,
      8: 9.16, 9: 9.84, 10: 10.52, 11: 11.19, 12: 11.87, 13: 12.55,
      14: 13.23, 15: 13.91, 16: 14.59, 17: 15.27, 18: 15.94
    }
  },
  "Infinite Smart V/M": {
    hasDebit: true,
    debitRate: 0.75,
    creditRates: {
      1: 2.69, 2: 3.94, 3: 4.46, 4: 4.98, 5: 5.49, 6: 5.99, 7: 6.51,
      8: 6.99, 9: 7.51, 10: 7.99, 11: 8.49, 12: 8.99
    } // Máximo 12x
  },
  "Infinite Smart Elo/Amex": {
    hasDebit: true,
    debitRate: 1.88,
    creditRates: {
      1: 4.46, 2: 5.81, 3: 6.32, 4: 6.83, 5: 7.33, 6: 7.83, 7: 8.34,
      8: 8.83, 9: 9.32, 10: 9.81, 11: 10.29, 12: 10.77
    } // Máximo 12x
  },
  "Infinite Link": {
    hasDebit: false,
    debitRate: null,
    creditRates: {
      1: 4.20, 2: 6.09, 3: 7.01, 4: 7.91, 5: 8.80, 6: 9.67, 7: 12.59,
      8: 13.42, 9: 14.25, 10: 15.06, 11: 15.87, 12: 16.66
    } // Máximo 12x
  }
};

// Credenciais de Usuários (Administradores, Gerentes e Vendedores)
const USER_CREDENTIALS = {
  "eros99": { name: "Eros", role: "admin" },
  "jakson99": { name: "Jakson", role: "admin" },
  "jonathan77": { name: "Jonathan", role: "manager" },
  "vanessa77": { name: "Vanessa", role: "manager" },
  "rose123": { name: "Rose", role: "seller" },
  "ana123": { name: "Ana", role: "seller" },
  "emely123": { name: "Emely", role: "seller" },
  "joalison123": { name: "Joalison", role: "seller" },
  "juliana123": { name: "Juliana", role: "seller" },
  "jefferson123": { name: "Jefferson", role: "seller" }
};

// Modelos Padronizados
const NEW_MODELS = [
  "iPhone 15",
  "iPhone 15 Plus",
  "iPhone 16",
  "iPhone 16 Plus",
  "iPhone 16 Pro",
  "iPhone 16 Pro Max",
  "iPhone 17",
  "iPhone 17 Plus",
  "iPhone 17 Slim",
  "iPhone 17 Pro",
  "iPhone 17 Pro Max"
];

const USED_MODELS = [
  "iPhone 12 Mini",
  "iPhone 12",
  "iPhone 12 Pro",
  "iPhone 12 Pro Max",
  "iPhone 13 Mini",
  "iPhone 13",
  "iPhone 13 Pro",
  "iPhone 13 Pro Max",
  "iPhone 14",
  "iPhone 14 Plus",
  "iPhone 14 Pro",
  "iPhone 14 Pro Max",
  "iPhone 15",
  "iPhone 15 Plus",
  "iPhone 15 Pro",
  "iPhone 15 Pro Max",
  "iPhone 16",
  "iPhone 16 Plus",
  "iPhone 16 Pro",
  "iPhone 16 Pro Max"
];

const STORAGE_OPTIONS = ["128GB", "256GB", "512GB", "1TB"];

// Cores Padronizadas Apple
const APPLE_COLORS = [
  "Titânio Natural",
  "Titânio Deserto",
  "Titânio Preto",
  "Titânio Branco",
  "Titânio Laranja",
  "Titânio Azul",
  "Preto Espacial",
  "Meia-noite",
  "Estelar",
  "Prata",
  "Grafite",
  "Dourado",
  "Azul Sierra",
  "Azul Pacífico",
  "Verde Alpino",
  "Roxo Profundo",
  "Laranja",
  "Branco",
  "Preto",
  "Azul",
  "Verde",
  "Rosa",
  "Amarelo",
  "Roxo",
  "Verde-azulado",
  "Ultramar",
  "Laranja Cósmico",
  "Azul Profundo",
  "Lavanda",
  "Azul Névoa",
  "Sálvia",
  "Vermelho (Product RED)"
];

// Função para mapear cores oficiais por modelo de iPhone
const getColorsForModel = (modelName) => {
  const model = String(modelName || '').toLowerCase();
  
  if (model.includes('17 pro')) {
    return ["Laranja Cósmico", "Azul Profundo", "Prata"];
  }
  if (model.includes('16 pro')) {
    return ["Titânio Natural", "Titânio Deserto", "Titânio Preto", "Titânio Branco"];
  }
  if (model.includes('15 pro')) {
    return ["Titânio Natural", "Titânio Preto", "Titânio Branco", "Titânio Azul"];
  }
  if (model.includes('14 pro')) {
    return ["Roxo Profundo", "Preto Espacial", "Prata", "Dourado"];
  }
  if (model.includes('13 pro')) {
    return ["Azul Sierra", "Grafite", "Dourado", "Prata", "Verde Alpino"];
  }
  if (model.includes('12 pro')) {
    return ["Azul Pacífico", "Grafite", "Dourado", "Prata"];
  }
  
  // Modelos regulares
  if (model.includes('17')) {
    return ["Preto", "Branco", "Lavanda", "Azul Névoa", "Sálvia"];
  }
  if (model.includes('16')) {
    return ["Preto", "Branco", "Rosa", "Verde-azulado", "Ultramar"];
  }
  if (model.includes('15')) {
    return ["Preto", "Azul", "Verde", "Amarelo", "Rosa"];
  }
  if (model.includes('14')) {
    return ["Meia-noite", "Estelar", "Azul", "Roxo", "Amarelo", "Vermelho (Product RED)"];
  }
  if (model.includes('13')) {
    return ["Meia-noite", "Estelar", "Azul", "Rosa", "Verde", "Vermelho (Product RED)"];
  }
  if (model.includes('12')) {
    return ["Preto", "Branco", "Azul", "Verde", "Roxo", "Vermelho (Product RED)"];
  }

  return ["Meia-noite", "Estelar", "Preto Espacial", "Titânio Natural", "Prata", "Dourado", "Azul", "Verde"];
}

// Validação de IMEI com o Algoritmo de Luhn
const isValidIMEI = (imei) => {
  const clean = String(imei).trim().replace(/\D/g, '');
  if (clean.length !== 15) return false;
  
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(clean[i], 10);
    if (i % 2 !== 0) {
      digit *= 2;
      if (digit > 9) {
        digit = (digit % 10) + 1;
      }
    }
    sum += digit;
  }
  
  const checkDigit = parseInt(clean[14], 10);
  const calculatedCheckDigit = (10 - (sum % 10)) % 10;
  return checkDigit === calculatedCheckDigit;
};

function App() {
  // Dados do Cliente e IMEI
  const [clientName, setClientName] = useState('')
  const [imeiNew, setImeiNew] = useState('')
  const [imeiUsed, setImeiUsed] = useState('')

  // Tipo de Entrada (Venda com Trade-in ou Compra de Fornecedor)
  const [entryType, setEntryType] = useState('trade-in')
  const [editingRecordId, setEditingRecordId] = useState(null)
  const [supplierCost, setSupplierCost] = useState('')
  const [supplierVitrine, setSupplierVitrine] = useState('')

  // Inputs de Aparelhos (Novo)
  const [newModel, setNewModel] = useState(NEW_MODELS[0])
  const [newStorage, setNewStorage] = useState(STORAGE_OPTIONS[0])
  const [newColor, setNewColor] = useState(APPLE_COLORS[0])
  const [newCost, setNewCost] = useState('')
  
  // Lucros e Despesas
  const [profitMargin, setProfitMargin] = useState('800') 
  const [operationalCost, setOperationalCost] = useState('120') 

  // Múltiplos Splits de Pagamento Adicional
  const [paymentSplits, setPaymentSplits] = useState([
    { id: 1, value: '', gateway: 'Dinheiro / Pix', type: 'credit', installments: 1 }
  ])

  // Inputs de Aparelhos (Usado)
  const [usedModel, setUsedModel] = useState(USED_MODELS[5]) 
  const [usedStorage, setUsedStorage] = useState(STORAGE_OPTIONS[0])
  const [usedColor, setUsedColor] = useState(APPLE_COLORS[0])
  const [usedCategory, setUsedCategory] = useState('Comum')

  // Checklist do Usado
  const [batteryHealth, setBatteryHealth] = useState(85)
  const [originalScreen, setOriginalScreen] = useState(true)
  const [biometricsStatus, setBiometricsStatus] = useState('ok') 
  const [cameraStatus, setCameraStatus] = useState('ok') 
  const [bodyCondition, setBodyCondition] = useState('Excelente') 

  // Estados Auxiliares
  const [copySuccess, setCopySuccess] = useState(false)
  const [dbStatus, setDbStatus] = useState({ connected: false, mode: 'checking', errorMsg: '' })
  const [evaluations, setEvaluations] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterEntryType, setFilterEntryType] = useState('all')
  const [filterModel, setFilterModel] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc')
  const [stockSearchQuery, setStockSearchQuery] = useState('')
  const [stockFilterCategory, setStockFilterCategory] = useState('all')
  const [stockPricingMode, setStockPricingMode] = useState('retail')
  const [selectedStockKeys, setSelectedStockKeys] = useState([])
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' })

  const triggerNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }))
    }, 3000)
  }

  const vibrateFeedback = (type) => {
    if ('vibrate' in navigator) {
      if (type === 'defeito' || type === 'não') {
        navigator.vibrate([30, 40, 30])
      } else if (type === 'detalhe' || type === 'sim') {
        navigator.vibrate(25)
      } else {
        navigator.vibrate(15)
      }
    }
  }

  // Controle de Migração de Dados Locais
  const [localRecordsToSync, setLocalRecordsToSync] = useState([])
  const [isSyncingLocal, setIsSyncingLocal] = useState(false)

  // --- Estados do Checklist de Seminovos (Aba Especial) ---
  const [activeTab, setActiveTab] = useState('landing') // landing | simulator | checklist
  const [currentUser, setCurrentUser] = useState(null)
  const [loginTarget, setLoginTarget] = useState(null)
  const [passwordInput, setPasswordInput] = useState('')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [activeSection, setActiveSection] = useState('estetica') // estetica | funcional | seguranca
  
  // 1. Identificação
  const [sellerName, setSellerName] = useState('')
  const [checklistClientName, setChecklistClientName] = useState('')
  const [checklistDeviceModel, setChecklistDeviceModel] = useState(USED_MODELS[5])
  const [checklistDeviceColor, setChecklistDeviceColor] = useState(APPLE_COLORS[0])
  const [checklistDeviceStorage, setChecklistDeviceStorage] = useState(STORAGE_OPTIONS[0])
  const [checklistSerialImei, setChecklistSerialImei] = useState('')

  // 2. Checklist Técnico
  // A. Estética
  const [esteticaTela, setEsteticaTela] = useState('bom') // bom | detalhe | defeito
  const [esteticaTraseira, setEsteticaTraseira] = useState('bom') // bom | detalhe | defeito
  const [esteticaLaterais, setEsteticaLaterais] = useState('bom') // bom | detalhe | defeito
  const [esteticaLentes, setEsteticaLentes] = useState('bom') // bom | detalhe | defeito

  // B. Funcional
  const [funcionalBatteryHealth, setFuncionalBatteryHealth] = useState(85)
  const [funcionalPecaDesconhecida, setFuncionalPecaDesconhecida] = useState('não') // não | sim
  const [funcionalBiometria, setFuncionalBiometria] = useState('ok') // ok | defeito
  const [funcionalCameras, setFuncionalCameras] = useState('ok') // ok | defeito
  const [funcionalAudio, setFuncionalAudio] = useState('ok') // ok | defeito
  const [funcionalConectividade, setFuncionalConectividade] = useState('ok') // ok | defeito
  const [funcionalBotoes, setFuncionalBotoes] = useState('ok') // ok | defeito

  // C. Segurança
  const [segurancaIcloud, setSegurancaIcloud] = useState('sim') // sim (desativado) | não
  const [segurancaDemo, setSegurancaDemo] = useState('não') // não | sim

  // 3. Área de Evidências (Fotos em Base64 ou URL)
  const [photoTela, setPhotoTela] = useState(null)
  const [photoTraseira, setPhotoTraseira] = useState(null)
  const [photoLaterais, setPhotoLaterais] = useState(null)
  const [photoConector, setPhotoConector] = useState(null)

  // 4. Resumo e Fechamento
  const [referenceValue, setReferenceValue] = useState('')
  const [customCreditValue, setCustomCreditValue] = useState('')
  const [checklistConfirmed, setChecklistConfirmed] = useState(false)

  // Histórico de checklists
  const [checklistsList, setChecklistsList] = useState([])
  const [isSavingChecklist, setIsSavingChecklist] = useState(false)
  const [checklistSearchQuery, setChecklistSearchQuery] = useState('')
  const [selectedChecklistForView, setSelectedChecklistForView] = useState(null)
  const [selectedPhotoZoom, setSelectedPhotoZoom] = useState(null)

  // Fitch Assistência States
  const [clientesList, setClientesList] = useState([])
  const [dispositivosList, setDispositivosList] = useState([])
  const [pecasList, setPecasList] = useState([])
  const [ordensServicoList, setOrdensServicoList] = useState([])
  const [assistenciaSubTab, setAssistenciaSubTab] = useState('balcao')
  
  // OS Form States
  const [osType, setOsType] = useState('Serviço') // 'Serviço' ou 'Garantia'
  const [osClientName, setOsClientName] = useState('')
  const [osClientPhone, setOsClientPhone] = useState('')
  const [osClientCpf, setOsClientCpf] = useState('')
  const [osDeviceModel, setOsDeviceModel] = useState('iPhone 13')
  const [osDeviceColor, setOsDeviceColor] = useState('Preto')
  const [osDeviceStorage, setOsDeviceStorage] = useState('128GB')
  const [osDeviceImei, setOsDeviceImei] = useState('')
  const [osDeviceSerial, setOsDeviceSerial] = useState('')
  const [osSymptom, setOsSymptom] = useState('')
  const [osChecklistEntrada, setOsChecklistEntrada] = useState({
    faceId: 'NT', camera: 'NT', tela: 'NT', audio: 'NT', conexao: 'NT', bateria: 'NT', carcaca: 'NT'
  })
  const [osLaborValue, setOsLaborValue] = useState('')
  const [osDiscountValue, setOsDiscountValue] = useState('')

  // IA Co-Pilot & Parts Modals States
  const [iaQuestion, setIaQuestion] = useState('')
  const [iaAnswer, setIaAnswer] = useState('')
  const [isIaLoading, setIsIaLoading] = useState(false)

  const [newPartSku, setNewPartSku] = useState('')
  const [newPartName, setNewPartName] = useState('')
  const [newPartCompat, setNewPartCompat] = useState('iPhone 13')
  const [newPartCusto, setNewPartCusto] = useState('')
  const [newPartVenda, setNewPartVenda] = useState('')
  const [newPartEstoque, setNewPartEstoque] = useState('')
  const [newPartMinimo, setNewPartMinimo] = useState('2')

  const [selectedOsForPart, setSelectedOsForPart] = useState(null)
  const [selectedPartForOS, setSelectedPartForOS] = useState(null)
  const [serialInstalledForOS, setSerialInstalledForOS] = useState('')
  const [showAddPartModal, setShowAddPartModal] = useState(false)

  const [selectedOsForChecklistSaida, setSelectedOsForChecklistSaida] = useState(null)
  const [osChecklistSaidaEdit, setOsChecklistSaidaEdit] = useState({
    faceId: 'NT', camera: 'NT', tela: 'NT', audio: 'NT', conexao: 'NT', bateria: 'NT', carcaca: 'NT'
  })

  // --- Estados e Funções de Recursos Avançados (v12) ---
  const [blacklistStatus, setBlacklistStatus] = useState(null)
  const [blacklistStatusNew, setBlacklistStatusNew] = useState(null)
  const [blacklistStatusUsed, setBlacklistStatusUsed] = useState(null)

  const signatureCanvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSigned, setHasSigned] = useState(false)

  const checkIMEIBlacklist = (imeiVal, target = 'checklist') => {
    const imei = String(imeiVal).trim().replace(/\D/g, '')
    if (!imei || imei.length !== 15) {
      if (target === 'checklist') setBlacklistStatus(null)
      if (target === 'new') setBlacklistStatusNew(null)
      if (target === 'used') setBlacklistStatusUsed(null)
      return
    }
    if (target === 'checklist') setBlacklistStatus('checking')
    if (target === 'new') setBlacklistStatusNew('checking')
    if (target === 'used') setBlacklistStatusUsed('checking')
    
    setTimeout(() => {
      if (imei.endsWith('777') || imei.endsWith('999')) {
        if (target === 'checklist') setBlacklistStatus('blocked')
        if (target === 'new') setBlacklistStatusNew('blocked')
        if (target === 'used') setBlacklistStatusUsed('blocked')
        triggerNotification('ATENÇÃO: Este dispositivo possui restrição ativa de perda/roubo cadastrada!', 'error')
      } else {
        if (target === 'checklist') setBlacklistStatus('clean')
        if (target === 'new') setBlacklistStatusNew('clean')
        if (target === 'used') setBlacklistStatusUsed('clean')
      }
    }, 1200)
  }

  const getCoordinates = (e) => {
    const canvas = signatureCanvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  const startDrawing = (e) => {
    e.preventDefault()
    const canvas = signatureCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const coords = getCoordinates(e)
    ctx.beginPath()
    ctx.moveTo(coords.x, coords.y)
    setIsDrawing(true)
  }

  const draw = (e) => {
    if (!isDrawing) return
    e.preventDefault()
    const canvas = signatureCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const coords = getCoordinates(e)
    ctx.lineTo(coords.x, coords.y)
    ctx.strokeStyle = '#0f172a'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    setHasSigned(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSigned(false)
  }

  // Geração e Impressão de Laudo PDF de Recebimento
  const printChecklistReceipt = (record) => {
    const printWindow = window.open('', '_blank', 'width=800,height=800')
    if (!printWindow) return
    
    const html = `
      <html>
        <head>
          <title>Laudo Trade-In Fitch - ${record.client_name || record.clientName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; padding: 30px; line-height: 1.5; background-color: #ffffff; }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 25px; }
            .logo-container { width: 44px; height: 44px; border-radius: 50%; background-color: #0f172a; display: flex; align-items: center; justify-content: center; padding: 6px; box-sizing: border-box; }
            .logo { max-height: 100%; max-width: 100%; object-fit: contain; }
            .title { font-size: 20px; font-weight: bold; margin: 0; color: #0f172a; }
            .meta { font-size: 11px; color: #64748b; margin-top: 5px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px; }
            .grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
            @media (min-width: 600px) { .grid { grid-template-columns: repeat(2, 1fr); } }
            .item { font-size: 13px; display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed #f1f5f9; }
            .label { color: #64748b; }
            .value { font-weight: bold; color: #0f172a; }
            .grade-box { display: flex; align-items: center; justify-content: center; padding: 15px; border-radius: 12px; border: 1px solid #cbd5e1; background-color: #f8fafc; text-align: center; margin-bottom: 20px; }
            .grade-title { font-size: 14px; color: #475569; margin: 0; }
            .grade-value { font-size: 40px; font-weight: 900; margin: 5px 0; color: #059669; }
            .signature-area { margin-top: 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
            .signature-img { max-height: 80px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; }
            .signature-label { font-size: 11px; color: #64748b; margin-top: 5px; }
            .photo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 15px; }
            .photo-box { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; height: 100px; display: flex; align-items: center; justify-content: center; background: #f8fafc; }
            .photo-img { width: 100%; height: 100%; object-fit: cover; }
            @media print {
              body { padding: 0; margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">🍎 LAUDO TÉCNICO DE TRADE-IN</h1>
              <div class="meta">FITCH INVESTIMENTOS • Data: ${new Date(record.created_at).toLocaleDateString('pt-BR')} ${new Date(record.created_at).toLocaleTimeString('pt-BR')}</div>
            </div>
            <div class="logo-container">
              <img class="logo" src="${logo}" alt="Fitch Logo" />
            </div>
          </div>

          <div class="grade-box">
            <div>
              <p class="grade-title">Classificação Geral do Aparelho Usado</p>
              <h2 class="grade-value">GRADE ${record.grade}</h2>
              <p style="margin: 0; font-size: 11px; color: #64748b;">Aparelho avaliado para compensação de crédito comercial.</p>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">1. Informações Básicas</h2>
            <div class="grid">
              <div class="item"><span class="label">Vendedor:</span><span class="value">${record.seller_name || 'Geral'}</span></div>
              <div class="item"><span class="label">Cliente:</span><span class="value">${record.client_name}</span></div>
              <div class="item"><span class="label">Modelo do Aparelho:</span><span class="value">${record.device_model} ${record.device_storage || ''}</span></div>
              <div class="item"><span class="label">Cor do Aparelho:</span><span class="value">${record.device_color || 'Não especificada'}</span></div>
              <div class="item"><span class="label">IMEI/Serial:</span><span class="value">${record.serial_imei}</span></div>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">2. Resultados das Avaliações</h2>
            <div class="grid">
              <div class="item"><span class="label">Saúde da Bateria:</span><span class="value">${record.battery_health}%</span></div>
              <div class="item"><span class="label">Tela Original:</span><span class="value">${record.checklist_funcional?.peca_desconhecida === 'sim' ? 'Não (Paralela/Trocada)' : 'Sim'}</span></div>
              <div class="item"><span class="label">Face ID / Touch ID:</span><span class="value">${(record.checklist_funcional?.biometria || 'ok') === 'ok' ? 'OK Funcionando' : 'Defeito'}</span></div>
              <div class="item"><span class="label">Câmeras:</span><span class="value">${(record.checklist_funcional?.cameras || 'ok') === 'ok' ? 'OK Funcionando' : 'Defeito'}</span></div>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">3. Créditos Finais</h2>
            <div class="grid">
              <div class="item"><span class="label">Preço Ref. Vitrine (Novo):</span><span class="value">R$ ${(record.reference_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
              <div class="item"><span class="label">Crédito Sugerido / Concedido:</span><span class="value" style="color: #059669; font-size: 16px;">R$ ${(record.evaluation_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
            </div>
          </div>

          ${record.photos && (record.photos.tela || record.photos.traseira || record.photos.laterais || record.photos.conector) ? `
          <div class="section">
            <h2 class="section-title">4. Evidências Fotográficas</h2>
            <div class="photo-grid">
              ${record.photos.tela ? `<div class="photo-box"><img class="photo-img" src="${record.photos.tela}" /></div>` : ''}
              ${record.photos.traseira ? `<div class="photo-box"><img class="photo-img" src="${record.photos.traseira}" /></div>` : ''}
              ${record.photos.laterais ? `<div class="photo-box"><img class="photo-img" src="${record.photos.laterais}" /></div>` : ''}
              ${record.photos.conector ? `<div class="photo-box"><img class="photo-img" src="${record.photos.conector}" /></div>` : ''}
            </div>
          </div>
          ` : ''}

          ${record.signature ? `
          <div class="signature-area">
            <img class="signature-img" src="${record.signature}" />
            <div class="signature-label">Assinatura digital do Cliente</div>
          </div>
          ` : ''}

          <div style="margin-top: 30px; font-size: 9px; color: #94a3b8; text-align: center;" class="no-print">
            Pressione Ctrl+P ou clique com o botão direito para Salvar como PDF ou Imprimir.
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  // Agregações de Estatísticas de KPI do Dashboard Gerencial
  const dashboardStats = useMemo(() => {
    const sellerCounts = {}
    const gradeCounts = { A: 0, B: 0, C: 0 }
    let totalCreditValue = 0
    let totalReferenceValue = 0

    checklistsList.forEach(item => {
      const seller = item.seller_name || item.sellerName || 'Geral'
      sellerCounts[seller] = (sellerCounts[seller] || 0) + 1

      const grade = item.grade || 'A'
      if (gradeCounts[grade] !== undefined) {
        gradeCounts[grade] += 1
      }
      totalCreditValue += parseFloat(item.evaluation_value || item.evaluationValue || 0)
      totalReferenceValue += parseFloat(item.reference_value || item.referenceValue || 0)
    })

    const sellersArray = Object.entries(sellerCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)

    return {
      sellers: sellersArray,
      grades: gradeCounts,
      totalCredit: totalCreditValue,
      totalReference: totalReferenceValue,
      totalLaudos: checklistsList.length
    }
  }, [checklistsList])

  // Sincronizar cores do simulador (Novo)
  useEffect(() => {
    const availableColors = getColorsForModel(newModel);
    if (!availableColors.includes(newColor)) {
      setNewColor(availableColors[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newModel]);

  // Sincronizar cores do simulador (Usado)
  useEffect(() => {
    const availableColors = getColorsForModel(usedModel);
    if (!availableColors.includes(usedColor)) {
      setUsedColor(availableColors[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usedModel]);

  // Sincronizar cores do checklist
  useEffect(() => {
    const availableColors = getColorsForModel(checklistDeviceModel);
    if (!availableColors.includes(checklistDeviceColor)) {
      setChecklistDeviceColor(availableColors[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checklistDeviceModel]);

  // Restaurar rascunho do checklist ao montar
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('fitch_checklist_draft');
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (draft.checklistClientName) setChecklistClientName(draft.checklistClientName);
        if (draft.checklistDeviceModel) setChecklistDeviceModel(draft.checklistDeviceModel);
        if (draft.checklistDeviceColor) setChecklistDeviceColor(draft.checklistDeviceColor);
        if (draft.checklistDeviceStorage) setChecklistDeviceStorage(draft.checklistDeviceStorage);
        if (draft.checklistSerialImei) setChecklistSerialImei(draft.checklistSerialImei);
        if (draft.esteticaTela) setEsteticaTela(draft.esteticaTela);
        if (draft.esteticaTraseira) setEsteticaTraseira(draft.esteticaTraseira);
        if (draft.esteticaLaterais) setEsteticaLaterais(draft.esteticaLaterais);
        if (draft.esteticaLentes) setEsteticaLentes(draft.esteticaLentes);
        if (draft.funcionalBatteryHealth) setFuncionalBatteryHealth(draft.funcionalBatteryHealth);
        if (draft.funcionalPecaDesconhecida) setFuncionalPecaDesconhecida(draft.funcionalPecaDesconhecida);
        if (draft.funcionalBiometria) setFuncionalBiometria(draft.funcionalBiometria);
        if (draft.funcionalCameras) setFuncionalCameras(draft.funcionalCameras);
        if (draft.funcionalAudio) setFuncionalAudio(draft.funcionalAudio);
        if (draft.funcionalConectividade) setFuncionalConectividade(draft.funcionalConectividade);
        if (draft.funcionalBotoes) setFuncionalBotoes(draft.funcionalBotoes);
        if (draft.segurancaIcloud) setSegurancaIcloud(draft.segurancaIcloud);
        if (draft.segurancaDemo) setSegurancaDemo(draft.segurancaDemo);
        if (draft.referenceValue) setReferenceValue(draft.referenceValue);
        if (draft.customCreditValue) setCustomCreditValue(draft.customCreditValue);
      }
    } catch (e) {
      console.error('Error loading checklist draft:', e);
    }
  }, []);

  // Salvar rascunho do checklist a cada alteração
  useEffect(() => {
    const draft = {
      checklistClientName,
      checklistDeviceModel,
      checklistDeviceColor,
      checklistDeviceStorage,
      checklistSerialImei,
      esteticaTela,
      esteticaTraseira,
      esteticaLaterais,
      esteticaLentes,
      funcionalBatteryHealth,
      funcionalPecaDesconhecida,
      funcionalBiometria,
      funcionalCameras,
      funcionalAudio,
      funcionalConectividade,
      funcionalBotoes,
      segurancaIcloud,
      segurancaDemo,
      referenceValue,
      customCreditValue
    };
    localStorage.setItem('fitch_checklist_draft', JSON.stringify(draft));
  }, [
    checklistClientName,
    checklistDeviceModel,
    checklistDeviceColor,
    checklistDeviceStorage,
    checklistSerialImei,
    esteticaTela,
    esteticaTraseira,
    esteticaLaterais,
    esteticaLentes,
    funcionalBatteryHealth,
    funcionalPecaDesconhecida,
    funcionalBiometria,
    funcionalCameras,
    funcionalAudio,
    funcionalConectividade,
    funcionalBotoes,
    segurancaIcloud,
    segurancaDemo,
    referenceValue,
    customCreditValue
  ]);

  // Função para importar a lista inicial de seminovos de fornecedores enviada pelo usuário
  const importSupplierDevices = async (currentEvaluations) => {
    if (localStorage.getItem('fitch_supplier_list_imported_v3')) return;
    
    const supplierList = [
      { used_model: "iPhone 12", used_storage: "64GB", used_color: "Preto", imei_used: "353031117448546", max_evaluation: 1250.00, vitrine_price: 1850.00, battery_health: 85, client_name: "Fornecedor: Compra Direta" },
      { used_model: "iPhone 12", used_storage: "128GB", used_color: "Branco", imei_used: "353726514105918", max_evaluation: 1450.00, vitrine_price: 2050.00, battery_health: 100, client_name: "Fornecedor: Compra Direta" },
      { used_model: "iPhone 12 Pro", used_storage: "128GB", used_color: "Preto", imei_used: "358915480335469", max_evaluation: 1600.00, vitrine_price: 2200.00, battery_health: 90, client_name: "Fornecedor: Compra Direta" },
      { used_model: "iPhone 12 Pro", used_storage: "128GB", used_color: "Preto", imei_used: "353909592923929", max_evaluation: 1700.00, vitrine_price: 2300.00, battery_health: 100, client_name: "Fornecedor: Compra Direta" },
      { used_model: "iPhone 12 Pro", used_storage: "128GB", used_color: "Azul Pacífico", imei_used: "356037840171369", max_evaluation: 1750.00, vitrine_price: 2350.00, battery_health: 94, client_name: "Fornecedor: Compra Direta" },
      { used_model: "iPhone 12 Pro", used_storage: "128GB", used_color: "Azul Pacífico", imei_used: "350905826408425", max_evaluation: 1700.00, vitrine_price: 2300.00, battery_health: 94, client_name: "Fornecedor: Compra Direta" },
      { used_model: "iPhone 13 Pro", used_storage: "128GB", used_color: "Prata", imei_used: "359072413027067", max_evaluation: 2150.00, vitrine_price: 2950.00, battery_health: 100, client_name: "Fornecedor: Compra Direta" },
      { used_model: "iPhone 13 Pro", used_storage: "128GB", used_color: "Dourado", imei_used: "352129380193749", max_evaluation: 2200.00, vitrine_price: 3000.00, battery_health: 90, client_name: "Fornecedor: Compra Direta" },
      { used_model: "iPhone 13 Pro Max", used_storage: "128GB", used_color: "Prata", imei_used: "350019040590644", max_evaluation: 2550.00, vitrine_price: 3450.00, battery_health: 90, client_name: "Fornecedor: Compra Direta" },
      { used_model: "iPhone 14 Pro", used_storage: "128GB", used_color: "Roxo Profundo", imei_used: "353115822777859", max_evaluation: 2600.00, vitrine_price: 3600.00, battery_health: 100, client_name: "Fornecedor: Compra Direta" },
      { used_model: "iPhone 14 Pro", used_storage: "128GB", used_color: "Prata", imei_used: "359128124242112", max_evaluation: 2600.00, vitrine_price: 3600.00, battery_health: 100, client_name: "Fornecedor: Compra Direta" },
      { used_model: "iPhone 14 Pro Max", used_storage: "128GB", used_color: "Dourado", imei_used: "355241306636722", max_evaluation: 3150.00, vitrine_price: 4250.00, battery_health: 100, client_name: "Fornecedor: Compra Direta" },
      { used_model: "iPhone 16", used_storage: "128GB", used_color: "Preto", imei_used: "356166897161195", max_evaluation: 3550.00, vitrine_price: 4550.00, battery_health: 100, client_name: "Fornecedor: Compra Direta" },
      { used_model: "iPhone 16 Pro",
        used_storage: "128GB", used_color: "Titânio Branco", imei_used: "359072846598569", max_evaluation: 4500.00, vitrine_price: 5500.00, battery_health: 96, client_name: "Fornecedor: Compra Direta" },
      { used_model: "iPhone 16 Pro Max", used_storage: "256GB", used_color: "Titânio Natural", imei_used: "356864566118708", max_evaluation: 5100.00, vitrine_price: 6200.00, battery_health: 94, client_name: "Fornecedor: Compra Direta" },
      { used_model: "iPhone 16 Pro Max", used_storage: "256GB", used_color: "Titânio Deserto", imei_used: "357590876977173", max_evaluation: 5320.00, vitrine_price: 6420.00, battery_health: 100, client_name: "Fornecedor: Compra Direta" }
    ];

    let insertedAny = false;
    for (const dev of supplierList) {
      const exists = currentEvaluations.some(item => (item.imei_used || item.imeiUsed) === dev.imei_used);
      if (!exists) {
        const record = {
          client_name: dev.client_name,
          imei_new: 'N/A',
          imei_used: dev.imei_used,
          new_model: 'COMPRA FORNECEDOR',
          new_storage: 'N/A',
          new_color: 'N/A',
          new_cost: 0,
          profit_margin: 0,
          operational_cost: 0,
          used_model: dev.used_model,
          used_storage: dev.used_storage,
          used_color: dev.used_color,
          used_category: 'Comum',
          additional_value: 0,
          gateway: 'Compra Direta',
          installments: 0,
          applied_rate: 0,
          net_received: 0,
          vitrine_price: dev.vitrine_price,
          max_evaluation: dev.max_evaluation,
          battery_health: dev.battery_health,
          original_screen: true,
          biometrics_status: 'ok',
          camera_status: 'ok',
          body_condition: 'Excelente',
          payment_splits: []
        };

        try {
          if (isSupabaseConfigured && dbStatus.connected) {
            await supabase.from('evaluations').insert([record]);
          } else {
            await localDb.saveEvaluation(record);
          }
          insertedAny = true;
        } catch (e) {
          console.error("Failed to import supplier device:", dev.imei_used, e);
        }
      }
    }

    localStorage.setItem('fitch_supplier_list_imported_v3', 'true');
    if (insertedAny) {
      loadEvaluations();
    }
  }

  // --- Fitch Assistência Business Logic Methods ---
  const loadAssistenciaData = async () => {
    try {
      const c = await localDb.getClientes()
      setClientesList(c)
      const d = await localDb.getDispositivos()
      setDispositivosList(d)
      const p = await localDb.getPecas()
      setPecasList(p)
      const o = await localDb.getOS()
      setOrdensServicoList(o)
    } catch (e) {
      console.error("Error loading assistance data:", e)
    }
  }

  const validarCPF = (cpf) => {
    const clean = String(cpf).replace(/\D/g, '')
    if (clean.length !== 11) return false
    if (/^(\d)\1{10}$/.test(clean)) return false
    let sum = 0
    for (let i = 0; i < 9; i++) sum += parseInt(clean.charAt(i)) * (10 - i)
    let rev = 11 - (sum % 11)
    if (rev === 10 || rev === 11) rev = 0
    if (rev !== parseInt(clean.charAt(9))) return false
    sum = 0
    for (let i = 0; i < 10; i++) sum += parseInt(clean.charAt(i)) * (11 - i)
    rev = 11 - (sum % 11)
    if (rev === 10 || rev === 11) rev = 0
    if (rev !== parseInt(clean.charAt(10))) return false
    return true
  }

  const validarIMEI = (imei) => {
    const clean = String(imei).replace(/\D/g, '')
    if (clean.length !== 15) return false
    let sum = 0
    for (let i = 0; i < 15; i++) {
      let digit = parseInt(clean.charAt(i), 10)
      if (i % 2 === 1) {
        digit *= 2
        if (digit > 9) {
          digit = (digit % 10) + 1
        }
      }
      sum += digit
    }
    return sum % 10 === 0
  }

  const handleSaveOS = async () => {
    if (!osClientName || !osClientPhone || !osClientCpf || !osDeviceImei || !osDeviceSerial) {
      triggerNotification('Todos os campos obrigatórios (*) devem ser preenchidos.', 'error')
      return
    }
    if (!validarCPF(osClientCpf)) {
      triggerNotification('CPF inválido! Corrija para prosseguir.', 'error')
      return
    }
    if (!validarIMEI(osDeviceImei)) {
      triggerNotification('IMEI inválido! Corrija para prosseguir (15 dígitos).', 'error')
      return
    }

    try {
      let cliente = clientesList.find(c => c.cpf_cnpj === osClientCpf)
      if (!cliente) {
        cliente = await localDb.saveCliente({
          nome: osClientName,
          cpf_cnpj: osClientCpf,
          telefone: osClientPhone
        })
      }

      let dispositivo = dispositivosList.find(d => d.imei === osDeviceImei || d.numero_serie === osDeviceSerial)
      if (!dispositivo) {
        dispositivo = await localDb.saveDispositivo({
          cliente_id: cliente.id,
          modelo: osDeviceModel,
          capacidade: osDeviceStorage,
          cor: osDeviceColor,
          imei: osDeviceImei,
          numero_serie: osDeviceSerial
        })
      }

      const record = {
        cliente_id: cliente.id,
        dispositivo_id: dispositivo.id,
        tecnico_responsavel: currentUser ? currentUser.name : 'Técnico Fitch',
        status: 'Entrada',
        tipo_os: osType,
        valor_mao_de_obra: osType === 'Garantia' ? 0 : (parseFloat(osLaborValue) || 0),
        valor_pecas: 0,
        valor_desconto: osType === 'Garantia' ? 0 : (parseFloat(osDiscountValue) || 0),
        checklist_entrada: osChecklistEntrada,
        checklist_saida: {},
        checklist_fotos: [],
        relatorio_tecnico: osSymptom,
        client_name: cliente.nome,
        device_model: `${dispositivo.modelo} ${dispositivo.capacidade} (${dispositivo.cor})`,
        serial_imei: dispositivo.imei
      }

      await localDb.saveOS(record)
      triggerNotification('Ordem de Serviço (OS) aberta com sucesso!')
      
      setOsType('Serviço')
      setOsClientName('')
      setOsClientPhone('')
      setOsClientCpf('')
      setOsDeviceImei('')
      setOsDeviceSerial('')
      setOsSymptom('')
      setOsLaborValue('')
      setOsDiscountValue('')
      setOsChecklistEntrada({
        faceId: 'NT', camera: 'NT', tela: 'NT', audio: 'NT', conexao: 'NT', bateria: 'NT', carcaca: 'NT'
      })

      loadAssistenciaData()
    } catch (e) {
      console.error(e)
      triggerNotification('Erro ao salvar OS.', 'error')
    }
  }

  const handleUpdateOSStatus = async (osId, nextStatus) => {
    const os = ordensServicoList.find(o => o.id === osId)
    if (!os) return

    let updatedData = { status: nextStatus }

    if (nextStatus === 'Pronto') {
      updatedData.checklist_saida = os.checklist_saida && Object.keys(os.checklist_saida).length > 0
        ? os.checklist_saida 
        : { ...os.checklist_entrada }
      
      triggerNotification(`Notificação enviada via WhatsApp para ${os.client_name}: Aparelho Pronto!`, 'success')
    }

    if (nextStatus === 'Entregue') {
      let formaPag = 'Garantia'
      if (os.tipo_os !== 'Garantia') {
        formaPag = window.prompt("Digite a forma de pagamento (Pix, Cartão, Dinheiro):", "Pix")
        if (formaPag === null) return
      }
      
      updatedData.forma_pagamento = formaPag
      updatedData.data_saida = new Date().toISOString()
      
      const finalRevenue = os.tipo_os === 'Garantia' ? 0 : os.valor_total
      const insumosCost = os.valor_pecas * 0.5
      
      const mockEvaluationRecord = {
        client_name: `OS #${os.os_number} [Retirada - ${os.tipo_os || 'Serviço'}]`,
        imei_new: 'N/A',
        imei_used: os.serial_imei,
        new_model: 'ASSISTENCIA TECNICA',
        new_storage: 'N/A',
        new_color: 'N/A',
        new_cost: 0,
        profit_margin: finalRevenue - insumosCost,
        operational_cost: 0,
        used_model: os.device_model.split(' ')[0] + ' ' + os.device_model.split(' ')[1],
        used_storage: os.device_model.includes('GB') ? os.device_model.match(/\d+GB/)[0] : '128GB',
        used_color: 'N/A',
        used_category: 'Comum',
        additional_value: 0,
        gateway: 'Assistencia',
        installments: 0,
        applied_rate: 0,
        net_received: finalRevenue,
        vitrine_price: finalRevenue,
        max_evaluation: insumosCost,
        battery_health: 100,
        original_screen: true,
        biometrics_status: 'ok',
        camera_status: 'ok',
        body_condition: 'Excelente'
      }

      try {
        if (isSupabaseConfigured) {
          await supabase.from('evaluations').insert([mockEvaluationRecord])
        } else {
          await localDb.saveEvaluation(mockEvaluationRecord)
        }
        loadEvaluations()
      } catch (err) {
        console.error(err)
      }

      triggerNotification(`OS faturada e arquivada via ${formaPag}!`, 'success')
    }

    try {
      await localDb.updateOS(osId, updatedData)
      triggerNotification(`OS #${os.os_number} alterada para ${nextStatus}`)
      loadAssistenciaData()
    } catch (e) {
      console.error(e)
      triggerNotification('Erro ao atualizar status.', 'error')
    }
  }

  const handleSavePartToOS = async () => {
    if (!selectedOsForPart || !selectedPartForOS) return
    const os = ordensServicoList.find(o => o.id === selectedOsForPart)
    const peca = pecasList.find(p => p.id === selectedPartForOS)
    if (!os || !peca) return

    if (peca.estoque_atual <= 0) {
      triggerNotification('Erro: Estoque insuficiente de peças para este modelo.', 'error')
      return
    }

    try {
      const updatedPeca = {
        estoque_atual: peca.estoque_atual - 1,
        estoque_reservado: peca.estoque_reservado + 1
      }
      await localDb.updatePeca(peca.id, updatedPeca)

      const updatedOS = {
        valor_pecas: os.valor_pecas + peca.preco_venda,
        diagnostico_tecnico: (os.diagnostico_tecnico || '') + `\n[Peça Instalada: ${peca.nome} (S/N: ${serialInstalledForOS || 'N/A'})]`
      }
      await localDb.updateOS(os.id, updatedOS)

      triggerNotification(`Peça ${peca.nome} vinculada à OS #${os.os_number} com sucesso!`)
      setShowAddPartModal(false)
      setSelectedPartForOS(null)
      setSerialInstalledForOS('')
      loadAssistenciaData()
    } catch (e) {
      console.error(e)
      triggerNotification('Erro ao vincular peça.', 'error')
    }
  }

  const handleSaveNewPart = async (e) => {
    e.preventDefault()
    if (!newPartSku || !newPartName || !newPartCusto || !newPartVenda || !newPartEstoque) {
      triggerNotification('Preencha todos os campos da peça.', 'error')
      return
    }

    try {
      await localDb.savePeca({
        sku: newPartSku,
        nome: newPartName,
        compatibilidade_modelo: newPartCompat,
        deposito_tipo: 'assistencia',
        preco_custo: parseFloat(newPartCusto) || 0,
        preco_venda: parseFloat(newPartVenda) || 0,
        estoque_atual: parseInt(newPartEstoque) || 0,
        estoque_minimo: parseInt(newPartMinimo) || 2
      })

      triggerNotification('Nova peça cadastrada com sucesso!')
      setNewPartSku('')
      setNewPartName('')
      setNewPartCusto('')
      setNewPartVenda('')
      setNewPartEstoque('')
      loadAssistenciaData()
    } catch (e) {
      console.error(e)
      triggerNotification('Erro ao cadastrar peça.', 'error')
    }
  }

  const handleSaveChecklistSaida = async () => {
    if (!selectedOsForChecklistSaida) return
    try {
      await localDb.updateOS(selectedOsForChecklistSaida, {
        checklist_saida: osChecklistSaidaEdit
      })
      triggerNotification('Checklist de Saída salvo com sucesso!')
      setSelectedOsForChecklistSaida(null)
      loadAssistenciaData()
    } catch (e) {
      console.error(e)
      triggerNotification('Erro ao salvar checklist de saída.', 'error')
    }
  }

  const handleIaQuery = async () => {
    if (!iaQuestion.trim()) return
    setIsIaLoading(true)
    setIaAnswer('')

    try {
      setTimeout(() => {
        const questionLower = iaQuestion.toLowerCase()
        let answerText = ""

        if (questionLower.includes('curto') || questionLower.includes('placa')) {
          answerText = `🔍 **Roteiro de Diagnóstico de Curto na Linha Principal (VDD_MAIN / VDD_BOOST):**
1. **Inspeção Visual**: Use microscópio para identificar trincas em capacitores cerâmicos ou marcas de oxidação.
2. **Injeção de Tensão**: Regule a fonte de bancada para **1.0V** com limite de **2A**. Injete na linha afetada.
3. **Câmera Térmica / Breu**: Aplique breu (rosin) na placa ou use câmera térmica. O componente que dissipar calor primeiro é o culpado.
*Dica Fitch:* Em iPhones 11 e 12, verifique sempre os capacitores ao redor do IC de Carga (Tigris/Hydra).`
        } else if (questionLower.includes('bateria') || questionLower.includes('mensagem')) {
          answerText = `🔋 **Roteiro para Remoção de Mensagem de Peça Desconhecida (Bateria):**
1. **Transplante de BMS**: Retire o circuito controlador (BMS) original da bateria antiga (degradada).
2. **Soldagem por Ponto**: Solde o BMS original nas novas células de reposição (use soldadora por ponto portátil).
3. **Reset de Ciclos**: Utilize uma programadora (ex: JC V1S / QianLi Apollo) com tag-on flex para redefinir a saúde para **100%** e os ciclos para **0**.
4. **Ciclo de Inicialização**: Ligue o iPhone inicialmente sem a bateria (na fonte) para registrar o erro de peça ausente, depois desligue e instale a nova bateria com BMS original.`
        } else if (questionLower.includes('face id') || questionLower.includes('dot projector')) {
          answerText = `👁️ **Diagnóstico de Face ID Inoperante:**
1. **Teste do Sensor de Proximidade (Flood Illuminator)**: Meça a linha de alimentação de **1.8V**. O transplante do sensor de luminosidade para o novo flex mantém o True Tone e Face ID.
2. **Falha do Dot Projector**: Geralmente causado por curto interno no diodo emissor devido à umidade.
3. **Procedimento de Reparo**: Use JCID V1S Pro com flex JC Tag-on para ler os dados criptografados do Dot Projector original, grave em um novo flex JC e solde o prisma original.`
        } else {
          answerText = `🤖 **Fitch Assist AI Co-Pilot:**
Recebi sua pergunta sobre: *"${iaQuestion}"*.
*Recomendação Técnica Geral:*
1. Sempre verifique o consumo de corrente na fonte antes de iniciar micro-soldagem.
2. Utilize multímetro em escala de diodo (condução reversa) para comparar linhas suspeitas com uma placa de referência espelho.
3. Utilize telas e periféricos homologados para evitar problemas de compatibilidade no iOS.`
        }

        setIaAnswer(answerText)
        setIsIaLoading(false)
      }, 1200)
    } catch (e) {
      console.error(e)
      setIaAnswer("Desculpe, ocorreu um erro ao contatar o Fitch Assist.")
      setIsIaLoading(false)
    }
  }

  const printOSReceipt = (os) => {
    const printWindow = window.open('', '_blank', 'width=850,height=800')
    if (!printWindow) {
      triggerNotification('Bloqueador de pop-ups ativo! Permita pop-ups para gerar o comprovante.', 'error')
      return
    }

    const formatCurrency = (val) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ordem de Serviço #${os.os_number} - Fitch</title>
        <style>
          body { font-family: 'Inter', sans-serif; margin: 40px; color: #0f172a; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 20px; }
          .logo { background: #0f172a; color: white; padding: 8px 16px; border-radius: 50px; font-weight: 800; }
          .info-block { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-top: 30px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px; font-size: 13px; }
          .checklist-table { width: 100%; border-collapse: collapse; margin-top: 30px; }
          .checklist-table th, .checklist-table td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 12px; }
          .checklist-table th { background: #f1f5f9; }
          .total-card { margin-top: 30px; background: #f1f5f9; padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">FITCH</div>
          <div><h2>ORDEM DE SERVIÇO #${os.os_number}</h2></div>
        </div>
        <div class="info-block">
          <div>
            <strong>Cliente:</strong> ${os.client_name}<br>
            <strong>Aparelho:</strong> ${os.device_model}<br>
            <strong>IMEI:</strong> ${os.serial_imei}
          </div>
          <div>
            <strong>Técnico:</strong> ${os.tecnico_responsavel || 'Não definido'}<br>
            <strong>Status:</strong> ${os.status}<br>
            <strong>Entrada:</strong> ${new Date(os.created_at).toLocaleDateString('pt-BR')}
          </div>
        </div>
        <h3>Defeito / Sintoma Relatado:</h3>
        <p>${os.relatorio_tecnico || 'Sem observações adicionais.'}</p>
        
        <h3>Checklist de Entrada:</h3>
        <table class="checklist-table">
          <thead>
            <tr>
              <th>Componente</th>
              <th>Status Recepção</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Face ID / Touch ID</td><td>${os.checklist_entrada?.faceId || 'NT'}</td></tr>
            <tr><td>Tela e Touch</td><td>${os.checklist_entrada?.tela || 'NT'}</td></tr>
            <tr><td>Câmeras</td><td>${os.checklist_entrada?.camera || 'NT'}</td></tr>
            <tr><td>Áudio (Microfone/Alto-falante)</td><td>${os.checklist_entrada?.audio || 'NT'}</td></tr>
            <tr><td>Conectividade (Wi-Fi/Rede)</td><td>${os.checklist_entrada?.conexao || 'NT'}</td></tr>
            <tr><td>Bateria</td><td>${os.checklist_entrada?.bateria || 'NT'}</td></tr>
            <tr><td>Carcaça e Botões</td><td>${os.checklist_entrada?.carcaca || 'NT'}</td></tr>
          </tbody>
        </table>

        <div class="total-card">
          <span>VALOR DA MÃO DE OBRA: ${formatCurrency(os.valor_mao_de_obra)}</span>
          <span>VALOR TOTAL: ${formatCurrency(os.valor_total)}</span>
        </div>
        
        <div style="margin-top: 50px; text-align: center; font-size: 11px; color: #64748b;">
          Assinatura do Cliente: __________________________________________________
        </div>
        <script>window.onload = function() { setTimeout(function() { window.print(); }, 500); }</script>
      </body>
      </html>
    `
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  // Carregar Histórico
  const loadEvaluations = async () => {
    try {
      if (supabaseInitError) {
        throw new Error(supabaseInitError)
      }
      let fetchedData = []
      if (isSupabaseConfigured) {
        setDbStatus({ connected: false, mode: 'checking', errorMsg: '' })
        const { data, error } = await supabase
          .from('evaluations')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        fetchedData = data || []
        setEvaluations(fetchedData)
        setDbStatus({ connected: true, mode: 'Supabase', errorMsg: '' })
      } else {
        const data = await localDb.getEvaluations()
        fetchedData = data
        setEvaluations(data)
        setDbStatus({ connected: false, mode: 'Local (Offline)', errorMsg: '' })
      }

      // Importar automaticamente a lista de fornecedores caso não esteja importada
      if (fetchedData && fetchedData.length >= 0) {
        importSupplierDevices(fetchedData)
      }
    } catch (err) {
      console.error('Database connection error:', err)
      const data = await localDb.getEvaluations()
      setEvaluations(data)
      setDbStatus({ 
        connected: false, 
        mode: 'Local (Fallback)', 
        errorMsg: err.message || String(err) 
      })
      if (data && data.length >= 0) {
        importSupplierDevices(data)
      }
    }
  }

  const loadChecklists = async () => {
    try {
      if (supabaseInitError) {
        throw new Error(supabaseInitError)
      }
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('seminovo_checklists')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) {
          if (error.code === '42P01') { // Undefined table error
            const localData = await localDb.getChecklists()
            setChecklistsList(localData)
          } else {
            throw error
          }
        } else {
          setChecklistsList(data || [])
        }
      } else {
        const data = await localDb.getChecklists()
        setChecklistsList(data)
      }
    } catch (err) {
      console.error('Error loading checklists:', err)
      const data = await localDb.getChecklists()
      setChecklistsList(data)
    }
  }

  useEffect(() => {
    loadEvaluations()
    loadChecklists()
    loadAssistenciaData()
  }, [])

  // --- Funções de Negócio do Checklist de Seminovos ---
  const compressChecklistImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/webp', 0.7);
          resolve(compressedBase64);
        };
      };
    });
  };

  const handleSaveChecklist = async () => {
    const signatureDataUrl = hasSigned ? signatureCanvasRef.current.toDataURL() : null;
    if (!sellerName.trim()) {
      triggerNotification('Preencha o Nome do Vendedor.', 'error')
      return
    }
    if (!checklistClientName.trim()) {
      triggerNotification('Preencha o Nome do Cliente.', 'error')
      return
    }
    if (!checklistSerialImei.trim()) {
      triggerNotification('Preencha o IMEI ou Número de Série.', 'error')
      return
    }
    const cleanImei = checklistSerialImei.trim();
    if (/^\d+$/.test(cleanImei) && cleanImei.length === 15) {
      if (!isValidIMEI(cleanImei)) {
        triggerNotification('O IMEI de 15 dígitos inserido é inválido!', 'error')
        return
      }
    }
    if (!checklistConfirmed) {
      triggerNotification('Você precisa atestar o termo de ciência.', 'error')
      return
    }

    setIsSavingChecklist(true)
    const generatedId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9)
    
    const esteticaObj = {
      tela: esteticaTela,
      traseira: esteticaTraseira,
      laterais: esteticaLaterais,
      lentes: esteticaLentes
    }

    const funcionalObj = {
      battery_health: parseInt(funcionalBatteryHealth) || 85,
      peca_desconhecida: funcionalPecaDesconhecida,
      biometria: funcionalBiometria,
      cameras: funcionalCameras,
      audio: funcionalAudio,
      conectividade: funcionalConectividade,
      botoes: funcionalBotoes
    }

    const segurancaObj = {
      icloud: segurancaIcloud,
      demo: segurancaDemo
    }

    const photosObj = {
      tela: photoTela,
      traseira: photoTraseira,
      laterais: photoLaterais,
      conector: photoConector
    }

    const newRecord = {
      id: generatedId,
      created_at: new Date().toISOString(),
      seller_name: sellerName.trim(),
      client_name: checklistClientName.trim(),
      device_model: checklistDeviceModel,
      device_storage: checklistDeviceStorage,
      device_color: checklistDeviceColor,
      serial_imei: checklistSerialImei.trim(),
      checklist_estetica: esteticaObj,
      checklist_funcional: funcionalObj,
      checklist_seguranca: segurancaObj,
      battery_health: parseInt(funcionalBatteryHealth) || 85,
      photos: photosObj,
      grade: checklistGradeData.grade,
      reference_value: parseFloat(referenceValue) || 0,
      evaluation_value: parseFloat(customCreditValue) || checklistGradeData.suggestedValue,
      confirmed: checklistConfirmed,
      signature: signatureDataUrl
    }

    try {
      if (isSupabaseConfigured && dbStatus.connected) {
        const { error } = await supabase
          .from('seminovo_checklists')
          .insert([newRecord])
        
        if (error) {
          if (error.code === '42P01') {
            await localDb.saveChecklist(newRecord)
            triggerNotification('Salvo localmente! Tabela de checklists inexistente na nuvem.', 'warning')
          } else {
            throw error
          }
        } else {
          triggerNotification('Checklist salvo no Supabase!')
        }
      } else {
        await localDb.saveChecklist(newRecord)
        triggerNotification('Checklist salvo localmente!')
      }

      clearSignature()
      localStorage.removeItem('fitch_checklist_draft')
      loadChecklists()
      
      setChecklistClientName('')
      setChecklistDeviceColor(APPLE_COLORS[0])
      setChecklistDeviceStorage(STORAGE_OPTIONS[0])
      setChecklistSerialImei('')
      setEsteticaTela('bom')
      setEsteticaTraseira('bom')
      setEsteticaLaterais('bom')
      setEsteticaLentes('bom')
      setFuncionalBatteryHealth(85)
      setFuncionalPecaDesconhecida('não')
      setFuncionalBiometria('ok')
      setFuncionalCameras('ok')
      setFuncionalAudio('ok')
      setFuncionalConectividade('ok')
      setFuncionalBotoes('ok')
      setSegurancaIcloud('sim')
      setSegurancaDemo('não')
      setPhotoTela(null)
      setPhotoTraseira(null)
      setPhotoLaterais(null)
      setPhotoConector(null)
      setReferenceValue('')
      setCustomCreditValue('')
      setChecklistConfirmed(false)
    } catch (err) {
      console.error('Error saving checklist:', err)
      try {
        await localDb.saveChecklist(newRecord)
        triggerNotification(`Erro na nuvem: ${err.message || String(err)}. Salvo localmente!`, 'warning')
        loadChecklists()
      } catch (localErr) {
        triggerNotification(`Erro ao salvar checklist: ${localErr.message || String(localErr)}`, 'error')
      }
    } finally {
      setIsSavingChecklist(false)
    }
  }

  const handleDeleteChecklist = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta inspeção?')) return

    try {
      if (isSupabaseConfigured && dbStatus.connected) {
        const { error } = await supabase
          .from('seminovo_checklists')
          .delete()
          .eq('id', id)
        
        if (error) {
          if (error.code === '42P01') {
            await localDb.deleteChecklist(id)
            triggerNotification('Registro deletado localmente.')
          } else {
            throw error
          }
        } else {
          triggerNotification('Registro excluído no Supabase.')
        }
      } else {
        await localDb.deleteChecklist(id)
        triggerNotification('Registro deletado localmente.')
      }
      loadChecklists()
    } catch (err) {
      console.error('Error deleting checklist:', err)
      triggerNotification('Erro ao excluir do histórico.', 'error')
    }
  }

  const handleCopyChecklistSummary = (record) => {
    const formatCurrency = (val) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
    }

    const estetica = record.checklist_estetica || {}
    const funcional = record.checklist_funcional || {}
    const seguranca = record.checklist_seguranca || {}

    const text = `📋 *LAUDO DE AVALIAÇÃO DE SEMINOVO - Fitch*
--------------------------------------------
👤 *Vendedor:* ${record.seller_name}
👤 *Cliente:* ${record.client_name}
📱 *Aparelho:* ${record.device_model} ${record.device_storage || ''} (${record.device_color || 'Cor não especificada'})
🆔 *IMEI/Serial:* ${record.serial_imei}

--------------------------------------------
🔍 *CHECKLIST TÉCNICO:*

⚠️ *A. Avaliação Estética:*
- Tela/Display: ${estetica.tela === 'bom' ? '🟢 OK' : estetica.tela === 'detalhe' ? '🟡 Detalhe' : '🔴 Defeito'}
- Vidro Traseiro: ${estetica.traseira === 'bom' ? '🟢 OK' : estetica.traseira === 'detalhe' ? '🟡 Detalhe' : '🔴 Defeito'}
- Laterais/Aro: ${estetica.laterais === 'bom' ? '🟢 OK' : estetica.laterais === 'detalhe' ? '🟡 Detalhe' : '🔴 Defeito'}
- Lentes da Câmera: ${estetica.lentes === 'bom' ? '🟢 OK' : estetica.lentes === 'detalhe' ? '🟡 Detalhe' : '🔴 Defeito'}

⚙️ *B. Avaliação Funcional:*
- Saúde da Bateria: ${record.battery_health}%
- Peça Desconhecida: ${funcional.peca_desconhecida === 'sim' ? '⚠️ PEÇA TROCADA/AVISO' : '🟢 Nenhuma'}
- Biometria (Face ID/Touch ID): ${funcional.biometria === 'ok' ? '🟢 OK' : '🔴 Defeito'}
- Câmeras e Foco (0.5x, 1x, 3x): ${funcional.cameras === 'ok' ? '🟢 OK' : '🔴 Defeito'}
- Áudio e Microfone: ${funcional.audio === 'ok' ? '🟢 OK' : '🔴 Defeito'}
- Conectividade (Wi-Fi/Rede): ${funcional.conectividade === 'ok' ? '🟢 OK' : '🔴 Defeito'}
- Botões Físicos: ${funcional.botoes === 'ok' ? '🟢 OK' : '🔴 Defeito'}

🛡️ *C. Segurança:*
- Buscar iPhone (iCloud): ${seguranca.icloud === 'sim' ? '🟢 Desativado' : '🔴 ATIVO'}
- Aparelho Vitrine/Demo: ${seguranca.demo === 'sim' ? '⚠️ Sim' : '🟢 Não'}

--------------------------------------------
📸 *EVIDÊNCIAS FOTOGRÁFICAS:*
- Tela Acesa: ${record.photos?.tela ? '✅ Anexada' : '❌ Não anexada'}
- Traseira: ${record.photos?.traseira ? '✅ Anexada' : '❌ Não anexada'}
- Laterais: ${record.photos?.laterais ? '✅ Anexada' : '❌ Não anexada'}
- Conector/Alto-falante: ${record.photos?.conector ? '✅ Anexada' : '❌ Não anexada'}

--------------------------------------------
🏆 *VEREDITO:*
- *Grade de Classificação:* Grade ${record.grade}
- *Valor de Referência (Vitrine):* ${formatCurrency(record.reference_value)}
- *Valor Final de Crédito:* ${formatCurrency(record.evaluation_value)}

*Gerado em:* ${new Date(record.created_at).toLocaleDateString('pt-BR')} ${new Date(record.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
*Sistema Fitch Trade-In Checklist Manager v9*`

    navigator.clipboard.writeText(text)
      .then(() => {
        triggerNotification('Resumo do laudo copiado!')
      })
      .catch(() => {
        triggerNotification('Erro ao copiar laudo.', 'error')
      })
  }

  // --- Funções de Autenticação e Acesso ---
  const requestAccess = (target) => {
    setLoginTarget(target)
    setShowLoginModal(true)
    setPasswordInput('')
  }

  const handleLogin = (e) => {
    if (e) e.preventDefault()
    const trimmedPw = passwordInput.trim()
    const user = USER_CREDENTIALS[trimmedPw]

    if (!user) {
      triggerNotification('Senha inválida!', 'error')
      return
    }

    if (loginTarget === 'simulator') {
      if (user.role !== 'admin' && user.role !== 'manager') {
        triggerNotification('Acesso negado! Apenas Administradores e Gerentes podem acessar o Simulador.', 'error')
        return
      }
    }

    setCurrentUser(user)
    setSellerName(user.name) // Auto-populate the checklist seller name field
    setActiveTab(loginTarget)
    setShowLoginModal(false)
    setPasswordInput('')
    triggerNotification(`Bem-vindo, ${user.name}!`, 'success')
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setSellerName('')
    setActiveTab('landing')
    triggerNotification('Sessão encerrada.')
  }

  // Monitorar se há dados no localStorage quando conectados ao Supabase
  useEffect(() => {
    if (dbStatus.connected && dbStatus.mode === 'Supabase') {
      localDb.getEvaluations().then(localData => {
        if (localData && localData.length > 0) {
          setLocalRecordsToSync(localData)
        }
      })
    }
  }, [dbStatus])

  // Lógica de Migração de Dados de localStorage -> Supabase
  const handleSyncLocalToCloud = async () => {
    setIsSyncingLocal(true)
    let successCount = 0
    
    try {
      for (const record of localRecordsToSync) {
        let loadedMargin = 800
        let loadedOpCost = 120

        if (record.profit_margin !== undefined && record.profit_margin !== null) {
          loadedMargin = record.profit_margin
          loadedOpCost = record.operational_cost !== undefined ? record.operational_cost : 120
        } else if (record.profitMargin !== undefined && record.profitMargin !== null) {
          loadedMargin = record.profitMargin
          loadedOpCost = record.operationalCost !== undefined ? record.operationalCost : 120
        } else {
          const oldCombined = parseFloat(record.operational_cost || record.operationalCost || 920)
          if (oldCombined === 920) {
            loadedMargin = 800
            loadedOpCost = 120
          } else {
            loadedMargin = oldCombined >= 120 ? oldCombined - 120 : 0
            loadedOpCost = oldCombined >= 120 ? 120 : oldCombined
          }
        }

        let loadedSplits = []
        if (record.payment_splits && Array.isArray(record.payment_splits)) {
          loadedSplits = record.payment_splits
        } else if (record.paymentSplits && Array.isArray(record.paymentSplits)) {
          loadedSplits = record.paymentSplits
        } else {
          const oldVal = String(record.additional_value || record.additionalValue || '')
          const oldGw = record.gateway || 'Dinheiro / Pix'
          const oldInst = record.installments || 1
          
          let oldType = 'credit'
          if (oldInst === 1 && (oldGw === 'Dinheiro / Pix' || (GATEWAY_RATES[oldGw]?.debitRate === record.applied_rate))) {
            oldType = 'debit'
          }

          loadedSplits = [{
            id: 1,
            value: oldVal,
            gateway: oldGw,
            type: oldType,
            installments: oldInst
          }]
        }

        const cloudRecord = {
          client_name: record.client_name || record.clientName || 'Cliente Geral',
          imei_new: record.imei_new || record.imeiNew || '000000000000000',
          imei_used: record.imei_used || record.imeiUsed || '000000000000000',
          new_model: record.new_model || record.newModel || NEW_MODELS[0],
          new_storage: record.new_storage || record.newStorage || '128GB',
          new_color: record.new_color || record.newColor || APPLE_COLORS[0],
          new_cost: parseFloat(record.new_cost || record.newCost) || 0,
          profit_margin: parseFloat(loadedMargin) || 800,
          operational_cost: parseFloat(loadedOpCost) || 120,
          used_model: record.used_model || record.usedModel || USED_MODELS[0],
          used_storage: record.used_storage || record.usedStorage || '128GB',
          used_color: record.used_color || record.usedColor || APPLE_COLORS[0],
          used_category: record.used_category || record.usedCategory || 'Comum',
          additional_value: parseFloat(record.additional_value || record.additionalValue) || 0,
          gateway: record.gateway || 'Dinheiro / Pix',
          installments: parseInt(record.installments) || 1,
          applied_rate: parseFloat(record.applied_rate || record.appliedRate) || 0,
          net_received: parseFloat(record.net_received || record.netReceived) || 0,
          vitrine_price: parseFloat(record.vitrine_price || record.vitrinePrice) || 0,
          max_evaluation: parseFloat(record.max_evaluation || record.maxEvaluation) || 0,
          battery_health: parseInt(record.battery_health || record.batteryHealth) || 85,
          original_screen: record.original_screen !== undefined ? record.original_screen : true,
          biometrics_status: record.biometrics_status || 'ok',
          camera_status: record.camera_status || 'ok',
          body_condition: record.body_condition || 'Excelente',
          payment_splits: loadedSplits
        }

        const { error } = await supabase
          .from('evaluations')
          .insert([cloudRecord])
        
        if (error) throw error
        successCount++
      }

      localStorage.removeItem('trade_in_evaluations')
      setLocalRecordsToSync([])
      triggerNotification(`${successCount} avaliações enviadas para a nuvem com sucesso!`)
      loadEvaluations()
    } catch (err) {
      console.error('Error during data migration:', err)
      triggerNotification(`Erro de sincronização. Concluídos: ${successCount}`, 'error')
    } finally {
      setIsSyncingLocal(false)
    }
  }

  // Auxiliares de Splits
  const handleSplitChange = (index, field, val) => {
    const updated = [...paymentSplits]
    updated[index][field] = val
    
    if (field === 'gateway') {
      const rates = GATEWAY_RATES[val]
      if (rates) {
        if (!rates.hasDebit && updated[index].type === 'debit') {
          updated[index].type = 'credit'
          updated[index].installments = 1
        } else if (updated[index].type === 'credit') {
          const maxInstallment = Math.max(...Object.keys(rates.creditRates).map(Number))
          if (updated[index].installments > maxInstallment) {
            updated[index].installments = maxInstallment
          }
        }
      }
    }
    
    if (field === 'type' && val === 'debit') {
      updated[index].installments = 1
    }

    setPaymentSplits(updated)
  }

  const addPaymentSplit = () => {
    const newId = paymentSplits.length > 0 ? Math.max(...paymentSplits.map(s => s.id)) + 1 : 1
    setPaymentSplits([
      ...paymentSplits,
      { id: newId, value: '', gateway: 'Dinheiro / Pix', type: 'credit', installments: 1 }
    ])
  }

  const removePaymentSplit = (index) => {
    if (paymentSplits.length === 1) return
    setPaymentSplits(paymentSplits.filter((_, i) => i !== index))
  }

  // Estatísticas de Estoque Histórico
  const inventoryStats = useMemo(() => {
    const stats = {}
    evaluations.forEach(item => {
      const cat = item.used_category || item.usedCategory || 'Comum'
      const key = `${item.used_model} ${item.used_storage} - ${cat}`
      const evalVal = parseFloat(item.max_evaluation || item.maxEvaluation || 0)
      const vitrineVal = parseFloat(item.vitrine_price || item.vitrinePrice || 0)
      
      const opCostVal = ((item.new_model || item.newModel) === 'COMPRA FORNECEDOR') 
        ? 120 
        : parseFloat(item.operational_cost !== undefined ? item.operational_cost : (item.operationalCost !== undefined ? item.operationalCost : 120))

      if (!stats[key]) {
        stats[key] = {
          model: item.used_model || item.usedModel,
          storage: item.used_storage || item.usedStorage,
          category: cat,
          count: 0,
          totalEval: 0,
          totalVitrine: 0,
          totalOpCost: 0
        }
      }
      stats[key].count += 1
      stats[key].totalEval += evalVal
      stats[key].totalVitrine += vitrineVal
      stats[key].totalOpCost += opCostVal
    })
    
    return Object.values(stats).map(item => ({
      ...item,
      avgCost: item.totalEval / item.count,
      avgVitrine: item.totalVitrine / item.count,
      avgOpCost: item.totalOpCost / item.count
    })).sort((a, b) => b.count - a.count)
  }, [evaluations])

  const currentModelAverage = useMemo(() => {
    const match = inventoryStats.find(item => 
      (item.model === usedModel) && 
      (item.storage === usedStorage) && 
      (item.category === usedCategory)
    )
    return match ? { avgCost: match.avgCost, avgVitrine: match.avgVitrine, count: match.count, category: match.category } : null
  }, [usedModel, usedStorage, usedCategory, inventoryStats])

  // Filtragem específica do painel de estoque/atacado
  const filteredStockStats = useMemo(() => {
    let result = [...inventoryStats]
    if (stockSearchQuery.trim()) {
      const q = stockSearchQuery.toLowerCase()
      result = result.filter(item => item.model.toLowerCase().includes(q))
    }
    if (stockFilterCategory !== 'all') {
      result = result.filter(item => item.category === stockFilterCategory)
    }
    return result
  }, [inventoryStats, stockSearchQuery, stockFilterCategory])

  // Ajuste de margem dinâmico baseado em estoque crítico (giro rápido)
  useEffect(() => {
    if (currentModelAverage && currentModelAverage.count >= 5) {
      setProfitMargin('600') // Reduz margem de lucro sugerida em 25% (de R$ 800 para R$ 600)
    } else {
      setProfitMargin('800') // Restaura margem padrão
    }
  }, [usedModel, usedStorage, currentModelAverage])

  // Lógica Matemática e Agregação de Pagamentos Combinados
  const calculationData = useMemo(() => {
    const cost = parseFloat(newCost) || 0
    const pMargin = parseFloat(profitMargin) || 0 
    const opCost = parseFloat(operationalCost) || 0 

    let totalValue = 0
    let totalNetReceived = 0
    let totalMachineFee = 0
    let isValid = true
    let errorMsg = ''

    for (let i = 0; i < paymentSplits.length; i++) {
      const split = paymentSplits[i]
      const val = parseFloat(split.value) || 0
      const gateway = split.gateway
      const type = split.type
      const inst = split.installments
      const rates = GATEWAY_RATES[gateway]

      if (!rates) {
        isValid = false
        errorMsg = `Forma de pagamento #${i + 1} possui canal inválido.`
        break
      }

      let rate = 0
      if (type === 'debit') {
        if (!rates.hasDebit) {
          isValid = false
          errorMsg = `A forma #${i + 1} (${gateway}) não aceita Débito.`
          break
        }
        rate = rates.debitRate
      } else {
        const selectedRate = rates.creditRates[inst]
        if (selectedRate === undefined) {
          isValid = false
          errorMsg = `A forma #${i + 1} (${gateway}) não aceita parcelamento em ${inst}x.`
          break
        }
        rate = selectedRate
      }

      const netReceived = val * (1 - (rate / 100))
      const machineFee = val * (rate / 100)

      totalValue += val
      totalNetReceived += netReceived
      totalMachineFee += machineFee
    }

    if (!isValid) {
      return { isValid: false, errorMsg }
    }

    const vitrinePrice = (cost + pMargin + opCost) - totalNetReceived
    const maxEvaluation = vitrinePrice - (pMargin / 2)
    const appliedRate = totalValue > 0 ? (totalMachineFee / totalValue) * 100 : 0

    return {
      isValid: true,
      appliedRate: parseFloat(appliedRate.toFixed(2)),
      netReceived: totalNetReceived,
      vitrinePrice,
      maxEvaluation,
      machineFee: totalMachineFee,
      giftCost: opCost, 
      totalProfit: pMargin,
      totalValue
    }
  }, [newCost, profitMargin, operationalCost, paymentSplits])

  // Salvar no Banco
  const handleSaveEvaluation = async () => {
    if (!clientName.trim()) {
      triggerNotification(entryType === 'supplier' ? 'Preencha o Nome do Fornecedor para continuar.' : 'Preencha o Nome do Cliente para continuar.', 'error')
      return
    }

    // IMEIs são opcionais (se vazios, salva como 'Não Informado')
    const finalImeiNew = entryType === 'supplier' ? 'N/A' : (imeiNew.trim() || 'Não Informado')
    const finalImeiUsed = imeiUsed.trim() || 'Não Informado'

    if (entryType !== 'supplier' && imeiNew.trim() && imeiNew.trim() !== 'Não Informado' && !isValidIMEI(imeiNew)) {
      triggerNotification('O IMEI do Novo é inválido! Por favor verifique.', 'error')
      return
    }
    if (imeiUsed.trim() && imeiUsed.trim() !== 'Não Informado' && !isValidIMEI(imeiUsed)) {
      triggerNotification('O IMEI do Usado é inválido! Por favor verifique.', 'error')
      return
    }

    if (entryType === 'supplier') {
      if (!supplierCost || parseFloat(supplierCost) <= 0) {
        triggerNotification('Preencha o Custo da Compra.', 'error')
        return
      }
      if (!supplierVitrine || parseFloat(supplierVitrine) <= 0) {
        triggerNotification('Preencha o Preço de Vitrine Estimado.', 'error')
        return
      }
    } else {
      if (!newCost || calculationData.totalValue <= 0) {
        triggerNotification('Defina o Custo do Novo e os Valores de Pagamento.', 'error')
        return
      }
      if (!calculationData.isValid) {
        triggerNotification('Verifique as inconsistências de taxas antes de salvar.', 'error')
        return
      }
    }

    setIsSaving(true)
    const originalRecord = evaluations.find(item => item.id === editingRecordId)
    const recordId = editingRecordId || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9))
    const recordCreatedAt = originalRecord ? (originalRecord.created_at || originalRecord.createdAt) : new Date().toISOString()

    const newRecord = {
      id: recordId,
      created_at: recordCreatedAt,
      client_name: entryType === 'supplier' ? `Fornecedor: ${clientName.trim()}` : clientName,
      imei_new: finalImeiNew,
      imei_used: finalImeiUsed,
      new_model: entryType === 'supplier' ? 'COMPRA FORNECEDOR' : newModel,
      new_storage: entryType === 'supplier' ? 'N/A' : newStorage,
      new_color: entryType === 'supplier' ? 'N/A' : newColor,
      new_cost: entryType === 'supplier' ? 0 : parseFloat(newCost),
      profit_margin: entryType === 'supplier' ? 0 : (parseFloat(profitMargin) || 800),
      operational_cost: entryType === 'supplier' ? 0 : (parseFloat(operationalCost) || 120),
      used_model: usedModel,
      used_storage: usedStorage,
      used_color: usedColor,
      used_category: usedCategory,
      additional_value: entryType === 'supplier' ? 0 : calculationData.totalValue,
      gateway: entryType === 'supplier' ? 'Compra Direta' : paymentSplits.map(s => `${s.gateway} (${s.type === 'debit' ? 'Débito' : `${s.installments}x`}: R$ ${s.value})`).join(' + '),
      installments: entryType === 'supplier' ? 0 : Math.max(...paymentSplits.map(s => s.installments)),
      applied_rate: entryType === 'supplier' ? 0 : calculationData.appliedRate,
      net_received: entryType === 'supplier' ? 0 : calculationData.netReceived,
      vitrine_price: entryType === 'supplier' ? parseFloat(supplierVitrine) : calculationData.vitrinePrice,
      max_evaluation: entryType === 'supplier' ? parseFloat(supplierCost) : calculationData.maxEvaluation,
      battery_health: parseInt(batteryHealth),
      original_screen: originalScreen,
      biometrics_status: biometricsStatus,
      camera_status: cameraStatus,
      body_condition: bodyCondition,
      payment_splits: entryType === 'supplier' ? [] : paymentSplits 
    }

    try {
      if (isSupabaseConfigured && dbStatus.connected) {
        let error;
        if (editingRecordId) {
          const { error: err } = await supabase
            .from('evaluations')
            .update(newRecord)
            .eq('id', editingRecordId)
          error = err
        } else {
          const { error: err } = await supabase
            .from('evaluations')
            .insert([newRecord])
          error = err
        }
        if (error) throw error
        triggerNotification(editingRecordId ? 'Alterações salvas no Supabase!' : 'Lançamento salvo no Supabase!')
      } else {
        if (editingRecordId) {
          await localDb.updateEvaluation(editingRecordId, newRecord)
          triggerNotification('Alterações salvas localmente offline!')
        } else {
          await localDb.saveEvaluation(newRecord)
          triggerNotification('Salvo localmente! Dados seguros offline.')
        }
      }
      loadEvaluations()
      
      setEditingRecordId(null)
      setClientName('')
      setImeiNew('')
      setImeiUsed('')
      setSupplierCost('')
      setSupplierVitrine('')
      setPaymentSplits([{ id: 1, value: '', gateway: 'Dinheiro / Pix', type: 'credit', installments: 1 }])
      setUsedCategory('Comum')
    } catch (err) {
      console.error('Error saving:', err)
      try {
        if (editingRecordId) {
          await localDb.updateEvaluation(editingRecordId, newRecord)
          triggerNotification(`Erro na nuvem: ${err.message || String(err)}. Alterações salvas localmente!`, 'warning')
        } else {
          await localDb.saveEvaluation(newRecord)
          triggerNotification(`Erro na nuvem: ${err.message || String(err)}. Salvo localmente!`, 'warning')
        }
        loadEvaluations()
        setEditingRecordId(null)
        setClientName('')
        setImeiNew('')
        setImeiUsed('')
        setSupplierCost('')
        setSupplierVitrine('')
        setPaymentSplits([{ id: 1, value: '', gateway: 'Dinheiro / Pix', type: 'credit', installments: 1 }])
        setUsedCategory('Comum')
      } catch (localErr) {
        triggerNotification(`Erro ao salvar localmente: ${localErr.message || String(localErr)}`, 'error')
      }
    } finally {
      setIsSaving(false)
    }
  }

  // Deletar Registro
  const handleDeleteEvaluation = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta venda?')) return

    try {
      if (isSupabaseConfigured && dbStatus.connected) {
        const { error } = await supabase
          .from('evaluations')
          .delete()
          .eq('id', id)
        if (error) throw error
        triggerNotification('Registro deletado no Supabase.')
      } else {
        await localDb.deleteEvaluation(id)
        triggerNotification('Registro deletado localmente.')
      }
      loadEvaluations()
    } catch (err) {
      console.error('Error deleting:', err)
      triggerNotification('Erro ao excluir do histórico.', 'error')
    }
  }

  // Carregar registro de volta na UI
  const handleLoadRecord = (record) => {
    setEditingRecordId(record.id)
    setActiveTab('simulator')
    window.scrollTo({ top: 0, behavior: 'smooth' })

    const isSupplier = (record.new_model || record.newModel) === 'COMPRA FORNECEDOR' || 
                       String(record.client_name || record.clientName || '').startsWith('Fornecedor:')

    setEntryType(isSupplier ? 'supplier' : 'trade-in')
    if (isSupplier) {
      setClientName(String(record.client_name || record.clientName || '').replace(/^Fornecedor:\s*/, ''))
      setSupplierCost(String(record.max_evaluation || record.maxEvaluation || ''))
      setSupplierVitrine(String(record.vitrine_price || record.vitrinePrice || ''))
      
      setImeiNew('')
      setNewModel(NEW_MODELS[0])
      setNewStorage(STORAGE_OPTIONS[0])
      setNewColor(APPLE_COLORS[0])
      setNewCost('')
      setProfitMargin('800')
      setOperationalCost('120')
      setPaymentSplits([{ id: 1, value: '', gateway: 'Dinheiro / Pix', type: 'credit', installments: 1 }])
    } else {
      setClientName(record.client_name || record.clientName || '')
      setImeiNew(record.imei_new || record.imeiNew || '')
      
      setSupplierCost('')
      setSupplierVitrine('')
      
      setNewModel(record.new_model || record.newModel || NEW_MODELS[0])
      setNewStorage(record.new_storage || record.newStorage || STORAGE_OPTIONS[0])
      setNewColor(record.new_color || record.newColor || APPLE_COLORS[0])
      setNewCost(String(record.new_cost || record.newCost || ''))
      
      let loadedMargin = 800
      let loadedOpCost = 120

      if (record.profit_margin !== undefined && record.profit_margin !== null) {
        loadedMargin = record.profit_margin
        loadedOpCost = record.operational_cost !== undefined ? record.operational_cost : 120
      } else if (record.profitMargin !== undefined && record.profitMargin !== null) {
        loadedMargin = record.profitMargin
        loadedOpCost = record.operationalCost !== undefined ? record.operationalCost : 120
      } else {
        const oldCombined = parseFloat(record.operational_cost || record.operationalCost || 920)
        if (oldCombined === 920) {
          loadedMargin = 800
          loadedOpCost = 120
        } else {
          loadedMargin = oldCombined >= 120 ? oldCombined - 120 : 0
          loadedOpCost = oldCombined >= 120 ? 120 : oldCombined
        }
      }
      setProfitMargin(String(loadedMargin))
      setOperationalCost(String(loadedOpCost))

      let loadedSplits = []
      if (record.payment_splits && Array.isArray(record.payment_splits)) {
        loadedSplits = record.payment_splits
      } else if (record.paymentSplits && Array.isArray(record.paymentSplits)) {
        loadedSplits = record.paymentSplits
      } else {
        const oldVal = String(record.additional_value || record.additionalValue || '')
        const oldGw = record.gateway || 'Dinheiro / Pix'
        const oldInst = record.installments || 1
        
        let oldType = 'credit'
        if (oldInst === 1 && (oldGw === 'Dinheiro / Pix' || (GATEWAY_RATES[oldGw]?.debitRate === record.applied_rate))) {
          oldType = 'debit'
        }

        loadedSplits = [{
          id: 1,
          value: oldVal,
          gateway: oldGw,
          type: oldType,
          installments: oldInst
        }]
      }
      setPaymentSplits(loadedSplits)
    }
    
    setImeiUsed(record.imei_used || record.imeiUsed || '')
    setUsedModel(record.used_model || record.usedModel || USED_MODELS[0])
    setUsedStorage(record.used_storage || record.usedStorage || STORAGE_OPTIONS[0])
    setUsedColor(record.used_color || record.usedColor || APPLE_COLORS[0])
    setUsedCategory(record.used_category || record.usedCategory || 'Comum')

    setBatteryHealth(record.battery_health || record.batteryHealth || 85)
    setOriginalScreen(record.original_screen !== undefined ? record.original_screen : true)
    setBiometricsStatus(record.biometrics_status || 'ok')
    setCameraStatus(record.camera_status || 'ok')
    setBodyCondition(record.body_condition || 'Excelente')

    triggerNotification('Registro carregado para edição!')
  }

  const handleCancelEdit = () => {
    setEditingRecordId(null)
    setClientName('')
    setImeiNew('')
    setImeiUsed('')
    setSupplierCost('')
    setSupplierVitrine('')
    setNewModel(NEW_MODELS[0])
    setNewStorage(STORAGE_OPTIONS[0])
    setNewColor(APPLE_COLORS[0])
    setNewCost('')
    setProfitMargin('800')
    setOperationalCost('120')
    setPaymentSplits([{ id: 1, value: '', gateway: 'Dinheiro / Pix', type: 'credit', installments: 1 }])
    setUsedModel(USED_MODELS[5])
    setUsedStorage(STORAGE_OPTIONS[0])
    setUsedColor(APPLE_COLORS[0])
    setUsedCategory('Comum')
    setBatteryHealth(85)
    setOriginalScreen(true)
    setBiometricsStatus('ok')
    setCameraStatus('ok')
    setBodyCondition('Excelente')
    triggerNotification('Edição cancelada.')
  }

  // Gerar Orçamento/Planilha em PDF para Atacado
  const handleGenerateQuotePDF = () => {
    if (selectedStockKeys.length === 0) {
      triggerNotification('Nenhum item selecionado para o orçamento.', 'error')
      return
    }

    const partner = window.prompt('Digite o nome do Fornecedor / Parceiro Comercial para o orçamento:', '')
    if (partner === null) return // Cancelado

    const selectedItems = inventoryStats.filter(item => 
      selectedStockKeys.includes(`${item.model}-${item.storage}-${item.category}`)
    )

    if (selectedItems.length === 0) {
      triggerNotification('Nenhum item válido encontrado.', 'error')
      return
    }

    const printWindow = window.open('', '_blank', 'width=850,height=800')
    if (!printWindow) {
      triggerNotification('Bloqueador de pop-ups ativo! Permita pop-ups para gerar o PDF.', 'error')
      return
    }

    const formatCurrency = (val) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
    }

    const tableRows = selectedItems.map(item => {
      const unitPrice = stockPricingMode === 'wholesale' 
        ? (item.avgVitrine - item.avgOpCost) 
        : item.avgVitrine
      return `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; font-weight: 600; color: #1e293b; text-align: left;">
            ${item.model} 
            ${item.category === 'Saldo' ? '<span style="background-color: #fef3c7; color: #d97706; border: 1px solid #fde68a; font-size: 9px; font-weight: 900; padding: 2px 5px; border-radius: 4px; margin-left: 5px;">SALDO</span>' : ''}
          </td>
          <td style="padding: 10px; text-align: center; color: #475569;">${item.storage}</td>
          <td style="padding: 10px; text-align: right; color: #0f172a; font-weight: bold; font-family: monospace;">${formatCurrency(unitPrice)}</td>
        </tr>
      `
    }).join('')

    const dateStr = new Date().toLocaleDateString('pt-BR')
    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Orçamento de Seminovos - Fitch</title>
        <style>
          body {
            font-family: 'Inter', -apple-system, sans-serif;
            margin: 40px;
            color: #0f172a;
            background-color: #fff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo-badge {
            background-color: #0f172a;
            color: #fff;
            padding: 8px 16px;
            font-weight: 800;
            border-radius: 50px;
            font-size: 16px;
            letter-spacing: 0.05em;
          }
          .title-block {
            text-align: right;
          }
          .title {
            font-size: 20px;
            font-weight: 800;
            text-transform: uppercase;
            margin: 0;
            letter-spacing: 0.02em;
          }
          .subtitle {
            font-size: 11px;
            color: #64748b;
            margin: 5px 0 0 0;
          }
          .info-grid {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
            font-size: 12px;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 15px;
            border-radius: 12px;
          }
          .info-grid div span {
            display: block;
            margin-bottom: 5px;
          }
          .table-container {
            margin-bottom: 35px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          th {
            background-color: #0f172a;
            color: #ffffff;
            padding: 10px;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 0.05em;
          }
          .summary-card {
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 15px 20px;
            border-radius: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
          }
          .summary-title {
            font-size: 11px;
            color: #475569;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.05em;
          }
          .summary-value {
            font-size: 20px;
            font-weight: 900;
            color: #0f172a;
            font-family: monospace;
          }
          .footer-note {
            font-size: 10px;
            color: #64748b;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
            margin-top: 50px;
          }
          .no-print-btn {
            background-color: #2563eb;
            color: #fff;
            border: none;
            padding: 10px 20px;
            font-size: 12px;
            font-weight: 700;
            border-radius: 8px;
            cursor: pointer;
            margin-bottom: 20px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: background-color 0.15s;
          }
          .no-print-btn:hover {
            background-color: #1d4ed8;
          }
          @media print {
            .no-print-btn {
              display: none;
            }
            body {
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <button class="no-print-btn" onclick="window.print()">
          🖨️ Imprimir / Salvar PDF
        </button>
        
        <div class="header">
          <div class="logo-badge">FITCH</div>
          <div class="title-block">
            <h1 class="title">Tabela de Orçamento</h1>
            <p class="subtitle">Seminovos em Estoque</p>
          </div>
        </div>

        <div class="info-grid">
          <div>
            <span><strong>Destinatário (Parceiro):</strong> ${partner || 'Não Informado'}</span>
            <span><strong>Emitido por:</strong> Fitch Trade-In Manager</span>
          </div>
          <div style="text-align: right;">
            <span><strong>Data de Emissão:</strong> ${dateStr} às ${timeStr}</span>
            <span><strong>Tipo de Preço:</strong> ${stockPricingMode === 'wholesale' ? 'Atacado (Sem despesas operacionais)' : 'Varejo (Vitrine Padrão)'}</span>
          </div>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th style="text-align: left; border-radius: 6px 0 0 6px; padding: 10px;">Aparelho</th>
                <th style="text-align: center; padding: 10px;">Capacidade</th>
                <th style="text-align: right; border-radius: 0 6px 6px 0; padding: 10px;">Preço Unitário</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>

        <p style="font-size: 11px; color: #475569; line-height: 1.5; margin-bottom: 30px; text-align: justify;">
          * Este documento representa uma cotação formal com base no estoque disponível na data e hora da emissão. Os preços informados refletem a modalidade de <strong>${stockPricingMode === 'wholesale' ? 'Atacado' : 'Varejo'}</strong> e estão sujeitos a alterações com base na rotatividade de vendas diárias.
        </p>

        <div class="footer-note">
          Fitch Trade-In Manager • Relatório Oficial de Distribuição de Estoque
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  // Copiar Resumo
  const handleCopySummary = () => {
    const formatCurrency = (val) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
    }

    let summaryText = ''
    const usedCategoryTag = usedCategory === 'Saldo' ? ' ⚠️ *[SALDO]*' : ''

    if (entryType === 'supplier') {
      summaryText = `📦 *COMPRA DE SEMINOVO (FORNECEDOR) - Fitch*
--------------------------------------------
👤 *Fornecedor:* ${clientName || 'Não Informado'}

🔄 *Aparelho Comprado:* ${usedModel} (${usedStorage}) - Cor: ${usedColor}${usedCategoryTag}
🆔 *IMEI Usado:* ${imeiUsed || 'Não Informado'}
🔋 *Bateria:* ${batteryHealth}% (${batteryHealth < 80 ? '⚠️ NECESSITA TROCA' : 'Saúde Ok'})
🖥️ *Tela Original:* ${originalScreen ? 'Sim' : 'Não (Paralela/Trocada)'}
👤 *Face ID / Touch ID:* ${biometricsStatus.toUpperCase()}
📷 *Câmeras & Foco:* ${cameraStatus.toUpperCase()}
🛠️ *Estado da Carcaça:* ${bodyCondition}

--------------------------------------------
💰 *VALORES:*
- *Preço de Custo (Pago):* ${formatCurrency(parseFloat(supplierCost) || 0)}
- *Preço de Vitrine Estimado:* ${formatCurrency(parseFloat(supplierVitrine) || 0)}

--------------------------------------------
*Gerado em:* ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
*Sistema Fitch Trade-In Manager v3*`
    } else {
      if (!calculationData.isValid) {
        triggerNotification('Cálculo inconsistente.', 'error')
        return
      }

      const splitsList = paymentSplits.map(s => {
        const val = parseFloat(s.value) || 0
        return `  - ${s.gateway} (${s.type === 'debit' ? 'Débito' : `${s.installments}x`}): ${formatCurrency(val)}`
      }).join('\n')

      summaryText = `🍎 *AVALIAÇÃO DE TRADE-IN - Fitch*
--------------------------------------------
👤 *Cliente:* ${clientName || 'Não Informado'}

📱 *Aparelho Novo:* ${newModel} (${newStorage}) - Cor: ${newColor}
🆔 *IMEI Novo:* ${imeiNew || 'Não Informado'}
💵 *Custo do Novo:* ${formatCurrency(newCost)}
💰 *Margem de Lucro:* ${formatCurrency(parseFloat(profitMargin) || 0)}
💸 *Despesas Operacionais:* ${formatCurrency(parseFloat(operationalCost) || 0)}

🔄 *Usado de Entrada:* ${usedModel} (${usedStorage}) - Cor: ${usedColor}${usedCategoryTag}
🆔 *IMEI Usado:* ${imeiUsed || 'Não Informado'}
🔋 *Bateria:* ${batteryHealth}% (${batteryHealth < 80 ? '⚠️ NECESSITA TROCA' : 'Saúde Ok'})
🖥️ *Tela Original:* ${originalScreen ? 'Sim' : 'Não (Paralela/Trocada)'}
👤 *Face ID / Touch ID:* ${biometricsStatus.toUpperCase()}
📷 *Câmeras & Foco:* ${cameraStatus.toUpperCase()}
🛠️ *Estado da Carcaça:* ${bodyCondition}

--------------------------------------------
💳 *PAGAMENTO ADICIONAL:*
${splitsList}
- *Valor Adicional Total:* ${formatCurrency(calculationData.totalValue)}
- *Taxa Média Ponderada:* ${calculationData.appliedRate}%
- *Valor Líquido Recebido:* ${formatCurrency(calculationData.netReceived)}

--------------------------------------------
💰 *PROPOSTA FINAL (VITRINE):*
- *Preço de Venda do Usado (Vitrine):* ${formatCurrency(calculationData.vitrinePrice)}
- *Proposta de Avaliação Máxima:* ${formatCurrency(calculationData.maxEvaluation)}

--------------------------------------------
*Gerado em:* ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
*Sistema Fitch Trade-In Manager v3*`
    }

    navigator.clipboard.writeText(summaryText)
      .then(() => {
        setCopySuccess(true)
        triggerNotification('Resumo completo copiado!')
        setTimeout(() => setCopySuccess(false), 2000)
      })
      .catch(() => {
        triggerNotification('Erro ao copiar resumo.', 'error')
      })
  }

  // Filtragem e Ordenação
  const filteredEvaluations = useMemo(() => {
    let result = [...evaluations]

    // 1. Filtro de Busca de Texto
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(record => {
        const client = (record.client_name || record.clientName || '').toLowerCase()
        const imeiN = (record.imei_new || record.imeiNew || '').toLowerCase()
        const imeiU = (record.imei_used || record.imeiUsed || '').toLowerCase()
        const modN = (record.new_model || record.newModel || '').toLowerCase()
        const modU = (record.used_model || record.usedModel || '').toLowerCase()
        const colN = (record.new_color || record.newColor || '').toLowerCase()
        const colU = (record.used_color || record.usedColor || '').toLowerCase()
        return client.includes(query) || imeiN.includes(query) || imeiU.includes(query) || modN.includes(query) || modU.includes(query) || colN.includes(query) || colU.includes(query)
      })
    }

    // 2. Filtro de Categoria (Comum vs Saldo)
    if (filterCategory !== 'all') {
      result = result.filter(record => {
        const cat = record.used_category || record.usedCategory || 'Comum'
        return cat === filterCategory
      })
    }

    // 3. Filtro de Tipo (Trade-in vs Compra Fornecedor)
    if (filterEntryType !== 'all') {
      result = result.filter(record => {
        const isSupplier = (record.new_model || record.newModel) === 'COMPRA FORNECEDOR' || 
                           String(record.client_name || record.clientName || '').startsWith('Fornecedor:')
        return filterEntryType === 'supplier' ? isSupplier : !isSupplier
      })
    }

    // 4. Filtro de Modelo Usado
    if (filterModel !== 'all') {
      result = result.filter(record => {
        const model = record.used_model || record.usedModel || ''
        return model === filterModel
      })
    }

    // 5. Ordenação
    result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        const dateA = new Date(a.created_at || a.createdAt || 0)
        const dateB = new Date(b.created_at || b.createdAt || 0)
        return dateB - dateA
      } else if (sortBy === 'date-asc') {
        const dateA = new Date(a.created_at || a.createdAt || 0)
        const dateB = new Date(b.created_at || b.createdAt || 0)
        return dateA - dateB
      } else if (sortBy === 'model-used') {
        const modA = (a.used_model || a.usedModel || '').toLowerCase()
        const modB = (b.used_model || b.usedModel || '').toLowerCase()
        return modA.localeCompare(modB)
      } else if (sortBy === 'model-new') {
        const modA = (a.new_model || a.newModel || '').toLowerCase()
        const modB = (b.new_model || b.newModel || '').toLowerCase()
        return modA.localeCompare(modB)
      } else if (sortBy === 'vitrine-desc') {
        const valA = parseFloat(a.vitrine_price || a.vitrinePrice || 0)
        const valB = parseFloat(b.vitrine_price || b.vitrinePrice || 0)
        return valB - valA
      } else if (sortBy === 'vitrine-asc') {
        const valA = parseFloat(a.vitrine_price || a.vitrinePrice || 0)
        const valB = parseFloat(b.vitrine_price || b.vitrinePrice || 0)
        return valA - valB
      }
      return 0
    })

    return result
  }, [evaluations, searchQuery, filterCategory, filterEntryType, filterModel, sortBy])

  // Cálculo Automático de Grade e Sugestão de Crédito de Seminovos
  const checklistGradeData = useMemo(() => {
    // Regras para Defeitos (Grade C)
    const hasDefect = 
      esteticaTela === 'defeito' ||
      esteticaTraseira === 'defeito' ||
      esteticaLaterais === 'defeito' ||
      esteticaLentes === 'defeito' ||
      funcionalBiometria === 'defeito' ||
      funcionalCameras === 'defeito' ||
      funcionalAudio === 'defeito' ||
      funcionalConectividade === 'defeito' ||
      funcionalBotoes === 'defeito' ||
      funcionalPecaDesconhecida === 'sim' ||
      segurancaIcloud === 'não' ||
      parseFloat(funcionalBatteryHealth) < 80;

    // Regras para Detalhes (Grade B)
    const hasDetail = 
      esteticaTela === 'detalhe' ||
      esteticaTraseira === 'detalhe' ||
      esteticaLaterais === 'detalhe' ||
      esteticaLentes === 'detalhe' ||
      (parseFloat(funcionalBatteryHealth) >= 80 && parseFloat(funcionalBatteryHealth) < 85);

    let grade = 'A'
    if (hasDefect) {
      grade = 'C'
    } else if (hasDetail) {
      grade = 'B'
    }

    const refVal = parseFloat(referenceValue) || 0
    // Grade A base: Preço de Vitrine Referência - Margem Padrão (R$ 800)
    const baseCreditA = Math.max(0, refVal - 800)
    
    let suggestedValue = 0
    if (grade === 'A') {
      suggestedValue = baseCreditA
    } else if (grade === 'B') {
      suggestedValue = baseCreditA * 0.85
    } else { // Grade C
      suggestedValue = baseCreditA * 0.70
    }

    return {
      grade,
      suggestedValue: parseFloat(suggestedValue.toFixed(2))
    }
  }, [
    esteticaTela, esteticaTraseira, esteticaLaterais, esteticaLentes,
    funcionalBatteryHealth, funcionalPecaDesconhecida, funcionalBiometria,
    funcionalCameras, funcionalAudio, funcionalConectividade, funcionalBotoes,
    segurancaIcloud, referenceValue
  ])

  // Filtragem de checklists do histórico
  const filteredChecklists = useMemo(() => {
    if (!checklistSearchQuery.trim()) return checklistsList
    const query = checklistSearchQuery.toLowerCase()
    return checklistsList.filter(record => {
      const seller = (record.seller_name || '').toLowerCase()
      const client = (record.client_name || '').toLowerCase()
      const imei = (record.serial_imei || '').toLowerCase()
      const model = (record.device_model || '').toLowerCase()
      const grade = (record.grade || '').toLowerCase()
      return seller.includes(query) || client.includes(query) || imei.includes(query) || model.includes(query) || grade.includes(query)
    })
  }, [checklistsList, checklistSearchQuery])

  const formatBRL = (val) => {
    if (isNaN(val) || val === null) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  const getEsteticaStatusBadge = () => {
    if (
      esteticaTela === 'defeito' ||
      esteticaTraseira === 'defeito' ||
      esteticaLaterais === 'defeito' ||
      esteticaLentes === 'defeito'
    ) {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-red-500/10 text-rose-700 border border-red-500/25 uppercase tracking-wider animate-pulse">
          Defeito
        </span>
      )
    }
    if (
      esteticaTela === 'detalhe' ||
      esteticaTraseira === 'detalhe' ||
      esteticaLaterais === 'detalhe' ||
      esteticaLentes === 'detalhe'
    ) {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-500/25 uppercase tracking-wider">
          Detalhe
        </span>
      )
    }
    return (
      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-500/25 uppercase tracking-wider">
        Bom
      </span>
    )
  }

  const getFuncionalStatusBadge = () => {
    if (
      funcionalBiometria === 'defeito' ||
      funcionalCameras === 'defeito' ||
      funcionalAudio === 'defeito' ||
      funcionalConectividade === 'defeito' ||
      funcionalBotoes === 'defeito' ||
      funcionalPecaDesconhecida === 'sim' ||
      parseFloat(funcionalBatteryHealth) < 80
    ) {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-red-500/10 text-rose-700 border border-red-500/25 uppercase tracking-wider animate-pulse">
          Problema
        </span>
      )
    }
    if (parseFloat(funcionalBatteryHealth) < 85) {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-500/25 uppercase tracking-wider">
          Bateria
        </span>
      )
    }
    return (
      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-500/25 uppercase tracking-wider">
        100% OK
      </span>
    )
  }

  const getSegurancaStatusBadge = () => {
    if (segurancaIcloud === 'não') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-red-500/10 text-rose-700 border border-red-500/25 uppercase tracking-wider animate-pulse">
          iCloud Ativo
        </span>
      )
    }
    if (segurancaDemo === 'sim') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-500/25 uppercase tracking-wider">
          Demo
        </span>
      )
    }
    return (
      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-500/25 uppercase tracking-wider">
        Liberado
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased pb-12 relative overflow-hidden">
      
      {/* Luzes de Fundo */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
      
      {/* Toast Notification */}
      {notification.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 transform animate-bounce">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-full shadow-2xl backdrop-blur-xl border ${
            notification.type === 'error' 
              ? 'bg-rose-50 border-rose-200 text-rose-800' 
              : notification.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-white border-slate-200 text-slate-800'
          }`}>
            {notification.type === 'error' ? (
              <XCircle className="w-5 h-5 text-red-600" />
            ) : notification.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            )}
            <span className="text-sm font-medium tracking-tight">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header Principal */}
      <header className="max-w-7xl mx-auto px-6 pt-8 pb-4 flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200/80 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center p-1.5 shrink-0 shadow-sm mr-1">
            <img src={logo} className="h-full w-full object-contain select-none" alt="Fitch Logo" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              Fitch Trade-In
              <span className="text-[10px] uppercase font-mono tracking-widest bg-slate-200 px-2 py-0.5 rounded text-slate-600 border border-slate-300/60">PRO v10</span>
            </h1>
            <p className="text-xs text-slate-500">Mapeamento Comercial de Vendas e IMEI</p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* User Status Badge */}
          {currentUser && (
            <div className="flex items-center gap-2.5 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-inner animate-fade-in">
              <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 font-black flex items-center justify-center text-[10px]">
                {currentUser.name[0]}
              </div>
              <div className="text-left">
                <span className="text-[11px] font-bold text-slate-900 block leading-tight">{currentUser.name}</span>
                <span className="text-[9px] text-slate-500 block capitalize">{currentUser.role === 'admin' ? 'Administrador' : currentUser.role === 'manager' ? 'Gerente' : 'Vendedor'}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-[10px] font-bold text-rose-700 hover:text-red-300 ml-2 transition-colors cursor-pointer border border-red-500/10 hover:border-red-500/30 px-2 py-1 rounded bg-red-950/20"
              >
                Sair
              </button>
            </div>
          )}

          {/* Database Status Widget */}
          <div className="flex items-center gap-3 bg-slate-100/50 border border-slate-200/80 px-4 py-2 rounded-full backdrop-blur-sm">
            <div className="relative flex h-2 w-2">
              {dbStatus.connected ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </>
              ) : dbStatus.mode === 'checking' ? (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-400 animate-pulse"></span>
              ) : (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </>
              )}
            </div>
            <span className="text-xs font-medium text-slate-500">
              {dbStatus.mode === 'checking' ? 'Conectando...' : `Banco: ${dbStatus.mode}`}
            </span>
            {isSupabaseConfigured && (
              <button 
                onClick={loadEvaluations}
                title="Sincronizar banco"
                className="text-slate-500 hover:text-slate-800 transition-colors duration-150"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Banner de Erro de Conexão com o Supabase */}
      {dbStatus.errorMsg && (
        <div className="max-w-7xl mx-auto px-6 mt-4">
          <div className="bg-red-950/60 border border-red-500/30 rounded-2xl p-4 backdrop-blur-md">
            <h4 className="text-sm font-semibold text-rose-700">Erro de Conexão com o Supabase</h4>
            <div className="text-xs text-slate-500 mt-2 space-y-1">
              <p><strong>Detalhe:</strong> <span className="font-mono break-all">{dbStatus.errorMsg}</span></p>
              <p><strong>URL Usada:</strong> <span className="font-mono break-all">{import.meta.env.VITE_SUPABASE_URL || 'Não configurada'}</span></p>
            </div>
            <p className="text-[11px] text-slate-500 mt-3 border-t border-red-500/10 pt-2">
              Verifique se a URL exibida acima está idêntica à do seu painel do Supabase. Lembre-se de fazer um <strong>Redeploy</strong> na Vercel após alterar as variáveis de ambiente!
            </p>
          </div>
        </div>
      )}

      {/* Banner de Sincronização Pendente para Dados Locais */}
      {localRecordsToSync.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-4">
          <div className="bg-blue-950/60 border border-blue-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-blue-600 shrink-0 animate-bounce" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Sincronização Pendente de Histórico</h4>
                <p className="text-xs text-slate-500">
                  Encontramos {localRecordsToSync.length} avaliação(ões) salva(s) no seu navegador anterior. Deseja importá-las para a nuvem do Supabase?
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={isSyncingLocal}
              onClick={handleSyncLocalToCloud}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-semibold py-2 px-4 rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
            >
              {isSyncingLocal ? 'Enviando...' : 'Sincronizar com a Nuvem'}
            </button>
          </div>
        </div>
      )}

      {/* Tela Inicial de Boas-vindas (Landing Page) */}
      {activeTab === 'landing' && (
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center justify-center text-center space-y-12 animate-fade-in">
          
          <div className="space-y-6 max-w-lg flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center p-4 mb-4 shadow-md shrink-0">
              <img src={logo} className="h-full w-full object-contain select-none animate-fade-in" alt="Fitch Logo" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-blue-600 via-slate-800 to-purple-600 bg-clip-text text-transparent">
              Fitch Trade-In Manager
            </h1>
            <p className="text-sm text-slate-600 font-medium">
              Selecione o módulo que deseja acessar para iniciar os trabalhos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            
            {/* Card 1: Simulador de Trade-in */}
            <button
              type="button"
              onClick={() => requestAccess('simulator')}
              className="group text-left bg-white border border-slate-200 hover:border-blue-500/50 rounded-3xl p-8 space-y-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5 cursor-pointer flex flex-col justify-between min-h-[240px]"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <Calculator className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Simulador de Trade-in
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Cálculo financeiro avançado de taxas, custos operacionais e margens de vitrine. Otimizado para **Notebooks / Desktops**.
                </p>
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-widest block pt-2 group-hover:translate-x-1 transition-transform">
                Acesso Gerente / ADM &gt;
              </span>
            </button>

            {/* Card 2: Checklist de Seminovos */}
            <button
              type="button"
              onClick={() => requestAccess('checklist')}
              className="group text-left bg-white border border-slate-200 hover:border-emerald-500/50 rounded-3xl p-8 space-y-6 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/5 cursor-pointer flex flex-col justify-between min-h-[240px]"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <ListTodo className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Checklist de Seminovos
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Inspeção técnica detalhada, anexo de fotos de evidência e classificação automática de grade. Otimizado para **Celulares**.
                </p>
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-widest block pt-2 group-hover:translate-x-1 transition-transform">
                Acesso Vendedores &gt;
              </span>
            </button>

            {/* Card 3: Assistência Técnica */}
            <button
              type="button"
              onClick={() => requestAccess('assistencia')}
              className="group text-left bg-white border border-slate-200 hover:border-purple-500/50 rounded-3xl p-8 space-y-6 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/5 cursor-pointer flex flex-col justify-between min-h-[240px]"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                  Assistência Técnica
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Ordens de serviço especialistas, controle de estoque de peças, Kanban de manutenção e IA Fitch Assist.
                </p>
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-widest block pt-2 group-hover:translate-x-1 transition-transform">
                Acesso Gerente / ADM &gt;
              </span>
            </button>

          </div>
        </div>
      )}

      {/* Navegação por Abas (Visível apenas para Administradores e Gerentes Logados) */}
      {activeTab !== 'landing' && currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager') && (
        <div className="max-w-7xl mx-auto px-6 mt-6 flex gap-6 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer flex items-center gap-2 ${
              activeTab === 'simulator' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Simulador de Trade-in
            {activeTab === 'simulator' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-t-full"></div>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer flex items-center gap-2 ${
              activeTab === 'checklist' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            Checklist de Seminovos
            {activeTab === 'checklist' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-t-full"></div>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('estoque')}
            className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer flex items-center gap-2 ${
              activeTab === 'estoque' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Archive className="w-4 h-4" />
            Estoque & Atacado
            {activeTab === 'estoque' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-t-full"></div>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('assistencia')}
            className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer flex items-center gap-2 ${
              activeTab === 'assistencia' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Assistência Técnica
            {activeTab === 'assistencia' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-t-full"></div>
            )}
          </button>
        </div>
      )}

      {activeTab === 'simulator' && (
        <>
          {/* Grid de Conteúdo Principal */}
          <main className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUNA ESQUERDA: Form de Precificação e Resultados (Col 7) */}
        <section className="lg:col-span-7 space-y-8">
          
          {/* Form de Entrada de Dados */}
          <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6">
            <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
              <Calculator className="w-5 h-5 text-blue-600" />
              1. Dados da Venda e Dispositivos
            </h2>

            {editingRecordId && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-amber-850 animate-fade-in shadow-sm shadow-amber-500/5">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-600 animate-pulse shrink-0" />
                  <span>
                    Você está <strong>editando</strong> o lançamento de: <strong className="text-amber-900">{clientName || 'Cliente/Fornecedor'}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancelar
                </button>
              </div>
            )}

            {/* Seletor do Tipo de Entrada */}
            <div className="flex bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
              <button
                type="button"
                onClick={() => setEntryType('trade-in')}
                className={`py-1.5 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  entryType === 'trade-in'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-905'
                }`}
              >
                Trade-in (Venda + Troca)
              </button>
              <button
                type="button"
                onClick={() => setEntryType('supplier')}
                className={`py-1.5 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  entryType === 'supplier'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-905'
                }`}
              >
                Compra (Fornecedor)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* Nome do Cliente / Fornecedor */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  {entryType === 'supplier' ? 'Nome do Fornecedor / Empresa *' : 'Nome Completo do Cliente *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    {entryType === 'supplier' ? <Archive className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </span>
                  <input
                    type="text"
                    placeholder={entryType === 'supplier' ? "Nome do fornecedor para rastreabilidade" : "Nome do cliente para rastreabilidade"}
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 rounded-xl py-3 pl-10 pr-4 text-slate-900 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>

              {entryType === 'trade-in' ? (
                <>
                  {/* iPhone Novo Vendido */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Modelo do Novo *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                        <Smartphone className="w-4 h-4" />
                      </span>
                      <select
                        value={newModel}
                        onChange={(e) => setNewModel(e.target.value)}
                        className="w-full appearance-none bg-white border border-slate-300 focus:border-blue-600 text-slate-900 rounded-xl py-3 pl-10 pr-10 text-sm outline-none transition-all duration-150 cursor-pointer focus:ring-1 focus:ring-blue-600/20 font-medium"
                      >
                        {NEW_MODELS.map(model => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  {/* Capacidade do Novo */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Capacidade (Novo) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                        <Sliders className="w-4 h-4" />
                      </span>
                      <select
                        value={newStorage}
                        onChange={(e) => setNewStorage(e.target.value)}
                        className="w-full appearance-none bg-white border border-slate-300 focus:border-blue-600 text-slate-900 rounded-xl py-3 pl-10 pr-10 text-sm outline-none transition-all duration-150 cursor-pointer focus:ring-1 focus:ring-blue-600/20 font-medium"
                      >
                        {STORAGE_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  {/* Cor do Novo */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Cor do Novo *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                        <Palette className="w-4 h-4" />
                      </span>
                      <select
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        className="w-full appearance-none bg-white border border-slate-300 focus:border-blue-600 text-slate-900 rounded-xl py-3 pl-10 pr-10 text-sm outline-none transition-all duration-150 cursor-pointer focus:ring-1 focus:ring-blue-600/20 font-medium"
                      >
                        {getColorsForModel(newModel).map(color => (
                          <option key={color} value={color}>{color}</option>
                        ))}
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  {/* Custo Real do Novo */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Custo Real do Novo (Tabela) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">
                        R$
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Custo do novo"
                        value={newCost}
                        onChange={(e) => setNewCost(e.target.value)}
                        className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 rounded-xl py-3 pl-10 pr-4 text-slate-900 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Margem de Lucro Combinada */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Margem de Lucro Combinada
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">
                        R$
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Padrão: 800.00"
                        value={profitMargin}
                        onChange={(e) => setProfitMargin(e.target.value)}
                        className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 rounded-xl py-3 pl-10 pr-4 text-slate-900 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Custos Operacionais / Despesas */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Custos Operacionais / Despesas
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">
                        R$
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Padrão: 120.00"
                        value={operationalCost}
                        onChange={(e) => setOperationalCost(e.target.value)}
                        className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 rounded-xl py-3 pl-10 pr-4 text-slate-900 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 font-medium"
                      />
                    </div>
                  </div>

                  {/* IMEI Novo */}
                  <div className="space-y-2 md:col-span-2 lg:col-span-3">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      IMEI do Novo *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">
                        #
                      </span>
                      <input
                        type="text"
                        maxLength="15"
                        placeholder="IMEI de 15 dígitos"
                        value={imeiNew}
                        onChange={(e) => setImeiNew(e.target.value.replace(/\D/g, ''))}
                        onBlur={() => checkIMEIBlacklist(imeiNew, 'new')}
                        className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 rounded-xl py-3 pl-10 pr-4 text-slate-900 text-sm font-mono outline-none transition-all duration-200 placeholder:text-slate-400 font-semibold"
                      />
                      {blacklistStatusNew === 'checking' && (
                        <p className="text-[10px] text-blue-600 mt-1 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Verificando base da Anatel/SIRC...</p>
                      )}
                      {blacklistStatusNew === 'clean' && (
                        <p className="text-[10px] text-emerald-700 mt-1 flex items-center gap-1">✓ Anatel/SIRC: Aparelho regular sem restrições.</p>
                      )}
                      {blacklistStatusNew === 'blocked' && (
                        <p className="text-[10px] text-rose-700 mt-1 flex items-center gap-1 font-bold">⚠️ Anatel/SIRC: Bloqueado ou impedido (furto/roubo)!</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Custo de Compra (Pago ao Fornecedor) */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Custo da Compra (Pago) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">
                        R$
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Custo pago"
                        value={supplierCost}
                        onChange={(e) => setSupplierCost(e.target.value)}
                        className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 rounded-xl py-3 pl-10 pr-4 text-slate-900 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Preço de Vitrine Estimado */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Preço de Vitrine Estimado *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">
                        R$
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Preço estimado"
                        value={supplierVitrine}
                        onChange={(e) => setSupplierVitrine(e.target.value)}
                        className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 rounded-xl py-3 pl-10 pr-4 text-slate-900 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 font-semibold"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Categoria do Usado */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Categoria do Aparelho Usado
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => { setUsedCategory('Comum'); vibrateFeedback('Comum'); }}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer ${
                      usedCategory === 'Comum'
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200 font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Usado Comum
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUsedCategory('Saldo'); vibrateFeedback('Saldo'); }}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer ${
                      usedCategory === 'Saldo'
                        ? 'bg-amber-500 text-white shadow-sm font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    iPhone de Saldo
                  </button>
                </div>
              </div>

              {/* iPhone Usado de Entrada */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  iPhone Usado de Entrada *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <Smartphone className="w-4 h-4 text-slate-500" />
                  </span>
                  <select
                    value={usedModel}
                    onChange={(e) => setUsedModel(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-300 focus:border-blue-600 text-slate-900 rounded-xl py-3 pl-10 pr-10 text-sm outline-none transition-all duration-150 cursor-pointer focus:ring-1 focus:ring-blue-600/20 font-medium"
                  >
                    {USED_MODELS.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* Capacidade do Usado */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Capacidade (Usado) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <Sliders className="w-4 h-4" />
                  </span>
                  <select
                    value={usedStorage}
                    onChange={(e) => setUsedStorage(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-300 focus:border-blue-600 text-slate-900 rounded-xl py-3 pl-10 pr-10 text-sm outline-none transition-all duration-150 cursor-pointer focus:ring-1 focus:ring-blue-600/20 font-medium"
                  >
                    {STORAGE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* Cor do Usado */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Cor do Usado *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <Palette className="w-4 h-4" />
                  </span>
                  <select
                    value={usedColor}
                    onChange={(e) => setUsedColor(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-300 focus:border-blue-600 text-slate-900 rounded-xl py-3 pl-10 pr-10 text-sm outline-none transition-all duration-150 cursor-pointer focus:ring-1 focus:ring-blue-600/20 font-medium"
                  >
                    {getColorsForModel(usedModel).map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* IMEI Usado */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  IMEI do Usado *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">
                    #
                  </span>
                  <input
                    type="text"
                    maxLength="15"
                    placeholder="IMEI de 15 dígitos"
                    value={imeiUsed}
                    onChange={(e) => setImeiUsed(e.target.value.replace(/\D/g, ''))}
                    onBlur={() => checkIMEIBlacklist(imeiUsed, 'used')}
                    className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 rounded-xl py-3 pl-10 pr-4 text-slate-900 text-sm font-mono outline-none transition-all duration-200 placeholder:text-slate-400 font-semibold"
                  />
                  {blacklistStatusUsed === 'checking' && (
                    <p className="text-[10px] text-blue-600 mt-1 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Verificando base da Anatel/SIRC...</p>
                  )}
                  {blacklistStatusUsed === 'clean' && (
                    <p className="text-[10px] text-emerald-700 mt-1 flex items-center gap-1">✓ Anatel/SIRC: Aparelho regular sem restrições.</p>
                  )}
                  {blacklistStatusUsed === 'blocked' && (
                    <p className="text-[10px] text-rose-700 mt-1 flex items-center gap-1 font-bold">⚠️ Anatel/SIRC: Bloqueado ou impedido (furto/roubo)!</p>
                  )}
                </div>
              </div>

            </div>

            {/* SELEÇÃO DE PAGAMENTOS MÚLTIPLOS (SPLITS) */}
            {entryType === 'trade-in' && (
              <div className="bg-white/60 border border-slate-200 rounded-xl p-4 md:p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Formas de Pagamento Combinadas *
                  </span>
                  <button
                    type="button"
                    onClick={addPaymentSplit}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-300 transition-colors duration-155 flex items-center gap-1 cursor-pointer"
                  >
                    + Adicionar Pagamento
                  </button>
                </div>

                <div className="space-y-4">
                  {paymentSplits.map((split, index) => {
                    const availableInsts = GATEWAY_RATES[split.gateway] 
                      ? Object.keys(GATEWAY_RATES[split.gateway].creditRates).map(Number).sort((a, b) => a - b)
                      : []
                    
                    return (
                      <div key={split.id} className="relative bg-slate-100/40 border border-slate-200 rounded-xl p-4 space-y-3.5 group/split">
                        {/* Botão Remover Split */}
                        {paymentSplits.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePaymentSplit(index)}
                            className="absolute top-2.5 right-2.5 text-slate-500 hover:text-rose-700 transition-colors duration-150 p-1 rounded hover:bg-slate-100"
                            title="Remover esta forma de pagamento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                          
                          {/* Valor do Split */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Valor (R$)</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">R$</span>
                              <input
                                type="number"
                                step="0.01"
                                placeholder="Valor"
                                value={split.value}
                                onChange={(e) => handleSplitChange(index, 'value', e.target.value)}
                                className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-lg py-1.5 pl-7 pr-2.5 text-slate-900 text-xs outline-none transition-all placeholder:text-slate-400 font-semibold"
                              />
                            </div>
                          </div>

                          {/* Canal / Gateway */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Canal</label>
                            <div className="relative">
                              <select
                                value={split.gateway}
                                onChange={(e) => handleSplitChange(index, 'gateway', e.target.value)}
                                className="w-full appearance-none bg-white border border-slate-300 focus:border-blue-600 text-slate-900 rounded-lg py-1.5 pl-2.5 pr-8 text-xs outline-none cursor-pointer font-semibold"
                              >
                                {Object.keys(GATEWAY_RATES).map(gw => (
                                  <option key={gw} value={gw}>{gw}</option>
                                ))}
                              </select>
                              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <ChevronDown className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>

                          {/* Tipo */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Tipo</label>
                            <div className="relative">
                              <select
                                value={split.type}
                                onChange={(e) => handleSplitChange(index, 'type', e.target.value)}
                                className="w-full appearance-none bg-white border border-slate-300 focus:border-blue-600 text-slate-900 rounded-lg py-1.5 pl-2.5 pr-8 text-xs outline-none cursor-pointer font-semibold"
                              >
                                <option value="credit">Crédito</option>
                                {GATEWAY_RATES[split.gateway]?.hasDebit && (
                                  <option value="debit">Débito</option>
                                )}
                              </select>
                              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <ChevronDown className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>

                          {/* Parcelas */}
                          {split.type === 'credit' && (
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Parcelas</label>
                              <div className="relative">
                                <select
                                  value={split.installments}
                                  onChange={(e) => handleSplitChange(index, 'installments', parseInt(e.target.value))}
                                  className="w-full appearance-none bg-white border border-slate-300 focus:border-blue-600 text-slate-900 rounded-lg py-1.5 pl-2.5 pr-8 text-xs outline-none cursor-pointer font-semibold"
                                >
                                  {availableInsts.map(inst => (
                                    <option key={inst} value={inst}>{inst}x</option>
                                  ))}
                                </select>
                                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Resumo Consolidado das Taxas */}
                {calculationData.isValid && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 border-t border-slate-200 pt-3 gap-2">
                    <div className="flex gap-4">
                      <span>Adicional Total: <strong className="text-slate-900">{formatBRL(calculationData.totalValue)}</strong></span>
                      <span>Líquido Recebido: <strong className="text-emerald-700">{formatBRL(calculationData.netReceived)}</strong></span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded self-start sm:self-auto">
                      Taxa Média Ponderada: {calculationData.appliedRate}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* EXIBIÇÃO DE RESULTADOS */}
          <div className="space-y-4">
            
            {entryType === 'trade-in' ? (
              <>
                {/* Erro de Gateway */}
                {!calculationData.isValid ? (
                  <div className="bg-red-950/60 border border-red-500/30 rounded-2xl p-6 flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-rose-700 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-rose-800 font-semibold text-sm">Opção Indisponível</h3>
                      <p className="text-xs text-red-300/80 mt-1">{calculationData.errorMsg}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Preço de Vitrine */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/80 rounded-2xl p-6 relative overflow-hidden transition-all duration-200 hover:border-blue-300 group shadow-sm shadow-blue-500/5">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-100/30 transition-all duration-300"></div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">
                          Preço de Vitrine
                        </span>
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="mt-4">
                        <h3 className="text-xs text-slate-500 font-medium">Preço de Venda do Usado</h3>
                        <p className="text-3xl font-extrabold text-blue-900 mt-1 tracking-tight">
                          {formatBRL(calculationData.vitrinePrice)}
                        </p>
                      </div>
                      <div className="mt-3 text-[10px] text-slate-500 flex items-center gap-1.5 border-t border-slate-200/85 pt-2.5">
                        <Info className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>Custo Novo + Margem ({formatBRL(parseFloat(profitMargin) || 0)}) + Despesa ({formatBRL(parseFloat(operationalCost) || 0)}) - Líquido Recebido</span>
                      </div>
                    </div>

                    {/* Avaliação Máxima do Usado */}
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/80 rounded-2xl p-6 relative overflow-hidden transition-all duration-200 hover:border-emerald-300 group shadow-sm shadow-emerald-500/5">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-100/30 transition-all duration-300"></div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                          Proposta ao Cliente
                        </span>
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="mt-4">
                        <h3 className="text-xs text-slate-500 font-medium">Avaliação Máxima do Usado</h3>
                        <p className="text-3xl font-extrabold text-emerald-900 mt-1 tracking-tight">
                          {formatBRL(calculationData.maxEvaluation)}
                        </p>
                      </div>
                      
                      {/* Badge Inteligente */}
                      {currentModelAverage && currentModelAverage.count >= 5 && (
                        <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] p-2.5 rounded-xl flex items-start gap-2 animate-pulse mb-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <span>
                            <strong>Estoque Crítico ({currentModelAverage.category === 'Saldo' ? 'Saldo' : 'Comum'}) ({currentModelAverage.count} unid.):</strong> Margem sugerida reduzida automaticamente em 25% para acelerar o giro.
                          </span>
                        </div>
                      )}
                      {currentModelAverage ? (
                        <div className="mt-3 text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1.5 rounded-lg flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 font-semibold">
                            <Archive className="w-3.5 h-3.5 text-blue-755 text-blue-700" />
                            <span>Estoque Histórico ({currentModelAverage.category === 'Saldo' ? 'Saldo' : 'Comum'}): {currentModelAverage.count} unidades</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between text-[9px] text-slate-500 border-t border-slate-200 pt-1 gap-1">
                            <span>Médio Pago: <strong className="text-emerald-700">{formatBRL(currentModelAverage.avgCost)}</strong></span>
                            <span>Média Vitrine: <strong className="text-slate-950">{formatBRL(currentModelAverage.avgVitrine)}</strong></span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 text-[10px] text-slate-500 flex items-center gap-1.5 border-t border-slate-100 pt-2.5">
                          <Info className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Primeira entrada deste modelo na base.</span>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Preço de Vitrine Estimado */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/80 rounded-2xl p-6 relative overflow-hidden transition-all duration-200 hover:border-blue-300 group shadow-sm shadow-blue-500/5">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-100/30 transition-all duration-300"></div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">
                      Preço de Vitrine
                    </span>
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-xs text-slate-500 font-medium">Preço de Venda do Usado</h3>
                    <p className="text-3xl font-extrabold text-blue-900 mt-1 tracking-tight">
                      {formatBRL(parseFloat(supplierVitrine) || 0)}
                    </p>
                  </div>
                  <div className="mt-3 text-[10px] text-slate-500 flex items-center gap-1.5 border-t border-slate-200/85 pt-2.5">
                    <Info className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>Valor estimado para revenda na vitrine da loja</span>
                  </div>
                </div>

                {/* Margem Bruta Estimada */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/80 rounded-2xl p-6 relative overflow-hidden transition-all duration-200 hover:border-emerald-300 group shadow-sm shadow-emerald-500/5">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-100/30 transition-all duration-300"></div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                      Margem Bruta Estimada
                    </span>
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-xs text-slate-500 font-medium">Lucro Bruto Estimado</h3>
                    <p className="text-3xl font-extrabold text-emerald-900 mt-1 tracking-tight">
                      {formatBRL((parseFloat(supplierVitrine) || 0) - (parseFloat(supplierCost) || 0))}
                    </p>
                  </div>
                  <div className="mt-3 text-[10px] text-slate-500 flex items-center gap-1.5 border-t border-emerald-200/85 pt-2.5">
                    <Info className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>Margem estimada (Vitrine - Custo de Compra)</span>
                  </div>
                </div>

              </div>
            )}

            {/* Ações Rápidas */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleCopySummary}
                className="flex-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 py-3.5 px-6 rounded-xl text-sm font-semibold tracking-tight transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 shadow-sm"
              >
                <Copy className="w-4 h-4 text-slate-600" />
                {copySuccess ? 'Copiado!' : 'Copiar Resumo da Avaliação'}
              </button>
              
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveEvaluation}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-6 rounded-xl text-sm font-semibold tracking-tight transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10"
              >
                <Database className="w-4 h-4" />
                {isSaving ? 'Salvando...' : entryType === 'supplier' ? 'Confirmar & Salvar Compra' : 'Confirmar & Salvar Venda'}
              </button>
            </div>

          </div>

        </section>

        {/* COLUNA DIREITA: Checklist Técnico e KPIs (Col 5) */}
        <section className="lg:col-span-5 space-y-8">
          
          {/* Painel do Checklist */}
          <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6">
            <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
              <ListTodo className="w-5 h-5 text-purple-600" />
              2. Checklist Técnico do Usado
            </h2>

            <div className="space-y-6">
              
              {/* Saúde da Bateria */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Saúde da Bateria
                  </label>
                  {batteryHealth < 80 ? (
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-red-950 border border-red-500/30 text-rose-700 px-2 py-0.5 rounded animate-pulse">
                      Necessita Troca
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-950 border border-emerald-500/30 text-emerald-700 px-2 py-0.5 rounded">
                      Bateria OK
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <Battery className={`w-4 h-4 ${batteryHealth < 80 ? 'text-rose-700' : 'text-emerald-700'}`} />
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="Saúde em %"
                    value={batteryHealth}
                    onChange={(e) => setBatteryHealth(Math.min(100, Math.max(1, parseInt(e.target.value) || 0)))}
                    className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-xl py-3 pl-10 pr-4 text-slate-900 text-sm outline-none transition-all duration-200 focus:ring-1 focus:ring-blue-600/20 font-semibold"
                  />
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={batteryHealth}
                  onChange={(e) => setBatteryHealth(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
                />
              </div>

              {/* Tela Original */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Tela Original?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOriginalScreen(true)}
                    className={`py-3 text-xs font-semibold rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 ${
                      originalScreen
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${originalScreen ? 'text-white' : 'text-slate-400'}`} />
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setOriginalScreen(false)}
                    className={`py-3 text-xs font-semibold rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 ${
                      !originalScreen
                        ? 'bg-rose-600 border-rose-600 text-white shadow-sm shadow-rose-600/10'
                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <XCircle className={`w-4 h-4 ${!originalScreen ? 'text-white' : 'text-slate-400'}`} />
                    Não / Paralela
                  </button>
                </div>
              </div>

              {/* Face ID / Touch ID */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Face ID / Touch ID
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBiometricsStatus('ok')}
                    className={`py-3 text-xs font-semibold rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 ${
                      biometricsStatus === 'ok'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${biometricsStatus === 'ok' ? 'text-white' : 'text-slate-400'}`} />
                    OK Funcionando
                  </button>
                  <button
                    type="button"
                    onClick={() => setBiometricsStatus('defeito')}
                    className={`py-3 text-xs font-semibold rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 ${
                      biometricsStatus === 'defeito'
                        ? 'bg-rose-600 border-rose-600 text-white shadow-sm shadow-rose-600/10'
                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <XCircle className={`w-4 h-4 ${biometricsStatus === 'defeito' ? 'text-white' : 'text-slate-400'}`} />
                    Com Defeito
                  </button>
                </div>
              </div>

              {/* Câmeras e Foco */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Câmeras e Foco
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCameraStatus('ok')}
                    className={`py-3 text-[11px] font-semibold rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 ${
                      cameraStatus === 'ok'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${cameraStatus === 'ok' ? 'text-white' : 'text-slate-400'}`} />
                    OK Funcionando
                  </button>
                  <button
                    type="button"
                    onClick={() => setCameraStatus('defeito')}
                    className={`py-3 text-[11px] font-semibold rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 ${
                      cameraStatus === 'defeito'
                        ? 'bg-rose-600 border-rose-600 text-white shadow-sm shadow-rose-600/10'
                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <XCircle className={`w-4 h-4 ${cameraStatus === 'defeito' ? 'text-white' : 'text-slate-400'}`} />
                    Com Defeito
                  </button>
                </div>
              </div>

              {/* Estado da Carcaça */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Estado da Carcaça
                </label>
                <div className="relative">
                  <select
                    value={bodyCondition}
                    onChange={(e) => setBodyCondition(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-300 focus:border-blue-600 text-slate-900 rounded-xl py-3 px-4 text-sm outline-none transition-all duration-150 cursor-pointer focus:ring-1 focus:ring-blue-600/20 font-medium"
                  >
                    <option value="Excelente">Excelente (Sem marcas)</option>
                    <option value="Marcas Leves">Marcas Leves (Pequenos riscos)</option>
                    <option value="Trincado/Quebrado">Trincado / Quebrado (Danos fisicos)</option>
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Painel de Inventário */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Archive className="w-4 h-4 text-blue-600" />
                Estoque Recebido & Médias de Preço
              </h3>
              <button
                type="button"
                onClick={() => { setActiveTab('estoque'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-500 hover:underline transition-all cursor-pointer flex items-center gap-0.5"
              >
                Painel Completo ➔
              </button>
            </div>
            
            {inventoryStats.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Nenhum estoque no histórico para calcular médias.</p>
            ) : (
              <div className="max-h-[260px] overflow-y-auto pr-1 space-y-2.5">
                {inventoryStats.map((item) => (
                  <div key={`${item.model}-${item.storage}-${item.category}`} className="flex justify-between items-center bg-white/50 border border-slate-200 rounded-lg p-3 hover:border-slate-200 transition-colors">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">{item.model}</span>
                        {item.category === 'Saldo' && (
                          <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[9px] font-black px-1.5 py-0.5 rounded leading-none">
                            SALDO
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono block">{item.storage} • {item.count} unidade(s)</span>
                      <span className="text-[9px] text-slate-500 block mt-0.5">
                        Médio Pago (Custo): <strong className="text-emerald-500">{formatBRL(item.avgCost)}</strong>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-blue-600 block">{formatBRL(item.avgVitrine)}</span>
                      <span className="text-[9px] text-slate-500 block">Médio Vitrine (Venda)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>

      </main>

      {/* HISTÓRICO DE AVALIAÇÕES */}
      <section className="max-w-7xl mx-auto px-6 mt-12">
        <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-700" />
                Histórico de Vendas & Trade-ins
              </h2>
              <p className="text-xs text-slate-500">Controle completo com múltiplos pagamentos combinados</p>
            </div>
            
            {/* Busca */}
            <div className="relative w-full sm:w-80">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Buscar por cliente, IMEI, cor ou modelo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-350 focus:border-blue-600 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-900 outline-none transition-all focus:ring-1 focus:ring-blue-600/20 font-medium placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Barra de Filtros e Ordenação */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
              
              {/* Filtro por Categoria */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Categoria</span>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-white border border-slate-350 focus:border-blue-600 rounded-lg px-2 py-1.5 text-[11px] text-slate-700 outline-none cursor-pointer font-semibold"
                >
                  <option value="all">Todas as Categorias</option>
                  <option value="Comum">Usado Comum</option>
                  <option value="Saldo">iPhone de Saldo</option>
                </select>
              </div>

              {/* Filtro por Tipo */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipo</span>
                <select
                  value={filterEntryType}
                  onChange={(e) => setFilterEntryType(e.target.value)}
                  className="bg-white border border-slate-350 focus:border-blue-600 rounded-lg px-2 py-1.5 text-[11px] text-slate-700 outline-none cursor-pointer font-semibold"
                >
                  <option value="all">Todos os Lançamentos</option>
                  <option value="trade-in">Trade-ins (Clientes)</option>
                  <option value="supplier">Compras (Fornecedores)</option>
                </select>
              </div>

              {/* Filtro por Modelo */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Modelo Usado</span>
                <select
                  value={filterModel}
                  onChange={(e) => setFilterModel(e.target.value)}
                  className="bg-white border border-slate-350 focus:border-blue-600 rounded-lg px-2 py-1.5 text-[11px] text-slate-700 outline-none cursor-pointer font-semibold truncate"
                >
                  <option value="all">Todos os Modelos</option>
                  {USED_MODELS.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              {/* Ordenação */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ordenar Por</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-slate-350 focus:border-blue-600 rounded-lg px-2 py-1.5 text-[11px] text-slate-700 outline-none cursor-pointer font-semibold"
                >
                  <option value="date-desc">Mais Recentes</option>
                  <option value="date-asc">Mais Antigos</option>
                  <option value="model-used">Modelo Usado (A-Z)</option>
                  <option value="model-new">Modelo Vendido (A-Z)</option>
                  <option value="vitrine-desc">Preço Vitrine (Maior)</option>
                  <option value="vitrine-asc">Preço Vitrine (Menor)</option>
                </select>
              </div>

            </div>

            {/* Contador de Lançamentos */}
            <div className="text-right text-[11px] text-slate-500 font-semibold self-end lg:self-center border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-200">
              Exibindo <span className="text-blue-600 font-extrabold">{filteredEvaluations.length}</span> de <span className="text-slate-700 font-bold">{evaluations.length}</span> lançamentos
            </div>
          </div>

          {filteredEvaluations.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-300 rounded-xl space-y-2">
              <p className="text-sm text-slate-500">Nenhum registro encontrado.</p>
              <p className="text-xs text-slate-400">Tente buscar por um termo diferente.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Data e Cliente</th>
                    <th className="py-3 px-4">Novo Vendido (Detalhes)</th>
                    <th className="py-3 px-4">Usado Recebido (Detalhes)</th>
                    <th className="py-3 px-4">Formas de Pagamento</th>
                    <th className="py-3 px-4 text-right">Preço Vitrine</th>
                    <th className="py-3 px-4 text-right">Avaliado</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredEvaluations.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-55 transition-colors duration-155 group">
                      
                      {/* Cliente e Data */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">{record.client_name || record.clientName || 'Cliente Geral'}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(record.created_at).toLocaleDateString('pt-BR')} às {new Date(record.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Novo Vendido */}
                      <td className="py-3 px-4">
                        {(record.new_model === 'COMPRA FORNECEDOR' || record.newModel === 'COMPRA FORNECEDOR') ? (
                          <div className="space-y-1">
                            <span className="bg-slate-100 text-slate-800 border border-slate-300 text-[10px] font-extrabold px-2 py-0.5 rounded block w-fit">
                              📦 COMPRA FORNECEDOR
                            </span>
                            <span className="text-[10px] text-slate-500 block">Estoque Direto</span>
                          </div>
                        ) : (
                          <>
                            <span className="font-medium text-slate-700 block font-semibold">
                              {record.new_model || record.newModel} ({record.new_storage || record.newStorage || '128GB'})
                            </span>
                            <div className="text-[10px] text-slate-500 space-y-0.5">
                              <span>Cor: {record.new_color || record.newColor || 'N/D'}</span>
                              <span className="block font-mono text-slate-500">IMEI: {record.imei_new || record.imeiNew || 'N/D'}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 block mt-1">
                              <span>Custo: {formatBRL(record.new_cost || record.newCost)}</span>
                              <div className="text-[9px] text-slate-500 space-y-0.5 mt-0.5">
                                <span>Margem Lucro: {formatBRL(record.profit_margin !== undefined ? record.profit_margin : (record.profitMargin !== undefined ? record.profitMargin : 800))}</span>
                                <span className="block">Despesa Op: {formatBRL(record.operational_cost !== undefined ? record.operational_cost : (record.operationalCost !== undefined ? record.operationalCost : 120))}</span>
                              </div>
                            </div>
                          </>
                        )}
                      </td>

                      {/* Usado */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-700">
                            {record.used_model || record.usedModel} ({record.used_storage || record.usedStorage || '128GB'})
                          </span>
                          {(record.used_category || record.usedCategory) === 'Saldo' && (
                            <span className="bg-amber-50 text-amber-800 border border-amber-500/20 text-[9px] font-extrabold px-1.5 py-0.5 rounded leading-none">
                              SALDO
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          Cor: {record.used_color || record.usedColor || 'N/D'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono block">
                          IMEI: {record.imei_used || record.imeiUsed || 'N/D'}
                        </span>
                        <div className="flex gap-2 items-center mt-1 text-[9px]">
                          <span className={`px-1 rounded-sm ${
                            (record.battery_health || record.batteryHealth) < 80 
                              ? 'bg-rose-50 text-rose-700 border border-rose-250' 
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            🔋 {record.battery_health || record.batteryHealth}%
                          </span>
                          <span className={`px-1 rounded-sm ${
                            (record.original_screen !== undefined ? record.original_screen : record.originalScreen)
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-rose-50 text-rose-700 border border-rose-250'
                          }`}>
                            🖥️ {(record.original_screen !== undefined ? record.original_screen : record.originalScreen) ? 'Orig' : 'Alt'}
                          </span>
                          <span className="text-slate-500 font-medium">Carcaça: {record.body_condition || 'Excelente'}</span>
                        </div>
                      </td>

                      {/* Pagamento Fracionado */}
                      <td className="py-3 px-4 max-w-[220px]">
                        {(record.new_model === 'COMPRA FORNECEDOR' || record.newModel === 'COMPRA FORNECEDOR') ? (
                          <span className="text-slate-500 text-xs italic block">Custo Pago: {formatBRL(record.max_evaluation || record.maxEvaluation)}</span>
                        ) : (
                          <>
                            <span className="text-slate-700 font-bold block">{formatBRL(record.additional_value || record.additionalValue)}</span>
                            {record.payment_splits && Array.isArray(record.payment_splits) ? (
                              <div className="mt-1 space-y-0.5">
                                {record.payment_splits.map((s, idx) => (
                                  <span key={idx} className="text-[9px] text-slate-500 block leading-tight truncate">
                                    • {s.gateway} ({s.type === 'debit' ? 'Déb' : `${s.installments}x`}): {formatBRL(parseFloat(s.value) || 0)}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500 block truncate">
                                {record.gateway} ({record.installments === 1 && (record.gateway === 'Dinheiro / Pix' || record.applied_rate === 0) ? 'Débito' : `${record.installments}x`})
                              </span>
                            )}
                          </>
                        )}
                      </td>

                      {/* Vitrine */}
                      <td className="py-3 px-4 text-right font-bold text-blue-600">
                        {formatBRL(record.vitrine_price || record.vitrinePrice)}
                      </td>

                      {/* Avaliação Usado */}
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">
                        {formatBRL(record.max_evaluation || record.maxEvaluation)}
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleLoadRecord(record)}
                            title="Editar lançamento"
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvaluation(record.id)}
                            title="Excluir venda"
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-rose-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* DISCREET PANEL: Auditoria Interna do Gerente (Rodapé) */}
      <footer className="max-w-7xl mx-auto px-6 mt-12">
        <div className="bg-white/90 border border-slate-200 rounded-2xl p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <ShieldCheck className="w-5 h-5 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Painel de Auditoria Interna (Exclusivo Gerente)
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-slate-500">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest block">Retenção de Taxa</span>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {calculationData.isValid ? formatBRL(calculationData.machineFee) : 'R$ 0,00'}
              </p>
              <span className="text-[10px] text-slate-400">Comissão retida pela maquininha</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest block">Custos / Despesas Op</span>
              <p className="text-lg font-bold text-rose-700 mt-1">
                {calculationData.isValid ? formatBRL(calculationData.giftCost) : 'R$ 0,00'}
              </p>
              <span className="text-[10px] text-slate-400">Brindes, reparos e custos adicionais</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest block">Líquido Recebido</span>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {calculationData.isValid ? formatBRL(calculationData.netReceived) : 'R$ 0,00'}
              </p>
              <span className="text-[10px] text-slate-400">Valor líquido na conta da loja</span>
            </div>

            <div className="bg-slate-100/60 border border-slate-200 rounded-xl p-3 flex flex-col justify-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 block">
                Lucro Combinado Garantido
              </span>
              <p className="text-xl font-black text-slate-900 mt-0.5">
                {calculationData.isValid ? formatBRL(calculationData.totalProfit) : 'R$ 800,00'}
              </p>
              <span className="text-[9px] text-slate-500">Lucro líquido livre de despesas</span>
            </div>
          </div>

          {/* Gráficos de KPIs Gerenciais em SVG (v12) */}
          {dashboardStats.totalLaudos > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-200 pt-6 mt-4">
              
              {/* Gráfico 1: Captações por Vendedor */}
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">Laudos por Vendedor</span>
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                  {dashboardStats.sellers.slice(0, 5).map((s, idx) => {
                    const maxVal = Math.max(...dashboardStats.sellers.map(item => item.count)) || 1;
                    const percent = (s.count / maxVal) * 100;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-800">{s.name}</span>
                          <span className="text-slate-500">{s.count} laudo(s)</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Gráfico 2: Distribuição de Grade */}
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">Distribuição de Grades Recebidas</span>
                <div className="flex items-center justify-around bg-slate-50 p-4 rounded-xl border border-slate-200/60 min-h-[140px]">
                  {['A', 'B', 'C'].map(g => {
                    const count = dashboardStats.grades[g] || 0;
                    const total = dashboardStats.totalLaudos || 1;
                    const percent = Math.round((count / total) * 100);
                    return (
                      <div key={g} className="text-center space-y-2">
                        <div className="relative w-16 h-16 flex items-center justify-center rounded-full border border-slate-200 bg-white shadow-inner font-extrabold text-slate-900 text-sm">
                          {percent}%
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Grade {g}</span>
                          <span className="text-[10px] text-slate-500">{count} laudo(s)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>
          )}
        </div>
      </footer>
        </>
      )}

      {activeTab === 'estoque' && (
        <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
          <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6">
            
            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <Archive className="w-5 h-5 text-blue-600" />
                  Painel de Estoque & Atacado
                </h2>
                <p className="text-xs text-slate-500">Média de custos, preços sugeridos e geração de orçamentos para fornecedores</p>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleGenerateQuotePDF}
                  disabled={selectedStockKeys.length === 0}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 shadow-sm ${
                    selectedStockKeys.length > 0
                      ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer hover:scale-[1.01] active:scale-[0.99]'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  }`}
                >
                  <Printer className="w-4 h-4" />
                  Gerar Orçamento PDF {selectedStockKeys.length > 0 && `(${selectedStockKeys.length})`}
                </button>
              </div>
            </div>

            {/* Barra de Filtros e Alternador de Preço */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
                {/* Busca */}
                <div className="relative flex-1 max-w-xs">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar modelo..."
                    value={stockSearchQuery}
                    onChange={(e) => setStockSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-lg py-1.5 pl-9 pr-3 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 font-semibold"
                  />
                </div>

                {/* Filtro Categoria */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Categoria:</span>
                  <select
                    value={stockFilterCategory}
                    onChange={(e) => setStockFilterCategory(e.target.value)}
                    className="bg-white border border-slate-300 focus:border-blue-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none cursor-pointer font-semibold"
                  >
                    <option value="all">Todas</option>
                    <option value="Comum">Usado Comum</option>
                    <option value="Saldo">iPhone de Saldo</option>
                  </select>
                </div>
              </div>

              {/* Toggle Varejo vs Atacado */}
              <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-xl border border-slate-300/60 self-start lg:self-center">
                <button
                  type="button"
                  onClick={() => setStockPricingMode('retail')}
                  className={`py-1.5 px-3.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    stockPricingMode === 'retail'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200 font-bold shadow'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Venda Varejo (Vitrine)
                </button>
                <button
                  type="button"
                  onClick={() => setStockPricingMode('wholesale')}
                  className={`py-1.5 px-3.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    stockPricingMode === 'wholesale'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200 font-bold shadow'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Remove a taxa de despesa operacional de R$ 120,00"
                >
                  Preço Atacado (Sem R$ 120)
                </button>
              </div>

            </div>

            {/* Listagem em Tabela */}
            {filteredStockStats.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-300 rounded-xl">
                <p className="text-sm text-slate-500">Nenhum estoque encontrado para os filtros selecionados.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white/50">
                <table className="w-full text-sm text-slate-700 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="py-3 px-4 text-center w-12">
                        <input
                          type="checkbox"
                          checked={filteredStockStats.length > 0 && filteredStockStats.every(item => selectedStockKeys.includes(`${item.model}-${item.storage}-${item.category}`))}
                          onChange={() => {
                            const allSel = filteredStockStats.every(item => selectedStockKeys.includes(`${item.model}-${item.storage}-${item.category}`))
                            if (allSel) {
                              const keysToRemove = filteredStockStats.map(item => `${item.model}-${item.storage}-${item.category}`)
                              setSelectedStockKeys(prev => prev.filter(k => !keysToRemove.includes(k)))
                            } else {
                              const keysToAdd = filteredStockStats.map(item => `${item.model}-${item.storage}-${item.category}`)
                              setSelectedStockKeys(prev => Array.from(new Set([...prev, ...keysToAdd])))
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-4 text-left font-bold text-xs uppercase text-slate-500 tracking-wider">Aparelho</th>
                      <th className="py-3 px-4 text-center font-bold text-xs uppercase text-slate-500 tracking-wider">Armazenamento</th>
                      <th className="py-3 px-4 text-center font-bold text-xs uppercase text-slate-500 tracking-wider font-mono">Qtd</th>
                      <th className="py-3 px-4 text-right font-bold text-xs uppercase text-slate-500 tracking-wider">Custo Médio (Pago)</th>
                      <th className="py-3 px-4 text-right font-bold text-xs uppercase text-slate-500 tracking-wider">
                        {stockPricingMode === 'wholesale' ? 'Venda Atacado (Sugerida)' : 'Venda Varejo (Vitrine)'}
                      </th>
                      <th className="py-3 px-4 text-right font-bold text-xs uppercase text-slate-500 tracking-wider">Margem Média Unitária</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStockStats.map((item) => {
                      const itemKey = `${item.model}-${item.storage}-${item.category}`
                      const isSelected = selectedStockKeys.includes(itemKey)
                      
                      const sellPrice = stockPricingMode === 'wholesale' 
                        ? (item.avgVitrine - item.avgOpCost) 
                        : item.avgVitrine
                      
                      const margin = sellPrice - item.avgCost

                      return (
                        <tr
                          key={itemKey}
                          className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${
                            isSelected ? 'bg-blue-50/20' : ''
                          }`}
                        >
                          <td className="py-3 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                setSelectedStockKeys(prev => 
                                  prev.includes(itemKey)
                                    ? prev.filter(k => k !== itemKey)
                                    : [...prev, itemKey]
                                )
                              }}
                              className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            <div className="flex items-center gap-2">
                              <span>{item.model}</span>
                              {item.category === 'Saldo' && (
                                <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[9px] font-black px-1.5 py-0.5 rounded leading-none">
                                  SALDO
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center font-medium text-slate-600">{item.storage}</td>
                          <td className="py-3 px-4 text-center font-bold text-slate-900">{item.count}</td>
                          <td className="py-3 px-4 text-right font-semibold text-slate-600">{formatBRL(item.avgCost)}</td>
                          <td className={`py-3 px-4 text-right font-extrabold ${stockPricingMode === 'wholesale' ? 'text-indigo-600' : 'text-blue-600'}`}>
                            {formatBRL(sellPrice)}
                          </td>
                          <td className={`py-3 px-4 text-right font-bold ${margin >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {formatBRL(margin)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      )}

      {activeTab === 'assistencia' && (
        <div className="max-w-7xl mx-auto px-6 mt-8 space-y-6">
          {/* Header de Sub-Abas */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 border border-slate-200/80 p-3 rounded-2xl">
            <div className="space-y-0.5">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-purple-600" />
                Fitch Assistência & Serviços
              </h2>
              <p className="text-xs text-slate-500">Abertura de O.S. com validador de IMEI, Kanban técnico e controle de peças</p>
            </div>
            
            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
              {['balcao', 'kanban', 'estoque_pecas'].map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setAssistenciaSubTab(sub)}
                  className={`flex-1 sm:flex-initial py-1.5 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    assistenciaSubTab === sub
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {sub === 'balcao' ? '🏪 Balcão / PDV' : sub === 'kanban' ? '🛠️ Kanban Técnico' : '📦 Estoque de Peças'}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-Aba 1: Balcão / PDV (Abertura de OS) */}
          {assistenciaSubTab === 'balcao' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Formulário de Abertura de OS */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-purple-600" />
                    1. Abertura Rápida de Ordem de Serviço
                  </h3>
                  <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded font-bold border border-purple-100">
                    BALCÃO ATIVO
                  </span>
                </div>

                {/* Seletor de Tipo de OS */}
                <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Classificação da Ordem de Serviço</span>
                    <span className="text-[10px] text-slate-500 block">Identifique se é um reparo avulso cobrado ou acionamento de garantia</span>
                  </div>
                  <div className="flex gap-1.5 bg-slate-250 p-1 rounded-xl border border-slate-300 w-full sm:w-auto">
                    {['Serviço', 'Garantia'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setOsType(type)}
                        className={`flex-1 sm:flex-initial py-1.5 px-4 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                          osType === type
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-800'
                        }`}
                      >
                        {type === 'Serviço' ? '💸 Reparo Cobrado' : '🛡️ Garantia Fitch'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Nome do Cliente */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nome do Cliente *</label>
                    <input
                      type="text"
                      placeholder="Ex: João da Silva"
                      value={osClientName}
                      onChange={(e) => setOsClientName(e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-xl py-2 px-3 text-xs text-slate-900 outline-none transition-all focus:ring-1 focus:ring-blue-600/20 font-medium"
                    />
                  </div>

                  {/* Telefone */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Telefone *</label>
                    <input
                      type="text"
                      placeholder="Ex: (11) 99999-9999"
                      value={osClientPhone}
                      onChange={(e) => setOsClientPhone(e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-xl py-2 px-3 text-xs text-slate-900 outline-none transition-all focus:ring-1 focus:ring-blue-600/20 font-medium"
                    />
                  </div>

                  {/* CPF / CNPJ */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">CPF *</label>
                      {osClientCpf && (
                        <span className={`text-[9px] font-bold ${validarCPF(osClientCpf) ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {validarCPF(osClientCpf) ? '● Válido' : '● Inválido'}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Apenas números"
                      value={osClientCpf}
                      onChange={(e) => setOsClientCpf(e.target.value)}
                      className={`w-full bg-white border rounded-xl py-2 px-3 text-xs text-slate-900 outline-none transition-all focus:ring-1 focus:ring-blue-600/20 font-medium ${
                        osClientCpf ? (validarCPF(osClientCpf) ? 'border-emerald-500 focus:border-emerald-600' : 'border-rose-450 focus:border-rose-600') : 'border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-5 border-t border-slate-100 pt-5">
                  {/* Aparelho */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Aparelho *</label>
                    <select
                      value={osDeviceModel}
                      onChange={(e) => setOsDeviceModel(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900 outline-none font-medium cursor-pointer"
                    >
                      {USED_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  {/* Cor */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Cor *</label>
                    <select
                      value={osDeviceColor}
                      onChange={(e) => setOsDeviceColor(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900 outline-none font-medium cursor-pointer"
                    >
                      {APPLE_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Armazenamento */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Capacidade *</label>
                    <select
                      value={osDeviceStorage}
                      onChange={(e) => setOsDeviceStorage(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-xs text-slate-900 outline-none font-medium cursor-pointer"
                    >
                      {STORAGE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* IMEI */}
                  <div className="space-y-1.5 md:col-span-2">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">IMEI *</label>
                      {osDeviceImei && (
                        <span className={`text-[9px] font-bold ${validarIMEI(osDeviceImei) ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {validarIMEI(osDeviceImei) ? '● Válido' : '● Inválido'}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="15 dígitos"
                      value={osDeviceImei}
                      onChange={(e) => setOsDeviceImei(e.target.value)}
                      maxLength={15}
                      className={`w-full bg-white border rounded-xl py-2 px-3 text-xs text-slate-900 outline-none transition-all focus:ring-1 focus:ring-blue-600/20 font-medium ${
                        osDeviceImei ? (validarIMEI(osDeviceImei) ? 'border-emerald-500 focus:border-emerald-600' : 'border-rose-450 focus:border-rose-600') : 'border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-slate-100 pt-5">
                  {/* Número de Série */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Número de Série *</label>
                    <input
                      type="text"
                      placeholder="Ex: F17CN890N4Y0"
                      value={osDeviceSerial}
                      onChange={(e) => setOsDeviceSerial(e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-xl py-2 px-3 text-xs text-slate-900 outline-none transition-all focus:ring-1 focus:ring-blue-600/20 font-medium"
                    />
                  </div>

                  {/* Sintoma / Defeito */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Sintoma Relatado *</label>
                    <input
                      type="text"
                      placeholder="Ex: Tela quebrou após queda, sem touch"
                      value={osSymptom}
                      onChange={(e) => setOsSymptom(e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-blue-600 rounded-xl py-2 px-3 text-xs text-slate-900 outline-none transition-all focus:ring-1 focus:ring-blue-600/20 font-medium"
                    />
                  </div>
                </div>

                {/* Checklist Técnico Rápido de Recepção */}
                <div className="border-t border-slate-100 pt-5 space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Checklist Técnico de Entrada (Toque rápido)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { key: 'faceId', label: 'Face ID / Touch ID' },
                      { key: 'tela', label: 'Tela e Touch' },
                      { key: 'camera', label: 'Câmeras' },
                      { key: 'audio', label: 'Áudio (Alto-falante)' },
                      { key: 'conexao', label: 'Wi-Fi / Sinal' },
                      { key: 'bateria', label: 'Bateria' },
                      { key: 'carcaca', label: 'Carcaça/Botões' }
                    ].map((item) => (
                      <div key={item.key} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between gap-1.5">
                        <span className="text-[9px] font-bold text-slate-700 block">{item.label}</span>
                        <div className="flex gap-1">
                          {['Ok', 'Def', 'NT'].map(v => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setOsChecklistEntrada(prev => ({ ...prev, [item.key]: v }))}
                              className={`flex-1 text-[9px] font-extrabold py-1 rounded cursor-pointer transition-all ${
                                osChecklistEntrada[item.key] === v
                                  ? (v === 'Ok' ? 'bg-emerald-500 text-white' : v === 'Def' ? 'bg-rose-500 text-white' : 'bg-slate-500 text-white')
                                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                              }`}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-slate-100 pt-5">
                  {/* Mão de Obra */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Valor Mão de Obra (Sugerido)</label>
                    <input
                      type="number"
                      placeholder={osType === 'Garantia' ? 'R$ 0,00' : 'R$ 150,00'}
                      disabled={osType === 'Garantia'}
                      value={osType === 'Garantia' ? '0' : osLaborValue}
                      onChange={(e) => setOsLaborValue(e.target.value)}
                      className={`w-full border rounded-xl py-2 px-3 text-xs outline-none transition-all focus:ring-1 focus:ring-blue-600/20 font-medium ${
                        osType === 'Garantia' ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white text-slate-900 border-slate-300 focus:border-blue-600'
                      }`}
                    />
                  </div>

                  {/* Desconto */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Desconto Especial</label>
                    <input
                      type="number"
                      placeholder={osType === 'Garantia' ? 'R$ 0,00' : 'R$ 0,00'}
                      disabled={osType === 'Garantia'}
                      value={osType === 'Garantia' ? '0' : osDiscountValue}
                      onChange={(e) => setOsDiscountValue(e.target.value)}
                      className={`w-full border rounded-xl py-2 px-3 text-xs outline-none transition-all focus:ring-1 focus:ring-blue-600/20 font-medium ${
                        osType === 'Garantia' ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white text-slate-900 border-slate-300 focus:border-blue-600'
                      }`}
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={handleSaveOS}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    Abrir Ordem de Serviço & Imprimir Via Cliente
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lista Lateral de OS Recentes */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-1.5">
                  <Archive className="w-4 h-4 text-purple-600" />
                  Ordem de Serviço Recentes
                </h3>

                {ordensServicoList.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Nenhuma ordem de serviço registrada localmente.</p>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {ordensServicoList.slice(0, 10).map((os) => (
                      <div key={os.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex flex-col justify-between gap-2 hover:bg-slate-100/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold block">
                              OS #{os.os_number}
                              {os.tipo_os === 'Garantia' && (
                                <span className="ml-1.5 bg-purple-50 text-purple-700 border border-purple-100 text-[8px] font-black px-1.5 py-0.2 rounded uppercase">Garantia</span>
                              )}
                            </span>
                            <span className="text-xs font-bold text-slate-900 block mt-0.5">{os.client_name}</span>
                            <span className="text-[10px] text-slate-500 font-medium">{os.device_model}</span>
                          </div>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                            os.status === 'Entrada' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            os.status === 'Em Análise' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            os.status === 'Aguardando Peça' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                            os.status === 'Pronto' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {os.status}
                          </span>
                        </div>

                        <div className="flex justify-between items-center border-t border-slate-200/60 pt-2 text-[10px] text-slate-500">
                          <span className="font-semibold text-slate-800">Total: {formatBRL(os.valor_total)}</span>
                          <button
                            type="button"
                            onClick={() => printOSReceipt(os)}
                            className="text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            Comprovante
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Sub-Aba 2: Kanban Técnico */}
          {assistenciaSubTab === 'kanban' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Painel Central Kanban */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm overflow-x-auto">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    🛠️ Quadro de Manutenções Kanban
                  </h3>
                  <span className="text-[10px] text-slate-500 font-bold">Distribuição de Cargas de Trabalho</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Entrada', 'Em Análise', 'Aguardando Peça'].map((colStatus) => {
                    const filteredOS = ordensServicoList.filter(os => os.status === colStatus)
                    return (
                      <div key={colStatus} className="bg-slate-100 border border-slate-200/80 p-3.5 rounded-2xl space-y-3 min-h-[400px] flex flex-col">
                        <div className="flex justify-between items-center border-b border-slate-250 pb-2">
                          <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider block">{colStatus}</span>
                          <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-black leading-none">{filteredOS.length}</span>
                        </div>

                        <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
                          {filteredOS.map((os) => (
                            <div key={os.id} className="bg-white border border-slate-200/60 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
                              <div>
                                <span className="text-[9px] text-slate-400 font-mono block">OS #{os.os_number}</span>
                                <span className="text-xs font-bold text-slate-900 block mt-0.5">{os.device_model}</span>
                                <span className="text-[10px] text-slate-500 block">Cliente: {os.client_name}</span>
                              </div>

                              {/* Ações Técnicas no Card */}
                              <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-100">
                                <select
                                  value={os.status}
                                  onChange={(e) => handleUpdateOSStatus(os.id, e.target.value)}
                                  className="text-[9px] font-bold bg-slate-100 border border-slate-200 rounded py-1 px-1.5 text-slate-700 cursor-pointer"
                                >
                                  <option value="Entrada">Entrada</option>
                                  <option value="Em Análise">Em Análise</option>
                                  <option value="Aguardando Peça">Aguardando Peça</option>
                                  <option value="Pronto">Pronto</option>
                                  <option value="Sem Reparo">Sem Reparo</option>
                                  <option value="Entregue">Entregue</option>
                                </select>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedOsForPart(os.id)
                                    setShowAddPartModal(true)
                                  }}
                                  className="text-[9px] font-bold bg-purple-50 hover:bg-purple-100 border border-purple-100 text-purple-700 py-1 px-2 rounded cursor-pointer"
                                >
                                  + Peça
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedOsForChecklistSaida(os.id)
                                    setOsChecklistSaidaEdit(os.checklist_saida && Object.keys(os.checklist_saida).length > 0 ? os.checklist_saida : { ...os.checklist_entrada })
                                  }}
                                  className="text-[9px] font-bold bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 py-1 px-2 rounded cursor-pointer"
                                >
                                  Exit Test
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-5">
                  {['Pronto', 'Sem Reparo', 'Entregue'].map((colStatus) => {
                    const filteredOS = ordensServicoList.filter(os => os.status === colStatus)
                    return (
                      <div key={colStatus} className="bg-slate-100 border border-slate-200/80 p-3.5 rounded-2xl space-y-3 min-h-[300px] flex flex-col">
                        <div className="flex justify-between items-center border-b border-slate-250 pb-2">
                          <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider block">{colStatus}</span>
                          <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-black leading-none">{filteredOS.length}</span>
                        </div>

                        <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
                          {filteredOS.map((os) => (
                            <div key={os.id} className="bg-white border border-slate-200/60 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
                              <div>
                                <span className="text-[9px] text-slate-400 font-mono block">OS #{os.os_number}</span>
                                <span className="text-xs font-bold text-slate-900 block mt-0.5">{os.device_model}</span>
                                <span className="text-[10px] text-slate-500 block">Cliente: {os.client_name}</span>
                              </div>

                              <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-100">
                                <select
                                  value={os.status}
                                  onChange={(e) => handleUpdateOSStatus(os.id, e.target.value)}
                                  className="text-[9px] font-bold bg-slate-100 border border-slate-200 rounded py-1 px-1.5 text-slate-700 cursor-pointer"
                                >
                                  <option value="Entrada">Entrada</option>
                                  <option value="Em Análise">Em Análise</option>
                                  <option value="Aguardando Peça">Aguardando Peça</option>
                                  <option value="Pronto">Pronto</option>
                                  <option value="Sem Reparo">Sem Reparo</option>
                                  <option value="Entregue">Entregue</option>
                                </select>
                                
                                <span className="text-[9px] font-bold text-slate-500 self-center">Custo Peças: {formatBRL(os.valor_pecas)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Sidebar Co-Pilot IA */}
              <div className="lg:col-span-4 bg-slate-900 text-slate-100 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl relative min-h-[500px] flex flex-col">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4" />
                    🤖 IA Fitch Assist Co-Pilot
                  </h3>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Diagnósticos e esquemáticos de microeletrônica Apple</span>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                  {iaAnswer ? (
                    <div className="bg-slate-850 border border-slate-800 p-4 rounded-2xl text-xs leading-relaxed space-y-2 animate-fade-in whitespace-pre-line text-slate-200">
                      {iaAnswer}
                    </div>
                  ) : (
                    <div className="text-center py-10 space-y-2 text-slate-500">
                      <Cpu className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
                      <p className="text-xs font-medium">Digite uma dúvida de soldagem ou códigos de erro acima (ex: Panic Full, Curto Tigris, True Tone, 4013).</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <textarea
                    placeholder="Cole seu código de erro ou sintoma..."
                    value={iaQuestion}
                    onChange={(e) => setIaQuestion(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-purple-500 rounded-xl py-2 px-3 text-xs text-white outline-none transition-all placeholder:text-slate-500 font-medium resize-none h-20"
                  />
                  <button
                    type="button"
                    disabled={isIaLoading}
                    onClick={handleIaQuery}
                    className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    {isIaLoading ? 'Analisando Circuito...' : 'Perguntar ao Co-Pilot'}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* Sub-Aba 3: Estoque de Peças */}
          {assistenciaSubTab === 'estoque_pecas' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Tabela de Insumos */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm overflow-x-auto">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    📦 Almoxarifado de Peças de Reposição
                  </h3>
                  <span className="text-[10px] text-slate-500 font-bold">Grade Fina de Compatibilidade</span>
                </div>

                <table className="w-full text-sm text-slate-700 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-left">
                      <th className="py-3 px-4 font-bold text-xs uppercase text-slate-500 tracking-wider">SKU</th>
                      <th className="py-3 px-4 font-bold text-xs uppercase text-slate-500 tracking-wider">Nome da Peça</th>
                      <th className="py-3 px-4 font-bold text-xs uppercase text-slate-500 tracking-wider">Compatibilidade</th>
                      <th className="py-3 px-4 text-center font-bold text-xs uppercase text-slate-500 tracking-wider">Estoque</th>
                      <th className="py-3 px-4 text-right font-bold text-xs uppercase text-slate-500 tracking-wider">Custo</th>
                      <th className="py-3 px-4 text-right font-bold text-xs uppercase text-slate-500 tracking-wider">Preço Venda</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pecasList.map((peca) => {
                      const isLowStock = peca.estoque_atual <= peca.estoque_minimo
                      return (
                        <tr key={peca.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-900">{peca.sku}</td>
                          <td className="py-3 px-4 font-semibold text-slate-900">{peca.nome}</td>
                          <td className="py-3 px-4 text-slate-600 font-medium">{peca.compatibilidade_modelo}</td>
                          <td className="py-3 px-4 text-center font-bold">
                            <span className={`px-2 py-0.5 rounded text-[10px] border ${
                              isLowStock
                                ? 'bg-rose-50 text-rose-700 border-rose-200/60 font-black animate-pulse'
                                : 'bg-slate-100 text-slate-700 border-slate-200/60'
                            }`}>
                              {peca.estoque_atual} un
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-slate-600">{formatBRL(peca.preco_custo)}</td>
                          <td className="py-3 px-4 text-right font-extrabold text-blue-600">{formatBRL(peca.preco_venda)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Form de Cadastro de Nova Peça */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-1.5">
                  <Archive className="w-4 h-4 text-purple-600" />
                  Cadastrar Peça / Insumo
                </h3>

                <form onSubmit={handleSaveNewPart} className="space-y-4">
                  {/* SKU */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">SKU / Código da Peça</label>
                    <input
                      type="text"
                      placeholder="Ex: TEL-IP11"
                      value={newPartSku}
                      onChange={(e) => setNewPartSku(e.target.value)}
                      className="w-full bg-white border border-slate-350 focus:border-blue-600 rounded-xl py-2 px-3 text-xs text-slate-900 outline-none transition-all font-medium"
                    />
                  </div>

                  {/* Nome */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Descrição da Peça</label>
                    <input
                      type="text"
                      placeholder="Ex: Tela Premium iPhone 11"
                      value={newPartName}
                      onChange={(e) => setNewPartName(e.target.value)}
                      className="w-full bg-white border border-slate-350 focus:border-blue-600 rounded-xl py-2 px-3 text-xs text-slate-900 outline-none transition-all font-medium"
                    />
                  </div>

                  {/* Compatibilidade */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Compatibilidade Apple</label>
                    <select
                      value={newPartCompat}
                      onChange={(e) => setNewPartCompat(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-xs text-slate-900 outline-none font-medium cursor-pointer"
                    >
                      {USED_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Custo */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Custo (R$)</label>
                      <input
                        type="number"
                        placeholder="180.00"
                        value={newPartCusto}
                        onChange={(e) => setNewPartCusto(e.target.value)}
                        className="w-full bg-white border border-slate-350 focus:border-blue-600 rounded-xl py-2 px-3 text-xs text-slate-900 outline-none transition-all font-medium"
                      />
                    </div>

                    {/* Venda */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Venda (R$)</label>
                      <input
                        type="number"
                        placeholder="390.00"
                        value={newPartVenda}
                        onChange={(e) => setNewPartVenda(e.target.value)}
                        className="w-full bg-white border border-slate-350 focus:border-blue-600 rounded-xl py-2 px-3 text-xs text-slate-900 outline-none transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Estoque */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Qtd em Estoque</label>
                      <input
                        type="number"
                        placeholder="5"
                        value={newPartEstoque}
                        onChange={(e) => setNewPartEstoque(e.target.value)}
                        className="w-full bg-white border border-slate-350 focus:border-blue-600 rounded-xl py-2 px-3 text-xs text-slate-900 outline-none transition-all font-medium"
                      />
                    </div>

                    {/* Alerta Mínimo */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Estoque Mínimo</label>
                      <input
                        type="number"
                        placeholder="2"
                        value={newPartMinimo}
                        onChange={(e) => setNewPartMinimo(e.target.value)}
                        className="w-full bg-white border border-slate-350 focus:border-blue-600 rounded-xl py-2 px-3 text-xs text-slate-900 outline-none transition-all font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md cursor-pointer mt-2"
                  >
                    Salvar e Cadastrar Peça
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>
      )}

      {activeTab === 'checklist' && (
        <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
          {/* O Checklist principal em 2 colunas: Col 8 (Formulário) e Col 4 (Resultado da Grade / Ações) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* COLUNA ESQUERDA: Formulário da Inspeção (Col 8) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* BLOCO 1: Cabeçalho de Identificação */}
              <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6">
                <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
                  <User className="w-5 h-5 text-blue-600" />
                  1. Identificação do Aparelho e Vendedor
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Nome do Vendedor */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Nome do Vendedor
                    </label>
                    <input
                      type="text"
                      disabled
                      value={currentUser ? currentUser.name : ''}
                      className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-xl py-3 px-4 text-sm outline-none font-semibold cursor-not-allowed select-none"
                    />
                  </div>

                  {/* Nome do Cliente */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Nome do Cliente *
                    </label>
                    <input
                      type="text"
                      placeholder="Nome completo do cliente"
                      value={checklistClientName}
                      onChange={(e) => setChecklistClientName(e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 rounded-xl py-3 px-4 text-slate-900 text-sm outline-none transition-all placeholder:text-slate-400 font-medium"
                    />
                  </div>

                  {/* Aparelho Comercializado */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Aparelho Comercializado *
                    </label>
                    <div className="relative">
                      <select
                        value={checklistDeviceModel}
                        onChange={(e) => setChecklistDeviceModel(e.target.value)}
                        className="w-full appearance-none bg-white border border-slate-300 focus:border-blue-600 text-slate-900 rounded-xl py-3 pl-4 pr-10 text-sm outline-none transition-all cursor-pointer focus:ring-1 focus:ring-blue-600/20 font-medium"
                      >
                        {USED_MODELS.map(model => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  {/* Cor do Aparelho */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Cor do Aparelho *
                    </label>
                    <div className="relative">
                      <select
                        value={checklistDeviceColor}
                        onChange={(e) => setChecklistDeviceColor(e.target.value)}
                        className="w-full appearance-none bg-white border border-slate-300 focus:border-blue-600 text-slate-900 rounded-xl py-3 pl-4 pr-10 text-sm outline-none transition-all cursor-pointer focus:ring-1 focus:ring-blue-600/20 font-medium"
                      >
                        {getColorsForModel(checklistDeviceModel).map(color => (
                          <option key={color} value={color}>{color}</option>
                        ))}
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  {/* Armazenamento do Aparelho */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Armazenamento *
                    </label>
                    <div className="relative">
                      <select
                        value={checklistDeviceStorage}
                        onChange={(e) => setChecklistDeviceStorage(e.target.value)}
                        className="w-full appearance-none bg-white border border-slate-300 focus:border-blue-600 text-slate-900 rounded-xl py-3 pl-4 pr-10 text-sm outline-none transition-all cursor-pointer focus:ring-1 focus:ring-blue-600/20 font-medium"
                      >
                        {STORAGE_OPTIONS.map(storage => (
                          <option key={storage} value={storage}>{storage}</option>
                        ))}
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  {/* IMEI / Número de Série */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Número de Série / IMEI *
                    </label>
                    <input
                      type="text"
                      placeholder="IMEI de 15 dígitos ou Nº de Série"
                      value={checklistSerialImei}
                      onChange={(e) => setChecklistSerialImei(e.target.value)}
                      onBlur={() => checkIMEIBlacklist(checklistSerialImei, 'checklist')}
                      className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 rounded-xl py-3 px-4 text-slate-900 text-sm font-mono outline-none transition-all placeholder:text-slate-400 font-semibold"
                    />
                    {blacklistStatus === 'checking' && (
                      <p className="text-[10px] text-blue-600 mt-1 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Verificando base da Anatel/SIRC...</p>
                    )}
                    {blacklistStatus === 'clean' && (
                      <p className="text-[10px] text-emerald-700 mt-1 flex items-center gap-1">✓ Anatel/SIRC: Aparelho regular sem restrições.</p>
                    )}
                    {blacklistStatus === 'blocked' && (
                      <p className="text-[10px] text-rose-700 mt-1 flex items-center gap-1 font-bold">⚠️ Anatel/SIRC: Bloqueado ou impedido (furto/roubo)!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* BLOCO 2: Checklist Técnico */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  <ListTodo className="w-5 h-5 text-blue-600" />
                  <h2 className="text-md sm:text-lg font-bold tracking-tight text-slate-900">
                    2. Checklist Técnico do Usado
                  </h2>
                </div>

                {/* Accordion Item A: Estética */}
                <div className="glass-panel rounded-2xl overflow-hidden transition-all duration-300">
                  <button
                    type="button"
                    onClick={() => setActiveSection(activeSection === 'estetica' ? '' : 'estetica')}
                    className="w-full text-left p-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-655 flex items-center justify-center shrink-0">
                        <Palette className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">A. Avaliação Estética</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Tela, Traseira, Laterais e Lentes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {getEsteticaStatusBadge()}
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${activeSection === 'estetica' ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  
                  {activeSection === 'estetica' && (
                    <div className="p-6 border-t border-slate-250 bg-white space-y-5 animate-fade-in">
                      <div className="space-y-4 divide-y divide-slate-100">
                        
                        {/* Tela */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-3">
                          <div>
                            <span className="text-sm font-semibold text-slate-800 block">Tela / Display</span>
                            <span className="text-xs text-slate-500">Possui riscos profundos, trincados ou lascas?</span>
                          </div>
                          <div className="flex bg-slate-55 p-1 rounded-xl border border-slate-200 shrink-0 gap-1">
                            {['bom', 'detalhe', 'defeito'].map(opt => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => { setEsteticaTela(opt); vibrateFeedback(opt); }}
                                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                                  esteticaTela === opt
                                    ? opt === 'bom' ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                                      : opt === 'detalhe' ? 'bg-amber-500 text-slate-900 shadow-sm shadow-amber-500/15'
                                      : 'bg-rose-600 text-white shadow-sm shadow-rose-600/10'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                                }`}
                              >
                                {opt === 'bom' ? 'Bom' : opt === 'detalhe' ? 'Detalhe' : 'Defeito'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Vidro Traseiro */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 pt-4 gap-3">
                          <div>
                            <span className="text-sm font-semibold text-slate-800 block">Vidro Traseiro</span>
                            <span className="text-xs text-slate-500">O vidro traseiro está trincado, quebrado ou riscado?</span>
                          </div>
                          <div className="flex bg-slate-55 p-1 rounded-xl border border-slate-200 shrink-0 gap-1">
                            {['bom', 'detalhe', 'defeito'].map(opt => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => { setEsteticaTraseira(opt); vibrateFeedback(opt); }}
                                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                                  esteticaTraseira === opt
                                    ? opt === 'bom' ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                                      : opt === 'detalhe' ? 'bg-amber-500 text-slate-900 shadow-sm shadow-amber-500/15'
                                      : 'bg-rose-600 text-white shadow-sm shadow-rose-600/10'
                                    : 'text-slate-500 border border-transparent hover:text-slate-800 hover:bg-slate-100'
                                }`}
                              >
                                {opt === 'bom' ? 'Bom' : opt === 'detalhe' ? 'Detalhe' : 'Defeito'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Aro/Laterais */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 pt-4 gap-3">
                          <div>
                            <span className="text-sm font-semibold text-slate-800 block">Laterais / Aro</span>
                            <span className="text-xs text-slate-500">Apresenta marcas de queda, amassados ou descascados?</span>
                          </div>
                          <div className="flex bg-slate-55 p-1 rounded-xl border border-slate-200 shrink-0 gap-1">
                            {['bom', 'detalhe', 'defeito'].map(opt => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => { setEsteticaLaterais(opt); vibrateFeedback(opt); }}
                                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                                  esteticaLaterais === opt
                                    ? opt === 'bom' ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                                      : opt === 'detalhe' ? 'bg-amber-500 text-slate-900 shadow-sm shadow-amber-500/15'
                                      : 'bg-rose-600 text-white shadow-sm shadow-rose-600/10'
                                    : 'text-slate-555 border border-transparent hover:text-slate-800 hover:bg-slate-100'
                                }`}
                              >
                                {opt === 'bom' ? 'Bom' : opt === 'detalhe' ? 'Detalhe' : 'Defeito'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Lentes */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 pt-4 gap-3">
                          <div>
                            <span className="text-sm font-semibold text-slate-800 block">Lentes da Câmera</span>
                            <span className="text-xs text-slate-500">Estão riscadas, trincadas ou com poeira/sujeira interna?</span>
                          </div>
                          <div className="flex bg-slate-55 p-1 rounded-xl border border-slate-200 shrink-0 gap-1">
                            {['bom', 'detalhe', 'defeito'].map(opt => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => { setEsteticaLentes(opt); vibrateFeedback(opt); }}
                                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                                  esteticaLentes === opt
                                    ? opt === 'bom' ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                                      : opt === 'detalhe' ? 'bg-amber-500 text-slate-900 shadow-sm shadow-amber-500/15'
                                      : 'bg-rose-600 text-white shadow-sm shadow-rose-600/10'
                                    : 'text-slate-555 border border-transparent hover:text-slate-800 hover:bg-slate-100'
                                }`}
                              >
                                {opt === 'bom' ? 'Bom' : opt === 'detalhe' ? 'Detalhe' : 'Defeito'}
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>

                      {/* Botão de Avanço */}
                      <div className="flex justify-end pt-4 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => setActiveSection('funcional')}
                          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
                        >
                          Ir para Parte Funcional
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Accordion Item B: Funcional */}
                <div className="glass-panel rounded-2xl overflow-hidden transition-all duration-300">
                  <button
                    type="button"
                    onClick={() => setActiveSection(activeSection === 'funcional' ? '' : 'funcional')}
                    className="w-full text-left p-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-655 flex items-center justify-center shrink-0">
                        <Sliders className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">B. Avaliação Funcional</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Bateria, Componentes, Áudio e Câmeras</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {getFuncionalStatusBadge()}
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${activeSection === 'funcional' ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  
                  {activeSection === 'funcional' && (
                    <div className="p-6 border-t border-slate-250 bg-white space-y-5 animate-fade-in">
                      <div className="space-y-4 divide-y divide-slate-100">
                        
                        {/* Bateria */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-3">
                          <div>
                            <span className="text-sm font-semibold text-slate-800 block">Saúde da Bateria (%)</span>
                            <span className="text-xs text-slate-500">Insira a porcentagem indicada nas configurações</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs font-bold text-slate-500">🔋</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={funcionalBatteryHealth}
                              onChange={(e) => setFuncionalBatteryHealth(e.target.value)}
                              className="w-24 bg-white border border-slate-300 focus:border-blue-600 text-slate-900 rounded-lg py-1.5 px-3 text-xs outline-none font-bold text-center focus:ring-1 focus:ring-blue-600/20"
                            />
                            {parseFloat(funcionalBatteryHealth) < 80 && (
                              <span className="bg-rose-50 text-rose-700 border border-rose-200/85 text-[10px] font-bold px-2 py-1 rounded uppercase shrink-0 animate-pulse">
                                Requer Troca
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Peça Desconhecida */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 pt-4 gap-3">
                          <div>
                            <span className="text-sm font-semibold text-slate-800 block">Mensagem de Peça Desconhecida</span>
                            <span className="text-xs text-slate-500">Aparece aviso de tela, bateria ou câmera trocada no Ajustes?</span>
                          </div>
                          <div className="flex bg-slate-55 p-1 rounded-xl border border-slate-200 shrink-0 gap-1">
                            {['não', 'sim'].map(opt => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => { setFuncionalPecaDesconhecida(opt); vibrateFeedback(opt); }}
                                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                                  funcionalPecaDesconhecida === opt
                                    ? opt === 'sim'
                                      ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                                      : 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                                    : 'text-slate-550 border border-transparent hover:text-slate-800 hover:bg-slate-100'
                                }`}
                              >
                                {opt === 'sim' ? 'Sim' : 'Não'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Biometria */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 pt-4 gap-3">
                          <div>
                            <span className="text-sm font-semibold text-slate-800 block">Biometria (Face ID / Touch ID)</span>
                            <span className="text-xs text-slate-500">O desbloqueio biométrico funciona perfeitamente?</span>
                          </div>
                          <div className="flex bg-slate-55 p-1 rounded-xl border border-slate-200 shrink-0 gap-1">
                            {['ok', 'defeito'].map(opt => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => { setFuncionalBiometria(opt); vibrateFeedback(opt); }}
                                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                                  funcionalBiometria === opt
                                    ? opt === 'ok'
                                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                                      : 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                                    : 'text-slate-550 border border-transparent hover:text-slate-800 hover:bg-slate-100'
                                }`}
                              >
                                {opt === 'ok' ? 'Funciona' : 'Defeito'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Câmeras */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 pt-4 gap-3">
                          <div>
                            <span className="text-sm font-semibold text-slate-800 block">Câmeras e Foco (Frente/Verso)</span>
                            <span className="text-xs text-slate-500">Foco e alternância de lentes (0.5x, 1x, 3x) funcionando 100%?</span>
                          </div>
                          <div className="flex bg-slate-55 p-1 rounded-xl border border-slate-200 shrink-0 gap-1">
                            {['ok', 'defeito'].map(opt => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => { setFuncionalCameras(opt); vibrateFeedback(opt); }}
                                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                                  funcionalCameras === opt
                                    ? opt === 'ok'
                                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                                      : 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                                    : 'text-slate-550 border border-transparent hover:text-slate-800 hover:bg-slate-100'
                                }`}
                              >
                                {opt === 'ok' ? 'Funciona' : 'Defeito'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Áudio */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 pt-4 gap-3">
                          <div>
                            <span className="text-sm font-semibold text-slate-800 block">Áudio e Microfone</span>
                            <span className="text-xs text-slate-500">Ligação e alto-falantes estão limpos, nítidos e sem ruído?</span>
                          </div>
                          <div className="flex bg-slate-55 p-1 rounded-xl border border-slate-200 shrink-0 gap-1">
                            {['ok', 'defeito'].map(opt => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => { setFuncionalAudio(opt); vibrateFeedback(opt); }}
                                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                                  funcionalAudio === opt
                                    ? opt === 'ok'
                                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                                      : 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                                    : 'text-slate-550 border border-transparent hover:text-slate-800 hover:bg-slate-100'
                                }`}
                              >
                                {opt === 'ok' ? 'Funciona' : 'Defeito'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Conectividade */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 pt-4 gap-3">
                          <div>
                            <span className="text-sm font-semibold text-slate-800 block">Conectividade Celular e Wi-Fi</span>
                            <span className="text-xs text-slate-500">Wi-Fi, Bluetooth e leitura do chip (rede celular) funcionando?</span>
                          </div>
                          <div className="flex bg-slate-55 p-1 rounded-xl border border-slate-200 shrink-0 gap-1">
                            {['ok', 'defeito'].map(opt => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => { setFuncionalConectividade(opt); vibrateFeedback(opt); }}
                                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                                  funcionalConectividade === opt
                                    ? opt === 'ok'
                                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                                      : 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                                    : 'text-slate-550 border border-transparent hover:text-slate-800 hover:bg-slate-100'
                                }`}
                              >
                                {opt === 'ok' ? 'Funciona' : 'Defeito'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Botões */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 pt-4 gap-3">
                          <div>
                            <span className="text-sm font-semibold text-slate-800 block">Botões Físicos</span>
                            <span className="text-xs text-slate-500">Silencioso, volume e power respondem com clique firme?</span>
                          </div>
                          <div className="flex bg-slate-55 p-1 rounded-xl border border-slate-200 shrink-0 gap-1">
                            {['ok', 'defeito'].map(opt => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => { setFuncionalBotoes(opt); vibrateFeedback(opt); }}
                                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                                  funcionalBotoes === opt
                                    ? opt === 'ok'
                                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                                      : 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                                    : 'text-slate-550 border border-transparent hover:text-slate-800 hover:bg-slate-100'
                                }`}
                              >
                                {opt === 'ok' ? 'Funciona' : 'Defeito'}
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>

                      {/* Botões de Navegação */}
                      <div className="flex justify-between pt-4 border-t border-slate-200 gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveSection('estetica')}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer border border-slate-200"
                        >
                          Voltar para Estética
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSection('seguranca')}
                          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
                        >
                          Ir para Segurança
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Accordion Item C: Segurança */}
                <div className="glass-panel rounded-2xl overflow-hidden transition-all duration-300">
                  <button
                    type="button"
                    onClick={() => setActiveSection(activeSection === 'seguranca' ? '' : 'seguranca')}
                    className="w-full text-left p-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">C. Segurança e Procedência</h3>
                        <p className="text-xs text-slate-500 mt-0.5">iCloud, Mostruário e Autenticidade</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {getSegurancaStatusBadge()}
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${activeSection === 'seguranca' ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  
                  {activeSection === 'seguranca' && (
                    <div className="p-6 border-t border-slate-250 bg-white space-y-5 animate-fade-in">
                      <div className="space-y-4 divide-y divide-slate-100">
                        
                        {/* iCloud */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-3">
                          <div>
                            <span className="text-sm font-semibold text-slate-800 block">Buscar iPhone (iCloud)</span>
                            <span className="text-xs text-slate-500">A conta do cliente foi removida e desativada?</span>
                          </div>
                          <div className="flex bg-slate-55 p-1 rounded-xl border border-slate-200 shrink-0 gap-1">
                            {['sim', 'não'].map(opt => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => { setSegurancaIcloud(opt); vibrateFeedback(opt); }}
                                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                                  segurancaIcloud === opt
                                    ? opt === 'sim'
                                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                                      : 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                                    : 'text-slate-550 border border-transparent hover:text-slate-800 hover:bg-slate-100'
                                }`}
                              >
                                {opt === 'sim' ? 'Desativado' : 'Não Desativado'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Aparelho Vitrine/Demo */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 pt-4 gap-3">
                          <div>
                            <span className="text-sm font-semibold text-slate-800 block">Aparelho Vitrine / Demo</span>
                            <span className="text-xs text-slate-500">É um aparelho de mostruário (loja externa)?</span>
                          </div>
                          <div className="flex bg-slate-55 p-1 rounded-xl border border-slate-200 shrink-0 gap-1">
                            {['não', 'sim'].map(opt => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => { setSegurancaDemo(opt); vibrateFeedback(opt); }}
                                className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                                  segurancaDemo === opt
                                    ? opt === 'sim'
                                      ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                                      : 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                                    : 'text-slate-550 border border-transparent hover:text-slate-800 hover:bg-slate-100'
                                }`}
                              >
                                {opt === 'sim' ? 'Sim' : 'Não'}
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>

                      {/* Botões de Navegação */}
                      <div className="flex justify-start pt-4 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => setActiveSection('funcional')}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer border border-slate-200"
                        >
                          Voltar para Parte Funcional
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* BLOCO 3: Área de Evidências (Anexo de Fotos) */}
              <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6">
                <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
                  <Archive className="w-5 h-5 text-blue-600" />
                  3. Área de Evidências Fotográficas
                </h2>
                
                <p className="text-xs text-slate-500 -mt-2">
                  Tire ou anexe fotos nos slots específicos abaixo. As fotos são otimizadas automaticamente no navegador para preservar espaço de armazenamento.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  
                  {/* Slot 1: Tela Acesa */}
                  <div className="relative group/photo border border border-dashed border-slate-300 rounded-xl overflow-hidden bg-slate-50 min-h-[160px] flex flex-col items-center justify-center p-3 text-center">
                    {photoTela ? (
                      <>
                        <img src={photoTela} className="absolute inset-0 w-full h-full object-cover" alt="Tela Acesa" />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/photo:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPhotoTela(null)}
                            className="bg-red-600 hover:bg-red-500 text-white rounded-lg p-2 transition-colors cursor-pointer animate-fade-in"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full gap-2 p-2 select-none">
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              const compressed = await compressChecklistImage(e.target.files[0])
                              setPhotoTela(compressed)
                            }
                          }}
                          className="hidden"
                        />
                        <span className="text-2xl">📱</span>
                        <span className="text-xs font-semibold text-slate-700">Tela Acesa</span>
                        <span className="text-[9px] text-slate-500 leading-tight">Configurações &gt; Sobre (IMEI)</span>
                      </label>
                    )}
                  </div>

                  {/* Slot 2: Traseira */}
                  <div className="relative group/photo border border border-dashed border-slate-300 rounded-xl overflow-hidden bg-slate-50 min-h-[160px] flex flex-col items-center justify-center p-3 text-center">
                    {photoTraseira ? (
                      <>
                        <img src={photoTraseira} className="absolute inset-0 w-full h-full object-cover" alt="Traseira" />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/photo:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPhotoTraseira(null)}
                            className="bg-red-600 hover:bg-red-500 text-white rounded-lg p-2 transition-colors cursor-pointer animate-fade-in"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full gap-2 p-2 select-none">
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              const compressed = await compressChecklistImage(e.target.files[0])
                              setPhotoTraseira(compressed)
                            }
                          }}
                          className="hidden"
                        />
                        <span className="text-2xl">📸</span>
                        <span className="text-xs font-semibold text-slate-700">Traseira</span>
                        <span className="text-[9px] text-slate-500 leading-tight">Vidro traseiro e lentes</span>
                      </label>
                    )}
                  </div>

                  {/* Slot 3: Laterais */}
                  <div className="relative group/photo border border border-dashed border-slate-300 rounded-xl overflow-hidden bg-slate-50 min-h-[160px] flex flex-col items-center justify-center p-3 text-center">
                    {photoLaterais ? (
                      <>
                        <img src={photoLaterais} className="absolute inset-0 w-full h-full object-cover" alt="Laterais" />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/photo:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPhotoLaterais(null)}
                            className="bg-red-600 hover:bg-red-500 text-white rounded-lg p-2 transition-colors cursor-pointer animate-fade-in"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full gap-2 p-2 select-none">
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              const compressed = await compressChecklistImage(e.target.files[0])
                              setPhotoLaterais(compressed)
                            }
                          }}
                          className="hidden"
                        />
                        <span className="text-2xl">📐</span>
                        <span className="text-xs font-semibold text-slate-700">Laterais / Aro</span>
                        <span className="text-[9px] text-slate-500 leading-tight">Marcas de capinha ou aro</span>
                      </label>
                    )}
                  </div>

                  {/* Slot 4: Conector */}
                  <div className="relative group/photo border border border-dashed border-slate-300 rounded-xl overflow-hidden bg-slate-50 min-h-[160px] flex flex-col items-center justify-center p-3 text-center">
                    {photoConector ? (
                      <>
                        <img src={photoConector} className="absolute inset-0 w-full h-full object-cover" alt="Conector" />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/photo:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPhotoConector(null)}
                            className="bg-red-600 hover:bg-red-500 text-white rounded-lg p-2 transition-colors cursor-pointer animate-fade-in"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full gap-2 p-2 select-none">
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              const compressed = await compressChecklistImage(e.target.files[0])
                              setPhotoConector(compressed)
                            }
                          }}
                          className="hidden"
                        />
                        <span className="text-2xl">🔌</span>
                        <span className="text-xs font-semibold text-slate-700">Conector / Fones</span>
                        <span className="text-[9px] text-slate-500 leading-tight">Estado de oxidação/sujeira</span>
                      </label>
                    )}
                  </div>

                </div>
              </div>

            </div>

            {/* COLUNA DIREITA: Resumo da Grade, Valores de Avaliação e Ações (Col 4) */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="glass-panel rounded-2xl p-6 space-y-6 sticky top-6">
                <h2 className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  4. Resumo e Fechamento
                </h2>

                {/* Grade Classificada Badge */}
                <div className="text-center p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <span className="text-xs text-slate-500 block font-semibold uppercase tracking-wider">Grade Obtida</span>
                  <div className="flex justify-center items-center">
                    <span className={`text-6xl font-black px-6 py-2 rounded-2xl border transition-colors duration-200 ${
                      checklistGradeData.grade === 'A'
                        ? 'bg-emerald-55 bg-emerald-50 text-emerald-700 border-emerald-200'
                        : checklistGradeData.grade === 'B'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {checklistGradeData.grade}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block leading-tight">
                    {checklistGradeData.grade === 'A' && 'Aparelho Impecável (Sem detalhes/defeitos, bateria saudável)'}
                    {checklistGradeData.grade === 'B' && 'Aparelho com sinais leves de uso (detalhes estéticos, bateria 80-84%)'}
                    {checklistGradeData.grade === 'C' && 'Aparelho com defeitos técnicos/estéticos marcantes ou bateria < 80%'}
                  </span>
                </div>

                {/* Valores de Avaliação */}
                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  
                  {/* Preço de Vitrine do Modelo */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Preço Ref. Vitrine *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">R$</span>
                      <input
                        type="number"
                        placeholder="Ex: 3000"
                        value={referenceValue}
                        onChange={(e) => setReferenceValue(e.target.value)}
                        className="w-full bg-white border border-slate-300 focus:border-blue-600 text-slate-900 rounded-lg py-1.5 pl-8 pr-3 text-xs outline-none font-bold focus:ring-1 focus:ring-blue-600/20"
                      />
                    </div>
                  </div>

                  {/* Valor de Crédito Sugerido */}
                  <div className="flex justify-between items-center text-xs py-1 border-t border-slate-200 pt-2">
                    <span className="text-slate-500">Crédito Sugerido (Grade {checklistGradeData.grade}):</span>
                    <span className="font-bold text-slate-900">{formatBRL(checklistGradeData.suggestedValue)}</span>
                  </div>

                  {/* Crédito Ajustado (Ajuste Manual) */}
                  <div className="space-y-1.5 border-t border-slate-200 pt-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Valor de Crédito Final</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">R$</span>
                      <input
                        type="number"
                        placeholder={`Sugerido: ${formatBRL(checklistGradeData.suggestedValue)}`}
                        value={customCreditValue}
                        onChange={(e) => setCustomCreditValue(e.target.value)}
                        className="w-full bg-white border border-slate-300 focus:border-blue-600 text-slate-900 rounded-lg py-1.5 pl-8 pr-3 text-xs outline-none font-bold focus:ring-1 focus:ring-blue-600/20"
                      />
                    </div>
                  </div>

                </div>

                {/* Avisos Críticos baseados nos defeitos */}
                {segurancaIcloud === 'não' && (
                  <div className="bg-rose-50 border border-rose-200/80 text-rose-800 text-[11px] p-3.5 rounded-xl flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span><strong>Bloqueio de iCloud:</strong> O recurso Buscar iPhone deve ser desativado antes de aceitar o aparelho.</span>
                  </div>
                )}

                {/* Canvas de Assinatura Digital do Cliente */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Assinatura Digital do Cliente</label>
                    {hasSigned && (
                      <button 
                        type="button" 
                        onClick={clearSignature}
                        className="text-[10px] text-rose-700 hover:text-red-500 font-bold transition-colors cursor-pointer"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 relative h-32">
                    <canvas
                      ref={signatureCanvasRef}
                      width={380}
                      height={128}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-full cursor-crosshair touch-none bg-white"
                    />
                    {!hasSigned && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none text-[11px] text-slate-400">
                        Assine aqui usando o dedo ou mouse
                      </div>
                    )}
                  </div>
                </div>

                {/* Termo de Confirmação */}
                <label className="flex items-start gap-3 cursor-pointer select-none py-1 group">
                  <input
                    type="checkbox"
                    checked={checklistConfirmed}
                    onChange={(e) => setChecklistConfirmed(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-600/20 bg-white w-4 h-4 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-500 group-hover:text-slate-500 transition-colors leading-tight">
                    Confirmo que testei todos os itens acima e as fotos condizem com o estado real do aparelho.
                  </span>
                </label>

                {/* Botão Finalizar */}
                <button
                  type="button"
                  disabled={isSavingChecklist}
                  onClick={handleSaveChecklist}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSavingChecklist ? 'Registrando...' : 'Finalizar Avaliação e Gerar Crédito'}
                  <ArrowRight className="w-4 h-4" />
                </button>

              </div>

            </div>

          </div>

          {/* HISTÓRICO DE CHECKLISTS E INSPEÇÕES */}
          {currentUser && currentUser.role !== 'seller' && (
            <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  Histórico de Laudos e Inspeções
                </h2>
                <p className="text-xs text-slate-500">Inspeções técnicas e laudos de qualidade arquivados</p>
              </div>
              
              {/* Busca de Checklists */}
              <div className="relative w-full sm:w-80">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Buscar por vendedor, cliente, modelo, grade..."
                  value={checklistSearchQuery}
                  onChange={(e) => setChecklistSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-350 focus:border-blue-600 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-900 outline-none transition-all focus:ring-1 focus:ring-blue-600/20 font-medium placeholder:text-slate-400"
                />
              </div>
            </div>

            {filteredChecklists.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-300 rounded-xl space-y-2">
                <p className="text-sm text-slate-500">Nenhum laudo encontrado.</p>
                <p className="text-xs text-slate-400">Os laudos registrados aparecerão aqui.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1100px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Data / Cliente / Vendedor</th>
                      <th className="py-3 px-4">Aparelho Inspeção</th>
                      <th className="py-3 px-4">Saúde Bateria / Detalhes</th>
                      <th className="py-3 px-4 text-center">Grade</th>
                      <th className="py-3 px-4 text-right">Preço Vitrine</th>
                      <th className="py-3 px-4 text-right">Crédito Final</th>
                      <th className="py-3 px-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredChecklists.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-55 transition-colors duration-155 group">
                        
                        {/* Data / Cliente / Vendedor */}
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 block">{record.client_name}</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">Vendedor: {record.seller_name}</span>
                          <span className="text-[9px] text-slate-400">
                            {new Date(record.created_at).toLocaleDateString('pt-BR')} às {new Date(record.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>

                        {/* Aparelho */}
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800 block">
                            {record.device_model} {record.device_storage || ''} {record.device_color ? `(${record.device_color})` : ''}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono block">IMEI: {record.serial_imei}</span>
                        </td>

                        {/* Detalhes Técnicos */}
                        <td className="py-3 px-4">
                          <div className="flex gap-2 items-center text-[9px] flex-wrap">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200/80">
                              🔋 Bateria: {record.battery_health}%
                            </span>
                            {record.checklist_funcional?.peca_desconhecida === 'sim' && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200/80">
                                ⚠️ PEÇA TROCADA
                              </span>
                            )}
                            {record.checklist_seguranca?.icloud === 'não' && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200/80">
                                🔒 iCloud Ativo
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Grade */}
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded font-black text-xs border ${
                            record.grade === 'A'
                              ? 'bg-emerald-55 bg-emerald-50 text-emerald-700 border-emerald-200'
                              : record.grade === 'B'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            Grade {record.grade}
                          </span>
                        </td>

                        {/* Preço Vitrine */}
                        <td className="py-3 px-4 text-right text-slate-600 font-semibold">
                          {formatBRL(record.reference_value)}
                        </td>

                        {/* Crédito Final */}
                        <td className="py-3 px-4 text-right text-emerald-600 font-bold">
                          {formatBRL(record.evaluation_value)}
                        </td>

                        {/* Ações */}
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedChecklistForView(record)}
                              title="Visualizar Detalhes do Laudo"
                              className="text-slate-400 hover:text-slate-800 transition-colors duration-150 p-1.5 rounded hover:bg-slate-100 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyChecklistSummary(record)}
                              title="Copiar Laudo completo"
                              className="text-slate-400 hover:text-slate-800 transition-colors duration-150 p-1.5 rounded hover:bg-slate-100 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => printChecklistReceipt(record)}
                              title="Imprimir Laudo Técnico (PDF)"
                              className="text-slate-400 hover:text-slate-800 transition-colors duration-150 p-1.5 rounded hover:bg-slate-100 cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteChecklist(record.id)}
                              title="Excluir Laudo"
                              className="text-slate-500 hover:text-rose-700 transition-colors duration-155 p-1.5 rounded hover:bg-slate-100 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md transition-all duration-300">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 w-full max-w-sm space-y-6 shadow-2xl relative animate-fade-in">
            
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center p-3.5 mx-auto shadow-md shrink-0">
                <img src={logo} className="h-full w-full object-contain select-none" alt="Fitch Logo" />
              </div>
              <div className="space-y-1">
                <h3 className="text-md font-bold text-slate-900">Controle de Acesso</h3>
                <p className="text-xs text-slate-500">
                  {loginTarget === 'simulator' 
                    ? 'Digite a senha do Gerente ou Administrador' 
                    : 'Digite sua senha pessoal de acesso'}
                </p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                placeholder="Senha de Acesso"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-white border border-slate-350 focus:border-blue-600 rounded-xl py-3 px-4 text-center text-slate-900 font-mono text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-1 focus:ring-blue-600/20"
                autoFocus
              />

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer border border-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Adicionar Peça na OS */}
      {showAddPartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 w-full max-w-md space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddPartModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-md font-bold text-slate-900">Vincular Peça à OS</h3>
              <p className="text-xs text-slate-500">Escolha a peça compatível no estoque e registre a numeração de série.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Selecionar Insumo / Peça</label>
                <select
                  value={selectedPartForOS || ''}
                  onChange={(e) => setSelectedPartForOS(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-xs text-slate-900 outline-none font-medium cursor-pointer"
                >
                  <option value="">-- Escolha a Peça em Estoque --</option>
                  {pecasList.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.sku} - {p.nome} (Qtd: {p.estoque_atual} un)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Código Serial da Nova Peça (Garantia) *</label>
                <input
                  type="text"
                  placeholder="Ex: BT-908127391-J"
                  value={serialInstalledForOS}
                  onChange={(e) => setSerialInstalledForOS(e.target.value)}
                  className="w-full bg-white border border-slate-350 focus:border-blue-600 rounded-xl py-2.5 px-3 text-xs text-slate-900 outline-none transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPartModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer border border-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSavePartToOS}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Vincular Insumo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Checklist de Saída da OS */}
      {selectedOsForChecklistSaida && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 w-full max-w-lg space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOsForChecklistSaida(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-md font-bold text-slate-900">Checklist Técnico de Saída (Entrega)</h3>
              <p className="text-xs text-slate-500">Valide o funcionamento de todos os itens antes de liberar o dispositivo.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'faceId', label: 'Face ID / Touch ID' },
                  { key: 'tela', label: 'Tela e Touch' },
                  { key: 'camera', label: 'Câmeras' },
                  { key: 'audio', label: 'Áudio (Microfone/Alto-falante)' },
                  { key: 'conexao', label: 'Wi-Fi / Rede' },
                  { key: 'bateria', label: 'Bateria' },
                  { key: 'carcaca', label: 'Carcaça/Botoes' }
                ].map((item) => (
                  <div key={item.key} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between gap-1">
                    <span className="text-[10px] font-bold text-slate-700 block">{item.label}</span>
                    <div className="flex gap-1">
                      {['Ok', 'Def', 'NT'].map(v => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setOsChecklistSaidaEdit(prev => ({ ...prev, [item.key]: v }))}
                          className={`flex-1 text-[9px] font-extrabold py-1 rounded cursor-pointer transition-all ${
                            osChecklistSaidaEdit[item.key] === v
                              ? (v === 'Ok' ? 'bg-emerald-500 text-white' : v === 'Def' ? 'bg-rose-500 text-white' : 'bg-slate-500 text-white')
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedOsForChecklistSaida(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer border border-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveChecklistSaida}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Confirmar e Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Laudo (Exclusivo Gerente / Admin) */}
      {selectedChecklistForView && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl relative my-8">
            
            {/* Fechar botão */}
            <button
              onClick={() => setSelectedChecklistForView(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {selectedChecklistForView.device_model} {selectedChecklistForView.device_storage || ''}
                  </h3>
                  {selectedChecklistForView.device_color && (
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium border border-slate-200">
                      {selectedChecklistForView.device_color}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-mono">IMEI: {selectedChecklistForView.serial_imei}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full font-black text-sm border ${
                  selectedChecklistForView.grade === 'A'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : selectedChecklistForView.grade === 'B'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  Grade {selectedChecklistForView.grade}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {new Date(selectedChecklistForView.created_at).toLocaleDateString('pt-BR')} às {new Date(selectedChecklistForView.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Dados de Identificação */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 border border-slate-200/60 p-4 rounded-2xl">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Cliente</span>
                <span className="text-sm font-semibold text-slate-800">{selectedChecklistForView.client_name}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Vendedor</span>
                <span className="text-sm font-semibold text-slate-800">{selectedChecklistForView.seller_name}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Preço de Vitrine</span>
                <span className="text-sm font-bold text-slate-700">{formatBRL(selectedChecklistForView.reference_value)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Crédito Final</span>
                <span className="text-sm font-extrabold text-emerald-600">{formatBRL(selectedChecklistForView.evaluation_value)}</span>
              </div>
            </div>

            {/* Blocos de Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Estética */}
              <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-slate-900 block border-b border-slate-200 pb-1.5 uppercase tracking-wider">
                  🎨 Avaliação Estética
                </span>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Tela:</span>
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] border ${
                      selectedChecklistForView.checklist_estetica?.tela === 'bom'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : selectedChecklistForView.checklist_estetica?.tela === 'detalhe'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {selectedChecklistForView.checklist_estetica?.tela}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Traseira:</span>
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] border ${
                      selectedChecklistForView.checklist_estetica?.traseira === 'bom'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : selectedChecklistForView.checklist_estetica?.traseira === 'detalhe'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-55 bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {selectedChecklistForView.checklist_estetica?.traseira}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Laterais:</span>
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] border ${
                      selectedChecklistForView.checklist_estetica?.laterais === 'bom'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : selectedChecklistForView.checklist_estetica?.laterais === 'detalhe'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {selectedChecklistForView.checklist_estetica?.laterais}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Lentes:</span>
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] border ${
                      selectedChecklistForView.checklist_estetica?.lentes === 'bom'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : selectedChecklistForView.checklist_estetica?.lentes === 'detalhe'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {selectedChecklistForView.checklist_estetica?.lentes}
                    </span>
                  </div>
                </div>
              </div>

              {/* Funcional */}
              <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-slate-900 block border-b border-slate-200 pb-1.5 uppercase tracking-wider">
                  ⚙️ Avaliação Funcional
                </span>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Saúde da Bateria:</span>
                    <span className="font-bold text-slate-800">{selectedChecklistForView.battery_health}%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Peça Desconhecida:</span>
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] border ${
                      selectedChecklistForView.checklist_funcional?.peca_desconhecida === 'não'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {selectedChecklistForView.checklist_funcional?.peca_desconhecida === 'sim' ? 'Sim (Trocada)' : 'Não'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Biometria:</span>
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] border ${
                      selectedChecklistForView.checklist_funcional?.biometria === 'ok'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {selectedChecklistForView.checklist_funcional?.biometria === 'ok' ? 'Ok' : 'Defeito'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Câmeras:</span>
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] border ${
                      selectedChecklistForView.checklist_funcional?.cameras === 'ok'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {selectedChecklistForView.checklist_funcional?.cameras === 'ok' ? 'Ok' : 'Defeito'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Áudio:</span>
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] border ${
                      selectedChecklistForView.checklist_funcional?.audio === 'ok'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {selectedChecklistForView.checklist_funcional?.audio === 'ok' ? 'Ok' : 'Defeito'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Botões / Conexão:</span>
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] border ${
                      selectedChecklistForView.checklist_funcional?.botoes === 'ok'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {selectedChecklistForView.checklist_funcional?.botoes === 'ok' ? 'Ok' : 'Defeito'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Segurança */}
              <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-slate-900 block border-b border-slate-200 pb-1.5 uppercase tracking-wider">
                  🔒 Segurança e Procedência
                </span>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">iCloud Desativado:</span>
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] border ${
                      selectedChecklistForView.checklist_seguranca?.icloud === 'sim'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {selectedChecklistForView.checklist_seguranca?.icloud === 'sim' ? 'Sim (Livre)' : 'Não (Bloqueado)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Aparelho Demo / Vitrine:</span>
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] border ${
                      selectedChecklistForView.checklist_seguranca?.demo === 'não'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {selectedChecklistForView.checklist_seguranca?.demo === 'não' ? 'Não (Original)' : 'Sim'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Evidências Fotográficas */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-900 block uppercase tracking-wider">
                📸 Evidências Fotográficas (Clique para ampliar)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {['tela', 'traseira', 'laterais', 'conector'].map((side) => {
                  const photoData = selectedChecklistForView.photos?.[side]
                  const labels = { tela: 'Tela / Sobre', traseira: 'Traseira', laterais: 'Laterais', conector: 'Conector' }
                  return (
                    <div key={side} className="space-y-1.5 text-center">
                      <span className="text-[10px] text-slate-500 font-semibold block">{labels[side]}</span>
                      {photoData ? (
                        <div
                          onClick={() => setSelectedPhotoZoom(photoData)}
                          className="bg-slate-100 border border-slate-200 rounded-xl aspect-[3/4] overflow-hidden cursor-pointer hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center justify-center relative group"
                        >
                          <img src={photoData} className="w-full h-full object-cover" alt={labels[side]} />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-[10px] text-white font-black uppercase tracking-wider">Ampliar</span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-100/50 border border-dashed border-slate-350 rounded-xl aspect-[3/4] flex flex-col items-center justify-center text-slate-400">
                          <X className="w-5 h-5 text-slate-400" />
                          <span className="text-[9px] mt-1 font-medium">Sem foto</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Assinatura */}
            {selectedChecklistForView.signature && (
              <div className="space-y-2 border-t border-slate-200 pt-4">
                <span className="text-xs font-bold text-slate-900 block uppercase tracking-wider">
                  🖋️ Assinatura do Cliente
                </span>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-md flex items-center justify-center">
                  <img src={selectedChecklistForView.signature} className="max-h-24 object-contain" alt="Assinatura Digital" />
                </div>
              </div>
            )}

            {/* Rodapé Ações */}
            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => {
                  printChecklistReceipt(selectedChecklistForView)
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold text-xs py-3 px-6 rounded-xl transition-all cursor-pointer flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimir Laudo PDF
              </button>
              <button
                type="button"
                onClick={() => setSelectedChecklistForView(null)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal de Zoom de Imagem */}
      {selectedPhotoZoom && (
        <div 
          onClick={() => setSelectedPhotoZoom(null)} 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 cursor-zoom-out"
        >
          <div className="relative max-w-full max-h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedPhotoZoom(null)}
              className="absolute right-4 top-4 bg-slate-900/85 hover:bg-slate-900 border border-slate-750 text-white p-2.5 rounded-full transition-all cursor-pointer shadow-lg z-50"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={selectedPhotoZoom} 
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-slate-800" 
              alt="Foto ampliada" 
            />
          </div>
        </div>
      )}

    </div>
  )
}

export default App
