/* =============================================================================
   CONTROLE DE EXTINTORES - FUNÇÕES COMUNS
   ============================================================================= */

// ===== VARIÁVEIS GLOBAIS =====
let currentUser = null;
let currentRoute = 'dashboard';

// ===== SISTEMA DE AUTENTICAÇÃO E PLANOS =====
function getCurrentUser() {
  if (!currentUser) {
    const userData = sessionStorage.getItem('currentUser');
    if (userData) {
      currentUser = JSON.parse(userData);
    }
  }
  return currentUser;
}

async function checkUserAccess() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = '../index.html';
    return false;
  }
  
  // Inicializar validador de planos
  if (window.PlanValidator && !PlanValidator.initialize(user)) {
    return false;
  }
  
  // 👥 VALIDAÇÃO DE USUÁRIOS SIMULTÂNEOS - V1.0
  if (window.PlanValidator) {
    const canAccess = await PlanValidator.canAddUser();
    if (!canAccess) {
      console.log('🚫 Acesso negado - limite de usuários atingido');
      // Modal já foi exibido pela função canAddUser
      return false;
    }
  }
  
  return true;
}

// ===== SISTEMA DE NOTIFICAÇÕES =====
function showNotification(message, type = 'success') {
  // Remove notificação existente se houver
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Estilo da notificação
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: ${type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#10b981'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    z-index: 10000;
    max-width: 300px;
    font-weight: 500;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 3000);
}

// ===== SISTEMA DE NAVEGAÇÃO =====
function navigateTo(page) {
  // Lista de páginas válidas
  const validPages = ['dashboard', 'extintores', 'form', 'relatorios', 'configuracoes'];
  
  if (!validPages.includes(page)) {
    console.warn(`Página inválida: ${page}`);
    return;
  }
  
  // Fechar o menu dropdown primeiro
  closeUserMenu();
  // Atualizar URL sem recarregar a página
  window.location.href = `${page}.html`;
}

// Função específica para navegar ao perfil (seção específica de configurações)
function navigateToPerfil() {
  // Fechar o menu dropdown primeiro
  closeUserMenu();
  // Navega para configurações e rola até a seção do perfil
  window.location.href = `configuracoes.html#perfil`;
}

// Função para detectar página atual
function getCurrentPage() {
  const path = window.location.pathname;
  const page = path.split('/').pop().replace('.html', '') || 'index';
  return page;
}

// ===== GESTÃO DO USUÁRIO =====
function setCurrentUser(user) {
  currentUser = user;
  
  if (user) {
    // Salvar no sessionStorage
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    
    // Atualizar indicador de plano se existir
    updatePlanIndicator(user);
    
    // Tentar atualizar UI imediatamente
    updateUserDisplay(user);
    
    // Se elementos não existem, tentar novamente após delay
    const userPlanElement = document.getElementById('user-plan');
    if (!userPlanElement) {
      setTimeout(() => updateUserDisplay(user), 500);
    }
  } else {
    // Limpar sessionStorage
    sessionStorage.removeItem('currentUser');
  }
}

function updateUserDisplay(user) {
  // Atualizar interface se elementos existirem
  const userNameElement = document.getElementById('user-name');
  const userPlanElement = document.getElementById('user-plan');
  
  if (userNameElement) {
    userNameElement.textContent = user.name || user.email;
  }
  
  if (userPlanElement) {
    // Mapear planos para nomes amigáveis
    const planNames = {
      'starter': 'Starter',
      'professional': 'Professional',
      'enterprise': 'Enterprise',
      'basic': 'Starter'  // 🔧 MAPEAMENTO para compatibilidade com dados antigos
    };
    
    const currentPlan = user.subscription || 'starter';
    const displayName = planNames[currentPlan] || currentPlan;
    userPlanElement.textContent = displayName;
  }
}

