document.addEventListener('DOMContentLoaded', function () {
    // Variáveis globais
    let currentIndex = 0;
    let stories = [];
    let autoPlayTimer;
    let storyDuration = 7000; // 7 segundos por notícia
    let touchStartX = 0;
    let touchEndX = 0;
    let progressBars = [];
    let isTransitioning = false;

    // Elementos DOM corrigidos
    const progressContainer = document.querySelector('.progress-container');
    const storiesContent = document.querySelector('.stories-content');
    const loadingOverlay = document.querySelector('.loading-overlay');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');

    // Inicializar o parser RSS
    const rssParser = new RSSParser();

    // Mapeamento de editorias para cores
 const editoriaCores = {
    esporte: '#3DBE3D',
    blogs: '#2C3E80',
    economia: '#2B7A2B',
    saude: '#3B9DA1',
    mundo: '#2E5ACB',
    cultura: '#803A45'
    ela: #9c27b0'
};

    function obterCorPorLink(link) {
        try {
            const path = new URL(link).pathname.toLowerCase();
            for (const chave in editoriaCores) {
                if (path.includes(chave)) return editoriaCores[chave];
            }
        } catch (e) {
            console.warn('Link inválido:', link);
        }
        return '#0B3861'; // cor padrão
    }

    prevButton.addEventListener('click', () => {
        showStory(currentIndex - 1);
    });

    nextButton.addEventListener('click', () => {
        showStory(currentIndex + 1);
    });

    async function loadStories() {
        try {
            loadingOverlay.classList.remove('hidden');
            stories = await rssParser.fetchAndParseFeed();
            initializeStories();
            setTimeout(() => loadingOverlay.classList.add('hidden'), 500);
        } catch (error) {
            console.error('Erro ao carregar as notícias:', error);
            loadingOverlay.classList.add('hidden');
            storiesContent.innerHTML = `
                <div class="story">
                    <div class="story-title">Erro ao carregar as notícias</div>
                    <div class="story-date">${error.message}</div>
                </div>`;
        }
    }

    function initializeStories() {
        if (!stories.length) return;

        progressContainer.innerHTML = '';
        storiesContent.innerHTML = '';
        progressBars = [];

        stories.forEach(() => {
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            progressBar.innerHTML = '<div class="progress-bar-fill"></div>';
            progressContainer.appendChild(progressBar);
            progressBars.push(progressBar.querySelector('.progress-bar-fill'));
        });

        stories.forEach(story => {
            const storyElement = document.createElement('div');
            storyElement.className = 'story';

            const corFundo = obterCorPorLink(story.link);
            storyElement.style.backgroundColor = corFundo;

            storyElement.innerHTML = `
                <div class="story-content">
                    <div class="story-title">${story.titulo}</div>
                    <div class="story-date">${story.data}</div>
                    <a href="${story.link}" class="read-more-btn" target="_blank" rel="noopener noreferrer">Ler mais</a>
                </div>`;
            storiesContent.appendChild(storyElement);
        });

        showStory(0);
    }

    function showStory(index) {
        if (isTransitioning) return;
        isTransitioning = true;

        currentIndex = Math.max(0, Math.min(index, stories.length - 1));
        storiesContent.style.transform = `translateX(-${currentIndex * 100}%)`;

        document.querySelectorAll('.story').forEach((story, i) => {
            story.classList.toggle('active', i === currentIndex);
        });

        progressBars.forEach((fill, i) => {
            fill.style.transition = 'none';
            fill.style.width = i < currentIndex ? '100%' : '0';
        });

        clearTimeout(autoPlayTimer);
        setTimeout(() => startProgressBar(currentIndex), 50);
        setTimeout(() => (isTransitioning = false), 300);
    }

    function startProgressBar(index) {
        if (index >= progressBars.length) return;
        const fill = progressBars[index];
        if (!fill) return;
        fill.style.transition = `width ${storyDuration}ms linear`;
        fill.style.width = '100%';

        autoPlayTimer = setTimeout(() => {
            showStory((currentIndex + 1) % stories.length);
        }, storyDuration);
    }

    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        clearTimeout(autoPlayTimer);
    });

    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const distance = touchEndX - touchStartX;
        if (distance < -50) showStory(currentIndex + 1);
        else if (distance > 50) showStory(currentIndex - 1);
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) clearTimeout(autoPlayTimer);
        else startProgressBar(currentIndex);
    });

    function addRefreshButton() {
        const refreshButton = document.createElement('div');
        refreshButton.className = 'refresh-button';
        refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i>';
        document.querySelector('.stories-container').appendChild(refreshButton);

        refreshButton.addEventListener('click', loadStories);
    }

    loadStories();
    addRefreshButton();
});
