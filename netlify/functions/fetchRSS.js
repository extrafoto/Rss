const Parser = require('rss-parser');
const parser = new Parser();

exports.handler = async function () {
  try {
    const feed = await parser.parseURL('https://oglobo.globo.com/rss/oglobo');
    return {
      statusCode: 200,
      body: JSON.stringify(feed.items),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro ao carregar RSS.' })
    };
  }
};
