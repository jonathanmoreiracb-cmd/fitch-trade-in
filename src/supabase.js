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
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
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
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
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
  }
}
