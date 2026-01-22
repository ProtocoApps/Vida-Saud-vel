# 🔧 CRIAR TABELA USERS NO SUPABASE

## ❌ Problema Identificado
O cadastro está salvando apenas na **autenticação** do Supabase, mas não na **tabela users**. Isso significa que os dados (nome, telefone, gênero) não ficam salvos no banco de dados.

## ✅ Solução

### Passo 1: Executar Script SQL
1. Acesse seu projeto no Supabase: https://app.supabase.com
2. Vá para **Database** > **SQL Editor**
3. Clique em **New Query**
4. Copie e cole todo o conteúdo do arquivo `criar-tabela-users.sql`
5. Clique em **Run** (ou pressione Ctrl+Enter)

### Passo 2: Verificar se funcionou
Após executar o script, você deve ver:
- ✅ Mensagem de sucesso
- ✅ A tabela `users` criada na seção **Tables**

### Passo 3: Testar o Cadastro
1. Reinicie o servidor: `npm run dev`
2. Acesse: http://localhost:3001
3. Faça um novo cadastro
4. Verifique no Supabase se os dados foram salvos na tabela `users`

## 📋 Estrutura da Tabela Users

A tabela terá estas colunas:
- `id` (UUID) - Vinculado ao usuário da autenticação
- `name` (TEXT) - Nome completo
- `email` (TEXT) - Email (único)
- `phone` (TEXT) - Telefone (opcional)
- `gender` (TEXT) - Gênero
- `created_at` (TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP) - Última atualização

## 🔒 Segurança
- **Row Level Security (RLS)** habilitado
- Usuários só podem ver/editar seus próprios dados
- Políticas de segurança configuradas

## 🚨 Importante
Execute o script SQL **antes** de testar o cadastro novamente!

---
**Após executar o script, o cadastro vai salvar corretamente na tabela users!** ✅