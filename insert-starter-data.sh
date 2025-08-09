#!/bin/bash
echo "🔥 INSERINDO 50 EXTINTORES NO MODO STARTER"
echo "==========================================="

# Verificar se o arquivo SQL existe
if [ ! -f "sql/insert-50-extintores-starter.sql" ]; then
    echo "❌ Arquivo SQL não encontrado!"
    exit 1
fi

echo "📋 Preparando dados de teste..."
echo "   - Usuário: starter@test-plans.com"
echo "   - Plano: Starter (limite 50 extintores)"
echo "   - Quantidade: Exatamente 50 extintores"

echo ""
echo "🚀 Para executar no Supabase:"
echo "1. Abra o Supabase Dashboard"
echo "2. Vá em SQL Editor"
echo "3. Cole o conteúdo do arquivo: sql/insert-50-extintores-starter.sql"
echo "4. Execute o script"

echo ""
echo "✅ Após executar, você pode testar:"
echo "   - Login: starter@test-plans.com"
echo "   - Senha: 123456"
echo "   - Tente criar o 51º extintor"
echo "   - Sistema deve bloquear com modal de upgrade"

echo ""
echo "📊 Ou use o painel de testes: http://localhost:8000/test-real.html"
