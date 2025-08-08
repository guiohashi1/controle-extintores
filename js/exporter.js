// ========================================
// SISTEMA DE EXPORTAÇÃO COM VALIDAÇÃO DE PLANO
// ========================================

class ExtintorExporter {
    constructor() {
        this.planValidator = window.PlanValidator;
    }

    /**
     * Exportar dados em PDF (disponível para todos os planos)
     */
    async exportToPDF() {
        try {
            const extintores = await this.getExtintoresData();
            
            // Criar conteúdo HTML para PDF
            const htmlContent = this.generatePDFContent(extintores);
            
            // Abrir em nova janela para impressão/PDF
            const printWindow = window.open('', '_blank');
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.print();
            
            console.log('✅ Exportação PDF iniciada');
            return true;
            
        } catch (error) {
            console.error('❌ Erro na exportação PDF:', error);
            throw error;
        }
    }

    /**
     * Exportar para Excel (Professional+)
     */
    async exportToExcel() {
        if (!this.planValidator.canExport('excel')) {
            return false; // Modal já foi mostrado
        }

        try {
            const extintores = await this.getExtintoresData();
            const csvContent = this.generateCSVContent(extintores);
            
            // Criar arquivo Excel (CSV com extensão .xlsx)
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const filename = `extintores_${new Date().toISOString().split('T')[0]}.xlsx`;
            
            this.downloadFile(blob, filename);
            
            console.log('✅ Exportação Excel concluída');
            return true;
            
        } catch (error) {
            console.error('❌ Erro na exportação Excel:', error);
            throw error;
        }
    }

    /**
     * Exportar para CSV (Professional+)
     */
    async exportToCSV() {
        if (!this.planValidator.canExport('csv')) {
            return false; // Modal já foi mostrado
        }

        try {
            const extintores = await this.getExtintoresData();
            const csvContent = this.generateCSVContent(extintores);
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const filename = `extintores_${new Date().toISOString().split('T')[0]}.csv`;
            
            this.downloadFile(blob, filename);
            
            console.log('✅ Exportação CSV concluída');
            return true;
            
        } catch (error) {
            console.error('❌ Erro na exportação CSV:', error);
            throw error;
        }
    }

    /**
     * Exportar para JSON (Enterprise)
     */
    async exportToJSON() {
        if (!this.planValidator.canExport('json')) {
            return false; // Modal já foi mostrado
        }

        try {
            const extintores = await this.getExtintoresData();
            const jsonContent = JSON.stringify({
                exportDate: new Date().toISOString(),
                totalRecords: extintores.length,
                data: extintores
            }, null, 2);
            
            const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
            const filename = `extintores_${new Date().toISOString().split('T')[0]}.json`;
            
            this.downloadFile(blob, filename);
            
            console.log('✅ Exportação JSON concluída');
            return true;
            
        } catch (error) {
            console.error('❌ Erro na exportação JSON:', error);
            throw error;
        }
    }

    /**
     * Obter dados dos extintores
     */
    async getExtintoresData() {
        try {
            if (typeof carregarExtintores === 'function') {
                return await carregarExtintores();
            } else {
                // Fallback para dados do localStorage
                return JSON.parse(localStorage.getItem('extintores') || '[]');
            }
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
                            <td>${ext.numero}</td>
                            <td>${ext.local}</td>
                            <td>${ext.tipo}</td>
                            <td>${ext.peso}</td>
                            <td>${new Date(ext.validade).toLocaleDateString('pt-BR')}</td>
                            <td>${new Date(ext.hidro).toLocaleDateString('pt-BR')}</td>
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
        const headers = ['Número', 'Local', 'Tipo', 'Peso (kg)', 'Validade', 'Teste Hidrostático', 'Status', 'Observações'];
        const rows = [headers.join(';')];
        
        extintores.forEach(ext => {
            const status = this.getStatusValidade(ext.validade);
            const row = [
                ext.numero,
                ext.local,
                ext.tipo,
                ext.peso,
                new Date(ext.validade).toLocaleDateString('pt-BR'),
                new Date(ext.hidro).toLocaleDateString('pt-BR'),
                status,
                ext.observacoes || ''
            ];
            rows.push(row.join(';'));
        });
        
        return rows.join('\\n');
    }

    /**
     * Calcular status de validade
     */
    getStatusValidade(validade) {
        const hoje = new Date();
        const dataValidade = new Date(validade);
        const diffTime = dataValidade - hoje;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'Vencido';
        if (diffDays <= 30) return 'Atenção';
        return 'OK';
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
