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
                const rawHtml = item.content || item.description || item.descricao || '';
                const imagemExtraida = this.extractImageFromContent(rawHtml);

                const imagemFinal = imagemExtraida || 'https://via.placeholder.com/400x240?text=Sem+Imagem';

                console.log('Imagem detectada:', imagemFinal); // log para debug

                return {
                    titulo: item.title || item.titulo,
                    link: item.link,
                    data: this.formatDate(item.pubDate || item.data),
                    descricao: item.contentSnippet || item.descricao || '',
                    imagem: imagemFinal
                };
            });

        } catch (error) {
            console.error('Erro ao buscar ou processar o feed RSS:', error);
            throw error;
        }
    }

    /**
     * Extrai a URL da imagem de um conteúdo HTML
     */
    extractImageFromContent(html) {
        if (!html) return null;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const img = tempDiv.querySelector('img');
        if (img && img.src && img.src.startsWith('http')) {
            return img.src;
        }
        return null;
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
