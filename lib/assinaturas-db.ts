import { supabase } from './supabase';

export interface AssinaturaDB {
  id: string;
  user_id: string | null;
  user_email: string;
  status: 'ativa' | 'cancelada' | 'expirada';
  data_inicio: string;
  data_vencimento: string;
  valor: number;
  forma_pagamento: 'pix' | 'cartao';
  order_nsu: string;
  slug: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}

// Criar nova assinatura no banco
export async function criarAssinaturaDB(assinatura: Omit<AssinaturaDB, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('assinaturas')
      .insert([assinatura])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar assinatura no banco:', error);
    throw error;
  }
}

// Buscar assinatura ativa do usuário
export async function buscarAssinaturaAtiva(userId: string): Promise<AssinaturaDB | null> {
  try {
    const { data, error } = await supabase
      .from('assinaturas')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'ativa')
      .gte('data_vencimento', new Date().toISOString())
      .order('data_vencimento', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw error;
    }
    
    return data || null;
  } catch (error) {
    console.error('Erro ao buscar assinatura ativa:', error);
    return null;
  }
}

// Buscar assinatura por email
export async function buscarAssinaturaPorEmail(email: string): Promise<AssinaturaDB | null> {
  try {
    const { data, error } = await supabase
      .from('assinaturas')
      .select('*')
      .eq('user_email', email)
      .eq('status', 'ativa')
      .gte('data_vencimento', new Date().toISOString())
      .order('data_vencimento', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data || null;
  } catch (error) {
    console.error('Erro ao buscar assinatura por email:', error);
    return null;
  }
}

// Listar todas as assinaturas (para admin)
export async function listarAssinaturas(): Promise<AssinaturaDB[]> {
  try {
    const { data, error } = await supabase
      .from('assinaturas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao listar assinaturas:', error);
    throw error;
  }
}

// Cancelar assinatura
export async function cancelarAssinatura(assinaturaId: string) {
  try {
    const { data, error } = await supabase
      .from('assinaturas')
      .update({ 
        status: 'cancelada',
        updated_at: new Date().toISOString()
      })
      .eq('id', assinaturaId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    throw error;
  }
}

// Estender assinatura
export async function estenderAssinatura(assinaturaId: string, dias: number) {
  try {
    const { data, error } = await supabase
      .from('assinaturas')
      .update({ 
        data_vencimento: new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', assinaturaId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao estender assinatura:', error);
    throw error;
  }
}

// Verificar e expirar assinaturas vencidas (rodar diariamente)
export async function expirarAssinaturasVencidas() {
  try {
    const { data, error } = await supabase
      .from('assinaturas')
      .update({ 
        status: 'expirada',
        updated_at: new Date().toISOString()
      })
      .eq('status', 'ativa')
      .lt('data_vencimento', new Date().toISOString());

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao expirar assinaturas vencidas:', error);
    throw error;
  }
}

// Buscar estatísticas das assinaturas (para admin)
export async function buscarEstatisticasAssinaturas() {
  try {
    const { data, error } = await supabase
      .from('assinaturas')
      .select('status, valor, created_at, data_vencimento');

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      ativas: data?.filter(a => a.status === 'ativa' && new Date(a.data_vencimento) >= new Date()).length || 0,
      canceladas: data?.filter(a => a.status === 'cancelada').length || 0,
      expiradas: data?.filter(a => a.status === 'expirada').length || 0,
      receitaTotal: data?.reduce((sum, a) => sum + a.valor, 0) || 0,
      receitaMes: data?.filter(a => {
        const createdAt = new Date(a.created_at);
        const now = new Date();
        return createdAt.getMonth() === now.getMonth() && 
               createdAt.getFullYear() === now.getFullYear();
      }).reduce((sum, a) => sum + a.valor, 0) || 0
    };

    return stats;
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    throw error;
  }
}
