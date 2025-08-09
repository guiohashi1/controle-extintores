/* =============================================================================
   PLANS MANAGER - Sistema de Planos e Limitações
   ============================================================================= */

class PlansManager {
    constructor() {
        this.plans = {
            starter: {
                name: 'Starter',
                price: 97,
                maxExtinguishers: 50,
                maxUsers: 1,
                features: {
                    basicReports: true,
                    emailNotifications: true,
                    advancedReports: false,
                    whatsappNotifications: false,
                    qrCodes: false,
                    multiUsers: false,
                    api: false,
                    whiteLabel: false,
                    prioritySupport: false,
                    customIntegrations: false
                },
                limitations: {
                    storage: '1GB',
                    apiCalls: 1000,
                    monthlyReports: 10
                }
            },
            professional: {
                name: 'Professional',
                price: 197,
                maxExtinguishers: 200,
                maxUsers: 3,
                features: {
                    basicReports: true,
                    emailNotifications: true,
                    advancedReports: true,
                    whatsappNotifications: true,
                    qrCodes: true,
                    multiUsers: true,
                    api: false,
                    whiteLabel: false,
                    prioritySupport: false,
                    customIntegrations: false
                },
                limitations: {
                    storage: '5GB',
                    apiCalls: 10000,
                    monthlyReports: 50
                }
            },
            enterprise: {
                name: 'Enterprise',
                price: 397,
                maxExtinguishers: -1, // Unlimited
                maxUsers: -1, // Unlimited
                features: {
                    basicReports: true,
                    emailNotifications: true,
                    advancedReports: true,
                    whatsappNotifications: true,
                    qrCodes: true,
                    multiUsers: true,
                    api: true,
                    whiteLabel: true,
                    prioritySupport: true,
                    customIntegrations: true
                },
                limitations: {
                    storage: 'Unlimited',
                    apiCalls: -1, // Unlimited
                    monthlyReports: -1 // Unlimited
                }
            }
        };
        
        this.init();
    }

    init() {
        console.log('📋 Plans Manager inicializado');
    }

    // Obter detalhes de um plano
    getPlan(planType) {
        return this.plans[planType] || null;
    }

    // Obter todos os planos
    getAllPlans() {
        return this.plans;
    }

    // Verificar se usuário pode adicionar mais extintores
    canAddExtinguisher(userPlan, currentCount) {
        const plan = this.getPlan(userPlan);
        if (!plan) return false;
        
        if (plan.maxExtinguishers === -1) return true; // Unlimited
        return currentCount < plan.maxExtinguishers;
    }

    // Verificar se usuário pode adicionar mais usuários
    canAddUser(userPlan, currentCount) {
        const plan = this.getPlan(userPlan);
        if (!plan) return false;
        
        if (plan.maxUsers === -1) return true; // Unlimited
        return currentCount < plan.maxUsers;
    }

    // Verificar se feature está disponível
    hasFeature(userPlan, feature) {
        const plan = this.getPlan(userPlan);
        if (!plan) return false;
        
        return plan.features[feature] === true;
    }

    // Obter limitação específica
    getLimitation(userPlan, limitation) {
        const plan = this.getPlan(userPlan);
        if (!plan) return null;
        
        return plan.limitations[limitation];
    }

    // Validar se pode gerar relatório
    canGenerateReport(userPlan, type = 'basic') {
        const plan = this.getPlan(userPlan);
        if (!plan) return false;
        
        if (type === 'advanced') {
            return this.hasFeature(userPlan, 'advancedReports');
        }
        
        return this.hasFeature(userPlan, 'basicReports');
    }

