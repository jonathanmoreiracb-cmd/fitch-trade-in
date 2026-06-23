import React, { useState, useEffect, useMemo } from 'react'
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
  Palette
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
  "Verde Alpino",
  "Roxo Profundo",
  "Laranja",
  "Branco",
  "Azul",
  "Verde",
  "Rosa",
  "Amarelo",
  "Vermelho (Product RED)"
];

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

  // Restaurar rascunho do checklist ao montar
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('fitch_checklist_draft');
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (draft.checklistClientName) setChecklistClientName(draft.checklistClientName);
        if (draft.checklistDeviceModel) setChecklistDeviceModel(draft.checklistDeviceModel);
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

  // Carregar Histórico
  const loadEvaluations = async () => {
    try {
      if (supabaseInitError) {
        throw new Error(supabaseInitError)
      }
      if (isSupabaseConfigured) {
        setDbStatus({ connected: false, mode: 'checking', errorMsg: '' })
        const { data, error } = await supabase
          .from('evaluations')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setEvaluations(data || [])
        setDbStatus({ connected: true, mode: 'Supabase', errorMsg: '' })
      } else {
        const data = await localDb.getEvaluations()
        setEvaluations(data)
        setDbStatus({ connected: false, mode: 'Local (Offline)', errorMsg: '' })
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
      serial_imei: checklistSerialImei.trim(),
      checklist_estetica: esteticaObj,
      checklist_funcional: funcionalObj,
      checklist_seguranca: segurancaObj,
      battery_health: parseInt(funcionalBatteryHealth) || 85,
      photos: photosObj,
      grade: checklistGradeData.grade,
      reference_value: parseFloat(referenceValue) || 0,
      evaluation_value: parseFloat(customCreditValue) || checklistGradeData.suggestedValue,
      confirmed: checklistConfirmed
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

      loadChecklists()
      
      setChecklistClientName('')
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
📱 *Aparelho:* ${record.device_model}
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
      const key = `${item.used_model} ${item.used_storage}`
      const evalVal = parseFloat(item.max_evaluation || item.maxEvaluation || 0)
      const vitrineVal = parseFloat(item.vitrine_price || item.vitrinePrice || 0)
      
      if (!stats[key]) {
        stats[key] = {
          model: item.used_model || item.usedModel,
          storage: item.used_storage || item.usedStorage,
          count: 0,
          totalEval: 0,
          totalVitrine: 0
        }
      }
      stats[key].count += 1
      stats[key].totalEval += evalVal
      stats[key].totalVitrine += vitrineVal
    })
    
    return Object.values(stats).map(item => ({
      ...item,
      avgCost: item.totalEval / item.count,
      avgVitrine: item.totalVitrine / item.count
    })).sort((a, b) => b.count - a.count)
  }, [evaluations])

  const currentModelAverage = useMemo(() => {
    const key = `${usedModel} ${usedStorage}`
    const match = inventoryStats.find(item => `${item.model} ${item.storage}` === key)
    return match ? { avgCost: match.avgCost, avgVitrine: match.avgVitrine, count: match.count } : null
  }, [usedModel, usedStorage, inventoryStats])

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
      triggerNotification('Preencha o Nome do Cliente para continuar.', 'error')
      return
    }

    // IMEIs são opcionais (se vazios, salva como 'Não Informado')
    const finalImeiNew = imeiNew.trim() || 'Não Informado'
    const finalImeiUsed = imeiUsed.trim() || 'Não Informado'

    if (imeiNew.trim() && imeiNew.trim() !== 'Não Informado' && !isValidIMEI(imeiNew)) {
      triggerNotification('O IMEI do Novo é inválido! Por favor verifique.', 'error')
      return
    }
    if (imeiUsed.trim() && imeiUsed.trim() !== 'Não Informado' && !isValidIMEI(imeiUsed)) {
      triggerNotification('O IMEI do Usado é inválido! Por favor verifique.', 'error')
      return
    }

    if (!newCost || calculationData.totalValue <= 0) {
      triggerNotification('Defina o Custo do Novo e os Valores de Pagamento.', 'error')
      return
    }

    if (!calculationData.isValid) {
      triggerNotification('Verifique as inconsistências de taxas antes de salvar.', 'error')
      return
    }

    setIsSaving(true)
    const generatedId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9)
    const generatedCreatedAt = new Date().toISOString()

    const newRecord = {
      id: generatedId,
      created_at: generatedCreatedAt,
      client_name: clientName,
      imei_new: finalImeiNew,
      imei_used: finalImeiUsed,
      new_model: newModel,
      new_storage: newStorage,
      new_color: newColor,
      new_cost: parseFloat(newCost),
      profit_margin: parseFloat(profitMargin) || 800,
      operational_cost: parseFloat(operationalCost) || 120,
      used_model: usedModel,
      used_storage: usedStorage,
      used_color: usedColor,
      used_category: usedCategory,
      additional_value: calculationData.totalValue,
      gateway: paymentSplits.map(s => `${s.gateway} (${s.type === 'debit' ? 'Débito' : `${s.installments}x`}: R$ ${s.value})`).join(' + '),
      installments: Math.max(...paymentSplits.map(s => s.installments)),
      applied_rate: calculationData.appliedRate,
      net_received: calculationData.netReceived,
      vitrine_price: calculationData.vitrinePrice,
      max_evaluation: calculationData.maxEvaluation,
      battery_health: parseInt(batteryHealth),
      original_screen: originalScreen,
      biometrics_status: biometricsStatus,
      camera_status: cameraStatus,
      body_condition: bodyCondition,
      payment_splits: paymentSplits 
    }

    try {
      if (isSupabaseConfigured && dbStatus.connected) {
        const { error } = await supabase
          .from('evaluations')
          .insert([newRecord])
        if (error) throw error
        triggerNotification('Avaliação salva no Supabase!')
      } else {
        await localDb.saveEvaluation(newRecord)
        triggerNotification('Salvo localmente! Dados seguros offline.')
      }
      loadEvaluations()
      
      setClientName('')
      setImeiNew('')
      setImeiUsed('')
      setPaymentSplits([{ id: 1, value: '', gateway: 'Dinheiro / Pix', type: 'credit', installments: 1 }])
      setUsedCategory('Comum')
    } catch (err) {
      console.error('Error saving:', err)
      try {
        await localDb.saveEvaluation(newRecord)
        triggerNotification(`Erro na nuvem: ${err.message || String(err)}. Salvo localmente!`, 'warning')
        loadEvaluations()
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
    setClientName(record.client_name || record.clientName || '')
    setImeiNew(record.imei_new || record.imeiNew || '')
    setImeiUsed(record.imei_used || record.imeiUsed || '')
    
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
    
    setUsedModel(record.used_model || record.usedModel || USED_MODELS[0])
    setUsedStorage(record.used_storage || record.usedStorage || STORAGE_OPTIONS[0])
    setUsedColor(record.used_color || record.usedColor || APPLE_COLORS[0])
    setUsedCategory(record.used_category || record.usedCategory || 'Comum')

    setBatteryHealth(record.battery_health || record.batteryHealth || 85)
    setOriginalScreen(record.original_screen !== undefined ? record.original_screen : true)
    setBiometricsStatus(record.biometrics_status || 'ok')
    setCameraStatus(record.camera_status || 'ok')
    setBodyCondition(record.body_condition || 'Excelente')

    triggerNotification('Registro carregado com sucesso!')
  }

  // Copiar Resumo
  const handleCopySummary = () => {
    if (!calculationData.isValid) {
      triggerNotification('Cálculo inconsistente.', 'error')
      return
    }

    const formatCurrency = (val) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
    }

    const splitsList = paymentSplits.map(s => {
      const val = parseFloat(s.value) || 0
      return `  - ${s.gateway} (${s.type === 'debit' ? 'Débito' : `${s.installments}x`}): ${formatCurrency(val)}`
    }).join('\n')

    const usedCategoryTag = usedCategory === 'Saldo' ? ' ⚠️ *[SALDO]*' : ''

    const summaryText = `🍎 *AVALIAÇÃO DE TRADE-IN - Fitch*
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

  // Filtragem
  const filteredEvaluations = useMemo(() => {
    if (!searchQuery.trim()) return evaluations
    const query = searchQuery.toLowerCase()
    return evaluations.filter(record => {
      const client = (record.client_name || record.clientName || '').toLowerCase()
      const imeiN = (record.imei_new || record.imeiNew || '').toLowerCase()
      const imeiU = (record.imei_used || record.imeiUsed || '').toLowerCase()
      const modN = (record.new_model || record.newModel || '').toLowerCase()
      const modU = (record.used_model || record.usedModel || '').toLowerCase()
      const colN = (record.new_color || record.newColor || '').toLowerCase()
      const colU = (record.used_color || record.usedColor || '').toLowerCase()
      return client.includes(query) || imeiN.includes(query) || imeiU.includes(query) || modN.includes(query) || modU.includes(query) || colN.includes(query) || colU.includes(query)
    })
  }, [evaluations, searchQuery])

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
          <img src={logo} className="h-10 w-auto object-contain select-none mr-1" alt="Fitch Logo" />
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
            <img src={logo} className="h-16 w-auto object-contain select-none mb-2 animate-fade-in" alt="Fitch Logo" />
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-blue-600 via-slate-800 to-purple-600 bg-clip-text text-transparent">
              Fitch Trade-In Manager
            </h1>
            <p className="text-sm text-slate-600 font-medium">
              Selecione o módulo que deseja acessar para iniciar os trabalhos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
            
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* Nome do Cliente */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Nome Completo do Cliente *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Nome do cliente para rastreabilidade"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 rounded-xl py-3 pl-10 pr-4 text-slate-900 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>

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
                    {APPLE_COLORS.map(color => (
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
                    className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 rounded-xl py-3 pl-10 pr-4 text-slate-900 text-sm font-mono outline-none transition-all duration-200 placeholder:text-slate-400 font-semibold"
                  />
                </div>
              </div>

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
                    {APPLE_COLORS.map(color => (
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
                    className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 rounded-xl py-3 pl-10 pr-4 text-slate-900 text-sm font-mono outline-none transition-all duration-200 placeholder:text-slate-400 font-semibold"
                  />
                </div>
              </div>

            </div>

            {/* SELEÇÃO DE PAGAMENTOS MÚLTIPLOS (SPLITS) */}
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
                          <div className="grid grid-cols-2 gap-1">
                            <button
                              type="button"
                              disabled={!GATEWAY_RATES[split.gateway]?.hasDebit}
                              onClick={() => handleSplitChange(index, 'type', 'debit')}
                              className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                                split.type === 'debit'
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-35'
                              }`}
                            >
                              Déb
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSplitChange(index, 'type', 'credit')}
                              className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                                split.type === 'credit'
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              Créd
                            </button>
                          </div>
                        </div>

                        {/* Parcelas */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Parcelas</label>
                          {split.type === 'debit' ? (
                            <div className="w-full bg-white border border-slate-200 text-slate-500 rounded-lg py-1.5 px-2.5 text-xs">
                              À Vista
                            </div>
                          ) : (
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
                          )}
                        </div>

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
          </div>

          {/* EXIBIÇÃO DE RESULTADOS */}
          <div className="space-y-4">
            
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
                  {/* Badge Inteligente */}
                  {currentModelAverage && currentModelAverage.count >= 5 && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] p-2.5 rounded-xl flex items-start gap-2 animate-pulse mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Estoque Crítico ({currentModelAverage.count} unid.):</strong> Margem sugerida reduzida automaticamente em 25% para acelerar o giro.
                      </span>
                    </div>
                  )}
                  {currentModelAverage ? (
                    <div className="mt-3 text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1.5 rounded-lg flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <Archive className="w-3.5 h-3.5 text-blue-755 text-blue-700" />
                        <span>Estoque Histórico: {currentModelAverage.count} unidades</span>
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
                {isSaving ? 'Salvando...' : 'Confirmar & Salvar Venda'}
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
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
              <Archive className="w-4 h-4 text-blue-600" />
              Estoque Recebido & Médias de Preço
            </h3>
            
            {inventoryStats.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Nenhum estoque no histórico para calcular médias.</p>
            ) : (
              <div className="max-h-[260px] overflow-y-auto pr-1 space-y-2.5">
                {inventoryStats.map((item) => (
                  <div key={`${item.model}-${item.storage}`} className="flex justify-between items-center bg-white/50 border border-slate-200 rounded-lg p-3 hover:border-slate-200 transition-colors">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{item.model}</span>
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
                            title="Recarregar venda no painel"
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                          >
                            <RefreshCw className="w-4 h-4" />
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
        </div>
      </footer>
        </>
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
                      className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 rounded-xl py-3 px-4 text-slate-900 text-sm font-mono outline-none transition-all placeholder:text-slate-400 font-semibold"
                    />
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
                          <span className="font-semibold text-slate-800 block">{record.device_model}</span>
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
                              onClick={() => handleCopyChecklistSummary(record)}
                              title="Copiar Laudo completo"
                              className="text-slate-400 hover:text-slate-800 transition-colors duration-150 p-1.5 rounded hover:bg-slate-100 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md transition-all duration-300">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 w-full max-w-sm space-y-6 shadow-2xl relative animate-fade-in">
            
            <div className="text-center space-y-4">
              <img src={logo} className="h-12 w-auto object-contain select-none mx-auto" alt="Fitch Logo" />
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

    </div>
  )
}

export default App