function updatePlanIndicator(user) {
  const planIndicator = document.querySelector('.plan-indicator');
  if (!planIndicator) return;
  
  const plan = user.subscription || 'starter';
  const planNames = {
    starter: 'Starter',
    professional: 'Professional', 
    enterprise: 'Enterprise'
  };
  
  planIndicator.textContent = planNames[plan] || 'Starter';
  planIndicator.className = `plan-indicator ${plan}`;
}

function createPlanIndicator() {
  const user = getCurrentUser();
  if (!user) return '';
  
  const plan = user.subscription || 'starter';
  const planNames = {
    starter: 'Starter',
    professional: 'Professional',
    enterprise: 'Enterprise'
  };
  
  return `<span class="plan-indicator ${plan}">${planNames[plan]}</span>`;
}function getCurrentUser() {
  if (!currentUser) {
    // Tentar recuperar do sessionStorage
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      currentUser = JSON.parse(storedUser);
    }
  }
  return currentUser;
}

function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return false;
  }
  
  // Atualizar display do usuário na UI
  setCurrentUser(user);
  
  return true;
}

// ===== FUNÇÕES DE UI =====
function toggleUserMenu() {
  const dropdown = document.querySelector('.user-dropdown');
  if (dropdown) {
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  }
}

function closeUserMenu() {
  const dropdown = document.querySelector('.user-dropdown');
  if (dropdown) {
    dropdown.style.display = 'none';
  }
}

