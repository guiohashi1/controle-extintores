// =============================================================================
// CONFIGURAÇÃO DO SUPABASE
// =============================================================================

// SUBSTITUA pelos valores do seu projeto Supabase
window.SUPABASE_CONFIG = {
  // Cole aqui a URL do seu projeto (Settings > API > Project URL)
  url: 'https://japgbufsqbjfkbkrncgg.supabase.co',
  
  // Cole aqui a chave pública (Settings > API > Project API keys > anon public)
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphcGdidWZzcWJqZmtia3JuY2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0OTg3NTksImV4cCI6MjA3MDA3NDc1OX0.AIc0koiJoLrRoFEhvV8qfskpL5ffA-l35cvGNGTLlOs',
};

// Para compatibilidade
const SUPABASE_CONFIG = window.SUPABASE_CONFIG;

// Verificar se o SDK do Supabase está carregado
if (typeof window !== 'undefined' && window.supabase) {
  // Usar o SDK oficial do Supabase se disponível
  const supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
}

// =============================================================================
// CLASSE PARA INTEGRAÇÃO COM SUPABASE
// =============================================================================

class SupabaseManager {
  constructor() {
    this.baseUrl = SUPABASE_CONFIG.url;
    this.apiKey = SUPABASE_CONFIG.anonKey;
    this.currentUser = null;
    this.authToken = null;
    
    // Tentar recuperar usuário do sessionStorage
    this.initializeFromSession();
  }

  // Inicializar usuário do sessionStorage
  initializeFromSession() {
    try {
      const savedUser = sessionStorage.getItem('currentUser');
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
        console.log('✅ Usuário recuperado do sessionStorage:', this.currentUser.email);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao recuperar usuário do sessionStorage:', error);
      sessionStorage.removeItem('currentUser');
    }
  }

