import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let isConfigured = false
let client = null
let initError = null

if (
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'seu-supabase-project-url' &&
  supabaseUrl.trim() !== ''
) {
  try {
    // Limpa possíveis espaços em branco ou quebras de linha nas pontas das chaves
    const cleanUrl = supabaseUrl.trim()
    const cleanKey = supabaseAnonKey.trim()
    client = createClient(cleanUrl, cleanKey)
    isConfigured = true
  } catch (err) {
    console.error('Erro ao inicializar o cliente Supabase:', err)
    initError = err.message || String(err)
  }
}

export const isSupabaseConfigured = isConfigured
export const supabase = client
export const supabaseInitError = initError

export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID()
    } catch (e) {
      // Fallback
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Mock local database helper para simular o comportamento do Supabase quando desconectado
const LOCAL_STORAGE_KEY = 'trade_in_evaluations'

export const localDb = {
  async getEvaluations() {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (e) {
      console.error('Error reading localStorage', e)
      return []
    }
  },

  async saveEvaluation(evaluation) {
    try {
      const evaluations = await this.getEvaluations()
      const newRecord = {
        id: generateUUID(),
        created_at: new Date().toISOString(),
        ...evaluation
      }
      evaluations.unshift(newRecord) // Insere no início
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(evaluations))
      return newRecord
    } catch (e) {
      console.error('Error saving to localStorage', e)
      throw e
    }
  },

  async updateEvaluation(id, updatedData) {
    try {
      const evaluations = await this.getEvaluations()
      const idx = evaluations.findIndex(item => item.id === id)
      if (idx !== -1) {
        evaluations[idx] = {
          ...evaluations[idx],
          ...updatedData
        }
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(evaluations))
        return evaluations[idx]
      }
      return null
    } catch (e) {
      console.error('Error updating in localStorage', e)
      throw e
    }
  },

  async deleteEvaluation(id) {
    try {
      const evaluations = await this.getEvaluations()
      const filtered = evaluations.filter(item => item.id !== id)
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered))
      return true
    } catch (e) {
      console.error('Error deleting from localStorage', e)
      throw e
    }
  },

  async getChecklists() {
    try {
      const data = localStorage.getItem('seminovo_checklists')
      return data ? JSON.parse(data) : []
    } catch (e) {
      console.error('Error reading localStorage for checklists', e)
      return []
    }
  },

  async saveChecklist(checklist) {
    try {
      const checklists = await this.getChecklists()
      const newRecord = {
        id: generateUUID(),
        created_at: new Date().toISOString(),
        ...checklist
      }
      checklists.unshift(newRecord)
      localStorage.setItem('seminovo_checklists', JSON.stringify(checklists))
      return newRecord
    } catch (e) {
      console.error('Error saving checklist to localStorage', e)
      throw e
    }
  },

  async deleteChecklist(id) {
    try {
      const checklists = await this.getChecklists()
      const filtered = checklists.filter(item => item.id !== id)
      localStorage.setItem('seminovo_checklists', JSON.stringify(filtered))
      return true
    } catch (e) {
      console.error('Error deleting checklist from localStorage', e)
      throw e
    }
  },

  // --- Fitch Assistência Local Storage Methods ---
  async getClientes() {
    try {
      const data = localStorage.getItem('fitch_clientes')
      const parsed = data ? JSON.parse(data) : []
      return Array.isArray(parsed) ? parsed.filter(Boolean) : []
    } catch (e) {
      console.error('Error reading localStorage for clientes', e)
      return []
    }
  },

  async saveCliente(cliente) {
    try {
      const clientes = await this.getClientes()
      const newRecord = {
        id: generateUUID(),
        created_at: new Date().toISOString(),
        ...cliente
      }
      clientes.unshift(newRecord)
      localStorage.setItem('fitch_clientes', JSON.stringify(clientes))
      return newRecord
    } catch (e) {
      console.error('Error saving cliente to localStorage', e)
      throw e
    }
  },

  async getDispositivos() {
    try {
      const data = localStorage.getItem('fitch_dispositivos')
      const parsed = data ? JSON.parse(data) : []
      return Array.isArray(parsed) ? parsed.filter(Boolean) : []
    } catch (e) {
      console.error('Error reading localStorage for dispositivos', e)
      return []
    }
  },

  async saveDispositivo(dispositivo) {
    try {
      const dispositivos = await this.getDispositivos()
      const newRecord = {
        id: generateUUID(),
        created_at: new Date().toISOString(),
        ...dispositivo
      }
      dispositivos.unshift(newRecord)
      localStorage.setItem('fitch_dispositivos', JSON.stringify(dispositivos))
      return newRecord
    } catch (e) {
      console.error('Error saving dispositivo to localStorage', e)
      throw e
    }
  },

  async getPecas() {
    try {
      const data = localStorage.getItem('fitch_pecas')
      // Se não houver estoque de peças inicial, criamos algumas peças padrão para teste
      if (!data) {
        const defaultPecas = [
          { id: 'p1', sku: 'TEL-IP11', nome: 'Tela Premium iPhone 11', compatibilidade_modelo: 'iPhone 11', deposito_tipo: 'assistencia', preco_custo: 180, preco_venda: 390, estoque_atual: 6, estoque_reservado: 0, estoque_minimo: 2 },
          { id: 'p2', sku: 'BAT-IP13PM', nome: 'Bateria Homologada iPhone 13 Pro Max', compatibilidade_modelo: 'iPhone 13 Pro Max', deposito_tipo: 'assistencia', preco_custo: 120, preco_venda: 290, estoque_atual: 4, estoque_reservado: 0, estoque_minimo: 1 },
          { id: 'p3', sku: 'CON-IP12', nome: 'Conector de Carga iPhone 12', compatibilidade_modelo: 'iPhone 12', deposito_tipo: 'assistencia', preco_custo: 50, preco_venda: 180, estoque_atual: 3, estoque_reservado: 0, estoque_minimo: 2 }
        ]
        localStorage.setItem('fitch_pecas', JSON.stringify(defaultPecas))
        return defaultPecas
      }
      return JSON.parse(data)
    } catch (e) {
      console.error('Error reading localStorage for pecas', e)
      return []
    }
  },

  async savePeca(peca) {
    try {
      const pecas = await this.getPecas()
      const newRecord = {
        id: generateUUID(),
        created_at: new Date().toISOString(),
        estoque_reservado: 0,
        ...peca
      }
      pecas.unshift(newRecord)
      localStorage.setItem('fitch_pecas', JSON.stringify(pecas))
      return newRecord
    } catch (e) {
      console.error('Error saving peca to localStorage', e)
      throw e
    }
  },

  async updatePeca(id, updatedData) {
    try {
      const pecas = await this.getPecas()
      const idx = pecas.findIndex(item => item.id === id)
      if (idx !== -1) {
        pecas[idx] = { ...pecas[idx], ...updatedData }
        localStorage.setItem('fitch_pecas', JSON.stringify(pecas))
        return pecas[idx]
      }
      return null
    } catch (e) {
      console.error('Error updating peca in localStorage', e)
      throw e
    }
  },

  async getOS() {
    try {
      const data = localStorage.getItem('fitch_ordens_servico')
      const parsed = data ? JSON.parse(data) : []
      return Array.isArray(parsed) ? parsed.filter(Boolean) : []
    } catch (e) {
      console.error('Error reading localStorage for ordens de servico', e)
      return []
    }
  },

  async saveOS(os) {
    try {
      const ordens = await this.getOS()
      const nextNumber = ordens.length > 0 ? Math.max(...ordens.map(o => o.os_number || 0)) + 1 : 1001
      const newRecord = {
        id: generateUUID(),
        os_number: nextNumber,
        uuid_acesso_vip: generateUUID(),
        created_at: new Date().toISOString(),
        data_entrada: new Date().toISOString(),
        status: 'Entrada',
        checklist_fotos: [],
        ...os
      }
      ordens.unshift(newRecord)
      localStorage.setItem('fitch_ordens_servico', JSON.stringify(ordens))
      return newRecord
    } catch (e) {
      console.error('Error saving OS to localStorage', e)
      throw e
    }
  },

  async updateOS(id, updatedData) {
    try {
      const ordens = await this.getOS()
      const idx = ordens.findIndex(item => item.id === id)
      if (idx !== -1) {
        ordens[idx] = { ...ordens[idx], ...updatedData }
        localStorage.setItem('fitch_ordens_servico', JSON.stringify(ordens))
        return ordens[idx]
      }
      return null
    } catch (e) {
      console.error('Error updating OS in localStorage', e)
      throw e
    }
  },

  async deleteOS(id) {
    try {
      const ordens = await this.getOS()
      const filtered = ordens.filter(item => item.id !== id)
      localStorage.setItem('fitch_ordens_servico', JSON.stringify(filtered))
      return true
    } catch (e) {
      console.error('Error deleting OS from localStorage', e)
      throw e
    }
  }
}
