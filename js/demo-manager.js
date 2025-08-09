/**
 * Script de Demonstração - Sistema de Planos B2B
 * Simula diferentes cenários de uso e limitações
 */

class DemoManager {
    static demoUsers = {
        starter: {
            id: 'demo-starter-001',
            email: 'starter@demo.com',
            password: '123456',
            name: 'Empresa Starter Demo',
            plan: 'starter',
            plan_status: 'active',
            plan_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString()
        },
        professional: {
            id: 'demo-professional-001', 
            email: 'professional@demo.com',
            password: '123456',
            name: 'Empresa Professional Demo',
            plan: 'professional',
            plan_status: 'active',
            plan_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString()
        },
        enterprise: {
            id: 'demo-enterprise-001',
            email: 'enterprise@demo.com', 
            password: '123456',
            name: 'Empresa Enterprise Demo',
            plan: 'enterprise',
            plan_status: 'active',
            plan_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString()
        },
        expired: {
            id: 'demo-expired-001',
            email: 'expired@demo.com',
            password: '123456', 
            name: 'Empresa Vencida Demo',
            plan: 'professional',
            plan_status: 'expired',
            plan_expires_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString()
        }
    };

    /**
     * Simular login com diferentes tipos de plano
     */
    static loginAsDemo(planType) {
        const user = this.demoUsers[planType];
        if (!user) {
            console.error('Tipo de plano inválido:', planType);
            return false;
        }

        // Salvar usuário no sessionStorage
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        
        // Mostrar notificação
        if (window.showNotification) {
            showNotification(`Login como ${user.name} (${planType.toUpperCase()})`, 'success');
        }

        // Redirecionar para dashboard
        setTimeout(() => {
            window.location.href = 'pages/dashboard.html';
        }, 1000);

        return true;
    }

