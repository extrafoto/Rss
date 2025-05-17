const parser = new RSSParser();
let noticias = [];
let indexAtual = 0;
let intervalo = null;
const TEMPO_POR_SLIDE = 6000;

const contentContainer = document.querySelector('.stories-content');
const progressContainer = document.querySelector('.progress-container');
const loadingOverlay = document.querySelector('.loading-overlay');

async function carregarNoticias() {
  loadingOverlay.style.display = 'flex';
  try {
    noticias = await parser.fetchAndParseFeed();
    criarBarrasDeProgresso(noticias.length);
    indexAtual = 0;
    exibirNoticia();
    iniciarTimer();
  } catch (erro) {
    console.error('Erro ao carregar notícias:', erro);
    contentContainer.innerHTML = '<p>Erro ao carregar notícias.</p>';
  } finally {
    loadingOverlay.style.display = 'none';
  }
}

function criarBarrasDeProgresso(qtd) {
  progressContainer.innerHTML = '';
  for (let i = 0; i < qtd; i++) {
    const barra = document.createElement('div');
    barra.className = 'progress-bar';
    progressContainer.appendChild(barra);
  }
}

function exibirNoticia() {
  if (!noticias.length) return;

  const noticia = noticias[indexAtual];
  contentContainer.innerHTML = '';

  // Atualiza as barras
  const barras = document.querySelectorAll('.progress-bar');
  barras.forEach((bar, i) => {
    bar.style.width = i < indexAtual ? '100%' : i === indexAtual ? '0%' : '0%';
    bar.classList.remove('animando');
  });

  setTimeout(() => {
    if (barras[indexAtual]) barras[indexAtual].classList.add('animando');
  }, 50);

  // Cria o card
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

function iniciarTimer() {
  pararTimer();
  intervalo = setInterval(() => {
    indexAtual = (indexAtual + 1) % noticias.length;
    exibirNoticia();
  }, TEMPO_POR_SLIDE);
}

function pararTimer() {
  if (intervalo) clearInterval(intervalo);
}

// Botões manuais
document.getElementById('prev-button').addEventListener('click', () => {
  pararTimer();
  indexAtual = (indexAtual - 1 + noticias.length) % noticias.length;
  exibirNoticia();
  iniciarTimer();
});

document.getElementById('next-button').addEventListener('click', () => {
  pararTimer();
  indexAtual = (indexAtual + 1) % noticias.length;
  exibirNoticia();
  iniciarTimer();
});

carregarNoticias();
