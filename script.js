document.addEventListener('DOMContentLoaded', () => {
  let currentIndex = 0;
  let stories = [];
  let autoPlayTimer;
  let storyDuration = 7000;
  let progressBars = [];

  const storiesContent = document.querySelector('.stories-content');
  const progressContainer = document.querySelector('.progress-container');
  const loadingOverlay = document.querySelector('.loading-overlay');
  const prevButton = document.getElementById('prev-button');
  const nextButton = document.getElementById('next-button');

  const rssParser = new RSSParser();

  async function loadStories() {
    try {
      loadingOverlay.classList.remove('hidden');
      stories = await rssParser.fetchAndParseFeed();
      initializeStories();
      setTimeout(() => loadingOverlay.classList.add('hidden'), 300);
    } catch (error) {
      console.error('Erro ao carregar as notícias:', error);
      storiesContent.innerHTML = `<div class="story"><div class="story-title">Erro</div></div>`;
      loadingOverlay.classList.add('hidden');
    }
  }

  function initializeStories() {
    if (!stories.length) return;

    storiesContent.innerHTML = '';
    progressContainer.innerHTML = '';
    progressBars = [];

    stories.forEach((_, index) => {
      const bar = document.createElement('div');
      bar.className = 'progress-bar';
      bar.innerHTML = '<div class="progress-bar-fill"></div>';
      progressContainer.appendChild(bar);
      progressBars.push(bar.querySelector('.progress-bar-fill'));
    });

    stories.forEach(story => {
      const el = document.createElement('div');
      el.className = 'story';
      el.innerHTML = `
        <div class="story-content">
          <div class="story-title">${story.titulo}</div>
          <div class="story-date">${story.data}</div>
          <a href="${story.link}" class="read-more-btn" target="_blank">Ler mais</a>
          <div class="share-icons">
            <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(story.titulo + ' ' + story.link)}" target="_blank">🟢</a>
            <a href="https://x.com/intent/tweet?text=${encodeURIComponent(story.titulo)}&url=${encodeURIComponent(story.link)}" target="_blank">❌</a>
            <a href="https://bsky.app/profile?text=${encodeURIComponent(story.titulo)} ${encodeURIComponent(story.link)}" target="_blank">🔵</a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(story.link)}" target="_blank">📘</a>
          </div>
        </div>
      `;
      storiesContent.appendChild(el);
    });

    showStory(0);
  }

  function showStory(index) {
    if (index < 0) index = 0;
    if (index >= stories.length) index = stories.length - 1;
    currentIndex = index;

    storiesContent.style.transform = `translateX(-${index * 100}%)`;
    progressBars.forEach((fill, i) => {
      fill.style.transition = 'none';
      fill.style.width = i < index ? '100%' : '0%';
    });

    void progressBars[index].offsetWidth;
    progressBars[index].style.transition = `width ${storyDuration}ms linear`;
    progressBars[index].style.width = '100%';

    clearTimeout(autoPlayTimer);
    autoPlayTimer = setTimeout(() => {
      showStory((index + 1) % stories.length);
    }, storyDuration);
  }

  prevButton.addEventListener('click', () => showStory(currentIndex - 1));
  nextButton.addEventListener('click', () => showStory(currentIndex + 1));

  loadStories();
});