    // Obter mensagem de limitação
    getLimitationMessage(userPlan, feature) {
        const plan = this.getPlan(userPlan);
        if (!plan) return 'Plano não encontrado';
        
        const messages = {
            maxExtinguishers: `Limite de ${plan.maxExtinguishers} extintores atingido. Faça upgrade para adicionar mais.`,
            maxUsers: `Limite de ${plan.maxUsers} usuário(s) atingido. Faça upgrade para adicionar mais.`,
            advancedReports: 'Relatórios avançados disponíveis nos planos Professional e Enterprise.',
            whatsappNotifications: 'Notificações WhatsApp disponíveis nos planos Professional e Enterprise.',
            qrCodes: 'QR Codes disponíveis nos planos Professional e Enterprise.',
            api: 'API disponível apenas no plano Enterprise.',
            whiteLabel: 'White-label disponível apenas no plano Enterprise.',
            prioritySupport: 'Suporte prioritário disponível apenas no plano Enterprise.',
            customIntegrations: 'Integrações customizadas disponíveis apenas no plano Enterprise.'
        };
        
        return messages[feature] || 'Feature não disponível no seu plano atual.';
    }

    // Calcular valor do upgrade
    getUpgradeCost(currentPlan, targetPlan) {
        const current = this.getPlan(currentPlan);
        const target = this.getPlan(targetPlan);
        
        if (!current || !target) return 0;
        
        return Math.max(0, target.price - current.price);
    }

    // Obter próximo plano recomendado
    getRecommendedUpgrade(currentPlan) {
        const upgrades = {
            starter: 'professional',
            professional: 'enterprise',
            enterprise: null
        };
        
        return upgrades[currentPlan] || null;
    }

    // Gerar comparação de planos para UI
    getPlanComparison() {
        const features = [
            { key: 'maxExtinguishers', label: 'Máximo de Extintores' },
            { key: 'maxUsers', label: 'Usuários Simultâneos' },
            { key: 'basicReports', label: 'Relatórios Básicos' },
            { key: 'advancedReports', label: 'Relatórios Avançados' },
            { key: 'emailNotifications', label: 'Notificações Email' },
            { key: 'whatsappNotifications', label: 'Notificações WhatsApp' },
            { key: 'qrCodes', label: 'QR Codes' },
            { key: 'multiUsers', label: 'Multi-usuários' },
            { key: 'api', label: 'API Completa' },
            { key: 'whiteLabel', label: 'White-label' },
            { key: 'prioritySupport', label: 'Suporte Prioritário' },
            { key: 'customIntegrations', label: 'Integrações Customizadas' }
        ];
        
        const comparison = {};
        
        Object.keys(this.plans).forEach(planKey => {
            const plan = this.plans[planKey];
            comparison[planKey] = {
                name: plan.name,
                price: plan.price,
                features: {}
            };
            
            features.forEach(feature => {
                if (feature.key === 'maxExtinguishers' || feature.key === 'maxUsers') {
                    const value = plan[feature.key];
                    comparison[planKey].features[feature.key] = value === -1 ? 'Ilimitado' : value.toString();
                } else {
                    comparison[planKey].features[feature.key] = plan.features[feature.key];
                }
            });
        });
        
        return { features, comparison };
    }

