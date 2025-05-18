document.addEventListener('DOMContentLoaded', function () {
    let currentIndex = 0;
    let stories = [];
    let autoPlayTimer;
    let storyDuration = 7000;
    let touchStartX = 0;
    let touchEndX = 0;
    let progressBars = [];
    let isTransitioning = false;

    const progressContainer = document.querySelector('.progress-container');
    const storiesContent = document.querySelector('.stories-content');
    const loadingOverlay = document.querySelector('.loading-overlay');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');

    const rssParser = new RSSParser();

    const editoriaCores = {
        esporte: '#3DBE3D',
        blogs: '#2C3E80',
        economia: '#2B7A2B',
        saude: '#3B9DA1',
        mundo: '#2E5ACB',
        ela: '#9C27B0',
        cultura: '#803A45',
        rioshow: '#D97706',
        viagem: '#0E918C',
        'um-so-planeta': '#5A9A3D',
        kogut: '#741B47'
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
        return '#0B3861';
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
                    <div class="share-buttons">
  <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(story.titulo + ' ' + story.link)}" target="_blank" title="WhatsApp">
    <svg height="20" fill="white" opacity="0.5" viewBox="0 0 448 512"><path d="M380.9 97.1C339..."/></svg>
  </a>
  <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(story.link)}" target="_blank" title="Facebook">
    <svg height="20" fill="white" opacity="0.5" viewBox="0 0 320 512"><path d="M279.1 288l14..."/></svg>
  </a>
  <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(story.link)}&text=${encodeURIComponent(story.titulo)}" target="_blank" title="X">
    <svg height="20" fill="white" opacity="0.5" viewBox="0 0 512 512"><path d="M461.2 64H51.8C2..."/></svg>
  </a>
  <a href="https://bsky.app/" target="_blank" title="Bluesky">
    <svg height="20" fill="white" opacity="0.5" viewBox="0 0 48 48"><path d="M..."/></svg>
  </a>
</div>
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
