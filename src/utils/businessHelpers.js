import { supabaseHelpers } from '@/api/supabaseClient';
import { generateUUID, generateVoucherCode } from '@/utils/uuid';

/**
 * Business logic helpers for complex operations
 */

/**
 * Create a complete sale with all related records
 * @param {Object} saleData - Sale data including items, customer, payment info
 * @returns {Object} Created sale with all related records
 */
export const createCompleteSale = async (saleData) => {
  const {
    customer_id,
    customer_name,
    items,
    total_amount,
    total_cost,
    profit,
    sale_type,
    payment_method,
    installments = 1,
    voucher_code,
    voucher_discount = 0,
    notes
  } = saleData;

  // Create the main sale record
  const sale = await supabaseHelpers.create('sale', {
    customer_id: customer_id || null,
    customer_name: customer_name || '',
    items: JSON.stringify(items),
    total_amount,
    total_cost,
    profit,
    sale_type,
    payment_method,
    status: payment_method === 'fiado' ? 'pendente' : 'concluida',
    sale_date: new Date().toISOString(),
    voucher_code: voucher_code || null,
    voucher_discount,
    notes: notes || null
  });

  // Create installments if needed (for non-fiado payments)
  if (installments > 1 && payment_method !== 'fiado') {
    const installmentAmount = total_amount / installments;
    const installmentRecords = [];

    for (let i = 1; i <= installments; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i - 1);

      installmentRecords.push({
        sale_id: sale.id,
        customer_id: customer_id || null,
        customer_name: customer_name || 'Venda Avulsa',
        installment_number: i,
        total_installments: installments,
        amount: installmentAmount,
        due_date: dueDate.toISOString().split('T')[0],
        status: i === 1 ? 'paga' : 'pendente',
        payment_method: i === 1 ? payment_method : null,
        payment_date: i === 1 ? new Date().toISOString() : null
      });
    }

    // Note: This would need an installments table to be implemented
    // For now, we'll skip this part
  }

  return sale;
};

/**
 * Create a voucher with auto-generated code
 * @param {Object} voucherData - Voucher data
 * @returns {Object} Created voucher
 */
export const createVoucher = async (voucherData) => {
  const {
    customer_id,
    customer_name,
    origin,
    discount_type,
    discount_value,
    expiry_date,
    minimum_purchase = 0,
    non_cumulative = true,
    campaign_id
  } = voucherData;

  return await supabaseHelpers.create('voucher', {
    code: generateVoucherCode(),
    customer_id: customer_id || null,
    customer_name: customer_name || '',
    origin,
    discount_type,
    discount_value,
    expiry_date,
    minimum_purchase,
    non_cumulative,
    status: 'generated',
    campaign_id: campaign_id || null,
    sent_date: null,
    used_date: null
  });
};

/**
 * Create a credit payment record
 * @param {Object} paymentData - Payment data
 * @returns {Object} Created payment record
 */
export const createCreditPayment = async (paymentData) => {
  const {
    customer_id,
    customer_name,
    sale_id,
    amount,
    payment_method,
    notes
  } = paymentData;

  return await supabaseHelpers.create('credit_payment', {
    customer_id,
    customer_name,
    sale_id: sale_id || null,
    amount,
    payment_method,
    payment_date: new Date().toISOString(),
    notes: notes || null
  });
};

/**
 * Create a stock entry record
 * @param {Object} entryData - Stock entry data
 * @returns {Object} Created stock entry
 */
export const createStockEntry = async (entryData) => {
  const {
    product_id,
    product_name,
    quantity,
    cost_price,
    entry_type = 'purchase',
    supplier,
    notes
  } = entryData;

  return await supabaseHelpers.create('stock_entry', {
    product_id,
    product_name,
    quantity,
    cost_price,
    total_cost: quantity * cost_price,
    entry_type,
    supplier: supplier || null,
    notes: notes || null,
    entry_date: new Date().toISOString()
  });
};