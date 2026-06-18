import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Verifica se as variáveis de ambiente estão devidamente preenchidas
export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'seu-supabase-project-url' &&
  supabaseUrl.trim() !== ''
)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

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
  }
}
