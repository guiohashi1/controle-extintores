# 🚀 CONFIGURAÇÃO DO SUPABASE - GUIA PASSO A PASSO

## 📋 PRÉ-REQUISITOS
- Conta no Supabase (gratuita)
- Navegador web
- Arquivos do projeto já criados

## 🎯 PASSO 1: CRIAR PROJETO NO SUPABASE

1. **Acesse**: https://supabase.com
2. **Clique em**: "Start your project"
3. **Faça login** com GitHub ou Google
4. **Clique em**: "New Project"
5. **Preencha os dados**:
   ```
   Name: controle-extintores
   Database Password: [crie uma senha forte - anote ela!]
   Region: South America (São Paulo) - mais próximo do Brasil
   ```
6. **Clique em**: "Create new project"
7. **Aguarde**: ~2-3 minutos para o projeto ser criado

## 🗄️ PASSO 2: CONFIGURAR BANCO DE DADOS

1. **No painel do Supabase**, clique em **"SQL Editor"** (ícone </> no menu lateral)
2. **Clique em**: "New query"
3. **Copie e cole** todo o conteúdo do arquivo `supabase-setup.sql`
4. **Clique em**: "Run" (botão play ▶️)
5. **Aguarde**: Deve aparecer "Success. No rows returned"

## 🔑 PASSO 3: OBTER CHAVES DE API

1. **No painel do Supabase**, clique em **"Settings"** (ícone ⚙️)
2. **Clique em**: "API"
3. **Copie os seguintes valores**:

   **Project URL**:
   ```
   https://[seu-projeto-id].supabase.co
   ```

   **anon/public key** (chave longa que começa com "eyJhbGciOiJIUzI1NiIs..."):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
   ```

## ⚙️ PASSO 4: CONFIGURAR O PROJETO

1. **Abra o arquivo**: `supabase-config.js`
2. **Substitua as seguintes linhas**:

   **ANTES**:
   ```javascript
   const SUPABASE_CONFIG = {
     url: 'https://SEU-PROJETO.supabase.co',
     anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
   };
   ```

   **DEPOIS** (com seus valores reais):
   ```javascript
   const SUPABASE_CONFIG = {
     url: 'https://xkpqmxrnzjqrjxqzxkpq.supabase.co', // Cole sua URL aqui
     anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...', // Cole sua chave aqui
   };
   ```

3. **Salve o arquivo**

## 🧪 PASSO 5: TESTAR A CONFIGURAÇÃO

1. **Abra o arquivo**: `index.html` no navegador
2. **Abra o Console do navegador** (F12 → Console)
3. **Digite e execute**:
   ```javascript
   supabase.testConnection()
   ```
4. **Deve retornar**:
   ```javascript
   {success: true, message: "Conexão com Supabase OK!"}
   ```

## 👤 PASSO 6: TESTAR AUTENTICAÇÃO

### Usuário Demo (já criado no banco):
- **Email**: `demo@exemplo.com`
- **Senha**: `123456`

### Criar novo usuário:
1. Clique em "Cadastre-se"
2. Preencha os dados
3. O usuário será criado automaticamente no Supabase

## ✅ PASSO 7: VERIFICAR FUNCIONAMENTO

### Funções que agora usam Supabase:

1. **Login/Logout**: ✅ Conectado ao banco real
2. **Registro**: ✅ Cria usuários no Supabase
3. **Extintores**: ✅ Salvos na nuvem (usuários premium)
4. **Sincronização**: ✅ Dados compartilhados entre dispositivos

### Como verificar se está funcionando:

1. **Faça login** com demo@exemplo.com
2. **Cadastre um extintor**
3. **No Supabase**, vá em "Table Editor" → "extintores"
4. **Deve aparecer** o extintor cadastrado

## 🔧 SOLUÇÃO DE PROBLEMAS

### ❌ Erro: "Failed to fetch"
- Verifique se a URL está correta
- Verifique se a chave API está correta
- Certifique-se de que o projeto Supabase está ativo

### ❌ Erro: "JWT malformed"
- A chave API está incorreta
- Copie novamente do painel Supabase

### ❌ Erro: "relation does not exist"
- O SQL não foi executado corretamente
- Execute novamente todo o conteúdo de `supabase-setup.sql`

### ❌ Erro: "RLS violation"
- As políticas de segurança estão ativas
- Isso é normal - significa que a segurança está funcionando

## 💡 PRÓXIMOS PASSOS

1. **Produção**: Configure um domínio próprio
2. **Emails**: Configure SMTP para reset de senha
3. **Pagamentos**: Integre Stripe/Mercado Pago para assinaturas
4. **Mobile**: Transforme em PWA para instalar no celular

## 📊 MONITORAMENTO

### No Supabase Dashboard você pode:
- Ver quantos usuários se cadastraram
- Monitorar uso do banco de dados
- Ver logs de erros
- Configurar backups automáticos

---

🎉 **Parabéns!** Seu app agora tem um backend real e profissional!
