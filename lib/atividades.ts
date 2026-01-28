import { supabase } from './supabase';

export async function registrarAtividade(
  tipoAtividade: 'audio' | 'treino' | 'fome_emocional' | 'respiracao' | 'diario',
  titulo: string,
  descricao?: string,
  dadosAdicionais?: any,
  duracao?: number
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('Usuário não autenticado, não foi possível registrar atividade');
      return;
    }

    const { error } = await supabase
      .from('atividades')
      .insert([{
        user_id: user.id,
        tipo_atividade: tipoAtividade,
        titulo: titulo,
        descricao: descricao,
        dados_adicionais: dadosAdicionais,
        duracao: duracao
      }]);

    if (error) {
      console.error('Erro ao registrar atividade:', error);
    }
  } catch (error) {
    console.error('Erro ao registrar atividade:', error);
  }
}

// Funções específicas para cada tipo de atividade
export const registrarAudio = (titulo: string, duracao?: number) => 
  registrarAtividade('audio', `Áudio: ${titulo}`, undefined, { titulo }, duracao);

export const registrarTreino = (titulo: string, duracao?: number) => 
  registrarAtividade('treino', `Treino: ${titulo}`, undefined, { titulo }, duracao);

export const registrarFomeEmocional = (sintomas: string[], detalhes: any) => 
  registrarAtividade('fome_emocional', 'Fome Emocional', 'Registro de consciência alimentar', { sintomas, detalhes });

export const registrarRespiracao = (duracao?: number) => 
  registrarAtividade('respiracao', 'Respiração Consciente', 'Prática de mindfulness e presença', undefined, duracao);

export const registrarDiario = (conteudo: string) => 
  registrarAtividade('diario', 'Diário', 'Reflexão pessoal', { conteudo });