  // Método para fazer requisições autenticadas
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}/rest/v1/${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': this.apiKey,
      'Authorization': `Bearer ${this.apiKey}`, // Usar sempre a chave anon
      'Prefer': 'return=representation',
      ...options.headers
    };

    try {
      console.log(`🌐 Fazendo requisição para: ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers
      });

      console.log(`📡 Status da resposta: ${response.status}`);

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ Erro na resposta:', error);
        throw new Error(`HTTP error! status: ${response.status}, body: ${error}`);
      }

      const data = await response.json();
      console.log('✅ Dados recebidos:', data);
      return data;
    } catch (error) {
      console.error('Supabase request error:', error);
      throw error;
    }
  }

  // Hash simples de senha (em produção, use bcrypt no backend)
  hashPassword(password) {
    try {
      // Garantir que a senha seja uma string
      const senhaString = String(password);
      const saltedPassword = senhaString + 'salt123';
      const result = btoa(saltedPassword);
      
      console.log(`🔐 Hash debug:`);
      console.log(`  Senha original: '${password}' (tipo: ${typeof password})`);
      console.log(`  Senha como string: '${senhaString}'`);
      console.log(`  Com salt: '${saltedPassword}'`);
      console.log(`  Hash final: '${result}'`);
      
      return result;
    } catch (error) {
      console.error('Erro ao gerar hash:', error);
      return null;
    }
  }

  // Verificar senha
  verifyPassword(password, hash) {
    try {
      const calculatedHash = this.hashPassword(password);
      
      // Normalizar hashes (remover espaços e normalizar)
      const normalizedCalculated = calculatedHash ? calculatedHash.trim() : '';
      const normalizedExpected = hash ? hash.trim() : '';
      
      const isMatch = normalizedCalculated === normalizedExpected;
      
      console.log(`🔍 Verificação de senha:`);
      console.log(`  Senha: '${password}'`);
      console.log(`  Hash calculado: '${normalizedCalculated}'`);
      console.log(`  Hash esperado: '${normalizedExpected}'`);
      console.log(`  Tamanhos: ${normalizedCalculated.length} vs ${normalizedExpected.length}`);
      console.log(`  Resultado: ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
      
      return isMatch;
    } catch (error) {
      console.error('Erro na verificação de senha:', error);
      return false;
    }
  }

  // =============================================================================
  // AUTENTICAÇÃO
  // =============================================================================

  async login(email, password) {
    try {
      console.log('🔐 Iniciando login...');
      console.log('Email:', email);
      console.log('Senha fornecida:', password);
      console.log('Hash da senha:', this.hashPassword(password));
      
      // Buscar usuário por email
      const users = await this.request(`users?email=eq.${encodeURIComponent(email)}&select=*`);
      
      console.log('Usuários encontrados:', users);
      
      if (!users || users.length === 0) {
        console.log('❌ Email não encontrado');
        return { success: false, error: 'Email não encontrado' };
      }

      const user = users[0];
      console.log('Dados do usuário:', user);
      console.log('Hash no banco:', user.password_hash);
      console.log('Hash calculado:', this.hashPassword(password));
      
      // Verificar senha
      const senhaCorreta = this.verifyPassword(password, user.password_hash);
      console.log('Senha correta?', senhaCorreta);
      
      if (!senhaCorreta) {
        console.log('❌ Senha incorreta');
        return { success: false, error: 'Senha incorreta' };
      }

      // Gerar token de sessão
      this.authToken = this.generateSessionToken(user);
      this.currentUser = user;
      
      // Salvar no sessionStorage com dados de plano
      sessionStorage.setItem('currentUser', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan || 'starter',
        plan_status: user.plan_status || 'active',
        plan_expires_at: user.plan_expires_at,
        created_at: user.created_at
      }));
      
      console.log('✅ Login bem-sucedido');

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          subscription: user.subscription
        },
        token: this.authToken
      };

    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  }

  async register(userData) {
    try {
      console.log('📝 Dados recebidos para registro:', userData);
      
      // Verificar se email já existe
      const existingUsers = await this.request(`users?email=eq.${encodeURIComponent(userData.email)}&select=id`);
      
      if (existingUsers && existingUsers.length > 0) {
        return { success: false, error: 'Email já está em uso' };
      }

      // Criar novo usuário
      const newUser = {
        email: userData.email,
        password_hash: this.hashPassword(userData.password),
        name: userData.name,
        subscription: 'basic'
      };
      
      console.log('👤 Dados do novo usuário:', newUser);

      const createdUsers = await this.request('users', {
        method: 'POST',
        body: JSON.stringify(newUser)
      });

      if (createdUsers && createdUsers.length > 0) {
        const user = createdUsers[0];
        
        // Fazer login automático após registro
        this.authToken = this.generateSessionToken(user);
        this.currentUser = user;

        return {
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            subscription: user.subscription
          },
          token: this.authToken
        };
      }

      return { success: false, error: 'Erro ao criar usuário' };

    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Erro ao criar conta' };
    }
  }

  logout() {
    this.authToken = null;
    this.currentUser = null;
    sessionStorage.removeItem('currentUser');
    console.log('✅ Logout realizado');
  }

  generateSessionToken(user) {
    // Token simples para desenvolvimento
    const tokenData = {
      userId: user.id,
      email: user.email,
      timestamp: Date.now()
    };
    return btoa(JSON.stringify(tokenData));
  }

  // =============================================================================
  // GESTÃO DE EXTINTORES
  // =============================================================================

  async getExtintores() {
    if (!this.currentUser) {
      throw new Error('Usuário não autenticado');
    }

    try {
      console.log('🔍 Buscando extintores para usuário:', this.currentUser.id);
      
      const extintores = await this.request(`extintores?user_id=eq.${this.currentUser.id}&select=*`);
      
      // Mapear campos do banco para o formato esperado pela aplicação
      const extintoresMapeados = (extintores || []).map(ext => ({
        id: ext.id,
        user_id: ext.user_id,
        numero: ext.numero,
        local: ext.local,
        tipo: ext.tipo,
        peso: ext.peso,
        validade: ext.data_vencimento, // Mapear data_vencimento para validade
        hidro: ext.data_ultima_inspecao, // Mapear data_ultima_inspecao para hidro
        fabricante: ext.fabricante,
        data_fabricacao: ext.data_fabricacao,
        observacoes: ext.observacoes,
        photo_url: ext.photo_url, // 📸 INCLUIR CAMPO DE FOTO
        photo_path: ext.photo_path, // Incluir caminho da foto também
        created_at: ext.created_at,
        updated_at: ext.updated_at
      }));
      
      console.log(`✅ ${extintoresMapeados.length} extintores carregados e mapeados`);
      return extintoresMapeados;
    } catch (error) {
      console.error('❌ Erro ao buscar extintores:', error);
      return [];
    }
  }

  async saveExtintor(extintor) {
    if (!this.currentUser) {
      throw new Error('Usuário não autenticado');
    }

    try {
      console.log('💾 Salvando extintor no Supabase:', extintor.numero);
      
      // 🛡️ VALIDAÇÃO DEFINITIVA DE PLANOS - V4.0 FINAL
      // Só validar limites para NOVOS extintores (não para edição)
      if (!extintor.id && window.PlanValidator) {
        console.log('🛡️ PROTEÇÃO SUPABASE V4.0 - Validando limites antes de salvar...');
        
        try {
          // Inicializar PlanValidator se necessário
          if (!PlanValidator.currentUser) {
            const currentUser = this.currentUser;
            if (!PlanValidator.initialize(currentUser)) {
              throw new Error('Plano vencido ou inativo');
            }
          }
          
          const canCreate = await PlanValidator.canCreateExtintor();
          if (!canCreate) {
            console.log('🚫 SALVAMENTO BLOQUEADO - Limite atingido');
            throw new Error('Limite do plano atingido. Faça upgrade para criar mais extintores.');
          }
          console.log('✅ SALVAMENTO AUTORIZADO - Dentro do limite');
        } catch (planError) {
          console.error('❌ Erro na validação de planos:', planError);
          throw new Error(`Validação de plano falhou: ${planError.message}`);
        }
      }
      
      // Garantir que o extintor tenha o user_id correto
      const extintorData = {
        user_id: this.currentUser.id,
        numero: extintor.numero,
        local: extintor.local,
        tipo: extintor.tipo,
        peso: extintor.peso,
        fabricante: extintor.fabricante || null,
        data_fabricacao: extintor.data_fabricacao || null,
        data_vencimento: extintor.validade, // Mapear validade para data_vencimento
        data_ultima_inspecao: extintor.hidro, // Mapear hidro para data_ultima_inspecao
        observacoes: extintor.observacoes || null
      };

      if (extintor.id) {
        // Atualizar extintor existente
        console.log('🔄 Atualizando extintor existente, ID:', extintor.id);
        const updated = await this.request(`extintores?id=eq.${extintor.id}`, {
          method: 'PATCH',
          body: JSON.stringify(extintorData)
        });
        
        if (updated && updated.length > 0) {
          console.log('✅ Extintor atualizado com sucesso');
          return updated[0];
        } else {
          console.log('⚠️ Nenhum registro atualizado');
          return null;
        }
      } else {
        // Criar novo extintor
        console.log('➕ Criando novo extintor');
        const created = await this.request('extintores', {
          method: 'POST',
          body: JSON.stringify(extintorData)
        });
        
        if (created && created.length > 0) {
          console.log('✅ Extintor criado com sucesso, ID:', created[0].id);
          return created[0];
        } else {
          console.log('⚠️ Falha ao criar extintor');
          return null;
        }
      }
    } catch (error) {
      console.error('❌ Erro ao salvar extintor:', error);
      throw error;
    }
  }

  async deleteExtintor(extintorId) {
    if (!this.currentUser) {
      throw new Error('Usuário não autenticado');
    }

    try {
      console.log('🗑️ Deletando extintor do Supabase, ID:', extintorId);
      
      // Deletar extintor específico do usuário atual
      const result = await this.request(`extintores?id=eq.${extintorId}&user_id=eq.${this.currentUser.id}`, {
        method: 'DELETE'
      });
      
      console.log('✅ Extintor deletado com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar extintor:', error);
      throw error;
    }
  }

  // =============================================================================
  // GESTÃO DE INSPEÇÕES
  // =============================================================================

  async getInspecoes() {
    if (!this.currentUser) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const inspecoes = await this.request(`inspecoes?user_id=eq.${this.currentUser.id}&select=*`);
      return inspecoes || [];
    } catch (error) {
      console.error('Error fetching inspecoes:', error);
      return [];
    }
  }

  async saveInspecao(inspecao) {
    if (!this.currentUser) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const inspecaoData = {
        ...inspecao,
        user_id: this.currentUser.id
      };

      const created = await this.request('inspecoes', {
        method: 'POST',
        body: JSON.stringify(inspecaoData)
      });
      return created[0];
    } catch (error) {
      console.error('Error saving inspecao:', error);
      throw error;
    }
  }

  // =============================================================================
  // SINCRONIZAÇÃO
  // =============================================================================

  async syncData() {
    if (!this.currentUser) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const [extintores, inspecoes] = await Promise.all([
        this.getExtintores(),
        this.getInspecoes()
      ]);

      return {
        success: true,
        data: {
          extintores,
          inspecoes,
          lastSync: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error syncing data:', error);
      return { success: false, error: 'Erro na sincronização' };
    }
  }

  // =============================================================================
  // UTILITÁRIOS DE DEBUG E CORREÇÃO
  // =============================================================================

  async criarUsuarioDemo() {
    try {
      console.log('🛠️ Criando/atualizando usuário demo...');
      
      const senhaHash = this.hashPassword('123456');
      console.log('Hash gerado para senha 123456:', senhaHash);
      
      // Tentar atualizar primeiro
      const usuarios = await this.request(`users?email=eq.demo@exemplo.com&select=*`);
      
      if (usuarios && usuarios.length > 0) {
        // Usuário existe, atualizar senha
        console.log('Usuário demo encontrado, atualizando senha...');
        const resultado = await this.request(`users?email=eq.demo@exemplo.com`, {
          method: 'PATCH',
          body: JSON.stringify({
            password_hash: senhaHash,
            name: 'Usuário Demo',
            subscription: 'professional'
          })
        });
        console.log('Usuário demo atualizado:', resultado);
      } else {
        // Criar novo usuário
        console.log('Criando novo usuário demo...');
        const novoUsuario = {
          id: '11111111-1111-1111-1111-111111111111',
          email: 'demo@exemplo.com',
          password_hash: senhaHash,
          name: 'Usuário Demo',
          subscription: 'professional'
        };
        
        const resultado = await this.request('users', {
          method: 'POST',
          body: JSON.stringify(novoUsuario)
        });
        console.log('Usuário demo criado:', resultado);
      }
      
      return { success: true, message: 'Usuário demo configurado com sucesso' };
    } catch (error) {
      console.error('Erro ao criar usuário demo:', error);
      return { success: false, error: error.message };
    }
  }

  async debugUsuarioDemo() {
    try {
      console.log('🔍 Debug do usuário demo...');
      
      // Buscar usuário
      const usuarios = await this.request(`users?email=eq.demo@exemplo.com&select=*`);
      console.log('Usuários encontrados:', usuarios);
      
      if (usuarios && usuarios.length > 0) {
        const user = usuarios[0];
        console.log('Dados do usuário:');
        console.log('  ID:', user.id);
        console.log('  Email:', user.email);
        console.log('  Nome:', user.name);
        console.log('  Hash da senha:', user.password_hash);
        console.log('  Subscription:', user.subscription);
        
        // Testar hash
        const hashTeste = this.hashPassword('123456');
        console.log('Hash de teste para "123456":', hashTeste);
        console.log('Hashes são iguais?', hashTeste === user.password_hash);
        
        return { 
          success: true, 
          user: user,
          hashTeste: hashTeste,
          hashesIguais: hashTeste === user.password_hash
        };
      } else {
        return { success: false, error: 'Usuário demo não encontrado' };
      }
    } catch (error) {
      console.error('Erro no debug:', error);
      return { success: false, error: error.message };
    }
  }

  // =============================================================================
  // VERIFICAÇÃO DE CONEXÃO
  // =============================================================================

  async testConnection() {
    try {
      console.log('🔍 Testando conexão com Supabase...');
      console.log('URL:', this.baseUrl);
      console.log('API Key:', this.apiKey.substring(0, 20) + '...');
      
      // Fazer uma requisição simples para testar a conexão
      const result = await this.request('users?limit=1');
      console.log('✅ Conexão com Supabase OK!');
      return { success: true, message: 'Conexão com Supabase OK!' };
    } catch (error) {
      console.error('❌ Erro de conexão:', error);
      return { 
        success: false, 
        error: 'Erro de conexão: ' + error.message,
        details: {
          url: this.baseUrl,
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}

// Exportar instância global
const supabase = new SupabaseManager();

// =============================================================================
// FUNÇÕES PARA CONTROLE DE ADMIN
// =============================================================================

// Verificar se o usuário é admin
function isAdmin() {
  try {
    const currentUser = supabase.currentUser;
    if (!currentUser) return false;
    
    // Verificar se o usuário tem privilégios admin
    return currentUser.tipo === 'admin' || currentUser.admin === true;
  } catch (error) {
    console.warn('Erro ao verificar admin:', error);
    return false;
  }
}

// Mostrar/esconder botões admin no navbar
function updateAdminVisibility() {
  const adminElements = document.querySelectorAll('.admin-only');
  const isUserAdmin = isAdmin();
  
  adminElements.forEach(element => {
    element.style.display = isUserAdmin ? 'flex' : 'none';
  });
  
  console.log(isUserAdmin ? '👑 Admin detectado - botões visíveis' : '👤 Usuário comum - botões admin ocultos');
}

// Navegar para o painel admin
function navigateToAdmin() {
  if (!isAdmin()) {
    alert('Acesso negado! Apenas administradores podem acessar o painel.');
    return;
  }
  
  // Navegar para o painel admin
  window.location.href = '/admin/';
}

// Atualizar visibilidade quando a navbar for carregada
document.addEventListener('DOMContentLoaded', () => {
  // Aguardar um pouco para garantir que o usuário foi carregado
  setTimeout(updateAdminVisibility, 500);
});

// =============================================================================
// APP TOTALMENTE INTEGRADO! 
// =============================================================================

// ========================================
// FUNÇÕES DE UPLOAD DE FOTOS
// ========================================

/**
 * Upload de foto para Supabase Storage
 */
async function uploadExtintorPhoto(file, extintorId) {
  try {
    console.log('📸 Iniciando upload da foto para extintor:', extintorId);
    
    if (!file || !extintorId) {
      throw new Error('Arquivo ou ID do extintor não fornecido');
    }
    
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      throw new Error('Apenas arquivos de imagem são permitidos');
    }
    
    // Verificar limites do plano
    const user = getCurrentUser();
    if (!user) throw new Error('Usuário não encontrado');
    
    const maxSize = user.plan === 'enterprise' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      throw new Error(`Arquivo muito grande. Limite: ${maxSizeMB}MB`);
    }
    
    // Criar nome único para o arquivo
    const fileExt = file.name.split('.').pop().toLowerCase();
    const fileName = `extintor_${extintorId}_${Date.now()}.${fileExt}`;
    const filePath = `fotos-extintores/${fileName}`;
    
    // Fazer upload para Supabase Storage
    const { data, error } = await supabase.storage
      .from('extintor-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('❌ Erro no upload:', error);
      throw error;
    }
    
    // Obter URL pública da imagem
    const { data: { publicUrl } } = supabase.storage
      .from('extintor-photos')
      .getPublicUrl(filePath);
    
    console.log('✅ Upload realizado com sucesso:', publicUrl);
    
    return {
      success: true,
      url: publicUrl,
      path: filePath,
      fileName: fileName
    };
    
  } catch (error) {
    console.error('❌ Erro no upload da foto:', error);
    throw error;
  }
}

/**
 * Upload completo: arquivo + banco
 */
async function uploadAndSaveExtintorPhoto(file, extintorId) {
  try {
    console.log('🔄 Processo completo de upload iniciado');
    
    // 1. Upload do arquivo
    const uploadResult = await uploadExtintorPhoto(file, extintorId);
    
    // 2. Salvar URL no banco
    await updateExtintorPhotoUrl(extintorId, uploadResult.url, uploadResult.path);
    
    console.log('✅ Processo completo de upload finalizado');
    return uploadResult;
    
  } catch (error) {
    console.error('❌ Erro no processo completo:', error);
    throw error;
  }
}

/**
 * Atualizar URL da foto no extintor
 */
async function updateExtintorPhotoUrl(extintorId, photoUrl, photoPath = null) {
  try {
    console.log('💾 Atualizando URL da foto no extintor:', extintorId);
    
    const headers = {
      'apikey': SUPABASE_CONFIG.anonKey,
      'Content-Type': 'application/json'
    };
    
    const updateData = {
      photo_url: photoUrl,
      photo_path: photoPath,
      updated_at: new Date().toISOString()
    };
    
    const response = await fetch(
      `${SUPABASE_CONFIG.url}/rest/v1/extintores?id=eq.${extintorId}`,
      {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify(updateData)
      }
    );
    
    if (!response.ok) {
      throw new Error(`Erro ao atualizar foto: ${response.status}`);
    }
    
    console.log('✅ URL da foto atualizada no banco');
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao atualizar URL da foto:', error);
    throw error;
  }
}

/*
✅ TUDO JÁ ESTÁ FUNCIONANDO!

O app já está 100% integrado com o Supabase:
- Login e registro funcionam automaticamente
- Extintores são salvos na nuvem
- Sincronização entre dispositivos ativa
- Teste de conexão roda ao abrir o app
- Painel admin integrado para usuários autorizados

Para usar:
1. ✅ Configuração já feita (suas credenciais estão corretas)
2. ✅ SQL já deve ser executado no Supabase (veja instruções abaixo)
3. ✅ Integração já está completa
4. ✅ Teste abrindo o app no navegador
5. ✅ Painel admin disponível em /admin/ para administradores

PRÓXIMO PASSO: Execute o SQL no seu Supabase!
*/

// =============================================================================
// FUNÇÕES DE UPLOAD DE FOTOS
// =============================================================================

/**
 * Upload de foto de extintor para o Supabase Storage
 * @param {File} file - Arquivo de imagem
 * @param {string} fileName - Nome do arquivo
 * @returns {Promise<string>} URL pública da foto
 */
async function uploadExtintorPhoto(file, fileName) {
    try {
        console.log('📤 Iniciando upload de foto:', fileName);
        console.log('📂 Arquivo:', { name: file.name, size: file.size, type: file.type });
        
        // Verificar se o supabase está disponível
        if (!window.supabase) {
            throw new Error('Supabase SDK não encontrado');
        }
        console.log('✅ Supabase SDK disponível');
        
        const supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('✅ Cliente Supabase criado');
        
        // Verificar autenticação
        const { data: authData, error: authError } = await supabaseClient.auth.getUser();
        console.log('🔐 Status da autenticação:', {
            user: authData?.user?.email || 'não autenticado',
            role: authData?.user?.role || 'anônimo',
            authenticated: !!authData?.user,
            error: authError?.message || 'nenhum erro'
        });
        
        // Verificar se o bucket existe
        const { data: buckets, error: bucketsError } = await supabaseClient.storage.listBuckets();
        if (bucketsError) {
            console.error('❌ Erro ao listar buckets:', bucketsError);
        } else {
            console.log('📦 Buckets disponíveis:', buckets.map(b => b.name));
            const bucketExists = buckets.some(b => b.name === 'extintor-photos');
            console.log('🎯 Bucket extintor-photos existe:', bucketExists);
        }
        
        // Upload para o bucket
        console.log('🚀 Iniciando upload para bucket extintor-photos...');
        const { data, error } = await supabaseClient.storage
            .from('extintor-photos')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true,
                contentType: file.type
            });

        if (error) {
            console.error('❌ Erro detalhado no upload:', {
                message: error.message,
                statusCode: error.statusCode,
                name: error.name,
                details: error.details,
                hint: error.hint,
                code: error.code,
                error: error
            });
            throw new Error(`Erro no upload: ${error.message}`);
        }

        console.log('✅ Upload realizado com sucesso:', data);

        // Obter URL pública
        console.log('🔗 Obtendo URL pública...');
        const { data: publicData } = supabaseClient.storage
            .from('extintor-photos')
            .getPublicUrl(fileName);

        console.log('✅ URL pública obtida:', publicData.publicUrl);
        return publicData.publicUrl;

    } catch (error) {
        console.error('❌ Erro completo no upload de foto:', {
            message: error.message,
            stack: error.stack,
            error: error
        });
        throw error;
    }
}

