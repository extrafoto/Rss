document.addEventListener('DOMContentLoaded', function() {
  let currentIndex = 0;
  let stories = [];
  let autoPlayTimer;
  let storyDuration = 7000;
  let progressBars = [];

  const storiesContent = document.querySelector('.stories-content');
  const progressContainer = document.querySelector('.progress-container');
  const prevButton = document.getElementById('prev-button');
  const nextButton = document.getElementById('next-button');
  const loadingOverlay = document.querySelector('.loading-overlay');

  const rssParser = new RSSParser();

  async function loadStories() {
    try {
      loadingOverlay.classList.remove('hidden');
      stories = await rssParser.parseURL('https://api.codetabs.com/v1/proxy?quest=https://oglobo.globo.com/rss/oglobo');
      initializeStories();
      loadingOverlay.classList.add('hidden');
    } catch (error) {
      console.error('Erro ao carregar as notícias:', error);
      loadingOverlay.classList.add('hidden');
    }
  }

  function initializeStories() {
    progressContainer.innerHTML = '';
    storiesContent.innerHTML = '';
    progressBars = [];

    stories.items.forEach((item, index) => {
      const progressBar = document.createElement('div');
      progressBar.className = 'progress-bar';
      progressBar.innerHTML = '<div class="progress-bar-fill"></div>';
      progressContainer.appendChild(progressBar);
      progressBars.push(progressBar.querySelector('.progress-bar-fill'));

      const storyElement = document.createElement('div');
      storyElement.className = 'story';
      storyElement.innerHTML = \`
        <div class="story-title">\${item.title}</div>
        <div class="story-date">\${new Date(item.pubDate).toLocaleString()}</div>
        <a href="\${item.link}" class="read-more-btn" target="_blank">Ler mais</a>
        <div class="share-icons">
          <a href="https://wa.me/?text=\${encodeURIComponent(item.link)}" target="_blank"><i class="fab fa-whatsapp"></i></a>
          <a href="https://x.com/intent/tweet?url=\${encodeURIComponent(item.link)}" target="_blank"><i class="fab fa-twitter"></i></a>
          <a href="https://bsky.app/?url=\${encodeURIComponent(item.link)}" target="_blank"><i class="fas fa-globe"></i></a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=\${encodeURIComponent(item.link)}" target="_blank"><i class="fab fa-facebook"></i></a>
        </div>
      \`;
      storiesContent.appendChild(storyElement);
    });

    showStory(0);
  }

  function showStory(index) {
    currentIndex = Math.max(0, Math.min(index, stories.items.length - 1));
    storiesContent.style.transform = \`translateX(-\${currentIndex * 100}%)\`;
    progressBars.forEach((bar, i) => {
      bar.style.width = i < currentIndex ? '100%' : '0';
    });
    clearTimeout(autoPlayTimer);
    startProgressBar(currentIndex);
  }

  function startProgressBar(index) {
    const fill = progressBars[index];
    fill.style.width = '0';
    fill.style.transition = \`width \${storyDuration}ms linear\`;
    void fill.offsetWidth;
    fill.style.width = '100%';
    autoPlayTimer = setTimeout(() => {
      if (currentIndex < stories.items.length - 1) {
        showStory(currentIndex + 1);
      } else {
        showStory(0);
      }
    }, storyDuration);
  }

  prevButton.addEventListener('click', () => {
    showStory(currentIndex - 1);
  });

  nextButton.addEventListener('click', () => {
    showStory(currentIndex + 1);
  });

  loadStories();
});
