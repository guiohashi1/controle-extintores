/**
 * Sistema de Validação de Planos B2B - V2.0 ATUALIZADO
 * Controla limitações e funcionalidades por plano de assinatura
 */

console.log('🔥 PLAN VALIDATOR V2.0 CARREGADO - CACHE QUEBRADO!');

class PlanValidator {
    static PLANS = {
        starter: {
            name: 'Starter',
            price: 97,
            limits: {
                extintores: 50,
                users: 2,
                exports: ['pdf'],
                photos: false,
                reports: 'basic',
                api: false
            },
            features: [
                'Cadastro de até 50 extintores',
                'Até 2 usuários',
                'Relatórios básicos',
                'Exportação em PDF'
            ]
        },
        professional: {
            name: 'Professional',
            price: 197,
            limits: {
                extintores: 200,
                users: 10,
                exports: ['pdf', 'excel'],
                photos: true,
                reports: 'advanced',
                api: 'limited'
            },
            features: [
                'Cadastro de até 200 extintores',
                'Até 10 usuários',
                'Upload de fotos',
                'Relatórios avançados',
                'Exportação PDF + Excel',
                'API limitada'
            ]
        },
        enterprise: {
            name: 'Enterprise',
            price: 397,
            limits: {
                extintores: -1, // Ilimitado
                users: -1,      // Ilimitado
                exports: ['pdf', 'excel', 'csv', 'json'],
                photos: true,
                reports: 'premium',
                api: 'full'
            },
            features: [
                'Extintores ilimitados',
                'Usuários ilimitados',
                'Upload de fotos',
                'Relatórios premium',
                'Todas as exportações',
                'API completa',
                'Suporte prioritário'
            ]
        }
    };

    static currentUser = null;
    static currentPlan = null;

    /**
     * Inicializar o validador com dados do usuário
     */
    static initialize(user) {
        this.currentUser = user;
        this.currentPlan = user?.plan || 'starter';
        
        // 🔧 CORREÇÃO: Para usuários de teste, considerar plano sempre ativo
        // Em produção, você pode remover esta verificação especial
        if (user?.email === 'starter@test-plans.com' || user?.email === 'professional@test-plans.com' || user?.email === 'enterprise@test-plans.com') {
            console.log('🧪 Usuário de teste detectado - plano sempre ativo');
            return true;
        }
        
        // Verificar se o plano está ativo (apenas para usuários reais)
        if (user?.plan_status && user?.plan_status !== 'active') {
            this.showPlanExpiredModal();
            return false;
        }

        // Verificar se não está vencido (apenas para usuários reais)
        if (user?.plan_expires_at && new Date(user.plan_expires_at) < new Date()) {
            this.showPlanExpiredModal();
            return false;
        }

        return true;
    }

    /**
     * Verificar se pode criar um novo extintor
     */
    static async canCreateExtintor() {
        console.log('🔍 PlanValidator.canCreateExtintor() chamado');
        console.log('👤 Current user:', this.currentUser);
        console.log('📋 Current plan:', this.currentPlan);
        
        const planLimits = this.PLANS[this.currentPlan];
        if (!planLimits) {
            console.log('❌ Plano não encontrado:', this.currentPlan);
            return false;
        }

        console.log('📊 Plan limits:', planLimits);

        const limit = planLimits.limits.extintores;
        console.log('🔢 Limite de extintores:', limit);
        
        if (limit === -1) {
            console.log('✅ Plano ilimitado');
            return true; // Ilimitado
        }

        // Buscar contagem atual de extintores
        const currentCount = await this.getCurrentExtintorCount();
        console.log('📈 Contagem atual:', currentCount);
        console.log('⚖️ Comparação:', currentCount, '>=', limit, '?', currentCount >= limit);
        
        if (currentCount >= limit) {
            console.log('🚫 LIMITE ATINGIDO! Mostrando modal de upgrade');
            this.showUpgradeModal('extintores', currentCount, limit);
            return false;
        }

        console.log('✅ Pode criar extintor');
        return true;
    }

    /**
     * Verificar se pode usar fotos
     */
    static canUsePhotos() {
        const planLimits = this.PLANS[this.currentPlan];
        if (!planLimits || !planLimits.limits.photos) {
            this.showFeatureUpgradeModal('photos');
            return false;
        }
        return true;
    }

