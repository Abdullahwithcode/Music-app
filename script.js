/* ===========================
   GROOVE MUSIC PLAYER - JS
   =========================== */

/* ---- Track Data ---- */
const tracks = [
  { id:1,  title:"So What",                     artist:"Miles Davis",          album:"Kind of Blue",                  genre:"Jazz",      duration:"9:22",  emoji:"🎷", favorite:true  },
  { id:2,  title:"Georgia On My Mind",           artist:"Ray Charles",          album:"The Genius of Ray Charles",     genre:"Soul",      duration:"3:41",  emoji:"🎹", favorite:true  },
  { id:3,  title:"The Thrill Is Gone",           artist:"B.B. King",            album:"Completely Well",               genre:"Blues",     duration:"5:17",  emoji:"🎸", favorite:false },
  { id:4,  title:"Take Five",                    artist:"Dave Brubeck Quartet", album:"Time Out",                      genre:"Jazz",      duration:"5:24",  emoji:"🎺", favorite:true  },
  { id:5,  title:"A Change Is Gonna Come",       artist:"Sam Cooke",            album:"Ain't That Good News",          genre:"Soul",      duration:"3:16",  emoji:"🎵", favorite:false },
  { id:6,  title:"Clair de Lune",                artist:"Claude Debussy",       album:"Suite bergamasque",             genre:"Classical", duration:"5:09",  emoji:"🎻", favorite:true  },
  { id:7,  title:"Jolene",                       artist:"Dolly Parton",         album:"Jolene",                        genre:"Folk",      duration:"2:41",  emoji:"🪕", favorite:false },
  { id:8,  title:"Blue in Green",                artist:"Miles Davis",          album:"Kind of Blue",                  genre:"Jazz",      duration:"5:37",  emoji:"🎷", favorite:true  },
  { id:9,  title:"I Got You",                    artist:"James Brown",          album:"Papa's Got a Brand New Bag",    genre:"Soul",      duration:"2:55",  emoji:"🎵", favorite:false },
  { id:10, title:"Cross Road Blues",             artist:"Robert Johnson",       album:"The Complete Recordings",       genre:"Blues",     duration:"2:32",  emoji:"🎸", favorite:false },
  { id:11, title:"Midnight Rambler",             artist:"Rolling Stones",       album:"Let It Bleed",                  genre:"Blues",     duration:"6:52",  emoji:"🎸", favorite:false },
  { id:12, title:"Nuvole Bianche",               artist:"Ludovico Einaudi",     album:"Una Mattina",                   genre:"Classical", duration:"5:57",  emoji:"🎹", favorite:true  },
  { id:13, title:"The Sound of Silence",         artist:"Simon & Garfunkel",    album:"Wednesday Morning",             genre:"Folk",      duration:"3:05",  emoji:"🪕", favorite:false },
  { id:14, title:"Autumn Leaves",                artist:"Bill Evans Trio",      album:"Portrait in Jazz",              genre:"Jazz",      duration:"5:55",  emoji:"🎺", favorite:false },
  { id:15, title:"Superstition",                 artist:"Stevie Wonder",        album:"Talking Book",                  genre:"Soul",      duration:"4:03",  emoji:"🎵", favorite:true  },
  { id:16, title:"Moonlight Sonata",             artist:"Ludwig van Beethoven", album:"Piano Sonatas",                 genre:"Classical", duration:"5:30",  emoji:"🎻", favorite:false },
  { id:17, title:"The Times They Are A-Changin'",artist:"Bob Dylan",            album:"The Times They Are A-Changin'", genre:"Folk",      duration:"3:15",  emoji:"🪕", favorite:false },
  { id:18, title:"Fly Me to the Moon",           artist:"Frank Sinatra",        album:"It Might as Well Be Swing",     genre:"Jazz",      duration:"2:28",  emoji:"🎷", favorite:true  },
  { id:19, title:"Ain't No Sunshine",            artist:"Bill Withers",         album:"Just As I Am",                  genre:"Soul",      duration:"2:06",  emoji:"🎵", favorite:false },
  { id:20, title:"Stormy Monday",                artist:"T-Bone Walker",        album:"The Complete Recordings",       genre:"Blues",     duration:"3:20",  emoji:"🎸", favorite:false },
  { id:21, title:"Gymnopédie No.1",              artist:"Erik Satie",           album:"Gymnopédies",                   genre:"Classical", duration:"3:04",  emoji:"🎹", favorite:true  },
  { id:22, title:"Blackbird",                    artist:"The Beatles",          album:"White Album",                   genre:"Folk",      duration:"2:18",  emoji:"🪕", favorite:false },
  { id:23, title:"My Favorite Things",           artist:"John Coltrane",        album:"My Favorite Things",            genre:"Jazz",      duration:"13:41", emoji:"🎷", favorite:false },
  { id:24, title:"Respect",                      artist:"Aretha Franklin",      album:"I Never Loved a Man",           genre:"Soul",      duration:"2:27",  emoji:"🎵", favorite:true  },
];

