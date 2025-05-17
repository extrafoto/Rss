class RSSParser {
  constructor() {
    this.apiEndpoint = '/.netlify/functions/fetchRSS';
  }

  async fetchAndParseFeed() {
    try {
      console.log('Buscando feed RSS via função serverless:', this.apiEndpoint);
      const response = await fetch(this.apiEndpoint);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
      }

      const items = await response.json();
      console.log('Feed recebido, itens:', items.length);

      return items.map(item => ({
        titulo: item.title || 'Sem título',
        link: item.link,
        data: this.formatDate(item.pubDate || item.data)
      }));
    } catch (error) {
      console.error('Erro ao buscar ou processar o feed RSS:', error);
      throw error;
    }
  }

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