    /**
     * Verificar se pode exportar em determinado formato
     */
    static canExport(format) {
        const planLimits = this.PLANS[this.currentPlan];
        if (!planLimits || !planLimits.limits.exports.includes(format)) {
            this.showFeatureUpgradeModal('export', format);
            return false;
        }
        return true;
    }

    /**
     * Verificar se pode ter mais usuários simultâneos
     */
    static async canAddUser() {
        console.log('👥 PlanValidator.canAddUser() chamado');
        
        const planLimits = this.PLANS[this.currentPlan];
        if (!planLimits) {
            console.log('❌ Plano não encontrado:', this.currentPlan);
            return false;
        }

        const userLimit = planLimits.limits.users;
        console.log('🔢 Limite de usuários:', userLimit);
        
        if (userLimit === -1) {
            console.log('✅ Usuários ilimitados');
            return true; // Ilimitado
        }

        // Buscar contagem atual de sessões ativas
        const activeUsers = await this.getActiveUserCount();
        console.log('👤 Usuários ativos:', activeUsers);
        console.log('⚖️ Comparação:', activeUsers, '>=', userLimit, '?', activeUsers >= userLimit);
        
        if (activeUsers >= userLimit) {
            console.log('🚫 LIMITE DE USUÁRIOS ATINGIDO! Mostrando modal');
            this.showUpgradeModal('usuários simultâneos', activeUsers, userLimit);
            return false;
        }

        console.log('✅ Pode adicionar usuário');
        return true;
    }

    /**
     * Registrar nova sessão de usuário
     */
    static async registerUserSession() {
        if (!this.currentUser) return;

        try {
            console.log('📝 Registrando sessão do usuário...');
            
            // Criar/atualizar sessão no localStorage com timestamp
            const sessionData = {
                userId: this.currentUser.id,
                email: this.currentUser.email,
                plan: this.currentPlan,
                loginTime: new Date().toISOString(),
                lastActivity: new Date().toISOString(),
                sessionId: this.generateSessionId()
            };

            // Salvar sessão local
            sessionStorage.setItem('userSession', JSON.stringify(sessionData));
            localStorage.setItem(`session_${this.currentUser.id}`, JSON.stringify(sessionData));
            
            // Registrar no simulador de sessões globais (em produção seria no banco)
            this.updateGlobalSessions(sessionData);
            
            console.log('✅ Sessão registrada:', sessionData.sessionId);
            return sessionData.sessionId;
        } catch (error) {
            console.error('❌ Erro ao registrar sessão:', error);
        }
    }

    /**
     * Atualizar atividade da sessão
     */
    static updateUserActivity() {
        try {
            const sessionData = JSON.parse(sessionStorage.getItem('userSession'));
            if (sessionData) {
                sessionData.lastActivity = new Date().toISOString();
                sessionStorage.setItem('userSession', JSON.stringify(sessionData));
                localStorage.setItem(`session_${sessionData.userId}`, JSON.stringify(sessionData));
                this.updateGlobalSessions(sessionData);
            }
        } catch (error) {
            console.error('❌ Erro ao atualizar atividade:', error);
        }
    }

    /**
     * Contar usuários ativos
     */
    static async getActiveUserCount() {
        try {
            const globalSessions = JSON.parse(localStorage.getItem('globalSessions') || '{}');
            const now = new Date();
            let activeCount = 0;

            // Contar sessões ativas (últimos 30 minutos)
            for (const [sessionId, sessionData] of Object.entries(globalSessions)) {
                if (sessionData.userId === this.currentUser?.id) continue; // Não contar a própria sessão
                
                const lastActivity = new Date(sessionData.lastActivity);
                const diffMinutes = (now - lastActivity) / (1000 * 60);
                
                if (diffMinutes <= 30) { // Sessão ativa se atividade nos últimos 30min
                    activeCount++;
                }
            }

            // Incluir sessão atual
            activeCount++;
            
            console.log('📊 Total de sessões ativas encontradas:', activeCount);
            return activeCount;
        } catch (error) {
            console.error('❌ Erro ao contar usuários ativos:', error);
            return 1; // Contar pelo menos o usuário atual
        }
    }

