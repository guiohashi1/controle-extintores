# Deploy no GitHub Pages

## Passo a passo:

### 1. Criar repositório no GitHub
```bash
# No diretório do projeto
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/controle-extintores.git
git push -u origin main
```

### 2. Ativar GitHub Pages
- Vá em Settings > Pages
- Source: Deploy from a branch
- Branch: main / (root)
- Save

### 3. Acessar o app
- URL: https://SEU_USUARIO.github.io/controle-extintores/

## Vantagens:
✅ Gratuito
✅ Simples de configurar
✅ SSL automático
✅ CDN global

## Limitações:
❌ Apenas arquivos estáticos
❌ Sem backend próprio (mas funciona com Supabase)
