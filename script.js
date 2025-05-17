const parser = new RSSParser();
let noticias = [];
let indexAtual = 0;

async function carregarNoticias() {
    try {
        noticias = await parser.fetchAndParseFeed();
        indexAtual = 0;
        exibirNoticia();
    } catch (erro) {
        console.error('Erro ao carregar notícias:', erro);
    }
}

function exibirNoticia() {
    if (!noticias.length) return;

    const noticia = noticias[indexAtual];
    const container = document.getElementById('noticia');
    container.innerHTML = '';

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

    container.appendChild(card);
}

document.getElementById('anterior').addEventListener('click', () => {
    if (indexAtual > 0) {
        indexAtual--;
        exibirNoticia();
    }
});

document.getElementById('proximo').addEventListener('click', () => {
    if (indexAtual < noticias.length - 1) {
        indexAtual++;
        exibirNoticia();
    }
});

document.getElementById('atualizar').addEventListener('click', carregarNoticias);

carregarNoticias();
