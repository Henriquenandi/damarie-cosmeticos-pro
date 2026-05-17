import { createClient } from '@supabase/supabase-js'
import { generateUUID } from '@/utils/uuid'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// =====================================================
// HELPER FUNCTIONS - Generic CRUD operations
// =====================================================
export const supabaseHelpers = {
  // Generic CRUD operations
  async getAll(table, options = {}) {
    const { select = '*', orderBy, ascending = false } = options
    let query = supabase.from(table).select(select)
    
    if (orderBy) {
      query = query.order(orderBy, { ascending })
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getById(table, id, select = '*') {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(table, data) {
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      throw new Error('Modo demonstração — funcionalidade desabilitada')
    }
    const dataWithId = {
      ...data,
      id: data.id || generateUUID()
    };

    const { error } = await supabase
      .from(table)
      .insert(dataWithId)

    if (error) throw error
    return dataWithId
  },

  async update(table, id, data) {
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      throw new Error('Modo demonstração — funcionalidade desabilitada')
    }
    const { error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)

    if (error) throw error
    return { id, ...data }
  },

  async delete(table, id) {
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      throw new Error('Modo demonstração — funcionalidade desabilitada')
    }
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  // Storage operations
  async uploadFile(bucket, path, file) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true // Allow overwriting files
      })
    
    if (error) throw error
    return data
  },

  async getFileUrl(bucket, path) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return data.publicUrl
  },

  async deleteFile(bucket, path) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    
    if (error) throw error
    return true
  }
}

