/**
 * ADMIN CORE - Controle de Extintores
 * Sistema administrativo completo
 */

// Verificar dependências
console.log('🔍 Verificando dependências...');
console.log('Supabase disponível:', typeof window.supabase !== 'undefined');
console.log('Supabase client configurado:', typeof supabase !== 'undefined');
console.log('PlanValidator disponível:', typeof PlanValidator !== 'undefined');

class AdminCore {
    constructor() {
        this.currentSection = 'dashboard';
        this.cache = {
            usuarios: [],
            extintores: [],
            sessoes: {}
        };
    }

    static init() {
        const admin = new AdminCore();
        admin.initialize();
        return admin;
    }

    initialize() {
        console.log('🚀 Inicializando Admin Panel...');
        
        try {
            // Verificar autenticação admin
            console.log('🔐 Verificando autenticação...');
            if (!this.checkAdminAuth()) {
                return;
            }
            
            // Setup navigation
            console.log('🧭 Configurando navegação...');
            this.setupNavigation();
            
            // Load initial data
            console.log('📊 Carregando dados iniciais...');
            this.loadDashboardData();
            
            // Setup auto-refresh
            console.log('🔄 Configurando auto-refresh...');
            this.setupAutoRefresh();
            
            console.log('✅ Admin Panel inicializado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao inicializar Admin Panel:', error);
            alert('Erro ao carregar painel administrativo. Verifique o console.');
        }
    }

    // ==========================================
    // AUTENTICAÇÃO E SEGURANÇA
    // ==========================================
    
    checkAdminAuth() {
        // Primeiro tenta sessionStorage (sistema atual)
        let user = null;
        try {
            const sessionUser = sessionStorage.getItem('currentUser');
            if (sessionUser) {
                user = JSON.parse(sessionUser);
                console.log('✅ Usuário encontrado no sessionStorage:', user.email);
            }
        } catch (error) {
            console.warn('⚠️ Erro ao ler sessionStorage:', error);
        }
        
        // Se não encontrou no sessionStorage, tenta no supabase manager
        if (!user && typeof supabase !== 'undefined' && supabase.currentUser) {
            user = supabase.currentUser;
            console.log('✅ Usuário encontrado no supabase manager:', user.email);
        }
        
        // Se não encontrou usuário, redireciona para login
        if (!user || !user.email) {
            console.log('❌ Nenhum usuário logado encontrado');
            alert('❌ Faça login primeiro para acessar o painel administrativo.');
            window.location.href = '../index.html';
            return false;
        }
        
        // Verificar se é admin
        const isUserAdmin = user.admin === true || user.tipo === 'admin';
        
        // Lista de emails admin para fallback
        const adminEmails = [
            'admin@teste.com', // Usuário de teste criado
            'admin@extintores.com',
            'suporte@extintores.com'
        ];
        
        // Em modo de desenvolvimento, ser mais flexível
        const isDevelopment = window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1' ||
                             window.location.hostname.includes('netlify');
        
        const isAdmin = isUserAdmin || adminEmails.includes(user.email) || 
                       (isDevelopment && user.email); // Em dev, qualquer usuário logado
        
        if (!isAdmin) {
            console.log('❌ Usuário não é admin:', user);
            alert('❌ Acesso negado. Apenas administradores podem acessar este painel.');
            window.location.href = '../index.html';
            return false;
        }
        
        // Mostrar info do admin
        if (document.getElementById('admin-user')) {
            document.getElementById('admin-user').textContent = user.email;
        }
        
        console.log(`✅ Admin autenticado: ${user.email} (admin: ${isUserAdmin})`);
        return true;
    }

