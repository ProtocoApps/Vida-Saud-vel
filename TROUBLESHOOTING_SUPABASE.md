# Solução de Problemas - Cadastro Supabase

## Erro 400 ao cadastrar

Se você está recebendo erro 400 ao tentar cadastrar, verifique as seguintes configurações no Supabase:

### 1. Verificar Configurações de Autenticação

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Vá em **Authentication** > **Settings**
4. Verifique as seguintes configurações:

#### Email Confirmation
- Se estiver **habilitado**: O usuário precisa confirmar o email antes de fazer login
- Se estiver **desabilitado**: O usuário pode fazer login imediatamente após cadastro

#### Password Requirements
- Verifique se a senha atende aos requisitos mínimos
- Por padrão, o Supabase aceita senhas com 6+ caracteres

### 2. Verificar URL e Chaves

Certifique-se de que as credenciais estão corretas no arquivo `lib/supabase.ts`:

```typescript
const supabaseUrl = 'https://bqiklofbfiatcdpenpyy.supabase.co';
const supabaseAnonKey = 'sua-chave-anon-aqui';
```

### 3. Verificar Console do Navegador

Abra o Console do navegador (F12) e verifique:
- Mensagens de erro detalhadas
- Requisições HTTP na aba Network
- O erro específico retornado pelo Supabase

### 4. Testar com dados simples

Tente cadastrar com:
- Email válido (ex: teste@teste.com)
- Senha com pelo menos 6 caracteres
- Nome preenchido
- Gênero selecionado

### 5. Verificar se o email já existe

O erro 400 pode ocorrer se o email já estiver cadastrado. Tente com um email diferente.

### 6. Desabilitar temporariamente Email Confirmation (para testes)

1. No Supabase Dashboard: **Authentication** > **Settings**
2. Desabilite **"Enable email confirmations"**
3. Salve as alterações
4. Tente cadastrar novamente

### 7. Verificar RLS (Row Level Security)

Se você criou tabelas customizadas, verifique se as políticas RLS estão configuradas corretamente.

## Mensagens de Erro Comuns

- **"User already registered"**: Email já cadastrado
- **"Password should be at least 6 characters"**: Senha muito curta
- **"Invalid email"**: Formato de email inválido
- **"Email rate limit exceeded"**: Muitas tentativas de cadastro

## Suporte

Se o problema persistir, verifique os logs no Console do navegador e compartilhe a mensagem de erro completa.
