# 🧪 Guia de Teste - Sistema de Controle de Usuários

## 📋 Pré-requisitos

1. **Usuário de teste configurado:** starter@test-plans.com
2. **Plano:** Starter (limite: 2 usuários simultâneos)
3. **Sistema ativo:** Plan Validator v2.0 com controle de usuários

## 🚀 Como Executar os Testes

### Teste 1: Verificar Limite Normal
1. Abra `test-user-control.html` no navegador
2. Faça login com `starter@test-plans.com`
3. Verifique as informações na seção "Status Atual"
4. Deve mostrar: **Usuários Ativos: 1** e **Limite: 2**

### Teste 2: Simular Segundo Usuário
1. Na mesma página, clique em **"Simular Novo Usuário"**
2. Observe o contador subir para: **Usuários Ativos: 2**
3. Status deve mostrar que chegou ao limite

### Teste 3: Testar Bloqueio (Teste Principal)
1. Abra **nova aba/janela** com a mesma página
2. Tente fazer login novamente com o mesmo usuário
3. **Resultado esperado:** Modal de upgrade deve aparecer
4. Usuário deve ser bloqueado de acessar o sistema

### Teste 4: Verificar Sessões Ativas
1. Clique em **"Ver Sessões Ativas"**
2. Deve listar todos os usuários conectados
3. Mostra tempo desde última atividade

### Teste 5: Reset Completo
1. Clique em **"Limpar Todas as Sessões"**
2. Contadores voltam para zero
3. Sistema permite novos logins

## 🔍 Comportamentos Esperados

### ✅ Plano Starter (2 usuários)
- **1º usuário:** Login normal ✅
- **2º usuário:** Login normal ✅  
- **3º usuário:** Bloqueado com modal ❌

### ✅ Plano Professional (10 usuários)
- Permite até 10 usuários simultâneos
- 11º usuário é bloqueado

### ✅ Plano Enterprise
- Usuários ilimitados
- Nunca bloqueia por limite de usuários

## 🛠️ Resolução de Problemas

### Problema: Modal não aparece
**Solução:** Limpar cache do navegador (Ctrl + F5)

### Problema: Contadores incorretos
**Solução:** Clicar em "Limpar Todas as Sessões"

### Problema: Sessões não expiram
**Verificar:** Sistema limpa sessões inativas após 30 minutos

## 📊 Monitoramento em Tempo Real

A página de teste atualiza automaticamente:
- **Status:** A cada 5 segundos
- **Atividade:** A cada 5 minutos (background)
- **Limpeza:** A cada 10 minutos (sessões expiradas)

## 🔄 Cenários de Teste Avançados

### Teste Multi-Dispositivo
1. Abra em computador + celular
2. Faça login simultâneo
3. Teste limite real entre dispositivos

### Teste de Expiração
1. Deixe uma aba inativa por 30+ minutos
2. Sessão deve expirar automaticamente
3. Permite novos logins

### Teste de Concorrência
1. Tente login simultâneo em múltiplas abas
2. Sistema deve coordenar corretamente
3. Não deve permitir "corrida" de logins

## 📈 Métricas de Sucesso

- ✅ Limite respeitado em 100% dos casos
- ✅ Modal de upgrade aparece instantaneamente
- ✅ Contadores precisos em tempo real
- ✅ Sessões limpas automaticamente
- ✅ Performance sem impacto perceptível

## 🚨 Alertas Importantes

1. **Cache:** Sempre use Ctrl + F5 após mudanças
2. **LocalStorage:** Compartilhado entre abas do mesmo domínio
3. **Sessões:** Limpeza automática essencial para produção
4. **Planos:** Mudança de plano requer recarga da página

## 📞 Próximos Passos

Após validar o controle de usuários, implementar:
1. **Controle de fotos** por plano
2. **Controle de exports** (PDF/Excel)
3. **Controle de API** (integrações)
4. **Controle de armazenamento** de dados
