import { supabase } from './supabase';
import { buscarAssinaturaAtiva, buscarAssinaturaPorEmail } from './assinaturas-db';

export interface Assinatura {
  ativa: boolean;
  dataVencimento: string;
  orderNsu?: string;
  slug?: string;
}

export async function verificarAssinatura(userEmail: string, userId?: string): Promise<Assinatura | null> {
  try {
    // Primeiro tenta buscar do Supabase (fonte principal)
    if (userId) {
      const assinaturaDB = await buscarAssinaturaAtiva(userId);
      if (assinaturaDB) {
        return {
          ativa: true,
          dataVencimento: assinaturaDB.data_vencimento,
          orderNsu: assinaturaDB.order_nsu,
          slug: assinaturaDB.slug
        };
      }
    }

    // Fallback para busca por email
    const assinaturaEmail = await buscarAssinaturaPorEmail(userEmail);
    if (assinaturaEmail) {
      return {
        ativa: true,
        dataVencimento: assinaturaEmail.data_vencimento,
        orderNsu: assinaturaEmail.order_nsu,
        slug: assinaturaEmail.slug
      };
    }

    // Se não encontrou no Supabase, verifica o localStorage (legado)
    const assinaturaStr = localStorage.getItem(`assinatura_${userEmail}`);
    if (assinaturaStr) {
      const assinatura: Assinatura = JSON.parse(assinaturaStr);
      
      // Verifica se a assinatura ainda está válida
      const dataVencimento = new Date(assinatura.dataVencimento);
      const agora = new Date();
      
      if (dataVencimento < agora) {
        // Assinatura expirou, remove do localStorage
        localStorage.removeItem(`assinatura_${userEmail}`);
        return null;
      }
      
      return assinatura;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao verificar assinatura:', error);
    return null;
  }
}

export async function ativarAssinatura(
  userEmail: string,
  orderNsu: string,
  slug: string,
  dias: number = 30
): Promise<void> {
  try {
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + dias);
    
    const assinatura: Assinatura = {
      ativa: true,
      dataVencimento: dataVencimento.toISOString(),
      orderNsu,
      slug
    };
    
    localStorage.setItem(`assinatura_${userEmail}`, JSON.stringify(assinatura));
  } catch (error) {
    console.error('Erro ao ativar assinatura:', error);
    throw error;
  }
}

export function diasRestantesAssinatura(dataVencimento: string): number {
  const vencimento = new Date(dataVencimento);
  const agora = new Date();
  const diffMs = vencimento.getTime() - agora.getTime();
  const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDias);
}

export function formatarDataVencimento(dataVencimento: string): string {
  const data = new Date(dataVencimento);
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}
