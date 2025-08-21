// =============================================================================
// ADMIN SUPABASE MANAGER
// =============================================================================

class AdminSupabaseManager {
    /**
     * Adicionar novo usuário (admin)
     */
    async addUser({ email, name, password, plan, planStatus }) {
        // Verificar se email já existe
        const { data: existingUser } = await this.supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            throw new Error('Este email já está cadastrado no sistema');
        }

        // Hash da senha
        if (!window.bcrypt || typeof window.bcrypt.hash !== 'function') {
            throw new Error('A biblioteca de hash de senha (bcrypt) não foi carregada corretamente. Recarregue a página e tente novamente.');
        }
        const saltRounds = 10;
        const hashedPassword = await window.bcrypt.hash(password, saltRounds);

        // Calcular data de expiração do plano (30 dias a partir de hoje)
        const planExpiresAt = new Date();
        planExpiresAt.setDate(planExpiresAt.getDate() + 30);

        // Inserir novo usuário
        const { error } = await this.supabase
            .from('users')
            .insert({
                email,
                name,
                password_hash: hashedPassword,
                plan,
                plan_status: planStatus,
                plan_expires_at: planExpiresAt.toISOString(),
                subscription: plan === 'starter' ? 'basic' : plan
            });

        if (error) throw error;
        return true;
    }
    constructor() {
        this.baseUrl = SUPABASE_CONFIG.url;
        this.apiKey = SUPABASE_CONFIG.anonKey;
        this.serviceRoleKey = SUPABASE_CONFIG.serviceRoleKey; // Será necessário adicionar
        
        // Inicializar cliente Supabase
        if (typeof window !== 'undefined' && window.supabase) {
            this.supabase = window.supabase.createClient(this.baseUrl, this.apiKey);
        }
        
        console.log('🔧 AdminSupabaseManager inicializado');
    }

    // =============================================================================
    // USUÁRIOS - OPERAÇÕES ADMINISTRATIVAS
    // =============================================================================

    /**
     * Buscar todos os usuários (operação admin)
     */
    async getAllUsers() {
        try {
            console.log('📋 Buscando todos os usuários...');

            const { data: users, error } = await this.supabase
                .from('users')
                .select(`
                    id,
                    email,
                    name,
                    subscription,
                    created_at,
                    updated_at,
                    extintores:extintores(count)
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Erro ao buscar usuários:', error);
                throw error;
            }

            // Processar dados para incluir contagem de extintores
            const processedUsers = users.map(user => ({
                ...user,
                extinguisher_count: user.extintores?.[0]?.count || 0,
                plan: this.mapSubscriptionToPlan(user.subscription),
                is_active: true, // Por enquanto, todos são ativos
                last_login: user.updated_at // Aproximação
            }));

            console.log('✅ Usuários carregados:', processedUsers.length);
            return processedUsers;

        } catch (error) {
            console.error('❌ Erro na busca de usuários:', error);
            throw new Error(`Erro ao carregar usuários: ${error.message}`);
        }
    }

    /**
     * Buscar estatísticas do sistema
     */
    async getSystemStats() {
        try {
            console.log('📊 Buscando estatísticas do sistema...');

            // Buscar contagem de usuários
            const { count: usersCount, error: usersError } = await this.supabase
                .from('users')
                .select('*', { count: 'exact', head: true });

            if (usersError) throw usersError;

            // Buscar contagem de extintores
            const { count: extinguishersCount, error: extinguishersError } = await this.supabase
                .from('extintores')
                .select('*', { count: 'exact', head: true });

            if (extinguishersError) throw extinguishersError;

            // Buscar extintores vencidos
            const today = new Date().toISOString().split('T')[0];
            const { count: expiredCount, error: expiredError } = await this.supabase
                .from('extintores')
                .select('*', { count: 'exact', head: true })
                .lt('data_vencimento', today);

            if (expiredError) throw expiredError;

            // Usuários ativos (aproximação - usuários que fizeram login recentemente)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const { count: activeUsersCount, error: activeError } = await this.supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .gte('updated_at', thirtyDaysAgo.toISOString());

            if (activeError) throw activeError;

            const stats = {
                totalUsers: usersCount || 0,
                totalExtinguishers: extinguishersCount || 0,
                expiredExtinguishers: expiredCount || 0,
                activeUsers: activeUsersCount || 0
            };

            console.log('✅ Estatísticas carregadas:', stats);
            return stats;

        } catch (error) {
            console.error('❌ Erro ao carregar estatísticas:', error);
            throw new Error(`Erro ao carregar estatísticas: ${error.message}`);
        }
    }

    /**
     * Buscar detalhes de um usuário específico
     */
    async getUserDetails(userId) {
        try {
            console.log('👤 Buscando detalhes do usuário:', userId);

            const { data: user, error: userError } = await this.supabase
                .from('users')
                .select(`
                    *,
                    extintores:extintores(
                        id,
                        numero,
                        local,
                        tipo,
                        data_vencimento,
                        created_at
                    )
                `)
                .eq('id', userId)
                .single();

            if (userError) throw userError;

            console.log('✅ Detalhes do usuário carregados');
            return user;

        } catch (error) {
            console.error('❌ Erro ao carregar detalhes do usuário:', error);
            throw new Error(`Erro ao carregar usuário: ${error.message}`);
        }
    }

    /**
     * Atualizar dados de um usuário
     */
    async updateUser(userId, updates) {
        try {
            console.log('✏️ Atualizando usuário:', userId, updates);

            const { data, error } = await this.supabase
                .from('users')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Usuário atualizado com sucesso');
            return data;

        } catch (error) {
            console.error('❌ Erro ao atualizar usuário:', error);
            throw new Error(`Erro ao atualizar usuário: ${error.message}`);
        }
    }

    /**
     * Excluir um usuário (e todos seus dados)
     */
    async deleteUser(userId) {
        try {
            console.log('🗑️ Excluindo usuário:', userId);

            // O CASCADE no banco vai excluir automaticamente os extintores e inspeções
            const { error } = await this.supabase
                .from('users')
                .delete()
                .eq('id', userId);

            if (error) throw error;

            console.log('✅ Usuário excluído com sucesso');
            return true;

        } catch (error) {
            console.error('❌ Erro ao excluir usuário:', error);
            throw new Error(`Erro ao excluir usuário: ${error.message}`);
        }
    }

    /**
     * Buscar extintores de um usuário específico
     */
    async getUserExtinguishers(userId) {
        try {
            console.log('🧯 Buscando extintores do usuário:', userId);

            const { data: extinguishers, error } = await this.supabase
                .from('extintores')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            console.log('✅ Extintores carregados:', extinguishers.length);
            return extinguishers;

        } catch (error) {
            console.error('❌ Erro ao carregar extintores:', error);
            throw new Error(`Erro ao carregar extintores: ${error.message}`);
        }
    }

    // =============================================================================
    // FUNÇÕES AUXILIARES
    // =============================================================================

    /**
     * Mapear subscription para plan
     */
    mapSubscriptionToPlan(subscription) {
        const planMap = {
            'basic': 'basic',
            'professional': 'business',
            'enterprise': 'business'
        };
        return planMap[subscription] || 'basic';
    }

    /**
     * Formatar data para exibição
     */
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('pt-BR');
    }

    /**
     * Verificar se um extintor está vencido
     */
    isExtinguisherExpired(expirationDate) {
        if (!expirationDate) return false;
        return new Date(expirationDate) < new Date();
    }

    /**
     * Obter status de um extintor
     */
    getExtinguisherStatus(extintor) {
        if (!extintor.data_vencimento) return 'unknown';
        
        const today = new Date();
        const expiration = new Date(extintor.data_vencimento);
        const diffTime = expiration - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'expired';
        if (diffDays <= 30) return 'expiring_soon';
        return 'valid';
    }
}

// Criar instância global para uso no admin
window.adminSupabase = new AdminSupabaseManager();
