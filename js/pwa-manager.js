/* =============================================================================
   PWA MANAGER
   Gerenciamento de funcionalidades Progressive Web App
   ============================================================================= */

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isOnline = navigator.onLine;
        this.swRegistration = null;
        
        this.init();
    }

    init() {
        this.checkInstallation();
        this.setupInstallPrompt();
        this.setupServiceWorker();
        this.setupOfflineDetection();
        this.setupUpdateDetection();
        this.setupIOSInstallPrompt();
    }

    // Verificar se já está instalado
    checkInstallation() {
        this.isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                          window.navigator.standalone === true;
        
        if (this.isInstalled) {
            console.log('🎉 PWA está instalado!');
            this.hideInstallPrompt();
        }
    }

    // Configurar prompt de instalação
    setupInstallPrompt() {
        // Detectar quando o prompt está disponível
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('💡 Prompt de instalação disponível');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallBanner();
        });

        // Detectar quando o app foi instalado
        window.addEventListener('appinstalled', () => {
            console.log('🎉 PWA instalado com sucesso!');
            this.isInstalled = true;
            this.hideInstallPrompt();
            this.showToast('App instalado com sucesso!', 'success');
        });
    }

    // Mostrar banner de instalação
    showInstallBanner() {
        if (this.isInstalled) return;

        // Verificar se não foi rejeitado recentemente
        const lastDismissed = localStorage.getItem('pwa-install-dismissed');
        if (lastDismissed) {
            const daysSince = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
            if (daysSince < 7) return; // Não mostrar por 7 dias
        }

        const banner = this.createInstallBanner();
        document.body.appendChild(banner);
        
        setTimeout(() => banner.classList.add('show'), 100);
    }

    // Criar banner de instalação
    createInstallBanner() {
        const banner = document.createElement('div');
        banner.className = 'pwa-install-banner';
        banner.innerHTML = `
            <div class="banner-text">
                <div class="banner-title">🔥 Instalar App</div>
                <div class="banner-subtitle">Acesso rápido e experiência melhor</div>
            </div>
            <div class="banner-actions">
                <button class="btn-install">Instalar</button>
                <button class="btn-dismiss">✕</button>
            </div>
        `;

        // Evento de instalação
        banner.querySelector('.btn-install').addEventListener('click', () => {
            this.installApp();
        });

        // Evento de dispensar
        banner.querySelector('.btn-dismiss').addEventListener('click', () => {
            this.dismissInstallBanner(banner);
        });

        return banner;
    }

    // Instalar o app
    async installApp() {
        if (!this.deferredPrompt) return;

        try {
            const result = await this.deferredPrompt.prompt();
            console.log('👤 Escolha do usuário:', result.outcome);
            
            if (result.outcome === 'accepted') {
                this.hideInstallPrompt();
            }
        } catch (error) {
            console.error('❌ Erro na instalação:', error);
        }

        this.deferredPrompt = null;
    }

    // Dispensar banner de instalação
    dismissInstallBanner(banner) {
        banner.classList.remove('show');
        setTimeout(() => banner.remove(), 300);
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    }

    // Ocultar prompt de instalação
    hideInstallPrompt() {
        const banner = document.querySelector('.pwa-install-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 300);
        }
    }

    // Configurar Service Worker
    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.swRegistration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registrado:', this.swRegistration.scope);
                
                // Verificar updates
                this.swRegistration.addEventListener('updatefound', () => {
                    console.log('🔄 Nova versão disponível');
                    this.handleServiceWorkerUpdate();
                });
            } catch (error) {
                console.error('❌ Erro no Service Worker:', error);
            }
        }
    }

    // Gerenciar updates do Service Worker
    handleServiceWorkerUpdate() {
        const newWorker = this.swRegistration.installing;
        
        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateBanner();
            }
        });
    }

    // Mostrar banner de atualização
    showUpdateBanner() {
        const banner = document.createElement('div');
        banner.className = 'pwa-update-banner';
        banner.innerHTML = `
            <div class="banner-text">
                <div class="banner-title">🚀 Nova versão disponível!</div>
                <div class="banner-subtitle">Clique para atualizar</div>
            </div>
            <div class="banner-actions">
                <button class="btn-update">Atualizar</button>
                <button class="btn-dismiss">Depois</button>
            </div>
        `;

        // Evento de atualização
        banner.querySelector('.btn-update').addEventListener('click', () => {
            this.updateApp();
            banner.remove();
        });

        // Evento de dispensar
        banner.querySelector('.btn-dismiss').addEventListener('click', () => {
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 300);
        });

        document.body.appendChild(banner);
        setTimeout(() => banner.classList.add('show'), 100);
    }

    // Atualizar o app
    updateApp() {
        if (!this.swRegistration || !this.swRegistration.waiting) return;

        this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
    }

    // Configurar detecção offline/online
    setupOfflineDetection() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.hideOfflineIndicator();
            this.showToast('Conexão restaurada! 🌐', 'success');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showOfflineIndicator();
            this.showToast('Sem conexão - Modo offline ✈️', 'warning');
        });

        // Mostrar indicador se já estiver offline
        if (!this.isOnline) {
            this.showOfflineIndicator();
        }
    }

    // Mostrar indicador offline
    showOfflineIndicator() {
        let indicator = document.querySelector('.offline-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'offline-indicator';
            indicator.innerHTML = `
                <span>⚠️</span>
                <span>Modo Offline</span>
            `;
            document.body.appendChild(indicator);
        }
        
        indicator.classList.add('show');
    }

    // Ocultar indicador offline
    hideOfflineIndicator() {
        const indicator = document.querySelector('.offline-indicator');
        if (indicator) {
            indicator.classList.remove('show');
            indicator.classList.add('hide');
            setTimeout(() => indicator.remove(), 300);
        }
    }

    // Configurar detecção de updates
    setupUpdateDetection() {
        // Verificar updates a cada 5 minutos se o app estiver ativo
        setInterval(() => {
            if (this.swRegistration) {
                this.swRegistration.update();
            }
        }, 5 * 60 * 1000);
    }

    // Prompt específico para iOS
    setupIOSInstallPrompt() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isStandalone = window.navigator.standalone;
        
        if (isIOS && !isStandalone && !this.isInstalled) {
            // Mostrar instruções específicas para iOS após 10 segundos
            setTimeout(() => {
                this.showIOSInstallInstructions();
            }, 10000);
        }
    }

    // Mostrar instruções para iOS
    showIOSInstallInstructions() {
        const lastShown = localStorage.getItem('ios-install-shown');
        if (lastShown) {
            const daysSince = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24);
            if (daysSince < 3) return; // Não mostrar por 3 dias
        }

        const banner = document.createElement('div');
        banner.className = 'pwa-install-banner ios-install';
        banner.innerHTML = `
            <div class="banner-text">
                <div class="banner-title">📱 Instalar no iPhone</div>
                <div class="banner-subtitle">
                    Toque em <strong>⎙</strong> no Safari e depois em <strong>"Adicionar à Tela de Início"</strong>
                </div>
            </div>
            <div class="banner-actions">
                <button class="btn-dismiss">Entendi</button>
            </div>
        `;

        banner.querySelector('.btn-dismiss').addEventListener('click', () => {
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 300);
            localStorage.setItem('ios-install-shown', Date.now().toString());
        });

        document.body.appendChild(banner);
        setTimeout(() => banner.classList.add('show'), 100);
    }

    // Mostrar toast/notificação
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--${type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'secondary'}-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            max-width: calc(100vw - 40px);
        `;

        document.body.appendChild(toast);

        // Mostrar toast
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Remover toast após 4 segundos
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // Métodos públicos para usar em outras partes do app
    getInstallationStatus() {
        return {
            isInstalled: this.isInstalled,
            canInstall: !!this.deferredPrompt,
            isOnline: this.isOnline
        };
    }

    // Forçar prompt de instalação
    triggerInstallPrompt() {
        if (this.deferredPrompt) {
            this.installApp();
        } else if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            this.showIOSInstallInstructions();
        } else {
            this.showToast('Instalação não disponível no momento', 'warning');
        }
    }
}

// Inicializar PWA Manager quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.pwaManager = new PWAManager();
    console.log('🚀 PWA Manager inicializado');
});

// Exportar para uso global
window.PWAManager = PWAManager;