    /**
     * Gerenciar sessões globais (simulador)
     */
    static updateGlobalSessions(sessionData) {
        try {
            const globalSessions = JSON.parse(localStorage.getItem('globalSessions') || '{}');
            globalSessions[sessionData.sessionId] = sessionData;
            
            // Limpar sessões antigas (mais de 1 hora inativas)
            const now = new Date();
            for (const [sessionId, session] of Object.entries(globalSessions)) {
                const lastActivity = new Date(session.lastActivity);
                const diffHours = (now - lastActivity) / (1000 * 60 * 60);
                
                if (diffHours > 1) {
                    delete globalSessions[sessionId];
                }
            }
            
            localStorage.setItem('globalSessions', JSON.stringify(globalSessions));
        } catch (error) {
            console.error('❌ Erro ao atualizar sessões globais:', error);
        }
    }

    /**
     * Gerar ID único para sessão
     */
    static generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Limpar sessão ao fazer logout
     */
    static clearUserSession() {
        try {
            const sessionData = JSON.parse(sessionStorage.getItem('userSession'));
            if (sessionData) {
                // Remover da sessão global
                const globalSessions = JSON.parse(localStorage.getItem('globalSessions') || '{}');
                delete globalSessions[sessionData.sessionId];
                localStorage.setItem('globalSessions', JSON.stringify(globalSessions));
                
                // Limpar sessões locais
                sessionStorage.removeItem('userSession');
                localStorage.removeItem(`session_${sessionData.userId}`);
                
                console.log('🧹 Sessão limpa:', sessionData.sessionId);
            }
        } catch (error) {
            console.error('❌ Erro ao limpar sessão:', error);
        }
    }

    /**
     * Obter contagem atual de extintores
     */
    static async getCurrentExtintorCount() {
        try {
            console.log('📊 Buscando contagem de extintores...');
            const result = await supabase.getExtintores();
            console.log('📊 Resultado do Supabase:', result);
            
            // O Supabase retorna um array direto, não um objeto {extintores: [...]}
            const count = Array.isArray(result) ? result.length : (result.extintores ? result.extintores.length : 0);
            console.log('🔢 Total de extintores encontrados:', count);
            
            return count;
        } catch (error) {
            console.error('❌ Erro ao buscar contagem de extintores:', error);
            return 0;
        }
    }

    /**
     * Obter informações do plano atual
     */
    static getCurrentPlanInfo() {
        return this.PLANS[this.currentPlan] || this.PLANS.starter;
    }

    /**
     * Mostrar modal de upgrade por limite atingido
     */
    static showUpgradeModal(type, current, limit) {
        const planInfo = this.getCurrentPlanInfo();
        const nextPlan = this.getNextPlan();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content plan-upgrade-modal">
                <div class="upgrade-icon">📈</div>
                <h3>Limite do Plano Atingido</h3>
                <p>Seu plano <strong>${planInfo.name}</strong> permite até <strong>${limit}</strong> ${type}.</p>
                <p>Atualmente você tem <strong>${current}</strong> ${type} cadastrados.</p>
                
                ${nextPlan ? `
                    <div class="upgrade-suggestion">
                        <h4>Faça upgrade para o plano ${nextPlan.name}</h4>
                        <ul>
                            ${nextPlan.features.map(feature => `<li>✅ ${feature}</li>`).join('')}
                        </ul>
                        <div class="upgrade-price">
                            Por apenas <strong>R$ ${nextPlan.price}/mês</strong>
                        </div>
                    </div>
                ` : ''}
                
                <div class="modal-actions">
                    <button onclick="PlanValidator.closeModal()" class="btn btn-secondary">
                        Continuar com Plano Atual
                    </button>
                    <button onclick="PlanValidator.contactUpgrade()" class="btn btn-primary">
                        📱 Falar com Vendas
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    }

