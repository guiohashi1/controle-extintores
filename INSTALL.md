# 🚀 INSTRUÇÕES DE INSTALAÇÃO

## 📋 Pré-requisitos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Conta no Supabase (gratuita)
- Editor de código (opcional)

## ⚡ Instalação Rápida (5 minutos)

### 1️⃣ **Configurar Supabase**
```bash
1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Faça login com GitHub/Google
4. Clique em "New Project"
5. Nome: controle-extintores
6. Senha: [crie uma senha forte]
7. Região: South America (São Paulo)
8. Clique em "Create new project"
```

### 2️⃣ **Configurar Banco de Dados**
```bash
1. No Supabase, vá em "SQL Editor"
2. Clique em "New query"
3. Copie todo conteúdo de sql/supabase-setup.sql
4. Cole no editor e clique "Run"
5. Aguarde "Success. No rows returned"
```

### 3️⃣ **Obter Chaves da API**
```bash
1. No Supabase, vá em "Settings" > "API"
2. Copie:
   - Project URL: https://xxx.supabase.co
   - anon/public key: eyJhbGciOiJIUzI1NiIs...
```

### 4️⃣ **Configurar Projeto**
```bash
1. Abra: js/supabase-config.js
2. Substitua:
   - url: 'sua-url-copiada'
   - anonKey: 'sua-chave-copiada'
3. Salve o arquivo
```

### 5️⃣ **Testar Aplicação**
```bash
1. Abra index.html no navegador
2. Login demo: demo@exemplo.com / 123456
3. Teste todas as funcionalidades
```

## ✅ Verificação da Instalação

### **Teste de Conexão**
Abra o console do navegador (F12) e digite:
```javascript
supabase.testConnection()
// Deve retornar: {success: true, message: "Conexão com Supabase OK!"}
```

### **Teste de Login**
```bash
1. Use: demo@exemplo.com / 123456
2. Deve carregar o dashboard
3. Status de sincronização deve aparecer
```

### **Teste de Cadastro**
```bash
1. Cadastre um extintor
2. No Supabase > Table Editor > extintores
3. Deve aparecer o extintor cadastrado
```

## 🆘 Problemas Comuns

### ❌ **"Failed to fetch"**
**Causa**: URL ou chave incorreta
**Solução**: Verifique js/supabase-config.js

### ❌ **"relation does not exist"**
**Causa**: SQL não foi executado
**Solução**: Execute novamente sql/supabase-setup.sql

### ❌ **"JWT malformed"**
**Causa**: Chave API incorreta
**Solução**: Copie novamente do Supabase

### ❌ **Página não carrega**
**Causa**: Arquivo JS não encontrado
**Solução**: Verifique caminho em index.html

## 🌟 Próximos Passos

### **Para Desenvolvimento**
```bash
1. Configure Git: git init
2. Primeiro commit: git add . && git commit -m "Initial commit"
3. Crie repositório no GitHub
4. Push: git remote add origin <url> && git push -u origin main
```

### **Para Produção**
```bash
1. Siga guia em docs/DEPLOY.md
2. Configure domínio próprio
3. Ative HTTPS
4. Configure monitoramento
```

### **Para Comercialização**
```bash
1. Configure sistema de pagamentos
2. Personalize marca e cores
3. Adicione termos de uso
4. Configure suporte ao cliente
```

## 📞 Suporte

- 📖 **Documentação**: Ver arquivos em docs/
- 🐛 **Bugs**: Abrir issue no GitHub
- 💬 **Dúvidas**: Contato via email

---

🎉 **Instalação concluída! Seu sistema está pronto para uso.**
