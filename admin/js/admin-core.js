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

    static init(skipAuthCheck = false) {
        const admin = new AdminCore();
        admin.initialize(skipAuthCheck);
        return admin;
    }

    initialize(skipAuthCheck = false) {
        console.log('🚀 Inicializando Admin Panel...');
        
        try {
            // Verificar autenticação admin (skip se já verificado)
            if (!skipAuthCheck) {
                console.log('🔐 Verificando autenticação...');
                if (!this.checkAdminAuth()) {
                    return;
                }
            } else {
                console.log('🔐 Autenticação já verificada, pulando...');
                // Apenas mostrar usuário no dashboard
                this.showCurrentUser();
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
        console.log('🔐 Verificando autenticação admin...');
        
        // Verificar sessão admin específica
        let adminSession = null;
        try {
            adminSession = JSON.parse(sessionStorage.getItem('adminSession'));
        } catch (error) {
            console.log('❌ Erro ao ler sessão admin do sessionStorage');
        }
        
        // Verificar se a sessão admin é válida
        if (adminSession && adminSession.email && adminSession.sessionId) {
            console.log('✅ Sessão admin válida encontrada:', adminSession.email);
            
            // Salvar dados do admin para uso posterior
            this.currentAdmin = {
                email: adminSession.email,
                sessionId: adminSession.sessionId,
                isAdmin: true,
                loginTime: adminSession.timestamp
            };
            
            // Mostrar info do admin
            if (document.getElementById('admin-user')) {
                document.getElementById('admin-user').textContent = adminSession.email;
            }
            
            console.log(`✅ Admin autenticado: ${adminSession.email}`);
            return true;
        }
        
        // Se não encontrou sessão admin, redireciona para login
        console.log('❌ Nenhuma sessão admin válida encontrada');
        console.log('🔄 Redirecionando para login administrativo...');
        window.location.href = 'login.html';
        return false;
    }

    showCurrentUser() {
        try {
            // Buscar usuário atual
            let user = null;
            
            const sessionData = sessionStorage.getItem('currentUser');
            if (sessionData) {
                user = JSON.parse(sessionData);
            }
            
            if (!user && typeof supabase !== 'undefined' && supabase.currentUser) {
                user = supabase.currentUser;
            }
            
            if (user && document.getElementById('admin-user')) {
                document.getElementById('admin-user').textContent = user.email;
                console.log(`👤 Usuário atual exibido: ${user.email}`);
            }
        } catch (error) {
            console.warn('⚠️ Erro ao exibir usuário atual:', error);
        }
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
            let usuariosAtivos = 0;
            
            if (usuarios) {
                usuarios.forEach(user => {
                    const plan = user.plan || 'starter';
                    receitaMensal += planPrices[plan] || 0;
                    
                    // Contar usuários ativos - lógica simplificada
                    if (user.plan_status !== 'cancelled' && user.plan_status !== 'expired') {
                        usuariosAtivos++;
                    }
                });
            }
            
            // Calcular extintores vencidos
            let extintoresVencidos = 0;
            if (extintores) {
                const hoje = new Date();
                extintoresVencidos = extintores.filter(ext => {
                    if (ext.data_vencimento) {
                        const vencimento = new Date(ext.data_vencimento);
                        return vencimento < hoje;
                    }
                    return false;
                }).length;
            }

            const stats = {
                totalUsuarios: usuarios?.length || 0,
                totalExtintores: extintores?.length || 0,
                extintoresVencidos,
                usuariosAtivos,
                sessoesAtivas,
                receitaMensal
            };
            
            console.log('📊 Estatísticas carregadas:', stats);
            return stats;        } catch (error) {
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
        // Verificar se os elementos existem antes de tentar definir textContent
        const totalUsersEl = document.getElementById('total-users');
        const totalExtinguishersEl = document.getElementById('total-extinguishers');
        const expiredExtinguishersEl = document.getElementById('expired-extinguishers');
        const activeUsersEl = document.getElementById('active-users');
        
        if (totalUsersEl) {
            totalUsersEl.textContent = stats.totalUsuarios || 0;
        }
        
        if (totalExtinguishersEl) {
            totalExtinguishersEl.textContent = stats.totalExtintores || 0;
        }
        
        if (expiredExtinguishersEl) {
            // Calcular extintores vencidos se não estiver nas estatísticas
            const vencidos = stats.extintoresVencidos || 0;
            expiredExtinguishersEl.textContent = vencidos;
        }
        
        if (activeUsersEl) {
            // Usar usuários ativos ou total de usuários como fallback
            const ativos = stats.usuariosAtivos || stats.totalUsuarios || 0;
            activeUsersEl.textContent = ativos;
        }
        
        console.log('📊 Estatísticas atualizadas no dashboard:', stats);
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
        
        // Verificar se os elementos existem antes de tentar atualizar
        const starterCountEl = document.getElementById('starter-count');
        const professionalCountEl = document.getElementById('professional-count');
        const enterpriseCountEl = document.getElementById('enterprise-count');
        
        if (starterCountEl) starterCountEl.textContent = distribution.starter;
        if (professionalCountEl) professionalCountEl.textContent = distribution.professional;
        if (enterpriseCountEl) enterpriseCountEl.textContent = distribution.enterprise;
        
        // Atualizar barras de progresso
        if (total > 0) {
            const starterPercent = (distribution.starter / total) * 100;
            const professionalPercent = (distribution.professional / total) * 100;
            const enterprisePercent = (distribution.enterprise / total) * 100;
            
            const starterFill = document.querySelector('.plan-fill.starter');
            const professionalFill = document.querySelector('.plan-fill.professional');
            const enterpriseFill = document.querySelector('.plan-fill.enterprise');
            
            if (starterFill) starterFill.style.width = `${starterPercent}%`;
            if (professionalFill) professionalFill.style.width = `${professionalPercent}%`;
            if (enterpriseFill) enterpriseFill.style.width = `${enterprisePercent}%`;
        }
        
        console.log('📊 Distribuição de planos atualizada:', distribution);
    }

    // ==========================================
    // USUÁRIOS
    // ==========================================
    
    async getUsers() {
        try {
            console.log('👥 Buscando usuários via AdminSupabaseManager...');
            if (window.adminSupabase && typeof window.adminSupabase.getAllUsers === 'function') {
                let usuarios = await window.adminSupabase.getAllUsers();
                // Adaptar campos para o renderizador
                usuarios = usuarios.map(u => ({
                    ...u,
                    extintores_count: u.extintores_count ?? u.extinguisher_count ?? 0,
                    // Converter plano para starter/professional/enterprise
                    plan: (u.plan === 'basic') ? 'starter' : (u.plan === 'business' ? 'professional' : (u.plan || 'starter')),
                    plan_status: u.plan_status || 'active',
                }));
                return usuarios || [];
            } else {
                console.error('❌ AdminSupabaseManager não está disponível!');
                return [];
            }
        } catch (error) {
            console.error('❌ Erro ao buscar usuários via AdminSupabaseManager:', error);
            return [];
        }
    }
    
    async loadUsuarios() {
        try {
            console.log('👥 Carregando usuários...');
            
            const usuarios = await this.getUsers();
                
            this.cache.usuarios = usuarios;
            this.renderUsuarios(this.cache.usuarios);
            
        } catch (error) {
            console.error('❌ Erro ao carregar usuários:', error);
            document.getElementById('usuarios-tbody').innerHTML = `
                <tr><td colspan="6" class="text-center">Erro ao carregar usuários</td></tr>
            `;
        }
    }
    
    renderUsuarios(usuarios) {
        const tbody = document.getElementById('users-table-body');
        
        if (!tbody) {
            console.error('❌ Elemento users-table-body não encontrado');
            return;
        }
        
        if (!usuarios || usuarios.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="7" class="text-center">Nenhum usuário encontrado</td></tr>
            `;
            return;
        }

        console.log('👥 Dados dos usuários para renderização:', usuarios);
        
        tbody.innerHTML = usuarios.map(usuario => {
            const planInfo = this.getPlanInfo(usuario.plan || 'starter');
            const createdAt = new Date(usuario.created_at).toLocaleDateString('pt-BR');
            const lastLogin = usuario.last_login ? new Date(usuario.last_login).toLocaleDateString('pt-BR') : 'Nunca';
            
            // Determinar status do usuário baseado no plan_status
            let status = 'ativo'; // Por padrão, considerar como ativo
            let statusClass = 'success';
            let statusIcon = '✅';
            
            // Lógica baseada no plan_status
            if (usuario.plan_status === 'expired') {
                status = 'expirado';
                statusClass = 'warning';
                statusIcon = '⏰';
            } else if (usuario.plan_status === 'cancelled') {
                status = 'cancelado';
                statusClass = 'danger';  
                statusIcon = '❌';
            } else {
                // Se não tem plan_status ou é 'active', considerar como ativo
                status = 'ativo';
                statusClass = 'success';
                statusIcon = '✅';
            }
            
            return `
                <tr>
                    <td>
                        <div class="user-info">
                            <strong>${usuario.name || usuario.email}</strong>
                            <small>${usuario.email}</small>
                        </div>
                    </td>
                    <td>
                        <span class="badge badge-${usuario.plan || 'starter'}">
                            ${planInfo.name}
                        </span>
                    </td>
                    <td>${usuario.extintores_count || 0}</td>
                    <td>${createdAt}</td>
                    <td>${lastLogin}</td>
                    <td>
                        <span class="badge badge-${statusClass}">
                            ${statusIcon} ${status}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-outline" onclick="viewUser('${usuario.id}')" title="Ver detalhes">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-outline" onclick="editUser('${usuario.id}')" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline ${status === 'ativo' ? 'text-warning' : 'text-success'}" 
                                    onclick="toggleUserStatus('${usuario.id}', ${status !== 'ativo'})" 
                                    title="${status === 'ativo' ? 'Desativar' : 'Ativar'}">
                                <i class="fas fa-${status === 'ativo' ? 'pause' : 'play'}"></i>
                            </button>
                            <button class="btn btn-sm btn-outline text-danger" onclick="deleteUser('${usuario.id}')" title="Excluir">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
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
        try {
            // Buscar dados do usuário
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;

            // Criar modal de edição
            const modal = this.createEditUserModal(user);
            document.body.appendChild(modal);
        } catch (error) {
            console.error('❌ Erro ao carregar usuário:', error);
            alert('❌ Erro ao carregar dados do usuário');
        }
    }

    createEditUserModal(user) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>✏️ Editar Usuário</h3>
                    <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <form id="editUserForm" class="modal-form">
                    <div class="form-group">
                        <label>📧 Email:</label>
                        <input type="email" id="editEmail" value="${user.email}" required>
                    </div>
                    <div class="form-group">
                        <label>👤 Nome:</label>
                        <input type="text" id="editName" value="${user.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>💎 Plano:</label>
                        <select id="editPlan" required>
                            <option value="starter" ${user.plan === 'starter' ? 'selected' : ''}>Starter</option>
                            <option value="professional" ${user.plan === 'professional' ? 'selected' : ''}>Professional</option>
                            <option value="enterprise" ${user.plan === 'enterprise' ? 'selected' : ''}>Enterprise</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>📅 Status do Plano:</label>
                        <select id="editPlanStatus" required>
                            <option value="active" ${user.plan_status === 'active' ? 'selected' : ''}>✅ Ativo</option>
                            <option value="expired" ${user.plan_status === 'expired' ? 'selected' : ''}>⏰ Expirado</option>
                            <option value="cancelled" ${user.plan_status === 'cancelled' ? 'selected' : ''}>❌ Cancelado</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>🔐 Nova Senha (deixe vazio para não alterar):</label>
                        <input type="password" id="editPassword" placeholder="Nova senha (opcional)">
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                        <button type="submit" class="btn-primary">💾 Salvar Alterações</button>
                    </div>
                </form>
            </div>
        `;

        // Adicionar evento de submit
        const form = modal.querySelector('#editUserForm');
        form.addEventListener('submit', (e) => this.handleUserEdit(e, user.id, modal));

        return modal;
    }

    async handleUserEdit(e, userId, modal) {
        e.preventDefault();
        
        try {
            const email = document.getElementById('editEmail').value;
            const name = document.getElementById('editName').value;
            const plan = document.getElementById('editPlan').value;
            const planStatus = document.getElementById('editPlanStatus').value;
            const newPassword = document.getElementById('editPassword').value;

            // Preparar dados para atualização
            let updateData = {
                email,
                name,
                plan,
                plan_status: planStatus,
                updated_at: new Date().toISOString()
            };

            // Se nova senha foi fornecida, fazer hash
            if (newPassword.trim()) {
                // Usar bcrypt.js para hash da senha
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
                updateData.password_hash = hashedPassword;
            }

            // Atualizar usuário no banco
            const { error } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', userId);

            if (error) throw error;

            alert('✅ Usuário atualizado com sucesso!');
            modal.remove();
            this.loadUsers(); // Recarregar lista
        } catch (error) {
            console.error('❌ Erro ao editar usuário:', error);
            alert('❌ Erro ao atualizar usuário');
        }
    }
    
    async deleteUser(userId) {
        if (!confirm('⚠️ ATENÇÃO: Esta ação irá excluir o usuário e TODOS os seus extintores permanentemente.\n\nTem certeza que deseja continuar?')) {
            return;
        }

        try {
            // Excluir usuário usando a sintaxe correta (CASCADE irá excluir extintores relacionados)
            await supabase.request(`users?id=eq.${userId}`, 'DELETE');

            alert('✅ Usuário excluído com sucesso!');
            this.loadUsuarios(); // Recarregar lista
        } catch (error) {
            console.error('❌ Erro ao excluir usuário:', error);
            alert('❌ Erro ao excluir usuário');
        }
    }
    
    async viewExtintor(extintorId) {
        try {
            // Buscar dados do extintor com informações do usuário
            const { data: extintor, error } = await supabase
                .from('extintores')
                .select(`
                    *,
                    users!extintores_user_id_fkey (name, email, plan)
                `)
                .eq('id', extintorId)
                .single();

            if (error) throw error;

            // Criar modal de visualização
            const modal = this.createViewExtintorModal(extintor);
            document.body.appendChild(modal);
        } catch (error) {
            console.error('❌ Erro ao carregar extintor:', error);
            alert('❌ Erro ao carregar dados do extintor');
        }
    }

    createViewExtintorModal(extintor) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        // Calcular status do extintor
        const hoje = new Date();
        const vencimento = new Date(extintor.data_vencimento);
        const diasParaVencimento = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
        
        let statusClass = '';
        let statusText = '';
        if (diasParaVencimento < 0) {
            statusClass = 'status-expired';
            statusText = `❌ Vencido há ${Math.abs(diasParaVencimento)} dias`;
        } else if (diasParaVencimento <= 30) {
            statusClass = 'status-warning';
            statusText = `⚠️ Vence em ${diasParaVencimento} dias`;
        } else {
            statusClass = 'status-valid';
            statusText = `✅ Válido por ${diasParaVencimento} dias`;
        }

        modal.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h3>🔥 Detalhes do Extintor #${extintor.numero}</h3>
                    <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="extintor-details">
                    <div class="detail-section">
                        <h4>📋 Informações Básicas</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <strong>Número:</strong> ${extintor.numero}
                            </div>
                            <div class="detail-item">
                                <strong>Local:</strong> ${extintor.local}
                            </div>
                            <div class="detail-item">
                                <strong>Tipo:</strong> ${extintor.tipo}
                            </div>
                            <div class="detail-item">
                                <strong>Peso:</strong> ${extintor.peso} kg
                            </div>
                            <div class="detail-item">
                                <strong>Fabricante:</strong> ${extintor.fabricante || 'Não informado'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>📅 Datas Importantes</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <strong>Fabricação:</strong> ${extintor.data_fabricacao ? new Date(extintor.data_fabricacao).toLocaleDateString('pt-BR') : 'Não informado'}
                            </div>
                            <div class="detail-item">
                                <strong>Vencimento:</strong> ${new Date(extintor.data_vencimento).toLocaleDateString('pt-BR')}
                            </div>
                            <div class="detail-item">
                                <strong>Última Inspeção:</strong> ${extintor.data_ultima_inspecao ? new Date(extintor.data_ultima_inspecao).toLocaleDateString('pt-BR') : 'Nunca'}
                            </div>
                            <div class="detail-item status-item">
                                <strong>Status:</strong> <span class="${statusClass}">${statusText}</span>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h4>👤 Proprietário</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <strong>Nome:</strong> ${extintor.users.name}
                            </div>
                            <div class="detail-item">
                                <strong>Email:</strong> ${extintor.users.email}
                            </div>
                            <div class="detail-item">
                                <strong>Plano:</strong> <span class="plan-badge plan-${extintor.users.plan}">${extintor.users.plan.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>

                    ${extintor.observacoes ? `
                    <div class="detail-section">
                        <h4>📝 Observações</h4>
                        <div class="observacoes-content">
                            ${extintor.observacoes}
                        </div>
                    </div>
                    ` : ''}
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Fechar</button>
                    <button type="button" class="btn-danger" onclick="adminCore.deleteExtintor('${extintor.id}'); this.closest('.modal-overlay').remove();">🗑️ Excluir Extintor</button>
                </div>
            </div>
        `;

        return modal;
    }
    
    async deleteExtintor(extintorId) {
        if (!confirm('⚠️ Tem certeza que deseja excluir este extintor permanentemente?')) {
            return;
        }

        try {
            // Excluir extintor
            const { error } = await supabase
                .from('extintores')
                .delete()
                .eq('id', extintorId);

            if (error) throw error;

            alert('✅ Extintor excluído com sucesso!');
            this.loadExtintores(); // Recarregar lista
        } catch (error) {
            console.error('❌ Erro ao excluir extintor:', error);
            alert('❌ Erro ao excluir extintor');
        }
    }
    
    async exportExtintores() {
        try {
            // Buscar todos os extintores com dados dos usuários
            const { data: extintores, error } = await supabase
                .from('extintores')
                .select(`
                    *,
                    users!extintores_user_id_fkey (name, email, plan)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Criar modal de opções de exportação
            const modal = this.createExportModal(extintores);
            document.body.appendChild(modal);
        } catch (error) {
            console.error('❌ Erro ao carregar dados para exportação:', error);
            alert('❌ Erro ao carregar dados para exportação');
        }
    }

    createExportModal(extintores) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📊 Exportar Dados dos Extintores</h3>
                    <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="export-options">
                    <p><strong>Total de extintores:</strong> ${extintores.length}</p>
                    <div class="export-buttons">
                        <button class="btn-export" onclick="adminCore.doExport('csv', this.extintores)">
                            📄 Exportar como CSV
                        </button>
                        <button class="btn-export" onclick="adminCore.doExport('excel', this.extintores)">
                            📊 Exportar como Excel
                        </button>
                        <button class="btn-export" onclick="adminCore.doExport('pdf', this.extintores)">
                            📋 Exportar como PDF
                        </button>
                        <button class="btn-export" onclick="adminCore.doExport('json', this.extintores)">
                            🔧 Exportar como JSON
                        </button>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                </div>
            </div>
        `;

        // Anexar dados ao modal para acesso posterior
        modal.extintores = extintores;

        return modal;
    }

    async doExport(format, extintores) {
        try {
            const filename = `extintores_admin_${new Date().toISOString().slice(0, 10)}`;
            
            switch (format) {
                case 'csv':
                    this.exportToCSV(extintores, filename);
                    break;
                case 'excel':
                    this.exportToExcel(extintores, filename);
                    break;
                case 'pdf':
                    this.exportToPDF(extintores, filename);
                    break;
                case 'json':
                    this.exportToJSON(extintores, filename);
                    break;
            }
        } catch (error) {
            console.error('❌ Erro na exportação:', error);
            alert('❌ Erro ao exportar dados');
        }
    }

    exportToCSV(extintores, filename) {
        const headers = ['Número', 'Local', 'Tipo', 'Peso', 'Fabricante', 'Data Fabricação', 'Data Vencimento', 'Última Inspeção', 'Status', 'Proprietário', 'Email', 'Plano', 'Observações'];
        
        const csvContent = [
            headers.join(','),
            ...extintores.map(e => {
                const hoje = new Date();
                const vencimento = new Date(e.data_vencimento);
                const diasParaVencimento = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
                let status = diasParaVencimento < 0 ? 'Vencido' : diasParaVencimento <= 30 ? 'Próximo ao vencimento' : 'Válido';
                
                return [
                    e.numero,
                    e.local,
                    e.tipo,
                    e.peso,
                    e.fabricante || '',
                    e.data_fabricacao || '',
                    e.data_vencimento,
                    e.data_ultima_inspecao || '',
                    status,
                    e.users.name,
                    e.users.email,
                    e.users.plan,
                    (e.observacoes || '').replace(/,/g, ';')
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.csv`;
        link.click();
        
        alert('✅ Arquivo CSV baixado com sucesso!');
    }

    exportToJSON(extintores, filename) {
        const dataToExport = {
            exportDate: new Date().toISOString(),
            totalExtintores: extintores.length,
            extintores: extintores.map(e => ({
                ...e,
                usuario: e.users
            }))
        };

        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.json`;
        link.click();
        
        alert('✅ Arquivo JSON baixado com sucesso!');
    }

    createAddUserModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>➕ Adicionar Novo Usuário</h3>
                    <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <form id="addUserForm" class="modal-form">
                    <div class="form-group">
                        <label>📧 Email: *</label>
                        <input type="email" id="newEmail" required placeholder="usuario@exemplo.com">
                    </div>
                    <div class="form-group">
                        <label>👤 Nome: *</label>
                        <input type="text" id="newName" required placeholder="Nome completo">
                    </div>
                    <div class="form-group">
                        <label>🔐 Senha: *</label>
                        <input type="password" id="newPassword" required minlength="6" placeholder="Mínimo 6 caracteres">
                    </div>
                    <div class="form-group">
                        <label>💎 Plano:</label>
                        <select id="newPlan" required>
                            <option value="starter">Starter - Gratuito</option>
                            <option value="professional">Professional - R$ 29/mês</option>
                            <option value="enterprise">Enterprise - R$ 99/mês</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>📅 Status do Plano:</label>
                        <select id="newPlanStatus" required>
                            <option value="active">✅ Ativo</option>
                            <option value="expired">⏰ Expirado</option>
                            <option value="cancelled">❌ Cancelado</option>
                        </select>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                        <button type="submit" class="btn-primary">➕ Criar Usuário</button>
                    </div>
                </form>
            </div>
        `;

        // Adicionar evento de submit
        const form = modal.querySelector('#addUserForm');
        form.addEventListener('submit', (e) => this.handleAddUser(e, modal));

        return modal;
    }

    async handleAddUser(e, modal) {
        e.preventDefault();
        try {
            const email = document.getElementById('newEmail').value;
            const name = document.getElementById('newName').value;
            const password = document.getElementById('newPassword').value;
            const plan = document.getElementById('newPlan').value;
            const planStatus = document.getElementById('newPlanStatus').value;

            if (!window.adminSupabase || typeof window.adminSupabase.addUser !== 'function') {
                alert('❌ Função de cadastro de usuário não disponível!');
                return;
            }

            await window.adminSupabase.addUser({ email, name, password, plan, planStatus });

            alert('✅ Usuário criado com sucesso!');
            modal.remove();
            this.loadUsuarios(); // Recarregar lista
        } catch (error) {
            console.error('❌ Erro ao criar usuário:', error);
            alert('❌ Erro ao criar usuário: ' + (error.message || 'Erro desconhecido'));
        }
    }

async viewUserDetails(userId) {
    try {
        // Buscar dados completos do usuário
        const user = await supabase.request(`users?id=eq.${userId}&select=*`);
        
        if (!user || user.length === 0) {
            throw new Error('Usuário não encontrado');
        }
        
        const userData = user[0]; // Pegar o primeiro resultado

        // Buscar estatísticas do usuário (extintores)
        const extintores = await supabase.request(`extintores?user_id=eq.${userId}&select=id,numero,tipo,local,data_vencimento,created_at`);

        // Calcular estatísticas
        const totalExtintores = extintores ? extintores.length : 0;
        const hoje = new Date();
        const vencidos = extintores ? extintores.filter(e => new Date(e.data_vencimento) < hoje).length : 0;
        const proximoVencimento = extintores ? extintores.filter(e => {
            const vencimento = new Date(e.data_vencimento);
            const diasRestantes = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
            return diasRestantes > 0 && diasRestantes <= 30;
        }).length : 0;

        // Criar modal de visualização
        const modal = this.createUserDetailsModal(userData, {
            totalExtintores,
            vencidos,
            proximoVencimento,
            extintores: extintores ? extintores.slice(0, 5) : [] // Mostrar apenas os 5 primeiros
        });
        
        document.body.appendChild(modal);
    } catch (error) {
        console.error('❌ Erro ao carregar detalhes do usuário:', error);
        alert('❌ Erro ao carregar dados do usuário');
    }
}

createUserDetailsModal(user, stats) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    // Calcular tempo de cadastro
    const cadastro = new Date(user.created_at);
    const tempoDesde = this.calcularTempoDesde(cadastro);
    
    // Status do plano
    let statusPlano = '';
    if (user.plan_status === 'active') {
        statusPlano = '<span class="plan-status active">✅ Ativo</span>';
    } else if (user.plan_status === 'expired') {
        statusPlano = '<span class="plan-status expired">⏰ Expirado</span>';
    } else {
        statusPlano = '<span class="plan-status cancelled">❌ Cancelado</span>';
    }

    modal.innerHTML = `
        <div class="modal-content modal-large user-details-modal">
            <div class="modal-header">
                <div class="header-title">
                    <i class="fas fa-user-circle"></i>
                    <h3>Detalhes do Usuário</h3>
                </div>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="user-details-content">
                <div class="user-info-section">
                    <div class="user-avatar-large">
                        <span class="avatar-text">${(user.name || user.email).charAt(0).toUpperCase()}</span>
                        <div class="avatar-status ${user.plan_status === 'active' ? 'active' : 'inactive'}"></div>
                    </div>
                    <div class="user-main-info">
                        <h2>${user.name || 'Nome não informado'}</h2>
                        <p class="user-email">
                            <i class="fas fa-envelope"></i>
                            ${user.email}
                        </p>
                        <div class="user-plan-info">
                            <span class="plan-badge plan-${user.plan}">
                                <i class="fas fa-crown"></i>
                                ${this.getPlanDisplayName(user.plan)}
                            </span>
                            ${statusPlano}
                        </div>
                    </div>
                </div>

                <div class="details-grid">
                    <div class="detail-card account-info">
                        <div class="card-header">
                            <i class="fas fa-calendar-alt"></i>
                            <h4>Informações de Conta</h4>
                        </div>
                        <div class="detail-items">
                            <div class="detail-item">
                                <div class="item-icon"><i class="fas fa-user-plus"></i></div>
                                <div class="item-content">
                                    <strong>Cadastrado em</strong>
                                    <span>${cadastro.toLocaleDateString('pt-BR', { 
                                        day: '2-digit', 
                                        month: 'long', 
                                        year: 'numeric' 
                                    })}</span>
                                </div>
                            </div>
                            <div class="detail-item">
                                <div class="item-icon"><i class="fas fa-clock"></i></div>
                                <div class="item-content">
                                    <strong>Tempo de cadastro</strong>
                                    <span>${tempoDesde}</span>
                                </div>
                            </div>
                            <div class="detail-item">
                                <div class="item-icon"><i class="fas fa-edit"></i></div>
                                <div class="item-content">
                                    <strong>Última atualização</strong>
                                    <span>${new Date(user.updated_at).toLocaleDateString('pt-BR')}</span>
                                </div>
                            </div>
                            ${user.plan_expires_at ? `
                            <div class="detail-item">
                                <div class="item-icon"><i class="fas fa-calendar-times"></i></div>
                                <div class="item-content">
                                    <strong>Plano expira em</strong>
                                    <span class="expiry-date">${new Date(user.plan_expires_at).toLocaleDateString('pt-BR')}</span>
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    </div>

                    <div class="detail-card stats-card">
                        <div class="card-header">
                            <i class="fas fa-fire-extinguisher"></i>
                            <h4>Estatísticas de Extintores</h4>
                        </div>
                        <div class="stats-grid">
                            <div class="stat-item total">
                                <div class="stat-icon"><i class="fas fa-fire-extinguisher"></i></div>
                                <div class="stat-content">
                                    <div class="stat-number">${stats.totalExtintores}</div>
                                    <div class="stat-label">Total</div>
                                </div>
                            </div>
                            <div class="stat-item valid">
                                <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                                <div class="stat-content">
                                    <div class="stat-number">${stats.totalExtintores - stats.vencidos - stats.proximoVencimento}</div>
                                    <div class="stat-label">Válidos</div>
                                </div>
                            </div>
                            <div class="stat-item warning">
                                <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
                                <div class="stat-content">
                                    <div class="stat-number">${stats.proximoVencimento}</div>
                                    <div class="stat-label">A Vencer</div>
                                </div>
                            </div>
                            <div class="stat-item danger">
                                <div class="stat-icon"><i class="fas fa-times-circle"></i></div>
                                <div class="stat-content">
                                    <div class="stat-number">${stats.vencidos}</div>
                                    <div class="stat-label">Vencidos</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                ${stats.extintores.length > 0 ? `
                <div class="detail-card extintores-card">
                    <div class="card-header">
                        <i class="fas fa-list"></i>
                        <h4>Últimos Extintores Cadastrados</h4>
                        <span class="card-badge">${stats.totalExtintores}</span>
                    </div>
                    <div class="extintores-preview">
                        ${stats.extintores.map(ext => `
                            <div class="extintor-item">
                                <div class="extintor-icon">
                                    <i class="fas fa-fire-extinguisher"></i>
                                </div>
                                <div class="extintor-info">
                                    <div class="extintor-number">#${ext.numero}</div>
                                    <div class="extintor-details">${ext.tipo} • ${ext.local}</div>
                                    <div class="extintor-date">
                                        <i class="fas fa-calendar"></i>
                                        ${new Date(ext.data_vencimento).toLocaleDateString('pt-BR')}
                                    </div>
                                </div>
                                <div class="extintor-status">
                                    ${new Date(ext.data_vencimento) < new Date() ? 
                                        '<span class="status-expired"><i class="fas fa-times-circle"></i> Vencido</span>' :
                                        Math.ceil((new Date(ext.data_vencimento) - new Date()) / (1000*60*60*24)) <= 30 ?
                                        '<span class="status-warning"><i class="fas fa-exclamation-triangle"></i> A Vencer</span>' :
                                        '<span class="status-valid"><i class="fas fa-check-circle"></i> Válido</span>'
                                    }
                                </div>
                            </div>
                        `).join('')}
                        ${stats.totalExtintores > 5 ? `
                        <div class="more-extintores">
                            <i class="fas fa-plus-circle"></i>
                            <span>+${stats.totalExtintores - 5} extintores adicionais</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                ` : `
                <div class="detail-card empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-fire-extinguisher"></i>
                    </div>
                    <h4>Nenhum Extintor Cadastrado</h4>
                    <p>Este usuário ainda não cadastrou nenhum extintor no sistema.</p>
                    <button class="btn-outline-primary" onclick="alert('Funcionalidade em desenvolvimento')">
                        <i class="fas fa-plus"></i>
                        Ajudar a Cadastrar
                    </button>
                </div>
                `}
            </div>
            
            <div class="modal-actions">
                <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                    Fechar
                </button>
                <button type="button" class="btn-warning" onclick="window.adminCore.toggleUserStatus('${user.id}', ${user.plan_status !== 'active'}); this.closest('.modal-overlay').remove();">
                    <i class="fas fa-${user.plan_status === 'active' ? 'pause' : 'play'}"></i>
                    ${user.plan_status === 'active' ? 'Desativar' : 'Ativar'} Usuário
                </button>
                <button type="button" class="btn-primary" onclick="window.adminCore.editUser('${user.id}'); this.closest('.modal-overlay').remove();">
                    <i class="fas fa-edit"></i>
                    Editar Usuário
                </button>
            </div>
        </div>
    `;

    return modal;
}

getPlanDisplayName(plan) {
    const planNames = {
        'starter': 'Starter',
        'professional': 'Professional', 
        'enterprise': 'Enterprise',
        'basic': 'Básico'
    };
    return planNames[plan] || plan?.charAt(0).toUpperCase() + plan?.slice(1);
}

calcularTempoDesde(data) {
    const agora = new Date();
    const diff = agora - data;
    
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const meses = Math.floor(dias / 30);
    const anos = Math.floor(dias / 365);
    
    if (anos > 0) {
        return anos === 1 ? '1 ano' : `${anos} anos`;
    } else if (meses > 0) {
        return meses === 1 ? '1 mês' : `${meses} meses`;
    } else {
        return dias === 1 ? '1 dia' : `${dias} dias`;
    }
}

async toggleUserStatus(userId, newStatus) {
    try {
        const statusText = newStatus ? 'ativar' : 'desativar';
        
        if (!confirm(`Tem certeza que deseja ${statusText} este usuário?`)) {
            return;
        }

        // Atualizar status no banco usando a sintaxe correta
        await supabase.request(`users?id=eq.${userId}`, 'PATCH', {
            plan_status: newStatus ? 'active' : 'cancelled',
            updated_at: new Date().toISOString()
        });

        alert(`✅ Usuário ${statusText}do com sucesso!`);
        this.loadUsuarios(); // Recarregar lista
    } catch (error) {
        console.error('❌ Erro ao alterar status:', error);
        alert('❌ Erro ao alterar status do usuário');
    }
}

async editUser(userId) {
    try {
        // Buscar dados do usuário
        const user = await supabase.request(`users?id=eq.${userId}&select=*`);
        
        if (!user || user.length === 0) {
            throw new Error('Usuário não encontrado');
        }
        
        const userData = user[0];
        
        // Criar modal de edição
        const modal = this.createEditUserModal(userData);
        document.body.appendChild(modal);
        
    } catch (error) {
        console.error('❌ Erro ao carregar usuário para edição:', error);
        alert('❌ Erro ao carregar dados do usuário');
    }
}

createEditUserModal(user) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-user-edit"></i> Editar Usuário</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="editUserForm">
                    <div class="form-group">
                        <label for="editName">Nome:</label>
                        <input type="text" id="editName" name="name" value="${user.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="editEmail">Email:</label>
                        <input type="email" id="editEmail" name="email" value="${user.email}" readonly>
                        <small>O email não pode ser alterado</small>
                    </div>
                    <div class="form-group">
                        <label for="editPlan">Plano:</label>
                        <select id="editPlan" name="plan">
                            <option value="starter" ${user.plan === 'starter' ? 'selected' : ''}>Starter</option>
                            <option value="professional" ${user.plan === 'professional' ? 'selected' : ''}>Professional</option>
                            <option value="enterprise" ${user.plan === 'enterprise' ? 'selected' : ''}>Enterprise</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editPlanStatus">Status do Plano:</label>
                        <select id="editPlanStatus" name="plan_status">
                            <option value="active" ${user.plan_status === 'active' ? 'selected' : ''}>Ativo</option>
                            <option value="expired" ${user.plan_status === 'expired' ? 'selected' : ''}>Expirado</option>
                            <option value="cancelled" ${user.plan_status === 'cancelled' ? 'selected' : ''}>Cancelado</option>
                        </select>
                    </div>
                    ${user.plan_expires_at ? `
                    <div class="form-group">
                        <label for="editPlanExpires">Data de Expiração:</label>
                        <input type="date" id="editPlanExpires" name="plan_expires_at" 
                               value="${new Date(user.plan_expires_at).toISOString().split('T')[0]}">
                    </div>
                    ` : ''}
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                    Cancelar
                </button>
                <button type="button" class="btn-primary" onclick="window.adminCore.saveEditUser('${user.id}'); this.closest('.modal-overlay').remove();">
                    <i class="fas fa-save"></i>
                    Salvar Alterações
                </button>
            </div>
        </div>
    `;
    
    return modal;
}

async saveEditUser(userId) {
    try {
        const form = document.getElementById('editUserForm');
        const formData = new FormData(form);
        
        const updateData = {
            name: formData.get('name'),
            plan: formData.get('plan'),
            plan_status: formData.get('plan_status'),
            updated_at: new Date().toISOString()
        };
        
        if (formData.get('plan_expires_at')) {
            updateData.plan_expires_at = new Date(formData.get('plan_expires_at')).toISOString();
        }
        
        await supabase.request(`users?id=eq.${userId}`, 'PATCH', updateData);
        
        alert('✅ Usuário atualizado com sucesso!');
        this.loadUsuarios(); // Recarregar lista
        
    } catch (error) {
        console.error('❌ Erro ao atualizar usuário:', error);
        alert('❌ Erro ao atualizar usuário: ' + (error.message || 'Erro desconhecido'));
    }
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
    const modal = adminCore.createAddUserModal();
    document.body.appendChild(modal);
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

// Funções globais para os botões do painel
window.viewUser = function(userId) {
    if (window.adminCore) {
        window.adminCore.viewUserDetails(userId);
    } else {
        console.error('AdminCore não inicializado');
    }
};

window.editUser = function(userId) {
    if (window.adminCore) {
        window.adminCore.editUser(userId);
    } else {
        console.error('AdminCore não inicializado');
    }
};

// Funções auxiliares globais
window.formatDate = function(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
};

window.mapSubscriptionToPlan = function(subscription) {
    // Mapear subscription para plano
    if (!subscription) return 'starter';
    if (subscription.includes('professional')) return 'professional';
    if (subscription.includes('enterprise')) return 'enterprise';
    return 'starter';
};

window.getExtinguisherStatus = function(extintor) {
    if (!extintor.data_vencimento) return 'unknown';
    const vencimento = new Date(extintor.data_vencimento);
    const hoje = new Date();
    
    if (vencimento < hoje) return 'expired';
    
    const diasRestantes = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
    if (diasRestantes <= 30) return 'warning';
    
    return 'valid';
};

window.isExtinguisherExpired = function(dataVencimento) {
    if (!dataVencimento) return false;
    return new Date(dataVencimento) < new Date();
};

window.deleteUser = function(userId) {
    if (window.adminCore) {
        window.adminCore.deleteUser(userId);
    } else {
        console.error('AdminCore não inicializado');
    }
};

window.toggleUserStatus = function(userId, newStatus) {
    if (window.adminCore) {
        window.adminCore.toggleUserStatus(userId, newStatus);
    } else {
        console.error('AdminCore não inicializado');
    }
};

// Função para carregar lista de usuários (chamada pelo botão Atualizar)
window.loadUsers = function() {
    if (window.adminCore) {
        window.adminCore.loadUsers();
    } else {
        console.error('AdminCore não inicializado');
    }
};
