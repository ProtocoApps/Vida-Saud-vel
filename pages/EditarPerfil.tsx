import React, { useState, useEffect } from 'react';
import { AppScreen } from '../types';
import { supabase } from '../lib/supabase';

interface EditarPerfilProps {
  onNavigate: (screen: AppScreen) => void;
}

const EditarPerfil: React.FC<EditarPerfilProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatar_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Obter dados do auth
      const nameFromMetadata = user.user_metadata?.name || '';
      const email = user.email || '';

      // Obter dados da tabela users
      const { data: userData } = await supabase
        .from('users')
        .select('avatar_url, phone')
        .eq('id', user.id)
        .single();

      setFormData({
        name: nameFromMetadata,
        phone: userData?.phone || '',
        avatar_url: userData?.avatar_url || ''
      });

      if (userData?.avatar_url) {
        setPreviewAvatar(userData.avatar_url);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Fazer upload para o Supabase Storage
      const fileName = `avatars/${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setFormData(prev => ({
        ...prev,
        avatar_url: publicUrl
      }));

      setPreviewAvatar(publicUrl);
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      alert('Erro ao fazer upload da imagem. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Atualizar metadados do auth
      const { error: authError } = await supabase.auth.updateUser({
        data: { name: formData.name }
      });

      if (authError) {
        throw authError;
      }

      // Atualizar ou inserir dados na tabela users
      const { error: userError } = await supabase
        .from('users')
        .upsert([{
          id: user.id,
          name: formData.name,
          phone: formData.phone,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString()
        }]);

      if (userError) {
        throw userError;
      }

      alert('Perfil atualizado com sucesso!');
      onNavigate(AppScreen.PERFIL);
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-light dark:bg-neutral-dark">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-neutral-light/80 dark:bg-neutral-dark/80 backdrop-blur-md z-10">
        <button onClick={() => onNavigate(AppScreen.PERFIL)} className="size-10 flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="font-serif text-lg font-bold dark:text-white">Editar Perfil</h2>
        <div className="size-10" />
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {previewAvatar ? (
                <div className="size-24 rounded-full border-4 border-gold-500 shadow-xl overflow-hidden">
                  <img src={previewAvatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="size-24 rounded-full border-4 border-gold-500 shadow-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-3xl">
                    {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              )}
              <label className="absolute bottom-0 right-0 size-8 bg-primary text-white rounded-full border-2 border-white dark:border-neutral-dark flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                <span className="material-symbols-outlined text-sm">camera_alt</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {uploading ? 'Enviando...' : 'Toque para alterar a foto'}
            </p>
          </div>

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Seu nome"
              required
            />
          </div>

          {/* Email (somente leitura) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={supabase.auth.getUser().then(user => user.data.user?.email || '')}
              className="w-full p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-white/5 text-sm text-gray-500 dark:text-gray-400"
              placeholder="Email"
              disabled
              readOnly
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">O email não pode ser alterado</p>
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Telefone (opcional)
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="(00) 00000-0000"
            />
          </div>

          {/* Botões */}
          <div className="space-y-3 pt-4">
            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 text-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </button>
            
            <button
              type="button"
              onClick={() => onNavigate(AppScreen.PERFIL)}
              className="w-full h-14 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 font-bold rounded-2xl flex items-center justify-center text-lg active:scale-95 transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditarPerfil;
