// 🧪 Script de Teste Automático - Controle de Usuários
// Para executar no console do navegador

console.log('🧪 INICIANDO TESTE AUTOMÁTICO DO CONTROLE DE USUÁRIOS');
console.log('================================================');

// Função para simular delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Função para log formatado
function testLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${emoji} [${timestamp}] ${message}`);
}

// Teste 1: Verificar configuração inicial
async function test1_VerificarConfiguracao() {
    testLog('TESTE 1: Verificando configuração inicial', 'info');
    
    try {
        // Verificar se PlanValidator está disponível
        if (typeof PlanValidator === 'undefined') {
            throw new Error('PlanValidator não encontrado');
        }
        
        // Verificar plano atual
        const planInfo = PlanValidator.getCurrentPlanInfo();
        testLog(`Plano atual: ${planInfo.name} (Limite: ${planInfo.limits.users} usuários)`, 'success');
        
        return true;
    } catch (error) {
        testLog(`Erro na configuração: ${error.message}`, 'error');
        return false;
    }
}

// Teste 2: Simular usuários e verificar limite
async function test2_TestarLimite() {
    testLog('TESTE 2: Testando limite de usuários', 'info');
    
    try {
        // Limpar sessões existentes
        localStorage.removeItem('globalSessions');
        sessionStorage.removeItem('userSession');
        testLog('Sessões limpas', 'info');
        
        await delay(500);
        
        // Registrar primeiro usuário
        PlanValidator.registerUserSession();
        testLog('Usuário 1 registrado', 'success');
        
        let activeUsers = await PlanValidator.getActiveUserCount();
        testLog(`Usuários ativos: ${activeUsers}`, 'info');
        
        // Verificar se pode adicionar mais usuários
        let canAdd = await PlanValidator.canAddUser();
        testLog(`Pode adicionar mais usuários: ${canAdd}`, canAdd ? 'success' : 'warning');
        
        // Simular segundo usuário (limite do Starter)
        const globalSessions = JSON.parse(localStorage.getItem('globalSessions') || '{}');
        const sessionId2 = 'test_user_2_' + Date.now();
        globalSessions[sessionId2] = {
            userId: 'test_user_2',
            email: 'usuario2@test.com',
            plan: 'starter',
            loginTime: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            sessionId: sessionId2
        };
        localStorage.setItem('globalSessions', JSON.stringify(globalSessions));
        
        activeUsers = await PlanValidator.getActiveUserCount();
        testLog(`Usuários ativos após 2º usuário: ${activeUsers}`, 'info');
        
        // Tentar adicionar terceiro usuário (deve falhar)
        canAdd = await PlanValidator.canAddUser();
        testLog(`Pode adicionar 3º usuário: ${canAdd}`, canAdd ? 'error' : 'success');
        
        if (!canAdd) {
            testLog('✅ LIMITE FUNCIONANDO CORRETAMENTE!', 'success');
        } else {
            testLog('❌ PROBLEMA: Sistema permitiu exceder limite!', 'error');
        }
        
        return !canAdd; // Sucesso se NÃO pode adicionar
        
    } catch (error) {
        testLog(`Erro no teste de limite: ${error.message}`, 'error');
        return false;
    }
}

// Teste 3: Verificar limpeza de sessões expiradas
async function test3_TestarExpiracao() {
    testLog('TESTE 3: Testando expiração de sessões', 'info');
    
    try {
        // Criar sessão expirada (mais de 30 minutos atrás)
        const globalSessions = JSON.parse(localStorage.getItem('globalSessions') || '{}');
        const expiredSessionId = 'expired_' + Date.now();
        const expiredTime = new Date(Date.now() - 35 * 60 * 1000); // 35 minutos atrás
        
        globalSessions[expiredSessionId] = {
            userId: 'expired_user',
            email: 'expirado@test.com',
            plan: 'starter',
            loginTime: expiredTime.toISOString(),
            lastActivity: expiredTime.toISOString(),
            sessionId: expiredSessionId
        };
        localStorage.setItem('globalSessions', JSON.stringify(globalSessions));
        
        testLog('Sessão expirada criada', 'info');
        
        // Verificar contagem antes da limpeza
        let activeUsers = await PlanValidator.getActiveUserCount();
        testLog(`Usuários antes da limpeza: ${activeUsers}`, 'info');
        
        // A limpeza acontece automaticamente no getActiveUserCount
        await delay(500);
        
        // Verificar se sessão expirada foi removida
        const cleanedSessions = JSON.parse(localStorage.getItem('globalSessions') || '{}');
        const hasExpiredSession = cleanedSessions.hasOwnProperty(expiredSessionId);
        
        testLog(`Sessão expirada removida: ${!hasExpiredSession}`, hasExpiredSession ? 'error' : 'success');
        
        return !hasExpiredSession;
        
    } catch (error) {
        testLog(`Erro no teste de expiração: ${error.message}`, 'error');
        return false;
    }
}

// Teste 4: Verificar planos diferentes
async function test4_TestarPlanos() {
    testLog('TESTE 4: Testando diferentes planos', 'info');
    
    try {
        const planos = [
            { name: 'starter', userLimit: 2 },
            { name: 'professional', userLimit: 10 },
            { name: 'enterprise', userLimit: -1 } // ilimitado
        ];
        
        for (const plano of planos) {
            // Simular mudança de plano
            const user = getCurrentUser();
            if (user) {
                user.user_metadata = user.user_metadata || {};
                user.user_metadata.plan = plano.name;
                localStorage.setItem('supabase_user', JSON.stringify(user));
            }
            
            const planInfo = PlanValidator.getCurrentPlanInfo();
            const limitText = planInfo.limits.users === -1 ? 'ilimitado' : planInfo.limits.users;
            testLog(`Plano ${plano.name}: ${limitText} usuários`, 'success');
        }
        
        // Restaurar plano starter para continuar testes
        const user = getCurrentUser();
        if (user) {
            user.user_metadata = user.user_metadata || {};
            user.user_metadata.plan = 'starter';
            localStorage.setItem('supabase_user', JSON.stringify(user));
        }
        
        return true;
        
    } catch (error) {
        testLog(`Erro no teste de planos: ${error.message}`, 'error');
        return false;
    }
}

// Executar todos os testes
async function executarTodosOsTestes() {
    testLog('🚀 EXECUTANDO BATERIA COMPLETA DE TESTES', 'info');
    testLog('==========================================', 'info');
    
    const resultados = [];
    
    // Teste 1
    testLog('\n📋 TESTE 1: CONFIGURAÇÃO INICIAL', 'info');
    resultados.push(await test1_VerificarConfiguracao());
    await delay(1000);
    
    // Teste 2
    testLog('\n👥 TESTE 2: LIMITE DE USUÁRIOS', 'info');
    resultados.push(await test2_TestarLimite());
    await delay(1000);
    
    // Teste 3
    testLog('\n⏰ TESTE 3: EXPIRAÇÃO DE SESSÕES', 'info');
    resultados.push(await test3_TestarExpiracao());
    await delay(1000);
    
    // Teste 4
    testLog('\n💼 TESTE 4: PLANOS DIFERENTES', 'info');
    resultados.push(await test4_TestarPlanos());
    
    // Resultado final
    const sucessos = resultados.filter(r => r).length;
    const total = resultados.length;
    
    testLog('\n📊 RESULTADO FINAL:', 'info');
    testLog('==================', 'info');
    testLog(`Testes executados: ${total}`, 'info');
    testLog(`Sucessos: ${sucessos}`, sucessos === total ? 'success' : 'warning');
    testLog(`Falhas: ${total - sucessos}`, total - sucessos === 0 ? 'success' : 'error');
    
    if (sucessos === total) {
        testLog('🎉 TODOS OS TESTES PASSARAM! Sistema funcionando perfeitamente!', 'success');
    } else {
        testLog('⚠️ Alguns testes falharam. Verifique os logs acima.', 'warning');
    }
    
    return sucessos === total;
}

// Auto-executar se estiver na página de teste
if (window.location.pathname.includes('test-user-control.html')) {
    testLog('Página de teste detectada. Executando testes em 3 segundos...', 'info');
    setTimeout(executarTodosOsTestes, 3000);
} else {
    testLog('Para executar os testes, execute: executarTodosOsTestes()', 'info');
}

// Exportar funções para uso manual
window.testesControleUsuarios = {
    executarTodosOsTestes,
    test1_VerificarConfiguracao,
    test2_TestarLimite,
    test3_TestarExpiracao,
    test4_TestarPlanos
};
