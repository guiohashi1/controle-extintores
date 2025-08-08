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
                api: false,
                backup: false,
                alerts: 'basic',
                dashboard: 'basic'
            },
            features: [
                'Cadastro de até 50 extintores',
                'Até 2 usuários',
                'Relatórios básicos',
                'Exportação em PDF',
                'Alertas básicos',
                'Dashboard básico'
            ],
            restrictions: [
                'Sem upload de fotos',
                'Sem backup automático',
                'Sem API',
                'Sem relatórios avançados'
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
                api: 'limited',
                backup: true,
                alerts: 'advanced',
                dashboard: 'advanced'
            },
            features: [
                'Cadastro de até 200 extintores',
                'Até 10 usuários',
                'Upload de fotos',
                'Relatórios avançados',
                'Exportação PDF + Excel',
                'API limitada',
                'Backup automático',
                'Alertas avançados',
                'Dashboard avançado'
            ],
            restrictions: [
                'API com limitações de requisições'
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
                api: 'full',
                backup: true,
                alerts: 'premium',
                dashboard: 'premium'
            },
            features: [
                'Extintores ilimitados',
                'Usuários ilimitados',
                'Upload de fotos',
                'Relatórios premium',
                'Todas as exportações',
                'API completa',
                'Backup automático',
                'Alertas premium',
                'Dashboard premium',
                'Suporte prioritário'
            ],
            restrictions: []
        }
    };

    static currentUser = null;
    static currentPlan = null;

    /**
     * Mostrar modal de upgrade com informações específicas da funcionalidade
     */
    static showFeatureUpgradeModal(feature, featureName, requiredPlan = 'Professional') {
        const modal = document.createElement('div');
        modal.className = 'plan-upgrade-modal';
        modal.innerHTML = `
            <div class="plan-upgrade-content">
                <div class="plan-upgrade-header">
                    <i class="fas fa-star-of-life" style="color: #e74c3c;"></i>
                    <h3>Recurso Premium</h3>
                </div>
                <div class="plan-upgrade-body">
                    <p><strong>${featureName}</strong> está disponível apenas nos planos ${requiredPlan}+</p>
                    <div class="current-vs-required">
                        <div class="current-plan">
                            <span class="plan-label">Seu Plano Atual</span>
                            <span class="plan-name">${this.PLANS[this.currentPlan]?.name || 'Starter'}</span>
                        </div>
                        <div class="upgrade-arrow">→</div>
                        <div class="required-plan">
                            <span class="plan-label">Plano Necessário</span>
                            <span class="plan-name">${requiredPlan}</span>
                        </div>
                    </div>
                    <div class="feature-benefits">
                        <h4>Com o upgrade você também ganha:</h4>
                        <ul id="upgrade-benefits-list">
                            <!-- Será preenchido dinamicamente -->
                        </ul>
                    </div>
                </div>
                <div class="plan-upgrade-actions">
                    <button class="btn-cancel" onclick="this.closest('.plan-upgrade-modal').remove()">
                        Cancelar
                    </button>
                    <button class="btn-upgrade" onclick="PlanValidator.redirectToUpgrade('${requiredPlan.toLowerCase()}')">
                        Fazer Upgrade
                    </button>
                </div>
            </div>
        `;

        // Adicionar benefícios específicos do plano
        this.populateUpgradeBenefits(modal, requiredPlan.toLowerCase());
        
        document.body.appendChild(modal);
        
        // Adicionar estilos se não existirem
        this.addUpgradeModalStyles();
    }

    /**
     * Preencher benefícios do upgrade
     */
    static populateUpgradeBenefits(modal, targetPlan) {
        const benefitsList = modal.querySelector('#upgrade-benefits-list');
        const planData = this.PLANS[targetPlan];
        
        if (planData && planData.features) {
            planData.features.forEach(feature => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fas fa-check" style="color: #27ae60; margin-right: 8px;"></i>${feature}`;
                benefitsList.appendChild(li);
            });
        }
    }

    /**
     * Redirecionar para página de upgrade
     */
    static redirectToUpgrade(planType) {
        // Remove o modal
        document.querySelector('.plan-upgrade-modal')?.remove();
        
        // Redireciona para página de planos ou abre modal de contato
        if (confirm('Deseja ser redirecionado para nossa página de planos?')) {
            window.open('https://seusite.com/planos', '_blank');
        }
    }

    /**
     * Adicionar estilos para o modal de upgrade
     */
    static addUpgradeModalStyles() {
        if (document.getElementById('plan-upgrade-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'plan-upgrade-styles';
        styles.textContent = `
            .plan-upgrade-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(3px);
            }
            .plan-upgrade-content {
                background: white;
                border-radius: 12px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                animation: modalSlideIn 0.3s ease-out;
            }
            @keyframes modalSlideIn {
                from { opacity: 0; transform: translateY(-50px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .plan-upgrade-header {
                padding: 24px;
                text-align: center;
                border-bottom: 1px solid #eee;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 12px 12px 0 0;
            }
            .plan-upgrade-header i {
                font-size: 32px;
                margin-bottom: 12px;
                color: #ffd700 !important;
            }
            .plan-upgrade-header h3 {
                margin: 0;
                font-size: 22px;
                font-weight: 600;
            }
            .plan-upgrade-body {
                padding: 24px;
            }
            .current-vs-required {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin: 20px 0;
                padding: 16px;
                background: #f8f9fa;
                border-radius: 8px;
            }
            .current-plan, .required-plan {
                text-align: center;
                flex: 1;
            }
            .plan-label {
                display: block;
                font-size: 12px;
                color: #666;
                text-transform: uppercase;
                margin-bottom: 4px;
            }
            .plan-name {
                display: block;
                font-weight: bold;
                font-size: 16px;
                color: #2c3e50;
            }
            .upgrade-arrow {
                font-size: 24px;
                color: #3498db;
                margin: 0 16px;
            }
            .feature-benefits h4 {
                color: #2c3e50;
                margin: 20px 0 12px 0;
                font-size: 16px;
            }
            .feature-benefits ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            .feature-benefits li {
                padding: 6px 0;
                color: #555;
            }
            .plan-upgrade-actions {
                padding: 20px 24px;
                border-top: 1px solid #eee;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }
            .plan-upgrade-actions button {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .btn-cancel {
                background: #f8f9fa;
                color: #6c757d;
                border: 1px solid #dee2e6;
            }
            .btn-cancel:hover {
                background: #e9ecef;
            }
            .btn-upgrade {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            .btn-upgrade:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }
        `;
        document.head.appendChild(styles);
    }
    static initialize(user) {
        this.currentUser = user;
        
        console.log('🔧 INITIALIZE - DADOS RECEBIDOS:', {
            userObject: user,
            userEmail: user?.email,
            userPlan: user?.plan,
            userSubscription: user?.subscription,
            allUserProps: Object.keys(user || {})
        });
        
        // 🔧 NORMALIZAR NOME DO PLANO - Corrigir inconsistências
        let planName = user?.plan || user?.subscription || 'starter';
        
        console.log('🔧 PLANO ANTES DA NORMALIZAÇÃO:', planName);
        
        // Converter nomes alternativos para padrão
        const planNormalization = {
            'basic': 'starter',
            'basico': 'starter',
            'profissional': 'professional',
            'prof': 'professional',
            'empresarial': 'enterprise',
            'empresa': 'enterprise',
            'premium': 'enterprise'
        };
        
        // Normalizar para minúsculo
        planName = planName.toLowerCase();
        
        // Aplicar normalização se necessário
        if (planNormalization[planName]) {
            planName = planNormalization[planName];
        }
        
        this.currentPlan = planName;
        
        console.log('🔧 PLANO NORMALIZADO:', {
            original: user?.plan || user?.subscription,
            normalizado: this.currentPlan,
            planDataExists: !!this.PLANS[this.currentPlan]
        });
        
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
        
        console.log('📸 VALIDAÇÃO DE FOTOS DETALHADA:', {
            currentPlan: this.currentPlan,
            currentUser: this.currentUser?.email,
            planExists: !!planLimits,
            photosAllowed: planLimits?.limits?.photos,
            allPlans: Object.keys(this.PLANS),
            planLimitsObj: planLimits?.limits,
            fullPlanData: planLimits
        });
        
        if (!planLimits) {
            console.log('❌ PLANO NÃO ENCONTRADO:', this.currentPlan);
            console.log('❌ Planos disponíveis:', Object.keys(this.PLANS));
            this.showFeatureUpgradeModal('photos', 'Upload de Fotos', 'Professional');
            return false;
        }
        
        if (!planLimits.limits || !planLimits.limits.photos) {
            console.log('❌ FOTOS BLOQUEADAS para plano:', this.currentPlan);
            console.log('❌ Limite de fotos encontrado:', planLimits.limits?.photos);
            this.showFeatureUpgradeModal('photos', 'Upload de Fotos', 'Professional');
            return false;
        }
        
        console.log('✅ FOTOS PERMITIDAS para plano:', this.currentPlan);
        return true;
    }

    /**
     * Verificar se pode fazer backup automático
     */
    static canUseBackup() {
        const planLimits = this.PLANS[this.currentPlan];
        if (!planLimits || !planLimits.limits.backup) {
            this.showFeatureUpgradeModal('backup', 'Backup Automático', 'Professional');
            return false;
        }
        return true;
    }

    /**
     * Verificar se pode usar exportações avançadas
     */
    static canExport(format) {
        const planLimits = this.PLANS[this.currentPlan];
        if (!planLimits || !planLimits.limits.exports.includes(format)) {
            this.showFeatureUpgradeModal('export', `Exportação ${format.toUpperCase()}`, 
                format === 'excel' ? 'Professional' : 'Enterprise');
            return false;
        }
        return true;
    }

    /**
     * Verificar se pode usar relatórios avançados
     */
    static canUseAdvancedReports() {
        const planLimits = this.PLANS[this.currentPlan];
        const reportLevel = planLimits?.limits.reports || 'basic';
        
        if (reportLevel === 'basic') {
            this.showFeatureUpgradeModal('reports', 'Relatórios Avançados', 'Professional');
            return false;
        }
        return true;
    }

    /**
     * Verificar se pode usar dashboard avançado
     */
    static canUseAdvancedDashboard() {
        const planLimits = this.PLANS[this.currentPlan];
        const dashboardLevel = planLimits?.limits.dashboard || 'basic';
        
        if (dashboardLevel === 'basic') {
            this.showFeatureUpgradeModal('dashboard', 'Dashboard Avançado', 'Professional');
            return false;
        }
        return true;
    }

    /**
     * Verificar se pode usar API
     */
    static canUseAPI() {
        const planLimits = this.PLANS[this.currentPlan];
        if (!planLimits || !planLimits.limits.api) {
            this.showFeatureUpgradeModal('api', 'Acesso à API', 'Professional');
            return false;
        }
        return true;
    }

    /**
     * Verificar se pode usar alertas avançados
     */
    static canUseAdvancedAlerts() {
        const planLimits = this.PLANS[this.currentPlan];
        const alertLevel = planLimits?.limits.alerts || 'basic';
        
        if (alertLevel === 'basic') {
            this.showFeatureUpgradeModal('alerts', 'Alertas Avançados', 'Professional');
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
     * Validar e configurar elementos da UI baseado no plano
     */
    static validateUIElements() {
        console.log('🎨 Validando elementos da UI para plano:', this.currentPlan);
        
        // Validar elementos de foto
        this.validatePhotoElements();
        
        // Validar elementos de exportação
        this.validateExportElements();
        
        // Validar elementos de backup
        this.validateBackupElements();
        
        // Validar elementos de relatórios
        this.validateReportElements();
        
        // Validar elementos de API
        this.validateAPIElements();
        
        // Adicionar badges de plano onde necessário
        this.addPlanBadges();
    }

    /**
     * Validar elementos relacionados a fotos
     */
    static validatePhotoElements() {
        const photoElements = document.querySelectorAll('[data-feature="photos"], .photo-upload, #photo-upload, .upload-photo');
        const canUsePhotos = this.PLANS[this.currentPlan]?.limits.photos;
        
        console.log('🎨 VALIDANDO ELEMENTOS DE FOTO:', {
            elementsFound: photoElements.length,
            canUsePhotos: canUsePhotos,
            currentPlan: this.currentPlan
        });
        
        photoElements.forEach((element, index) => {
            console.log(`📸 Elemento ${index + 1}:`, {
                classList: Array.from(element.classList),
                tagName: element.tagName,
                canUsePhotos: canUsePhotos
            });
            
            if (!canUsePhotos) {
                this.disableElement(element, 'Disponível nos planos Professional+');
                element.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showFeatureUpgradeModal('photos', 'Upload de Fotos', 'Professional');
                });
            } else {
                console.log('✅ HABILITANDO elemento de foto:', element.className);
                this.enableElement(element);
            }
        });
    }

    /**
     * Validar elementos de exportação
     */
    static validateExportElements() {
        const exportButtons = document.querySelectorAll('[data-export], .export-btn');
        
        exportButtons.forEach(button => {
            const format = button.dataset.export || button.dataset.format;
            if (format) {
                const canExport = this.PLANS[this.currentPlan]?.limits.exports?.includes(format);
                
                if (!canExport) {
                    const requiredPlan = format === 'excel' ? 'Professional' : 
                                       format === 'csv' ? 'Professional' : 'Enterprise';
                    
                    this.disableElement(button, `${format.toUpperCase()} disponível no plano ${requiredPlan}+`);
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.showFeatureUpgradeModal('export', `Exportação ${format.toUpperCase()}`, requiredPlan);
                    });
                } else {
                    this.enableElement(button);
                }
            }
        });
    }

    /**
     * Validar elementos de backup
     */
    static validateBackupElements() {
        const backupElements = document.querySelectorAll('[data-feature="backup"], .backup-btn, #backup-auto');
        const canUseBackup = this.PLANS[this.currentPlan]?.limits.backup;
        
        backupElements.forEach(element => {
            if (!canUseBackup) {
                this.disableElement(element, 'Backup automático disponível no plano Professional+');
                element.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showFeatureUpgradeModal('backup', 'Backup Automático', 'Professional');
                });
            } else {
                this.enableElement(element);
            }
        });
    }

    /**
     * Validar elementos de relatórios
     */
    static validateReportElements() {
        const reportElements = document.querySelectorAll('[data-feature="reports"], .advanced-reports, .premium-reports');
        const reportLevel = this.PLANS[this.currentPlan]?.limits.reports || 'basic';
        
        reportElements.forEach(element => {
            const requiredLevel = element.dataset.level || 'advanced';
            
            if ((requiredLevel === 'advanced' && reportLevel === 'basic') ||
                (requiredLevel === 'premium' && reportLevel !== 'premium')) {
                
                const requiredPlan = requiredLevel === 'premium' ? 'Enterprise' : 'Professional';
                this.disableElement(element, `Relatórios ${requiredLevel} disponíveis no plano ${requiredPlan}+`);
                element.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showFeatureUpgradeModal('reports', `Relatórios ${requiredLevel}`, requiredPlan);
                });
            } else {
                this.enableElement(element);
            }
        });
    }

    /**
     * Validar elementos de API
     */
    static validateAPIElements() {
        const apiElements = document.querySelectorAll('[data-feature="api"], .api-access, .api-docs');
        const hasAPI = this.PLANS[this.currentPlan]?.limits.api;
        
        apiElements.forEach(element => {
            if (!hasAPI) {
                this.disableElement(element, 'Acesso à API disponível no plano Professional+');
                element.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showFeatureUpgradeModal('api', 'Acesso à API', 'Professional');
                });
            } else {
                this.enableElement(element);
            }
        });
    }

    /**
     * Desabilitar elemento com tooltip
     */
    static disableElement(element, message) {
        element.classList.add('plan-disabled');
        element.style.opacity = '0.5';
        element.style.cursor = 'not-allowed';
        element.setAttribute('title', message);
        
        // Adicionar badge de upgrade se não existir
        if (!element.querySelector('.plan-upgrade-badge')) {
            const badge = document.createElement('span');
            badge.className = 'plan-upgrade-badge';
            badge.innerHTML = '⭐ PRO';
            badge.style.cssText = `
                position: absolute;
                top: -8px;
                right: -8px;
                background: linear-gradient(45deg, #ffd700, #ffed4e);
                color: #333;
                font-size: 10px;
                font-weight: bold;
                padding: 2px 6px;
                border-radius: 10px;
                z-index: 1000;
            `;
            
            // Tornar container relativo se necessário
            if (getComputedStyle(element).position === 'static') {
                element.style.position = 'relative';
            }
            
            element.appendChild(badge);
        }
    }

    /**
     * Habilitar elemento
     */
    static enableElement(element) {
        console.log('🔧 HABILITANDO ELEMENTO:', {
            classListBefore: Array.from(element.classList),
            disabled: element.disabled
        });
        
        // Remover classes de desabilitação
        element.classList.remove('plan-disabled', 'disabled');
        
        // Resetar estilos
        element.style.opacity = '';
        element.style.cursor = '';
        element.style.pointerEvents = '';
        
        // Remover atributos de desabilitação
        element.removeAttribute('title');
        element.removeAttribute('disabled');
        
        // Remover badge se existir
        const badge = element.querySelector('.plan-upgrade-badge');
        if (badge) badge.remove();
        
        console.log('✅ ELEMENTO HABILITADO:', {
            classListAfter: Array.from(element.classList),
            disabled: element.disabled,
            pointerEvents: element.style.pointerEvents,
            opacity: element.style.opacity
        });
    }

    /**
     * Adicionar badges de plano em elementos específicos
     */
    static addPlanBadges() {
        const currentPlanData = this.PLANS[this.currentPlan];
        if (!currentPlanData) return;
        
        // Adicionar badge do plano atual no header/sidebar se existir
        const planDisplays = document.querySelectorAll('.current-plan, #current-plan');
        planDisplays.forEach(display => {
            display.textContent = currentPlanData.name;
            display.className = `current-plan plan-${this.currentPlan}`;
        });
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

    /**
     * Inicializar automaticamente quando o DOM estiver pronto
     */
    static autoInitialize() {
        // Verificar se há usuário logado
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
        
        if (currentUser) {
            console.log('🚀 Auto-inicializando PlanValidator para:', currentUser.email);
            
            // Inicializar o validador
            const initialized = this.initialize(currentUser);
            
            if (initialized) {
                // Registrar sessão
                this.registerUserSession();
                
                // Configurar UI baseada no plano
                setTimeout(() => {
                    this.validateUIElements();
                }, 100);
                
                // Configurar monitoramento de atividade
                this.setupActivityMonitoring();
                
                console.log('✅ PlanValidator inicializado com sucesso');
                return true;
            } else {
                console.log('❌ Falha na inicialização do PlanValidator');
                return false;
            }
        } else {
            console.log('ℹ️ Nenhum usuário logado encontrado');
            return false;
        }
    }

    /**
     * Configurar monitoramento de atividade do usuário
     */
    static setupActivityMonitoring() {
        if (this.activityMonitoringSetup) return;
        this.activityMonitoringSetup = true;
        
        // Atualizar atividade a cada 5 minutos
        setInterval(() => {
            this.updateUserActivity();
        }, 5 * 60 * 1000);
        
        // Verificar limite de usuários periodicamente
        setInterval(async () => {
            const canContinue = await this.canAddUser();
            if (!canContinue) {
                console.log('🚫 Limite de usuários excedido - forçando logout');
                setTimeout(() => this.logout(), 3000);
            }
        }, 10 * 60 * 1000); // Verificar a cada 10 minutos
        
        // Escutar eventos de atividade
        const events = ['click', 'keypress', 'mousemove', 'scroll'];
        events.forEach(eventType => {
            document.addEventListener(eventType, () => {
                if (this.lastActivityUpdate && Date.now() - this.lastActivityUpdate < 60000) return; // Throttle
                this.updateUserActivity();
                this.lastActivityUpdate = Date.now();
            });
        });
    }

    /**
     * Forçar logout do usuário
     */
    static logout() {
        console.log('👋 Fazendo logout do usuário...');
        
        // Limpar dados locais
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('userSession');
        if (this.currentUser) {
            localStorage.removeItem(`session_${this.currentUser.id}`);
        }
        
        // Limpar estado
        this.currentUser = null;
        this.currentPlan = 'starter';
        
        // Redirecionar para login
        if (typeof redirectToLogin === 'function') {
            redirectToLogin();
        } else {
            window.location.href = '/login.html';
        }
    }
}

// Auto-inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM carregado - verificando auto-inicialização do PlanValidator');
    PlanValidator.autoInitialize();
});

// Também tentar inicializar se o script for carregado depois do DOM
if (document.readyState === 'loading') {
    console.log('📄 DOM ainda carregando - aguardando...');
} else {
    console.log('📄 DOM já carregado - inicializando PlanValidator imediatamente');
    setTimeout(() => PlanValidator.autoInitialize(), 50);
}

// 🌐 EXPOR GLOBALMENTE PARA ACESSO EM OUTRAS PÁGINAS
window.PlanValidator = PlanValidator;
console.log('🌐 PlanValidator exposto globalmente:', !!window.PlanValidator);
