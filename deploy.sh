#!/bin/bash

# Script para deploy rápido do Controle de Extintores

echo "🚀 Deploy do Controle de Extintores"
echo "=================================="

# Verificar se o Git está inicializado
if [ ! -d ".git" ]; then
    echo "📁 Inicializando Git..."
    git init
    git add .
    git commit -m "Initial commit - Controle de Extintores"
    
    echo "🔗 Para continuar:"
    echo "1. Crie um repositório no GitHub"
    echo "2. Execute: git remote add origin https://github.com/SEU_USUARIO/controle-extintores.git"
    echo "3. Execute: git push -u origin main"
    echo ""
    echo "4. Depois acesse Netlify.com e conecte seu repositório"
else
    echo "✅ Git já inicializado"
    
    echo "📤 Fazendo push das alterações..."
    git add .
    git commit -m "Update: $(date)"
    git push
    
    echo "✅ Código atualizado no GitHub!"
    echo "🌐 Deploy automático será feito pelo Netlify/Vercel"
fi

echo ""
echo "🎯 Próximos passos para colocar no ar:"
echo "1. Netlify.com → New site from Git → Conectar GitHub"
echo "2. Ou Vercel.com → New Project → Import GitHub"
echo "3. Deploy automático será feito!"
echo ""
echo "🔗 URLs úteis:"
echo "- Netlify: https://netlify.com"
echo "- Vercel: https://vercel.com"
echo "- GitHub: https://github.com"
