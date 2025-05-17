const Parser = require('rss-parser');
const parser = new Parser();

exports.handler = async function () {
  const feed = await parser.parseURL('https://oglobo.globo.com/rss/oglobo');
  const items = feed.items.slice(0, 10).map(item => ({
    titulo: item.title,
    link: item.link,
    data: item.pubDate,
    descricao: item.contentSnippet,
    imagem: item.enclosure?.url || ''
  }));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(items)
  };
};