/**
 * Atualizar registro do extintor com URL da foto
 * @param {string} extintorId - ID do extintor
 * @param {string} photoUrl - URL pública da foto
 * @param {string} photoPath - Caminho da foto no storage
 * @returns {Promise<boolean>} Sucesso da operação
 */
async function updateExtintorPhotoUrl(extintorId, photoUrl, photoPath) {
    try {
        console.log('💾 Atualizando registro com foto:', extintorId);
        
        if (!window.supabase) {
            throw new Error('Supabase SDK não encontrado');
        }
        
        const supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        
        const { data, error } = await supabaseClient
            .from('extintores')
            .update({
                photo_url: photoUrl,
                photo_path: photoPath,
                updated_at: new Date().toISOString()
            })
            .eq('id', extintorId);

        if (error) {
            console.error('❌ Erro ao atualizar registro:', error);
            throw error;
        }

        console.log('✅ Registro atualizado com sucesso');
        return true;

    } catch (error) {
        console.error('❌ Erro ao atualizar registro:', error);
        throw error;
    }
}

/**
 * Deletar foto do storage quando extintor for excluído
 * @param {string} photoPath - Caminho da foto no storage
 * @returns {Promise<boolean>} Sucesso da operação
 */
async function deleteExtintorPhoto(photoPath) {
    if (!photoPath) return true;
    
    try {
        console.log('🗑️ Deletando foto:', photoPath);
        
        if (!window.supabase) {
            console.warn('⚠️ Supabase SDK não encontrado para deletar foto');
            return false;
        }
        
        const supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        
        const { error } = await supabaseClient.storage
            .from('extintor-photos')
            .remove([photoPath]);

        if (error) {
            console.error('❌ Erro ao deletar foto:', error);
            // Não vamos falhar a operação por causa da foto
            return false;
        }

        console.log('✅ Foto deletada com sucesso');
        return true;

    } catch (error) {
        console.error('❌ Erro ao deletar foto:', error);
        return false;
    }
}

/**
 * Upload completo: enviar foto e atualizar registro
 * @param {File} file - Arquivo de imagem
 * @param {string} extintorNumero - Número do extintor
 * @returns {Promise<object>} Resultado com URL e path
 */
async function uploadAndSaveExtintorPhoto(file, extintorNumero) {
    try {
        // Gerar nome único do arquivo
        const timestamp = Date.now();
        const extension = file.name.split('.').pop().toLowerCase();
        const fileName = `extintor_${extintorNumero}_${timestamp}.${extension}`;
        
        // Fazer upload
        const photoUrl = await uploadExtintorPhoto(file, fileName);
        
        return {
            url: photoUrl,
            path: fileName
        };
        
    } catch (error) {
        console.error('❌ Erro no upload completo:', error);
        throw error;
    }
}

// Exportar funções para uso global
window.uploadExtintorPhoto = uploadExtintorPhoto;
window.updateExtintorPhotoUrl = updateExtintorPhotoUrl;
window.deleteExtintorPhoto = deleteExtintorPhoto;
window.uploadAndSaveExtintorPhoto = uploadAndSaveExtintorPhoto;