    /**
     * Gerar extintores de teste baseados no plano
     */
    static generateDemoData(planType) {
        const limits = {
            starter: { max: 50, generate: 45 }, // 90% do limite
            professional: { max: 200, generate: 150 }, // 75% do limite  
            enterprise: { max: -1, generate: 300 } // Ilimitado
        };

        const planLimits = limits[planType] || limits.starter;
        const extintores = [];

        for (let i = 1; i <= planLimits.generate; i++) {
            const tipos = ['Pó Químico Seco', 'CO2', 'Espuma Mecânica', 'Água Pressurizada'];
            const locais = ['Recepção', 'Sala de Reuniões', 'Cozinha', 'Almoxarifado', 'Corredor A', 'Corredor B', 'Sala de Máquinas', 'Garagem'];
            
            const dataFabricacao = new Date(2022 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
            const dataVencimento = new Date(dataFabricacao.getFullYear() + 5, dataFabricacao.getMonth(), dataFabricacao.getDate());
            
            extintores.push({
                id: `demo-extintor-${i.toString().padStart(3, '0')}`,
                numero: `EXT-${i.toString().padStart(3, '0')}`,
                local: locais[Math.floor(Math.random() * locais.length)],
                tipo: tipos[Math.floor(Math.random() * tipos.length)],
                peso: [4, 6, 9, 12][Math.floor(Math.random() * 4)],
                fabricante: ['Extintec', 'FireMax', 'ProFire', 'Segurfire'][Math.floor(Math.random() * 4)],
                validade: dataVencimento.toISOString().split('T')[0],
                hidro: new Date(dataFabricacao.getFullYear() + 2, dataFabricacao.getMonth(), dataFabricacao.getDate()).toISOString().split('T')[0],
                observacoes: Math.random() > 0.7 ? ['Em bom estado', 'Verificar pressão', 'Necessita limpeza'][Math.floor(Math.random() * 3)] : null,
                created_at: dataFabricacao.toISOString()
            });
        }

        // Simular alguns vencidos/próximos do vencimento
        const numVencidos = Math.floor(planLimits.generate * 0.1); // 10% vencidos
        for (let i = 0; i < numVencidos; i++) {
            if (extintores[i]) {
                const diasAtras = Math.floor(Math.random() * 90); // 0-90 dias vencidos
                const dataVencida = new Date();
                dataVencida.setDate(dataVencida.getDate() - diasAtras);
                extintores[i].validade = dataVencida.toISOString().split('T')[0];
            }
        }

        return extintores;
    }

    /**
     * Aplicar dados de demonstração no localStorage
     */
    static setupDemoData(planType) {
        const extintores = this.generateDemoData(planType);
        localStorage.setItem('demo_extintores', JSON.stringify(extintores));
        
        console.log(`✅ Dados demo configurados para plano ${planType}:`, {
            extintores: extintores.length,
            vencidos: extintores.filter(e => new Date(e.validade) < new Date()).length
        });
    }

    /**
     * Limpar dados de demonstração
     */
    static clearDemoData() {
        localStorage.removeItem('demo_extintores');
        sessionStorage.removeItem('currentUser');
        console.log('✅ Dados de demonstração limpos');
    }

    /**
     * Mostrar interface de demonstração
     */
    static showDemoInterface() {
        // Verificar se já existe
        if (document.getElementById('demo-interface')) return;

        const demoDiv = document.createElement('div');
        demoDiv.id = 'demo-interface';
        demoDiv.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            min-width: 250px;
        `;

        demoDiv.innerHTML = `
            <div style="margin-bottom: 10px; font-weight: bold;">🎭 MODO DEMO</div>
            <div style="margin-bottom: 10px;">
                <button onclick="DemoManager.loginAsDemo('starter')" style="margin: 2px; padding: 5px 8px; font-size: 11px;">Starter</button>
                <button onclick="DemoManager.loginAsDemo('professional')" style="margin: 2px; padding: 5px 8px; font-size: 11px;">Professional</button>
                <button onclick="DemoManager.loginAsDemo('enterprise')" style="margin: 2px; padding: 5px 8px; font-size: 11px;">Enterprise</button>
            </div>
            <div style="margin-bottom: 10px;">
                <button onclick="DemoManager.loginAsDemo('expired')" style="margin: 2px; padding: 5px 8px; font-size: 11px; background: #e74c3c;">Plano Vencido</button>
            </div>
            <div>
                <button onclick="DemoManager.clearDemoData()" style="margin: 2px; padding: 5px 8px; font-size: 11px; background: #95a5a6;">Limpar Demo</button>
                <button onclick="this.parentElement.parentElement.style.display='none'" style="margin: 2px; padding: 5px 8px; font-size: 11px; background: #34495e;">Ocultar</button>
            </div>
        `;

        document.body.appendChild(demoDiv);
    }

    /**
     * Cenários de teste específicos
     */
    static testScenario(scenario) {
        switch (scenario) {
            case 'limit-reached':
                // Simular limite de extintores atingido para plano Starter
                this.loginAsDemo('starter');
                setTimeout(() => {
                    this.setupDemoData('starter');
                    // Forçar 50 extintores (limite exato)
                    const extintores = this.generateDemoData('starter');
                    const limitedExtintores = extintores.slice(0, 50);
                    localStorage.setItem('demo_extintores', JSON.stringify(limitedExtintores));
                }, 1500);
                break;

            case 'near-expiry':
                // Simular muitos extintores próximos do vencimento
                this.loginAsDemo('professional');
                setTimeout(() => {
                    const extintores = this.generateDemoData('professional');
                    // 30% próximos do vencimento (próximos 30 dias)
                    const nearExpiry = Math.floor(extintores.length * 0.3);
                    for (let i = 0; i < nearExpiry; i++) {
                        const diasProximos = Math.floor(Math.random() * 30) + 1;
                        const dataProxima = new Date();
                        dataProxima.setDate(dataProxima.getDate() + diasProximos);
                        extintores[i].validade = dataProxima.toISOString().split('T')[0];
                    }
                    localStorage.setItem('demo_extintores', JSON.stringify(extintores));
                }, 1500);
                break;

            case 'upgrade-flow':
                // Testar fluxo completo de upgrade
                console.log('🎯 Cenário: Fluxo de Upgrade');
                this.loginAsDemo('starter');
                setTimeout(() => {
                    this.setupDemoData('starter');
                    // Simular tentativa de criar extintor além do limite
                    setTimeout(() => {
                        if (window.PlanValidator) {
                            PlanValidator.canCreateExtintor().then(canCreate => {
                                if (!canCreate) {
                                    console.log('✅ Modal de upgrade exibido corretamente');
                                }
                            });
                        }
                    }, 2000);
                }, 1500);
                break;

            default:
                console.warn('Cenário não encontrado:', scenario);
        }
    }
}

// Expor globalmente para uso no console
window.DemoManager = DemoManager;

// Auto-inicializar interface demo em desenvolvimento
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            DemoManager.showDemoInterface();
        }, 1000);
    });
}

console.log('🎭 Sistema de Demonstração carregado!');
console.log('📋 Comandos disponíveis:');
console.log('  DemoManager.loginAsDemo("starter|professional|enterprise|expired")');
console.log('  DemoManager.testScenario("limit-reached|near-expiry|upgrade-flow")');
console.log('  DemoManager.clearDemoData()');
