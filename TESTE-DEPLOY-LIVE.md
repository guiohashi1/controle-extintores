# 🚀 GUIA DE TESTE - DEPLOY LIVE

## 📱 URLs para testar:

### **Aplicação Principal:**
🔗 https://controle-extintores-pwa.netlify.app/

### **Página de Teste Admin:**
🔗 https://controle-extintores-pwa.netlify.app/teste-admin-integrado.html

### **Painel Admin (após login):**
🔗 https://controle-extintores-pwa.netlify.app/admin/

---

## 🧪 ROTEIRO DE TESTE COMPLETO

### **1. Teste o Sistema de Planos B2B**
1. Acesse: https://controle-extintores-pwa.netlify.app/
2. Registre um usuário novo (será Starter por padrão)
3. Vá em "Extintores" e tente cadastrar extintores
4. **Teste limite:** Tente cadastrar o 51º extintor → Modal de upgrade deve aparecer

### **2. Teste Login/Usuário Admin**
1. **PRIMEIRO:** Execute este SQL no Supabase:
   ```sql
   -- Copie e cole no SQL Editor do Supabase
   ALTER TABLE users ADD COLUMN IF NOT EXISTS admin BOOLEAN DEFAULT FALSE;
   
   INSERT INTO users (email, password_hash, name, plan, admin) 
   VALUES ('admin@teste.com', 'YWRtaW4xMjNzYWx0MTIz', 'Administrador', 'enterprise', TRUE)
   ON CONFLICT (email) DO UPDATE SET admin = TRUE, plan = 'enterprise';
   ```

2. **Depois teste o admin:**
   - Acesse: https://controle-extintores-pwa.netlify.app/teste-admin-integrado.html
   - Faça login com: **admin@teste.com** / **admin123**
   - Veja se botão admin aparece no navbar
   - Teste acesso ao painel admin

### **3. Teste Painel Admin**
1. Com usuário admin logado, acesse: https://controle-extintores-pwa.netlify.app/admin/
2. Teste todas as seções:
   - 📊 **Dashboard** - Estatísticas gerais
   - 👥 **Usuários** - Gestão de usuários
   - 🧯 **Extintores** - Controle de extintores
   - 🕐 **Sessões** - Sessões ativas
   - 📦 **Planos** - Configuração de planos
   - ⚙️ **Configurações** - Settings gerais

---

## ✅ CHECKLIST DE VALIDAÇÃO

### **Sistema B2B:**
- [ ] Novos usuários são Starter (50 extintores, 2 usuários)
- [ ] Limite 51º extintor bloqueia com modal de upgrade
- [ ] Modal tem link WhatsApp correto
- [ ] Planos Professional/Enterprise têm limites corretos

### **Admin Panel:**
- [ ] Login admin funciona
- [ ] Botão admin aparece só para admins
- [ ] Painel admin carrega em /admin/
- [ ] Todas as seções funcionam
- [ ] Dados são carregados corretamente

### **Deploy/Integração:**
- [ ] App principal funciona normalmente
- [ ] PWA continua funcionando
- [ ] Service Worker ativo
- [ ] Rotas /admin/ funcionam
- [ ] CSS/JS carregam corretamente

---

## 🔧 Se algo não funcionar:

### **Erro 404 no /admin/:**
- Verifique se `_redirects` foi deployado
- O Netlify pode demorar alguns minutos para processar

### **Botão admin não aparece:**
- Execute o SQL para criar usuário admin
- Faça logout/login
- Teste na página de teste: teste-admin-integrado.html

### **Modal de upgrade não aparece:**
- Verifique se há exatamente 50 extintores para o usuário
- Execute SQL: `sql/setup-completo-starter-50.sql` no Supabase

---

**🎯 RESULTADO ESPERADO:** 
Uma aplicação PWA completa + painel admin profissional funcionando em uma única URL!

**📞 Próximo passo:** 
Teste tudo e me diga como está funcionando!
