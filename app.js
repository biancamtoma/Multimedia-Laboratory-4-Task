const albumGrid = document.getElementById('albumGrid');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const backToTopBtn = document.getElementById('backToTop');
let albums = [];

// Fetch albums from JSON
fetch('assets/data/library.json')
  .then(res => res.json())
  .then(data => {
    albums = data;
    displayAlbums(albums);
  })
  .catch(err => console.error('Fetch error:', err));


// Display albums dynamically
function displayAlbums(albumList) {
  albumGrid.innerHTML = '';

  if (albumList.length === 0) {
    albumGrid.innerHTML = `
      <div class="col-12">
        <p class="text-center text-muted">No albums found.</p>
      </div>
    `;
    return;
  }

  albumList.forEach((album, index) => {
    const col = document.createElement('div');
    col.className = 'col-xl-2 col-md-3 col-sm-6 col-12 mb-4 d-flex';
    col.innerHTML = `
      <div class="card album-card w-100 position-relative">
        <img src="assets/img/${album.thumbnail}" class="card-img-top" alt="${album.album}">
        <div class="overlay-text">${album.album}</div>
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${album.artist}</h5>
          <p class="card-text mb-3">${album.album}</p>
        </div>
        <div class="card-footer">
          <button
            class="btn btn-primary view-tracklist-btn"
            data-index="${index}"
            data-bs-toggle="modal"
            data-bs-target="#tracklistModal"
          >
            View Tracklist
          </button>
        </div>
      </div>
    `;
    albumGrid.appendChild(col);
  });

  // Event listeners for modal buttons
  document.querySelectorAll('.view-tracklist-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const albumIndex = e.currentTarget.dataset.index;
      showTracklistModal(albums[albumIndex]);
    });
  });
}

// Populate modal with album data
function showTracklistModal(album) {
  const modalTitle = document.getElementById('tracklistModalLabel');
  const tracklistBody = document.getElementById('tracklistBody');
  const albumStats = document.getElementById('albumStats');
  const spotifyLink = document.getElementById('spotifyLink');

  modalTitle.textContent = `${album.artist} - ${album.album}`;
  spotifyLink.href = album.tracklist[0]?.url || '#';

  // Statistics
  const totalTracks = album.tracklist.length;
  const totalSeconds = album.tracklist.reduce((sum, t) => {
    const [m, s] = t.trackLength.split(':').map(Number);
    return sum + m * 60 + s;
  }, 0);
  const avgSeconds = Math.floor(totalSeconds / totalTracks);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalRemSeconds = totalSeconds % 60;

  const shortest = album.tracklist.reduce((a, b) => {
    const aSec = a.trackLength.split(':').reduce((x, y) => x * 60 + Number(y), 0);
    const bSec = b.trackLength.split(':').reduce((x, y) => x * 60 + Number(y), 0);
    return aSec < bSec ? a : b;
  });
  const longest = album.tracklist.reduce((a, b) => {
    const aSec = a.trackLength.split(':').reduce((x, y) => x * 60 + Number(y), 0);
    const bSec = b.trackLength.split(':').reduce((x, y) => x * 60 + Number(y), 0);
    return aSec > bSec ? a : b;
  });

  albumStats.innerHTML = `
    <p><strong>Total Tracks:</strong> ${totalTracks}</p>
    <p><strong>Total Duration:</strong> ${totalMinutes}:${totalRemSeconds.toString().padStart(2,'0')}</p>
    <p><strong>Average Track Length:</strong> ${Math.floor(avgSeconds/60)}:${(avgSeconds%60).toString().padStart(2,'0')}</p>
    <p><strong>Shortest Track:</strong> ${shortest.title} (${shortest.trackLength})</p>
    <p><strong>Longest Track:</strong> ${longest.title} (${longest.trackLength})</p>
  `;

  // Populate tracklist
  tracklistBody.innerHTML = '';
  album.tracklist.forEach((track) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${track.number}</td>
      <td>
        <a href="${track.url}" target="_blank" class="text-decoration-none link-primary">
          ${track.title}
        </a>
      </td>
      <td>${track.trackLength}</td>
    `;
    tracklistBody.appendChild(tr);
  });
}

// Search functionality
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase().trim();
  const filtered = albums.filter(a =>
    a.artist.toLowerCase().includes(query) || a.album.toLowerCase().includes(query)
  );
  displayAlbums(filtered);
});

// Sort functionality
sortSelect.addEventListener('change', () => {
  const value = sortSelect.value;
  let sorted = [...albums];
  switch (value) {
    case 'artist':
      sorted.sort((a, b) => a.artist.localeCompare(b.artist));
      break;
    case 'album':
      sorted.sort((a, b) => a.album.localeCompare(b.album));
      break;
    case 'tracks-asc':
      sorted.sort((a, b) => a.tracklist.length - b.tracklist.length);
      break;
    case 'tracks-desc':
      sorted.sort((a, b) => b.tracklist.length - a.tracklist.length);
      break;
  }
  displayAlbums(sorted);
});

// Back to top button (optional)
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTopBtn.classList.remove('d-none');
  } else {
    backToTopBtn.classList.add('d-none');
  }
});

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