    // Validar ações do usuário baseado no plano
    validateAction(userPlan, action, data = {}) {
        const plan = this.getPlan(userPlan);
        if (!plan) return { valid: false, message: 'Plano não encontrado' };
        
        switch (action) {
            case 'add_extinguisher':
                if (!this.canAddExtinguisher(userPlan, data.currentCount || 0)) {
                    return {
                        valid: false,
                        message: this.getLimitationMessage(userPlan, 'maxExtinguishers'),
                        upgradeRecommendation: this.getRecommendedUpgrade(userPlan)
                    };
                }
                break;
                
            case 'add_user':
                if (!this.canAddUser(userPlan, data.currentCount || 0)) {
                    return {
                        valid: false,
                        message: this.getLimitationMessage(userPlan, 'maxUsers'),
                        upgradeRecommendation: this.getRecommendedUpgrade(userPlan)
                    };
                }
                break;
                
            case 'generate_advanced_report':
                if (!this.hasFeature(userPlan, 'advancedReports')) {
                    return {
                        valid: false,
                        message: this.getLimitationMessage(userPlan, 'advancedReports'),
                        upgradeRecommendation: this.getRecommendedUpgrade(userPlan)
                    };
                }
                break;
                
            case 'use_whatsapp':
                if (!this.hasFeature(userPlan, 'whatsappNotifications')) {
                    return {
                        valid: false,
                        message: this.getLimitationMessage(userPlan, 'whatsappNotifications'),
                        upgradeRecommendation: this.getRecommendedUpgrade(userPlan)
                    };
                }
                break;
                
            case 'generate_qr_code':
                if (!this.hasFeature(userPlan, 'qrCodes')) {
                    return {
                        valid: false,
                        message: this.getLimitationMessage(userPlan, 'qrCodes'),
                        upgradeRecommendation: this.getRecommendedUpgrade(userPlan)
                    };
                }
                break;
                
            case 'use_api':
                if (!this.hasFeature(userPlan, 'api')) {
                    return {
                        valid: false,
                        message: this.getLimitationMessage(userPlan, 'api'),
                        upgradeRecommendation: this.getRecommendedUpgrade(userPlan)
                    };
                }
                break;
        }
        
        return { valid: true };
    }

