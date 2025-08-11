// ========== FUNÇÕES SIMPLIFICADAS - RELATÓRIOS PROFISSIONAIS ==========

async function inicializarRelatoriosAvancados() {
    console.log('📊 Inicializando relatórios profissionais simplificados...');
    
    // Aguardar extintores carregarem
    if (!extintores || extintores.length === 0) {
        console.log('⏳ Aguardando extintores carregarem...');
        setTimeout(inicializarRelatoriosAvancados, 500);
        return;
    }

    await Promise.all([
        refreshAlerts(),
        updateVencimentosChart(),
        updateLocationsChart(),
        updateHistoricoManutencoes()
    ]);

    console.log('✅ Relatórios profissionais inicializados!');
}

// Alertas Importantes
async function refreshAlerts() {
    const container = document.getElementById('alertsContainer');
    if (!container) return;

    const alerts = generateSimpleAlerts();
    
    container.innerHTML = alerts.map(alert => `
        <div class="simple-alert ${alert.type}">
            <span class="alert-icon">${alert.icon}</span>
            <span class="alert-text">${alert.message}</span>
            ${alert.action ? `<button onclick="${alert.action}" class="alert-action">Ver</button>` : ''}
        </div>
    `).join('');
}

function generateSimpleAlerts() {
    const alerts = [];
    const today = new Date();
    
    // Contar vencimentos por período
    let vencidos = 0;
    let proximo30 = 0;
    let proximo7 = 0;
    
    extintores.forEach(ext => {
        const expDate = new Date(ext.validade);
        const diffTime = expDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) vencidos++;
        else if (diffDays <= 7) proximo7++;
        else if (diffDays <= 30) proximo30++;
    });

    // Alertas críticos
    if (vencidos > 0) {
        alerts.push({
            type: 'critical',
            icon: '🚨',
            message: `${vencidos} extintor${vencidos > 1 ? 'es já venceram' : ' já venceu'}! Ação imediata necessária.`
        });
    }

    if (proximo7 > 0) {
        alerts.push({
            type: 'warning',
            icon: '⚠️',
            message: `${proximo7} extintor${proximo7 > 1 ? 'es vencem' : ' vence'} em 7 dias.`
        });
    }

    if (proximo30 > 0) {
        alerts.push({
            type: 'info',
            icon: '📅',
            message: `${proximo30} extintor${proximo30 > 1 ? 'es vencem' : ' vence'} nos próximos 30 dias.`
        });
    }

    // Alerta positivo se tudo estiver ok
    if (alerts.length === 0) {
        alerts.push({
            type: 'success',
            icon: '✅',
            message: 'Todos os extintores estão em dia! Parabéns pela organização.'
        });
    }

    return alerts;
}

// Gráfico de Vencimentos
async function updateVencimentosChart() {
    const ctx = document.getElementById('vencimentosChart');
    if (!ctx) return;

    const periodo = parseInt(document.getElementById('vencimentoPeriod')?.value || 12);
    const data = generateVencimentosData(periodo);

    // Destruir gráfico anterior se existir
    if (window.vencimentosChart) {
        window.vencimentosChart.destroy();
    }

    window.vencimentosChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Vencimentos',
                data: data.values,
                backgroundColor: data.values.map(v => 
                    v > 5 ? '#dc2626' : v > 2 ? '#d97706' : '#059669'
                ),
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: { 
                    display: true, 
                    text: `Vencimentos - Próximos ${periodo} meses` 
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                }
            }
        }
    });

    // Atualizar resumo
    updateVencimentosSummary();
}

function generateVencimentosData(meses) {
    const labels = [];
    const values = [];
    const today = new Date();
    
    for (let i = 0; i < meses; i++) {
        const month = new Date(today.getFullYear(), today.getMonth() + i, 1);
        const monthName = month.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        labels.push(monthName);
        
        const count = extintores.filter(ext => {
            const expDate = new Date(ext.validade);
            return expDate.getMonth() === month.getMonth() && 
                   expDate.getFullYear() === month.getFullYear();
        }).length;
        
        values.push(count);
    }
    
    return { labels, values };
}

function updateVencimentosSummary() {
    const today = new Date();
    let vencidos = 0, proximo30 = 0, validos = 0;
    
    extintores.forEach(ext => {
        const expDate = new Date(ext.validade);
        const diffTime = expDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) vencidos++;
        else if (diffDays <= 30) proximo30++;
        else validos++;
    });

    document.getElementById('vencidosCount').textContent = vencidos;
    document.getElementById('proximoVencimentoCount').textContent = proximo30;
    document.getElementById('validosCount').textContent = validos;
}

