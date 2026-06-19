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

  // Controle de Migração de Dados Locais
  const [localRecordsToSync, setLocalRecordsToSync] = useState([])
  const [isSyncingLocal, setIsSyncingLocal] = useState(false)

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

  useEffect(() => {
    loadEvaluations()
  }, [])

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

  const formatBRL = (val) => {
    if (isNaN(val) || val === null) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans antialiased pb-12 relative overflow-hidden">
      
      {/* Luzes de Fundo */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
      
      {/* Toast Notification */}
      {notification.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 transform animate-bounce">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-full shadow-2xl backdrop-blur-xl border ${
            notification.type === 'error' 
              ? 'bg-red-950/80 border-red-500/30 text-red-200' 
              : notification.type === 'warning'
              ? 'bg-amber-950/80 border-amber-500/30 text-amber-200'
              : 'bg-zinc-900/90 border-zinc-800 text-zinc-200'
          }`}>
            {notification.type === 'error' ? (
              <XCircle className="w-5 h-5 text-red-400" />
            ) : notification.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            )}
            <span className="text-sm font-medium tracking-tight">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header Principal */}
      <header className="max-w-7xl mx-auto px-6 pt-8 pb-4 flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-900/80 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-zinc-800 to-zinc-900 flex items-center justify-center border border-zinc-700/50 shadow-inner">
            <Cpu className="w-5 h-5 text-zinc-100" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Fitch Trade-In
              <span className="text-[10px] uppercase font-mono tracking-widest bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 border border-zinc-700">PRO v7</span>
            </h1>
            <p className="text-xs text-zinc-500">Mapeamento Comercial de Vendas e IMEI</p>
          </div>
        </div>

        {/* Database Status Widget */}
        <div className="flex items-center gap-3 self-start md:self-auto bg-zinc-900/50 border border-zinc-800/80 px-4 py-2 rounded-full backdrop-blur-sm">
          <div className="relative flex h-2 w-2">
            {dbStatus.connected ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </>
            ) : dbStatus.mode === 'checking' ? (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-500 animate-pulse"></span>
            ) : (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </>
            )}
          </div>
          <span className="text-xs font-medium text-zinc-400">
            {dbStatus.mode === 'checking' ? 'Conectando...' : `Banco: ${dbStatus.mode}`}
          </span>
          {isSupabaseConfigured && (
            <button 
              onClick={loadEvaluations}
              title="Sincronizar banco"
              className="text-zinc-500 hover:text-white transition-colors duration-150"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Banner de Erro de Conexão com o Supabase */}
      {dbStatus.errorMsg && (
        <div className="max-w-7xl mx-auto px-6 mt-4">
          <div className="bg-red-950/60 border border-red-500/30 rounded-2xl p-4 backdrop-blur-md">
            <h4 className="text-sm font-semibold text-red-400">Erro de Conexão com o Supabase</h4>
            <div className="text-xs text-zinc-400 mt-2 space-y-1">
              <p><strong>Detalhe:</strong> <span className="font-mono break-all">{dbStatus.errorMsg}</span></p>
              <p><strong>URL Usada:</strong> <span className="font-mono break-all">{import.meta.env.VITE_SUPABASE_URL || 'Não configurada'}</span></p>
            </div>
            <p className="text-[11px] text-zinc-500 mt-3 border-t border-red-500/10 pt-2">
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
              <Info className="w-5 h-5 text-blue-400 shrink-0 animate-bounce" />
              <div>
                <h4 className="text-sm font-semibold text-white">Sincronização Pendente de Histórico</h4>
                <p className="text-xs text-zinc-400">
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

      {/* Grid de Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUNA ESQUERDA: Form de Precificação e Resultados (Col 7) */}
        <section className="lg:col-span-7 space-y-8">
          
          {/* Form de Entrada de Dados */}
          <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6">
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Calculator className="w-5 h-5 text-blue-400" />
              1. Dados da Venda e Dispositivos
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* Nome do Cliente */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Nome Completo do Cliente *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Nome do cliente para rastreabilidade"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-zinc-655 rounded-xl py-3 pl-10 pr-4 text-white text-sm outline-none transition-all duration-200 focus:ring-1 focus:ring-zinc-650 placeholder:text-zinc-600"
                  />
                </div>
              </div>

              {/* iPhone Novo Vendido */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Modelo do Novo *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <Smartphone className="w-4 h-4" />
                  </span>
                  <select
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full appearance-none bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl py-3 pl-10 pr-10 text-sm outline-none transition-all duration-150 cursor-pointer"
                  >
                    {NEW_MODELS.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* Capacidade do Novo */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Capacidade (Novo) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <Sliders className="w-4 h-4" />
                  </span>
                  <select
                    value={newStorage}
                    onChange={(e) => setNewStorage(e.target.value)}
                    className="w-full appearance-none bg-zinc-955 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl py-3 pl-10 pr-10 text-sm outline-none transition-all duration-150 cursor-pointer"
                  >
                    {STORAGE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* Cor do Novo */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Cor do Novo *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <Palette className="w-4 h-4" />
                  </span>
                  <select
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-full appearance-none bg-zinc-955 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl py-3 pl-10 pr-10 text-sm outline-none transition-all duration-150 cursor-pointer"
                  >
                    {APPLE_COLORS.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* Custo Real do Novo */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Custo Real do Novo (Tabela) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-sm">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Custo do novo"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-zinc-650 rounded-xl py-3 pl-10 pr-4 text-white text-sm outline-none transition-all duration-200 focus:ring-1 focus:ring-zinc-650 placeholder:text-zinc-600"
                  />
                </div>
              </div>

              {/* Margem de Lucro Combinada */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Margem de Lucro Combinada
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-sm">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Padrão: 800.00"
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(e.target.value)}
                    className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-zinc-650 rounded-xl py-3 pl-10 pr-4 text-white text-sm outline-none transition-all duration-200 focus:ring-1 focus:ring-zinc-650 placeholder:text-zinc-600 font-semibold"
                  />
                </div>
              </div>

              {/* Custos Operacionais / Despesas */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Custos Operacionais / Despesas
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-sm">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Padrão: 120.00"
                    value={operationalCost}
                    onChange={(e) => setOperationalCost(e.target.value)}
                    className="w-full bg-zinc-955 border border-zinc-800 focus:border-zinc-650 rounded-xl py-3 pl-10 pr-4 text-white text-sm outline-none transition-all duration-200 focus:ring-1 focus:ring-zinc-650 placeholder:text-zinc-600 font-medium"
                  />
                </div>
              </div>

              {/* IMEI Novo */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  IMEI do Novo *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">
                    #
                  </span>
                  <input
                    type="text"
                    maxLength="15"
                    placeholder="IMEI de 15 dígitos"
                    value={imeiNew}
                    onChange={(e) => setImeiNew(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-zinc-655 rounded-xl py-3 pl-10 pr-4 text-white text-sm font-mono outline-none transition-all duration-200 focus:ring-1 focus:ring-zinc-650"
                  />
                </div>
              </div>

              {/* Categoria do Usado */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Categoria do Aparelho Usado
                </label>
                <div className="grid grid-cols-2 gap-2 bg-zinc-950/80 p-1.5 rounded-xl border border-zinc-850">
                  <button
                    type="button"
                    onClick={() => setUsedCategory('Comum')}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer ${
                      usedCategory === 'Comum'
                        ? 'bg-zinc-800 text-white shadow-sm font-bold'
                        : 'text-zinc-500 hover:text-zinc-350'
                    }`}
                  >
                    Usado Comum
                  </button>
                  <button
                    type="button"
                    onClick={() => setUsedCategory('Saldo')}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer ${
                      usedCategory === 'Saldo'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm font-bold'
                        : 'text-zinc-500 hover:text-zinc-350 border border-transparent'
                    }`}
                  >
                    iPhone de Saldo
                  </button>
                </div>
              </div>

              {/* iPhone Usado de Entrada */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  iPhone Usado de Entrada *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <Smartphone className="w-4 h-4 text-zinc-400" />
                  </span>
                  <select
                    value={usedModel}
                    onChange={(e) => setUsedModel(e.target.value)}
                    className="w-full appearance-none bg-zinc-950 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl py-3 pl-10 pr-10 text-sm outline-none transition-all duration-150 cursor-pointer"
                  >
                    {USED_MODELS.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* Capacidade do Usado */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Capacidade (Usado) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <Sliders className="w-4 h-4" />
                  </span>
                  <select
                    value={usedStorage}
                    onChange={(e) => setUsedStorage(e.target.value)}
                    className="w-full appearance-none bg-zinc-955 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl py-3 pl-10 pr-10 text-sm outline-none transition-all duration-150 cursor-pointer"
                  >
                    {STORAGE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* Cor do Usado */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Cor do Usado *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <Palette className="w-4 h-4" />
                  </span>
                  <select
                    value={usedColor}
                    onChange={(e) => setUsedColor(e.target.value)}
                    className="w-full appearance-none bg-zinc-955 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl py-3 pl-10 pr-10 text-sm outline-none transition-all duration-150 cursor-pointer"
                  >
                    {APPLE_COLORS.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* IMEI Usado */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  IMEI do Usado *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">
                    #
                  </span>
                  <input
                    type="text"
                    maxLength="15"
                    placeholder="IMEI de 15 dígitos"
                    value={imeiUsed}
                    onChange={(e) => setImeiUsed(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-zinc-950/80 border border-zinc-850 rounded-xl py-3 pl-10 pr-4 text-white text-sm font-mono outline-none transition-all duration-200 focus:ring-1 focus:ring-zinc-650"
                  />
                </div>
              </div>

            </div>

            {/* SELEÇÃO DE PAGAMENTOS MÚLTIPLOS (SPLITS) */}
            <div className="bg-zinc-950/60 border border-zinc-855 rounded-xl p-4 md:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Formas de Pagamento Combinadas *
                </span>
                <button
                  type="button"
                  onClick={addPaymentSplit}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors duration-155 flex items-center gap-1 cursor-pointer"
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
                    <div key={split.id} className="relative bg-zinc-900/40 border border-zinc-850 rounded-xl p-4 space-y-3.5 group/split">
                      {/* Botão Remover Split */}
                      {paymentSplits.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePaymentSplit(index)}
                          className="absolute top-2.5 right-2.5 text-zinc-500 hover:text-red-400 transition-colors duration-150 p-1 rounded hover:bg-zinc-800"
                          title="Remover esta forma de pagamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        
                        {/* Valor do Split */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Valor (R$)</label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">R$</span>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Valor"
                              value={split.value}
                              onChange={(e) => handleSplitChange(index, 'value', e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-850 focus:border-zinc-700 rounded-lg py-1.5 pl-7 pr-2.5 text-white text-xs outline-none transition-all placeholder:text-zinc-655"
                            />
                          </div>
                        </div>

                        {/* Canal / Gateway */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Canal</label>
                          <div className="relative">
                            <select
                              value={split.gateway}
                              onChange={(e) => handleSplitChange(index, 'gateway', e.target.value)}
                              className="w-full appearance-none bg-zinc-950 border border-zinc-855 focus:border-zinc-700 text-white rounded-lg py-1.5 pl-2.5 pr-8 text-xs outline-none cursor-pointer"
                            >
                              {Object.keys(GATEWAY_RATES).map(gw => (
                                <option key={gw} value={gw}>{gw}</option>
                              ))}
                            </select>
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                              <ChevronDown className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>

                        {/* Tipo */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Tipo</label>
                          <div className="grid grid-cols-2 gap-1">
                            <button
                              type="button"
                              disabled={!GATEWAY_RATES[split.gateway]?.hasDebit}
                              onClick={() => handleSplitChange(index, 'type', 'debit')}
                              className={`py-1.5 text-[10px] font-semibold rounded-lg border transition-all ${
                                split.type === 'debit'
                                  ? 'bg-white text-black border-white'
                                  : 'bg-zinc-955 border-zinc-850 text-zinc-400 hover:text-white disabled:opacity-35'
                              }`}
                            >
                              Déb
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSplitChange(index, 'type', 'credit')}
                              className={`py-1.5 text-[10px] font-semibold rounded-lg border transition-all ${
                                split.type === 'credit'
                                  ? 'bg-white text-black border-white'
                                  : 'bg-zinc-955 border-zinc-850 text-zinc-400 hover:text-white'
                              }`}
                            >
                              Créd
                            </button>
                          </div>
                        </div>

                        {/* Parcelas */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Parcelas</label>
                          {split.type === 'debit' ? (
                            <div className="w-full bg-zinc-955 border border-zinc-850 text-zinc-500 rounded-lg py-1.5 px-2.5 text-xs">
                              À Vista
                            </div>
                          ) : (
                            <div className="relative">
                              <select
                                value={split.installments}
                                onChange={(e) => handleSplitChange(index, 'installments', parseInt(e.target.value))}
                                className="w-full appearance-none bg-zinc-955 border border-zinc-850 focus:border-zinc-700 text-white rounded-lg py-1.5 pl-2.5 pr-8 text-xs outline-none cursor-pointer"
                              >
                                {availableInsts.map(inst => (
                                  <option key={inst} value={inst}>{inst}x</option>
                                ))}
                              </select>
                              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-400 border-t border-zinc-900 pt-3 gap-2">
                  <div className="flex gap-4">
                    <span>Adicional Total: <strong className="text-white">{formatBRL(calculationData.totalValue)}</strong></span>
                    <span>Líquido Recebido: <strong className="text-emerald-400">{formatBRL(calculationData.netReceived)}</strong></span>
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded self-start sm:self-auto">
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
                <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-red-200 font-semibold text-sm">Opção Indisponível</h3>
                  <p className="text-xs text-red-300/80 mt-1">{calculationData.errorMsg}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Preço de Vitrine */}
                <div className="bg-gradient-to-br from-blue-950/40 to-zinc-900/60 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden transition-all duration-200 hover:border-blue-500/30 group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all duration-300"></div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
                      Preço de Vitrine
                    </span>
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-xs text-zinc-400 font-medium">Preço de Venda do Usado</h3>
                    <p className="text-3xl font-extrabold text-white mt-1 tracking-tight">
                      {formatBRL(calculationData.vitrinePrice)}
                    </p>
                  </div>
                  <div className="mt-3 text-[10px] text-zinc-500 flex items-center gap-1.5 border-t border-zinc-800/80 pt-2.5">
                    <Info className="w-3 h-3 text-zinc-500 shrink-0" />
                    <span>Custo Novo + Margem ({formatBRL(parseFloat(profitMargin) || 0)}) + Despesa ({formatBRL(parseFloat(operationalCost) || 0)}) - Líquido Recebido</span>
                  </div>
                </div>

                {/* Avaliação Máxima do Usado */}
                <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-950 border border-zinc-850 rounded-2xl p-6 relative overflow-hidden transition-all duration-200 hover:border-zinc-700 group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-500/5 rounded-full blur-2xl group-hover:bg-zinc-500/10 transition-all duration-300"></div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                      Proposta ao Cliente
                    </span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-xs text-zinc-400 font-medium">Avaliação Máxima do Usado</h3>
                    <p className="text-3xl font-extrabold text-white mt-1 tracking-tight">
                      {formatBRL(calculationData.maxEvaluation)}
                    </p>
                  </div>
                  
                  {/* Badge Inteligente */}
                  {currentModelAverage ? (
                    <div className="mt-3 text-[10px] text-blue-400 bg-blue-950/20 border border-blue-900/30 px-2.5 py-1.5 rounded-lg flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <Archive className="w-3.5 h-3.5 text-blue-400" />
                        <span>Estoque Histórico: {currentModelAverage.count} unidades</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between text-[9px] text-zinc-400 border-t border-zinc-900/60 pt-1 gap-1">
                        <span>Médio Pago: <strong className="text-emerald-400">{formatBRL(currentModelAverage.avgCost)}</strong></span>
                        <span>Média Vitrine: <strong className="text-white">{formatBRL(currentModelAverage.avgVitrine)}</strong></span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 text-[10px] text-zinc-500 flex items-center gap-1.5 border-t border-zinc-800/80 pt-2.5">
                      <Info className="w-3 h-3 text-zinc-500 shrink-0" />
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
                className="flex-1 bg-white hover:bg-zinc-200 text-black py-3.5 px-6 rounded-xl text-sm font-semibold tracking-tight transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg"
              >
                <Copy className="w-4 h-4" />
                {copySuccess ? 'Copiado!' : 'Copiar Resumo da Avaliação'}
              </button>
              
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveEvaluation}
                className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 py-3.5 px-6 rounded-xl text-sm font-semibold tracking-tight transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <Database className="w-4 h-4 text-zinc-400" />
                {isSaving ? 'Salvando...' : 'Confirmar & Salvar Venda'}
              </button>
            </div>

          </div>

        </section>

        {/* COLUNA DIREITA: Checklist Técnico e KPIs (Col 5) */}
        <section className="lg:col-span-5 space-y-8">
          
          {/* Painel do Checklist */}
          <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6">
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
              <ListTodo className="w-5 h-5 text-purple-400" />
              2. Checklist Técnico do Usado
            </h2>

            <div className="space-y-6">
              
              {/* Saúde da Bateria */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                    Saúde da Bateria
                  </label>
                  {batteryHealth < 80 ? (
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-red-950 border border-red-500/30 text-red-400 px-2 py-0.5 rounded animate-pulse">
                      Necessita Troca
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-950 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded">
                      Bateria OK
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <Battery className={`w-4 h-4 ${batteryHealth < 80 ? 'text-red-400' : 'text-emerald-400'}`} />
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="Saúde em %"
                    value={batteryHealth}
                    onChange={(e) => setBatteryHealth(Math.min(100, Math.max(1, parseInt(e.target.value) || 0)))}
                    className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-zinc-650 rounded-xl py-3 pl-10 pr-4 text-white text-sm outline-none transition-all duration-200 focus:ring-1 focus:ring-zinc-650"
                  />
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={batteryHealth}
                  onChange={(e) => setBatteryHealth(parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white mt-2"
                />
              </div>

              {/* Tela Original */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Tela Original?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOriginalScreen(true)}
                    className={`py-3 text-xs font-semibold rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 ${
                      originalScreen
                        ? 'bg-zinc-900 border-white text-white'
                        : 'bg-zinc-950/80 border-zinc-850 text-zinc-500 hover:text-zinc-350 hover:border-zinc-800'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${originalScreen ? 'text-white' : 'text-zinc-600'}`} />
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setOriginalScreen(false)}
                    className={`py-3 text-xs font-semibold rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 ${
                      !originalScreen
                        ? 'bg-red-950/60 border-red-500/30 text-red-200'
                        : 'bg-zinc-950/80 border-zinc-850 text-zinc-500 hover:text-zinc-350 hover:border-zinc-800'
                    }`}
                  >
                    <XCircle className={`w-4 h-4 ${!originalScreen ? 'text-red-400' : 'text-zinc-600'}`} />
                    Não / Paralela
                  </button>
                </div>
              </div>

              {/* Face ID / Touch ID */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Face ID / Touch ID
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBiometricsStatus('ok')}
                    className={`py-3 text-xs font-semibold rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 ${
                      biometricsStatus === 'ok'
                        ? 'bg-zinc-900 border-white text-white'
                        : 'bg-zinc-950/80 border-zinc-850 text-zinc-500 hover:text-zinc-350 hover:border-zinc-800'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${biometricsStatus === 'ok' ? 'text-white' : 'text-zinc-600'}`} />
                    OK Funcionando
                  </button>
                  <button
                    type="button"
                    onClick={() => setBiometricsStatus('defeito')}
                    className={`py-3 text-xs font-semibold rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 ${
                      biometricsStatus === 'defeito'
                        ? 'bg-red-950/60 border-red-500/30 text-red-200'
                        : 'bg-zinc-950/80 border-zinc-850 text-zinc-500 hover:text-zinc-350 hover:border-zinc-800'
                    }`}
                  >
                    <XCircle className={`w-4 h-4 ${biometricsStatus === 'defeito' ? 'text-red-400' : 'text-zinc-600'}`} />
                    Com Defeito
                  </button>
                </div>
              </div>

              {/* Câmeras e Foco */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Câmeras e Foco
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCameraStatus('ok')}
                    className={`py-3 text-[11px] font-semibold rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 ${
                      cameraStatus === 'ok'
                        ? 'bg-zinc-900 border-white text-white'
                        : 'bg-zinc-950/80 border-zinc-850 text-zinc-500 hover:text-zinc-350 hover:border-zinc-800'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${cameraStatus === 'ok' ? 'text-white' : 'text-zinc-600'}`} />
                    OK Funcionando
                  </button>
                  <button
                    type="button"
                    onClick={() => setCameraStatus('defeito')}
                    className={`py-3 text-[11px] font-semibold rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 ${
                      cameraStatus === 'defeito'
                        ? 'bg-red-950/60 border-red-500/30 text-red-200'
                        : 'bg-zinc-950/80 border-zinc-850 text-zinc-500 hover:text-zinc-350 hover:border-zinc-800'
                    }`}
                  >
                    <XCircle className={`w-4 h-4 ${cameraStatus === 'defeito' ? 'text-red-400' : 'text-zinc-600'}`} />
                    Com Defeito
                  </button>
                </div>
              </div>

              {/* Estado da Carcaça */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Estado da Carcaça
                </label>
                <div className="relative">
                  <select
                    value={bodyCondition}
                    onChange={(e) => setBodyCondition(e.target.value)}
                    className="w-full appearance-none bg-zinc-955 border border-zinc-800 focus:border-zinc-700 text-white rounded-xl py-3 px-4 text-sm outline-none transition-all duration-150 cursor-pointer"
                  >
                    <option value="Excelente">Excelente (Sem marcas)</option>
                    <option value="Marcas Leves">Marcas Leves (Pequenos riscos)</option>
                    <option value="Trincado/Quebrado">Trincado / Quebrado (Danos fisicos)</option>
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Painel de Inventário */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-2">
              <Archive className="w-4 h-4 text-blue-400" />
              Estoque Recebido & Médias de Preço
            </h3>
            
            {inventoryStats.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">Nenhum estoque no histórico para calcular médias.</p>
            ) : (
              <div className="max-h-[260px] overflow-y-auto pr-1 space-y-2.5">
                {inventoryStats.map((item) => (
                  <div key={`${item.model}-${item.storage}`} className="flex justify-between items-center bg-zinc-950/50 border border-zinc-900 rounded-lg p-3 hover:border-zinc-800 transition-colors">
                    <div>
                      <span className="text-xs font-bold text-white block">{item.model}</span>
                      <span className="text-[10px] text-zinc-400 font-mono block">{item.storage} • {item.count} unidade(s)</span>
                      <span className="text-[9px] text-zinc-550 block mt-0.5">
                        Médio Pago (Custo): <strong className="text-emerald-500">{formatBRL(item.avgCost)}</strong>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-blue-400 block">{formatBRL(item.avgVitrine)}</span>
                      <span className="text-[9px] text-zinc-500 block">Médio Vitrine (Venda)</span>
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
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                Histórico de Vendas & Trade-ins
              </h2>
              <p className="text-xs text-zinc-500">Controle completo com múltiplos pagamentos combinados</p>
            </div>
            
            {/* Busca */}
            <div className="relative w-full sm:w-80">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Buscar por cliente, IMEI, cor ou modelo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-lg py-2 pl-9 pr-4 text-xs text-white outline-none transition-all"
              />
            </div>
          </div>

          {filteredEvaluations.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl space-y-2">
              <p className="text-sm text-zinc-500">Nenhum registro encontrado.</p>
              <p className="text-xs text-zinc-650">Tente buscar por um termo diferente.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Data e Cliente</th>
                    <th className="py-3 px-4">Novo Vendido (Detalhes)</th>
                    <th className="py-3 px-4">Usado Recebido (Detalhes)</th>
                    <th className="py-3 px-4">Formas de Pagamento</th>
                    <th className="py-3 px-4 text-right">Preço Vitrine</th>
                    <th className="py-3 px-4 text-right">Avaliado</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60 text-sm">
                  {filteredEvaluations.map((record) => (
                    <tr key={record.id} className="hover:bg-zinc-900/30 transition-colors duration-150 group">
                      
                      {/* Cliente e Data */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white block">{record.client_name || record.clientName || 'Cliente Geral'}</span>
                        <span className="text-[10px] text-zinc-500">
                          {new Date(record.created_at).toLocaleDateString('pt-BR')} às {new Date(record.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Novo Vendido */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-zinc-300 block font-semibold">
                          {record.new_model || record.newModel} ({record.new_storage || record.newStorage || '128GB'})
                        </span>
                        <div className="text-[10px] text-zinc-400 space-y-0.5">
                          <span>Cor: {record.new_color || record.newColor || 'N/D'}</span>
                          <span className="block font-mono text-zinc-500">IMEI: {record.imei_new || record.imeiNew || 'N/D'}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 block mt-1">
                          <span>Custo: {formatBRL(record.new_cost || record.newCost)}</span>
                          <div className="text-[9px] text-zinc-550 space-y-0.5 mt-0.5">
                            <span>Margem Lucro: {formatBRL(record.profit_margin !== undefined ? record.profit_margin : (record.profitMargin !== undefined ? record.profitMargin : 800))}</span>
                            <span className="block">Despesa Op: {formatBRL(record.operational_cost !== undefined ? record.operational_cost : (record.operationalCost !== undefined ? record.operationalCost : 120))}</span>
                          </div>
                        </div>
                      </td>

                      {/* Usado */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-zinc-300">
                            {record.used_model || record.usedModel} ({record.used_storage || record.usedStorage || '128GB'})
                          </span>
                          {(record.used_category || record.usedCategory) === 'Saldo' && (
                            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-extrabold px-1.5 py-0.5 rounded leading-none">
                              SALDO
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400 block">
                          Cor: {record.used_color || record.usedColor || 'N/D'}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono block">
                          IMEI: {record.imei_used || record.imeiUsed || 'N/D'}
                        </span>
                        <div className="flex gap-2 items-center mt-1 text-[9px]">
                          <span className={`px-1 rounded-sm ${
                            (record.battery_health || record.batteryHealth) < 80 
                              ? 'bg-red-950/50 text-red-400 border border-red-900/20' 
                              : 'bg-zinc-900 text-zinc-400'
                          }`}>
                            🔋 {record.battery_health || record.batteryHealth}%
                          </span>
                          <span className={`px-1 rounded-sm ${
                            (record.original_screen !== undefined ? record.original_screen : record.originalScreen)
                              ? 'bg-zinc-900 text-zinc-400'
                              : 'bg-red-950/50 text-red-400 border border-red-900/20'
                          }`}>
                            🖥️ {(record.original_screen !== undefined ? record.original_screen : record.originalScreen) ? 'Orig' : 'Alt'}
                          </span>
                          <span className="text-zinc-550 font-medium">Carcaça: {record.body_condition || 'Excelente'}</span>
                        </div>
                      </td>

                      {/* Pagamento Fracionado */}
                      <td className="py-3 px-4 max-w-[220px]">
                        <span className="text-zinc-300 font-bold block">{formatBRL(record.additional_value || record.additionalValue)}</span>
                        {record.payment_splits && Array.isArray(record.payment_splits) ? (
                          <div className="mt-1 space-y-0.5">
                            {record.payment_splits.map((s, idx) => (
                              <span key={idx} className="text-[9px] text-zinc-500 block leading-tight truncate">
                                • {s.gateway} ({s.type === 'debit' ? 'Déb' : `${s.installments}x`}): {formatBRL(parseFloat(s.value) || 0)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-500 block truncate">
                            {record.gateway} ({record.installments === 1 && (record.gateway === 'Dinheiro / Pix' || record.applied_rate === 0) ? 'Débito' : `${record.installments}x`})
                          </span>
                        )}
                      </td>

                      {/* Vitrine */}
                      <td className="py-3 px-4 text-right font-bold text-blue-400">
                        {formatBRL(record.vitrine_price || record.vitrinePrice)}
                      </td>

                      {/* Avaliação Usado */}
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">
                        {formatBRL(record.max_evaluation || record.maxEvaluation)}
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleLoadRecord(record)}
                            title="Recarregar venda no painel"
                            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvaluation(record.id)}
                            title="Excluir venda"
                            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-red-400 transition-colors"
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
        <div className="bg-zinc-950/90 border border-zinc-900 rounded-2xl p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <ShieldCheck className="w-5 h-5 text-zinc-400" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Painel de Auditoria Interna (Exclusivo Gerente)
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-zinc-400">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest block">Retenção de Taxa</span>
              <p className="text-lg font-bold text-white mt-1">
                {calculationData.isValid ? formatBRL(calculationData.machineFee) : 'R$ 0,00'}
              </p>
              <span className="text-[10px] text-zinc-650">Comissão retida pela maquininha</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest block">Custos / Despesas Op</span>
              <p className="text-lg font-bold text-red-400 mt-1">
                {calculationData.isValid ? formatBRL(calculationData.giftCost) : 'R$ 0,00'}
              </p>
              <span className="text-[10px] text-zinc-650">Brindes, reparos e custos adicionais</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest block">Líquido Recebido</span>
              <p className="text-lg font-bold text-white mt-1">
                {calculationData.isValid ? formatBRL(calculationData.netReceived) : 'R$ 0,00'}
              </p>
              <span className="text-[10px] text-zinc-650">Valor líquido na conta da loja</span>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 flex flex-col justify-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block">
                Lucro Combinado Garantido
              </span>
              <p className="text-xl font-black text-white mt-0.5">
                {calculationData.isValid ? formatBRL(calculationData.totalProfit) : 'R$ 800,00'}
              </p>
              <span className="text-[9px] text-zinc-500">Lucro líquido livre de despesas</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default App