    /**
     * Mostrar modal para funcionalidade não disponível
     */
    static showFeatureUpgradeModal(feature, format = null) {
        const planInfo = this.getCurrentPlanInfo();
        const nextPlan = this.getNextPlan();
        
        const featureNames = {
            photos: 'upload de fotos',
            export: `exportação em ${format?.toUpperCase() || 'outros formatos'}`
        };

        const featureName = featureNames[feature] || feature;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content plan-upgrade-modal">
                <div class="upgrade-icon">🔒</div>
                <h3>Funcionalidade Premium</h3>
                <p>A funcionalidade <strong>${featureName}</strong> não está disponível no seu plano atual.</p>
                
                ${nextPlan ? `
                    <div class="upgrade-suggestion">
                        <h4>Disponível no plano ${nextPlan.name}</h4>
                        <div class="upgrade-price">
                            Por apenas <strong>R$ ${nextPlan.price}/mês</strong>
                        </div>
                    </div>
                ` : ''}
                
                <div class="modal-actions">
                    <button onclick="PlanValidator.closeModal()" class="btn btn-secondary">
                        Entendi
                    </button>
                    <button onclick="PlanValidator.contactUpgrade()" class="btn btn-primary">
                        Fazer Upgrade
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    }

    /**
     * Mostrar modal de plano vencido
     */
    static showPlanExpiredModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content plan-upgrade-modal">
                <div class="upgrade-icon">⚠️</div>
                <h3>Plano Vencido</h3>
                <p>Seu plano de assinatura está <strong>vencido</strong> ou foi <strong>cancelado</strong>.</p>
                <p>Entre em contato conosco para renovar e continuar usando o sistema.</p>
                
                <div class="modal-actions">
                    <button onclick="PlanValidator.logout()" class="btn btn-secondary">
                        Sair
                    </button>
                    <button onclick="PlanValidator.contactUpgrade()" class="btn btn-primary">
                        Renovar Plano
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    }

    /**
     * Obter próximo plano disponível
     */
    static getNextPlan() {
        const planOrder = ['starter', 'professional', 'enterprise'];
        const currentIndex = planOrder.indexOf(this.currentPlan);
        
        if (currentIndex < planOrder.length - 1) {
            const nextPlanKey = planOrder[currentIndex + 1];
            return this.PLANS[nextPlanKey];
        }
        
        return null;
    }

    /**
     * Fechar modal
     */
    static closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }

    /**
     * Redirecionar para contato comercial
     */
    static contactUpgrade() {
        const message = encodeURIComponent(`Olá! Gostaria de fazer upgrade do meu plano atual (${this.getCurrentPlanInfo().name}) para ter acesso a mais funcionalidades.`);
        window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
        this.closeModal();
    }

    /**
     * Fazer logout
     */
    static logout() {
        // Limpar sessão de usuários antes do logout
        this.clearUserSession();
        
        sessionStorage.removeItem('currentUser');
        window.location.href = '../index.html';
    }

    /**
     * Verificar status do plano periodicamente
     */
    static startPlanMonitoring() {
        // Verificar a cada 5 minutos
        setInterval(() => {
            if (this.currentUser?.plan_expires_at) {
                const expiryDate = new Date(this.currentUser.plan_expires_at);
                const now = new Date();
                
                if (expiryDate < now) {
                    this.showPlanExpiredModal();
                }
            }
        }, 5 * 60 * 1000);
    }

    /**
     * Atualizar informações do usuário
     */
    static updateUserPlan(user) {
        this.currentUser = user;
        this.currentPlan = user?.plan || 'starter';
        
        // Salvar no sessionStorage
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    }
}

// Inicializar automaticamente se há usuário logado
document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
        const initialized = PlanValidator.initialize(currentUser);
        if (initialized) {
            // Registrar sessão do usuário
            await PlanValidator.registerUserSession();
            
            // Iniciar monitoramento
            PlanValidator.startPlanMonitoring();
            
            // Atualizar atividade a cada 5 minutos
            setInterval(() => {
                PlanValidator.updateUserActivity();
            }, 5 * 60 * 1000);
            
            // Verificar limite de usuários periodicamente
            setInterval(async () => {
                const canContinue = await PlanValidator.canAddUser();
                if (!canContinue) {
                    console.log('🚫 Limite de usuários excedido - forçando logout');
                    setTimeout(() => PlanValidator.logout(), 3000);
                }
            }, 10 * 60 * 1000); // Verificar a cada 10 minutos
        }
    }
});
