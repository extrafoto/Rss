/**
 * Função para processar o feed RSS e converter para JSON
 * Usa um proxy CORS para contornar restrições de segurança
 */
class RSSParser {
    constructor() {
        // URL do feed RSS do O Globo
        this.feedUrl = 'https://oglobo.globo.com/rss/oglobo';
        // Proxy CORS para contornar restrições de segurança
        this.corsProxy = 'https://api.codetabs.com/v1/proxy?quest=';
    }

    /**
     * Busca e processa o feed RSS
     * @returns {Promise} Promise com os dados do feed em formato JSON
     */
    async fetchAndParseFeed() {
        try {
            // Busca o feed RSS através do proxy CORS
            console.log('Buscando feed RSS de:', this.feedUrl);
            console.log('Usando proxy:', this.corsProxy);
            
            const response = await fetch(this.corsProxy + encodeURIComponent(this.feedUrl));
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
            }
            
            const xmlText = await response.text();
            console.log('XML recebido, tamanho:', xmlText.length);
            
            // Converte o XML para um objeto DOM
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            // Verifica se o parsing foi bem sucedido
            const parseError = xmlDoc.querySelector('parsererror');
            if (parseError) {
                throw new Error('Erro ao analisar XML: ' + parseError.textContent);
            }
            
            // Processa os itens do feed
            return this.processItems(xmlDoc);
        } catch (error) {
            console.error('Erro ao buscar ou processar o feed RSS:', error);
            throw error;
        }
    }

    /**
     * Processa os itens do feed RSS
     * @param {Document} xmlDoc - Documento XML do feed
     * @returns {Array} Array de objetos com os dados dos itens
     */
    processItems(xmlDoc) {
        const items = xmlDoc.querySelectorAll('item');
        const processedItems = [];

        items.forEach(item => {
            // Extrai os dados básicos do item
            const title = this.getElementText(item, 'title');
            const link = this.getElementText(item, 'link');
            const pubDate = this.getElementText(item, 'pubDate');
            
            // Formata a data
            const formattedDate = this.formatDate(pubDate);
            
            // Adiciona o item processado ao array (sem imagem e descrição)
            processedItems.push({
                titulo: title,
                link: link,
                data: formattedDate
            });
        });

        return processedItems;
    }

    /**
     * Extrai o texto de um elemento XML
     * @param {Element} parent - Elemento pai
     * @param {string} tagName - Nome da tag
     * @returns {string} Texto do elemento ou string vazia
     */
    getElementText(parent, tagName) {
        const element = parent.querySelector(tagName);
        return element ? element.textContent : '';
    }

    /**
     * Extrai a URL da imagem da descrição HTML
     * @param {string} description - Descrição HTML
     * @returns {string|null} URL da imagem ou null
     */
    extractImageFromDescription(description) {
        if (!description) return null;
        
        // Cria um elemento temporário para analisar o HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = description;
        
        // Busca a primeira imagem
        const img = tempDiv.querySelector('img');
        return img ? img.src : null;
    }

    /**
     * Formata a data do feed RSS
     * @param {string} dateStr - String de data no formato RSS
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