function setActiveNavItem(page) {
  // Remove active de todos os nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Adiciona active ao item atual
  const activeItem = document.querySelector(`[data-route="${page}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
  }
}

// ===== FUNÇÕES DE UTILIDADE =====
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

function calcularDiasRestantes(dataVencimento) {
  if (!dataVencimento) return 0;
  const hoje = new Date();
  const vencimento = new Date(dataVencimento);
  const diffTime = vencimento - hoje;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function calcularStatusValidade(dataVencimento) {
  const dias = calcularDiasRestantes(dataVencimento);
  
  if (dias < 0) return 'expired';
  if (dias <= 30) return 'warning';
  return 'valid';
}

function getStatusBadge(status, dias) {
  switch(status) {
    case 'expired':
      return { class: 'status-expired', text: 'VENCIDO' };
    case 'warning':
      return { class: 'status-warning', text: `${dias} dias` };
    default:
      return { class: 'status-valid', text: 'VÁLIDO' };
  }
}

// ===== LOGOUT =====
function handleLogout() {
  if (confirm('Tem certeza que deseja sair?')) {
    // Fechar o menu dropdown primeiro
    closeUserMenu();
    
    // Limpar dados do usuário
    setCurrentUser(null);
    
    // Chamar logout do SupabaseManager se disponível
    if (typeof supabase !== 'undefined' && supabase.logout) {
      supabase.logout();
    }
    
    showNotification('Logout realizado com sucesso!');
    
    // Aguardar um pouco para mostrar a notificação, depois redirecionar
    setTimeout(() => {
      // Redirecionar sempre para o root do projeto usando caminho absoluto
      const currentPath = window.location.pathname;
      const rootPath = currentPath.includes('/pages/') ? 
        currentPath.substring(0, currentPath.indexOf('/pages/')) : 
        currentPath.substring(0, currentPath.lastIndexOf('/'));
      
      window.location.href = window.location.origin + rootPath + '/index.html';
    }, 1000);
  }
}

// ===== EVENT LISTENERS GLOBAIS =====
document.addEventListener('DOMContentLoaded', () => {
  // Fechar dropdown ao clicar fora
  document.addEventListener('click', (e) => {
    const userMenu = document.getElementById('user-menu');
    const dropdown = document.querySelector('.user-dropdown');
    
    if (userMenu && dropdown && !userMenu.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
  
  // Detectar página atual e atualizar navegação
  const currentPage = getCurrentPage();
  setActiveNavItem(currentPage);
});

// ===== CARREGAMENTO DE COMPONENTES =====
async function loadComponent(componentName, containerId) {
  try {
    const response = await fetch(`../components/${componentName}.html`);
    if (response.ok) {
      const html = await response.text();
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = html;
      }
    }
  } catch (error) {
    console.warn(`Não foi possível carregar o componente: ${componentName}`, error);
  }
}

async function loadNavbarComponent() {
  await loadComponent('navbar', 'navbar-container');
  
  // Atualizar visibilidade do botão admin após carregar navbar
  setTimeout(() => {
    if (typeof updateAdminVisibility === 'function') {
      updateAdminVisibility();
    }
  }, 100);
}

async function loadBottomNavComponent() {
  await loadComponent('bottom-nav', 'bottom-nav-container');
}

// ===== INTEGRAÇÃO COM SUPABASE =====
async function carregarExtintores() {
  try {
    if (!getCurrentUser()) {
      console.log('❌ Nenhum usuário logado, retornando array vazio');
      return [];
    }

    console.log('🔍 Carregando extintores do Supabase...');
    const extintores = await supabase.getExtintores();
    console.log(`✅ Carregados ${extintores.length} extintores do Supabase`);
    
    return extintores;
  } catch (error) {
    console.error('❌ Erro ao carregar extintores do Supabase:', error);
    showNotification('Erro ao carregar dados. Verifique sua conexão.', 'error');
    return [];
  }
}

async function salvarExtintor(extintor) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      showNotification('Você precisa estar logado para salvar dados.', 'error');
      return false;
    }

    console.log('💾 Salvando extintor no Supabase:', extintor.numero);
    
    extintor.user_id = currentUser.id;
    
    const resultado = await supabase.saveExtintor(extintor);
    
    if (resultado) {
      console.log('✅ Extintor salvo com sucesso no Supabase');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Erro ao salvar extintor:', error);
    showNotification('Erro ao salvar extintor. Verifique sua conexão.', 'error');
    return false;
  }
}

async function deletarExtintor(extintorId) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      showNotification('Você precisa estar logado.', 'error');
      return false;
    }

    console.log('🗑️ Deletando extintor do Supabase:', extintorId);
    
    await supabase.deleteExtintor(extintorId);
    
    console.log('✅ Extintor deletado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar extintor:', error);
    showNotification('Erro ao deletar extintor.', 'error');
    return false;
  }
}

// ===== VERIFICAÇÃO DE AUTENTICAÇÃO APRIMORADA =====
function checkAuth() {
  const user = getCurrentUser();
  if (!user) {
    showNotification('Você precisa estar logado para acessar esta página.', 'warning');
    window.location.href = '../index.html';
    return false;
  }
  
  // Atualizar display do usuário na UI
  setCurrentUser(user);
  
  return true;
}

// ===== VERIFICAÇÃO DE AUTENTICAÇÃO =====
function initAuth() {
  const currentPage = getCurrentPage();
  const protectedPages = ['dashboard', 'extintores', 'form', 'relatorios', 'configuracoes'];
  
  if (protectedPages.includes(currentPage)) {
    if (!requireAuth()) {
      return false;
    }
    
    // Carregar componentes de navegação
    loadComponent('navbar', 'navbar-container');
    loadComponent('bottom-nav', 'bottom-nav-container');
  }
  
  return true;
}

// ===== VALIDAÇÃO DE PLANOS PARA FAB BUTTON =====
/**
 * Função global para validar limites antes de criar extintor
 * Chamada pelo botão FAB (+) na navegação inferior
 * V3.0 - MODAL SIMPLES SEM PLANVALIDATOR
 */
async function validarECriarExtintor() {
    console.log('🔥 VALIDAÇÃO V3.0 - FAB (+) clicado - Usando modal simples...');
    
    try {
        // 🔧 CORREÇÃO: Buscar usuário diretamente do sessionStorage
        const userDataString = sessionStorage.getItem('currentUser');
        if (!userDataString) {
            console.error('❌ FAB: Nenhum usuário no sessionStorage');
            window.location.href = 'form.html';
            return;
        }
        
        const currentUser = JSON.parse(userDataString);
        if (!currentUser || !currentUser.id) {
            console.error('❌ FAB: id não encontrado');
            window.location.href = 'form.html';
            return;
        }
        
        console.log('👤 FAB: Validando para usuário:', currentUser.id);
        
        // Buscar contagem diretamente do usuário correto
        const response = await fetch(`https://japgbufsqbjfkbkrncgg.supabase.co/rest/v1/extintores?user_id=eq.${currentUser.id}&select=*`, {
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphcGdidWZzcWJqZmtia3JuY2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0OTg3NTksImV4cCI6MjA3MDA3NDc1OX0.AIc0koiJoLrRoFEhvV8qfskpL5ffA-l35cvGNGTLlOs',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphcGdidWZzcWJqZmtia3JuY2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0OTg3NTksImV4cCI6MjA3MDA3NDc1OX0.AIc0koiJoLrRoFEhvV8qfskpL5ffA-l35cvGNGTLlOs'
            }
        });
        
        const extintores = await response.json();
        const count = Array.isArray(extintores) ? extintores.length : 0;
        
        console.log('📊 FAB: Contagem atual:', count);
        console.log('🔢 FAB: Limite Starter:', 50);
        
        if (count >= 50) {
            console.log('🚫 FAB: LIMITE ATINGIDO - Mostrando modal simples...');
            
            // Modal SIMPLES para FAB button
            const modal = document.createElement('div');
            modal.className = 'emergency-modal-overlay';
            modal.innerHTML = `
                <div class="emergency-modal-content">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="font-size: 48px; margin-bottom: 10px;">🚫</div>
                        <h3 style="margin: 0; color: #dc3545;">Limite Atingido</h3>
                        <p style="margin: 8px 0; color: #666; font-size: 14px;">${count}/50 extintores cadastrados</p>
                    </div>
                    
                    <p style="text-align: center; margin: 15px 0; font-size: 15px; color: #333;">
                        Para cadastrar mais extintores, faça upgrade para o <strong>Plano Professional</strong>
                    </p>
                    
                    <div class="modal-actions" style="display: flex; gap: 10px; margin-top: 20px;">
                        <button 
                            type="button"
                            onclick="console.log('🔥 FAB: Ver Extintores'); this.closest('.emergency-modal-overlay').remove(); window.location.href='extintores.html';"
                            style="
                                flex: 1;
                                padding: 14px 20px;
                                border: 2px solid #007bff;
                                background: white;
                                color: #007bff;
                                border-radius: 8px;
                                font-size: 16px;
                                font-weight: 600;
                                cursor: pointer;
                                touch-action: manipulation;
                                min-height: 50px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            "
                        >
                            📋 Ver Lista
                        </button>
                        <button 
                            type="button"
                            onclick="console.log('� FAB: Fazer Upgrade'); window.open('mailto:contato@empresa.com?subject=Upgrade para Professional&body=Gostaria de fazer upgrade para cadastrar mais extintores.', '_blank'); this.closest('.emergency-modal-overlay').remove();"
                            style="
                                flex: 1;
                                padding: 14px 20px;
                                border: none;
                                background: #dc3545;
                                color: white;
                                border-radius: 8px;
                                font-size: 16px;
                                font-weight: 600;
                                cursor: pointer;
                                touch-action: manipulation;
                                min-height: 50px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            "
                        >
                            🚀 Upgrade
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            console.log('✅ FAB: Modal SIMPLES criado');
            return;
        }
        
        console.log('✅ FAB: Pode criar extintor - redirecionando');
        window.location.href = 'form.html';
        
    } catch (error) {
        console.error('❌ Erro na validação do FAB:', error);
        // Em caso de erro, permitir acesso para não travar o sistema
        window.location.href = 'form.html';
    }
}

// ===== INICIALIZAÇÃO =====
window.addEventListener('load', () => {
  initAuth();
});
