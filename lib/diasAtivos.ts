import { supabase } from './supabase';

let lastActivityCheck: string | null = null;

// Registra que o usuário está ativo hoje
export async function registrarDiaAtivo() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('Usuário não autenticado, não foi possível registrar dia ativo');
      return;
    }

    const hoje = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Evita registrar múltiplas vezes no mesmo dia
    if (lastActivityCheck === hoje) {
      return;
    }

    // Tenta inserir ou atualizar o registro do dia
    const { data, error } = await supabase
      .from('dias_ativos')
      .upsert([{
        user_id: user.id,
        data_ativo: hoje,
        ultima_atividade: new Date().toISOString(),
        total_atividades: 1
      }])
      .select();

    if (error) {
      // Se já existe, atualiza a última atividade e incrementa o contador
      if (error.code === '23505') { // Unique violation
        const { error: updateError } = await supabase
          .from('dias_ativos')
          .update({
            ultima_atividade: new Date().toISOString(),
            total_atividades: supabase.rpc('increment', { count: 1 })
          })
          .eq('user_id', user.id)
          .eq('data_ativo', hoje);
          
        if (updateError) {
          console.error('Erro ao atualizar dia ativo:', updateError);
        }
      } else {
        console.error('Erro ao registrar dia ativo:', error);
      }
    } else {
      console.log('Dia ativo registrado com sucesso:', data);
      lastActivityCheck = hoje;
    }
  } catch (error) {
    console.error('Erro ao registrar dia ativo:', error);
  }
}

// Busca estatísticas de dias ativos
export async function getDiasAtivosStats() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { diasAtivos: 0, streakAtual: 0, melhorStreak: 0 };
    }

    // Total de dias ativos
    const { data: diasAtivosData, error: diasAtivosError } = await supabase
      .from('dias_ativos')
      .select('data_ativo')
      .eq('user_id', user.id);

    if (diasAtivosError) {
      throw diasAtivosError;
    }

    // Streak atual usando a função do banco
    const { data: streakData, error: streakError } = await supabase
      .rpc('calcular_streak', { user_uuid: user.id });

    if (streakError) {
      console.error('Erro ao calcular streak:', streakError);
    }

    // Melhor streak (calculado simplesmente por enquanto)
    const streakAtual = streakData || 0;
    const melhorStreak = streakAtual; // TODO: Implementar lógica para encontrar melhor streak histórico

    return {
      diasAtivos: diasAtivosData?.length || 0,
      streakAtual: streakAtual,
      melhorStreak: melhorStreak
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas de dias ativos:', error);
    return { diasAtivos: 0, streakAtual: 0, melhorStreak: 0 };
  }
}
