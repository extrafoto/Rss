class RSSParser {
    constructor() {
        // Endpoint da função serverless
        this.apiEndpoint = '/.netlify/functions/fetchRSS';
    }

    /**
     * Busca e processa os dados do feed já em JSON
     */
    async fetchAndParseFeed() {
        try {
            console.log('Buscando feed RSS via função serverless:', this.apiEndpoint);
            const response = await fetch(this.apiEndpoint);

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
            }

            const items = await response.json();
            console.log('Feed recebido, itens:', items.length);

            return items.map(item => {
                return {
                    titulo: item.title || 'Sem título',
                    link: item.link,
                    data: this.formatDate(item.pubDate || item.data)
                };
            });

        } catch (error) {
            console.error('Erro ao buscar ou processar o feed RSS:', error);
            throw error;
        }
    }

    /**
     * Formata a data para o padrão brasileiro
     */
    formatDate(dateStr) {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateStr;
        }
    }
}
