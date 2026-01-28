import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface AudioUploaderProps {
  onUploadComplete: (url: string, type: 'audio' | 'image') => void;
  type: 'audio' | 'image';
  currentUrl?: string;
}

const AudioUploader: React.FC<AudioUploaderProps> = ({ onUploadComplete, type, currentUrl }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = type === 'audio' 
      ? ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg']
      : ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      alert(`Tipo de arquivo inválido. Use ${type === 'audio' ? 'MP3, WAV ou OGG' : 'JPG, PNG ou WebP'}`);
      return;
    }

    // Validar tamanho (máximo 50MB para áudio, 10MB para imagem)
    const maxSize = type === 'audio' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`Arquivo muito grande. Máximo: ${type === 'audio' ? '50MB' : '10MB'}`);
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Sanitizar nome do arquivo
      const sanitizedName = file.name
        .replace(/[^\w.-]/g, '_') // Substituir caracteres especiais por _
        .replace(/_{2,}/g, '_') // Remunderlin múltiplos
        .replace(/^_+|_+$/g, ''); // Remover underscores no início/fim
      
      const fileName = `${type}/${Date.now()}-${sanitizedName}`;
      
      const { data, error } = await supabase.storage
        .from('media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      console.log('Arquivo salvo em:', fileName);
      console.log('URL pública gerada:', publicUrl);
      
      // Verificar se a URL está acessível
      fetch(publicUrl)
        .then(response => {
          console.log('Teste de acesso à URL:', response.status);
          if (!response.ok) {
            console.warn('URL pode não estar pública:', publicUrl);
          }
        })
        .catch(error => {
          console.error('Erro ao testar URL:', error);
        });
      
      onUploadComplete(publicUrl, type);
      setProgress(100);
    } catch (error: any) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload: ' + error.message);
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept={type === 'audio' ? 'audio/*' : 'image/*'}
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id={`file-upload-${type}`}
        />
        <label
          htmlFor={`file-upload-${type}`}
          className="flex-1 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-green-700 transition-colors text-center"
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Enviando... {progress}%
              </span>
            </div>
          ) : (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="material-symbols-outlined text-2xl mb-1">
                {type === 'audio' ? 'upload_file' : 'image'}
              </span>
              <p>Clique para enviar {type === 'audio' ? 'um áudio' : 'uma imagem'}</p>
              <p className="text-xs mt-1">
                {type === 'audio' ? 'MP3, WAV, OGG (máx 50MB)' : 'JPG, PNG, WebP (máx 10MB)'}
              </p>
            </div>
          )}
        </label>
      </div>
      
      {currentUrl && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>URL atual:</p>
          <p className="break-all">{currentUrl}</p>
        </div>
      )}
    </div>
  );
};

export default AudioUploader;
