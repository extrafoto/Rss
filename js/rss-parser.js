class RSSParser {
  async fetchAndParseFeed() {
    const response = await fetch('/.netlify/functions/fetchRSS');
    return await response.json();
  }
}
