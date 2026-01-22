<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
   
   **Importante:** Instale também a dependência do Supabase:
   `npm install @supabase/supabase-js`

2. Configure as variáveis de ambiente no arquivo `.env.local`:
   - `GEMINI_API_KEY`: Sua chave da API Gemini
   - `VITE_SUPABASE_URL`: URL do seu projeto Supabase (ex: https://xxxxx.supabase.co)
   - `VITE_SUPABASE_ANON_KEY`: Chave pública (anon key) do Supabase
   
   Você pode encontrar essas informações em: https://app.supabase.com/project/_/settings/api

3. Run the app:
   `npm run dev`

## Configuração do Supabase

Para usar as funcionalidades de login e cadastro:

1. Acesse https://app.supabase.com e faça login
2. Vá em Settings > API
3. Copie a **URL** do projeto (formato: https://xxxxx.supabase.co)
4. Copie a **anon/public key** (chave pública)
5. Adicione essas informações no arquivo `.env.local`:
   ```
   VITE_SUPABASE_URL=https://seu-projeto-id.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-publica-aqui
   ```
