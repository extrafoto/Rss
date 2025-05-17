document.addEventListener('DOMContentLoaded', () => {
  const parser = new RSSParser();
  let noticias = [];
  let indexAtual = 0;

  const contentContainer = document.querySelector('.stories-content');
  const loadingOverlay = document.querySelector('.loading-overlay');

  async function carregarNoticias() {
    loadingOverlay.style.display = 'flex';
    try {
      noticias = await parser.fetchAndParseFeed();
      indexAtual = 0;
      exibirNoticia();
    } catch (erro) {
      console.error('Erro ao carregar notícias:', erro);
      contentContainer.innerHTML = '<p>Erro ao carregar notícias.</p>';
    } finally {
      loadingOverlay.style.display = 'none';
    }
  }

  function exibirNoticia() {
    if (!noticias.length) return;

    const noticia = noticias[indexAtual];
    contentContainer.innerHTML = ''; // limpa conteúdo anterior

    const card = document.createElement('div');
    card.className = 'card';

    const imagem = document.createElement('img');
    imagem.src = noticia.imagem;
    imagem.alt = noticia.titulo;

    const titulo = document.createElement('h2');
    titulo.textContent = noticia.titulo;

    const data = document.createElement('p');
    data.className = 'data';
    data.textContent = noticia.data;

    const link = document.createElement('a');
    link.href = noticia.link;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'ler-mais';
    link.textContent = 'Ler mais';

    card.appendChild(imagem);
    card.appendChild(titulo);
    card.appendChild(data);
    card.appendChild(link);
    contentContainer.appendChild(card);
  }

  // Navegação
  document.getElementById('prev-button').addEventListener('click', () => {
    if (indexAtual > 0) {
      indexAtual--;
      exibirNoticia();
    }
  });

  document.getElementById('next-button').addEventListener('click', () => {
    if (indexAtual < noticias.length - 1) {
      indexAtual++;
      exibirNoticia();
    }
  });

  carregarNoticias();
});
