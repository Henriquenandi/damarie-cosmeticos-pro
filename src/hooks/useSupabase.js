import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, supabaseHelpers } from '@/api/supabaseClient'
import { toast } from 'react-hot-toast'

// Generic hooks for CRUD operations
export const useSupabaseQuery = (table, options = {}) => {
  const { queryKey, select, orderBy, ascending, enabled = true } = options
  
  return useQuery({
    queryKey: queryKey || [table],
    queryFn: () => supabaseHelpers.getAll(table, { select, orderBy, ascending }),
    enabled
  })
}

export const useSupabaseItem = (table, id, select = '*') => {
  return useQuery({
    queryKey: [table, id],
    queryFn: () => supabaseHelpers.getById(table, id, select),
    enabled: !!id
  })
}

export const useSupabaseMutation = (table, options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess, onError, invalidateQueries = [table] } = options

  return useMutation({
    mutationFn: async ({ action, data, id }) => {
      switch (action) {
        case 'create':
          return supabaseHelpers.create(table, data)
        case 'update':
          return supabaseHelpers.update(table, id, data)
        case 'delete':
          return supabaseHelpers.delete(table, id)
        default:
          throw new Error(`Unknown action: ${action}`)
      }
    },
    onSuccess: (data, variables) => {
      invalidateQueries.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] })
      })
      onSuccess?.(data, variables)
    },
    onError: (error, variables) => {
      console.error(`Error in ${table} mutation:`, error)
      toast.error(error.message || 'Erro na operação')
      onError?.(error, variables)
    }
  })
}

// Specific hooks for each entity
export const useCustomers = () => {
  return useSupabaseQuery('customer', {
    orderBy: 'name',
    ascending: true
  })
}

export const useCustomer = (id) => {
  return useSupabaseItem('customer', id)
}

export const useCustomerMutation = () => {
  return useSupabaseMutation('customer', {
    onSuccess: (data, { action }) => {
      const actionText = action === 'create' ? 'criado' : action === 'update' ? 'atualizado' : 'excluído'
      toast.success(`Cliente ${actionText} com sucesso!`)
    }
  })
}

export const useProducts = () => {
  return useSupabaseQuery('product', {
    orderBy: 'name',
    ascending: true
  })
}

export const useProduct = (id) => {
  return useSupabaseItem('product', id)
}

export const useProductMutation = () => {
  return useSupabaseMutation('product', {
    onSuccess: (data, { action }) => {
      const actionText = action === 'create' ? 'criado' : action === 'update' ? 'atualizado' : 'excluído'
      toast.success(`Produto ${actionText} com sucesso!`)
    }
  })
}

export const useSales = () => {
  return useSupabaseQuery('sale', {
    orderBy: 'sale_date',
    ascending: false
  })
}

export const useSale = (id) => {
  return useSupabaseItem('sale', id)
}

export const useSaleMutation = () => {
  return useSupabaseMutation('sale', {
    onSuccess: (data, { action }) => {
      const actionText = action === 'create' ? 'criada' : action === 'update' ? 'atualizada' : 'excluída'
      toast.success(`Venda ${actionText} com sucesso!`)
    },
    invalidateQueries: ['sale', 'customer', 'product'] // Update related data
  })
}

export const useVouchers = () => {
  return useSupabaseQuery('voucher', {
    orderBy: 'created_date',
    ascending: false
  })
}

export const useVoucher = (id) => {
  return useSupabaseItem('voucher', id)
}

export const useVoucherMutation = () => {
  return useSupabaseMutation('voucher', {
    onSuccess: (data, { action }) => {
      const actionText = action === 'create' ? 'criado' : action === 'update' ? 'atualizado' : 'excluído'
      toast.success(`Voucher ${actionText} com sucesso!`)
    }
  })
}

export const useMercadorias = () => {
  return useSupabaseQuery('mercadoria', {
    orderBy: 'name',
    ascending: true
  })
}

export const useMercadoria = (id) => {
  return useSupabaseItem('mercadoria', id)
}

export const useMercadoriaMutation = () => {
  return useSupabaseMutation('mercadoria', {
    onSuccess: (data, { action }) => {
      const actionText = action === 'create' ? 'criada' : action === 'update' ? 'atualizada' : 'excluída'
      toast.success(`Mercadoria ${actionText} com sucesso!`)
    }
  })
}

export const usePresentes = () => {
  return useSupabaseQuery('presente', {
    orderBy: 'name',
    ascending: true
  })
}

export const usePresente = (id) => {
  return useSupabaseItem('presente', id)
}

export const usePresenteMutation = () => {
  return useSupabaseMutation('presente', {
    onSuccess: (data, { action }) => {
      const actionText = action === 'create' ? 'criado' : action === 'update' ? 'atualizado' : 'excluído'
      toast.success(`Kit ${actionText} com sucesso!`)
    }
  })
}

// Dashboard data hooks
export const useDashboardData = () => {
  const { data: sales } = useSales()
  const { data: customers } = useCustomers()
  const { data: products } = useProducts()
  
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      // Get dashboard metrics from views
      const { data: salesSummary } = await supabase
        .from('sales_summary')
        .select('*')
        .limit(30)
      
      const { data: lowStockProducts } = await supabase
        .from('low_stock_products')
        .select('*')
      
      const { data: customersWithCredit } = await supabase
        .from('customers_with_credit')
        .select('*')
      
      const { data: dashboardMetrics } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .single()
      
      return {
        salesSummary: salesSummary || [],
        lowStockProducts: lowStockProducts || [],
        customersWithCredit: customersWithCredit || [],
        dashboardMetrics: dashboardMetrics || {},
        totalSales: sales?.length || 0,
        totalCustomers: customers?.length || 0,
        totalProducts: products?.length || 0
      }
    },
    enabled: !!(sales && customers && products)
  })
}