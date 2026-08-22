// CHATBOT LOGIC
const BOT_NAME = 'MovioBot';
const OMDB_API_KEY = '2cba9fb8';

async function fetchFromOMDB(query) {
  try {
    const isID = query.startsWith('tt') && query.length > 5;
    const param = isID ? `i=${query}` : `t=${encodeURIComponent(query)}`;
    const response = await fetch(`https://www.omdbapi.com/?${param}&apikey=${OMDB_API_KEY}`);
    const data = await response.json();
    if (data.Response === "True") {
      return {
        title: data.Title,
        release_year: parseInt(data.Year),
        rating: parseFloat(data.imdbRating),
        genre: data.Genre,
        genres: data.Genre.split(',').map(g => g.trim().toLowerCase()),
        description: data.Plot,
        director: data.Director,
        duration: data.Runtime,
        type: data.Type,
        source: '🌐 OMDB API',
        poster: data.Poster !== "N/A" ? data.Poster : null,
        language: data.Language,
        imdbID: data.imdbID
      };
    } else {
      console.warn("OMDB Error:", data.Error);
    }
  } catch (error) {
    console.error("OMDB Fetch Error:", error);
  }
  return null;
}

let conversationState = {
  step: 'idle',
  filters: { genre: null, language: null, type: null, minRating: null, bestRated: false, sortBy: 'rating' },
  history: []
};

function resetState() {
  conversationState = { step: 'idle', filters: { genre: null, language: null, type: null, minRating: null, bestRated: false, sortBy: 'rating' }, history: [] };
}

function pushHistory() {
  conversationState.history.push({
    step: conversationState.step,
    filters: { ...conversationState.filters }
  });
}