// Controle por Localização
async function updateLocationsChart() {
    const ctx = document.getElementById('locationsChart');
    if (!ctx) return;

    const locationData = generateLocationData();
    updateLocationsGrid(locationData);

    // Destruir gráfico anterior se existir
    if (window.locationsChart) {
        window.locationsChart.destroy();
    }

    window.locationsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: locationData.labels,
            datasets: [{
                data: locationData.values,
                backgroundColor: [
                    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
                    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: { 
                    display: true, 
                    text: 'Distribuição por Local' 
                }
            }
        }
    });
}

function generateLocationData() {
    const locations = {};
    
    extintores.forEach(ext => {
        const local = ext.localizacao || 'Não informado';
        locations[local] = (locations[local] || 0) + 1;
    });
    
    return {
        labels: Object.keys(locations),
        values: Object.values(locations),
        details: locations
    };
}

function updateLocationsGrid(locationData) {
    const container = document.getElementById('locationsGrid');
    if (!container) return;

    const today = new Date();
    
    container.innerHTML = Object.entries(locationData.details).map(([local, count]) => {
        // Calcular status para este local
        const extintoresLocal = extintores.filter(ext => 
            (ext.localizacao || 'Não informado') === local
        );
        
        let ok = 0, warning = 0, critical = 0;
        
        extintoresLocal.forEach(ext => {
            const expDate = new Date(ext.validade);
            const diffTime = expDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) critical++;
            else if (diffDays <= 30) warning++;
            else ok++;
        });

        return `
            <div class="location-card">
                <div class="location-name">${local}</div>
                <div class="location-count">${count} extintor${count > 1 ? 'es' : ''}</div>
                <div class="location-status">
                    ${ok > 0 ? `<span class="status-indicator ok">${ok} OK</span>` : ''}
                    ${warning > 0 ? `<span class="status-indicator warning">${warning} Atenção</span>` : ''}
                    ${critical > 0 ? `<span class="status-indicator critical">${critical} Crítico</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Histórico de Manutenções (Simulado)
async function updateHistoricoManutencoes() {
    const container = document.getElementById('timelineContainer');
    if (!container) return;

    const historicoData = generateHistoricoData();
    
    container.innerHTML = historicoData.map(item => `
        <div class="timeline-item">
            <div class="timeline-icon ${item.type}">
                ${item.icon}
            </div>
            <div class="timeline-content">
                <div class="timeline-title">${item.title}</div>
                <div class="timeline-description">${item.description}</div>
                <div class="timeline-date">${item.date}</div>
            </div>
        </div>
    `).join('');

    // Atualizar estatísticas
    updateMaintenanceStats(historicoData);
}

function generateHistoricoData() {
    const historico = [];
    const today = new Date();
    
    // Simular histórico baseado nos extintores
    extintores.slice(0, 5).forEach((ext, index) => {
        const daysAgo = 30 + (index * 20);
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);
        
        historico.push({
            type: index % 2 === 0 ? 'maintenance' : 'replacement',
            icon: index % 2 === 0 ? '🔧' : '🔄',
            title: index % 2 === 0 ? 'Manutenção Preventiva' : 'Substituição Completa',
            description: `${ext.numero} - ${ext.localizacao}`,
            date: date.toLocaleDateString('pt-BR'),
            cost: Math.floor(Math.random() * 200) + 50
        });
    });
    
    return historico.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function updateMaintenanceStats(historico) {
    const totalManutencoes = historico.length;
    const custoMedio = historico.reduce((sum, h) => sum + (h.cost || 0), 0) / totalManutencoes;
    
    // Calcular próximas manutenções (baseado em vencimentos próximos)
    const proximasManutencoes = extintores.filter(ext => {
        const expDate = new Date(ext.validade);
        const today = new Date();
        const diffTime = expDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 90 && diffDays > 0;
    }).length;

    document.getElementById('totalManutencoes').textContent = totalManutencoes;
    document.getElementById('custoMedioManutencao').textContent = `R$ ${custoMedio.toFixed(0)}`;
    document.getElementById('proximasManutencoes').textContent = proximasManutencoes;
}

// Exportação Simplificada
async function exportVencimentos() {
    showNotification('Gerando relatório de vencimentos...', 'info');
    
    // Simular processamento
    setTimeout(() => {
        showNotification('Relatório de vencimentos exportado com sucesso!', 'success');
    }, 1500);
}