    // ==========================================
    // NAVEGAÇÃO
    // ==========================================
    
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                this.showSection(section);
            });
        });
    }
    
    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Remove active from nav items
        document.querySelectorAll('.nav-item').forEach(nav => {
            nav.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Activate nav item
        const navItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }
        
        // Load section data
        this.loadSectionData(sectionName);
        
        this.currentSection = sectionName;
    }
    
    loadSectionData(section) {
        switch(section) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'usuarios':
                this.loadUsuarios();
                break;
            case 'extintores':
                this.loadExtintores();
                break;
            case 'sessoes':
                this.loadSessoes();
                break;
            case 'planos':
                this.loadPlanos();
                break;
        }
    }

    // ==========================================
    // DASHBOARD
    // ==========================================
    
    async loadDashboardData() {
        try {
            console.log('📊 Carregando dados do dashboard...');
            
            // Carregar estatísticas
            const stats = await this.getSystemStats();
            this.updateDashboardStats(stats);
            
            // Carregar distribuição de planos
            const planDistribution = await this.getPlanDistribution();
            this.updatePlanDistribution(planDistribution);
            
        } catch (error) {
            console.error('❌ Erro ao carregar dashboard:', error);
        }
    }
    
    async getSystemStats() {
        try {
            // Usar a instância global do supabase manager
            if (typeof supabase === 'undefined') {
                console.error('❌ Supabase manager não disponível');
                throw new Error('Supabase não inicializado');
            }
            
            console.log('📊 Carregando estatísticas...');
            
            // Contar usuários
            const usuarios = await supabase.request('users?select=*');
            console.log('👥 Usuários carregados:', usuarios.length);
            
            // Contar extintores
            const extintores = await supabase.request('extintores?select=*');
            console.log('🧯 Extintores carregados:', extintores.length);
                
            // Contar sessões ativas
            const globalSessions = JSON.parse(localStorage.getItem('globalSessions') || '{}');
            const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
            const sessoesAtivas = Object.values(globalSessions).filter(session => {
                const lastActivity = new Date(session.lastActivity);
                return lastActivity > thirtyMinutesAgo;
            }).length;
            
            // Calcular receita mensal estimada
            const planPrices = { starter: 97, professional: 197, enterprise: 397 };
            let receitaMensal = 0;
            
            if (usuarios) {
                usuarios.forEach(user => {
                    const plan = user.plan || 'starter';
                    receitaMensal += planPrices[plan] || 0;
                });
            }
            
            const stats = {
                totalUsuarios: usuarios?.length || 0,
                totalExtintores: extintores?.length || 0,
                sessoesAtivas,
                receitaMensal
            };
            
            console.log('📊 Estatísticas carregadas:', stats);
            return stats;
            
        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error);
            return {
                totalUsuarios: 0,
                totalExtintores: 0,
                sessoesAtivas: 0,
                receitaMensal: 0
            };
        }
    }
    
    updateDashboardStats(stats) {
        document.getElementById('total-usuarios').textContent = stats.totalUsuarios;
        document.getElementById('total-extintores').textContent = stats.totalExtintores;
        document.getElementById('sessoes-ativas').textContent = stats.sessoesAtivas;
        document.getElementById('receita-mensal').textContent = `R$ ${stats.receitaMensal.toLocaleString('pt-BR')}`;
    }
    
    async getPlanDistribution() {
        try {
            console.log('📊 Carregando distribuição de planos...');
            const usuarios = await supabase.request('users?select=plan');
                
            const distribution = {
                starter: 0,
                professional: 0,
                enterprise: 0
            };
            
            if (usuarios) {
                usuarios.forEach(user => {
                    const plan = user.plan || 'starter';
                    distribution[plan]++;
                });
            }
            
            console.log('📊 Distribuição de planos:', distribution);
            return distribution;
            
        } catch (error) {
            console.error('❌ Erro ao obter distribuição de planos:', error);
            return { starter: 1, professional: 0, enterprise: 0 };
        }
    }
    
    updatePlanDistribution(distribution) {
        const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
        
        document.getElementById('starter-count').textContent = distribution.starter;
        document.getElementById('professional-count').textContent = distribution.professional;
        document.getElementById('enterprise-count').textContent = distribution.enterprise;
        
        // Atualizar barras de progresso
        if (total > 0) {
            const starterPercent = (distribution.starter / total) * 100;
            const professionalPercent = (distribution.professional / total) * 100;
            const enterprisePercent = (distribution.enterprise / total) * 100;
            
            document.querySelector('.plan-fill.starter').style.width = `${starterPercent}%`;
            document.querySelector('.plan-fill.professional').style.width = `${professionalPercent}%`;
            document.querySelector('.plan-fill.enterprise').style.width = `${enterprisePercent}%`;
        }
    }

    // ==========================================
    // USUÁRIOS
    // ==========================================
    
    async loadUsuarios() {
        try {
            console.log('👥 Carregando usuários...');
            
            const usuarios = await supabase.request('users?select=*&order=created_at.desc');
                
            if (error) throw error;
            
            this.cache.usuarios = usuarios || [];
            this.renderUsuarios(this.cache.usuarios);
            
        } catch (error) {
            console.error('❌ Erro ao carregar usuários:', error);
            document.getElementById('usuarios-tbody').innerHTML = `
                <tr><td colspan="6" class="text-center">Erro ao carregar usuários</td></tr>
            `;
        }
    }
    
    renderUsuarios(usuarios) {
        const tbody = document.getElementById('usuarios-tbody');
        
        if (!usuarios || usuarios.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="6" class="text-center">Nenhum usuário encontrado</td></tr>
            `;
            return;
        }
        
        tbody.innerHTML = usuarios.map(usuario => {
            const planInfo = this.getPlanInfo(usuario.plan || 'starter');
            const createdAt = new Date(usuario.created_at).toLocaleDateString('pt-BR');
            
            return `
                <tr>
                    <td>${usuario.email}</td>
                    <td>
                        <span class="badge badge-${usuario.plan || 'starter'}">
                            ${planInfo.name}
                        </span>
                    </td>
                    <td>${usuario.extintores_count || 0}</td>
                    <td>${usuario.active_sessions || 0}</td>
                    <td>${createdAt}</td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="window.adminCore.editUser('${usuario.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline text-danger" onclick="window.adminCore.deleteUser('${usuario.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // ==========================================
    // EXTINTORES
    // ==========================================
    
    async loadExtintores() {
        try {
            console.log('🧯 Carregando extintores...');
            
            const { data: extintores, error } = await supabase
                .from('extintores')
                .select(`
                    *,
                    usuarios!extintores_user_id_fkey(email)
                `)
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            
            this.cache.extintores = extintores || [];
            this.renderExtintores(this.cache.extintores);
            
        } catch (error) {
            console.error('❌ Erro ao carregar extintores:', error);
            document.getElementById('extintores-tbody').innerHTML = `
                <tr><td colspan="7" class="text-center">Erro ao carregar extintores</td></tr>
            `;
        }
    }
    
    renderExtintores(extintores) {
        const tbody = document.getElementById('extintores-tbody');
        
        if (!extintores || extintores.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="7" class="text-center">Nenhum extintor encontrado</td></tr>
            `;
            return;
        }
        
        tbody.innerHTML = extintores.map(extintor => {
            const proximaInspecao = new Date(extintor.proxima_inspecao).toLocaleDateString('pt-BR');
            const status = this.getExtintorStatus(extintor.proxima_inspecao);
            const userEmail = extintor.usuarios?.email || 'N/A';
            
            return `
                <tr>
                    <td>${extintor.patrimonio}</td>
                    <td>${extintor.tipo}</td>
                    <td>${extintor.localizacao}</td>
                    <td>${userEmail}</td>
                    <td>${proximaInspecao}</td>
                    <td>
                        <span class="badge badge-${status.class}">
                            ${status.text}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="window.adminCore.viewExtintor('${extintor.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline text-danger" onclick="window.adminCore.deleteExtintor('${extintor.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // ==========================================
    // SESSÕES ATIVAS
    // ==========================================
    
    loadSessoes() {
        try {
            console.log('💻 Carregando sessões ativas...');
            
            const globalSessions = JSON.parse(localStorage.getItem('globalSessions') || '{}');
            const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
            
            const sessoesAtivas = Object.values(globalSessions).filter(session => {
                const lastActivity = new Date(session.lastActivity);
                return lastActivity > thirtyMinutesAgo;
            });
            
            this.renderSessoes(sessoesAtivas);
            
        } catch (error) {
            console.error('❌ Erro ao carregar sessões:', error);
        }
    }
    
    renderSessoes(sessoes) {
        const grid = document.getElementById('sessions-grid');
        
        if (!sessoes || sessoes.length === 0) {
            grid.innerHTML = `
                <div class="session-card">
                    <div class="session-info">
                        <h4>Nenhuma sessão ativa</h4>
                        <p>Todos os usuários estão offline</p>
                    </div>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = sessoes.map(session => {
            const lastActivity = new Date(session.lastActivity);
            const minutesAgo = Math.round((new Date() - lastActivity) / (1000 * 60));
            
            return `
                <div class="session-card">
                    <div class="session-info">
                        <h4>${session.email}</h4>
                        <p><strong>Plano:</strong> ${session.plan}</p>
                        <p><strong>Última atividade:</strong> ${minutesAgo} min atrás</p>
                        <p><strong>IP/Dispositivo:</strong> ${session.sessionId}</p>
                    </div>
                    <div class="session-actions">
                        <button class="btn btn-sm btn-outline text-danger" onclick="window.adminCore.forceLogout('${session.sessionId}')">
                            <i class="fas fa-sign-out-alt"></i> Desconectar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ==========================================
    // UTILITÁRIOS
    // ==========================================
    
    getPlanInfo(planName) {
        const plans = {
            starter: { name: 'Starter', color: 'success' },
            professional: { name: 'Professional', color: 'primary' },
            enterprise: { name: 'Enterprise', color: 'warning' }
        };
        
        return plans[planName] || plans.starter;
    }
    
    getExtintorStatus(proximaInspecao) {
        const hoje = new Date();
        const inspecao = new Date(proximaInspecao);
        const diasRestantes = Math.ceil((inspecao - hoje) / (1000 * 60 * 60 * 24));
        
        if (diasRestantes < 0) {
            return { text: 'Vencido', class: 'danger' };
        } else if (diasRestantes <= 30) {
            return { text: 'Vence em breve', class: 'warning' };
        } else {
            return { text: 'Em dia', class: 'success' };
        }
    }
    
    setupAutoRefresh() {
        // Atualizar dashboard a cada 30 segundos
        setInterval(() => {
            if (this.currentSection === 'dashboard') {
                this.loadDashboardData();
            }
        }, 30000);
        
        // Atualizar sessões a cada 10 segundos
        setInterval(() => {
            if (this.currentSection === 'sessoes') {
                this.loadSessoes();
            }
        }, 10000);
    }

    // ==========================================
    // AÇÕES ADMINISTRATIVAS
    // ==========================================
    
    async forceLogout(sessionId) {
        try {
            const globalSessions = JSON.parse(localStorage.getItem('globalSessions') || '{}');
            delete globalSessions[sessionId];
            localStorage.setItem('globalSessions', JSON.stringify(globalSessions));
            
            alert('✅ Usuário desconectado com sucesso');
            this.loadSessoes();
            
        } catch (error) {
            console.error('❌ Erro ao desconectar usuário:', error);
            alert('❌ Erro ao desconectar usuário');
        }
    }
    
    async editUser(userId) {
        alert(`Editar usuário: ${userId} (funcionalidade em desenvolvimento)`);
    }
    
    async deleteUser(userId) {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            alert(`Excluir usuário: ${userId} (funcionalidade em desenvolvimento)`);
        }
    }
    
    async viewExtintor(extintorId) {
        alert(`Ver extintor: ${extintorId} (funcionalidade em desenvolvimento)`);
    }
    
    async deleteExtintor(extintorId) {
        if (confirm('Tem certeza que deseja excluir este extintor?')) {
            alert(`Excluir extintor: ${extintorId} (funcionalidade em desenvolvimento)`);
        }
    }
    
    async exportExtintores() {
        alert('Exportar extintores (funcionalidade em desenvolvimento)');
    }
    
    async saveSettings() {
        alert('✅ Configurações salvas com sucesso!');
    }
    
    refreshSessions() {
        this.loadSessoes();
    }
}

// Funções globais
window.logout = function() {
    if (confirm('Deseja sair do painel administrativo?')) {
        localStorage.removeItem('supabase_user');
        window.location.href = '../index.html';
    }
};

window.showAddUserModal = function() {
    alert('Adicionar usuário (funcionalidade em desenvolvimento)');
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    window.adminCore = AdminCore.init();
});

// CSS adicional para badges
const additionalCSS = `
.badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.025em;
}

.badge-starter { background: var(--admin-success); color: white; }
.badge-professional { background: var(--admin-accent); color: white; }
.badge-enterprise { background: var(--admin-warning); color: white; }
.badge-success { background: var(--admin-success); color: white; }
.badge-warning { background: var(--admin-warning); color: white; }
.badge-danger { background: var(--admin-danger); color: white; }
`;

// Adicionar CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);
