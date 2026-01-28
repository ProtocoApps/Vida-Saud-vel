import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import AudioUploader from './AudioUploader';

interface AddAudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAudioAdded: () => void;
}

const AddAudioModal: React.FC<AddAudioModalProps> = ({ isOpen, onClose, onAudioAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    category: 'EMOÇÕES',
    description: '',
    audioUrl: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useUrlInput, setUseUrlInput] = useState({
    audio: true,
    image: true
  });
  const [useTestUrls, setUseTestUrls] = useState(false);

  const categories = ['EMOÇÕES', 'CORPO', 'CONSTÂNCIA', 'PROFECIAS'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('audios')
        .insert([{
          title: formData.title,
          duration: formData.duration,
          category: formData.category,
          description: formData.description,
          audio_url: formData.audioUrl,
          image_url: formData.imageUrl
        }]);

      if (error) {
        throw error;
      }

      setFormData({
        title: '',
        duration: '',
        category: 'EMOÇÕES',
        description: '',
        audioUrl: '',
        imageUrl: ''
      });
      
      onAudioAdded();
      onClose();
    } catch (error: any) {
      setError('Erro ao adicionar áudio: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUploadComplete = (url: string, type: 'audio' | 'image') => {
    setFormData({
      ...formData,
      [type === 'audio' ? 'audioUrl' : 'imageUrl']: url
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-dark rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold dark:text-white">Adicionar Novo Áudio</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseTestUrls(!useTestUrls)}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                useTestUrls 
                  ? 'bg-blue-700 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              URLs Teste
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent dark:bg-neutral-light dark:text-white"
              placeholder="Ex: Meditação para Ansiedade"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Duração *
            </label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent dark:bg-neutral-light dark:text-white"
              placeholder="Ex: 15 min"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoria *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent dark:bg-neutral-light dark:text-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent dark:bg-neutral-light dark:text-white"
              placeholder="Descrição do áudio..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL do Áudio *
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUseUrlInput({...useUrlInput, audio: true})}
                  className={`flex-1 px-3 py-1 text-sm rounded-lg transition-colors ${
                    useUrlInput.audio 
                      ? 'bg-green-700 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Usar URL
                </button>
                <button
                  type="button"
                  onClick={() => setUseUrlInput({...useUrlInput, audio: false})}
                  className={`flex-1 px-3 py-1 text-sm rounded-lg transition-colors ${
                    !useUrlInput.audio 
                      ? 'bg-green-700 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Fazer Upload
                </button>
              </div>
              
              {useUrlInput.audio ? (
                <input
                  type="url"
                  name="audioUrl"
                  value={useTestUrls ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' : formData.audioUrl}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent dark:bg-neutral-light dark:text-white"
                  placeholder={useTestUrls ? "URL de teste preenchida" : "https://exemplo.com/audio.mp3"}
                  disabled={useTestUrls}
                />
              ) : (
                <AudioUploader
                  onUploadComplete={handleUploadComplete}
                  type="audio"
                  currentUrl={formData.audioUrl}
                />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {useUrlInput.audio 
                ? "Dica: Você pode usar links do SoundCloud, YouTube (convertido para MP3), ou outros serviços"
                : "Envie um arquivo MP3, WAV ou OGG diretamente do seu dispositivo"
              }
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL da Imagem *
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUseUrlInput({...useUrlInput, image: true})}
                  className={`flex-1 px-3 py-1 text-sm rounded-lg transition-colors ${
                    useUrlInput.image 
                      ? 'bg-green-700 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Usar URL
                </button>
                <button
                  type="button"
                  onClick={() => setUseUrlInput({...useUrlInput, image: false})}
                  className={`flex-1 px-3 py-1 text-sm rounded-lg transition-colors ${
                    !useUrlInput.image 
                      ? 'bg-green-700 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Fazer Upload
                </button>
              </div>
              
              {useUrlInput.image ? (
                <input
                  type="url"
                  name="imageUrl"
                  value={useTestUrls ? 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=200' : formData.imageUrl}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent dark:bg-neutral-light dark:text-white"
                  placeholder={useTestUrls ? "URL de teste preenchida" : "https://exemplo.com/imagem.jpg"}
                  disabled={useTestUrls}
                />
              ) : (
                <AudioUploader
                  onUploadComplete={handleUploadComplete}
                  type="image"
                  currentUrl={formData.imageUrl}
                />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {useUrlInput.image 
                ? "Dica: Use Unsplash, Pexels ou outras imagens gratuitas. Recomendado: 200x200px"
                : "Envie uma imagem JPG, PNG ou WebP do seu dispositivo"
              }
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-light transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adicionando...' : 'Adicionar Áudio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAudioModal;
