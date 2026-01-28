// Script para verificar e corrigir áudios com URLs quebradas
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bqiklofbfiatcdpenpyy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxaWtsb2ZiZmlhdGNkcGVucHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NDgxOTcsImV4cCI6MjA4NDUyNDE5N30._dNpdz9UjPijmx0QumORBYRxvUHcErFtdQ4KiFkpm6s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUploadedAudios() {
  console.log('=== VERIFICANDO ÁUDIOS COM URLS QUEBRADAS ===');
  
  // 1. Buscar todos os áudios
  const { data: audios, error } = await supabase
    .from('audios')
    .select('*');
    
  if (error) {
    console.error('Erro ao buscar áudios:', error);
    return;
  }
  
  console.log('Total de áudios:', audios?.length);
  
  // 2. Verificar cada áudio
  for (const audio of audios) {
    console.log(`\n--- Verificando áudio: ${audio.title} ---`);
    console.log('URL da imagem:', audio.image_url);
    console.log('URL do áudio:', audio.audio_url);
    
    // Testar imagem
    if (audio.image_url) {
      try {
        const imgResponse = await fetch(audio.image_url, { method: 'HEAD' });
        console.log('Status da imagem:', imgResponse.status);
        if (!imgResponse.ok) {
          console.warn('❌ Imagem não está acessível');
        } else {
          console.log('✅ Imagem OK');
        }
      } catch (e) {
        console.error('❌ Erro ao testar imagem:', e.message);
      }
    }
    
    // Testar áudio
    if (audio.audio_url) {
      try {
        const audioResponse = await fetch(audio.audio_url, { method: 'HEAD' });
        console.log('Status do áudio:', audioResponse.status);
        if (!audioResponse.ok) {
          console.warn('❌ Áudio não está acessível');
        } else {
          console.log('✅ Áudio OK');
        }
      } catch (e) {
        console.error('❌ Erro ao testar áudio:', e.message);
      }
    }
  }
  
  // 3. Verificar arquivos no storage
  console.log('\n=== VERIFICANDO STORAGE ===');
  const { data: files } = await supabase.storage
    .from('media')
    .list();
    
  console.log('Arquivos no storage:', files);
  
  // 4. Gerar URLs públicas para os arquivos
  if (files && files.length > 0) {
    for (const file of files) {
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(file.name);
      
      console.log(`Arquivo: ${file.name}`);
      console.log(`URL pública: ${publicUrl}`);
    }
  }
}

fixUploadedAudios();
