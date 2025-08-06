# Deploy no Netlify

## Passo a passo:

### 1. Preparar o projeto
```bash
# Criar arquivo netlify.toml (opcional, mas recomendado)
```

### 2. Deploy via Drag & Drop
- Acesse: https://netlify.com
- Arraste a pasta do projeto para o deploy
- Netlify gera URL automática

### 3. Deploy via Git (melhor opção)
- Conecte seu repositório GitHub
- Build settings:
  - Build command: (deixar vazio)
  - Publish directory: . (raiz)
- Deploy automático a cada commit

### 4. Configurar domínio personalizado (opcional)
- Site settings > Domain management
- Add custom domain

## Vantagens:
✅ Gratuito (100GB/mês)
✅ Deploy automático
✅ SSL automático
✅ CDN global
✅ Formulários funcionam
✅ Redirects e headers customizados
✅ Branch previews

## Configurações importantes:
- Redirects para SPA (se necessário)
- Environment variables para Supabase