function normalizeInput(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

async function getBotResponse(userMessage) {
  const msg = userMessage.toLowerCase().trim();
  const normalizedMsg = normalizeInput(userMessage);
  const isRefresh = msg === 'refresh_step';
  const inputBar = document.querySelector('.chat-input-bar');

  // Handle explicit movie search via OMDB
  const searchMatch = msg.match(/^(?:search\s+)?(tt\d{6,}|.+)$/i);
  if (msg.startsWith('search ') || (msg.startsWith('tt') && msg.length > 5)) {
    const query = msg.startsWith('search ') ? userMessage.slice(7).trim() : msg;
    if (query) {
      const movie = await fetchFromOMDB(query);
      if (movie) {
        return {
          text: `⚡ <strong>SYNC COMPLETE</strong>: <strong>${movie.title}</strong> has been identified in the global database.`,
          movies: [movie],
          chips: ['🔄 New Search', '🚀 Restart Engine']
        };
      } else {
        return {
          text: `⚠️ <strong>SIGNAL LOST</strong>: Unable to locate "<strong>${query}</strong>" in the known cinematic universe.`,
          chips: ['🔄 Try Again', '🚀 Home']
        };
      }
    }
  }

  // 0. Handle Global Commands (Start / Back)
  const isStartTrigger = ['start', 'start bot', '/start', '🚀 start bot'].includes(msg);

  // Only trigger start if a message was actually sent while idle, or if it's an explicit start command
  if (isStartTrigger || (conversationState.step === 'idle' && !isRefresh && msg !== '')) {
    const quickFilters = parseNLQuery(userMessage);
    resetState();
    if (inputBar) inputBar.style.display = 'none';

    // Capture any filters from the initial message (e.g. clicking a sidebar chip)
    Object.assign(conversationState.filters, quickFilters);

    // Determine next step based on what we already know
    if (conversationState.filters.language) conversationState.step = 'ask_genre';
    else conversationState.step = 'ask_language';

    return await getBotResponse('refresh_step');
  }

  if (normalizedMsg === 'back' && !isRefresh) {
    if (conversationState.history.length > 0) {
      const prevState = conversationState.history.pop();
      conversationState.step = prevState.step;
      conversationState.filters = prevState.filters;
      if (conversationState.step === 'idle' && inputBar) inputBar.style.display = 'flex';
      return await getBotResponse('refresh_step');
    }
  }

  // 1. Handle Input & State Transitions
  if (!isRefresh) {
    if (conversationState.step === 'ask_language') {
      pushHistory();
      // Remove emojis and extra spaces
      const cleanInput = userMessage.replace(/[^\w\s]/g, '').trim();
      const nlFilters = parseNLQuery(userMessage);
      const lang = nlFilters.language || cleanInput;
      conversationState.filters.language = (lang || '').toLowerCase().includes('any') ? null : lang;
      conversationState.step = 'ask_genre';
      return await getBotResponse('refresh_step');
    } else if (conversationState.step === 'ask_genre') {
      pushHistory();
      const genreInput = userMessage.replace(/^[🎬📺🤷🔴🔵🌐🎭]\s*/, '').trim();
      conversationState.filters.genre = genreInput.toLowerCase().includes('any') ? null : genreInput;
      conversationState.step = 'ask_type';
      return await getBotResponse('refresh_step');
    } else if (conversationState.step === 'ask_type') {
      pushHistory();
      const cleanMsg = msg.replace(/[^\w\s]/g, '').toLowerCase();
      if (normalizedMsg.includes('best movies')) {
        conversationState.filters.type = 'Movie'; conversationState.filters.minRating = 8; conversationState.filters.bestRated = true;
      } else if (normalizedMsg.includes('best series')) {
        conversationState.filters.type = 'TV Show'; conversationState.filters.minRating = 8; conversationState.filters.bestRated = true;
      } else {
        if (cleanMsg.includes('movie')) conversationState.filters.type = 'movie';
        else if (cleanMsg.includes('tv') || cleanMsg.includes('show') || cleanMsg.includes('series') || cleanMsg.includes('webseries')) conversationState.filters.type = 'tv show';
        else conversationState.filters.type = 'Both';
      }
      conversationState.step = 'results';
      return await fetchResults();
    } else if (conversationState.step === 'results') {
      if (msg.includes('more') || msg.includes('another')) return await fetchResults();
      resetState();
      if (inputBar) inputBar.style.display = 'flex';
      conversationState.step = 'ask_language';
      return await getBotResponse('refresh_step');
    }
  }

  // 2. Generate Response based on CURRENT step
  if (conversationState.step === 'ask_language') {
    const indianLangs = ['Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'English'];
    return {
      text: `📡 <strong>INCOMING TRANSMISSION</strong>: Loading cinematic library. Initialize language mapping?`,
      chips: [...indianLangs, 'Any Language', '⬅️ Back']
    };
  }
  if (conversationState.step === 'ask_genre') {
    const genres = getUniqueGenres(conversationState.filters.language);
    const defaultGenres = ['Action', 'Adventure', 'Horror', 'Comedy', 'Crime', 'Fantasy', 'Romance', 'Documentary', 'Drama', 'History'];
    const langPart = conversationState.filters.language ? ` in <strong>${conversationState.filters.language}</strong>` : '';
    return {
      text: `What genre excites you today${langPart}? 🎭`,
      chips: [...(genres.length > 0 ? genres.map(g => `🎭 ${g}`).slice(0, 10) : defaultGenres.map(g => `🎭 ${g}`)), '🤷 Any Genre', '⬅️ Back']
    };
  }
  if (conversationState.step === 'ask_type') {
    return {
      text: `🧬 <strong>NEURAL MATCHING</strong>: Final parameter required. Select format:`,
      chips: ['🎬 Movie', '📺 Webseries', '🤷 Either', '⭐ Best Movies', '⭐ Best Series', '⬅️ Back']
    };
  }
  if (conversationState.step === 'results') {
    return await fetchResults();
  }

  return { text: `👋 Welcome to <strong>${BOT_NAME}</strong>!<br><br>I am your personal cinema assistant. Click the <strong>Start Bot</strong> button below to find your next favorite movie or series.`, chips: [] };
}

async function fetchResults() {
  const { genre, language, type, minRating, yearFrom, yearTo, bestRated, sortBy } = conversationState.filters;
  console.log(`🔍 Fetching results with filters:`, conversationState.filters);
  let results = filterMovies({ genre, language, type, minRating, yearFrom, yearTo });

  // Dynamic Sorting
  if (sortBy === 'year') {
    results.sort((a, b) => (b.release_year || 0) - (a.release_year || 0));
  } else {
    results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  // If "Both/Either" type is selected, ensure we get a mix of Movies and TV Shows
  const cleanType = (type || '').toLowerCase();
  if (!type || cleanType === 'both' || cleanType === 'either') {
    const movies = results.filter(m => !m.type.toLowerCase().includes('tv') && !m.type.toLowerCase().includes('show') && !m.type.toLowerCase().includes('series'));
    const shows = results.filter(m => m.type.toLowerCase().includes('tv') || m.type.toLowerCase().includes('show') || m.type.toLowerCase().includes('series'));

    // Take up to 25 of each to fill the 50 limit
    results = [...movies.slice(0, 25), ...shows.slice(0, 25)];
    if (sortBy === 'year') {
      results.sort((a, b) => (b.release_year || 0) - (a.release_year || 0));
    } else {
      results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
  } else {
    results = results.slice(0, 100); // Increased limit to show even more data
  }

  conversationState.step = 'results';
  if (results.length === 0) {
    return {
      text: `😔 No titles found for those filters. Try different ones!`,
      chips: ['🔄 Try Again'], movies: []
    };
  }
  const parts = [
    genre ? `<strong>${genre}</strong>` : null,
    language ? `in <strong>${language}</strong>` : null,
    type ? `(${type}s)` : null
  ].filter(Boolean).join(' ');

  return {
    text: `🎯 <strong>MATCH FOUND</strong>: Successfully mapped <strong>${results.length}</strong> ${bestRated ? 'elite ' : ''}experiences ${parts}. Ready for playback?`,
    chips: ['🔄 Show More', '🔄 New Discovery', '⬅️ Back'],
    movies: results
  };
}

async function handleSortChange(newSort) {
  conversationState.filters.sortBy = newSort;
  return await fetchResults();
}

window.getConversationState = () => conversationState;
window.handleSortChange = handleSortChange;