    // Gerar modal de upgrade
    showUpgradeModal(currentPlan, feature) {
        const recommended = this.getRecommendedUpgrade(currentPlan);
        const currentPlanData = this.getPlan(currentPlan);
        const recommendedPlanData = this.getPlan(recommended);
        
        if (!recommended || !recommendedPlanData) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal upgrade-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🚀 Upgrade Necessário</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="upgrade-content">
                    <div class="upgrade-message">
                        <p>${this.getLimitationMessage(currentPlan, feature)}</p>
                    </div>
                    
                    <div class="plan-comparison-mini">
                        <div class="current-plan">
                            <h4>Plano Atual</h4>
                            <div class="plan-name">${currentPlanData.name}</div>
                            <div class="plan-price">R$ ${currentPlanData.price}/mês</div>
                        </div>
                        
                        <div class="upgrade-arrow">→</div>
                        
                        <div class="recommended-plan">
                            <h4>Recomendado</h4>
                            <div class="plan-name">${recommendedPlanData.name}</div>
                            <div class="plan-price">R$ ${recommendedPlanData.price}/mês</div>
                            <div class="upgrade-cost">+R$ ${this.getUpgradeCost(currentPlan, recommended)}/mês</div>
                        </div>
                    </div>
                    
                    <div class="upgrade-benefits">
                        <h4>O que você ganha com o upgrade:</h4>
                        <ul>
                            ${this.getUpgradeBenefits(currentPlan, recommended).map(benefit => `<li>${benefit}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                            Talvez Depois
                        </button>
                        <button class="btn btn-primary" onclick="this.requestUpgrade('${recommended}')">
                            💎 Fazer Upgrade
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Adicionar estilos
        modal.style.cssText = `
            display: flex;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            align-items: center;
            justify-content: center;
        `;
        
        document.body.appendChild(modal);
        
        // Add upgrade request handler
        window.requestUpgrade = (targetPlan) => {
            console.log(`Solicitando upgrade para ${targetPlan}`);
            alert(`Upgrade para ${targetPlan} solicitado! Entre em contato conosco para processar.`);
            modal.remove();
        };
    }

    // Obter benefícios do upgrade
    getUpgradeBenefits(currentPlan, targetPlan) {
        const current = this.getPlan(currentPlan);
        const target = this.getPlan(targetPlan);
        
        if (!current || !target) return [];
        
        const benefits = [];
        
        // Comparar limites
        if (target.maxExtinguishers > current.maxExtinguishers) {
            benefits.push(`${target.maxExtinguishers === -1 ? 'Extintores ilimitados' : `Até ${target.maxExtinguishers} extintores`} (antes: ${current.maxExtinguishers})`);
        }
        
        if (target.maxUsers > current.maxUsers) {
            benefits.push(`${target.maxUsers === -1 ? 'Usuários ilimitados' : `${target.maxUsers} usuários simultâneos`} (antes: ${current.maxUsers})`);
        }
        
        // Comparar features
        Object.keys(target.features).forEach(feature => {
            if (target.features[feature] && !current.features[feature]) {
                const featureNames = {
                    advancedReports: 'Relatórios avançados com gráficos',
                    whatsappNotifications: 'Notificações via WhatsApp',
                    qrCodes: 'QR Codes para identificação',
                    multiUsers: 'Múltiplos usuários simultâneos',
                    api: 'API completa para integrações',
                    whiteLabel: 'Personalização da marca (White-label)',
                    prioritySupport: 'Suporte técnico prioritário',
                    customIntegrations: 'Integrações personalizadas'
                };
                
                if (featureNames[feature]) {
                    benefits.push(featureNames[feature]);
                }
            }
        });
        
        return benefits;
    }

    // Obter estatísticas de uso do plano
    getPlanUsageStats(userPlan, usage = {}) {
        const plan = this.getPlan(userPlan);
        if (!plan) return null;
        
        const stats = {
            extinguishers: {
                current: usage.extinguishers || 0,
                limit: plan.maxExtinguishers,
                percentage: plan.maxExtinguishers === -1 ? 0 : Math.min(100, ((usage.extinguishers || 0) / plan.maxExtinguishers) * 100)
            },
            users: {
                current: usage.users || 1,
                limit: plan.maxUsers,
                percentage: plan.maxUsers === -1 ? 0 : Math.min(100, ((usage.users || 1) / plan.maxUsers) * 100)
            },
            reports: {
                current: usage.reports || 0,
                limit: plan.limitations.monthlyReports,
                percentage: plan.limitations.monthlyReports === -1 ? 0 : Math.min(100, ((usage.reports || 0) / plan.limitations.monthlyReports) * 100)
            }
        };
        
        return stats;
    }
}

// Criar instância global
window.plansManager = new PlansManager();

// Adicionar estilos para modal de upgrade
const upgradeModalStyles = document.createElement('style');
upgradeModalStyles.textContent = `
    .upgrade-content {
        padding: 1.5rem;
    }
    
    .upgrade-message {
        margin-bottom: 2rem;
        padding: 1rem;
        background: #fef3c7;
        border-left: 4px solid #f59e0b;
        border-radius: 0.5rem;
    }
    
    .plan-comparison-mini {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: #f9fafb;
        border-radius: 0.75rem;
    }
    
    .current-plan, .recommended-plan {
        text-align: center;
        flex: 1;
    }
    
    .current-plan h4, .recommended-plan h4 {
        font-size: 0.875rem;
        color: #6b7280;
        margin-bottom: 0.5rem;
    }
    
    .plan-name {
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
    }
    
    .plan-price {
        font-size: 1rem;
        color: #374151;
    }
    
    .upgrade-cost {
        font-size: 0.875rem;
        color: #10b981;
        font-weight: 600;
        margin-top: 0.25rem;
    }
    
    .upgrade-arrow {
        font-size: 2rem;
        color: #3b82f6;
        margin: 0 2rem;
    }
    
    .upgrade-benefits {
        margin-bottom: 2rem;
    }
    
    .upgrade-benefits h4 {
        margin-bottom: 1rem;
        color: #374151;
    }
    
    .upgrade-benefits ul {
        list-style: none;
        padding: 0;
    }
    
    .upgrade-benefits li {
        padding: 0.5rem 0;
        padding-left: 1.5rem;
        position: relative;
    }
    
    .upgrade-benefits li::before {
        content: '✨';
        position: absolute;
        left: 0;
        top: 0.5rem;
    }
`;

document.head.appendChild(upgradeModalStyles);

// Exportar
window.PlansManager = PlansManager;
