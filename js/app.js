const apiUrl = 'https://api.lyrics.ovh';
const searchForm = document.getElementById('search-form');
const searchTermField = document.getElementById('search-term-field');
const songsList = document.getElementById('songs-list');
const lyricsModal = new bootstrap.Modal('#view-lyrics-modal');
const lyricsBody = document.getElementById('view-lyrics-body');

async function getLyrics(artist, song) {
  lyricsModal.show();
  lyricsBody.innerHTML = showLoading();

  try {
    if (artist && song) {
      const response = await fetch(`${apiUrl}/v1/${encodeURIComponent(artist)}/${encodeURIComponent(song)}`);
      const json = await response.json();
      showLyrics(json, artist, song);
    }
  } catch(e) {
    console.error(e);
    lyricsBody.innerHTML = showMessage('danger', 'There was an issue getting lyrics. Please try again.');
  }
}

async function getSongs(term) {
  songsList.innerHTML = showLoading();

  try {
    if (term) {
      const response = await fetch(`${apiUrl}/suggest/${encodeURIComponent(term)}`);
      const json = await response.json();
      showSongs(json);
    }
  } catch(e) {
    console.error(e);
    songsList.innerHTML = showMessage('danger', 'There was an issue searching. Please try again.');
  }
}

function showLoading() {
  return `
    <div class="d-flex justify-content-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div> 
  `;
}

function showLyrics(json, artist, song) {
  if (json.error) {
    lyricsBody.innerHTML = showMessage('warning', 'Sorry, there are no lyrics found for this song.');
  } else {
    const lyrics = json.lyrics
      .replace(/['&]/g, '')
      .replace(`Paroles de la chanson ${song} par ${artist}`, '')
      .replace(/\r?\n|\r/g, '<br>');

    lyricsBody.innerHTML = `<h4 class="fs-5">${song}</h3><h5 class="fs-6">by ${artist}</h4> ${lyrics}`;
  }
}

function showMessage(type, message) {
  return `<div class="alert alert-${type}" role="alert">${message}</div>`;
}

function showSongs(json) {
  songsList.innerHTML = `
    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3 mb-3">
      ${json.data.map(song => `
        <div class="col">
          <div class="card bg-dark-subtle h-100">
            <img src="${song.album.cover_big || 'https://placehold.co/500x500?text=No+Image'}" class="card-img-top" alt="${song.album.title}">
            <div class="card-body">
              <h1 class="card-title fs-5">${song.title_short}</h1>
              <h2 class="card-subtitle fs-6 ${song.explicit_lyrics ? '' : 'mb-3'}">by ${song.artist.name}</h2>
              ${song.explicit_lyrics ? '<span class="badge text-bg-warning mb-3">Explicit Lyrics</span>' : ''}
              ${song.preview ? '<audio controls><source src="' + song.preview + '" type="audio/mpeg">Your browser does not support the audio element.</audio>' : ''}
            </div>
            <div class="card-body">
              <a href="#" data-artist="${song.artist.name}" data-song="${song.title_short}" class="card-link view-lyrics">View Lyrics</a>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// Listen for form submission
searchForm.addEventListener('submit', e => {
  e.preventDefault();
  const term = searchTermField.value?.trim();
  getSongs(term);
});

searchTermField.addEventListener('click', e => {
  searchTermField.select();
});

// Listen for clicks within songs list
songsList.addEventListener('click', e => {
  const element = e.target;

  // Clicked on View Lyrics link
  if (element.classList.contains('view-lyrics')) {
    e.preventDefault();
    const artist = element.getAttribute('data-artist');
    const song = element.getAttribute('data-song');
    getLyrics(artist, song);
  }
});