/**
 * Classe para processar o feed RSS a partir da função serverless
 */
class RSSParser {
    constructor() {
        // Endereço da função Netlify que fornece o feed já em JSON
        this.apiEndpoint = '/.netlify/functions/fetchRSS';
    }

    /**
     * Busca e processa os dados já em JSON retornados pelo backend
     * @returns {Promise<Array>} Array de notícias
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

            // Adiciona tratamento para imagem e data no client se necessário
            return items.map(item => ({
                titulo: item.title || item.titulo,
                link: item.link,
                data: this.formatDate(item.pubDate || item.data),
                descricao: item.contentSnippet || item.descricao || '',
                imagem: this.extractImageFromContent(item.content || item.descricao) ||
                    'https://s2.glbimg.com/7Jk2Dl-QwrJT-8YUjMH9-9Ks5vw=/0x0:180x180/180x180/s.glbimg.com/jo/g1/f/original/2015/05/14/o-globo-180x180.png'
            }));
        } catch (error) {
            console.error('Erro ao buscar ou processar o feed RSS:', error);
            throw error;
        }
    }

    /**
     * Extrai a URL da imagem do conteúdo HTML
     * @param {string} html - HTML da descrição
     * @returns {string|null}
     */
    extractImageFromContent(html) {
        if (!html) return null;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const img = tempDiv.querySelector('img');
        return img ? img.src : null;
    }

    /**
     * Formata a data para o padrão brasileiro
     * @param {string} dateStr - Data no formato RSS
     * @returns {string} Data formatada
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
