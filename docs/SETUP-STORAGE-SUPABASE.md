# 🛠️ CONFIGURAÇÃO DO SUPABASE STORAGE - PASSO A PASSO

## 📋 **ETAPA 1: EXECUTAR SQL**

1. **Abra o SQL Editor** do Supabase
2. **Cole e execute** o conteúdo do arquivo: `sql/setup-photos-simple.sql`
3. **Verifique** se as colunas foram criadas (query no final do arquivo)

---

## 📁 **ETAPA 2: CRIAR BUCKET DE STORAGE**

### **2.1 - Acessar Storage**
1. No painel do Supabase, vá em **Storage** (barra lateral)
2. Clique na aba **Buckets**
3. Clique no botão **"New bucket"**

### **2.2 - Configurar Bucket**
Preencha os dados:
```
🔧 CONFIGURAÇÕES DO BUCKET:
- Bucket name: extintor-photos
- Public bucket: ✅ HABILITADO
- File size limit: 10485760 (10MB)
- Allowed MIME types: 
  - image/jpeg
  - image/png  
  - image/gif
  - image/webp
```

### **2.3 - Salvar**
- Clique em **"Create bucket"**
- Confirme se aparece na lista com status **Public**

---

## 🔐 **ETAPA 3: CONFIGURAR POLÍTICAS (RLS)**

### **3.1 - Acessar Políticas**
1. Ainda no **Storage**, clique na aba **"Policies"**
2. Localize o bucket **"extintor-photos"**
3. Clique no ícone de **configurações (⚙️)** do bucket

### **3.2 - Habilitar Políticas**
Configure as permissões:

#### **👁️ SELECT (Visualização) - PÚBLICO**
```
✅ Habilitado para: public
📝 Descrição: Permitir visualização pública das fotos
```

#### **📤 INSERT (Upload) - USUÁRIOS AUTENTICADOS**
```
✅ Habilitado para: authenticated
📝 Descrição: Permitir upload para usuários logados
```

#### **✏️ UPDATE (Atualização) - USUÁRIOS AUTENTICADOS**
```
✅ Habilitado para: authenticated  
📝 Descrição: Permitir atualização de fotos
```

#### **🗑️ DELETE (Exclusão) - USUÁRIOS AUTENTICADOS**
```
✅ Habilitado para: authenticated
📝 Descrição: Permitir exclusão de fotos
```

---

## ✅ **ETAPA 4: VERIFICAÇÃO**

### **4.1 - Testar Criação de Bucket**
1. Vá em **Storage > Buckets**
2. Confirme que **"extintor-photos"** aparece na lista
3. Status deve mostrar **"Public"**

### **4.2 - Testar Upload (Opcional)**
1. Clique no bucket **"extintor-photos"**
2. Clique em **"Upload file"**
3. Envie uma imagem de teste
4. Confirme que aparece na lista

### **4.3 - Testar URL Pública**
1. Clique na imagem enviada
2. Copie a **"Public URL"**
3. Cole em nova aba do navegador
4. Imagem deve abrir normalmente

---

## 🧪 **ETAPA 5: TESTAR NO APLICATIVO**

1. **Abra a página de teste**: http://localhost:8000/pages/test-plans.html
2. **Mude para plano Professional** (botão na página)
3. **Teste upload de foto** na seção correspondente
4. **Verifique no Storage** se o arquivo foi criado

---

## 🚨 **PROBLEMAS COMUNS**

### **❌ Erro 403 (Forbidden)**
- Verifique se o bucket está marcado como **Public**
- Confirme as políticas de **SELECT** para **public**

### **❌ Upload não funciona**
- Verifique política de **INSERT** para **authenticated**
- Confirme limite de tamanho (10MB)
- Verifique tipos MIME permitidos

### **❌ Bucket não aparece**
- Aguarde alguns segundos após criação
- Atualize a página
- Verifique se não há erro de sintaxe no nome

---

## ✅ **CONFIGURAÇÃO CONCLUÍDA**

Após seguir todos os passos:

✅ Banco de dados atualizado com colunas de foto  
✅ Bucket de storage criado e configurado  
✅ Políticas de segurança habilitadas  
✅ Sistema pronto para upload de fotos  

**🚀 Agora você pode usar a funcionalidade de fotos no aplicativo!**

---

## 📞 **SUPORTE**

Se tiver problemas:
1. Verifique os logs do navegador (F12 > Console)
2. Confirme todas as configurações acima
3. Teste com imagem pequena (< 1MB) primeiro
4. Consulte documentação: https://supabase.com/docs/guides/storage
