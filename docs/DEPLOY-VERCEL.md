# Deploy no Vercel

## Passo a passo:

### 1. Instalar Vercel CLI (opcional)
```bash
npm i -g vercel
```

### 2. Deploy via Web Interface
- Acesse: https://vercel.com
- Import Git Repository
- Conecte seu GitHub
- Deploy automático

### 3. Deploy via CLI
```bash
# No diretório do projeto
vercel
# Seguir instruções
```

## Vantagens:
✅ Gratuito (100GB/mês)
✅ Deploy em segundos
✅ SSL automático
✅ CDN global ultra-rápida
✅ Edge Functions
✅ Analytics incluído

## Configuração vercel.json (opcional):
```json
{
  "buildCommand": null,
  "outputDirectory": ".",
  "framework": null
}
```
