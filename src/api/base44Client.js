import { supabase } from '@/api/supabaseClient'

const tableMap = {
  Customer: 'customers',
  Product: 'products',
  Sale: 'sales',
  Voucher: 'vouchers',
  Mercadoria: 'mercadorias',
  Presente: 'presentes',
  StockEntry: 'stock_entries',
  EntradaMercadoria: 'entrada_mercadoria',
  ConsumoMercadoria: 'consumo_mercadoria',
  CreditPayment: 'credit_payments',
  DespesaMensal: 'despesas_mensais',
  Campaign: 'campaigns',
  DrawResult: 'draw_results',
  Installment: 'installments',
}

const applyOrderAndLimit = (query, orderBy, limit) => {
  if (orderBy) {
    const descending = orderBy.startsWith('-')
    const field = descending ? orderBy.slice(1) : orderBy
    query = query.order(field, { ascending: !descending })
  }
  if (limit) {
    query = query.limit(limit)
  }
  return query
}

const entityApi = (table) => ({
  async list(orderBy, limit) {
    let query = supabase.from(table).select('*')
    query = applyOrderAndLimit(query, orderBy, limit)
    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async filter(filters = {}, orderBy, limit) {
    let query = supabase.from(table).select('*')

    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        query = query.in(key, value)
        return
      }
      if (value === null) {
        query = query.is(key, null)
        return
      }
      query = query.eq(key, value)
    })

    query = applyOrderAndLimit(query, orderBy, limit)
    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async create(payload) {
    const { data, error } = await supabase
      .from(table)
      .insert(payload)
      .select('*')
      .single()
    if (error) throw error
    return data
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from(table)
      .update(payload)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) throw error
    return true
  },
})

const entities = Object.fromEntries(
  Object.entries(tableMap).map(([entity, table]) => [entity, entityApi(table)])
)

export const base44 = {
  entities,
}