/* ---- State ---- */
let currentTrackIndex = -1;
let isPlaying   = false;
let isShuffle   = false;
let isRepeat    = false;
let progressInterval = null;
let currentProgress  = 0;
let totalSeconds     = 0;
let currentFilter    = 'all';
let currentSearch    = '';

/* ---- Helpers ---- */
function durationToSec(d) {
  const [m, s] = d.split(':');
  return parseInt(m) * 60 + parseInt(s);
}

function secToDisplay(s) {
  const m   = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function genreClass(g) {
  const map = {
    Jazz: 'genre-jazz', Soul: 'genre-soul', Blues: 'genre-blues',
    Folk: 'genre-folk', Classical: 'genre-classical', 'R&B': 'genre-rb'
  };
  return map[g] || 'genre-jazz';
}

/* ---- Filter / Search ---- */
function getFilteredTracks() {
  return tracks.filter(t => {
    const matchCat    = currentFilter === 'all' || t.genre === currentFilter;
    const q           = currentSearch.toLowerCase();
    const matchSearch = !q
      || t.title.toLowerCase().includes(q)
      || t.artist.toLowerCase().includes(q)
      || t.album.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });
}

/* ---- Render Track List ---- */
function renderTracks() {
  const filtered  = getFilteredTracks();
  const tbody     = document.getElementById('trackList');
  const noResults = document.getElementById('noResults');
  tbody.innerHTML = '';

  if (!filtered.length) {
    noResults.style.display = 'block';
    document.getElementById('sectionSubtitle').textContent = '0 songs';
    return;
  }

  noResults.style.display = 'none';
  const totalSec = filtered.reduce((s, t) => s + durationToSec(t.duration), 0);
  const totalMin = Math.round(totalSec / 60);
  const hrs  = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  document.getElementById('sectionSubtitle').textContent =
    `${filtered.length} songs · ${hrs ? hrs + 'h ' : ''}${mins}m`;

  filtered.forEach((t, i) => {
    const isActive = currentTrackIndex === tracks.indexOf(t);
    const tr = document.createElement('tr');
    tr.className = 'track-row' + (isActive ? ' active' : '');
    tr.innerHTML = `
      <td class="track-num">
        <span class="track-num-static">${i + 1}</span>
        <div class="playing-indicator">
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
        </div>
      </td>
      <td class="track-name-col">
        <div class="track-info">
          <div class="track-thumb" style="background:rgba(239,159,39,0.1)">${t.emoji}</div>
          <div>
            <div class="track-name">${t.title}</div>
            <div class="track-artist">${t.artist}</div>
          </div>
        </div>
      </td>
      <td class="track-album">${t.album}</td>
      <td class="track-genre">
        <span class="genre-pill ${genreClass(t.genre)}">${t.genre}</span>
      </td>
      <td class="track-duration">${t.duration}</td>
    `;
    tr.addEventListener('click', () => playTrack(tracks.indexOf(t)));
    tbody.appendChild(tr);
  });
}

/* ---- Playback ---- */
function playTrack(index) {
  currentTrackIndex = index;
  const t = tracks[index];

  document.getElementById('npTitle').textContent   = t.title;
  document.getElementById('npArtist').textContent  = t.artist;
  document.getElementById('vinylEmoji').textContent = t.emoji;

  clearInterval(progressInterval);
  currentProgress = 0;
  totalSeconds    = durationToSec(t.duration);
  document.getElementById('totalTime').textContent     = secToDisplay(totalSeconds);
  document.getElementById('currentTime').textContent   = '0:00';
  document.getElementById('progressFill').style.width  = '0%';

  isPlaying = true;
  updatePlayState();
  renderTracks();
  startProgress();
}

function startProgress() {
  clearInterval(progressInterval);
  if (!isPlaying) return;

  progressInterval = setInterval(() => {
    currentProgress++;
    if (currentProgress >= totalSeconds) {
      clearInterval(progressInterval);
      if (isRepeat) {
        currentProgress = 0;
        startProgress();
      } else {
        nextTrack();
      }
      return;
    }
    const pct = (currentProgress / totalSeconds) * 100;
    document.getElementById('progressFill').style.width  = pct + '%';
    document.getElementById('currentTime').textContent   = secToDisplay(currentProgress);
  }, 1000);
}

function updatePlayState() {
  const vinyl = document.getElementById('vinyl');
  const btn   = document.getElementById('playBtn');
  if (isPlaying) {
    vinyl.classList.add('spinning');
    btn.textContent = '⏸';
  } else {
    vinyl.classList.remove('spinning');
    btn.textContent = '▶';
  }
}

function nextTrack() {
  const filtered = getFilteredTracks();
  if (!filtered.length) return;

  let nextIdx;
  if (isShuffle) {
    nextIdx = tracks.indexOf(filtered[Math.floor(Math.random() * filtered.length)]);
  } else {
    const cur  = filtered.findIndex(t => tracks.indexOf(t) === currentTrackIndex);
    const next = (cur + 1) % filtered.length;
    nextIdx    = tracks.indexOf(filtered[next]);
  }
  playTrack(nextIdx);
}

function prevTrack() {
  if (currentProgress > 3) {
    currentProgress = 0;
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('currentTime').textContent  = '0:00';
    clearInterval(progressInterval);
    if (isPlaying) startProgress();
    return;
  }

  const filtered = getFilteredTracks();
  if (!filtered.length) return;
  const cur  = filtered.findIndex(t => tracks.indexOf(t) === currentTrackIndex);
  const prev = (cur - 1 + filtered.length) % filtered.length;
  playTrack(tracks.indexOf(filtered[prev]));
}

/* ---- Event Listeners ---- */

// Play / Pause
document.getElementById('playBtn').addEventListener('click', () => {
  if (currentTrackIndex === -1) {
    const filtered = getFilteredTracks();
    if (filtered.length) playTrack(tracks.indexOf(filtered[0]));
    return;
  }
  isPlaying = !isPlaying;
  updatePlayState();
  if (isPlaying) startProgress();
  else clearInterval(progressInterval);
});

// Skip
document.getElementById('nextBtn').addEventListener('click', nextTrack);
document.getElementById('prevBtn').addEventListener('click', prevTrack);

// Shuffle
document.getElementById('shuffleBtn').addEventListener('click', function () {
  isShuffle = !isShuffle;
  this.classList.toggle('active', isShuffle);
});

// Repeat
document.getElementById('repeatBtn').addEventListener('click', function () {
  isRepeat = !isRepeat;
  this.classList.toggle('active', isRepeat);
});

// Progress bar seek
document.getElementById('progressBar').addEventListener('click', function (e) {
  if (currentTrackIndex === -1) return;
  const rect  = this.getBoundingClientRect();
  const pct   = (e.clientX - rect.left) / rect.width;
  currentProgress = Math.floor(pct * totalSeconds);
  document.getElementById('progressFill').style.width = (pct * 100) + '%';
  document.getElementById('currentTime').textContent  = secToDisplay(currentProgress);
});

// Volume
document.getElementById('volSlider').addEventListener('input', function () {
  const v    = parseInt(this.value);
  const icon = document.getElementById('volIcon');
  icon.textContent = v === 0 ? '🔇' : v < 50 ? '🔉' : '🔊';
});

// Search
document.getElementById('searchInput').addEventListener('input', function () {
  currentSearch = this.value;
  document.getElementById('sectionTitle').textContent =
    currentSearch ? `"${currentSearch}"` : 'All Tracks';
  renderTracks();
});

// Category filter buttons
document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentFilter = this.dataset.cat;
    document.getElementById('sectionTitle').textContent =
      currentFilter === 'all' ? 'All Tracks' : currentFilter;
    renderTracks();
  });
});

// Sidebar playlists
document.querySelectorAll('.playlist-item').forEach(item => {
  item.addEventListener('click', function () {
    document.querySelectorAll('.playlist-item').forEach(p => p.classList.remove('active'));
    this.classList.add('active');
    const pl = this.dataset.playlist;
    const titles = {
      all:          'All Tracks',
      favorites:    'Favourites',
      recent:       'Recently Played',
      'late-night': 'Late Night Sessions',
      morning:      'Morning Rituals',
      focus:        'Deep Focus',
    };
    document.getElementById('sectionTitle').textContent = titles[pl] || 'All Tracks';
    currentFilter = 'all';
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.cat-btn[data-cat="all"]').classList.add('active');
    renderTracks();
  });
});

/* ---- Init ---- */
renderTracks();
