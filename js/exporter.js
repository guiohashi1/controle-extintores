// ========================================
// SISTEMA DE EXPORTAÇÃO COM VALIDAÇÃO DE PLANO
// ========================================

class ExtintorExporter {
    constructor() {
        // Removido dependência do PlanValidator
    }

    /**
     * Verificar se pode exportar baseado no plano do usuário
     */
    canExport(format) {
        const user = getCurrentUser();
        if (!user) return false;

        const subscription = user.subscription || 'starter';
        
        // PDF sempre disponível
        if (format === 'pdf') return true;
        
        // Outros formatos apenas para Professional+
        if (subscription === 'starter') {
            this.showUpgradeModal(format);
            return false;
        }
        
        return true;
    }

    /**
     * Mostrar modal de upgrade
     */
    showUpgradeModal(format) {
        const formatNames = {
            'excel': 'Excel',
            'csv': 'CSV', 
            'json': 'JSON'
        };

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content upgrade-modal">
                <div class="modal-header">
                    <h3>⭐ Recurso Premium</h3>
                </div>
                <div class="modal-body">
                    <p>A exportação em <strong>${formatNames[format]}</strong> está disponível apenas para planos <strong>Professional</strong> e <strong>Enterprise</strong>.</p>
                    <p>Faça o upgrade para desbloquear:</p>
                    <ul>
                        <li>📄 Exportação PDF</li>
                        <li>📊 Exportação Excel/CSV/JSON</li>
                        <li>📈 Relatórios avançados</li>
                        <li>📸 Upload de fotos</li>
                        <li>🔄 Backup automático</li>
                    </ul>
                </div>
                <div class="modal-footer">
                    <button onclick="this.closest('.modal-overlay').remove()" class="btn btn-secondary">
                        Continuar com Plano Atual
                    </button>
                    <a href="https://wa.me/5511999999999" target="_blank" class="btn btn-primary">
                        ⭐ Fazer Upgrade
                    </a>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    /**
     * Exportar dados em PDF (disponível para todos os planos)
     */
    async exportToPDF() {
        try {
            // PDF sempre disponível
            const extintores = await this.getExtintoresData();
            
            if (extintores.length === 0) {
                showNotification('Nenhum extintor encontrado para exportar', 'warning');
                return false;
            }
            
            // Criar conteúdo HTML para PDF
            const htmlContent = this.generatePDFContent(extintores);
            
            // Abrir em nova janela para impressão/PDF
            const printWindow = window.open('', '_blank');
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.print();
            
            showNotification('PDF gerado com sucesso!');
            console.log('✅ Exportação PDF iniciada');
            return true;
            
        } catch (error) {
            console.error('❌ Erro na exportação PDF:', error);
            showNotification('Erro ao gerar PDF', 'error');
            return false;
        }
    }

    /**
     * Exportar para Excel (Professional+)
     */
    async exportToExcel() {
        if (!this.canExport('excel')) {
            return false;
        }

        try {
            const extintores = await this.getExtintoresData();
            
            if (extintores.length === 0) {
                showNotification('Nenhum extintor encontrado para exportar', 'warning');
                return false;
            }

            // Criar conteúdo Excel mais robusto
            const excelContent = this.generateExcelContent(extintores);
            
            const blob = new Blob([excelContent], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            const filename = `extintores_${new Date().toISOString().split('T')[0]}.xls`;
            
            this.downloadFile(blob, filename);
            
            showNotification('Excel exportado com sucesso!');
            console.log('✅ Exportação Excel concluída');
            return true;
            
        } catch (error) {
            console.error('❌ Erro na exportação Excel:', error);
            showNotification('Erro ao exportar Excel', 'error');
            return false;
        }
    }

    /**
     * Exportar para CSV (Professional+)
     */
    async exportToCSV() {
        if (!this.canExport('csv')) {
            return false;
        }

        try {
            const extintores = await this.getExtintoresData();
            
            if (extintores.length === 0) {
                showNotification('Nenhum extintor encontrado para exportar', 'warning');
                return false;
            }

            const csvContent = this.generateCSVContent(extintores);
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const filename = `extintores_${new Date().toISOString().split('T')[0]}.csv`;
            
            this.downloadFile(blob, filename);
            
            showNotification('CSV exportado com sucesso!');
            console.log('✅ Exportação CSV concluída');
            return true;
            
        } catch (error) {
            console.error('❌ Erro na exportação CSV:', error);
            showNotification('Erro ao exportar CSV', 'error');
            return false;
        }
    }

    /**
     * Exportar para JSON (Professional+)
     */
    async exportToJSON() {
        if (!this.canExport('json')) {
            return false;
        }

        try {
            const extintores = await this.getExtintoresData();
            
            if (extintores.length === 0) {
                showNotification('Nenhum extintor encontrado para exportar', 'warning');
                return false;
            }

            const jsonContent = JSON.stringify({
                exportDate: new Date().toISOString(),
                exportBy: getCurrentUser()?.email || 'Usuário',
                totalRecords: extintores.length,
                data: extintores.map(ext => ({
                    ...ext,
                    status: this.getStatusValidade(ext.validade),
                    diasRestantes: this.getDiasRestantes(ext.validade)
                }))
            }, null, 2);
            
            const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
            const filename = `extintores_${new Date().toISOString().split('T')[0]}.json`;
            
            this.downloadFile(blob, filename);
            
            showNotification('JSON exportado com sucesso!');
            console.log('✅ Exportação JSON concluída');
            return true;
            
        } catch (error) {
            console.error('❌ Erro na exportação JSON:', error);
            showNotification('Erro ao exportar JSON', 'error');
            return false;
        }
    }

    /**
     * Obter dados dos extintores (usa dados filtrados se disponíveis)
     */
    async getExtintoresData() {
        try {
            // Tentar usar dados filtrados da página primeiro
            if (typeof extintoresFiltrados !== 'undefined' && extintoresFiltrados.length > 0) {
                return extintoresFiltrados;
            }
            
            // Fallback para todos os extintores
            if (typeof extintores !== 'undefined' && extintores.length > 0) {
                return extintores;
            }
            
            // Carregar dados via função global
            if (typeof carregarExtintores === 'function') {
                return await carregarExtintores();
            }
            
            // Último recurso: localStorage
            const savedData = localStorage.getItem('extintores');
            return savedData ? JSON.parse(savedData) : [];
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            return [];
        }
    }

    /**
     * Gerar conteúdo HTML para PDF
     */
    generatePDFContent(extintores) {
        const user = getCurrentUser();
        const empresa = user?.nome_empresa || 'Empresa';
        
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Relatório de Extintores - ${empresa}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .company-name { font-size: 24px; font-weight: bold; color: #2c3e50; }
                .report-title { font-size: 18px; color: #34495e; margin-top: 10px; }
                .meta-info { margin: 20px 0; color: #7f8c8d; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f8f9fa; font-weight: bold; }
                .status-vencido { color: #e74c3c; font-weight: bold; }
                .status-atencao { color: #f39c12; font-weight: bold; }
                .status-ok { color: #27ae60; }
                .footer { margin-top: 30px; text-align: center; color: #95a5a6; font-size: 12px; }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company-name">${empresa}</div>
                <div class="report-title">Relatório de Extintores de Incêndio</div>
                <div class="meta-info">
                    Gerado em: ${new Date().toLocaleString('pt-BR')} | 
                    Total de registros: ${extintores.length}
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Número</th>
                        <th>Local</th>
                        <th>Tipo</th>
                        <th>Peso (kg)</th>
                        <th>Validade</th>
                        <th>Teste Hidrostático</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${extintores.map(ext => {
                        const status = this.getStatusValidade(ext.validade);
                        const statusClass = status === 'Vencido' ? 'status-vencido' : 
                                          status === 'Atenção' ? 'status-atencao' : 'status-ok';
                        
                        return `
                        <tr>
                            <td>${ext.numero || ''}</td>
                            <td>${ext.local || ''}</td>
                            <td>${ext.tipo || ''}</td>
                            <td>${ext.peso || ''}</td>
                            <td>${this.formatDate(ext.validade)}</td>
                            <td>${this.formatDate(ext.hidro)}</td>
                            <td class="${statusClass}">${status}</td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            
            <div class="footer">
                <p>Relatório gerado pelo Sistema de Controle de Extintores</p>
                <p>Este documento contém informações confidenciais da empresa</p>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Gerar conteúdo CSV
     */
    generateCSVContent(extintores) {
        const headers = ['Número', 'Local', 'Tipo', 'Peso (kg)', 'Validade', 'Teste Hidrostático', 'Status', 'Dias Restantes', 'Observações'];
        const rows = [headers.join(';')];
        
        extintores.forEach(ext => {
            const status = this.getStatusValidade(ext.validade);
            const diasRestantes = this.getDiasRestantes(ext.validade);
            const row = [
                `"${ext.numero || ''}"`,
                `"${ext.local || ''}"`,
                `"${ext.tipo || ''}"`,
                `"${ext.peso || ''}"`,
                `"${this.formatDate(ext.validade)}"`,
                `"${this.formatDate(ext.hidro)}"`,
                `"${status}"`,
                `"${diasRestantes}"`,
                `"${ext.observacoes || ''}"`
            ];
            rows.push(row.join(';'));
        });
        
        return rows.join('\n');
    }

    /**
     * Gerar conteúdo Excel (HTML table)
     */
    generateExcelContent(extintores) {
        const user = getCurrentUser();
        const empresa = user?.nome_empresa || 'Empresa';
        
        let html = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="utf-8">
                <meta name="ProgId" content="Excel.Sheet">
                <meta name="Generator" content="Microsoft Excel 15">
            </head>
            <body>
                <table>
                    <tr style="background-color: #4CAF50; color: white; font-weight: bold;">
                        <td colspan="9" style="text-align: center; font-size: 16px; padding: 10px;">
                            Relatório de Extintores - ${empresa}
                        </td>
                    </tr>
                    <tr style="background-color: #f2f2f2;">
                        <td colspan="9" style="text-align: center; padding: 5px;">
                            Gerado em: ${new Date().toLocaleString('pt-BR')} | Total: ${extintores.length} extintores
                        </td>
                    </tr>
                    <tr></tr>
                    <tr style="background-color: #e0e0e0; font-weight: bold;">
                        <td>Número</td>
                        <td>Local</td>
                        <td>Tipo</td>
                        <td>Peso (kg)</td>
                        <td>Validade</td>
                        <td>Teste Hidrostático</td>
                        <td>Status</td>
                        <td>Dias Restantes</td>
                        <td>Observações</td>
                    </tr>
        `;

        extintores.forEach(ext => {
            const status = this.getStatusValidade(ext.validade);
            const diasRestantes = this.getDiasRestantes(ext.validade);
            const statusColor = status === 'Vencido' ? '#ffebee' : 
                              status === 'Atenção' ? '#fff3e0' : '#e8f5e8';
            
            html += `
                <tr style="background-color: ${statusColor};">
                    <td>${ext.numero || ''}</td>
                    <td>${ext.local || ''}</td>
                    <td>${ext.tipo || ''}</td>
                    <td>${ext.peso || ''}</td>
                    <td>${this.formatDate(ext.validade)}</td>
                    <td>${this.formatDate(ext.hidro)}</td>
                    <td>${status}</td>
                    <td>${diasRestantes}</td>
                    <td>${ext.observacoes || ''}</td>
                </tr>
            `;
        });

        html += `
                </table>
            </body>
            </html>
        `;

        return html;
    }

    /**
     * Calcular status de validade
     */
    getStatusValidade(validade) {
        if (!validade) return 'Sem Data';
        
        const hoje = new Date();
        const dataValidade = new Date(validade);
        const diffTime = dataValidade - hoje;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'Vencido';
        if (diffDays <= 30) return 'Atenção';
        return 'OK';
    }

    /**
     * Calcular dias restantes
     */
    getDiasRestantes(validade) {
        if (!validade) return 'N/A';
        
        const hoje = new Date();
        const dataValidade = new Date(validade);
        const diffTime = dataValidade - hoje;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return `${Math.abs(diffDays)} dias atrás`;
        if (diffDays === 0) return 'Hoje';
        return `${diffDays} dias`;
    }

    /**
     * Formatar data
     */
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('pt-BR');
        } catch (error) {
            return 'Data inválida';
        }
    }

    /**
     * Fazer download do arquivo
     */
    downloadFile(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
}

// Instância global
const extintorExporter = new ExtintorExporter();

// Funções de conveniência
function exportarPDF() {
    return extintorExporter.exportToPDF();
}

function exportarExcel() {
    return extintorExporter.exportToExcel();
}

function exportarCSV() {
    return extintorExporter.exportToCSV();
}

function exportarJSON() {
    return extintorExporter.exportToJSON();
}

console.log('✅ Sistema de exportação carregado com validação de planos');
