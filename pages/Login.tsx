import React, { useState } from 'react';
import { AppScreen } from '../types';
import { useGlobalUser } from '../contexts/GlobalUserContext';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { setUserData } = useGlobalUser();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setSuccess('Login realizado com sucesso!');
        setUserData(data.user);
        setTimeout(() => {
          onLogin();
        }, 500);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validações antes de enviar
    if (!name.trim()) {
      setError('Por favor, preencha seu nome completo.');
      setLoading(false);
      return;
    }

    if (!email.trim()) {
      setError('Por favor, preencha seu email.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }

    if (!gender) {
      setError('Por favor, selecione seu gênero.');
      setLoading(false);
      return;
    }

    try {
      // Limpar formatação do telefone antes de enviar (apenas números)
      const phoneNumbers = phone.replace(/\D/g, '');

      // Preparar dados do usuário
      const userMetadata: any = {
        name: name.trim(),
        gender: gender,
      };

      // Adicionar telefone apenas se preenchido
      if (phoneNumbers) {
        userMetadata.phone = phoneNumbers;
      }

      console.log('Tentando cadastrar:', { email: email.trim(), hasPassword: !!password, metadata: userMetadata });

      // Criar usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password,
        options: {
          data: userMetadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('Erro completo do Supabase:', error);
        console.error('Status:', error.status);
        console.error('Mensagem:', error.message);
        
        // Mensagens de erro mais amigáveis baseadas no código de erro
        let errorMessage = 'Erro ao criar conta. ';
        
        if (error.status === 400) {
          if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
            errorMessage = 'Este email já está cadastrado. Tente fazer login ou use outro email.';
          } else if (error.message?.includes('Password') || error.message?.includes('password')) {
            errorMessage = 'A senha não atende aos requisitos. Use pelo menos 6 caracteres.';
          } else if (error.message?.includes('email') || error.message?.includes('Email')) {
            errorMessage = 'Email inválido. Verifique o formato do email (ex: nome@exemplo.com).';
          } else if (error.message?.includes('rate limit')) {
            errorMessage = 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
          } else {
            errorMessage = `Erro: ${error.message || 'Dados inválidos. Verifique todos os campos.'}`;
          }
        } else {
          errorMessage = error.message || 'Erro ao criar conta. Tente novamente.';
        }
        
        setError(errorMessage);
        setLoading(false);
        return;
      }

      if (data.user) {
        try {
          // Após criar o usuário na autenticação, salvar na tabela users
          const { error: insertError } = await supabase
            .from('users')
            .insert([
              {
                id: data.user.id, // ID do usuário da autenticação
                name: name.trim(),
                email: email.trim().toLowerCase(),
                phone: phoneNumbers || null,
                gender: gender,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            ]);

          if (insertError) {
            console.error('Erro ao salvar na tabela users:', insertError);
            // Não interrompe o fluxo, apenas loga o erro
            console.warn('Usuário criado na autenticação, mas falhou ao salvar na tabela users');
          } else {
            console.log('✅ Usuário salvo com sucesso na tabela users');
          }
        } catch (dbError) {
          console.error('Erro inesperado ao salvar na tabela users:', dbError);
          // Continua o fluxo mesmo com erro na tabela
        }

        // Verificar se já tem sessão (usuário autenticado imediatamente)
        if (data.session) {
          // Usuário autenticado automaticamente (email confirmation desabilitado)
          setSuccess('Conta criada com sucesso! Redirecionando...');
          setUserData(data.user);
          setTimeout(() => {
            onLogin(); // Redireciona para Home
          }, 500);
        } else {
          // Usuário precisa confirmar email - fazer login automático mesmo assim
          setSuccess('Conta criada! Fazendo login...');
          setUserData(data.user);
          setTimeout(() => {
            onLogin(); // Redireciona para Home
          }, 500);
        }
      } else {
        setError('Não foi possível criar a conta. Tente novamente.');
      }
    } catch (err: any) {
      console.error('Erro ao cadastrar:', err);
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setSuccess(null);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setGender('');
  };

  // Função para formatar o telefone
  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Formata conforme o tamanho
    if (numbers.length <= 10) {
      // Formato: (00) 0000-0000
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, (match, p1, p2, p3) => {
        if (p3) return `(${p1}) ${p2}-${p3}`;
        if (p2) return `(${p1}) ${p2}`;
        if (p1) return `(${p1}`;
        return numbers;
      });
    } else {
      // Formato: (00) 00000-0000
      return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, (match, p1, p2, p3) => {
        if (p3) return `(${p1}) ${p2}-${p3}`;
        if (p2) return `(${p1}) ${p2}`;
        if (p1) return `(${p1}`;
        return numbers;
      });
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-light dark:bg-neutral-dark p-6 justify-between relative overflow-hidden">
      {/* Background blurs */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl -z-10" />

      <header className="pt-12 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-primary/5 border border-gold-500/20 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-gold-500 text-5xl filled-icon">spa</span>
        </div>
        <h2 className="text-primary dark:text-white text-4xl font-bold italic font-serif tracking-tight">Vida Alinhada</h2>
        <div className="w-12 h-0.5 bg-gold-500 mt-4" />
      </header>

      <div className="bg-white dark:bg-white/5 rounded-[40px] p-8 ios-shadow border border-gray-50 dark:border-white/5 mt-8">
        <h1 className="text-2xl font-bold text-center mb-10 dark:text-white">
          {isSignUp ? 'Crie sua conta' : 'Conecte-se ao seu equilíbrio'}
        </h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <p className="text-green-600 dark:text-green-400 text-sm text-center">{success}</p>
          </div>
        )}

        <form onSubmit={(e) => {
          e.preventDefault();
          if (isSignUp) {
            handleSignUp(e);
          } else {
            handleLogin(e);
          }
        }}>
          <div className="space-y-6">
            {isSignUp && (
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Nome Completo</label>
                <input 
                  type="text" 
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isSignUp}
                  className="w-full h-14 bg-gray-50 dark:bg-white/5 border-none rounded-2xl px-5 text-gray-800 dark:text-white placeholder:text-gray-400 focus:ring-1 focus:ring-gold-500 transition-all"
                />
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">E-mail</label>
              <input 
                type="email" 
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-14 bg-gray-50 dark:bg-white/5 border-none rounded-2xl px-5 text-gray-800 dark:text-white placeholder:text-gray-400 focus:ring-1 focus:ring-gold-500 transition-all"
              />
            </div>

            {isSignUp && (
              <>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Número de Telefone</label>
                  <input 
                    type="tel" 
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={handlePhoneChange}
                    required={isSignUp}
                    maxLength={15}
                    className="w-full h-14 bg-gray-50 dark:bg-white/5 border-none rounded-2xl px-5 text-gray-800 dark:text-white placeholder:text-gray-400 focus:ring-1 focus:ring-gold-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Gênero</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    required={isSignUp}
                    className="w-full h-14 bg-gray-50 dark:bg-white/5 border-none rounded-2xl px-5 text-gray-800 dark:text-white focus:ring-1 focus:ring-gold-500 transition-all"
                  >
                    <option value="">Selecione seu gênero</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="nao-binario">Não-binário</option>
                    <option value="prefiro-nao-informar">Prefiro não informar</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Senha</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full h-14 bg-gray-50 dark:bg-white/5 border-none rounded-2xl px-5 text-gray-800 dark:text-white placeholder:text-gray-400 focus:ring-1 focus:ring-gold-500 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {!isSignUp && (
                <button 
                  type="button"
                  className="text-primary dark:text-gold-500 text-[10px] font-bold uppercase tracking-wider mt-3 block w-full text-right"
                >
                  Esqueceu a senha?
                </button>
              )}
            </div>
          </div>

          <div className="mt-10 space-y-4">
            <button 
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:bg-burgundy-900 active:scale-95 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Carregando...' : isSignUp ? 'Criar conta' : 'Entrar'}
            </button>
            <button 
              type="button"
              onClick={toggleMode}
              className="w-full h-14 bg-transparent border-2 border-gold-500 text-gold-500 font-bold rounded-2xl hover:bg-gold-50 transition-all text-lg"
            >
              {isSignUp ? 'Já tenho uma conta' : 'Criar conta'}
            </button>
          </div>
        </form>
      </div>

      <footer className="pt-8 pb-4 text-center">
        <p className="text-gray-400 text-[9px] uppercase tracking-[0.3em] mb-6">Corpo, emoções e consciência em equilíbrio</p>
        <div className="flex justify-center gap-8 text-gold-500/40">
          <span className="material-symbols-outlined">ecg_heart</span>
          <span className="material-symbols-outlined">self_improvement</span>
          <span className="material-symbols-outlined">psychology</span>
        </div>
      </footer>
    </div>
  );
};

export default Login;
