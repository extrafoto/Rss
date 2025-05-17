// Script para o painel de notícias em formato 9:16
document.addEventListener('DOMContentLoaded', function() {
    // Variáveis globais
    let currentIndex = 0;
    let stories = [];
    let autoPlayTimer;
    let storyDuration = 7000; // 7 segundos por notícia
    let touchStartX = 0;
    let touchEndX = 0;
    let progressBars = [];
    let isTransitioning = false;

    // Elementos DOM
    const storiesContent = document.querySelector('.stories-content');
    const progressContainer = document.querySelector('.progress-container');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const navLeft = document.querySelector('.nav-left');
    const navRight = document.querySelector('.nav-right');
    const loadingOverlay = document.querySelector('.loading-overlay');

    // Inicializar o parser RSS
    const rssParser = new RSSParser();

    // Carregar as notícias diretamente do feed RSS
    async function loadStories() {
        try {
            // Mostrar overlay de carregamento
            loadingOverlay.classList.remove('hidden');
            
            // Buscar e processar o feed RSS
            stories = await rssParser.fetchAndParseFeed();
            
            console.log('Notícias carregadas:', stories.length);
            
            // Inicializar as histórias
            initializeStories();
            
            // Esconder overlay de carregamento após um pequeno delay para garantir que tudo esteja pronto
            setTimeout(() => {
                loadingOverlay.classList.add('hidden');
            }, 500);
        } catch (error) {
            console.error('Erro ao carregar as notícias:', error);
            // Exibir mensagem de erro na interface
            loadingOverlay.classList.add('hidden');
            storiesContent.innerHTML = `
                <div class="story">
                    <div class="story-title">Erro ao carregar as notícias</div>
                    <div class="story-date">Verifique sua conexão e tente novamente</div>
                    <div class="story-date">${error.message}</div>
                </div>
            `;
        }
    }

    // Inicializar as histórias
    function initializeStories() {
        if (stories.length === 0) return;

        // Limpar conteúdos anteriores
        progressContainer.innerHTML = '';
        storiesContent.innerHTML = '';
        progressBars = [];

        // Criar barras de progresso
        stories.forEach((_, index) => {
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            progressBar.innerHTML = '<div class="progress-bar-fill"></div>';
            progressContainer.appendChild(progressBar);
            progressBars.push(progressBar.querySelector('.progress-bar-fill'));
        });

        // Criar elementos de história
        stories.forEach(story => {
            const storyElement = document.createElement('div');
            storyElement.className = 'story';
            storyElement.innerHTML = `
                <div class="story-image">
                    <img src="${story.imagem}" alt="${story.titulo}">
                </div>
                <div class="story-content">
                    <div class="story-title">${story.titulo}</div>
                    <div class="story-date">${story.data}</div>
                    <a href="${story.link}" class="read-more-btn" target="_blank">Ler mais</a>
                </div>
            `;
            storiesContent.appendChild(storyElement);
        });

        // Iniciar com a primeira história
        showStory(0);
    }

    // Exibir uma história específica
    function showStory(index) {
        if (isTransitioning) return;
        isTransitioning = true;
        
        // Limitar o índice ao intervalo válido
        if (index < 0) index = 0;
        if (index >= stories.length) index = stories.length - 1;
        
        currentIndex = index;
        
        // Atualizar a posição do conteúdo
        storiesContent.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Resetar todas as barras de progresso
        progressBars.forEach((fill, i) => {
            fill.style.width = i < currentIndex ? '100%' : '0';
        });
        
        // Iniciar a barra de progresso atual
        clearTimeout(autoPlayTimer);
        startProgressBar(currentIndex);
        
        // Permitir transição após um pequeno atraso
        setTimeout(() => {
            isTransitioning = false;
        }, 300);
    }

    // Iniciar a barra de progresso
    function startProgressBar(index) {
        if (index >= progressBars.length) return;
        
        const fill = progressBars[index];
        fill.style.width = '0';
        fill.style.transition = `width ${storyDuration}ms linear`;
        
        // Forçar reflow para reiniciar a animação
        void fill.offsetWidth;
        
        // Iniciar animação
        fill.style.width = '100%';
        
        // Configurar timer para próxima história
        autoPlayTimer = setTimeout(() => {
            if (currentIndex < stories.length - 1) {
                showStory(currentIndex + 1);
            } else {
                // Voltar para o início quando chegar ao fim
                showStory(0);
            }
        }, storyDuration);
    }

    // Evento de clique para navegação
    prevButton.addEventListener('click', () => {
        showStory(currentIndex - 1);
    });

    nextButton.addEventListener('click', () => {
        showStory(currentIndex + 1);
    });

    // Navegação por toque na tela
    navLeft.addEventListener('click', () => {
        showStory(currentIndex - 1);
    });

    navRight.addEventListener('click', () => {
        showStory(currentIndex + 1);
    });

    // Eventos de toque para arrastar
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        // Pausar a animação da barra de progresso
        if (currentIndex < progressBars.length) {
            const fill = progressBars[currentIndex];
            const computedStyle = window.getComputedStyle(fill);
            const width = parseFloat(computedStyle.getPropertyValue('width'));
            const parentWidth = fill.parentElement.offsetWidth;
            const progress = width / parentWidth;
            
            fill.style.transition = 'none';
            fill.style.width = `${progress * 100}%`;
            
            clearTimeout(autoPlayTimer);
        }
    });

    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        
        // Reiniciar a animação da barra de progresso
        if (currentIndex < progressBars.length) {
            const fill = progressBars[currentIndex];
            const computedStyle = window.getComputedStyle(fill);
            const width = parseFloat(computedStyle.getPropertyValue('width'));
            const parentWidth = fill.parentElement.offsetWidth;
            const progress = width / parentWidth;
            
            const remainingTime = storyDuration * (1 - progress);
            
            fill.style.transition = `width ${remainingTime}ms linear`;
            fill.style.width = '100%';
            
            autoPlayTimer = setTimeout(() => {
                if (currentIndex < stories.length - 1) {
                    showStory(currentIndex + 1);
                } else {
                    showStory(0);
                }
            }, remainingTime);
        }
    });

    // Lidar com o gesto de arrastar
    function handleSwipe() {
        const swipeThreshold = 50; // Mínimo de pixels para considerar um swipe
        const swipeDistance = touchEndX - touchStartX;
        
        if (swipeDistance < -swipeThreshold) {
            // Swipe para a esquerda (próxima história)
            showStory(currentIndex + 1);
        } else if (swipeDistance > swipeThreshold) {
            // Swipe para a direita (história anterior)
            showStory(currentIndex - 1);
        }
    }

    // Pausar quando a janela não estiver visível
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Pausar quando a página não estiver visível
            if (currentIndex < progressBars.length) {
                const fill = progressBars[currentIndex];
                const computedStyle = window.getComputedStyle(fill);
                const width = parseFloat(computedStyle.getPropertyValue('width'));
                const parentWidth = fill.parentElement.offsetWidth;
                const progress = width / parentWidth;
                
                fill.style.transition = 'none';
                fill.style.width = `${progress * 100}%`;
                
                clearTimeout(autoPlayTimer);
            }
        } else {
            // Reiniciar quando a página voltar a ser visível
            if (currentIndex < progressBars.length) {
                const fill = progressBars[currentIndex];
                const computedStyle = window.getComputedStyle(fill);
                const width = parseFloat(computedStyle.getPropertyValue('width'));
                const parentWidth = fill.parentElement.offsetWidth;
                const progress = width / parentWidth;
                
                const remainingTime = storyDuration * (1 - progress);
                
                fill.style.transition = `width ${remainingTime}ms linear`;
                fill.style.width = '100%';
                
                autoPlayTimer = setTimeout(() => {
                    if (currentIndex < stories.length - 1) {
                        showStory(currentIndex + 1);
                    } else {
                        showStory(0);
                    }
                }, remainingTime);
            }
        }
    });

    // Botão de atualização para recarregar as notícias
    function addRefreshButton() {
        const refreshButton = document.createElement('div');
        refreshButton.className = 'refresh-button';
        refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i>';
        document.querySelector('.stories-container').appendChild(refreshButton);
        
        refreshButton.addEventListener('click', () => {
            loadStories();
        });
    }

    // Iniciar carregamento das notícias
    loadStories();
    
    // Adicionar botão de atualização
    addRefreshButton();
});