// =====================================================
// BASE44 COMPATIBILITY LAYER - Mimics base44.entities API
// Using actual Supabase table names (singular forms)
// =====================================================
export const base44 = {
  entities: {
    // PRODUCTS (Produtos Cosméticos)
    Product: {
      async list(orderBy = '-created_date', limit = 1000) {
        let query = supabase.from('product').select('*')
        
        if (orderBy) {
          const ascending = !orderBy.startsWith('-')
          const field = orderBy.replace(/^-/, '')
          query = query.order(field, { ascending })
        }
        
        if (limit) {
          query = query.limit(limit)
        }
        
        const { data, error } = await query
        if (error) throw error
        return data || []
      },

      async filter(conditions = {}) {
        let query = supabase.from('product').select('*')
        
        Object.entries(conditions).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
        
        const { data, error } = await query
        if (error) throw error
        return data || []
      },

      async create(data) {
        return supabaseHelpers.create('product', data)
      },

      async update(id, data) {
        return supabaseHelpers.update('product', id, data)
      },

      async delete(id) {
        return supabaseHelpers.delete('product', id)
      }
    },

    // CUSTOMERS (Clientes)
    Customer: {
      async list(orderBy = '-created_date', limit = 1000) {
        let query = supabase.from('customer').select('*')
        
        if (orderBy) {
          const ascending = !orderBy.startsWith('-')
          const field = orderBy.replace(/^-/, '')
          query = query.order(field, { ascending })
        }
        
        if (limit) {
          query = query.limit(limit)
        }
        
        const { data, error } = await query
        if (error) throw error
        return data || []
      },

      async filter(conditions = {}) {
        let query = supabase.from('customer').select('*')
        
        Object.entries(conditions).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
        
        const { data, error } = await query
        if (error) throw error
        return data || []
      },

      async create(data) {
        return supabaseHelpers.create('customer', data)
      },

      async update(id, data) {
        return supabaseHelpers.update('customer', id, data)
      },

      async delete(id) {
        return supabaseHelpers.delete('customer', id)
      }
    },

    // SALES (Vendas)
    Sale: {
      async list(orderBy = '-sale_date', limit = 1000) {
        let query = supabase.from('sale').select('*')
        
        if (orderBy) {
          const ascending = !orderBy.startsWith('-')
          const field = orderBy.replace(/^-/, '')
          query = query.order(field, { ascending })
        }
        
        if (limit) {
          query = query.limit(limit)
        }
        
        const { data, error } = await query
        if (error) throw error
        return data || []
      },

      async filter(conditions = {}) {
        let query = supabase.from('sale').select('*')
        
        Object.entries(conditions).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
        
        const { data, error } = await query
        if (error) throw error
        return data || []
      },

      async create(data) {
        return supabaseHelpers.create('sale', data)
      },

      async update(id, data) {
        return supabaseHelpers.update('sale', id, data)
      },

      async delete(id) {
        return supabaseHelpers.delete('sale', id)
      }
    },

    // VOUCHERS (Vouchers/Cupons)
    Voucher: {
      async list(orderBy = '-created_date', limit = 1000) {
        let query = supabase.from('voucher').select('*')
        
        if (orderBy) {
          const ascending = !orderBy.startsWith('-')
          const field = orderBy.replace(/^-/, '')
          query = query.order(field, { ascending })
        }
        
        if (limit) {
          query = query.limit(limit)
        }
        
        const { data, error } = await query
        if (error) throw error
        return data || []
      },

      async filter(conditions = {}) {
        let query = supabase.from('voucher').select('*')
        
        Object.entries(conditions).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
        
        const { data, error } = await query
        if (error) throw error
        return data || []
      },

      async create(data) {
        return supabaseHelpers.create('voucher', data)
      },

      async update(id, data) {
        return supabaseHelpers.update('voucher', id, data)
      },

      async delete(id) {
        return supabaseHelpers.delete('voucher', id)
      }
    },

    // MERCADORIAS (Materiais/Embalagens)
    Mercadoria: {
      async list(orderBy = '-created_date', limit = 1000) {
        let query = supabase.from('mercadoria').select('*')
        
        if (orderBy) {
          const ascending = !orderBy.startsWith('-')
          const field = orderBy.replace(/^-/, '')
          query = query.order(field, { ascending })
        }
        
        if (limit) {
          query = query.limit(limit)
        }
        
        const { data, error } = await query
        if (error) throw error
        return data || []
      },

      async filter(conditions = {}) {
        let query = supabase.from('mercadoria').select('*')
        
        Object.entries(conditions).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
        
        const { data, error } = await query
        if (error) throw error
        return data || []
      },

      async create(data) {
        return supabaseHelpers.create('mercadoria', data)
      },

      async update(id, data) {
        return supabaseHelpers.update('mercadoria', id, data)
      },

      async delete(id) {
        return supabaseHelpers.delete('mercadoria', id)
      }
    },

    // PRESENTES (Kits de Presentes)
    Presente: {
      async list(orderBy = '-created_date', limit = 1000) {
        let query = supabase.from('presente').select('*')
        
        if (orderBy) {
          const ascending = !orderBy.startsWith('-')
          const field = orderBy.replace(/^-/, '')
          query = query.order(field, { ascending })
        }
        
        if (limit) {
          query = query.limit(limit)
        }
        
        const { data, error } = await query
        if (error) throw error
        return data || []
      },

      async filter(conditions = {}) {
        let query = supabase.from('presente').select('*')
        
        Object.entries(conditions).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
        
        const { data, error } = await query
        if (error) throw error
        return data || []
      },

      async create(data) {
        return supabaseHelpers.create('presente', data)
      },

      async update(id, data) {
        return supabaseHelpers.update('presente', id, data)
      },

      async delete(id) {
        return supabaseHelpers.delete('presente', id)
      }
    },

    // INSTALLMENTS (Parcelamentos)
    Installment: {
      async list(orderBy = '-due_date', limit = 1000) {
        let query = supabase.from('installment').select('*')
        
        if (orderBy) {
          const ascending = !orderBy.startsWith('-')
          const field = orderBy.replace(/^-/, '')
          query = query.order(field, { ascending })
        }
        
        if (limit) {
          query = query.limit(limit)
        }
        
        const { data, error } = await query
        if (error) throw error
        return data || []
      },

      async filter(conditions = {}) {
        let query = supabase.from('installment').select('*')
        
        Object.entries(conditions).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
        
        const { data, error } = await query
        if (error) throw error
        return data || []
      },

      async create(data) {
        return supabaseHelpers.create('installment', data)
      },

      async update(id, data) {
        return supabaseHelpers.update('installment', id, data)
      },

      async delete(id) {
        return supabaseHelpers.delete('installment', id)
      }
    },

    // STOCK ENTRIES (Entradas de Estoque)
    StockEntry: {
      async list(orderBy = '-created_date', limit = 1000) {
        let query = supabase.from('stock_entry').select('*')
        
        if (orderBy) {
          const ascending = !orderBy.startsWith('-')
          const field = orderBy.replace(/^-/, '')
          query = query.order(field, { ascending })
        }
        
        if (limit) {
          query = query.limit(limit)
        }
        
        const { data, error } = await query
        if (error) throw error
        return data || []
      },

      async filter(conditions = {}) {
        let query = supabase.from('stock_entry').select('*')
        
        Object.entries(conditions).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
        
        const { data, error } = await query
        if (error) throw error
        return data || []
      },

      async create(data) {
        return supabaseHelpers.create('stock_entry', data)
      },

      async update(id, data) {
        return supabaseHelpers.update('stock_entry', id, data)
      },

      async delete(id) {
        return supabaseHelpers.delete('stock_entry', id)
      }
    },

    // DESPESAS MENSAIS (Monthly Expenses)
    DespesaMensal: {
      async list(orderBy = '-created_date', limit = 1000) {
        let query = supabase.from('despesa_mensal').select('*')
        
        if (orderBy) {
          const ascending = !orderBy.startsWith('-')
          const field = orderBy.replace(/^-/, '')
          query = query.order(field, { ascending })
        }
        
        if (limit) {
          query = query.limit(limit)
        }
        
        const { data, error } = await query
        if (error) throw error
        return data || []
      },

      async filter(conditions = {}) {
        let query = supabase.from('despesa_mensal').select('*')
        
        Object.entries(conditions).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
        
        const { data, error } = await query
        if (error) throw error
        return data || []
      },

      async create(data) {
        return supabaseHelpers.create('despesa_mensal', data)
      },

      async update(id, data) {
        return supabaseHelpers.update('despesa_mensal', id, data)
      },

      async delete(id) {
        return supabaseHelpers.delete('despesa_mensal', id)
      }
    },

    // ENTRADA MERCADORIA (Merchandise Entry)
    EntradaMercadoria: {
      async list(orderBy = '-created_date', limit = 1000) {
        let query = supabase.from('entrada_mercadoria').select('*')
        
        if (orderBy) {
          const ascending = !orderBy.startsWith('-')
          const field = orderBy.replace(/^-/, '')
          query = query.order(field, { ascending })
        }
        
        if (limit) {
          query = query.limit(limit)
        }
        
        const { data, error } = await query
        if (error) throw error
        return data || []
      },

      async filter(conditions = {}) {
        let query = supabase.from('entrada_mercadoria').select('*')
        
        Object.entries(conditions).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
        
        const { data, error } = await query
        if (error) throw error
        return data || []
      },

      async create(data) {
        return supabaseHelpers.create('entrada_mercadoria', data)
      },

      async update(id, data) {
        return supabaseHelpers.update('entrada_mercadoria', id, data)
      },

      async delete(id) {
        return supabaseHelpers.delete('entrada_mercadoria', id)
      }
    },

    // CONSUMO MERCADORIA (Merchandise Consumption)
    ConsumoMercadoria: {
      async list(orderBy = '-created_date', limit = 1000) {
        let query = supabase.from('consumo_mercadoria').select('*')
        
        if (orderBy) {
          const ascending = !orderBy.startsWith('-')
          const field = orderBy.replace(/^-/, '')
          query = query.order(field, { ascending })
        }
        
        if (limit) {
          query = query.limit(limit)
        }
        
        const { data, error } = await query
        if (error) throw error
        return data || []
      },

      async filter(conditions = {}) {
        let query = supabase.from('consumo_mercadoria').select('*')
        
        Object.entries(conditions).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
        
        const { data, error } = await query
        if (error) throw error
        return data || []
      },

      async create(data) {
        return supabaseHelpers.create('consumo_mercadoria', data)
      },

      async update(id, data) {
        return supabaseHelpers.update('consumo_mercadoria', id, data)
      },

      async delete(id) {
        return supabaseHelpers.delete('consumo_mercadoria', id)
      }
    }
  },

  // FILE UPLOADS (mimics base44.integrations.Core.UploadFile)
  integrations: {
    Core: {
      async UploadFile({ file, bucket = 'damarie-files' }) {
        const fileName = `${Date.now()}_${file.name}`
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file)
        
        if (error) throw error
        
        const publicUrl = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName).data.publicUrl
        
        return { file_url: publicUrl }
      }
    }
  }
}
