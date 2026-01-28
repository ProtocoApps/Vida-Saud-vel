// Script para debug dos áudios no Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'SUA_URL_SUPABASE';
const supabaseKey = 'SUA_CHAVE_ANONIMA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAudios() {
  console.log('=== DEBUG DE ÁUDIOS ===');
  
  // 1. Verificar todos os áudios
  const { data: allAudios, error: allError } = await supabase
    .from('audios')
    .select('*');
    
  if (allError) {
    console.error('Erro ao buscar áudios:', allError);
    return;
  }
  
  console.log('Total de áudios:', allAudios?.length);
  console.log('Áudios:', allAudios);
  
  // 2. Verificar apenas áudios ativos
  const { data: activeAudios, error: activeError } = await supabase
    .from('audios')
    .select('*')
    .eq('is_active', true);
    
  if (activeError) {
    console.error('Erro ao buscar áudios ativos:', activeError);
    return;
  }
  
  console.log('Áudios ativos:', activeAudios?.length);
  console.log('Áudios ativos:', activeAudios);
  
  // 3. Verificar storage
  const { data: storageFiles } = await supabase.storage
    .from('media')
    .list();
    
  console.log('Arquivos no storage:', storageFiles);
}

debugAudios();
