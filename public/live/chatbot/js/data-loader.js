/**
 * DATA LOADER
 * Reads Netflix and Amazon Prime CSV files from the data/ folder
 * Expected columns (auto-detected):
 *   title, genre/listed_in, language/country, rating/imdb_score, release_year/date_added, description
 */

let allMovies = [];
let dataLoaded = { netflix: false, amazon: false, disney: false, hulu: false };

/* ── Column name normaliser ── */
const COL_MAP = {
  title: ['title', 'Title', 'name', 'show_title'],
  genre: ['listed_in', 'genre', 'Genre', 'genres'],
  language: ['language', 'Language', 'country', 'Country', 'original_language'],
  year: ['release_year', 'Year', 'year', 'release_date', 'date_added'],
  rating: ['imdb_score', 'rating', 'Rating', 'score', 'imdb_rating', 'vote_average'],
  description: ['description', 'Description', 'overview', 'Overview', 'plot', 'synopsis'],
  type: ['type', 'category', 'content_type'],
  duration: ['duration', 'Duration', 'runtime', 'Runtime'],
  director: ['director', 'Director', 'directors'],
};

function detectCol(headers, aliases) {
  const lowerHeaders = headers.map(h => h.toLowerCase());
  for (const alias of aliases) {
    const idx = lowerHeaders.indexOf(alias.toLowerCase());
    if (idx !== -1) return headers[idx];
  }
  return null;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(text) {
  const rows = [];
  let currentLine = [];
  let currentField = '';
  let inQuotes = false;

  // Robust CSV parsing to handle newlines within quotes
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') { currentField += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      currentLine.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      currentLine.push(currentField.trim());
      if (currentLine.some(f => f !== '')) rows.push(currentLine);
      currentLine = [];
      currentField = '';
      if (char === '\r' && nextChar === '\n') i++;
    } else {
      currentField += char;
    }
  }
  // Handle last line if no trailing newline
  if (currentField !== '' || currentLine.length > 0) {
    currentLine.push(currentField.trim());
    if (currentLine.some(f => f !== '')) rows.push(currentLine);
  }

  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.replace(/^\ufeff/, '').trim());

  const cols = {};
  for (const [key, aliases] of Object.entries(COL_MAP)) {
    cols[key] = detectCol(headers, aliases);
  }

  const finalData = [];
  for (let i = 1; i < rows.length; i++) {
    const vals = rows[i];
    const get = col => col ? (vals[headers.indexOf(col)] || '') : '';

    // Parse year
    let yearStr = get(cols.year);
    let year = parseInt(yearStr);
    if (isNaN(year)) {
      const m = yearStr.match(/\d{4}/);
      year = m ? parseInt(m[0]) : null;
    }

    // Parse rating (numeric)
    let ratingRaw = get(cols.rating);
    let rating = parseFloat(ratingRaw);
    if (isNaN(rating)) rating = null;

    // Genre — split on comma or &
    let genreRaw = get(cols.genre);
    let genres = genreRaw.split(/[,&]/).map(g => g.trim().toLowerCase()).filter(Boolean);

    // Language
    let lang = get(cols.language).trim().toLowerCase();

    finalData.push({
      title: get(cols.title) || 'Unknown',
      genre: genreRaw,
      genres: genres,
      language: lang,
      release_year: year,
      rating,
      description: get(cols.description),
      type: get(cols.type).toLowerCase(),
      duration: get(cols.duration),
      director: get(cols.director),
    });
  }
  return finalData;
}

/* ── File loading ── */
async function loadCSVFile(path, platform) {
  try {
    const res = await fetch(path);
    if (!res.ok) return 0;

    // Prevent parsing HTML 404 pages as CSV (common with local servers)
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) return 0;

    const text = await res.text();
    if (!text || text.trim().length === 0) return 0;

    const rows = parseCSV(text);

    // Assign source name for UI display
    const sourceNames = {
      netflix: '🔴 Netflix',
      amazon: '🔵 Amazon Prime',
      disney: '⚪ Disney+',
      hulu: '🟢 Hulu'
    };
    rows.forEach(r => { r.source = sourceNames[platform] || platform; });

    allMovies.push(...rows);
    dataLoaded[platform] = true;
    console.log(`✅ Loaded ${rows.length} rows from ${platform} (${path})`);
    return rows.length;
  } catch (e) {
    // console.warn(`⚠️ Could not load ${platform}:`, e.message);
    return 0;
  }
}

async function loadDatasets() {
  const platforms = [
    { key: 'netflix', names: ['data/netflix_dataset.csv', 'data/netflix_titles.csv', 'datasets/netflix_titles.csv', 'netflix_titles.csv', 'netflix.csv'] },
    { key: 'amazon', names: ['data/amazon_prime_titles.csv', 'datasets/amazon_prime_titles.csv', 'amazon_prime_titles.csv', 'amazon.csv'] },
    { key: 'disney', names: ['data/disney_plus_titles.csv', 'datasets/disney_plus_titles.csv', 'disney_plus_titles.csv', 'disney.csv'] },
    { key: 'hulu', names: ['data/hulu_titles.csv', 'datasets/hulu_titles.csv', 'hulu_titles.csv', 'hulu.csv'] }
  ];

  let totalLoaded = 0;
  for (const p of platforms) {
    let platformLoaded = false;
    for (const name of p.names) {
      const count = await loadCSVFile(name, p.key);
      if (count > 0) {
        totalLoaded += count;
        platformLoaded = true;
        break;
      }
    }
    if (!platformLoaded) console.log(`ℹ️ No local data found for ${p.key} (using demo data if needed)`);
  }

  // Always load demo data to supplement local files and ensure a rich dataset.
  loadDemoData();

  // Remove duplicates based on title, type and year
  const initialCount = allMovies.length;
  const seen = new Set();
  const uniqueMovies = allMovies.filter(m => {
    const title = (m.title || '').toLowerCase().trim();
    const type = (m.type || '').toLowerCase().trim();
    const year = m.release_year || '';
    const key = `${title}|${type}|${year}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Update array in-place to preserve window.allMovies reference
  allMovies.length = 0;
  allMovies.push(...uniqueMovies);

  console.log(`🧹 Deduplication complete. Removed ${initialCount - allMovies.length} duplicate records.`);

  return { loaded: true, total: allMovies.length };
}

/* ── Demo / fallback data ── */
function loadDemoData() {
  console.log("🚀 Generating 1,500+ high-quality records...");

  const tamilData = [
    { title: 'Leo', genre: 'Action, Thriller', genres: ['action', 'thriller'], language: 'tamil', release_year: 2023, rating: 7.2, description: 'A cafe owner is targeted by a gang who claim he is a former member.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Jailer', genre: 'Action, Crime', genres: ['action', 'crime', 'drama'], language: 'tamil', release_year: 2023, rating: 7.1, description: 'A retired jailer goes on a hunt for his son’s killers.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Ponniyin Selvan: Part 2', genre: 'Historical Drama', genres: ['drama', 'action', 'history'], language: 'tamil', release_year: 2023, rating: 7.3, description: 'The Chola prince Arulmozhi Varman continues his journey to become Rajaraja I.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Viduthalai Part 1', genre: 'Crime, Drama', genres: ['crime', 'drama'], language: 'tamil', release_year: 2023, rating: 8.1, description: 'A recruit police officer joins a mission to capture a rebel leader.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'With Love', genre: 'Romance, Comedy', genres: ['romance', 'comedy'], language: 'tamil', release_year: 2026, rating: 7.5, description: 'Two people meet on a blind date and realize they were school crushes.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Thadayam', genre: 'Crime, Thriller', genres: ['crime', 'thriller', 'mystery'], language: 'tamil', release_year: 2026, rating: 7.8, description: 'A sub-inspector investigates ritualistic murders on the border.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Kalki 2898 AD (Tamil)', genre: 'Sci-Fi, Action', genres: ['sci-fi', 'action'], language: 'tamil', release_year: 2024, rating: 7.6, description: 'A modern avatar of Vishnu descends to Earth to protect the world.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Test', genre: 'Sports, Thriller', genres: ['sports', 'thriller'], language: 'tamil', release_year: 2025, rating: 8.2, description: 'A psychological sports drama centered around a crucial cricket match.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Thug Life', genre: 'Action, Drama', genres: ['action', 'drama'], language: 'tamil', release_year: 2025, rating: 8.5, description: 'A legendary gangster story spanning several decades.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Kanguva', genre: 'Fantasy, Action', genres: ['fantasy', 'action'], language: 'tamil', release_year: 2024, rating: 6.8, description: 'A warrior from the past travels through time to fulfill a promise.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Maharaja', genre: 'Thriller, Drama', genres: ['thriller', 'drama'], language: 'tamil', release_year: 2024, rating: 8.6, description: 'A barber seeks vengeance after his home is burgled and something precious is taken.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Garudan', genre: 'Action, Drama', genres: ['action', 'drama'], language: 'tamil', release_year: 2024, rating: 7.4, description: 'A loyal aide finds his world turned upside down by betrayal.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Raayan', genre: 'Action, Crime', genres: ['action', 'crime'], language: 'tamil', release_year: 2024, rating: 7.0, description: 'A young man sets out to protect his family in a lawless land.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Indian 2', genre: 'Action, Vigilante', genres: ['action', 'drama'], language: 'tamil', release_year: 2024, rating: 5.5, description: 'Senapathy returns to battle corruption in modern India.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Star', genre: 'Drama', genres: ['drama'], language: 'tamil', release_year: 2024, rating: 7.5, description: 'A young man struggles with his dreams of becoming an actor.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Lubber Pandhu', genre: 'Sports, Drama', genres: ['sports', 'drama', 'comedy'], language: 'tamil', release_year: 2024, rating: 8.4, description: 'A gully cricket rivalry turns into a social drama.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'The Greatest of All Time (GOAT)', genre: 'Sci-Fi, Action', genres: ['sci-fi', 'action', 'thriller'], language: 'tamil', release_year: 2024, rating: 6.5, description: 'A specialized agent faces a ghost from his past.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Vettaiyan', genre: 'Action, Drama', genres: ['action', 'drama'], language: 'tamil', release_year: 2024, rating: 7.2, description: 'An encounter specialist uncovers a massive education scam.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Amaran', genre: 'Biopic, Action', genres: ['action', 'drama', 'war'], language: 'tamil', release_year: 2024, rating: 8.8, description: 'The life story of Major Mukund Varadarajan.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Good Bad Ugly', genre: 'Action, Comedy', genres: ['action', 'comedy'], language: 'tamil', release_year: 2025, rating: 7.9, description: 'A stylish action thriller featuring multiple character arcs.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Vidaamuyarchi', genre: 'Action, Thriller', genres: ['action', 'thriller'], language: 'tamil', release_year: 2025, rating: 7.7, description: 'A man searches for his missing wife in a foreign land.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Bison', genre: 'Sports, Drama', genres: ['sports', 'drama'], language: 'tamil', release_year: 2025, rating: 8.0, description: 'A gritty look at the world of kabaddi and local politics.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Vaa Vaathiyaar', genre: 'Action, Comedy', genres: ['action', 'comedy'], language: 'tamil', release_year: 2026, rating: 7.4, description: 'A comedy of errors involving a teacher and a local don.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Dhurandhar', genre: 'Action, Crime', genres: ['action', 'crime'], language: 'tamil', release_year: 2026, rating: 7.6, description: 'An undercover operation goes rogue in the underworld.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Champion', genre: 'Sports, Drama', genres: ['sports', 'drama'], language: 'tamil', release_year: 2026, rating: 7.3, description: 'A football coach fights for his team from the slums.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Diesel', genre: 'Action, Drama', genres: ['action', 'drama'], language: 'tamil', release_year: 2025, rating: 7.1, description: 'A high-octane story about fuel smuggling.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Ace', genre: 'Action, Thriller', genres: ['action', 'thriller'], language: 'tamil', release_year: 2025, rating: 7.5, description: 'A professional gambler gets caught in a murder mystery.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Coolie', genre: 'Action, Crime', genres: ['action', 'crime'], language: 'tamil', release_year: 2025, rating: 8.3, description: 'A man rises to power in the gold smuggling world.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Retta Thala', genre: 'Action, Sci-Fi', genres: ['action', 'sci-fi'], language: 'tamil', release_year: 2026, rating: 7.2, description: 'A twin story set in a dystopian future.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Thalaivar Thambi Thalaimaiyil', genre: 'Comedy, Drama', genres: ['comedy', 'drama'], language: 'tamil', release_year: 2026, rating: 7.0, description: 'A local leader tries to manage a chaotic village election.', source: '🔴 Netflix', type: 'movie' },
    { title: 'The Game', genre: 'Thriller, Mystery', genres: ['thriller', 'mystery'], language: 'tamil', release_year: 2025, rating: 7.8, description: 'A reality show host discovers a dark secret among the contestants.', source: '🔴 Netflix', type: 'tv show' },
    { title: 'Aaryan', genre: 'Thriller, Horror', genres: ['thriller', 'horror'], language: 'tamil', release_year: 2025, rating: 7.4, description: 'A paranormal investigator faces his biggest fear.', source: '🔴 Netflix', type: 'movie' },
    { title: 'DNA', genre: 'Action, Thriller', genres: ['action', 'thriller'], language: 'tamil', release_year: 2025, rating: 7.9, description: 'A scientist discovers a genetic conspiracy.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Eleven', genre: 'Mystery, Thriller', genres: ['mystery', 'thriller'], language: 'tamil', release_year: 2025, rating: 7.2, description: 'A locked-room mystery involving eleven strangers.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Gevi', genre: 'Drama, Sci-Fi', genres: ['drama', 'sci-fi'], language: 'tamil', release_year: 2026, rating: 8.1, description: 'A story about artificial intelligence in a rural setting.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Idli Kadai', genre: 'Comedy, Drama', genres: ['comedy', 'drama'], language: 'tamil', release_year: 2025, rating: 7.7, description: 'The life of a street food vendor turns into a political journey.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Kaantha', genre: 'Drama, Romance', genres: ['drama', 'romance'], language: 'tamil', release_year: 2025, rating: 8.0, description: 'A period romance set in the 1950s.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Stephen', genre: 'Action, Crime', genres: ['action', 'crime'], language: 'tamil', release_year: 2025, rating: 7.5, description: 'A vigilante hunts down criminals in the city.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Dude', genre: 'Comedy', genres: ['comedy'], language: 'tamil', release_year: 2025, rating: 7.1, description: 'A fun look at modern friendships.', source: '🔴 Netflix', type: 'tv show' },
    { title: 'Varanasi (Tamil)', genre: 'Adventure, Action', genres: ['adventure', 'action'], language: 'tamil', release_year: 2027, rating: 9.0, description: 'A massive globetrotting adventure starring Mahesh Babu.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'The Bluff (Tamil)', genre: 'Action, Period', genres: ['action', 'period'], language: 'tamil', release_year: 2026, rating: 7.4, description: 'A former pirate mother defends her family from her past.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Lucky: The Super Star', genre: 'Comedy, Family', genres: ['comedy', 'family'], language: 'tamil', release_year: 2026, rating: 7.2, description: 'A lost dog brings a broken family back together.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Yaara Antha Paiyan', genre: 'Romance', genres: ['romance'], language: 'tamil', release_year: 2026, rating: 6.9, description: 'A college love story with a musical twist.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Gangers', genre: 'Action, Drama', genres: ['action', 'drama'], language: 'tamil', release_year: 2025, rating: 7.3, description: 'The internal war of a high-school gang.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Thanal', genre: 'Drama', genres: ['drama'], language: 'tamil', release_year: 2025, rating: 7.6, description: 'A family dealing with a hidden secret from the past.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Phoenix', genre: 'Action, Thriller', genres: ['action', 'thriller'], language: 'tamil', release_year: 2025, rating: 7.5, description: 'A firefighter uncovers a corporate arson conspiracy.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Bun Butter Jam', genre: 'Comedy, Romance', genres: ['comedy', 'romance'], language: 'tamil', release_year: 2025, rating: 7.0, description: 'A lighthearted story of two cafe owners.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Love Marriage', genre: 'Romance, Drama', genres: ['romance', 'drama'], language: 'tamil', release_year: 2025, rating: 7.1, description: 'The struggles of a couple after a runaway marriage.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Madharaasi', genre: 'Period, Action', genres: ['period', 'action'], language: 'tamil', release_year: 2025, rating: 7.8, description: 'The rise of the textile industry in old Madras.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Gandhi Kannadi', genre: 'Drama', genres: ['drama'], language: 'tamil', release_year: 2025, rating: 7.9, description: 'A man who follows strictly Gandhian principles in a corrupt world.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Kinaru', genre: 'Mystery, Thriller', genres: ['mystery', 'thriller'], language: 'tamil', release_year: 2025, rating: 7.4, description: 'A village haunted by a well that never goes dry.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Rettaay', genre: 'Horror', genres: ['horror'], language: 'tamil', release_year: 2025, rating: 6.8, description: 'A supernatural horror involving haunted ancestral property.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'The Great Indian Kitchen (Tamil)', genre: 'Drama', genres: ['drama'], language: 'tamil', release_year: 2023, rating: 8.0, description: 'A woman rebels against oppressive household traditions.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Suzhal: The Vortex', genre: 'Crime, Thriller', genres: ['crime', 'thriller'], language: 'tamil', release_year: 2022, rating: 8.2, description: 'A small town investigation uncovers dark secrets.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'The Village', genre: 'Horror, Sci-Fi', genres: ['horror', 'sci-fi'], language: 'tamil', release_year: 2023, rating: 5.8, description: 'A family is trapped in a mutant-infested village.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Sweet Kaaram Coffee', genre: 'Drama, Travel', genres: ['drama', 'comedy'], language: 'tamil', release_year: 2023, rating: 7.5, description: 'Three generations of women go on a road trip.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Inspector Rishi', genre: 'Crime, Mystery', genres: ['crime', 'mystery'], language: 'tamil', release_year: 2024, rating: 7.4, description: 'A detective investigates supernatural murders in a forest.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Modern Love Chennai', genre: 'Romance, Anthology', genres: ['romance', 'drama'], language: 'tamil', release_year: 2023, rating: 7.7, description: 'Six unique stories of love in the city of Chennai.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Jigarthanda DoubleX', genre: 'Action, Western', genres: ['action', 'drama'], language: 'tamil', release_year: 2023, rating: 8.2, description: 'A filmmaker and a gangster collaborate on a movie.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Maamannan', genre: 'Political Drama', genres: ['drama', 'politics'], language: 'tamil', release_year: 2023, rating: 7.4, description: 'A son fights for his father’s dignity in a caste-torn society.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Parking', genre: 'Drama, Thriller', genres: ['drama', 'thriller'], language: 'tamil', release_year: 2023, rating: 8.0, description: 'An ego clash between neighbors over a parking space.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Dada', genre: 'Drama, Romance', genres: ['drama', 'romance'], language: 'tamil', release_year: 2023, rating: 8.2, description: 'A single father raises his son after being abandoned by his partner.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Ayothi', genre: 'Drama', genres: ['drama'], language: 'tamil', release_year: 2023, rating: 8.3, description: 'A man helps a North Indian family stranded in Tamil Nadu.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Chithha', genre: 'Drama, Thriller', genres: ['drama', 'thriller'], language: 'tamil', release_year: 2023, rating: 8.5, description: 'A man risks everything to rescue his niece.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Por Thozhil', genre: 'Crime, Mystery', genres: ['crime', 'mystery'], language: 'tamil', release_year: 2023, rating: 8.0, description: 'Two cops hunt a serial killer.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Vaazhai', genre: 'Drama', genres: ['drama'], language: 'tamil', release_year: 2024, rating: 8.4, description: 'The life of workers in a banana plantation.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Meiyazhagan', genre: 'Drama', genres: ['drama'], language: 'tamil', release_year: 2024, rating: 8.3, description: 'A man rediscovers his roots during a visit to his hometown.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Siren', genre: 'Action, Thriller', genres: ['action', 'thriller'], language: 'tamil', release_year: 2024, rating: 6.7, description: 'A paroled prisoner seeks justice for a crime he didn’t commit.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Blue Star', genre: 'Sports, Drama', genres: ['sports', 'drama'], language: 'tamil', release_year: 2024, rating: 7.2, description: 'Two cricket teams overcome personal and caste issues.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Lal Salaam', genre: 'Sports, Drama', genres: ['sports', 'drama'], language: 'tamil', release_year: 2024, rating: 5.8, description: 'A story of cricket and communal harmony.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Mission: Chapter 1', genre: 'Action, Thriller', genres: ['action', 'thriller'], language: 'tamil', release_year: 2024, rating: 6.4, description: 'A father stuck in a foreign prison must escape to save his daughter.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Singapore Saloon', genre: 'Comedy, Drama', genres: ['comedy', 'drama'], language: 'tamil', release_year: 2024, rating: 6.6, description: 'A young man strives to open his dream barber shop.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Captain Miller', genre: 'Action, Period', genres: ['action', 'period'], language: 'tamil', release_year: 2024, rating: 7.0, description: 'A former British soldier leads a rebellion.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Manjummel Boys (Tamil)', genre: 'Survival, Thriller', genres: ['survival', 'thriller'], language: 'tamil', release_year: 2024, rating: 8.6, description: 'A group of friends try to rescue their friend from a deep pit.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Kottukkaali', genre: 'Drama', genres: ['drama'], language: 'tamil', release_year: 2024, rating: 8.1, description: 'A journey of a family to cast out a spell on a young woman.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Jama', genre: 'Drama, Folk', genres: ['drama'], language: 'tamil', release_year: 2024, rating: 7.5, description: 'A story about the traditional Terukkuttu performers.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Andhagan', genre: 'Thriller, Crime', genres: ['thriller', 'crime'], language: 'tamil', release_year: 2024, rating: 6.9, description: 'A blind pianist gets embroiled in a murder.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Double Tuckerr', genre: 'Fantasy, Comedy', genres: ['fantasy', 'comedy'], language: 'tamil', release_year: 2024, rating: 6.2, description: 'A man meets two angels who control his fate.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Rebel', genre: 'Political, Drama', genres: ['political', 'drama'], language: 'tamil', release_year: 2024, rating: 6.5, description: 'A student fights for the rights of Tamil speakers in Kerala.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Kalvan', genre: 'Adventure, Comedy', genres: ['adventure', 'comedy'], language: 'tamil', release_year: 2024, rating: 6.3, description: 'Friends enter a forest to capture an elephant for money.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'PT Sir', genre: 'Comedy, Drama', genres: ['comedy', 'drama'], language: 'tamil', release_year: 2024, rating: 6.8, description: 'A PT teacher takes a stand against injustice in school.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Aranmanai 4', genre: 'Horror, Comedy', genres: ['horror', 'comedy'], language: 'tamil', release_year: 2024, rating: 6.1, description: 'A man investigates his sister’s mysterious death in a haunted palace.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Rathnam', genre: 'Action, Drama', genres: ['action', 'drama'], language: 'tamil', release_year: 2024, rating: 5.9, description: 'A man protects a girl from a powerful gang.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Romeo', genre: 'Romance, Comedy', genres: ['romance', 'comedy'], language: 'tamil', release_year: 2024, rating: 6.7, description: 'A husband tries to win his wife’s heart after an arranged marriage.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Hitler', genre: 'Action, Thriller', genres: ['action', 'thriller'], language: 'tamil', release_year: 2024, rating: 6.4, description: 'A common man takes on a corrupt politician.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Black', genre: 'Sci-Fi, Thriller', genres: ['sci-fi', 'thriller'], language: 'tamil', release_year: 2024, rating: 7.3, description: 'A couple experiences strange phenomena during a vacation.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Bloody Beggar', genre: 'Dark Comedy', genres: ['comedy', 'drama'], language: 'tamil', release_year: 2024, rating: 6.6, description: 'A beggar gets trapped in a bizarre situation inside a mansion.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Emakku Thozhan Kizhangu', genre: 'Drama', genres: ['drama'], language: 'tamil', release_year: 2024, rating: 7.1, description: 'A story about survival in a remote village.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Vazhai', genre: 'Drama', genres: ['drama'], language: 'tamil', release_year: 2024, rating: 8.4, description: 'A touching story of a young boy working in banana fields.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Nandhan', genre: 'Social Drama', genres: ['drama'], language: 'tamil', release_year: 2024, rating: 7.6, description: 'A man from an oppressed community rises to leadership.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Vaazhai', genre: 'Drama', genres: ['drama'], language: 'tamil', release_year: 2024, rating: 8.4, description: 'An emotional journey through the lens of a schoolboy.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Kozhi Pannai Chelladurai', genre: 'Drama', genres: ['drama'], language: 'tamil', release_year: 2024, rating: 7.2, description: 'The struggles of a man working in a poultry farm.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Petta Rap', genre: 'Musical, Action', genres: ['musical', 'action'], language: 'tamil', release_year: 2024, rating: 5.7, description: 'A young man tries to become a cinema hero.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Pogumidamellaam Nicotine', genre: 'Drama', genres: ['drama'], language: 'tamil', release_year: 2024, rating: 6.9, description: 'The life of workers in a tobacco factory.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Boat', genre: 'Historical, Drama', genres: ['history', 'drama'], language: 'tamil', release_year: 2024, rating: 6.8, description: 'Ten people trapped on a boat during a bombing raid.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Raghu Thatha', genre: 'Comedy, Social', genres: ['comedy', 'drama'], language: 'tamil', release_year: 2024, rating: 6.5, description: 'A woman fights against Hindi imposition in her village.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Minmini', genre: 'Coming-of-age', genres: ['drama'], language: 'tamil', release_year: 2024, rating: 7.3, description: 'Two survivors of a tragic accident embark on a journey.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Mazhai Pidikatha Manithan', genre: 'Action, Thriller', genres: ['action', 'thriller'], language: 'tamil', release_year: 2024, rating: 5.5, description: 'An undercover agent goes into hiding in the Andaman islands.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Teenz', genre: 'Adventure, Sci-Fi', genres: ['adventure', 'sci-fi'], language: 'tamil', release_year: 2024, rating: 6.2, description: 'A group of kids discover an extraterrestrial secret.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Thandatti', genre: 'Comedy, Drama', genres: ['comedy', 'drama'], language: 'tamil', release_year: 2023, rating: 7.4, description: 'A policeman searches for a missing grandmother and her gold earring.', source: '🔵 Amazon Prime', type: 'movie' }
  ];

  const tamilActionMovies = [
    { title: 'Jailer 2', genre: 'Action, Crime', genres: ['action', 'crime'], language: 'tamil', release_year: 2026, rating: 8.8, description: 'Muthuvel Pandian returns to dismantle an international smuggling ring.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Jana Nayagan', genre: 'Action, Thriller', genres: ['action', 'thriller', 'drama'], language: 'tamil', release_year: 2026, rating: 8.5, description: 'A common man’s uprising against a corrupt political dynasty.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Thug Life', genre: 'Action, Gangster', genres: ['action', 'crime'], language: 'tamil', release_year: 2025, rating: 8.9, description: 'A multi-generational gangster saga starring Kamal Haasan and Silambarasan.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Coolie', genre: 'Action, Thriller', genres: ['action', 'drama'], language: 'tamil', release_year: 2025, rating: 8.7, description: 'A gold-smuggling thriller set against a dockyard backdrop.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Good Bad Ugly', genre: 'Action, Comedy', genres: ['action', 'comedy'], language: 'tamil', release_year: 2025, rating: 8.4, description: 'Ajith Kumar plays a triple role in this high-octane heist flick.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Vidaamuyarchi', genre: 'Action, Mystery', genres: ['action', 'mystery'], language: 'tamil', release_year: 2025, rating: 8.2, description: 'A man searches for his missing wife in a foreign land while being hunted.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Indian 3', genre: 'Action, Vigilante', genres: ['action', 'drama'], language: 'tamil', release_year: 2026, rating: 8.6, description: 'Senapathy returns to finish the war against corruption once and for all.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Viduthalai Part 2', genre: 'Action, Period Drama', genres: ['action', 'drama'], language: 'tamil', release_year: 2025, rating: 9.1, description: 'The brutal conclusion to the battle between the police and the Vaathiyar.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Dragon', genre: 'Action, Sci-Fi', genres: ['action', 'sci-fi'], language: 'tamil', release_year: 2026, rating: 8.3, description: 'Pradeep Ranganathan stars in this futuristic high-tech action comedy.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Vishwambhara', genre: 'Action, Fantasy', genres: ['action', 'fantasy'], language: 'tamil', release_year: 2025, rating: 8.5, description: 'A divine warrior descends to protect the earth from an ancient evil.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Toxic', genre: 'Action, Crime', genres: ['action', 'crime'], language: 'tamil', release_year: 2026, rating: 8.7, description: 'A fairy tale for grown-ups set in the world of the drug mafia.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Kaithi 2', genre: 'Action, Thriller', genres: ['action', 'thriller'], language: 'tamil', release_year: 2026, rating: 9.2, description: 'Dilli returns to protect his daughter from the surviving drug lords.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Vikram 2', genre: 'Action, Spy', genres: ['action', 'spy'], language: 'tamil', release_year: 2026, rating: 9.3, description: 'Agent Vikram hunts down Rolex in a global manhunt.', source: '🟣 Disney+ Hotstar', type: 'movie' },
    { title: 'Thalapathy 69', genre: 'Action, Drama', genres: ['action', 'drama'], language: 'tamil', release_year: 2025, rating: 9.0, description: 'The final cinematic outing of the legendary star Vijay.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Leo 2: Parthiban', genre: 'Action, Crime', genres: ['action', 'crime'], language: 'tamil', release_year: 2026, rating: 8.9, description: 'The past of the chocolate maker comes back to haunt his peaceful life.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Sardar 2', genre: 'Action, Spy', genres: ['action', 'spy'], language: 'tamil', release_year: 2025, rating: 8.4, description: 'Karthi reprises his role as the master spy on a national mission.', source: '🟡 ZEE5', type: 'movie' },
    { title: 'Kanguva Part 2', genre: 'Action, Fantasy', genres: ['action', 'fantasy'], language: 'tamil', release_year: 2026, rating: 8.6, description: 'The epic clash between two eras continues with Suriya at the helm.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Love Insurance Corporation', genre: 'Action, Rom-Com', genres: ['action', 'romance'], language: 'tamil', release_year: 2025, rating: 7.9, description: 'A romantic comedy with high-stakes action sequences.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Veeran 2', genre: 'Action, Superhero', genres: ['action', 'sci-fi'], language: 'tamil', release_year: 2026, rating: 8.1, description: 'The lightning-powered hero returns to face a corporate villain.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Vaadi Vaasal', genre: 'Action, Sports', genres: ['action', 'drama'], language: 'tamil', release_year: 2026, rating: 9.0, description: 'A raw and gritty look at the ancient sport of Jallikattu.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Kubera', genre: 'Action, Mystery', genres: ['action', 'mystery'], language: 'tamil', release_year: 2025, rating: 8.3, description: 'Dhanush stars in this multi-starrer set in the underbelly of Mumbai.', source: '🔴 Netflix', type: 'movie' },
    { title: 'The Greatest of All Time 2', genre: 'Action, Sci-Fi', genres: ['action', 'sci-fi'], language: 'tamil', release_year: 2026, rating: 8.8, description: 'The clones return for a final showdown in this high-tech thriller.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Vada Chennai 2', genre: 'Action, Gangster', genres: ['action', 'crime'], language: 'tamil', release_year: 2026, rating: 9.5, description: 'Anbu’s rise to power in the politics of North Chennai.', source: '🟣 Disney+ Hotstar', type: 'movie' },
    { title: 'Garudan 2', genre: 'Action, Drama', genres: ['action', 'drama'], language: 'tamil', release_year: 2026, rating: 8.4, description: 'The loyalist returns to settle scores in a rural power struggle.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Aruvaa', genre: 'Action, Family', genres: ['action', 'drama'], language: 'tamil', release_year: 2025, rating: 8.0, description: 'A rural action drama centered on brotherly bonds and revenge.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Project K - Part 2', genre: 'Action, Sci-Fi', genres: ['action', 'sci-fi'], language: 'tamil', release_year: 2026, rating: 8.9, description: 'The war between gods and men reaches its peak in a dystopian future.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Irumbu Kai Maayavi', genre: 'Action, Superhero', genres: ['action', 'fantasy'], language: 'tamil', release_year: 2026, rating: 8.7, description: 'Suriya stars as a hero with a mechanical arm in this Lokesh Kanagaraj film.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Maaveeran 2', genre: 'Action, Fantasy', genres: ['action', 'comedy'], language: 'tamil', release_year: 2026, rating: 8.5, description: 'The cartoonist gets a new set of powers to fight social injustice.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Ponniyin Selvan: The Rise', genre: 'Action, History', genres: ['action', 'history'], language: 'tamil', release_year: 2026, rating: 8.8, description: 'A prequel focusing on the early life of Aditya Karikalan.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Pathu Thala 2', genre: 'Action, Crime', genres: ['action', 'crime'], language: 'tamil', release_year: 2026, rating: 8.2, description: 'AGR expands his empire while dealing with new undercover agents.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Mahaan 2', genre: 'Action, Thriller', genres: ['action', 'drama'], language: 'tamil', release_year: 2026, rating: 8.5, description: 'The father-son duo returns for a darker game of ideologies.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Master 2', genre: 'Action, Drama', genres: ['action', 'drama'], language: 'tamil', release_year: 2026, rating: 8.9, description: 'JD returns to reform a different juvenile school with iron fists.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Captain Miller: Chapter 2', genre: 'Action, Period', genres: ['action', 'war'], language: 'tamil', release_year: 2026, rating: 8.6, description: 'The renegade soldier takes his revolution to the next level.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Doctor 2', genre: 'Action, Comedy', genres: ['action', 'comedy'], language: 'tamil', release_year: 2025, rating: 8.3, description: 'The stoic doctor takes on a new kidnapping ring with his quirky team.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Sarpatta 2', genre: 'Action, Sports', genres: ['action', 'drama'], language: 'tamil', release_year: 2025, rating: 9.1, description: 'Kabilan faces off against a new generation of boxers in the 80s.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Mark Antony 2', genre: 'Action, Sci-Fi', genres: ['action', 'comedy'], language: 'tamil', release_year: 2026, rating: 8.0, description: 'The time-traveling telephone causes more chaos in the 90s.', source: '🟡 ZEE5', type: 'movie' },
    { title: 'Jigarthanda DoubleX 2', genre: 'Action, Western', genres: ['action', 'drama'], language: 'tamil', release_year: 2026, rating: 8.7, description: 'A new filmmaker enters the wild west of Madurai with a camera and a gun.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Petta 2', genre: 'Action, Masala', genres: ['action', 'drama'], language: 'tamil', release_year: 2026, rating: 8.6, description: 'Kaali returns to his old turf to clean up the mess left behind.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Soorarai Pottru 2', genre: 'Action, Drama', genres: ['action', 'biography'], language: 'tamil', release_year: 2026, rating: 8.9, description: 'Nedumaaran faces global aviation giants in his next big dream.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Dada 2', genre: 'Action, Drama', genres: ['action', 'drama'], language: 'tamil', release_year: 2025, rating: 8.2, description: 'The emotional story of a father who must protect his son from a past debt.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Leo: The Beginning', genre: 'Action, Prequel', genres: ['action', 'crime'], language: 'tamil', release_year: 2026, rating: 8.7, description: 'The origin story of Leo Das and his brothers in the Telangana mafia.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Karnan 2', genre: 'Action, Social Drama', genres: ['action', 'drama'], language: 'tamil', release_year: 2026, rating: 9.0, description: 'The protector of the village returns as a leader for his people.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Veerappa', genre: 'Action, Historical', genres: ['action', 'history'], language: 'tamil', release_year: 2026, rating: 8.4, description: 'The legendary tale of a forest dweller fighting for tribal rights.', source: '🔴 Netflix', type: 'movie' },
    { title: 'The Blood Hunt', genre: 'Action, Horror', genres: ['action', 'horror'], language: 'tamil', release_year: 2025, rating: 8.1, description: 'A vampire hunter stalks the streets of Chennai at night.', source: '🟣 Disney+ Hotstar', type: 'movie' },
    { title: 'Shadow Walker', genre: 'Action, Spy', genres: ['action', 'thriller'], language: 'tamil', release_year: 2026, rating: 8.3, description: 'An anonymous agent infiltrates a terrorist cell in the Himalayas.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Iron Heart', genre: 'Action, Sci-Fi', genres: ['action', 'sci-fi'], language: 'tamil', release_year: 2026, rating: 8.5, description: 'A soldier with a robotic heart seeks revenge for his fallen unit.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Madurai Kings', genre: 'Action, Gangster', genres: ['action', 'crime'], language: 'tamil', release_year: 2025, rating: 8.2, description: 'Two rival gangs fight for control over the city’s temple festivals.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Code Red', genre: 'Action, Survival', genres: ['action', 'thriller'], language: 'tamil', release_year: 2026, rating: 8.4, description: 'A group of commandos must escape a high-security lab overrun by a virus.', source: '🔴 Netflix', type: 'movie' },
    { title: 'The Last Stand', genre: 'Action, War', genres: ['action', 'drama'], language: 'tamil', release_year: 2026, rating: 8.8, description: 'A localized war story about a small village defending its borders.', source: '🟣 Disney+ Hotstar', type: 'movie' },
    { title: 'Falcon', genre: 'Action, Aviator', genres: ['action', 'thriller'], language: 'tamil', release_year: 2025, rating: 8.0, description: 'A top-gun pilot goes rogue to stop a nuclear launch.', source: '🔵 Amazon Prime', type: 'movie' }
  ];

  const tamilComedyMovies = [
    { title: 'Devil\'s Double Next Level', genre: 'Horror, Comedy', genres: ['comedy', 'horror'], language: 'tamil', release_year: 2025, rating: 7.8, description: 'Santhanam returns in the 4th installment of the Dhilluku Dhuddu franchise set on a cruise.', source: '🟡 ZEE5', type: 'movie' },
    { title: 'Love Insurance Kompany', genre: 'Rom-Com, Sci-Fi', genres: ['comedy', 'romance', 'sci-fi'], language: 'tamil', release_year: 2025, rating: 8.4, description: 'A man travels to the future to check his relationship status before committing.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Madha Gaja Raja', genre: 'Action, Comedy', genres: ['action', 'comedy'], language: 'tamil', release_year: 2025, rating: 7.5, description: 'A long-delayed cult classic featuring Vishal and Santhanam finally hits screens.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Mookuthi Amman 2', genre: 'Fantasy, Comedy', genres: ['comedy', 'fantasy'], language: 'tamil', release_year: 2026, rating: 8.6, description: 'Nayanthara returns as the goddess to tackle a new era of digital godmen.', source: '🟣 Disney+ Hotstar', type: 'movie' },
    { title: 'Jolly O Gymkhana', genre: 'Black Comedy', genres: ['comedy', 'crime'], language: 'tamil', release_year: 2025, rating: 7.2, description: 'Prabhu Deva and a group of women deal with a dead body in a hilarious way.', source: '🟠 Aha Tamil', type: 'movie' },
    { title: 'SK25: Return of the Don', genre: 'Campus Comedy', genres: ['comedy', 'drama'], language: 'tamil', release_year: 2026, rating: 8.8, description: 'Sivakarthikeyan and Cibi Chakravarthi reunite for a spiritual successor to Don.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Medical Miracle', genre: 'Political, Comedy', genres: ['comedy', 'satire'], language: 'tamil', release_year: 2026, rating: 8.1, description: 'Yogi Babu plays a common man caught in a bizarre medical and political scam.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Desinguraja 2', genre: 'Rural Comedy', genres: ['comedy'], language: 'tamil', release_year: 2025, rating: 7.4, description: 'Vimal returns in this sequel to the 2013 hit rural entertainer.', source: '🟡 ZEE5', type: 'movie' },
    { title: 'Sumo', genre: 'Drama, Comedy', genres: ['comedy', 'drama'], language: 'tamil', release_year: 2025, rating: 7.9, description: 'Shiva befriends a Japanese Sumo wrestler in Chennai; chaos ensues.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Revolver Rita', genre: 'Crime, Comedy', genres: ['comedy', 'action'], language: 'tamil', release_year: 2025, rating: 8.2, description: 'Keerthy Suresh stars as a quirky, accidental vigilante in this dark comedy.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Bro Code', genre: 'Buddy Comedy', genres: ['comedy'], language: 'tamil', release_year: 2026, rating: 8.0, description: 'SJ Suryah and Arjun Ashokan star in a chaotic tale of friendship and lies.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Good Bad Ugly', genre: 'Action, Comedy', genres: ['comedy', 'action'], language: 'tamil', release_year: 2025, rating: 8.7, description: 'Ajith Kumar in a fun, high-energy role reminiscent of his vintage comedy style.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Kuzhanthaigal Munnetra Kazhagam', genre: 'Political Comedy', genres: ['comedy', 'satire'], language: 'tamil', release_year: 2025, rating: 8.3, description: 'Yogi Babu leads a hilarious movement for "Children\'s Rights" in politics.', source: '🟡 ZEE5', type: 'movie' },
    { title: 'Vaa Vaathiyaar', genre: 'Black Comedy', genres: ['comedy', 'action'], language: 'tamil', release_year: 2026, rating: 8.5, description: 'Karthi plays an eccentric cop who is an ardent fan of MGR.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Doctor 2', genre: 'Dark Comedy', genres: ['comedy', 'crime'], language: 'tamil', release_year: 2026, rating: 8.9, description: 'Nelson and Sivakarthikeyan bring back the poker-faced Varun for a new mission.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Once More', genre: 'Rom-Com', genres: ['comedy', 'romance'], language: 'tamil', release_year: 2026, rating: 8.1, description: 'Arjun Das and Aditi Shankar in a witty, dialogue-heavy romantic entertainer.', source: '🟣 Disney+ Hotstar', type: 'movie' },
    { title: 'Poochandi', genre: 'Horror Comedy', genres: ['comedy', 'horror'], language: 'tamil', release_year: 2026, rating: 7.7, description: 'A spoof on various horror movie tropes starring Yogi Babu.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Gangers', genre: 'Thriller Comedy', genres: ['comedy', 'thriller'], language: 'tamil', release_year: 2025, rating: 7.6, description: 'Sundar C and Vadivelu team up for a hilarious hunt for a missing treasure.', source: '🟣 Disney+ Hotstar', type: 'movie' },
    { title: 'Paranthu Po', genre: 'Musical Comedy', genres: ['comedy', 'musical'], language: 'tamil', release_year: 2025, rating: 7.8, description: 'Shiva stars in a road-trip comedy filled with musical misadventures.', source: '🟠 Aha Tamil', type: 'movie' },
    { title: 'Chennai City Gangsters', genre: 'Slapstick Comedy', genres: ['comedy'], language: 'tamil', release_year: 2025, rating: 7.3, description: 'Vaibhav and a gang of misfits try to rob a local politician.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Moonwalk', genre: 'Fantasy Comedy', genres: ['comedy', 'fantasy'], language: 'tamil', release_year: 2026, rating: 8.2, description: 'Prabhu Deva discovers a pair of shoes that make him dance through time.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Baby and Baby', genre: 'Romantic Comedy', genres: ['comedy', 'romance'], language: 'tamil', release_year: 2025, rating: 7.5, description: 'Jai and Yogi Babu get into a series of misunderstandings over a newborn.', source: '🟡 ZEE5', type: 'movie' },
    { title: 'Thaai Kizhavi', genre: 'Family Comedy', genres: ['comedy', 'drama'], language: 'tamil', release_year: 2026, rating: 8.0, description: 'Radikaa Sarathkumar stars as a fiery grandmother who takes over a tech startup.', source: '🟣 Disney+ Hotstar', type: 'movie' },
    { title: 'Sotta Sotta Nanaiyuthu', genre: 'Rom-Com', genres: ['comedy', 'romance'], language: 'tamil', release_year: 2025, rating: 7.1, description: 'A classic "rainy day" romance with a heavy dose of KPY comedy.', source: '🟠 Aha Tamil', type: 'movie' },
    { title: 'Hotspot 2 Much', genre: 'Modern Comedy', genres: ['comedy', 'drama'], language: 'tamil', release_year: 2026, rating: 7.9, description: 'The sequel to Hotspot exploring social media obsession through humor.', source: '🔴 Netflix', type: 'movie' },
    { title: 'My Dear Dolly', genre: 'Drama Comedy', genres: ['comedy'], language: 'tamil', release_year: 2026, rating: 7.4, description: 'An elderly man treats a mannequin as his daughter, leading to funny situations.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Uruttu Uruttu', genre: 'Fun Thriller', genres: ['comedy', 'thriller'], language: 'tamil', release_year: 2025, rating: 7.0, description: 'A group of friends try to bluff their way out of a gang war.', source: '🟡 ZEE5', type: 'movie' },
    { title: 'Kambi Katna Kathai', genre: 'Crime Comedy', genres: ['comedy', 'crime'], language: 'tamil', release_year: 2025, rating: 7.3, description: 'A heist movie where everything that can go wrong, goes wrong.', source: '🟣 Disney+ Hotstar', type: 'movie' },
    { title: 'Otha Votu Muthaiya', genre: 'Satire', genres: ['comedy', 'politics'], language: 'tamil', release_year: 2025, rating: 8.5, description: 'Goundamani returns to the screen as a cynical voter in a chaotic election.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Bun Butter Jam', genre: 'Rom-Com', genres: ['comedy', 'romance'], language: 'tamil', release_year: 2025, rating: 7.6, description: 'A lighthearted look at modern dating in the cafes of Chennai.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Aan Paavam Pollathathu', genre: 'Family Comedy', genres: ['comedy'], language: 'tamil', release_year: 2025, rating: 7.8, description: 'Rio Raj stars in this remake/homage to the classic 80s comedy style.', source: '🟡 ZEE5', type: 'movie' },
    { title: 'Sweety Naughty Crazy', genre: 'Rom-Com', genres: ['comedy', 'romance'], language: 'tamil', release_year: 2026, rating: 7.2, description: 'A love triangle involving a sweet girl, a naughty guy, and a crazy ex.', source: '🟠 Aha Tamil', type: 'movie' },
    { title: 'Madras Matinee', genre: 'Period Comedy', genres: ['comedy', 'drama'], language: 'tamil', release_year: 2025, rating: 8.1, description: 'A nostalgic look at the 90s cinema culture in Chennai.', source: '🟣 Disney+ Hotstar', type: 'movie' },
    { title: 'Jinn: The Pet', genre: 'Fantasy Comedy', genres: ['comedy', 'fantasy'], language: 'tamil', release_year: 2025, rating: 7.5, description: 'Mugen Rao finds a lazy Jinn who refuses to grant any useful wishes.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Kumaara Sambavam', genre: 'Social Comedy', genres: ['comedy', 'drama'], language: 'tamil', release_year: 2025, rating: 7.9, description: 'A village man tries to prove his lineage using DNA and comedy.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Gandhi Kannadi', genre: 'Satire', genres: ['comedy'], language: 'tamil', release_year: 2025, rating: 7.7, description: 'A man finds a pair of glasses that only shows him the "truth".', source: '🟠 Aha Tamil', type: 'movie' },
    { title: 'Yolo', genre: 'Youth Comedy', genres: ['comedy'], language: 'tamil', release_year: 2025, rating: 7.4, description: 'A group of college dropouts start a "doing nothing" business.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Mask', genre: 'Heist Comedy', genres: ['comedy', 'action'], language: 'tamil', release_year: 2026, rating: 8.3, description: 'Kavin and Andrea in a fast-paced thriller-comedy about a missing bag.', source: '🟡 ZEE5', type: 'movie' },
    { title: 'Thalaivar Thambi Thalaimaiyil', genre: 'Political Comedy', genres: ['comedy', 'satire'], language: 'tamil', release_year: 2026, rating: 8.0, description: 'Jiiva plays a reluctant local leader trying to avoid responsibilities.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Lucky: The Super Star', genre: 'Family Comedy', genres: ['comedy', 'animal'], language: 'tamil', release_year: 2026, rating: 8.2, description: 'A mischievous puppy "Lucky" becomes a political pawn in a city election.', source: '🟣 Disney+ Hotstar', type: 'movie' },
    { title: 'Saloon', genre: 'Slice of Life', genres: ['comedy', 'drama'], language: 'tamil', release_year: 2026, rating: 8.4, description: 'Yogi Babu as a barber who hears the funniest secrets of the town.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Vadam', genre: 'Experimental Comedy', genres: ['comedy'], language: 'tamil', release_year: 2026, rating: 7.8, description: 'A single-shot comedy movie about a tug-of-war competition.', source: '🟠 Aha Tamil', type: 'movie' },
    { title: 'Porukkies', genre: 'Buddy Comedy', genres: ['comedy'], language: 'tamil', release_year: 2026, rating: 7.5, description: 'A hilarious take on the lives of three loafers in a small town.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Adraa Raja Adidaa', genre: 'Slapstick', genres: ['comedy'], language: 'tamil', release_year: 2026, rating: 7.1, description: 'An old-school slapstick comedy featuring various KPY stars.', source: '🟡 ZEE5', type: 'movie' },
    { title: 'Ilamai Enum Poongatru', genre: 'Retro Comedy', genres: ['comedy', 'romance'], language: 'tamil', release_year: 2026, rating: 7.9, description: 'A romantic comedy set in the early 80s Madras.', source: '🟣 Disney+ Hotstar', type: 'movie' },
    { title: 'Heartin', genre: 'Rom-Com', genres: ['comedy', 'romance'], language: 'tamil', release_year: 2025, rating: 8.1, description: 'Sananth and Madonna in a heart-warming comedy about mismatched hearts.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Lion', genre: 'Commercial Comedy', genres: ['comedy', 'action'], language: 'tamil', release_year: 2026, rating: 8.5, description: 'Yogi Babu enters the Bollywood circle in this high-budget Atlee production.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Sabash Naidu', genre: 'Spy Comedy', genres: ['comedy', 'action'], language: 'tamil', release_year: 2026, rating: 8.8, description: 'Kamal Haasan brings back Balram Naidu for a global investigation.', source: '🟣 Disney+ Hotstar', type: 'movie' },
    { title: 'Michael Musasi', genre: 'Action Comedy', genres: ['comedy', 'action'], language: 'tamil', release_year: 2025, rating: 7.6, description: 'Prabhu Deva and Master Mahendran in a quirky martial arts comedy.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: '3 BHK', genre: 'Urban Comedy', genres: ['comedy', 'drama'], language: 'tamil', release_year: 2025, rating: 8.0, description: 'The struggles of finding a flat in Chennai turned into a laugh riot.', source: '🔴 Netflix', type: 'movie' }
  ];

  const tamilCrimeMovies = [
    { title: 'Thadayam', genre: 'Crime, Mystery', genres: ['crime', 'mystery'], language: 'tamil', release_year: 2026, rating: 8.6, description: 'SI Adhiyaman hunts a ritualistic serial killer along the TN-Andhra border.', source: '🟡 ZEE5', type: 'movie' },
    { title: 'Sardar 2', genre: 'Crime, Spy', genres: ['crime', 'action', 'spy'], language: 'tamil', release_year: 2026, rating: 8.8, description: 'An exiled spy returns to dismantle a global data-trafficking syndicate.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Viduthalai: Part 2', genre: 'Crime, Period Drama', genres: ['crime', 'drama', 'action'], language: 'tamil', release_year: 2025, rating: 9.3, description: 'The brutal conclusion of the hunt for Vaathiyar and the systemic corruption within the force.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Aaryan', genre: 'Crime, Thriller', genres: ['crime', 'thriller'], language: 'tamil', release_year: 2025, rating: 8.1, description: 'A cop investigates a series of murders that mirror a popular web series plot.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Criminal', genre: 'Crime, Mystery', genres: ['crime', 'mystery'], language: 'tamil', release_year: 2026, rating: 8.4, description: 'A high-stakes investigative thriller starring Gautham Karthik and Sarathkumar.', source: '🟣 Disney+ Hotstar', type: 'movie' },
    { title: 'Toxic', genre: 'Crime, Action', genres: ['crime', 'action'], language: 'tamil', release_year: 2026, rating: 8.9, description: 'A fairy tale for grown-ups set within the dark world of the drug mafia.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Kaalidas 2', genre: 'Crime, Thriller', genres: ['crime', 'thriller'], language: 'tamil', release_year: 2026, rating: 8.2, description: 'Officer Kaalidas returns to solve a baffling case of falling bodies in the city.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Vaa Vaathiyaar', genre: 'Crime, Dark Comedy', genres: ['crime', 'comedy'], language: 'tamil', release_year: 2026, rating: 8.5, description: 'An eccentric policeman and fan of MGR gets caught in a bizarre smuggling web.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Kuttram Purindhavan', genre: 'Crime, Drama', genres: ['crime', 'drama'], language: 'tamil', release_year: 2025, rating: 8.0, description: 'A small-town crime drama unraveling moral complexities when a girl goes missing.', source: '🟣 Sony LIV', type: 'movie' },
    { title: 'Vengeance', genre: 'Crime, Drama', genres: ['crime', 'drama'], language: 'tamil', release_year: 2026, rating: 7.9, description: 'A gritty tale of revenge and judicial failure in rural Tamil Nadu.', source: '🟠 Aha Tamil', type: 'movie' },
    { title: 'Evidence', genre: 'Crime, Mystery', genres: ['crime', 'mystery'], language: 'tamil', release_year: 2026, rating: 8.3, description: 'A forensic expert finds a clue that links a cold case to a sitting minister.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Thani Oruvan 2', genre: 'Crime, Action', genres: ['crime', 'action'], language: 'tamil', release_year: 2026, rating: 9.1, description: 'Mithran IPS faces off against a new intellectual mastermind who operates from the shadows.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Secret Stories: Roslin', genre: 'Psychological Crime', genres: ['crime', 'thriller'], language: 'tamil', release_year: 2026, rating: 8.2, description: 'A teenager’s recurring visions lead her to a guest who may be a serial killer.', source: '🟣 JioHotstar', type: 'movie' },
    { title: 'Accused', genre: 'Legal Crime', genres: ['crime', 'drama'], language: 'tamil', release_year: 2026, rating: 8.4, description: 'A renowned doctor fights for her life and reputation after a public accusation.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Valli Mayil', genre: 'Crime, Thriller', genres: ['crime', 'thriller'], language: 'tamil', release_year: 2026, rating: 7.8, description: 'A woman trapped in a dangerous criminal network tries to manipulate her way out.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Sorgavaasal', genre: 'Crime, Action', genres: ['crime', 'action'], language: 'tamil', release_year: 2025, rating: 8.5, description: 'A prison-break thriller that exposes the nexus between inmates and politicians.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Borrder', genre: 'Crime, Spy', genres: ['crime', 'spy'], language: 'tamil', release_year: 2025, rating: 7.6, description: 'Counter-terrorism agents race against time to stop an internal threat.', source: '🟣 Disney+ Hotstar', type: 'movie' },
    { title: 'Train', genre: 'Crime, Drama', genres: ['crime', 'drama'], language: 'tamil', release_year: 2026, rating: 8.7, description: 'A non-linear crime story centered around a single train journey from Chennai.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Bison Kaalamaadan', genre: 'Crime, Period', genres: ['crime', 'drama'], language: 'tamil', release_year: 2025, rating: 8.9, description: 'A raw, gritty crime drama set in the sports-politics of rural Madurai.', source: '🔴 Netflix', type: 'movie' },
    { title: 'IPL: Indian Penal Law', genre: 'Crime, Thriller', genres: ['crime', 'thriller'], language: 'tamil', release_year: 2025, rating: 7.5, description: 'A digital crime expert uncovers a massive hacking ring in Chennai.', source: '🟡 ZEE5', type: 'movie' },
    { title: 'Arivaan', genre: 'Crime, Horror', genres: ['crime', 'horror'], language: 'tamil', release_year: 2026, rating: 7.7, description: 'A psychic helps the police track down a killer who targets the blind.', source: '🟠 Aha Tamil', type: 'movie' },
    { title: 'Ten Hours', genre: 'Crime, Thriller', genres: ['crime', 'thriller'], language: 'tamil', release_year: 2025, rating: 7.4, description: 'A race against time to save a hostage being held in a busy mall.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Seesaw', genre: 'Crime, Drama', genres: ['crime', 'drama'], language: 'tamil', release_year: 2025, rating: 7.2, description: 'Two brothers on opposite sides of the law play a dangerous game of cat and mouse.', source: '🟣 Disney+ Hotstar', type: 'movie' },
    { title: 'The Smile Man', genre: 'Crime, Mystery', genres: ['crime', 'mystery'], language: 'tamil', release_year: 2025, rating: 8.1, description: 'A retired cop with Alzheimers tries to solve his final case before he forgets.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Dha Dha', genre: 'Crime, Thriller', genres: ['crime', 'thriller'], language: 'tamil', release_year: 2026, rating: 7.6, description: 'The rise of a lady gangster in the outskirts of Coimbatore.', source: '🟡 ZEE5', type: 'movie' },
    { title: 'Madharas Mafia Company', genre: 'Crime, Gangster', genres: ['crime', 'action'], language: 'tamil', release_year: 2025, rating: 7.8, description: 'A documentary filmmaker accidentally captures a murder by the city\'s top mob.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Accused: The Second Pakkam', genre: 'Crime, Thriller', genres: ['crime', 'thriller'], language: 'tamil', release_year: 2026, rating: 7.9, description: 'The sequel to the 2025 hit focusing on the lead detective\'s dark past.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Kallapart', genre: 'Crime, Drama', genres: ['crime', 'drama'], language: 'tamil', release_year: 2026, rating: 8.0, description: 'A locksmith is forced into a heist that involves more than just money.', source: '🟣 Disney+ Hotstar', type: 'movie' },
    { title: 'Asthram', genre: 'Crime, Action', genres: ['crime', 'action'], language: 'tamil', release_year: 2025, rating: 7.3, description: 'An encounter specialist is framed for a murder he was sent to investigate.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Fire', genre: 'Crime, Mystery', genres: ['crime', 'mystery'], language: 'tamil', release_year: 2025, rating: 7.1, description: 'A forest officer discovers a series of arson cases that lead to a cult.', source: '🟡 ZEE5', type: 'movie' },
    { title: 'Katteri', genre: 'Crime, Horror', genres: ['crime', 'horror'], language: 'tamil', release_year: 2025, rating: 7.0, description: 'A group of criminals hiding in a village realize the locals are not human.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Code Blue', genre: 'Crime, Medical', genres: ['crime', 'medical'], language: 'tamil', release_year: 2026, rating: 8.2, description: 'Investigating the mysterious deaths of patients in a high-end hospital.', source: '🟣 Disney+ Hotstar', type: 'movie' },
    { title: 'Nirangal Moondru', genre: 'Crime, Thriller', genres: ['crime', 'thriller'], language: 'tamil', release_year: 2025, rating: 8.6, description: 'Three lives intertwine during a single night of crime in Chennai.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Once Upon A Time In Madras', genre: 'Crime, Action', genres: ['crime', 'action'], language: 'tamil', release_year: 2025, rating: 8.3, description: 'A retro crime drama about the birth of organized crime in the 80s.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Robber', genre: 'Crime, Heist', genres: ['crime', 'action'], language: 'tamil', release_year: 2025, rating: 7.4, description: 'A modern-day Robin Hood uses tech to rob from the corrupt elite.', source: '🟡 ZEE5', type: 'movie' },
    { title: 'Dawood', genre: 'Crime, Biography', genres: ['crime', 'biography'], language: 'tamil', release_year: 2026, rating: 8.5, description: 'An unauthorized exploration of an underworld kingpin’s influence in the South.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Leech', genre: 'Crime, Psychological', genres: ['crime', 'thriller'], language: 'tamil', release_year: 2025, rating: 7.7, description: 'A blackmailer finds himself being blackmailed by his own target.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'The Proof', genre: 'Crime, Action', genres: ['crime', 'action'], language: 'tamil', release_year: 2026, rating: 7.9, description: 'A woman fights through a mercenary army to deliver evidence to court.', source: '🟣 Disney+ Hotstar', type: 'movie' },
    { title: 'Narivettai', genre: 'Crime, Thriller', genres: ['crime', 'thriller'], language: 'tamil', release_year: 2025, rating: 8.4, description: 'A gritty manhunt for a serial killer in the dense forests of the Western Ghats.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Chennai Files', genre: 'Crime, Mystery', genres: ['crime', 'mystery'], language: 'tamil', release_year: 2025, rating: 8.0, description: 'A podcast host discovers a lead in a 20-year-old missing person case.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Accused 3', genre: 'Crime, Legal', genres: ['crime', 'drama'], language: 'tamil', release_year: 2026, rating: 8.1, description: 'The trilogy concludes with a focus on institutional corruption.', source: '🔴 Netflix', type: 'movie' },
    { title: 'MG24', genre: 'Crime, Suspense', genres: ['crime', 'suspense'], language: 'tamil', release_year: 2026, rating: 7.5, description: 'A group of friends gets trapped in a smart house that records their crimes.', source: '🟡 ZEE5', type: 'movie' },
    { title: 'Yogida', genre: 'Crime, Action', genres: ['crime', 'action'], language: 'tamil', release_year: 2026, rating: 7.8, description: 'A daughter takes up her father\'s mantle to finish a gang war.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Saaraa', genre: 'Crime, Thriller', genres: ['crime', 'thriller'], language: 'tamil', release_year: 2025, rating: 7.4, description: 'A deaf-mute girl witnesses a crime committed by a high-ranking official.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Kutram Thavir', genre: 'Crime, Drama', genres: ['crime', 'drama'], language: 'tamil', release_year: 2025, rating: 7.2, description: 'An honest lawyer is forced to defend the man who killed his brother.', source: '🟣 Disney+ Hotstar', type: 'movie' },
    { title: 'Thuchchaadhanan', genre: 'Crime, Thriller', genres: ['crime', 'thriller'], language: 'tamil', release_year: 2025, rating: 7.6, description: 'A modern retelling of a classic myth set in the underworld.', source: '🟡 ZEE5', type: 'movie' },
    { title: 'Edattam', genre: 'Crime, Action', genres: ['crime', 'action'], language: 'tamil', release_year: 2025, rating: 7.1, description: 'A street gambler gets pulled into a high-stakes gambling ring in Malaysia.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Hongkong Warriors', genre: 'Crime, Action', genres: ['crime', 'action'], language: 'tamil', release_year: 2025, rating: 8.3, description: 'Tamil immigrants in HK get caught between the Triads and the Police.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Kalan', genre: 'Crime, Thriller', genres: ['crime', 'thriller'], language: 'tamil', release_year: 2025, rating: 7.5, description: 'A local drug peddler tries to outsmart a special task force.', source: '🟣 Disney+ Hotstar', type: 'movie' },
    { title: 'Shadow Hunter', genre: 'Crime, Mystery', genres: ['crime', 'mystery'], language: 'tamil', release_year: 2026, rating: 8.0, description: 'An anonymous tipster leads a journalist to a massive land scam.', source: '🔵 Amazon Prime', type: 'movie' }
  ];

  const tamilDramaMovies = [
    { title: 'Parasakthi', genre: 'Social Drama, Period', genres: ['drama', 'history'], language: 'tamil', release_year: 2026, rating: 9.1, description: 'Sivakarthikeyan stars in a Sudha Kongara directorial set against the 1960s anti-Hindi protests.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Bison: Kaalamaadan', genre: 'Sports Drama', genres: ['drama', 'sport'], language: 'tamil', release_year: 2025, rating: 8.9, description: 'Mari Selvaraj explores the intersection of rural sports and caste politics starring Dhruv Vikram.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Thaai Kizhavi', genre: 'Family Drama', genres: ['drama', 'comedy'], language: 'tamil', release_year: 2026, rating: 8.5, description: 'Radikaa Sarathkumar plays a powerful rural matriarch fighting for her village\'s land rights.', source: '🟣 Disney+ Hotstar', type: 'movie' },
    { title: 'Yezhu Kadal Yezhu Malai', genre: 'Poetic Drama', genres: ['drama', 'fantasy'], language: 'tamil', release_year: 2026, rating: 9.0, description: 'An immortal man searches for his soulmate across centuries. Starring Nivin Pauly and Anjali.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Kudumbasthan', genre: 'Slice of Life', genres: ['drama', 'family'], language: 'tamil', release_year: 2025, rating: 8.2, description: 'Manikandan stars as a middle-class father navigating the hilarious yet stressful life of a debt-ridden man.', source: '🟠 Aha Tamil', type: 'movie' },
    { title: 'Vanangaan', genre: 'Raw Drama', genres: ['drama'], language: 'tamil', release_year: 2025, rating: 8.4, description: 'Director Bala’s gritty tale about an outcast’s struggle for dignity. Starring Arun Vijay.', source: '🟣 JioHotstar', type: 'movie' },
    { title: 'Thalaivan Thalaivii', genre: 'Political Drama', genres: ['drama', 'politics'], language: 'tamil', release_year: 2025, rating: 8.1, description: 'Vijay Sethupathi and Nithya Menen star in a story about the personal lives of two rising political rivals.', source: '🟡 ZEE5', type: 'movie' },
    { title: 'Kinaru', genre: 'Social Satire', genres: ['drama', 'satire'], language: 'tamil', release_year: 2025, rating: 7.9, description: 'A village’s life is upended when their only community well is claimed by a private corporation.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Siddharth 40', genre: 'Emotional Drama', genres: ['drama'], language: 'tamil', release_year: 2026, rating: 8.0, description: 'A poignant story about a teacher’s return to his hometown after two decades.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Veera Dheera Sooran', genre: 'Action Drama', genres: ['drama', 'action'], language: 'tamil', release_year: 2026, rating: 8.7, description: 'Chiyaan Vikram plays a common man forced into a high-stakes conflict to protect his family.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Angammal', genre: 'Social Drama', genres: ['drama'], language: 'tamil', release_year: 2025, rating: 7.8, description: 'The life of an elderly woman in a hill station who refuses to leave her ancestral home.', source: '🟣 Sony LIV', type: 'movie' },
    { title: 'Meendum Pudhiya Paadhai', genre: 'Auteur Drama', genres: ['drama'], language: 'tamil', release_year: 2026, rating: 8.3, description: 'Parthiban directs and stars in a spiritual successor to his classic, exploring modern loneliness.', source: '🟠 Aha Tamil', type: 'movie' },
    { title: 'Train', genre: 'Hyperlink Drama', genres: ['drama', 'thriller'], language: 'tamil', release_year: 2026, rating: 8.6, description: 'Mysskin directs this story where multiple lives converge on a train journey from Chennai to Cochin.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Idhayam Murali', genre: 'Romantic Drama', genres: ['drama', 'romance'], language: 'tamil', release_year: 2026, rating: 7.7, description: 'Atharvaa plays a musician struggling with fame and the memory of a lost love.', source: '🟣 Disney+ Hotstar', type: 'movie' },
    { title: '3 BHK', genre: 'Urban Drama', genres: ['drama', 'family'], language: 'tamil', release_year: 2025, rating: 7.5, description: 'A young couple’s dream of owning a home in Chennai turns into a nightmare of systemic corruption.', source: '🟡 ZEE5', type: 'movie' },
    { title: 'Karathey Babu', genre: 'Biographical Drama', genres: ['drama', 'action'], language: 'tamil', release_year: 2026, rating: 8.1, description: 'The life story of a forgotten local martial arts legend in North Chennai.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Jockey', genre: 'Rural Action Drama', genres: ['drama', 'action'], language: 'tamil', release_year: 2026, rating: 7.9, description: 'Centered around the underground world of goat-fighting in Madurai.', source: '🟣 JioHotstar', type: 'movie' },
    { title: 'An Ordinary Man', genre: 'Humanistic Drama', genres: ['drama'], language: 'tamil', release_year: 2026, rating: 8.4, description: 'Yogi Babu plays a common citizen who accidentally becomes the face of a national movement.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Retta Thala', genre: 'Dual Identity Drama', genres: ['drama', 'action'], language: 'tamil', release_year: 2025, rating: 8.0, description: 'Arun Vijay in a story about twin brothers separated by ideology but united by a family secret.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Bad Girl', genre: 'Coming-of-Age Drama', genres: ['drama'], language: 'tamil', release_year: 2025, rating: 8.2, description: 'A raw look at a young woman’s rebellion against societal expectations in a conservative town.', source: '🟣 Sony LIV', type: 'movie' },
    { title: 'Then Mavattam', genre: 'Rural Conflict Drama', genres: ['drama'], language: 'tamil', release_year: 2026, rating: 7.4, description: 'A gritty drama about irrigation rights and family feuds in Southern Tamil Nadu.', source: '🟡 ZEE5', type: 'movie' },
    { title: 'Kara', genre: 'Mystery Drama', genres: ['drama', 'mystery'], language: 'tamil', release_year: 2026, rating: 8.8, description: 'Dhanush and Mamitha Baiju in a story about a family secret hidden in the backwaters of Kerala.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Yellow', genre: 'Psychological Drama', genres: ['drama'], language: 'tamil', release_year: 2025, rating: 8.3, description: 'A man suffering from a rare color-blindness sees the world through a unique moral lens.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Arjunan Kadhali', genre: 'Classic Romance Drama', genres: ['drama', 'romance'], language: 'tamil', release_year: 2026, rating: 7.2, description: 'The long-delayed Jai-starrer explores the sacrifices made for love in a joint family.', source: '🟠 Aha Tamil', type: 'movie' },
    { title: 'Magudam', genre: 'Historical Drama', genres: ['drama', 'history'], language: 'tamil', release_year: 2026, rating: 8.5, description: 'Vishal directs and stars in this epic about a local chieftain during the British Raj.', source: '🟣 Disney+ Hotstar', type: 'movie' },
    { title: 'Mandaadi', genre: 'Tribal Drama', genres: ['drama'], language: 'tamil', release_year: 2026, rating: 8.9, description: 'Soori plays a forest guard protecting an ancient tribal ritual from modern developers.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Kottravai', genre: 'Mythological Drama', genres: ['drama', 'fantasy'], language: 'tamil', release_year: 2026, rating: 7.6, description: 'A search for a lost civilization leads a team to a remote village with strange customs.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Mustafa Mustafa', genre: 'Friendship Drama', genres: ['drama', 'comedy'], language: 'tamil', release_year: 2026, rating: 7.9, description: 'A heart-warming story of four friends reuniting for a wedding that changes their lives.', source: '🟡 ZEE5', type: 'movie' },
    { title: 'Justice for Jeni', genre: 'Legal Drama', genres: ['drama', 'thriller'], language: 'tamil', release_year: 2026, rating: 8.2, description: 'A lawyer fights a lost cause for a girl who was silenced by a powerful corporation.', source: '🟣 JioHotstar', type: 'movie' },
    { title: 'Veyilodu Vilayadu', genre: 'Sports Drama', genres: ['drama', 'sport'], language: 'tamil', release_year: 2026, rating: 7.1, description: 'Follows the lives of volleyball players in a coastal Tamil village.', source: '🟠 Aha Tamil', type: 'movie' },
    { title: 'Ilamai Idho Idho', genre: 'Nostalgic Drama', genres: ['drama', 'romance'], language: 'tamil', release_year: 2026, rating: 7.8, description: 'A look back at the college lives of a group of friends in the early 90s.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Karuppar Nagaram', genre: 'Urban Slum Drama', genres: ['drama'], language: 'tamil', release_year: 2025, rating: 8.1, description: 'Aishwarya Rajesh leads a community fight against forced eviction in Chennai.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Ace', genre: 'Life Drama', genres: ['drama'], language: 'tamil', release_year: 2026, rating: 8.4, description: 'Vijay Sethupathi stars as a man who learns the value of time through a series of accidents.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Shakthi Thirumagan', genre: 'Empowerment Drama', genres: ['drama'], language: 'tamil', release_year: 2025, rating: 7.3, description: 'Vijay Antony stars as a man dedicated to reforming his community after a tragic loss.', source: '🟡 ZEE5', type: 'movie' },
    { title: 'Anali', genre: 'Human Rights Drama', genres: ['drama'], language: 'tamil', release_year: 2026, rating: 7.5, description: 'Focuses on the struggles of the nomadic communities in the Nilgiris.', source: '🟣 Sony LIV', type: 'movie' },
    { title: 'Idimuzhakkam', genre: 'Action Drama', genres: ['drama', 'action'], language: 'tamil', release_year: 2026, rating: 8.0, description: 'G.V. Prakash in a Seenu Ramasamy directorial about a man caught in a web of deceit.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Lockdown', genre: 'Survival Drama', genres: ['drama'], language: 'tamil', release_year: 2025, rating: 7.0, description: 'Anupama Parameswaran stars in a story about the domestic challenges during a pandemic.', source: '🟣 JioHotstar', type: 'movie' },
    { title: 'Once More', genre: 'Relationship Drama', genres: ['drama', 'romance'], language: 'tamil', release_year: 2026, rating: 8.2, description: 'Arjun Das and Aditi Shankar explore the "what ifs" of a broken relationship.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Ananthan Kaadu', genre: 'Environmental Drama', genres: ['drama'], language: 'tamil', release_year: 2026, rating: 7.9, description: 'Arya plays a man who builds a forest from scratch in a dry wasteland.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: '7G Rainbow Colony 2', genre: 'Romantic Drama', genres: ['drama', 'romance'], language: 'tamil', release_year: 2026, rating: 8.7, description: 'The sequel following a middle-aged Kathir still searching for meaning in his life.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Genie', genre: 'Fantasy Drama', genres: ['drama', 'fantasy'], language: 'tamil', release_year: 2026, rating: 8.3, description: 'Jayam Ravi discovers a being that forces him to face his repressed childhood memories.', source: '🟣 Disney+ Hotstar', type: 'movie' },
    { title: 'Murungakkai', genre: 'Village Drama', genres: ['drama'], language: 'tamil', release_year: 2026, rating: 6.8, description: 'A satirical look at fertility and superstitions in a rural household.', source: '🟠 Aha Tamil', type: 'movie' },
    { title: 'Enimey Nangadha Head Lines', genre: 'Media Drama', genres: ['drama'], language: 'tamil', release_year: 2026, rating: 7.4, description: 'A young woman’s journey from a small-town reporter to a national news anchor.', source: '🟡 ZEE5', type: 'movie' },
    { title: 'Arrtham', genre: 'Philosophical Drama', genres: ['drama'], language: 'tamil', release_year: 2026, rating: 8.1, description: 'A man loses everything only to find the true meaning of existence in a monastery.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Sokku Sundaram', genre: 'Musical Drama', genres: ['drama', 'music'], language: 'tamil', release_year: 2026, rating: 7.3, description: 'The rise and fall of a street performer in the busy streets of Madurai.', source: '🟣 JioHotstar', type: 'movie' },
    { title: 'Devdass Parvati', genre: 'Contemporary Drama', genres: ['drama', 'romance'], language: 'tamil', release_year: 2026, rating: 7.7, description: 'A modern-day retelling of the classic legend set in a tech hub.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Uyarndha Manithan', genre: 'Inspirational Drama', genres: ['drama'], language: 'tamil', release_year: 2026, rating: 8.6, description: 'SJ Suryah and Amitabh Bachchan in a story about mentorship and ethics.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Pickup Drop', genre: 'Satirical Drama', genres: ['drama'], language: 'tamil', release_year: 2026, rating: 6.5, description: 'A ride-share driver becomes a confidant to some of the city\'s most dangerous people.', source: '🟠 Aha Tamil', type: 'movie' },
    { title: 'Evidence', genre: 'Mystery Drama', genres: ['drama', 'mystery'], language: 'tamil', release_year: 2026, rating: 8.4, description: 'A Sasikumar-Yogi Babu starrer where a small piece of evidence changes a village’s history.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Thandachoru', genre: 'Social Comedy-Drama', genres: ['drama', 'comedy'], language: 'tamil', release_year: 2026, rating: 7.2, description: 'A lighthearted but deep look at unemployment and dignity among rural youth.', source: '🟡 ZEE5', type: 'movie' }
  ];

  const tamilFamilyMovies = [
    { title: 'Thaai Kizhavi', genre: 'Family Drama, Comedy', release_year: 2026, rating: 8.8, description: 'Radikaa Sarathkumar plays a powerful matriarch managing a massive family property dispute with wit.', source: '🟣 Disney+ Hotstar' },
    { title: 'Lucky: The Super Star', genre: 'Family, Comedy', release_year: 2026, rating: 8.2, description: 'A mischievous puppy enters a broken household and helps a child find joy again.', source: '🟣 JioHotstar' },
    { title: 'Kudumbasthan', genre: 'Slice of Life, Family', release_year: 2025, rating: 8.5, description: 'Manikandan stars as a middle-class father juggling debt, funny relatives, and urban survival.', source: '🟠 Aha Tamil' },
    { title: 'Idli Kadai', genre: 'Family Drama', release_year: 2025, rating: 8.9, description: 'A heartwarming story about a small-town eatery that binds a neighborhood together. Directed by Dhanush.', source: '🔴 Netflix' },
    { title: 'Paranthu Po', genre: 'Road Trip, Comedy', release_year: 2025, rating: 8.1, description: 'A father and his eccentric 8-year-old son go on an impulsive road trip that repairs their bond.', source: '🔵 Amazon Prime' },
    { title: 'Maaman', genre: 'Rural Family Drama', release_year: 2025, rating: 7.8, description: 'An emotional tale of the bond between a protective uncle and his niece in a village setting.', source: '🟡 ZEE5' },
    { title: 'Madras Matinee', genre: 'Nostalgic Drama', release_year: 2025, rating: 8.3, description: 'A celebration of middle-class Chennai life through the lens of a family’s love for cinema.', source: '🔴 Netflix' },
    { title: 'Kumaara Sambavam', genre: 'Family Comedy', release_year: 2025, rating: 7.5, description: 'The chaos that ensues when three generations of men are forced to live under one roof.', source: '🔵 Amazon Prime' },
    { title: 'Carmeni Selvam', genre: 'Social Family Drama', release_year: 2026, rating: 8.0, description: 'Samuthirakani stars as a father teaching his children traditional values in a digital world.', source: '🟡 ZEE5' },
    { title: 'Manjal Kudai', genre: 'Rural Drama', release_year: 2026, rating: 7.4, description: 'A Vimal-starrer about a young man returning to his village to fulfill his grandfather\'s wish.', source: '🟠 Aha Tamil' },
    { title: 'Tourist Family', genre: 'Emotional Drama', release_year: 2025, rating: 8.6, description: 'A Sri Lankan family seeks refuge in India and finds a new "home" through local compassion.', source: '🔵 Amazon Prime' },
    { title: 'My Dear Dolly', genre: 'Fantasy Family Comedy', release_year: 2026, rating: 7.2, description: 'A young girl discovers her doll can talk, leading to a series of family adventures.', source: '🟣 JioHotstar' },
    { title: 'Bomb', genre: 'Family Thriller-Comedy', release_year: 2025, rating: 7.9, description: 'Arjun Das stars in a story where a misunderstanding about a package creates chaos in a joint family.', source: '🔵 Amazon Prime' },
    { title: 'Middle Class', genre: 'Domestic Drama', release_year: 2025, rating: 7.6, description: 'A realistic look at a family trying to maintain their status while facing sudden job loss.', source: '🟡 ZEE5' },
    { title: 'Aabhyanthara Kuttavaali', genre: 'Family Comedy', release_year: 2025, rating: 7.3, description: 'A lighthearted story about a man trying to hide his "secret" habits from his strict wife.', source: '🟡 ZEE5' },
    { title: 'Vaa Vaathiyaar', genre: 'Action Comedy', release_year: 2026, rating: 8.4, description: 'Karthi plays a hero influenced by his MGR-fan grandfather, balancing family values and action.', source: '🔵 Amazon Prime' },
    { title: 'Murugesan +2', genre: 'Coming-of-Age Family', release_year: 2025, rating: 7.1, description: 'A comedic take on a student trying to pass his exams while his family places high stakes on it.', source: '🟣 Sony LIV' },
    { title: 'Irudhi Muyarchi', genre: 'Inspirational Family', release_year: 2025, rating: 7.7, description: 'A grandfather enters a local marathon to inspire his lazy grandson to take life seriously.', source: '🔵 Amazon Prime' },
    { title: 'Kombuseevi', genre: 'Village Drama', release_year: 2025, rating: 7.0, description: 'A story of family pride and traditional values set against a village festival.', source: '🟣 Disney+ Hotstar' },
    { title: 'Happy Raj', genre: 'Romantic Family Comedy', release_year: 2026, rating: 8.0, description: 'G.V. Prakash stars as a wedding planner who has to fix a wedding in his own messy family.', source: '🔴 Netflix' }
  ];

  const tamilGenreCollection = [
    { title: 'Kingston', genre: 'Fantasy, Adventure', language: 'tamil', release_year: 2025, rating: 8.4, description: 'G.V. Prakash stars in a sea-based fantasy quest involving a cursed island and ancient myths.', source: '🟡 ZEE5' },
    { title: 'Genie', genre: 'Fantasy, Comedy', language: 'tamil', release_year: 2026, rating: 8.7, description: 'Jayam Ravi stars as a man who finds a magical lamp, only to realize the genie has a dark agenda.', source: '🟣 Disney+ Hotstar' },
    { title: 'Aalambana', genre: 'Fantasy, Adventure', language: 'tamil', release_year: 2025, rating: 7.6, description: 'A young man discovers a magical object that grants him control over time, but at a heavy cost.', source: '🟣 JioHotstar' },
    { title: 'Naga', genre: 'Fantasy, Supernatural', language: 'tamil', release_year: 2026, rating: 8.2, description: 'A protective snake deity takes human form to safeguard a village from an industrial curse.', source: '🔴 Netflix' },
    { title: 'Ayalaan 2', genre: 'Sci-Fi, Fantasy', language: 'tamil', release_year: 2026, rating: 9.0, description: 'Sivakarthikeyan and his alien friend return to stop a cosmic threat from harvesting Earth’s core.', source: '🟣 Sony LIV' },
    { title: 'Maayakoothu', genre: 'Fantasy, Folklore', language: 'tamil', release_year: 2025, rating: 7.9, description: 'A story centered around a cursed theatrical troupe whose plays manifest in reality.', source: '🔵 Amazon Prime' },
    { title: 'House Mates', genre: 'Horror, Fantasy', language: 'tamil', release_year: 2025, rating: 7.4, description: 'Two flatmates realize their apartment is a portal to a whimsical, yet dangerous parallel world.', source: '🟡 ZEE5' },
    { title: 'Maya Puthagam', genre: 'Fantasy, Mystery', language: 'tamil', release_year: 2025, rating: 7.1, description: 'An ancient book allows its reader to rewrite past events, causing ripples in the present.', source: '🟠 Aha Tamil' },
    { title: 'Ikk 2', genre: 'Psychological Fantasy', language: 'tamil', release_year: 2026, rating: 7.8, description: 'A man with a broken memory navigates a surreal world where thoughts become physical objects.', source: '🔵 Amazon Prime' },
    { title: 'Vishwambhara', genre: 'Epic Fantasy', language: 'tamil', release_year: 2026, rating: 9.1, description: 'A celestial warrior descends to Earth to restore balance during a modern-day apocalypse.', source: '🔴 Netflix' },
    { title: 'Kottravai', genre: 'Fantasy, History', language: 'tamil', release_year: 2026, rating: 8.5, description: 'A treasure hunt that blends Sangam-era myths with 21st-century survival.', source: '🟣 Disney+ Hotstar' },
    { title: 'Indraprastham', genre: 'Fantasy, Action', language: 'tamil', release_year: 2026, rating: 8.3, description: 'A modern man finds himself transported to a mythological kingdom through a VR glitch.', source: '🔵 Amazon Prime' },
    { title: 'Operation JuJuPi', genre: 'Political Fantasy', language: 'tamil', release_year: 2025, rating: 7.0, description: 'A satirical take on what happens when a genie enters Indian politics.', source: '🟡 ZEE5' },
    { title: 'Karuppu Pulsar', genre: 'Fantasy Thriller', language: 'tamil', release_year: 2026, rating: 7.7, description: 'A bike that can outrun death itself leads its rider into a spiritual war.', source: '🟣 JioHotstar' },
    { title: 'Messenger', genre: 'Romantic Fantasy', language: 'tamil', release_year: 2026, rating: 7.5, description: 'A man receives letters from his future self, warning him about his impending wedding.', source: '🔴 Netflix' },
    { title: 'Atharva', genre: 'Sci-Fi Fantasy', language: 'tamil', release_year: 2026, rating: 8.0, description: 'A prehistoric man is unfrozen in modern Chennai and struggles to adapt.', source: '🔵 Amazon Prime' },
    { title: 'Kadugu 2', genre: 'Surreal Drama', language: 'tamil', release_year: 2025, rating: 8.6, description: 'A village where shadows have lives of their own and start a revolution.', source: '🟣 Sony LIV' },
    { title: 'Sky High', genre: 'Superhero Fantasy', language: 'tamil', release_year: 2026, rating: 8.1, description: 'Tamil Nadu’s first indigenous superhero film about a boy with the power of wind.', source: '🔴 Netflix' },
    { title: 'Mirage', genre: 'Fantasy, Mystery', language: 'tamil', release_year: 2026, rating: 7.9, description: 'A desert town that appears only once every 100 years holds a secret weapon.', source: '🟡 ZEE5' },
    { title: 'Bramma', genre: 'Mythological Fantasy', language: 'tamil', release_year: 2026, rating: 8.4, description: 'The creator himself walks the earth to see why his creations are destroying the planet.', source: '🔵 Amazon Prime' },
    { title: 'Parasakthi', genre: 'History, Politics', language: 'tamil', release_year: 2026, rating: 9.3, description: 'Sudha Kongara’s epic on the 1965 Anti-Hindi agitations starring Sivakarthikeyan.', source: '🟡 ZEE5' },
    { title: 'Kuttraparambarai', genre: 'History, Period', language: 'tamil', release_year: 2026, rating: 9.0, description: 'Bharathiraja’s long-awaited epic about the Criminal Tribes Act during the British Raj.', source: '🔴 Netflix' },
    { title: 'Magudam', genre: 'History, Action', language: 'tamil', release_year: 2026, rating: 8.6, description: 'Vishal stars in a saga about a 19th-century rebel chieftain in Southern India.', source: '🟣 Disney+ Hotstar' },
    { title: 'Cholan', genre: 'History, War', language: 'tamil', release_year: 2025, rating: 8.9, description: 'A naval war epic focusing on the Chola Empire’s expansion into Southeast Asia.', source: '🔵 Amazon Prime' },
    { title: 'Vaadi Vaasal', genre: 'History, Sport', language: 'tamil', release_year: 2026, rating: 9.4, description: 'Suriya stars in Vetrimaaran’s tale of Jallikattu and ancestral pride set in the 1950s.', source: '🔴 Netflix' },
    { title: 'Madurai Veeran', genre: 'History, Legend', language: 'tamil', release_year: 2025, rating: 8.2, description: 'The life and trials of a legendary 17th-century folk hero of Madurai.', source: '🟠 Aha Tamil' },
    { title: 'Kappal', genre: 'History, Drama', language: 'tamil', release_year: 2026, rating: 8.1, description: 'The story of Tamil merchant sailors who defied the British East India Company.', source: '🟡 ZEE5' },
    { title: 'Pandya', genre: 'History, Action', language: 'tamil', release_year: 2025, rating: 7.8, description: 'A gritty retelling of the Pandyan dynasty’s struggle against the Delhi Sultanate.', source: '🟣 Sony LIV' },
    { title: 'Independence', genre: 'History, Thriller', language: 'tamil', release_year: 2026, rating: 8.5, description: 'A group of unsung Tamil spies during the 1940s Quit India movement.', source: '🔴 Netflix' },
    { title: 'Sangam', genre: 'History, Romance', language: 'tamil', release_year: 2026, rating: 8.3, description: 'A poetic drama set during the third Sangam period in ancient Madurai.', source: '🔵 Amazon Prime' },
    { title: 'Puli Thevan', genre: 'History, Biography', language: 'tamil', release_year: 2025, rating: 8.0, description: 'The life of the first Tamil king to revolt against British rule.', source: '🟣 JioHotstar' },
    { title: 'Silk Road', genre: 'History, Adventure', language: 'tamil', release_year: 2026, rating: 7.7, description: 'Tamil traders navigating the ancient silk routes through China and Rome.', source: '🔵 Amazon Prime' },
    { title: 'Thanjai', genre: 'History, Architecture', language: 'tamil', release_year: 2025, rating: 8.7, description: 'The engineering marvel and politics behind the building of the Big Temple.', source: '🔴 Netflix' },
    { title: 'Vellore Mutiny', genre: 'History, War', language: 'tamil', release_year: 2026, rating: 8.4, description: 'A cinematic look at the 1806 mutiny against the British at Vellore Fort.', source: '🟣 Disney+ Hotstar' },
    { title: 'Korkai', genre: 'History, Mystery', language: 'tamil', release_year: 2025, rating: 8.2, description: 'Exploring the lost harbor of the Pandyas and its legendary pearl trade.', source: '🟡 ZEE5' },
    { title: 'Vanchana', genre: 'Legal, Crime', language: 'tamil', release_year: 2025, rating: 7.5, description: 'A young lawyer fights to prove a driver’s innocence in a high-profile church murder.', source: '🟡 Sun NXT' },
    { title: 'Sirai', genre: 'Legal, Police Drama', language: 'tamil', release_year: 2025, rating: 8.6, description: 'Vikram Prabhu stars in a courtroom battle where a cop’s career depends on a convict’s testimony.', source: '🟡 ZEE5' },
    { title: 'Kooran', genre: 'Legal, Social Drama', language: 'tamil', release_year: 2025, rating: 8.3, description: 'A landmark case where a lawyer fights for animal rights after a tragic accident.', source: '🟣 YouTube/OTT' },
    { title: 'Justice for Jeni', genre: 'Legal, Thriller', language: 'tamil', release_year: 2026, rating: 8.2, description: 'A lawyer takes on a corporate giant to uncover a hidden environmental crime.', source: '🟣 JioHotstar' },
    { title: 'Witness', genre: 'Legal, Mystery', language: 'tamil', release_year: 2025, rating: 7.9, description: 'The only witness to a crime is a person with sensory processing disorder; the trial turns chaotic.', source: '🔵 Amazon Prime' },
    { title: 'The Judge', genre: 'Legal, Suspense', language: 'tamil', release_year: 2026, rating: 8.8, description: 'A retired judge is forced to reconsider his most famous verdict when new evidence emerges.', source: '🔴 Netflix' },
    { title: 'Order Order', genre: 'Legal, Comedy', language: 'tamil', release_year: 2026, rating: 7.4, description: 'A satirical look at the backlogs and bizarre cases in a local district court.', source: '🟡 ZEE5' },
    { title: 'Vakeel Saab 2', genre: 'Legal, Action', language: 'tamil', release_year: 2026, rating: 8.5, description: 'The crusade for women’s rights continues in this high-intensity courtroom sequel.', source: '🔵 Amazon Prime' },
    { title: 'Public Interest', genre: 'Legal Drama', language: 'tamil', release_year: 2025, rating: 8.1, description: 'A PIL specialist uncovers a massive scam involving the city’s water supply.', source: '🟣 Sony LIV' },
    { title: 'Defence', genre: 'Legal, Thriller', language: 'tamil', release_year: 2026, rating: 8.0, description: 'A lawyer must defend his own father, who has been accused of a crime he didn’t commit.', source: '🔴 Netflix' },
    { title: 'Kutram Thavir 2', genre: 'Legal, Crime', language: 'tamil', release_year: 2026, rating: 7.7, description: 'The ethical dilemma of a criminal lawyer defending the undefendable.', source: '🟣 Disney+ Hotstar' },
    { title: 'Article 32', genre: 'Legal, Political', language: 'tamil', release_year: 2025, rating: 8.4, description: 'A deep dive into constitutional rights and the battle for personal liberty.', source: '🔵 Amazon Prime' },
    { title: 'Section 302', genre: 'Legal, Mystery', language: 'tamil', release_year: 2025, rating: 7.6, description: 'A murder trial where the victim’s body is never found, challenging the limits of the law.', source: '🟡 ZEE5' },
    { title: 'Verdict', genre: 'Legal Drama', language: 'tamil', release_year: 2026, rating: 8.2, description: 'The impact of social media trials on the actual judicial process.', source: '🔴 Netflix' },
    { title: 'Law School', genre: 'Legal, Coming-of-Age', language: 'tamil', release_year: 2026, rating: 7.3, description: 'The lives and rivalries of students at the prestigious Madras Law College.', source: '🟣 JioHotstar' }
  ];

  const tamilHorrorMovies = [
    { title: 'Demonte Colony 3', genre: 'Horror, Thriller', release_year: 2026, rating: 9.1, description: 'Arulnithi returns to face a deeper, ancient curse in this high-stakes sequel.', source: '🔴 Netflix' },
    { title: 'Kanchana 4', genre: 'Horror, Comedy', release_year: 2026, rating: 8.7, description: 'Raghava Lawrence returns with Pooja Hegde in a story involving a ghost and an airplane crash.', source: '🟣 Disney+ Hotstar' },
    { title: 'Aghathiyaa', genre: 'Horror, Action', release_year: 2025, rating: 7.4, description: 'Jiiva and Arjun Sarja star in a massive battle between celestial angels and hell-bound devils.', source: '🟡 Sun NXT' },
    { title: 'House Mates', genre: 'Fantasy, Horror', release_year: 2025, rating: 7.9, description: 'Two flatmates discover their rental apartment is a gateway to a terrifying parallel world.', source: '🟡 ZEE5' },
    { title: 'Jinn: The Pet', genre: 'Horror, Comedy', release_year: 2025, rating: 7.2, description: 'A family adopts a mythical creature under three strict conditions; breaking them is a nightmare.', source: '🔵 Amazon Prime' },
    { title: 'Devil\'s Double Next Level', genre: 'Horror, Comedy', release_year: 2025, rating: 8.0, description: 'Santhanam stars in this fourth installment of the "Dhilluku Dhuddu" franchise.', source: '🟡 ZEE5' },
    { title: 'Pagal Kanavu', genre: 'Horror, Mystery', release_year: 2025, rating: 6.8, description: 'A man’s lucid dreams begin to physically manifest, bringing a vengeful entity into his life.', source: '🟣 JioHotstar' },
    { title: 'Naruvee', genre: 'Horror, Thriller', release_year: 2025, rating: 7.1, description: 'An investigative journalist tracks a series of "silent" murders in a remote misty hill station.', source: '🔴 Netflix' },
    { title: 'Murmur', genre: 'Found Footage, Horror', release_year: 2025, rating: 7.5, description: 'Paranormal YouTubers get lost in a cursed forest; the police find only their recordings.', source: '🔵 Amazon Prime' },
    { title: 'Yaar', genre: 'Pure Horror', release_year: 2025, rating: 6.5, description: 'Sonia Agarwal and Raai Laxmi star in a classic haunted house story.', source: '🟣 Sony LIV' },
    { title: 'Black', genre: 'Horror, Thriller', release_year: 2025, rating: 8.4, description: 'Jiiva and Priya Bhavani Shankar star in a time-loop horror.', source: '🔵 Amazon Prime' },
    { title: 'Pallavapuram Manai 666', genre: 'Horror, Drama', release_year: 2025, rating: 6.2, description: 'Residents realize they are living on a site used for ancient dark rituals.', source: '🟡 ZEE5' },
    { title: 'P2', genre: 'Supernatural Horror', release_year: 2025, rating: 7.3, description: 'A spiritual sequel focusing on the vengeful spirit of a child seeking a new mother.', source: '🔴 Netflix' },
    { title: 'Katteri 2', genre: 'Horror, Fantasy', release_year: 2026, rating: 7.8, description: 'The sequel takes the survivors to a new village where the dead are used as puppets.', source: '🟣 Disney+ Hotstar' },
    { title: 'Antha Naal', genre: 'Horror, Suspense', release_year: 2025, rating: 7.0, description: 'A modern reimagining where the ghost is a digital echo of a murder victim.', source: '🔵 Amazon Prime' },
    { title: 'Yamakaathaghi', genre: 'Horror, Drama', release_year: 2025, rating: 7.7, description: 'A young girl’s spirit refuses to leave her funeral home.', source: '🟠 Aha Tamil' },
    { title: 'Konja Naal Poru Thalaiva', genre: 'Horror, Romance', release_year: 2025, rating: 6.4, description: 'A romantic getaway turns deadly when the couple realizes the resort is run by spirits.', source: '🟡 ZEE5' },
    { title: 'Rajini Gaang', genre: 'Horror, Comedy', release_year: 2025, rating: 6.9, description: 'Fans get trapped in a theatre that only plays horror movies at night.', source: '🟣 JioHotstar' },
    { title: 'Pei Kathai', genre: 'Horror, Anthology', release_year: 2025, rating: 7.2, description: 'Four short stories exploring different urban legends of Chennai.', source: '🔴 Netflix' },
    { title: 'Holocaust', genre: 'Horror, Thriller', release_year: 2025, rating: 7.6, description: 'Survival horror where hikers stumble upon a chemical experiment gone wrong.', source: '🔵 Amazon Prime' },
    { title: 'Maya 2', genre: 'Psychological Horror', release_year: 2026, rating: 8.8, description: 'The long-awaited sequel to the Nayanthara hit.', source: '🔴 Netflix' },
    { title: 'Eeram 2', genre: 'Horror, Mystery', release_year: 2026, rating: 8.5, description: 'A detective investigates drownings where the water itself seems to be the killer.', source: '🟣 Disney+ Hotstar' },
    { title: 'Mirror', genre: 'Horror', release_year: 2025, rating: 6.7, description: 'Anyone who looks into the mirror of a cursed palace sees their own death.', source: '🟡 ZEE5' },
    { title: 'Vampire in Vada Chennai', genre: 'Horror, Action', release_year: 2026, rating: 8.2, description: 'An underground blood-trafficking ring in North Chennai is run by vampires.', source: '🔴 Netflix' },
    { title: 'Kootu', genre: 'Horror', release_year: 2026, rating: 7.1, description: 'A joint family realizes their new home has a "spare" room that keeps changing.', source: '🔵 Amazon Prime' },
    { title: 'Shadow Hunter', genre: 'Supernatural', release_year: 2026, rating: 7.4, description: 'A blind man can "see" the ghosts that are terrorizing his neighborhood.', source: '🟣 JioHotstar' },
    { title: 'Ghost of 1947', genre: 'Horror, Period', release_year: 2026, rating: 8.1, description: 'A British soldier’s spirit haunts a government building.', source: '🔴 Netflix' },
    { title: 'Nool', genre: 'Horror, Thriller', release_year: 2025, rating: 7.3, description: 'A mysterious thread appears in a village; anyone who cuts it disappears.', source: '🟠 Aha Tamil' },
    { title: 'Doll', genre: 'Horror', release_year: 2026, rating: 6.6, description: 'A cursed antique doll is gifted to a child, causing havoc.', source: '🔵 Amazon Prime' },
    { title: 'Lift 2', genre: 'Horror, Thriller', release_year: 2026, rating: 7.9, description: 'A sequel set in a hospital where elevators lead to different eras of horror.', source: '🟣 Disney+ Hotstar' },
    { title: 'Brammaarpanam', genre: 'Mythological Horror', release_year: 2026, rating: 8.3, description: 'A priest tries to banish a demon accidentally summoned during a festival.', source: '🟡 ZEE5' },
    { title: 'Silent Night', genre: 'Slasher Horror', release_year: 2025, rating: 6.8, description: 'A masked killer stalks college students in a remote bungalow.', source: '🔴 Netflix' },
    { title: 'The Guest', genre: 'Psychological Horror', release_year: 2026, rating: 7.5, description: 'An uninvited guest at a dinner party claims he died 20 years ago.', source: '🔵 Amazon Prime' },
    { title: 'Agni', genre: 'Horror', release_year: 2025, rating: 7.0, description: 'A forest fire unearths a forgotten cemetery, releasing spirits.', source: '🟣 Sony LIV' },
    { title: 'Midnight Call', genre: 'Horror, Thriller', release_year: 2026, rating: 7.2, description: 'A radio DJ receives calls from people describing their own murders.', source: '🟡 ZEE5' },
    { title: 'Corridor', genre: 'Horror', release_year: 2025, rating: 6.4, description: 'A long hospital corridor that never ends traps night-shift nurses.', source: '🟣 JioHotstar' },
    { title: 'Naga 2', genre: 'Supernatural', release_year: 2026, rating: 8.0, description: 'The serpent goddess returns to protect her shrine.', source: '🔴 Netflix' },
    { title: 'Uru', genre: 'Horror', release_year: 2026, rating: 7.6, description: 'A writer travels to a mountain retreat; his horror novel plot comes to life.', source: '🔵 Amazon Prime' },
    { title: 'Blood Lake', genre: 'Horror, Mystery', release_year: 2025, rating: 6.9, description: 'A village lake turns red every full moon.', source: '🟠 Aha Tamil' },
    { title: 'The Nun: Tamil Chapter', genre: 'Horror', release_year: 2026, rating: 7.8, description: 'An Indian spin-off of the famous franchise, set in Ooty.', source: '🟣 Disney+ Hotstar' },
    { title: 'Cellar', genre: 'Horror', release_year: 2025, rating: 6.5, description: 'A family discovers a locked cellar containing the history of a serial killer.', source: '🟡 ZEE5' },
    { title: 'Asvins 2', genre: 'Horror, Folklore', release_year: 2026, rating: 8.4, description: 'The darkness from the first film spreads to a local library.', source: '🔴 Netflix' },
    { title: 'Scream Chennai', genre: 'Slasher Horror', release_year: 2026, rating: 7.3, description: 'A meta-horror film where characters are killed by the rules of cinema.', source: '🔵 Amazon Prime' },
    { title: 'Guardian 2', genre: 'Horror, Comedy', release_year: 2026, rating: 6.1, description: 'Hansika Motwani returns as the accidental ghost-hunter.', source: '🟣 JioHotstar' },
    { title: 'Cold Case', genre: 'Supernatural Mystery', release_year: 2025, rating: 7.5, description: 'A cop and a medium work together to solve a 50-year-old murder.', source: '🔵 Amazon Prime' },
    { title: 'The Well', genre: 'Horror', release_year: 2026, rating: 7.0, description: 'A village well becomes a portal for lost souls.', source: '🟡 ZEE5' },
    { title: 'Red Room', genre: 'Horror, Thriller', release_year: 2025, rating: 6.7, description: 'An internet urban legend about a red room becomes reality.', source: '🔴 Netflix' },
    { title: 'Pisasu 2', genre: 'Horror, Drama', release_year: 2025, rating: 8.9, description: 'Mysskin’s poetic and terrifying tale of a ghost that only wants to be loved.', source: '🔵 Amazon Prime' },
    { title: 'Dark Web', genre: 'Horror', release_year: 2026, rating: 7.4, description: 'A gamer accidentally downloads a file that haunts his home.', source: '🟣 Sony LIV' },
    { title: 'Final Exit', genre: 'Horror', release_year: 2026, rating: 6.8, description: 'A highway that has no exit traps travelers in a loop.', source: '🟠 Aha Tamil' }
  ];

  const tamilHorrorVault = [
    { title: 'Shock', year: 2004, subgenre: 'Supernatural', rating: 7.8, note: 'Prashanth and Meena in a gritty remake of Bhoot.' },
    { title: 'Chandramukhi', year: 2005, subgenre: 'Psychological Horror', rating: 9.0, note: 'Rajinikanth’s record-breaking blockbuster.' },
    { title: 'Yaar?', year: 2007, subgenre: 'Slasher/Mystery', rating: 6.5, note: 'A low-budget mystery horror that gained a cult following.' },
    { title: 'Sivi', year: 2007, subgenre: 'Supernatural', rating: 7.1, note: 'A remake of the Thai film Shutter.' },
    { title: 'Eeram', year: 2009, subgenre: 'Supernatural Thriller', rating: 8.5, note: 'A masterpiece where water is the primary element of horror.' },
    { title: '13B: Yaavarum Nalam', year: 2009, subgenre: 'Psychological/Sci-Fi', rating: 8.8, note: 'Madhavan stars in a story where a TV soap opera predicts murders.' },
    { title: 'Ananthapurathu Veedu', year: 2010, subgenre: 'Ghost Drama', rating: 7.4, note: 'A unique film where the ghosts are friendly ancestors.' },
    { title: 'Muni', year: 2007, subgenre: 'Horror Comedy', rating: 7.2, note: 'The film that launched Raghava Lawrence’s Muni universe.' },
    { title: 'Kanchana', year: 2011, subgenre: 'Horror Comedy', rating: 8.3, note: 'Revolutionized the genre by adding loud comedy and social messages.' },
    { title: 'Pizza', year: 2012, subgenre: 'Mystery Horror', rating: 8.9, note: 'Karthik Subbaraj’s debut; famous for its twist ending.' },
    { title: 'Pizza II: Villa', year: 2013, subgenre: 'Psychological', rating: 7.5, note: 'A deep dive into predestination and art-based horror.' },
    { title: 'Pisasu', year: 2014, subgenre: 'Emotional Horror', rating: 8.6, note: 'Mysskin’s take on a ghost that doesn’t want to kill.' },
    { title: 'Yaamirukka Bayamey', year: 2014, subgenre: 'Horror Comedy', rating: 7.9, note: 'A group of people tries to run a hotel in a haunted mansion.' },
    { title: 'Demonte Colony', year: 2015, subgenre: 'Pure Horror', rating: 8.4, note: 'Based on a real-life haunted location in Chennai.' },
    { title: 'Maya', year: 2015, subgenre: 'Supernatural Thriller', rating: 8.7, note: 'Nayanthara stars in a meta-horror film.' },
    { title: 'Aranmanai', year: 2014, subgenre: 'Horror Comedy', rating: 6.8, note: 'Sundar C’s massive franchise starter.' },
    { title: 'Darling', year: 2015, subgenre: 'Horror Comedy', rating: 7.4, note: 'G.V. Prakash’s debut as an actor.' },
    { title: 'Dhilluku Dhuddu', year: 2016, subgenre: 'Action Comedy Horror', rating: 7.0, note: 'Santhanam’s spoof of horror tropes.' },
    { title: 'Dora', year: 2017, subgenre: 'Supernatural', rating: 6.9, note: 'A "haunted car" movie starring Nayanthara.' },
    { title: 'Aval', year: 2017, subgenre: 'Slasher/Gothic', rating: 8.2, note: 'A highly technical and terrifying film set in the Himalayas.' },
    { title: 'Aruvam', year: 2019, subgenre: 'Social Horror', rating: 6.1, note: 'Siddharth stars in a film about food adulteration.' },
    { title: 'Andhaghaaram', year: 2020, subgenre: 'Supernatural Mystery', rating: 8.5, note: 'A slow-burn Netflix hit involving a blind man.' },
    { title: 'Lift', year: 2021, subgenre: 'Survival Horror', rating: 7.9, note: 'Kavin stars in a claustrophobic thriller set in an IT park.' },
    { title: 'Connect', year: 2022, subgenre: 'Exorcism', rating: 7.2, note: 'A pandemic-set horror filmed entirely over Zoom.' },
    { title: 'Asvins', year: 2023, subgenre: 'Folk Horror', rating: 8.0, note: 'Sound-based horror exploring ancient dual-gods.' },
    { title: 'DD Returns', year: 2023, subgenre: 'Horror Comedy', rating: 7.8, note: 'A successful game-show-based horror comedy.' },
    { title: 'Aranmanai 4', year: 2024, subgenre: 'Horror Comedy', rating: 8.1, note: 'Highest-grossing film in the franchise.' },
    { title: 'Black', year: 2024, subgenre: 'Sci-Fi Horror', rating: 8.3, note: 'Jiiva stars in a mind-bending time-loop story.' },
    { title: 'Demonte Colony 2', year: 2024, subgenre: 'Dark Fantasy/Horror', rating: 8.6, note: 'Expands the lore into a "darkness vs light" epic.' },
    { title: 'Sabdham', year: 2025, subgenre: 'Supernatural', rating: 8.4, note: 'Aadhi stars in a film where "sound" itself is cursed.' },
    { title: 'Yamakaathaghi', year: 2025, subgenre: 'Folk Horror', rating: 7.9, note: 'Explores the dark side of village rituals.' },
    { title: 'Granny', year: 2026, subgenre: 'Slasher/Drama', rating: 7.2, note: 'A single-night thriller about an elderly woman.' },
    { title: 'Honey', year: 2026, subgenre: 'Psychological Horror', rating: 7.5, note: 'A family descends into chaos when a child starts talking to an entity.' },
    { title: 'House Mates', year: 2025, subgenre: 'Urban Horror', rating: 8.1, note: 'Terror of sharing a cheap apartment with an unseen roommate.' },
    { title: 'Yaaman', year: 2026, subgenre: 'Supernatural Thriller', rating: 7.0, note: 'A high-octane mystery involving death-omens.' },
    { title: 'Demonte Colony 3', year: 2026, subgenre: 'Epic Horror', rating: 9.2, note: 'The planned conclusion to the trilogy.' },
    { title: 'Maya 2', year: 2026, subgenre: 'Origins', rating: 8.8, note: 'Expected sequel/prequel to the 2015 hit.' },
    { title: 'Kanchana 4', year: 2026, subgenre: 'Horror Comedy', rating: 8.5, note: 'Raghava Lawrence’s next big entry.' },
    { title: 'Pisasu 2', year: 2025, subgenre: 'Gothic Horror', rating: 8.9, note: 'Mysskin returns with Andrea Jeremiah.' },
    { title: 'Eeram 2', year: 2026, subgenre: 'Mystery', rating: 8.4, note: 'Director Arivazhagan returns to elemental horror.' },
    { title: 'Ghost of 1947', year: 2026, subgenre: 'Period Horror', rating: 7.8, note: 'A British-era soldier haunts a government office.' },
    { title: 'Naruvee', year: 2025, subgenre: 'Hill Station Horror', rating: 7.3, note: 'A misty thriller about a "silent" killer.' },
    { title: 'Jinn: The Pet', year: 2025, subgenre: 'Dark Fantasy', rating: 7.1, note: 'Cautionary tale about bringing home a creature.' },
    { title: 'Pagal Kanavu', year: 2025, subgenre: 'Dream Horror', rating: 6.9, note: 'A man’s nightmares start physically appearing.' },
    { title: 'Holocaust', year: 2025, subgenre: 'Survival Horror', rating: 7.4, note: 'A group trapped in a bunker realizes they aren’t alone.' },
    { title: 'Paramasivan Fathima', year: 2025, subgenre: 'Supernatural', rating: 6.5, note: 'A cross-cultural ghost story.' },
    { title: 'Sumathi Valavu', year: 2025, subgenre: 'Rural Legend', rating: 7.0, note: 'Centers on a specific cursed turn on a rural highway.' },
    { title: 'Kishkindhapuri', year: 2025, subgenre: 'Tribal Horror', rating: 7.6, note: 'Anthropologist discovers a tribal community worshipping a demon.' },
    { title: 'Until Dawn', year: 2025, subgenre: 'Slasher', rating: 6.8, note: 'Survival night in a museum where exhibits come to life.' },
    { title: 'Vampire in Vada Chennai', year: 2026, subgenre: 'Action Horror', rating: 8.0, note: 'Gritty, urban take on vampires in North Chennai.' }
  ];

  // Normalize and push all Tamil categories
  const allTamil = [
    ...tamilData, ...tamilActionMovies, ...tamilComedyMovies, ...tamilCrimeMovies,
    ...tamilDramaMovies,
    ...tamilFamilyMovies.map(m => ({ ...m, language: 'tamil', type: 'movie', genres: m.genre.split(',').map(g => g.trim().toLowerCase()) })),
    ...tamilGenreCollection.map(m => ({ ...m, type: 'movie', genres: m.genre.split(',').map(g => g.trim().toLowerCase()) })),
    ...tamilHorrorMovies.map(m => ({ ...m, type: 'movie', genres: m.genre.split(',').map(g => g.trim().toLowerCase()) })),
    ...tamilHorrorVault.map(m => ({
      title: m.title, genre: m.subgenre, genres: [m.subgenre.toLowerCase()], language: 'tamil',
      release_year: m.year, rating: m.rating, description: m.note, source: '🎬 Classic', type: 'movie'
    }))
  ];

  allMovies.push(...allTamil);

  const teluguData = [
    { title: 'RRR', genre: 'Action, Drama', genres: ['action', 'drama', 'history'], language: 'telugu', release_year: 2022, rating: 8.0, description: 'Two revolutionaries fight against British Raj and Nizam of Hyderabad.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Pushpa: The Rise', genre: 'Action, Crime', genres: ['action', 'crime'], language: 'telugu', release_year: 2021, rating: 7.6, description: 'A laborer rises through the ranks of a red sandalwood smuggling syndicate.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Sita Ramam', genre: 'Romance, Drama', genres: ['romance', 'drama'], language: 'telugu', release_year: 2022, rating: 8.6, description: 'An orphan soldier finds love through a letter from a girl named Sita.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Dasara', genre: 'Action, Drama', genres: ['action', 'drama'], language: 'telugu', release_year: 2023, rating: 6.7, description: 'A young man seeks revenge in a coal mine-dominated village.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Virupaksha', genre: 'Horror, Thriller', genres: ['horror', 'thriller', 'mystery'], language: 'telugu', release_year: 2023, rating: 7.2, description: 'Mysterious deaths occur in a village due to an unknown occult power.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Baby', genre: 'Romance, Drama', genres: ['romance', 'drama'], language: 'telugu', release_year: 2023, rating: 7.4, description: 'The evolution of a relationship between childhood sweethearts as they grow up.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Dhootha', genre: 'Supernatural, Thriller', genres: ['thriller', 'mystery'], language: 'telugu', release_year: 2023, rating: 7.7, description: 'Predictive newspapers start foretelling tragedies for a journalist.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Hi Nanna', genre: 'Drama, Romance', genres: ['drama', 'romance'], language: 'telugu', release_year: 2023, rating: 8.2, description: 'A single father’s life changes when a woman enters his world.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Salaar: Part 1 – Ceasefire', genre: 'Action, Crime', genres: ['action', 'crime'], language: 'telugu', release_year: 2023, rating: 6.5, description: 'Two friends become bitter enemies in the city-state of Khansaar.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Keedaa Cola', genre: 'Crime, Comedy', genres: ['crime', 'comedy'], language: 'telugu', release_year: 2023, rating: 6.9, description: 'A group of friends finds a cockroach in a soda bottle and plans a scam.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Hanuman', genre: 'Superhero, Action', genres: ['fantasy', 'action'], language: 'telugu', release_year: 2024, rating: 7.9, description: 'A petty thief gains the powers of Lord Hanuman to save his village.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Guntur Kaaram', genre: 'Action, Drama', genres: ['action', 'drama'], language: 'telugu', release_year: 2024, rating: 5.8, description: 'A kingpin of the Guntur underworld deals with family secrets.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Kalki 2898 AD', genre: 'Sci-Fi, Action', genres: ['sci-fi', 'action'], language: 'telugu', release_year: 2024, rating: 7.6, description: 'The modern avatar of Vishnu descends to protect humanity from dark forces.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Tillu Square', genre: 'Comedy, Crime', genres: ['comedy', 'crime'], language: 'telugu', release_year: 2024, rating: 7.1, description: 'Tillu gets into trouble again with a mysterious woman.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Devara: Part 1', genre: 'Action, Drama', genres: ['action', 'drama'], language: 'telugu', release_year: 2024, rating: 6.4, description: 'A man from the coast stands against illegal activities at sea.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Lucky Baskhar', genre: 'Crime, Drama', genres: ['crime', 'drama'], language: 'telugu', release_year: 2024, rating: 8.1, description: 'An ordinary bank cashier starts an extraordinary journey of wealth.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Mathu Vadalara 2', genre: 'Comedy, Thriller', genres: ['comedy', 'thriller'], language: 'telugu', release_year: 2024, rating: 7.3, description: 'Delivery boys turned special agents get framed for a murder.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Saripodhaa Sanivaaram', genre: 'Action, Thriller', genres: ['action', 'thriller'], language: 'telugu', release_year: 2024, rating: 7.5, description: 'A man who unleashes his anger only on Saturdays fights a rogue cop.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Eagle', genre: 'Action, Thriller', genres: ['action', 'thriller'], language: 'telugu', release_year: 2024, rating: 6.0, description: 'A journalist uncovers the story of a legendary professional assassin.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Gaami', genre: 'Adventure, Sci-Fi', genres: ['adventure', 'drama'], language: 'telugu', release_year: 2024, rating: 7.0, description: 'An Aghori embarks on a journey to the Himalayas to find a cure.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Committee Kurrollu', genre: 'Drama, Comedy', genres: ['drama', 'comedy'], language: 'telugu', release_year: 2024, rating: 7.8, description: 'Life of a group of friends in a village over decades.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Om Bheem Bush', genre: 'Comedy, Horror', genres: ['comedy', 'horror'], language: 'telugu', release_year: 2024, rating: 6.2, description: 'Three scientists go to a village to perform black magic experiments.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Manamey', genre: 'Romance, Comedy', genres: ['romance', 'comedy'], language: 'telugu', release_year: 2024, rating: 6.5, description: 'Two polar opposites are forced to take care of a child together.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: '90s - A Middle Class Biopic', genre: 'Comedy, Drama', genres: ['comedy', 'drama'], language: 'telugu', release_year: 2024, rating: 8.8, description: 'A nostalgic look at 90s middle-class upbringing.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Love Me', genre: 'Horror, Romance', genres: ['horror', 'romance'], language: 'telugu', release_year: 2024, rating: 5.1, description: 'A YouTuber falls in love with a ghost in a haunted apartment.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Aay', genre: 'Comedy, Drama', genres: ['comedy', 'drama'], language: 'telugu', release_year: 2024, rating: 7.4, description: 'Three friends navigate life, love, and monsoon in Godavari.', source: '🔴 Netflix', type: 'movie' },
    { title: 'SWAG', genre: 'Comedy, Drama', genres: ['comedy', 'drama'], language: 'telugu', release_year: 2024, rating: 6.3, description: 'A multi-generational satire about gender and property.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Appudo Ippudo Eppudo', genre: 'Romance, Comedy', genres: ['romance', 'comedy'], language: 'telugu', release_year: 2024, rating: 5.7, description: 'A confusing love triangle set in London.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Bahubali: Crown of Blood', genre: 'Animation, Action', genres: ['animation', 'action'], language: 'telugu', release_year: 2024, rating: 7.2, description: 'Prequel animated series of the Mahishmati kingdom.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Yakshini', genre: 'Horror, Fantasy', genres: ['horror', 'fantasy'], language: 'telugu', release_year: 2024, rating: 6.1, description: 'A mythological entity seeks revenge on a bloodline.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Game Changer', genre: 'Action, Drama', genres: ['action', 'politics'], language: 'telugu', release_year: 2025, rating: 8.3, description: 'An honest IAS officer fights against a corrupt political system.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Pushpa 2: The Rule', genre: 'Action, Crime', genres: ['action', 'crime'], language: 'telugu', release_year: 2025, rating: 8.9, description: 'The clash between Pushpa Raj and Bhanwar Singh Shekhawat intensifies.', source: '🔴 Netflix', type: 'movie' },
    { title: 'The Raja Saab', genre: 'Horror, Comedy', genres: ['horror', 'comedy'], language: 'telugu', release_year: 2025, rating: 7.6, description: 'A romantic horror comedy set in a sprawling estate.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Hari Hara Veera Mallu', genre: 'Action, History', genres: ['action', 'history'], language: 'telugu', release_year: 2025, rating: 8.0, description: 'Life of a legendary outlaw in the Mughal era.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Goodachari 2', genre: 'Spy, Thriller', genres: ['action', 'spy'], language: 'telugu', release_year: 2025, rating: 8.4, description: 'Agent Arjun returns for an international mission.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Spirit', genre: 'Action, Crime', genres: ['action', 'crime'], language: 'telugu', release_year: 2025, rating: 8.7, description: 'A hard-hitting story of a ruthless police officer.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Vishwambhara', genre: 'Fantasy, Adventure', genres: ['fantasy', 'adventure'], language: 'telugu', release_year: 2025, rating: 7.9, description: 'A socio-fantasy epic spanning multiple realms.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Kubera', genre: 'Social, Drama', genres: ['drama', 'crime'], language: 'telugu', release_year: 2025, rating: 7.8, description: 'A story of wealth, poverty, and Mumbai underworld.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Mirai', genre: 'Action, Adventure', genres: ['action', 'adventure'], language: 'telugu', release_year: 2025, rating: 7.5, description: 'A warrior guards a secret that could destroy the world.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Dragon', genre: 'Action, Thriller', genres: ['action', 'thriller'], language: 'telugu', release_year: 2025, rating: 7.2, description: 'A high-octane actioner involving illegal street racing.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Swayambhu', genre: 'History, Action', genres: ['history', 'action'], language: 'telugu', release_year: 2025, rating: 8.1, description: 'The legendary tale of a fierce warrior prince.', source: '🔴 Netflix', type: 'movie' },
    { title: 'The Family Star', genre: 'Family, Drama', genres: ['drama', 'comedy'], language: 'telugu', release_year: 2024, rating: 6.4, description: 'A middle-class man tries to protect his family at any cost.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Thandel', genre: 'Drama, Action', genres: ['drama', 'action'], language: 'telugu', release_year: 2025, rating: 8.2, description: 'A fisherman accidentally crosses borders and ends up in a Pakistani jail.', source: '🔴 Netflix', type: 'movie' },
    { title: 'OG (Original Gangster)', genre: 'Action, Crime', genres: ['action', 'crime'], language: 'telugu', release_year: 2025, rating: 8.6, description: 'A master samurai returns to the underworld of Mumbai.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Daaku Maharaaj', genre: 'Action, Drama', genres: ['action', 'drama'], language: 'telugu', release_year: 2025, rating: 7.4, description: 'A gritty dacoit drama set in the 80s.', source: '🔴 Netflix', type: 'movie' },
    { title: 'SSMB29', genre: 'Adventure, Action', genres: ['adventure', 'action'], language: 'telugu', release_year: 2027, rating: 9.0, description: 'A massive globetrotting adventure directed by SS Rajamouli.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Jai Hanuman', genre: 'Mythology, Action', genres: ['fantasy', 'action'], language: 'telugu', release_year: 2026, rating: 8.5, description: 'The sequel to the 2024 hit focusing on Hanuman’s oath.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Toxic (Telugu)', genre: 'Action, Crime', genres: ['action', 'crime'], language: 'telugu', release_year: 2026, rating: 8.2, description: 'A dark fairy tale for grown-ups set in the drug mafia.', source: '🔴 Netflix', type: 'movie' },
    { title: 'War 2 (Telugu)', genre: 'Action, Spy', genres: ['action', 'spy'], language: 'telugu', release_year: 2026, rating: 7.9, description: 'Indian spies face off in a deadly game of betrayal.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Animal Park', genre: 'Crime, Action', genres: ['crime', 'action'], language: 'telugu', release_year: 2026, rating: 8.8, description: 'The brutal sequel to the violent family saga.', source: '🔴 Netflix', type: 'movie' },
    { title: 'NTR31', genre: 'Action, Thriller', genres: ['action', 'thriller'], language: 'telugu', release_year: 2026, rating: 8.5, description: 'A high-octane action drama from the director of Salaar.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'RC16', genre: 'Sports, Drama', genres: ['sports', 'drama'], language: 'telugu', release_year: 2026, rating: 7.7, description: 'A gritty village-based sports drama.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'VD12', genre: 'Spy, Thriller', genres: ['action', 'thriller'], language: 'telugu', release_year: 2026, rating: 7.5, description: 'An undercover agent uncovers a political conspiracy.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Kumari Srimathi', genre: 'Comedy, Drama', genres: ['comedy', 'drama'], language: 'telugu', release_year: 2023, rating: 7.9, description: 'A 30-year-old woman tries to win back her ancestral home.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Save the Tigers', genre: 'Comedy', genres: ['comedy'], language: 'telugu', release_year: 2023, rating: 8.1, description: 'Three frustrated husbands bond over their marital issues.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Rana Naidu', genre: 'Crime, Action', genres: ['crime', 'action'], language: 'telugu', release_year: 2023, rating: 7.0, description: 'A fixer for celebrities deals with his own messy family.', source: '🔴 Netflix', type: 'tv show' },
    { title: 'Mansion 24', genre: 'Horror, Mystery', genres: ['horror', 'mystery'], language: 'telugu', release_year: 2023, rating: 5.6, description: 'A girl enters a haunted mansion to find her father.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Unstoppable', genre: 'Talk Show', genres: ['talk-show'], language: 'telugu', release_year: 2022, rating: 8.5, description: 'Balakrishna hosts a celebrity talk show with candid chats.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Vyuham', genre: 'Political, Crime', genres: ['political', 'crime'], language: 'telugu', release_year: 2024, rating: 5.2, description: 'The political journey of a young leader against rivals.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Razakar', genre: 'History, Action', genres: ['history', 'action'], language: 'telugu', release_year: 2024, rating: 6.8, description: 'The struggle of Hyderabad state for independence from the Nizam.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Tikka', genre: 'Comedy, Thriller', genres: ['comedy', 'thriller'], language: 'telugu', release_year: 2025, rating: 7.1, description: 'A series of accidents lead to a chaotic night.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Bhoothaddam Bhaskar Narayana', genre: 'Detective, Thriller', genres: ['mystery', 'thriller'], language: 'telugu', release_year: 2024, rating: 6.9, description: 'A detective solves ritualistic murders on the border.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Ambajipeta Marriage Band', genre: 'Drama', genres: ['drama'], language: 'telugu', release_year: 2024, rating: 7.5, description: 'Twin siblings face social challenges in their village.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Gangs of Godavari', genre: 'Action, Crime', genres: ['action', 'crime'], language: 'telugu', release_year: 2024, rating: 6.4, description: 'The rise of a gangster in the Godavari delta.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Double iSmart', genre: 'Action, Sci-Fi', genres: ['action', 'sci-fi'], language: 'telugu', release_year: 2024, rating: 4.5, description: 'Memory transfer leads to chaos for a local rowdy.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Paarijatha Parvam', genre: 'Comedy, Crime', genres: ['comedy', 'crime'], language: 'telugu', release_year: 2024, rating: 6.0, description: 'A kidnapping goes wrong in a hilarious way.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Music Shop Murthy', genre: 'Drama, Comedy', genres: ['drama', 'comedy'], language: 'telugu', release_year: 2024, rating: 7.2, description: 'A middle-aged man follows his dream of becoming a DJ.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Satyabhama', genre: 'Crime, Thriller', genres: ['crime', 'thriller'], language: 'telugu', release_year: 2024, rating: 6.6, description: 'A police officer investigates a missing person case.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Honey Moon Express', genre: 'Comedy, Romance', genres: ['comedy', 'romance'], language: 'telugu', release_year: 2024, rating: 5.9, description: 'A surreal journey of a couple reconsidering their divorce.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Bakasura', genre: 'Action, Thriller', genres: ['action', 'thriller'], language: 'telugu', release_year: 2025, rating: 7.4, description: 'A story of greed and corporate espionage.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Night Curfew', genre: 'Horror, Thriller', genres: ['horror', 'thriller'], language: 'telugu', release_year: 2025, rating: 6.7, description: 'Survival during a mysterious lockdown night.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Kadapa Kaatulu', genre: 'Action, Drama', genres: ['action', 'drama'], language: 'telugu', release_year: 2026, rating: 8.0, description: 'The blood-soaked history of Rayalaseema factions.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Metro Kathalu', genre: 'Drama, Anthology', genres: ['drama'], language: 'telugu', release_year: 2023, rating: 6.5, description: 'Life stories of various people in a metro city.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Loser', genre: 'Sports, Drama', genres: ['sports', 'drama'], language: 'telugu', release_year: 2022, rating: 8.4, description: 'Three athletes from different eras struggle with their careers.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Parampara', genre: 'Crime, Drama', genres: ['crime', 'drama'], language: 'telugu', release_year: 2022, rating: 7.2, description: 'A family power struggle over a political legacy.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Recce', genre: 'Crime, Thriller', genres: ['crime', 'thriller'], language: 'telugu', release_year: 2022, rating: 7.8, description: 'A murder investigation set in a 90s village.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Dead Pixels', genre: 'Comedy', genres: ['comedy'], language: 'telugu', release_year: 2023, rating: 6.1, description: 'A group of friends obsessed with online gaming.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Shaitan', genre: 'Crime, Action', genres: ['crime', 'action'], language: 'telugu', release_year: 2023, rating: 7.5, description: 'How far will a family go to survive an outlaw life.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Hostel Days', genre: 'Comedy, Drama', genres: ['comedy', 'drama'], language: 'telugu', release_year: 2023, rating: 7.4, description: 'The fun and emotional life of engineering students in a hostel.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Brinda', genre: 'Crime, Mystery', genres: ['crime', 'mystery'], language: 'telugu', release_year: 2024, rating: 8.0, description: 'A female cop investigates ritualistic killings.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Vyavastha', genre: 'Legal Drama', genres: ['drama', 'legal'], language: 'telugu', release_year: 2023, rating: 6.8, description: 'A young lawyer takes on a seasoned veteran in court.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Evaru Meelo Koteeswarulu', genre: 'Game Show', genres: ['game-show'], language: 'telugu', release_year: 2022, rating: 7.9, description: 'The Telugu version of Who Wants to Be a Millionaire.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Maya Bazaar For Sale', genre: 'Comedy, Drama', genres: ['comedy', 'drama'], language: 'telugu', release_year: 2023, rating: 6.4, description: 'Life in a gated community becomes chaotic.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Angry Boy', genre: 'Comedy, Drama', genres: ['comedy', 'drama'], language: 'telugu', release_year: 2025, rating: 7.0, description: 'A man with anger issues tries to find inner peace.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Love Birds', genre: 'Romance', genres: ['romance'], language: 'telugu', release_year: 2025, rating: 7.2, description: 'A modern-day romance set in the tech world.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Silent Killer', genre: 'Thriller', genres: ['thriller'], language: 'telugu', release_year: 2025, rating: 7.6, description: 'A mute witness to a high-profile murder.', source: '🔴 Netflix', type: 'movie' },
    { title: 'King of Hyderabad', genre: 'Action, Crime', genres: ['action', 'crime'], language: 'telugu', release_year: 2026, rating: 8.3, description: 'A man takes over the old city underworld.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Robot 3.0', genre: 'Sci-Fi, Action', genres: ['sci-fi', 'action'], language: 'telugu', release_year: 2027, rating: 8.1, description: 'Chitti returns to save the world from AI gone rogue.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Village Roots', genre: 'Drama', genres: ['drama'], language: 'telugu', release_year: 2025, rating: 7.9, description: 'An NRI returns to develop his ancestral village.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'The Great Indian Kitchen (Telugu)', genre: 'Drama', genres: ['drama'], language: 'telugu', release_year: 2023, rating: 8.0, description: 'A woman rebels against household chores and traditions.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Ooru Peru Bhairavakona', genre: 'Fantasy, Thriller', genres: ['fantasy', 'thriller'], language: 'telugu', release_year: 2024, rating: 6.5, description: 'A man enters a mysterious village from which no one returns.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Prathinidhi 2', genre: 'Political, Thriller', genres: ['political', 'thriller'], language: 'telugu', release_year: 2024, rating: 6.2, description: 'A journalist questions the ethics of modern politics.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Manamey', genre: 'Romance, Drama', genres: ['romance', 'drama'], language: 'telugu', release_year: 2024, rating: 6.8, description: 'A story about parenting and companionship.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Purushottamudu', genre: 'Family, Drama', genres: ['family', 'drama'], language: 'telugu', release_year: 2024, rating: 5.7, description: 'A wealthy heir lives as a common man to prove himself.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Committee Kurrollu', genre: 'Drama', genres: ['drama'], language: 'telugu', release_year: 2024, rating: 7.7, description: 'Nostalgic journey of childhood friends in a village.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Saranga Dariya', genre: 'Drama', genres: ['drama'], language: 'telugu', release_year: 2024, rating: 6.4, description: 'A middle-class father fights for his children’s future.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Bharateeyudu 2 (Telugu)', genre: 'Action, Vigilante', genres: ['action', 'drama'], language: 'telugu', release_year: 2024, rating: 5.5, description: 'Senapathy returns to cleanse the system of corruption.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Shivrayan', genre: 'Action, History', genres: ['action', 'history'], language: 'telugu', release_year: 2026, rating: 8.4, description: 'The epic life of a legendary warrior king.', source: '🔵 Amazon Prime', type: 'movie' }
  ];

  const malayalamData = [
    { title: 'Manjummel Boys', genre: 'Survival, Thriller', genres: ['survival', 'thriller', 'drama'], language: 'malayalam', release_year: 2024, rating: 8.6, description: 'A group of friends face a life-and-death situation at Guna Caves.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Aavesham', genre: 'Action, Comedy', genres: ['action', 'comedy'], language: 'malayalam', release_year: 2024, rating: 7.9, description: 'Three students seek the help of a local gangster to settle a score.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Bramayugam', genre: 'Horror, Thriller', genres: ['horror', 'thriller', 'period'], language: 'malayalam', release_year: 2024, rating: 7.8, description: 'A folklore singer escapes slavery only to find himself in a cursed mansion.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Premalu', genre: 'Romance, Comedy', genres: ['romance', 'comedy'], language: 'malayalam', release_year: 2024, rating: 7.9, description: 'A young man falls for a girl in Hyderabad and navigates the hilarity of love.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Goat Life (Aadujeevitham)', genre: 'Survival, Drama', genres: ['drama', 'adventure'], language: 'malayalam', release_year: 2024, rating: 8.2, description: 'The real-life ordeal of an immigrant forced into slavery in a desert.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Kishkindha Kaandam', genre: 'Mystery, Drama', genres: ['mystery', 'drama'], language: 'malayalam', release_year: 2024, rating: 8.4, description: 'A retired soldier discovers a missing firearm that unravels family secrets.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Varshangalkku Shesham', genre: 'Musical, Drama', genres: ['musical', 'drama'], language: 'malayalam', release_year: 2024, rating: 6.9, description: 'Two friends travel to Madras in the 70s to become movie stars.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Turbo', genre: 'Action, Comedy', genres: ['action', 'comedy'], language: 'malayalam', release_year: 2024, rating: 6.2, description: 'A man moves to Chennai only to get embroiled in high-octane gang wars.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Guruvayoor Ambalanadayil', genre: 'Comedy, Drama', genres: ['comedy', 'family'], language: 'malayalam', release_year: 2024, rating: 7.0, description: 'The chaotic events surrounding a wedding at the Guruvayoor temple.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Ozler', genre: 'Crime, Thriller', genres: ['crime', 'thriller', 'mystery'], language: 'malayalam', release_year: 2024, rating: 6.8, description: 'A veteran police officer investigates a series of serial killings.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Kerala Crime Files S2', genre: 'Crime, Mystery', genres: ['crime', 'mystery'], language: 'malayalam', release_year: 2025, rating: 8.0, description: 'SI Manoj leads another intense investigation into deep-rooted crimes.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Pharma', genre: 'Medical, Thriller', genres: ['thriller', 'drama'], language: 'malayalam', release_year: 2025, rating: 7.8, description: 'A medical representative uncovers a massive corporate medical scam.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Kammattam', genre: 'Crime, Mystery', genres: ['crime', 'mystery'], language: 'malayalam', release_year: 2025, rating: 7.4, description: 'An investigation into a suspicious accidental death reveals a scam.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'The Chronicles of the 4.5 Gang', genre: 'Comedy, Crime', genres: ['comedy', 'crime'], language: 'malayalam', release_year: 2025, rating: 7.9, description: 'The chaotic lives of a gang of friends in Thiruvananthapuram.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Inspection Bungalow', genre: 'Horror, Comedy', genres: ['horror', 'comedy'], language: 'malayalam', release_year: 2025, rating: 7.1, description: 'Kerala’s first horror-comedy series set in an old government bungalow.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Love Under Construction', genre: 'Comedy, Slice-of-life', genres: ['comedy', 'drama'], language: 'malayalam', release_year: 2025, rating: 7.7, description: 'A witty look at middle-class struggles during a house build.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: '1000 Babies', genre: 'Thriller, Mystery', genres: ['thriller', 'mystery'], language: 'malayalam', release_year: 2024, rating: 8.2, description: 'A dark mystery surrounding a nursery and deep-seated secrets.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Jai Mahendran', genre: 'Political, Comedy', genres: ['politics', 'comedy'], language: 'malayalam', release_year: 2024, rating: 7.3, description: 'The life of a petty officer navigating the red tape of local politics.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Marco', genre: 'Action, Crime', genres: ['action', 'crime'], language: 'malayalam', release_year: 2025, rating: 7.5, description: 'A brutal revenge story centering on a ruthless gangster.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Identity', genre: 'Thriller, Mystery', genres: ['thriller', 'mystery'], language: 'malayalam', release_year: 2025, rating: 7.6, description: 'A high-stakes thriller where multiple identities collide.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Empuraan (L2)', genre: 'Action, Crime', genres: ['action', 'crime', 'politics'], language: 'malayalam', release_year: 2025, rating: 9.2, description: 'The legend of Stephen Nedumpally returns in this Lucifer sequel.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Barroz', genre: 'Fantasy, Adventure', genres: ['fantasy', 'adventure'], language: 'malayalam', release_year: 2025, rating: 8.0, description: 'A 400-year-old guardian of Vasco da Gama’s treasure protects it.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Kathanar: The Wild Sorcerer', genre: 'Fantasy, Horror', genres: ['fantasy', 'horror'], language: 'malayalam', release_year: 2025, rating: 8.8, description: 'The legend of a sorcerer who fights against dark magical entities.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Bilal', genre: 'Action, Crime', genres: ['action', 'crime'], language: 'malayalam', release_year: 2026, rating: 9.0, description: 'Big B returns for another round of high-octane action in Kochi.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Varanasi (Malayalam)', genre: 'Adventure, Sci-Fi', genres: ['adventure', 'sci-fi'], language: 'malayalam', release_year: 2027, rating: 9.1, description: 'A globe-trotting expedition to Antarctica to uncover ancient secrets.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Minnal Murali 2', genre: 'Superhero, Action', genres: ['action', 'sci-fi'], language: 'malayalam', release_year: 2026, rating: 8.5, description: 'The local superhero faces a cosmic threat to his village.', source: '🔴 Netflix', type: 'movie' },
    { title: 'The Bluff (Malayalam)', genre: 'Action, Period', genres: ['action', 'period'], language: 'malayalam', release_year: 2026, rating: 7.4, description: 'A former pirate mother protects her family in the 19th-century Caribbean.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Munthiri Monchan', genre: 'Romance, Musical', genres: ['romance', 'musical'], language: 'malayalam', release_year: 2025, rating: 6.8, description: 'A musical journey of two lovers separated by time.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Eko', genre: 'Mystery, Thriller', genres: ['mystery', 'thriller'], language: 'malayalam', release_year: 2025, rating: 7.2, description: 'A gripping mystery centered around psychological phenomena.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Flask', genre: 'Comedy, Drama', genres: ['comedy', 'drama'], language: 'malayalam', release_year: 2025, rating: 7.0, description: 'A policeman harbors dreams of becoming a professional singer.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: '2018: Everyone is a Hero', genre: 'Disaster, Drama', genres: ['drama', 'thriller'], language: 'malayalam', release_year: 2023, rating: 8.4, description: 'The collective effort of Keralites during the devastating 2018 floods.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Nanpakal Nerathu Mayakkam', genre: 'Drama, Surreal', genres: ['drama', 'fantasy'], language: 'malayalam', release_year: 2023, rating: 7.9, description: 'A group of travelers gets stuck in a village where time feels different.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Kaathal: The Core', genre: 'Social Drama', genres: ['drama', 'social'], language: 'malayalam', release_year: 2023, rating: 8.1, description: 'A poignant study of personal identity within a marriage.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Kannur Squad', genre: 'Crime, Procedural', genres: ['crime', 'action'], language: 'malayalam', release_year: 2023, rating: 7.7, description: 'A team of detectives goes on a cross-country chase for outlaws.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Romancham', genre: 'Horror, Comedy', genres: ['horror', 'comedy'], language: 'malayalam', release_year: 2023, rating: 7.5, description: 'Roommates playing with a Ouija board accidentally summon a spirit.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Iratta', genre: 'Thriller, Crime', genres: ['thriller', 'crime'], language: 'malayalam', release_year: 2023, rating: 8.2, description: 'An investigation into the death of a cop uncovers a dark twin secret.', source: '🔴 Netflix', type: 'movie' },
    { title: 'RDX', genre: 'Action, Thriller', genres: ['action', 'thriller'], language: 'malayalam', release_year: 2023, rating: 7.1, description: 'Three martial artists take revenge for an attack on their family.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Falimy', genre: 'Family, Comedy', genres: ['family', 'comedy'], language: 'malayalam', release_year: 2023, rating: 7.4, description: 'A dysfunctional family embarks on a journey to Varanasi.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Pookkaalam', genre: 'Family, Drama', genres: ['family', 'drama'], language: 'malayalam', release_year: 2023, rating: 7.8, description: 'Secrets of a decades-old marriage unravel during a gathering.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Purusha Pretham', genre: 'Police, Satire', genres: ['comedy', 'crime'], language: 'malayalam', release_year: 2023, rating: 7.2, description: 'The accidental case of a missing body in a police station.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Manorathangal', genre: 'Anthology, Drama', genres: ['drama', 'literature'], language: 'malayalam', release_year: 2024, rating: 8.5, description: 'Short stories of MT Vasudevan Nair brought to life by top actors.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Fingertip', genre: 'Social, Thriller', genres: ['thriller', 'social'], language: 'malayalam', release_year: 2023, rating: 7.6, description: 'Stories exploring the dark side of social media usage.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Bhram', genre: 'Psychological, Thriller', genres: ['thriller', 'mystery'], language: 'malayalam', release_year: 2023, rating: 7.3, description: 'Ghosts of the past haunt a woman during a village stay.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Secret Stories: Roslin', genre: 'Psychological, Mystery', genres: ['mystery', 'thriller'], language: 'malayalam', release_year: 2026, rating: 7.8, description: 'A teenager is plagued by nightmares of a mysterious green-eyed man.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'All We Imagine As Light', genre: 'Drama', genres: ['drama'], language: 'malayalam', release_year: 2025, rating: 8.3, description: 'A transformative journey of two nurses after an unexpected gift.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'I Am Kathalan', genre: 'Crime, Thriller', genres: ['crime', 'thriller'], language: 'malayalam', release_year: 2025, rating: 6.7, description: 'A silly digital prank turns into a dangerous game of revenge.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Sookshmadarshini', genre: 'Black Comedy, Mystery', genres: ['comedy', 'mystery'], language: 'malayalam', release_year: 2025, rating: 7.9, description: 'A black comedy centered on a woman returning to her roots.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Mura', genre: 'Heist, Action', genres: ['action', 'heist'], language: 'malayalam', release_year: 2025, rating: 7.4, description: 'Four friends attempt a heist that leads to devastating outcomes.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Bougainvillea', genre: 'Psychological Thriller', genres: ['thriller', 'mystery'], language: 'malayalam', release_year: 2024, rating: 7.5, description: 'A missing person’s case leads to hidden secrets in a family.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Raveendra Nee Evide?', genre: 'Comedy, Chaos', genres: ['comedy'], language: 'malayalam', release_year: 2025, rating: 6.8, description: 'Suburban chaos ensues after a scientist meets his neighbor.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Thallumaala', genre: 'Action, Comedy', genres: ['action', 'comedy'], language: 'malayalam', release_year: 2022, rating: 7.1, description: 'A chain of brawls across a wedding and local spots.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Nna Thaan Case Kodu', genre: 'Satire, Drama', genres: ['comedy', 'law'], language: 'malayalam', release_year: 2022, rating: 7.7, description: 'A common man sues a minister over a pothole.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Jaya Jaya Jaya Jaya Hey', genre: 'Satire, Comedy', genres: ['comedy', 'social'], language: 'malayalam', release_year: 2022, rating: 7.8, description: 'A housewife takes a martial arts approach to domestic issues.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Minnal Murali', genre: 'Superhero, Drama', genres: ['action', 'fantasy'], language: 'malayalam', release_year: 2021, rating: 7.8, description: 'A tailor gets powers from a lightning strike.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Drishyam 2', genre: 'Crime, Mystery', genres: ['crime', 'thriller'], language: 'malayalam', release_year: 2021, rating: 8.4, description: 'Georgekutty protects his family again after 6 years.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Palthu Janwar', genre: 'Comedy, Drama', genres: ['comedy', 'drama'], language: 'malayalam', release_year: 2022, rating: 6.9, description: 'A man moves to a hill station as a livestock inspector.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Mukundan Unni Associates', genre: 'Dark Comedy', genres: ['comedy', 'crime'], language: 'malayalam', release_year: 2022, rating: 8.0, description: 'A ruthless lawyer stops at nothing for success.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Saudi Vellakka', genre: 'Legal Drama', genres: ['drama', 'legal'], language: 'malayalam', release_year: 2022, rating: 7.6, description: 'A tiny incident takes decades to resolve in court.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Kurup', genre: 'Biopic, Crime', genres: ['crime', 'drama'], language: 'malayalam', release_year: 2021, rating: 7.0, description: 'The story of Kerala’s most wanted fugitive.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Hridayam', genre: 'Romance, Musical', genres: ['romance', 'musical'], language: 'malayalam', release_year: 2022, rating: 8.1, description: 'A nostalgic journey of a man through his college years.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Antakshari', genre: 'Thriller, Mystery', genres: ['thriller', 'mystery'], language: 'malayalam', release_year: 2022, rating: 6.8, description: 'A cop solves a mystery through the game of songs.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Pada', genre: 'Political Drama', genres: ['drama', 'history'], language: 'malayalam', release_year: 2022, rating: 7.8, description: 'Four activists take a collector hostage for tribal rights.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Bheeshma Parvam', genre: 'Action, Crime', genres: ['action', 'crime'], language: 'malayalam', release_year: 2022, rating: 7.7, description: 'A patriarch of a family handles internal threats and rivalries.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Night Drive', genre: 'Thriller, Mystery', genres: ['thriller', 'mystery'], language: 'malayalam', release_year: 2022, rating: 6.5, description: 'A couple gets involved in a hit-and-run investigation.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Kaduva', genre: 'Action, Period', genres: ['action', 'drama'], language: 'malayalam', release_year: 2022, rating: 6.2, description: 'A rubber planter fights against a rogue police officer.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Paappan', genre: 'Crime, Thriller', genres: ['crime', 'thriller'], language: 'malayalam', release_year: 2022, rating: 6.9, description: 'A retired cop investigates a series of murders with his daughter.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Ariyippu', genre: 'Social Drama', genres: ['drama'], language: 'malayalam', release_year: 2022, rating: 6.7, description: 'A couple in a factory finds their relationship tested by a video.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Chuzhal', genre: 'Mystery, Thriller', genres: ['mystery', 'thriller'], language: 'malayalam', release_year: 2021, rating: 5.4, description: 'Five friends stay at a hill station and face supernatural events.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Thirteen Days', genre: 'Action, Thriller', genres: ['action', 'thriller'], language: 'malayalam', release_year: 2025, rating: 7.5, description: 'A time-bound thriller involving high-stakes kidnapping.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Blindfold', genre: 'Crime, Mystery', genres: ['crime', 'mystery'], language: 'malayalam', release_year: 2025, rating: 7.2, description: 'A blind witness helps solve a baffling serial crime.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Master Peace', genre: 'Family, Comedy', genres: ['comedy', 'family'], language: 'malayalam', release_year: 2023, rating: 7.5, description: 'Chaotic parents try to fix their daughter’s life.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Perilloor Premier League', genre: 'Comedy, Drama', genres: ['comedy', 'drama'], language: 'malayalam', release_year: 2024, rating: 7.8, description: 'A village’s life changes during a local election.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Nagendrans Honeymoons', genre: 'Comedy', genres: ['comedy'], language: 'malayalam', release_year: 2024, rating: 6.6, description: 'A man marries multiple women to get money for travel.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Madhuvidhu', genre: 'Comedy, Anthology', genres: ['comedy', 'drama'], language: 'malayalam', release_year: 2024, rating: 7.0, description: 'Honeymoon stories with hilarious twists.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Soul Stories', genre: 'Drama', genres: ['drama'], language: 'malayalam', release_year: 2024, rating: 8.1, description: 'Poignant life stories of individuals in Kerala.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Pan Indian Sundari', genre: 'Comedy, Action', genres: ['comedy', 'action'], language: 'malayalam', release_year: 2024, rating: 6.2, description: 'A woman tries to prove herself in a male-dominated town.', source: '🔵 Amazon Prime', type: 'tv show' },
    { title: 'Chatha Pacha', genre: 'Horror, Mystery', genres: ['horror', 'mystery'], language: 'malayalam', release_year: 2026, rating: 7.3, description: 'A survival horror in the deep woods of Idukki.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Sarvam Maya', genre: 'Fantasy, Drama', genres: ['fantasy', 'drama'], language: 'malayalam', release_year: 2026, rating: 7.9, description: 'A magical realist story about a village with unique rules.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Paathirathri', genre: 'Thriller', genres: ['thriller'], language: 'malayalam', release_year: 2026, rating: 7.5, description: 'A night patrol team encounters something unexpected.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Secret Stories: Roslin', genre: 'Psychological, Thriller', genres: ['thriller', 'mystery'], language: 'malayalam', release_year: 2026, rating: 7.8, description: 'A troubled teenager faces recurring nightmares of a killer.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Accused', genre: 'Psychological, Drama', genres: ['drama', 'thriller'], language: 'malayalam', release_year: 2026, rating: 8.0, description: 'A doctor struggles to prove her innocence after a scandal.', source: '🔴 Netflix', type: 'movie' },
    { title: 'The Bluff', genre: 'Action, Adventure', genres: ['action', 'adventure'], language: 'malayalam', release_year: 2026, rating: 7.4, description: 'A high-seas pirate adventure with heavy action.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Varanasi', genre: 'Adventure, Sci-Fi', genres: ['adventure', 'sci-fi'], language: 'malayalam', release_year: 2027, rating: 9.1, description: 'A globetrotting mission involving time travel and Antarctica.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Love and War (Malayalam)', genre: 'History, Romance', genres: ['history', 'romance'], language: 'malayalam', release_year: 2027, rating: 8.5, description: 'A massive historical romance set in wartime Kerala.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Ponman', genre: 'Drama', genres: ['drama'], language: 'malayalam', release_year: 2025, rating: 7.6, description: 'A technically brilliant film about human connections.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Gumasthan', genre: 'Crime, Drama', genres: ['crime', 'drama'], language: 'malayalam', release_year: 2024, rating: 6.9, description: 'The life and trials of a court clerk.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Flask', genre: 'Comedy', genres: ['comedy'], language: 'malayalam', release_year: 2025, rating: 7.0, description: 'A constable accidentally gets popular on social media.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Lokah Chapter 1', genre: 'Superhero, Fantasy', genres: ['fantasy', 'action'], language: 'malayalam', release_year: 2025, rating: 8.2, description: 'A young woman discovers mystical abilities.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Raveendra Nee Evide', genre: 'Comedy', genres: ['comedy'], language: 'malayalam', release_year: 2025, rating: 6.8, description: 'Suburban chaos after a scientist moves house.', source: '🔵 Amazon Prime', type: 'movie' },
    { title: 'Coupling', genre: 'Romance, Drama', genres: ['romance', 'drama'], language: 'malayalam', release_year: 2025, rating: 7.1, description: 'A love-triangle story exploring modern relationships.', source: '🔵 Amazon Prime', type: 'tv show' }
  ];

  const kannadaData = [
    { title: 'Kantara: Chapter 1', genre: 'Period, Action, Folklore', genres: ['action', 'drama'], language: 'kannada', release_year: 2025, rating: 9.2, description: 'The prequel to the folklore sensation, exploring the origins of the Panjurli deity.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Bagheera', genre: 'Superhero, Action', genres: ['action', 'vigilante'], language: 'kannada', release_year: 2024, rating: 7.8, description: 'A police officer moonlights as a vigilante to deliver justice.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Bhairathi Ranagal', genre: 'Action, Crime', genres: ['action', 'crime', 'drama'], language: 'kannada', release_year: 2024, rating: 8.1, description: 'A prequel/sequel to Mufti, focusing on the rise of the iconic don.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Su From So', genre: 'Comedy, Drama', genres: ['comedy', 'drama'], language: 'kannada', release_year: 2025, rating: 8.4, description: 'A light-hearted story of a youth from South Karnataka navigating life.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Max', genre: 'Action, Thriller', genres: ['action', 'thriller'], language: 'kannada', release_year: 2024, rating: 7.5, description: 'Kichcha Sudeep stars as a fierce cop handling a high-stakes investigation.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Richard Anthony', genre: 'Action, Mystery', genres: ['crime', 'mystery'], language: 'kannada', release_year: 2025, rating: 8.7, description: 'The return of the mysterious character from Ulidavaru Kandanthe.', source: '🔴 Netflix', type: 'movie' },
    { title: 'UI', genre: 'Surreal, Drama', genres: ['experimental', 'drama'], language: 'kannada', release_year: 2025, rating: 8.0, description: 'Upendra’s visionary take on society and human consciousness.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Martin', genre: 'Action, Thriller', genres: ['action', 'adventure'], language: 'kannada', release_year: 2024, rating: 6.2, description: 'A high-octane action journey across borders.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Kotee', genre: 'Drama, Action', genres: ['drama', 'action'], language: 'kannada', release_year: 2024, rating: 7.3, description: 'Dhananjaya plays a common man fighting for his family’s integrity.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Bachelor Party', genre: 'Comedy, Adventure', genres: ['comedy', 'adventure'], language: 'kannada', release_year: 2024, rating: 7.0, description: 'A chaotic road trip involving three friends.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Sapta Sagaradaache Ello (Side A)', genre: 'Romance, Drama', genres: ['romance', 'drama'], language: 'kannada', release_year: 2023, rating: 8.9, description: 'A poetic story of love and destiny separated by walls.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Sapta Sagaradaache Ello (Side B)', genre: 'Drama, Action', genres: ['drama', 'romance'], language: 'kannada', release_year: 2023, rating: 8.6, description: 'The intense aftermath and search for redemption.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Kaatera', genre: 'Action, Drama', genres: ['drama', 'action'], language: 'kannada', release_year: 2023, rating: 8.4, description: 'Based on real-life agrarian struggles in the 70s.', source: '🟡 Zee5', type: 'movie' },
    { title: 'SSE Side B', genre: 'Drama', genres: ['drama'], language: 'kannada', release_year: 2023, rating: 8.5, description: 'Continuation of Manu and Priya’s journey.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Hostel Hudugaru Bekagiddare', genre: 'Comedy', genres: ['comedy', 'experimental'], language: 'kannada', release_year: 2023, rating: 8.2, description: 'A chaotic night in a boys hostel captured in one night.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Ghost', genre: 'Action, Heist', genres: ['action', 'thriller'], language: 'kannada', release_year: 2023, rating: 7.6, description: 'A prison heist led by a mysterious man.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Tagaru Palya', genre: 'Comedy, Drama', genres: ['drama', 'comedy'], language: 'kannada', release_year: 2023, rating: 7.4, description: 'A village feast turns into a comedy of errors.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Toby', genre: 'Action, Drama', genres: ['action', 'drama'], language: 'kannada', release_year: 2023, rating: 7.9, description: 'An outcast transforms into a beast for his loved ones.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Daredevil Musthafa', genre: 'Comedy, Drama', genres: ['drama', 'comedy'], language: 'kannada', release_year: 2023, rating: 8.3, description: 'Based on KP Tejaswi’s short story about communal harmony.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Hondisi Bareyiri', genre: 'Drama', genres: ['drama', 'slice-of-life'], language: 'kannada', release_year: 2023, rating: 8.0, description: 'A story of college friends reuniting after years.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'KGF: Chapter 2', genre: 'Action, Crime', genres: ['action', 'crime'], language: 'kannada', release_year: 2022, rating: 8.3, description: 'Rocky assumes control of KGF while facing the government.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Kantara', genre: 'Folklore, Thriller', genres: ['action', 'drama', 'thriller'], language: 'kannada', release_year: 2022, rating: 8.7, description: 'A clash between humans and nature involving local deities.', source: '🔵 Prime Video', type: 'movie' },
    { title: '777 Charlie', genre: 'Adventure, Drama', genres: ['adventure', 'drama'], language: 'kannada', release_year: 2022, rating: 8.8, description: 'The life-changing journey of a lonely man and a dog.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Vikrant Rona', genre: 'Fantasy, Mystery', genres: ['action', 'mystery'], language: 'kannada', release_year: 2022, rating: 7.2, description: 'An inspector investigates mysterious disappearances in a haunted village.', source: '🟡 Zee5', type: 'movie' },
    { title: 'James', genre: 'Action', genres: ['action'], language: 'kannada', release_year: 2022, rating: 7.5, description: 'A security agent battles a drug mafia.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Galipata 2', genre: 'Comedy, Drama', genres: ['comedy', 'romance'], language: 'kannada', release_year: 2022, rating: 7.1, description: 'Three friends travel to Europe to find their teacher.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Love Mocktail 2', genre: 'Romance, Comedy', genres: ['romance', 'comedy'], language: 'kannada', release_year: 2022, rating: 7.8, description: 'Adi struggles to move on after Nidhi’s death.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Monsoon Raaga', genre: 'Romance, Drama', genres: ['romance', 'drama'], language: 'kannada', release_year: 2022, rating: 6.9, description: 'Stories of love across different age groups.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Lucky Man', genre: 'Fantasy, Comedy', genres: ['comedy', 'fantasy'], language: 'kannada', release_year: 2022, rating: 7.4, description: 'A man gets a second chance at his marriage with God’s help.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Guru Shishyaru', genre: 'Sports, Comedy', genres: ['comedy', 'sports'], language: 'kannada', release_year: 2022, rating: 7.6, description: 'A Kho-Kho coach leads a group of rowdy students.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Garuda Gamana Vrishabha Vahana', genre: 'Crime, Drama', genres: ['crime', 'drama'], language: 'kannada', release_year: 2021, rating: 8.4, description: 'A brutal tale of ego and power in Mangalore.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Dia', genre: 'Romance, Drama', genres: ['romance', 'drama'], language: 'kannada', release_year: 2020, rating: 8.2, description: 'A heartbreaking story of introverted love.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Badava Rascal', genre: 'Comedy, Action', genres: ['comedy', 'drama'], language: 'kannada', release_year: 2021, rating: 7.2, description: 'A common man caught in a web of local politics and love.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Rathnan Prapancha', genre: 'Comedy, Drama', genres: ['comedy', 'drama'], language: 'kannada', release_year: 2021, rating: 8.0, description: 'A travel agent discovers his real roots.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Puaan: Chapter 1', genre: 'Drama', genres: ['drama'], language: 'kannada', release_year: 2021, rating: 7.5, description: 'A survival drama set in a forest.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Salaga', genre: 'Action, Crime', genres: ['action', 'crime'], language: 'kannada', release_year: 2021, rating: 7.0, description: 'Duniya Vijay’s directorial debut on underworld life.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Roberrt', genre: 'Action, Thriller', genres: ['action', 'thriller'], language: 'kannada', release_year: 2021, rating: 7.4, description: 'A man with a dual identity seeks revenge.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Yuvarathnaa', genre: 'Action, Drama', genres: ['action', 'drama'], language: 'kannada', release_year: 2021, rating: 7.7, description: 'Fighting against the privatization of education.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Act 1978', genre: 'Social, Thriller', genres: ['thriller', 'drama'], language: 'kannada', release_year: 2020, rating: 7.9, description: 'A pregnant woman takes a government office hostage.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Love Mocktail', genre: 'Romance, Drama', genres: ['romance', 'drama'], language: 'kannada', release_year: 2020, rating: 8.2, description: 'Adi goes on a journey down memory lane.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Humble Politiciann Nograj', genre: 'Comedy, Political', genres: ['comedy', 'political'], language: 'kannada', release_year: 2022, rating: 7.5, description: 'The satirical journey of Nograj to become CM.', source: '🔵 Prime Video', type: 'series' },
    { title: 'Crime Stories: India Detectives', genre: 'Documentary, Crime', genres: ['crime', 'docuseries'], language: 'kannada', release_year: 2021, rating: 7.8, description: 'Real-life cases handled by Bengaluru Police.', source: '🔴 Netflix', type: 'series' },
    { title: 'Ekam', genre: 'Anthology, Drama', genres: ['drama', 'anthology'], language: 'kannada', release_year: 2024, rating: 8.3, description: 'Seven stories capturing the essence of coastal Karnataka.', source: '🟢 Ekam.life', type: 'series' },
    { title: 'Loose Connection', genre: 'Comedy, Romance', genres: ['comedy', 'romance'], language: 'kannada', release_year: 2020, rating: 7.1, description: 'Short web series exploring modern relationships.', source: '🔴 YouTube', type: 'series' },
    { title: 'Kyaabre', genre: 'Comedy', genres: ['comedy'], language: 'kannada', release_year: 2022, rating: 7.6, description: 'A group of friends navigating life in Bengaluru.', source: '🔴 YouTube', type: 'series' },
    { title: 'Navarasa', genre: 'Anthology', genres: ['drama'], language: 'kannada', release_year: 2021, rating: 7.0, description: 'Kannada segments in the multi-language anthology.', source: '🔴 Netflix', type: 'series' },
    { title: 'Beast of Bangalore', genre: 'True Crime', genres: ['crime', 'documentary'], language: 'kannada', release_year: 2022, rating: 7.2, description: 'The story of a serial killer who terrorized the city.', source: '🔴 Netflix', type: 'series' },
    { title: 'The Great Indian Kitchen', genre: 'Drama', genres: ['drama'], language: 'kannada', release_year: 2023, rating: 7.9, description: 'Kannada adaptation of the social drama.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Kousalya Supraja Rama', genre: 'Drama, Romance', genres: ['drama', 'romance'], language: 'kannada', release_year: 2023, rating: 7.8, description: 'A man deals with his deep-rooted male ego.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Swathi Mutthina Male Haniye', genre: 'Romance, Drama', genres: ['romance', 'drama'], language: 'kannada', release_year: 2023, rating: 7.4, description: 'A soul-stirring story about life and letting go.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Baanadariyalli', genre: 'Adventure, Romance', genres: ['adventure', 'romance'], language: 'kannada', release_year: 2023, rating: 7.0, description: 'A journey into the heart of African wildlife.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Garadi', genre: 'Action, Drama', genres: ['action', 'drama'], language: 'kannada', release_year: 2023, rating: 6.8, description: 'A story centered around traditional wrestling pits.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Gowli', genre: 'Action, Thriller', genres: ['action', 'thriller'], language: 'kannada', release_year: 2023, rating: 7.2, description: 'A tribesman fights to protect his family from the law.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Shivaji Surathkal 2', genre: 'Mystery, Thriller', genres: ['mystery', 'thriller'], language: 'kannada', release_year: 2023, rating: 7.5, description: 'The detective returns to solve a serial murder case.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Orchestra Mysuru', genre: 'Drama, Musical', genres: ['drama', 'musical'], language: 'kannada', release_year: 2023, rating: 7.3, description: 'An aspiring singer’s struggle in Mysore.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Aachar & Co', genre: 'Comedy, Family', genres: ['comedy', 'family'], language: 'kannada', release_year: 2023, rating: 7.7, description: 'Life in a 1960s Bengaluru household.', source: '🔵 Prime Video', type: 'movie' },
    { title: '13', genre: 'Action, Thriller', genres: ['action', 'thriller'], language: 'kannada', release_year: 2023, rating: 6.5, description: 'A suspense thriller involving a police investigation.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Kranti', genre: 'Action, Drama', genres: ['action', 'drama'], language: 'kannada', release_year: 2023, rating: 6.9, description: 'Darshan stars as a man saving government schools.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Head Bush', genre: 'Action, Bio-Pic', genres: ['action', 'crime'], language: 'kannada', release_year: 2022, rating: 6.8, description: 'The rise of Bengaluru’s first underworld don.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Vedha', genre: 'Action, Drama', genres: ['action', 'drama'], language: 'kannada', release_year: 2022, rating: 7.6, description: 'Shiva Rajkumar’s 125th film about social justice.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Raymo', genre: 'Romance, Musical', genres: ['romance', 'musical'], language: 'kannada', release_year: 2022, rating: 6.5, description: 'A rockstar’s turbulent love life.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Banaras', genre: 'Romance, Sci-Fi', genres: ['romance', 'scifi'], language: 'kannada', release_year: 2022, rating: 7.1, description: 'A time-loop romance set in Varanasi.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Buddies', genre: 'Drama, Youth', genres: ['drama'], language: 'kannada', release_year: 2022, rating: 6.4, description: 'A story of deep friendship in college.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Thurthu Nirgamana', genre: 'Fantasy, Comedy', genres: ['fantasy', 'comedy'], language: 'kannada', release_year: 2022, rating: 7.8, description: 'A man gets to relive the last 3 days of his life.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Wheelchair Romeo', genre: 'Comedy, Drama', genres: ['comedy', 'drama'], language: 'kannada', release_year: 2022, rating: 7.4, description: 'A romantic comedy about a person on a wheelchair.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Old Monk', genre: 'Comedy, Romance', genres: ['comedy', 'romance'], language: 'kannada', release_year: 2022, rating: 7.0, description: 'A cursed Narada reborn on Earth to find love.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Avatara Purusha', genre: 'Fantasy, Comedy', genres: ['fantasy', 'comedy'], language: 'kannada', release_year: 2022, rating: 6.7, description: 'Black magic and comedy meet in this saga.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Sakutumba Sametha', genre: 'Family, Comedy', genres: ['family', 'comedy'], language: 'kannada', release_year: 2022, rating: 7.5, description: 'The chaos of an Indian wedding engagement.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Yellow Gangs', genre: 'Crime, Thriller', genres: ['crime', 'thriller'], language: 'kannada', release_year: 2022, rating: 7.3, description: 'A drug deal gone wrong involving multiple gangs.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Mundina Nildana', genre: 'Drama, Romance', genres: ['drama', 'romance'], language: 'kannada', release_year: 2020, rating: 7.6, description: 'Three people on different paths in life.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Popcorn Devi Kitty', genre: 'Crime, Drama', genres: ['crime', 'drama'], language: 'kannada', release_year: 2020, rating: 7.2, description: 'The dark side of the underworld through Popcorn Monkey Tiger.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Gentleman', genre: 'Action, Mystery', genres: ['action', 'mystery'], language: 'kannada', release_year: 2020, rating: 7.8, description: 'A man with sleeping sickness fights a child trafficking ring.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Shivaji Surathkal', genre: 'Mystery', genres: ['mystery'], language: 'kannada', release_year: 2020, rating: 8.0, description: 'Solving a murder in a secluded resort.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Ikkat', genre: 'Comedy', genres: ['comedy'], language: 'kannada', release_year: 2021, rating: 6.8, description: 'A couple stuck in lockdown while filing for divorce.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'French Biriyani', genre: 'Comedy', genres: ['comedy'], language: 'kannada', release_year: 2020, rating: 6.5, description: 'An auto driver and a foreigner in Bengaluru.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Bheemasena Nalamaharaja', genre: 'Family, Drama', genres: ['family', 'drama'], language: 'kannada', release_year: 2020, rating: 7.3, description: 'A chef uses food to heal a broken family.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Rider', genre: 'Action, Romance', genres: ['action', 'romance'], language: 'kannada', release_year: 2021, rating: 6.9, description: 'An orphan searches for his childhood sweetheart.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Bhajarangi 2', genre: 'Fantasy, Action', genres: ['fantasy', 'action'], language: 'kannada', release_year: 2021, rating: 6.2, description: 'A supernatural battle between good and evil.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Kotigobba 3', genre: 'Action, Thriller', genres: ['action', 'thriller'], language: 'kannada', release_year: 2021, rating: 6.5, description: 'Ghost/Shiva robs the rich across the world.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Puksatte Lifu', genre: 'Comedy, Drama', genres: ['comedy', 'drama'], language: 'kannada', release_year: 2021, rating: 7.9, description: 'A key maker gets into trouble with the police.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Hero', genre: 'Action, Comedy', genres: ['action', 'comedy'], language: 'kannada', release_year: 2021, rating: 7.4, description: 'A barber tries to rescue his ex from a gangster.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Maduveya Mamatheya Kareyole', genre: 'Romance, Family', genres: ['romance', 'family'], language: 'kannada', release_year: 2021, rating: 6.6, description: 'Family drama surrounding a marriage.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Nanna Prakara', genre: 'Mystery', genres: ['mystery'], language: 'kannada', release_year: 2020, rating: 6.8, description: 'Three parallel stories connected by a murder.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Inspector Vikram', genre: 'Action, Comedy', genres: ['action', 'comedy'], language: 'kannada', release_year: 2021, rating: 6.4, description: 'A quirky cop solves a drug case.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Arishadvarga', genre: 'Thriller', genres: ['thriller'], language: 'kannada', release_year: 2020, rating: 7.5, description: 'A story of greed, lust, and murder.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Dharani Mandala Madhyadolage', genre: 'Crime, Thriller', genres: ['crime', 'thriller'], language: 'kannada', release_year: 2022, rating: 7.2, description: 'Multiple lives intersect in Bengaluru city.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Man of the Match', genre: 'Comedy, Drama', genres: ['comedy', 'experimental'], language: 'kannada', release_year: 2022, rating: 7.0, description: 'A director conducts a chaotic audition.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Raajakumara', genre: 'Drama, Action', genres: ['drama', 'family'], language: 'kannada', release_year: 2017, rating: 8.2, description: 'The standard for modern Kannada family dramas (Classic).', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Mayabazar 2016', genre: 'Comedy, Crime', genres: ['comedy', 'crime'], language: 'kannada', release_year: 2020, rating: 7.6, description: 'A scam during the demonetization period.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Krishna Talkies', genre: 'Horror, Mystery', genres: ['horror', 'mystery'], language: 'kannada', release_year: 2021, rating: 6.7, description: 'Mysterious deaths in a cinema hall.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Roberrt', genre: 'Action', genres: ['action'], language: 'kannada', release_year: 2021, rating: 7.4, description: 'Mass entertainer featuring Darshan.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Mugulu Nage', genre: 'Romance', genres: ['romance'], language: 'kannada', release_year: 2021, rating: 6.8, description: 'A man who never cries searches for love.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Pogaru', genre: 'Action', genres: ['action'], language: 'kannada', release_year: 2021, rating: 5.5, description: 'A rogue becomes a hero for his local people.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Babru', genre: 'Road Trip', genres: ['drama'], language: 'kannada', release_year: 2020, rating: 7.3, description: 'A road trip across the USA in a car named Babru.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Ranganayaki', genre: 'Social Drama', genres: ['drama'], language: 'kannada', release_year: 2020, rating: 7.1, description: 'A victim’s fight for dignity after a sexual assault.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Gentleman', genre: 'Action', genres: ['action'], language: 'kannada', release_year: 2020, rating: 7.7, description: 'Highlighting the issue of human trafficking.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Shokiwala', genre: 'Comedy, Romance', genres: ['comedy', 'romance'], language: 'kannada', release_year: 2022, rating: 6.1, description: 'A rural youth tries to win over his lady love.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Family Pack', genre: 'Comedy, Fantasy', genres: ['comedy', 'fantasy'], language: 'kannada', release_year: 2022, rating: 5.8, description: 'A ghost intervenes in a human’s love life.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'One Cut Two Cut', genre: 'Comedy, Satire', genres: ['comedy', 'satire'], language: 'kannada', release_year: 2022, rating: 6.4, description: 'An arts teacher stuck in a hostage situation.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'The Devil', genre: 'Action, Crime', genres: ['action', 'crime'], language: 'kannada', release_year: 2025, rating: 7.7, description: 'Darshan plays a menacing underworld figure.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Mark', genre: 'Action, Thriller', genres: ['action', 'thriller'], language: 'kannada', release_year: 2025, rating: 7.2, description: 'A suspended cop returns to clear his name.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Gatha Vaibhava', genre: 'Fantasy, Drama', genres: ['fantasy', 'drama'], language: 'kannada', release_year: 2025, rating: 8.1, description: 'A visual spectacle weaving mythology with modern life.', source: '🟡 Zee5', type: 'movie' }
  ];

  console.log(`Total Kannada Titles: ${kannadaData.length}`);

  const hindiData = [
    { title: 'Border 2', genre: 'War, Action', genres: ['action', 'drama', 'war'], language: 'hindi', release_year: 2026, rating: 8.8, description: 'A massive sequel revisiting the valor of Indian soldiers on the battlefield.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'The Ba***ds of Bollywood', genre: 'Satire, Drama', genres: ['satire', 'drama'], language: 'hindi', release_year: 2025, rating: 8.2, description: 'Aryan Khan’s directorial debut exploring the dark underbelly of stardom.', source: '🔴 Netflix', type: 'series' },
    { title: 'Saiyaara', genre: 'Romance, Musical', genres: ['romance', 'musical'], language: 'hindi', release_year: 2025, rating: 7.9, description: 'A soulful journey of two lovers across different cultural landscapes.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'Black Warrant', genre: 'Crime, Jail-Drama', genres: ['crime', 'drama'], language: 'hindi', release_year: 2025, rating: 8.5, description: 'Based on the memoirs of a Tihar jailer, depicting life inside Asia’s largest prison.', source: '🔵 Prime Video', type: 'series' },
    { title: 'Chhaava', genre: 'Historical, Action', genres: ['action', 'history'], language: 'hindi', release_year: 2025, rating: 8.9, description: 'The epic saga of Chhatrapati Sambhaji Maharaj and his resistance against the Mughals.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'Panchayat Season 4', genre: 'Comedy, Rural', genres: ['comedy', 'drama'], language: 'hindi', release_year: 2025, rating: 9.1, description: 'Abhishek Tripathi navigates the high-stakes village elections in Phulera.', source: '🔵 Prime Video', type: 'series' },
    { title: 'War 2', genre: 'Action, Spy', genres: ['action', 'thriller'], language: 'hindi', release_year: 2025, rating: 8.0, description: 'Major Kabir faces a new lethal adversary in the YRF Spy Universe.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'The Family Man Season 3', genre: 'Espionage, Action', genres: ['action', 'comedy', 'thriller'], language: 'hindi', release_year: 2025, rating: 9.3, description: 'Srikant Tiwari heads to the Northeast to tackle a biological warfare threat.', source: '🔵 Prime Video', type: 'series' },
    { title: 'Stree 2', genre: 'Horror, Comedy', genres: ['horror', 'comedy'], language: 'hindi', release_year: 2024, rating: 8.4, description: 'The town of Chanderi is haunted again, this time by a headless entity.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Heeramandi: The Diamond Bazaar', genre: 'Period Drama', genres: ['drama', 'history'], language: 'hindi', release_year: 2024, rating: 7.1, description: 'The lives of courtesans in pre-independence Lahore.', source: '🔴 Netflix', type: 'series' },
    { title: 'Jawan', genre: 'Action, Social', genres: ['action', 'thriller'], language: 'hindi', release_year: 2023, rating: 7.5, description: 'A man driven by a personal vendetta to rectify the wrongs in society.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Pathaan', genre: 'Action, Spy', genres: ['action', 'thriller'], language: 'hindi', release_year: 2023, rating: 6.9, description: 'An exiled RAW agent returns to stop a private terror group.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Farzi', genre: 'Crime, Thriller', genres: ['crime', 'drama'], language: 'hindi', release_year: 2023, rating: 8.4, description: 'A brilliant small-time artist creates the ultimate counterfeit note.', source: '🔵 Prime Video', type: 'series' },
    { title: 'Animal', genre: 'Action, Crime', genres: ['action', 'crime', 'drama'], language: 'hindi', release_year: 2023, rating: 6.6, description: 'A son’s violent obsession with his father’s approval.', source: '🔴 Netflix', type: 'movie' },
    { title: '12th Fail', genre: 'Biography, Drama', genres: ['biography', 'drama'], language: 'hindi', release_year: 2023, rating: 9.0, description: 'The inspiring true story of Manoj Kumar Sharma’s journey to becoming an IPS officer.', source: '🟠 Disney+ Hotstar', type: 'movie' },
    { title: 'Kohrra', genre: 'Mystery, Noir', genres: ['mystery', 'crime'], language: 'hindi', release_year: 2023, rating: 7.6, description: 'A murder investigation in the foggy fields of Punjab.', source: '🔴 Netflix', type: 'series' },
    { title: 'The Railway Men', genre: 'Historical Drama', genres: ['drama', 'thriller'], language: 'hindi', release_year: 2023, rating: 8.5, description: 'Unsung heroes who saved lives during the Bhopal Gas Tragedy.', source: '🔴 Netflix', type: 'series' },
    { title: 'Dunki', genre: 'Comedy, Drama', genres: ['comedy', 'drama'], language: 'hindi', release_year: 2023, rating: 7.0, description: 'A group of friends use an illegal backdoor entry to reach London.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Asur Season 2', genre: 'Psychological Thriller', genres: ['thriller', 'mystery'], language: 'hindi', release_year: 2023, rating: 8.6, description: 'Mythology meets forensic science in a battle against a digital demon.', source: '🟣 JioCinema', type: 'series' },
    { title: 'Scoop', genre: 'Journalism, Crime', genres: ['drama', 'biography'], language: 'hindi', release_year: 2023, rating: 7.7, description: 'A journalist’s struggle for justice after being accused of a colleague\'s murder.', source: '🔴 Netflix', type: 'series' },
    { title: 'RRR (Hindi)', genre: 'Action, Epic', genres: ['action', 'drama'], language: 'hindi', release_year: 2022, rating: 7.8, description: 'A fictional tale of two revolutionaries fighting the British Raj.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Brahmastra Part One: Shiva', genre: 'Fantasy, Action', genres: ['fantasy', 'adventure'], language: 'hindi', release_year: 2022, rating: 5.6, description: 'A young man discovers he is the wielder of the Agnyastra.', source: '🟠 Disney+ Hotstar', type: 'movie' },
    { title: 'Delhi Crime Season 2', genre: 'Police Procedural', genres: ['crime', 'drama'], language: 'hindi', release_year: 2022, rating: 8.7, description: 'Vartika Chaturvedi hunts the brutal Kachcha-Baniyan gang.', source: '🔴 Netflix', type: 'series' },
    { title: 'Rocket Boys', genre: 'Biography, Science', genres: ['biography', 'history'], language: 'hindi', release_year: 2022, rating: 8.9, description: 'The story of Homi Bhabha and Vikram Sarabhai building India’s space program.', source: '🔵 SonyLIV', type: 'series' },
    { title: 'Gangubai Kathiawadi', genre: 'Biography, Crime', genres: ['drama', 'crime'], language: 'hindi', release_year: 2022, rating: 7.8, description: 'The rise of a young girl to the queen of Kamathipura.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Monica, O My Darling', genre: 'Neo-noir, Comedy', genres: ['comedy', 'thriller'], language: 'hindi', release_year: 2022, rating: 7.4, description: 'A robotic expert gets entangled in a murder plot.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Shershaah', genre: 'War, Biography', genres: ['action', 'biography', 'war'], language: 'hindi', release_year: 2021, rating: 8.3, description: 'The life of Captain Vikram Batra during the Kargil War.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Sardar Udham', genre: 'Historical, Drama', genres: ['biography', 'history'], language: 'hindi', release_year: 2021, rating: 8.4, description: 'A revolutionary’s mission to assassinate the man behind Jallianwala Bagh.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Aarya Season 2', genre: 'Crime, Thriller', genres: ['action', 'crime'], language: 'hindi', release_year: 2021, rating: 7.8, description: 'A woman transforms into a mafia don to protect her family.', source: '🟠 Disney+ Hotstar', type: 'series' },
    { title: 'Mimi', genre: 'Comedy, Drama', genres: ['comedy', 'drama'], language: 'hindi', release_year: 2021, rating: 7.9, description: 'A small-town girl becomes a surrogate for a foreign couple.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Scam 1992', genre: 'Financial, Crime', genres: ['biography', 'crime'], language: 'hindi', release_year: 2020, rating: 9.3, description: 'The meteoric rise and fall of Harshad Mehta.', source: '🔵 SonyLIV', type: 'series' },
    { title: 'Mirzapur Season 2', genre: 'Crime, Action', genres: ['action', 'crime'], language: 'hindi', release_year: 2020, rating: 8.4, description: 'The fight for the throne of Mirzapur intensifies.', source: '🔵 Prime Video', type: 'series' },
    { title: 'Paatal Lok', genre: 'Crime, Thriller', genres: ['crime', 'mystery'], language: 'hindi', release_year: 2020, rating: 8.1, description: 'A cynical cop investigates an assassination attempt on a journalist.', source: '🔵 Prime Video', type: 'series' },
    { title: 'Ludo', genre: 'Anthology, Comedy', genres: ['comedy', 'crime'], language: 'hindi', release_year: 2020, rating: 7.6, description: 'Four different stories overlap in a game of fate.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Dil Bechara', genre: 'Romance, Drama', genres: ['romance', 'drama'], language: 'hindi', release_year: 2020, rating: 7.9, description: 'Two cancer patients find love and adventure.', source: '🟠 Disney+ Hotstar', type: 'movie' },
    { title: 'Gullak Season 4', genre: 'Family, Comedy', genres: ['comedy', 'drama'], language: 'hindi', release_year: 2024, rating: 9.1, description: 'The Mishra family deals with new middle-class milestones.', source: '🔵 SonyLIV', type: 'series' },
    { title: 'Khakee: The Bengal Chapter', genre: 'Crime, Action', genres: ['action', 'crime'], language: 'hindi', release_year: 2025, rating: 8.3, description: 'Police battle organized crime in the heart of Bengal.', source: '🔴 Netflix', type: 'series' },
    { title: 'Maharani Season 4', genre: 'Political Drama', genres: ['drama', 'political'], language: 'hindi', release_year: 2025, rating: 7.9, description: 'Rani Bharti faces her toughest political battle yet.', source: '🔵 SonyLIV', type: 'series' },
    { title: 'The Taj Story', genre: 'Courtroom Drama', genres: ['drama', 'mystery'], language: 'hindi', release_year: 2025, rating: 6.8, description: 'A guide challenges the established history of the Taj Mahal.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Jewel Thief', genre: 'Heist, Mystery', genres: ['action', 'mystery'], language: 'hindi', release_year: 2025, rating: 7.4, description: 'A slick heist movie starring Saif Ali Khan.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Special Ops Season 2', genre: 'Spy, Thriller', genres: ['action', 'thriller'], language: 'hindi', release_year: 2025, rating: 8.7, description: 'Himmat Singh returns for another high-stakes mission.', source: '🟠 Disney+ Hotstar', type: 'series' },
    { title: 'Criminal Justice 4', genre: 'Legal Drama', genres: ['drama', 'mystery'], language: 'hindi', release_year: 2025, rating: 8.2, description: 'Madhav Mishra takes on a complex family murder case.', source: '🟠 Disney+ Hotstar', type: 'series' },
    { title: 'Khauf', genre: 'Horror, Thriller', genres: ['horror', 'thriller'], language: 'hindi', release_year: 2025, rating: 7.5, description: 'Supernatural events plague a women\'s hostel in Delhi.', source: '🔵 Prime Video', type: 'series' },
    { title: 'Mandala Murders', genre: 'Mystery, Crime', genres: ['crime', 'mystery'], language: 'hindi', release_year: 2025, rating: 7.2, description: 'Detectives track a serial killer leaving occult symbols.', source: '🔴 Netflix', type: 'series' },
    { title: 'Single Papa', genre: 'Comedy, Family', genres: ['comedy', 'drama'], language: 'hindi', release_year: 2025, rating: 7.7, description: 'A lighthearted look at a man raising his daughter alone.', source: '🔴 Netflix', type: 'series' },
    { title: 'Kull', genre: 'Drama', genres: ['drama'], language: 'hindi', release_year: 2025, rating: 8.1, description: 'A cinematic exploration of ancestral roots and modern conflicts.', source: '🟠 Disney+ Hotstar', type: 'series' },
    { title: 'Bhakshak', genre: 'Crime, Social', genres: ['crime', 'drama'], language: 'hindi', release_year: 2024, rating: 7.3, description: 'A journalist exposes a shelter home abuse scandal.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Amar Singh Chamkila', genre: 'Musical, Bio-Pic', genres: ['biography', 'musical'], language: 'hindi', release_year: 2024, rating: 8.0, description: 'The life and death of Punjab\'s highest record-selling artist.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Maidaan', genre: 'Sports, Biography', genres: ['sports', 'drama'], language: 'hindi', release_year: 2024, rating: 8.2, description: 'The golden era of Indian football under coach Syed Abdul Rahim.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Kill', genre: 'Action, Thriller', genres: ['action', 'thriller'], language: 'hindi', release_year: 2024, rating: 7.6, description: 'Ultra-violent action set entirely on a moving train.', source: '🟠 Disney+ Hotstar', type: 'movie' },
    { title: 'Munjya', genre: 'Horror, Comedy', genres: ['horror', 'comedy'], language: 'hindi', release_year: 2024, rating: 7.1, description: 'A young man is haunted by a spirit wanting to marry.', source: '🟠 Disney+ Hotstar', type: 'movie' },
    { title: 'Fighter', genre: 'Action, Aerial', genres: ['action', 'war'], language: 'hindi', release_year: 2024, rating: 6.4, description: 'Air Force pilots face a cross-border terror threat.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Kalki 2898 AD (Hindi)', genre: 'Sci-Fi, Epic', genres: ['scifi', 'action'], language: 'hindi', release_year: 2024, rating: 7.6, description: 'Modern avatar of Vishnu descends to Earth to protect the world.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Tiger 3', genre: 'Action, Spy', genres: ['action', 'spy'], language: 'hindi', release_year: 2023, rating: 6.7, description: 'Tiger and Zoya must save their family and country.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Merry Christmas', genre: 'Mystery, Thriller', genres: ['mystery', 'thriller'], language: 'hindi', release_year: 2024, rating: 7.1, description: 'A fateful Christmas Eve encounter leads to a dark mystery.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Dahaad', genre: 'Crime, Mystery', genres: ['crime', 'drama'], language: 'hindi', release_year: 2023, rating: 7.6, description: 'A cop investigates a series of mysterious deaths in public toilets.', source: '🔵 Prime Video', type: 'series' },
    { title: 'Jubilee', genre: 'Drama, Period', genres: ['drama', 'history'], language: 'hindi', release_year: 2023, rating: 8.3, description: 'The golden age of Bollywood and the price of stardom.', source: '🔵 Prime Video', type: 'series' },
    { title: 'Bambai Meri Jaan', genre: 'Crime, Drama', genres: ['crime', 'action'], language: 'hindi', release_year: 2023, rating: 7.5, description: 'A father-son duo on opposite sides of the law in old Bombay.', source: '🔵 Prime Video', type: 'series' },
    { title: 'Guns & Gulaabs', genre: 'Comedy, Crime', genres: ['comedy', 'crime'], language: 'hindi', release_year: 2023, rating: 7.7, description: 'A nostalgic trip into 90s pulp and crime.', source: '🔴 Netflix', type: 'series' },
    { title: 'Trial by Fire', genre: 'Drama, Social', genres: ['drama', 'history'], language: 'hindi', release_year: 2023, rating: 7.8, description: 'A couple\'s decades-long fight for justice after the Uphaar fire.', source: '🔴 Netflix', type: 'series' },
    { title: 'Adhura', genre: 'Horror, Mystery', genres: ['horror', 'thriller'], language: 'hindi', release_year: 2023, rating: 6.6, description: 'A school reunion brings back dark secrets and ghosts.', source: '🔵 Prime Video', type: 'series' },
    { title: 'The Night Manager', genre: 'Spy Thriller', genres: ['action', 'mystery'], language: 'hindi', release_year: 2023, rating: 7.6, description: 'An ex-soldier infiltrates an arms dealer’s inner circle.', source: '🟠 Disney+ Hotstar', type: 'series' },
    { title: 'Kaala Paani', genre: 'Survival Thriller', genres: ['drama', 'thriller'], language: 'hindi', release_year: 2023, rating: 8.0, description: 'A mysterious disease hits the Andaman and Nicobar Islands.', source: '🔴 Netflix', type: 'series' },
    { title: 'Rocky Aur Rani Kii Prem Kahaani', genre: 'Romance, Drama', genres: ['romance', 'comedy'], language: 'hindi', release_year: 2023, rating: 6.8, description: 'Two families from different cultures try to blend.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Brahmayugam (Hindi)', genre: 'Horror, Period', genres: ['horror', 'mystery'], language: 'hindi', release_year: 2024, rating: 8.0, description: 'A folk horror tale set in a mysterious mansion.', source: '🔵 SonyLIV', type: 'movie' },
    { title: 'Suzhal (Hindi)', genre: 'Crime, Mystery', genres: ['crime', 'mystery'], language: 'hindi', release_year: 2022, rating: 8.2, description: 'Investigation into a missing person reveals town secrets.', source: '🔵 Prime Video', type: 'series' },
    { title: 'Darlings', genre: 'Dark Comedy', genres: ['comedy', 'drama'], language: 'hindi', release_year: 2022, rating: 6.6, description: 'A wife takes revenge on her abusive husband.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Qala', genre: 'Musical Drama', genres: ['drama', 'musical'], language: 'hindi', release_year: 2022, rating: 7.2, description: 'A singer\'s struggle with fame and her mother\'s coldness.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Guilty Minds', genre: 'Legal Drama', genres: ['drama'], language: 'hindi', release_year: 2022, rating: 8.1, description: 'A series focusing on complex legal battles in Delhi.', source: '🔵 Prime Video', type: 'series' },
    { title: 'Haseen Dillruba', genre: 'Romance, Thriller', genres: ['romance', 'mystery'], language: 'hindi', release_year: 2021, rating: 6.9, description: 'A woman is suspect in her husband\'s murder.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Meenakshi Sundareshwar', genre: 'Romance, Comedy', genres: ['romance', 'comedy'], language: 'hindi', release_year: 2021, rating: 7.0, description: 'A newlywed couple deals with long-distance marriage.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Ray', genre: 'Anthology', genres: ['drama', 'mystery'], language: 'hindi', release_year: 2021, rating: 7.1, description: 'Stories based on the works of Satyajit Ray.', source: '🔴 Netflix', type: 'series' },
    { title: 'Grahan', genre: 'Drama, History', genres: ['drama', 'mystery'], language: 'hindi', release_year: 2021, rating: 8.3, description: 'Two timelines connected by a 1984 riot and a modern case.', source: '🟠 Disney+ Hotstar', type: 'series' },
    { title: 'Tabbar', genre: 'Crime Drama', genres: ['crime', 'drama'], language: 'hindi', release_year: 2021, rating: 8.2, description: 'A family goes to extreme lengths to protect their own.', source: '🔵 SonyLIV', type: 'series' },
    { title: 'Human', genre: 'Medical Thriller', genres: ['drama', 'thriller'], language: 'hindi', release_year: 2022, rating: 7.7, description: 'Dark secrets behind medical drug trials.', source: '🟠 Disney+ Hotstar', type: 'series' },
    { title: 'Aranyak', genre: 'Crime Thriller', genres: ['crime', 'mystery'], language: 'hindi', release_year: 2021, rating: 7.8, description: 'Two cops hunt a killer in a mist-filled mountain town.', source: '🔴 Netflix', type: 'series' },
    { title: 'Thar', genre: 'Western, Thriller', genres: ['action', 'thriller'], language: 'hindi', release_year: 2022, rating: 7.0, description: 'An antique dealer moves to a desert town for work.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Gehraiyaan', genre: 'Romance, Drama', genres: ['romance', 'drama'], language: 'hindi', release_year: 2022, rating: 5.9, description: 'Modern relationships and infidelity in urban India.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'A Thursday', genre: 'Thriller', genres: ['thriller', 'drama'], language: 'hindi', release_year: 2022, rating: 7.7, description: 'A playschool teacher takes children hostage.', source: '🟠 Disney+ Hotstar', type: 'movie' },
    { title: 'Dasvi', genre: 'Comedy, Drama', genres: ['comedy', 'political'], language: 'hindi', release_year: 2022, rating: 7.3, description: 'A politician decides to give his 10th grade exam from prison.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Jalsa', genre: 'Drama, Thriller', genres: ['drama', 'thriller'], language: 'hindi', release_year: 2022, rating: 6.9, description: 'A hit-and-run case connects two women from different backgrounds.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Bhool Bhulaiyaa 2', genre: 'Horror, Comedy', genres: ['horror', 'comedy'], language: 'hindi', release_year: 2022, rating: 6.8, description: 'The return of the spirit Manjulika.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Pippa', genre: 'War, Drama', genres: ['action', 'war'], language: 'hindi', release_year: 2023, rating: 7.0, description: 'The 1971 battle that liberated Bangladesh.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Mastiii 4', genre: 'Comedy', genres: ['comedy'], language: 'hindi', release_year: 2025, rating: 5.2, description: 'The latest installment in the adult-comedy franchise.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'Raid 2', genre: 'Action, Crime', genres: ['action', 'crime'], language: 'hindi', release_year: 2025, rating: 7.8, description: 'IRS officer Amay Patnaik conducts a high-profile raid.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'Gustaakh Ishq', genre: 'Romance', genres: ['romance', 'drama'], language: 'hindi', release_year: 2025, rating: 7.1, description: 'A story of obsessive love and consequences.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Tere Ishk Mein', genre: 'Romance, Action', genres: ['romance', 'action'], language: 'hindi', release_year: 2025, rating: 8.0, description: 'Dhanush returns to Hindi cinema with a fierce love story.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'Aashiqui 3', genre: 'Romance, Musical', genres: ['romance', 'musical'], language: 'hindi', release_year: 2025, rating: 7.5, description: 'A new generation of musicians faces love and loss.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'Housefull 5', genre: 'Comedy', genres: ['comedy'], language: 'hindi', release_year: 2025, rating: 6.0, description: 'The ensemble cast returns for another chaotic holiday.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'Jolly LLB 3', genre: 'Courtroom Comedy', genres: ['comedy', 'legal'], language: 'hindi', release_year: 2025, rating: 8.2, description: 'The two Jollys face off in a massive court battle.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'Baaghi 4', genre: 'Action', genres: ['action'], language: 'hindi', release_year: 2025, rating: 6.5, description: 'Ronnie returns for his most dangerous mission yet.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'Son of Sardaar 2', genre: 'Comedy, Action', genres: ['comedy', 'action'], language: 'hindi', release_year: 2025, rating: 6.2, description: 'High-energy comedy set in rural Punjab.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'Dhadak 2', genre: 'Romance, Drama', genres: ['romance', 'drama'], language: 'hindi', release_year: 2025, rating: 7.0, description: 'Addressing caste and class barriers in modern love.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Bhool Chuk Maaf', genre: 'Comedy', genres: ['comedy'], language: 'hindi', release_year: 2025, rating: 7.3, description: 'A comedy of errors involving a fake identity.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Sky Force', genre: 'Action, Aerial', genres: ['action', 'war'], language: 'hindi', release_year: 2025, rating: 7.9, description: 'India’s first aerial combat mission in the 1960s.', source: '🟠 JioHotstar', type: 'movie' },
    { title: 'Fateh', genre: 'Cyber-Thriller', genres: ['action', 'thriller'], language: 'hindi', release_year: 2025, rating: 7.4, description: 'A common man takes on a global cyber-crime syndicate.', source: '🟡 Zee5', type: 'movie' },
    { title: 'Chhorii 2', genre: 'Horror', genres: ['horror'], language: 'hindi', release_year: 2025, rating: 7.6, description: 'The sequel to the folk horror tale about female infanticide.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Dhoom Dhaam', genre: 'Action Comedy', genres: ['action', 'comedy'], language: 'hindi', release_year: 2025, rating: 7.1, description: 'A fast-paced heist across the streets of Mumbai.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Sikandar', genre: 'Action, Drama', genres: ['action', 'drama'], language: 'hindi', release_year: 2025, rating: 8.5, description: 'Salman Khan stars in a high-octane mass entertainer.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'Toxic', genre: 'Action, Crime', genres: ['action', 'crime'], language: 'hindi', release_year: 2026, rating: 8.9, description: 'A massive cross-over film featuring Yash in the lead.', source: '🎬 Theatrical', type: 'movie' }
  ];

  console.log(`Total Hindi Titles: ${hindiData.length}`);

  const englishData = [
    { title: 'Avatar: Fire and Ash', genre: 'Sci-Fi, Adventure', genres: ['scifi', 'adventure'], language: 'english', release_year: 2025, rating: 9.0, description: 'Jake Sully faces a new aggressive tribe of Na’vi known as the Ash People.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'Superman', genre: 'Superhero, Action', genres: ['action', 'superhero'], language: 'english', release_year: 2025, rating: 8.8, description: 'James Gunn’s reboot of the Man of Steel, focusing on his journey to reconcile his heritage.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'Stranger Things 5', genre: 'Sci-Fi, Horror', genres: ['horror', 'scifi', 'drama'], language: 'english', release_year: 2025, rating: 9.4, description: 'The final battle for Hawkins as the gang takes on Vecna in the Upside Down.', source: '🔴 Netflix', type: 'series' },
    { title: 'The Batman Part II', genre: 'Crime, Mystery', genres: ['action', 'crime'], language: 'english', release_year: 2026, rating: 9.1, description: 'Bruce Wayne delves deeper into the corruption of Gotham’s elite.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'Mickey 17', genre: 'Sci-Fi, Thriller', genres: ['scifi', 'thriller'], language: 'english', release_year: 2025, rating: 8.4, description: 'An "expendable" employee on an ice world refuses to let his replacement take his life.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'The Last of Us Season 2', genre: 'Drama, Post-Apocalyptic', genres: ['drama', 'thriller'], language: 'english', release_year: 2025, rating: 9.2, description: 'Ellie seeks revenge after a violent event disrupts her life in Jackson.', source: 'HBO Max', type: 'series' },
    { title: 'Jurassic World Rebirth', genre: 'Action, Adventure', genres: ['action', 'scifi'], language: 'english', release_year: 2025, rating: 7.5, description: 'A new era of humans and dinosaurs co-existing in a fragile world.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'Thunderbolts*', genre: 'Action, Superhero', genres: ['action', 'superhero'], language: 'english', release_year: 2025, rating: 7.8, description: 'A group of reformed villains are sent on a government mission.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'Fantastic Four: First Steps', genre: 'Superhero, Sci-Fi', genres: ['action', 'adventure'], language: 'english', release_year: 2025, rating: 8.3, description: 'Marvel’s First Family enters the MCU in a retro-futuristic 1960s setting.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'Mission: Impossible – Dead Reckoning Part 2', genre: 'Action, Spy', genres: ['action', 'thriller'], language: 'english', release_year: 2025, rating: 8.9, description: 'Ethan Hunt continues his hunt for The Entity in the ultimate endgame.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'Dune: Part Two', genre: 'Sci-Fi, Epic', genres: ['scifi', 'drama', 'action'], language: 'english', release_year: 2024, rating: 8.9, description: 'Paul Atreides unites with the Fremen to get revenge against the conspirators.', source: '🔵 Max', type: 'movie' },
    { title: 'Deadpool & Wolverine', genre: 'Action, Comedy', genres: ['action', 'comedy', 'superhero'], language: 'english', release_year: 2024, rating: 7.9, description: 'The Merc with a Mouth teams up with a grumpy Logan to save the multiverse.', source: '🟠 Disney+', type: 'movie' },
    { title: 'Furiosa: A Mad Max Saga', genre: 'Action, Sci-Fi', genres: ['action', 'adventure'], language: 'english', release_year: 2024, rating: 7.6, description: 'The origin story of renegade warrior Furiosa before she teamed up with Mad Max.', source: '🔵 Max', type: 'movie' },
    { title: 'Gladiator II', genre: 'Action, History', genres: ['action', 'drama'], language: 'english', release_year: 2024, rating: 7.4, description: 'Lucius, the nephew of Commodus, enters the Colosseum years after Maximus.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'Joker: Folie à Deux', genre: 'Drama, Musical', genres: ['drama', 'crime'], language: 'english', release_year: 2024, rating: 5.3, description: 'Arthur Fleck meets the love of his life while awaiting trial at Arkham.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'The Bear Season 3', genre: 'Drama, Comedy', genres: ['drama', 'comedy'], language: 'english', release_year: 2024, rating: 8.6, description: 'Carmy and his crew push themselves to achieve Michelin-star perfection.', source: '🟢 Hulu', type: 'series' },
    { title: 'Shōgun', genre: 'Historical, Drama', genres: ['drama', 'history'], language: 'english', release_year: 2024, rating: 8.7, description: 'The collision of two ambitious men and a mysterious female samurai in 1600 Japan.', source: '🟠 Disney+', type: 'series' },
    { title: 'Kingdom of the Planet of the Apes', genre: 'Sci-Fi, Action', genres: ['scifi', 'action'], language: 'english', release_year: 2024, rating: 7.0, description: 'Years after Caesar, a new ape leader builds an empire while a young ape seeks freedom.', source: '🟠 Disney+', type: 'movie' },
    { title: 'Twisters', genre: 'Action, Adventure', genres: ['action', 'adventure'], language: 'english', release_year: 2024, rating: 7.1, description: 'An update to the 1996 film following storm chasers in Oklahoma.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'Fallout', genre: 'Sci-Fi, Action', genres: ['scifi', 'adventure'], language: 'english', release_year: 2024, rating: 8.4, description: 'A survivor leaves her luxury fallout vault to explore the irradiated wasteland.', source: '🔵 Prime Video', type: 'series' },
    { title: 'Oppenheimer', genre: 'Biography, Drama', genres: ['drama', 'history'], language: 'english', release_year: 2023, rating: 8.4, description: 'The story of American scientist J. Robert Oppenheimer and his role in the atomic bomb.', source: '🔵 Prime Video', type: 'movie' },
    { title: 'Barbie', genre: 'Comedy, Fantasy', genres: ['comedy', 'fantasy'], language: 'english', release_year: 2023, rating: 6.9, description: 'Barbie suffers a crisis that leads her to question her world and her existence.', source: '🔵 Max', type: 'movie' },
    { title: 'Succession Season 4', genre: 'Drama', genres: ['drama'], language: 'english', release_year: 2023, rating: 8.9, description: 'The final showdown for the Roy family as Logan prepares to sell Waystar Royco.', source: 'HBO Max', type: 'series' },
    { title: 'The Killer', genre: 'Action, Crime', genres: ['action', 'thriller'], language: 'english', release_year: 2023, rating: 6.7, description: 'An assassin begins to psychologically crack while waiting for his next target.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Spider-Man: Across the Spider-Verse', genre: 'Animation, Action', genres: ['animation', 'superhero'], language: 'english', release_year: 2023, rating: 8.6, description: 'Miles Morales catapults across the Multiverse to protect its very existence.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Beef', genre: 'Comedy, Drama', genres: ['comedy', 'drama'], language: 'english', release_year: 2023, rating: 8.0, description: 'Two strangers involve themselves in a road rage incident that consumes their lives.', source: '🔴 Netflix', type: 'series' },
    { title: 'The Last of Us', genre: 'Drama, Adventure', genres: ['drama', 'action'], language: 'english', release_year: 2023, rating: 8.8, description: 'A smuggler must escort a teenager across a post-apocalyptic US.', source: 'HBO Max', type: 'series' },
    { title: 'John Wick: Chapter 4', genre: 'Action, Thriller', genres: ['action', 'thriller'], language: 'english', release_year: 2023, rating: 7.7, description: 'John Wick uncovers a path to defeating The High Table.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'Killers of the Flower Moon', genre: 'Crime, Drama', genres: ['crime', 'history'], language: 'english', release_year: 2023, rating: 7.6, description: 'The investigation into a series of murders of the Osage people in the 1920s.', source: '🍎 Apple TV+', type: 'movie' },
    { title: 'The Morning Show Season 3', genre: 'Drama', genres: ['drama'], language: 'english', release_year: 2023, rating: 8.2, description: 'The future of the network is thrown into question when a tech titan takes interest.', source: '🍎 Apple TV+', type: 'series' },
    { title: 'Top Gun: Maverick', release_year: 2022, genre: 'Action', genres: ['action'], rating: 8.3, description: 'After thirty years, Maverick is still pushing the envelope as a top naval aviator.', source: 'Paramount+', type: 'movie' },
    { title: 'The Menu', release_year: 2022, genre: 'Horror, Comedy', genres: ['horror', 'comedy'], rating: 7.2, description: 'A young couple travels to a remote island to eat at an exclusive restaurant.', source: '🟠 Disney+', type: 'movie' },
    { title: 'Everything Everywhere All At Once', release_year: 2022, genre: 'Sci-Fi, Action', genres: ['scifi', 'action'], rating: 7.8, description: 'A Chinese-American immigrant is swept up in an insane adventure.', source: 'Showtime', type: 'movie' },
    { title: 'The Boys Season 4', release_year: 2024, genre: 'Superhero', genres: ['action', 'superhero'], rating: 8.7, description: 'The world is on the brink. Victoria Neuman is closer than ever to the Oval Office.', source: '🔵 Prime Video', type: 'series' },
    { title: 'Squid Game Season 2', release_year: 2024, genre: 'Thriller', genres: ['thriller', 'drama'], rating: 8.0, description: 'Three years after winning Squid Game, Player 456 remains determined to find the people behind it.', source: '🔴 Netflix', type: 'series' },
    { title: 'House of the Dragon Season 2', release_year: 2024, genre: 'Fantasy', genres: ['fantasy', 'drama'], rating: 8.4, description: 'Westeros is on the brink of a bloody civil war with the Green and Black Councils.', source: '🔵 Max', type: 'series' },
    { title: 'The White Lotus Season 3', release_year: 2025, genre: 'Comedy, Drama', genres: ['comedy', 'drama'], rating: 8.6, description: 'A new group of guests check into a White Lotus resort in Thailand.', source: '🔵 Max', type: 'series' },
    { title: 'Wednesday Season 2', release_year: 2025, genre: 'Mystery', genres: ['mystery', 'comedy'], rating: 8.1, description: 'Wednesday Addams continues her years as a student at Nevermore Academy.', source: '🔴 Netflix', type: 'series' },
    { title: 'Bridgerton Season 3', release_year: 2024, genre: 'Romance', genres: ['romance', 'drama'], rating: 7.4, description: 'Penelope Featherington has finally given up on her long-held crush on Colin Bridgerton.', source: '🔴 Netflix', type: 'series' },
    { title: 'Severance Season 2', release_year: 2025, genre: 'Sci-Fi', genres: ['scifi', 'thriller'], rating: 8.7, description: 'Mark leads a team of office workers whose memories have been surgically divided.', source: '🍎 Apple TV+', type: 'series' },
    { title: 'Peaky Blinders (Movie)', release_year: 2025, genre: 'Crime', genres: ['crime', 'drama'], rating: 8.5, description: 'The epic conclusion to the Shelby family saga set during WWII.', source: '🔴 Netflix', type: 'movie' },
    { title: 'Avengers: Doomsday', release_year: 2026, genre: 'Superhero', genres: ['action', 'superhero'], rating: 9.3, description: 'The Avengers face their greatest threat yet in the form of Doctor Doom.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'Blade Runner 2099', release_year: 2026, genre: 'Sci-Fi', genres: ['scifi', 'thriller'], rating: 8.5, description: 'A new chapter in the Blade Runner universe set fifty years after the sequel.', source: '🔵 Prime Video', type: 'series' },
    { title: 'The Sandman Season 2', release_year: 2025, genre: 'Fantasy', genres: ['fantasy', 'drama'], rating: 7.7, description: 'Morpheus continues his journey to rebuild his realm of Dreaming.', source: '🔴 Netflix', type: 'series' },
    { title: 'Euphoria Season 3', release_year: 2025, genre: 'Drama', genres: ['drama'], rating: 8.4, description: 'The troubled lives of high school students in East Highland continue.', source: '🔵 Max', type: 'series' },

    // --- NEW ENTRIES (101-200): 2024-2026 & ICONIC CONTENT ---
    { title: 'The Fantastic Four: First Steps', genre: 'Superhero, Sci-Fi', genres: ['action', 'superhero'], language: 'english', release_year: 2025, rating: 8.5, description: 'Marvel’s First Family faces Galactus in a retro-futuristic 1960s setting.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'Blade', genre: 'Action, Horror', genres: ['action', 'horror'], language: 'english', release_year: 2025, rating: 7.9, description: 'The daywalker Eric Brooks hunts vampires who have infiltrated the modern world.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'The White Lotus Season 3', genre: 'Drama, Comedy', genres: ['drama', 'comedy'], language: 'english', release_year: 2025, rating: 8.8, description: 'A new group of guests check into a luxury resort in Thailand, dealing with death and spirituality.', source: 'HBO Max', type: 'series' },
    { title: 'Euphoria Season 3', genre: 'Drama', genres: ['drama'], language: 'english', release_year: 2025, rating: 8.4, description: 'The characters navigate adulthood and the consequences of their high school choices.', source: 'HBO Max', type: 'series' },
    { title: 'Tron: Ares', genre: 'Sci-Fi, Action', genres: ['scifi', 'action'], language: 'english', release_year: 2025, rating: 7.6, description: 'A highly sophisticated Program, Ares, is sent from the digital world into the real world.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'The Running Man', genre: 'Sci-Fi, Thriller', genres: ['scifi', 'thriller'], language: 'english', release_year: 2025, rating: 8.1, description: 'Edgar Wright directs this faithful adaptation of the Stephen King dystopian classic.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'The Morning Show Season 4', genre: 'Drama', genres: ['drama'], language: 'english', release_year: 2025, rating: 8.0, description: 'UBA navigates a volatile election year and the rise of AI in newsrooms.', source: '🍎 Apple TV+', type: 'series' },
    { title: 'Foundation Season 3', genre: 'Sci-Fi, Drama', genres: ['scifi', 'drama'], language: 'english', release_year: 2025, rating: 8.9, description: 'The Mule becomes the primary threat to Hari Seldon’s psychohistory plan.', source: '🍎 Apple TV+', type: 'series' },
    { title: 'Beef Season 2', genre: 'Comedy, Drama', genres: ['comedy', 'drama'], language: 'english', release_year: 2025, rating: 8.2, description: 'A new feud erupts between two wealthy families in a high-stakes country club setting.', source: '🔴 Netflix', type: 'series' },
    { title: 'Peacemaker Season 2', genre: 'Action, Comedy', genres: ['action', 'comedy'], language: 'english', release_year: 2025, rating: 8.6, description: 'John Cena returns as Peacemaker in James Gunn’s new DC Universe.', source: 'HBO Max', type: 'series' },
    { title: 'Elio', genre: 'Animation, Adventure', genres: ['animation', 'adventure'], language: 'english', release_year: 2025, rating: 7.8, description: 'A young boy is mistakenly identified as the intergalactic ambassador for Earth.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'Avengers: Secret Wars', genre: 'Superhero, Epic', genres: ['action', 'superhero'], language: 'english', release_year: 2026, rating: 9.7, description: 'The culmination of the Multiverse Saga bringing together heroes from all eras.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'Star Wars: New Jedi Order', genre: 'Sci-Fi, Adventure', genres: ['scifi', 'adventure'], language: 'english', release_year: 2026, rating: 8.4, description: 'Rey Skywalker attempts to rebuild the Jedi Order fifteen years after the Rise of Skywalker.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'Supergirl: Woman of Tomorrow', genre: 'Superhero, Sci-Fi', genres: ['action', 'superhero'], language: 'english', release_year: 2026, rating: 8.7, description: 'Kara Zor-El travels across the galaxy on a gritty quest for justice.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'Wednesday Season 2', genre: 'Mystery, Fantasy', genres: ['fantasy', 'mystery'], language: 'english', release_year: 2025, rating: 8.5, description: 'Wednesday uncovers more dark secrets at Nevermore with a focus on horror over romance.', source: '🔴 Netflix', type: 'series' },
    { title: 'Black Mirror Season 7', genre: 'Sci-Fi, Anthology', genres: ['scifi', 'thriller'], language: 'english', release_year: 2025, rating: 8.3, description: 'Six new stories including a sequel to the fan-favorite USS Callister.', source: '🔴 Netflix', type: 'series' },
    { title: 'Fallout Season 2', genre: 'Sci-Fi, Adventure', genres: ['scifi', 'action'], language: 'english', release_year: 2026, rating: 8.9, description: 'Lucy and The Ghoul head toward New Vegas to find the truth behind Vault-Tec.', source: '🔵 Prime Video', type: 'series' },
    { title: 'Shōgun Season 2', genre: 'Historical, Drama', genres: ['drama', 'history'], language: 'english', release_year: 2026, rating: 9.1, description: 'Lord Toranaga consolidates power as the new Shogun of Japan.', source: '🟠 Disney+', type: 'series' },
    { title: 'Heat 2', genre: 'Crime, Action', genres: ['crime', 'action'], language: 'english', release_year: 2026, rating: 8.9, description: 'Michael Mann directs the sequel/prequel to his 1995 crime masterpiece.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'The Sandman Season 2', genre: 'Fantasy, Drama', genres: ['fantasy', 'drama'], language: 'english', release_year: 2025, rating: 8.6, description: 'Dream faces the consequences of the Season 1 finale as the Endless gather.', source: '🔴 Netflix', type: 'series' },
    { title: 'Squid Game Season 2', genre: 'Thriller, Drama', genres: ['thriller', 'drama'], language: 'english', release_year: 2024, rating: 8.8, description: 'Player 456 returns to the games with a mission to take down the organizers.', source: '🔴 Netflix', type: 'series' },
    { title: 'Gladiator III', genre: 'Action, History', genres: ['action', 'history'], language: 'english', release_year: 2026, rating: 7.5, description: 'Ridley Scott continues the Roman epic following the fallout of Lucius’s reign.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'The Night Agent Season 2', genre: 'Thriller, Action', genres: ['thriller', 'action'], language: 'english', release_year: 2025, rating: 7.8, description: 'Peter Sutherland embarks on a new high-stakes mission as a full-fledged Night Agent.', source: '🔴 Netflix', type: 'series' },
    { title: 'Andor Season 2', genre: 'Sci-Fi, Thriller', genres: ['scifi', 'action'], language: 'english', release_year: 2025, rating: 9.4, description: 'The final 4 years of Cassian Andor’s life leading directly into Rogue One.', source: '🟠 Disney+', type: 'series' },
    { title: 'One Punch Man (Live Action)', genre: 'Action, Comedy', genres: ['action', 'comedy'], language: 'english', release_year: 2026, rating: 7.2, description: 'Saitama looks for a challenge in a world full of monsters and heroes.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'Sherlock Holmes 3', genre: 'Mystery, Action', genres: ['mystery', 'action'], language: 'english', release_year: 2026, rating: 8.0, description: 'Robert Downey Jr. and Jude Law return for a final globe-trotting mystery.', source: '🎬 Theatrical', type: 'movie' },
    { title: 'Constantine 2', genre: 'Horror, Fantasy', genres: ['horror', 'fantasy'], language: 'english', release_year: 2026, rating: 7.9, description: 'Keanu Reeves returns as the supernatural detective to battle a new hellish threat.', source: '🎬 Theatrical', type: 'movie' },
    // --- AUTOMATED DATA PATTERN (201-400) ---
    ...Array.from({ length: 200 }).map((_, i) => ({
      title: `English Title ${i + 201}`,
      genre: 'Drama, Mystery',
      genres: ['drama', 'mystery'],
      language: 'english',
      release_year: 2020 + (i % 7),
      rating: parseFloat((7 + (i % 25) / 10).toFixed(1)),
      description: `A compelling story about human connection and secrets in the year ${2020 + (i % 7)}.`,
      source: i % 2 === 0 ? '🔴 Netflix' : '🔵 Prime Video',
      type: i % 3 === 0 ? 'tv show' : 'movie'
    }))
  ];

  allMovies.push(...tamilData);
  allMovies.push(...teluguData);
  allMovies.push(...malayalamData);
  allMovies.push(...kannadaData);
  allMovies.push(...hindiData);
  allMovies.push(...englishData);

  const platforms = ['🔴 Netflix', '🔵 Amazon Prime', '⚪ Disney+', '🟢 Hulu'];
  const types = ['movie', 'tv show'];
  const languages = ['english', 'hindi', 'telugu', 'malayalam', 'kannada'];
  const genresList = ['Action', 'Adventure', 'Horror', 'Comedy', 'Crime', 'Fantasy', 'Documentary', 'Drama', 'History'];

  const titleParts = {
    prefix: ['The Last', 'Secret of', 'Shadow of', 'Rise of', 'Beyond', 'Chronicles of', 'Tales of', 'Mystery of'],
    suffix: ['Empire', 'Silence', 'Justice', 'Tomorrow', 'the Unknown', 'Destiny', 'the Brave', 'Eternity'],
    indian: ['Kala', 'Mahan', 'Veera', 'Sathya', 'Raja', 'Prem', 'Agni', 'Vayu', 'Jal', 'Shakti']
  };

  const generatedData = [];
  const count = 1500;

  for (let i = 0; i < count; i++) {
    const lang = languages[Math.floor(Math.random() * languages.length)];
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const type = types[Math.floor(Math.random() * types.length)];

    // Generate realistic titles based on language
    let title = "";
    if (['hindi', 'telugu', 'malayalam', 'kannada'].includes(lang)) {
      title = `${titleParts.indian[Math.floor(Math.random() * titleParts.indian.length)]} ${titleParts.suffix[Math.floor(Math.random() * titleParts.suffix.length)]}`;
    } else {
      title = `${titleParts.prefix[Math.floor(Math.random() * titleParts.prefix.length)]} ${titleParts.suffix[Math.floor(Math.random() * titleParts.suffix.length)]}`;
    }
    title += ` ${i + 1}`; // Ensure uniqueness

    // Randomize genres (1-3 per movie)
    const numGenres = Math.floor(Math.random() * 3) + 1;
    const selectedGenres = [];
    for (let j = 0; j < numGenres; j++) {
      const g = genresList[Math.floor(Math.random() * genresList.length)];
      if (!selectedGenres.includes(g)) selectedGenres.push(g);
    }

    generatedData.push({
      title: title,
      genre: selectedGenres.join(', '),
      genres: selectedGenres.map(g => g.toLowerCase()),
      language: lang,
      release_year: Math.floor(Math.random() * (2024 - 1980 + 1)) + 1980,
      rating: parseFloat((Math.random() * (9.5 - 4.0) + 4.0).toFixed(1)),
      description: "A high-quality cinematic experience generated for testing.",
      source: platform,
      type: type,
      duration: type === 'movie' ? `${Math.floor(Math.random() * 60) + 80} min` : `${Math.floor(Math.random() * 5) + 1} Seasons`,
      director: 'Director ' + (i + 1)
    });
  }

  allMovies.push(...generatedData);
  console.log(`✅ Successfully generated ${allMovies.length} records.`);
}

/* ── Filter & search ── */
const LANG_COUNTRY_MAP = {
  hindi: ['hindi', 'bollywood', 'india'],
  english: ['united states', 'united kingdom', 'usa', 'uk', 'canada', 'australia', 'english', 'hollywood'],
  spanish: ['mexico', 'spain', 'argentina', 'colombia', 'spanish'],
  french: ['france', 'canada', 'belgium', 'french'],
  korean: ['south korea', 'korea', 'korean'],
  japanese: ['japan', 'japanese'],
  chinese: ['china', 'hong kong', 'taiwan', 'chinese'],
  tamil: ['tamil'], telugu: ['telugu', 'telegu'], malayalam: ['malayalam'],
  kannada: ['kannada']
};

function filterMovies({ genre, language, type, minRating, yearFrom, yearTo }) {
  return allMovies.filter(m => {
    const cleanType = type ? type.replace(/[^\w\s]/g, '').toLowerCase().trim() : null;
    if (cleanType && cleanType !== 'either' && cleanType !== 'both' && cleanType !== 'all') {
      const isTV = (m.type || '').toLowerCase().includes('tv') || (m.type || '').toLowerCase().includes('show') || (m.type || '').toLowerCase().includes('series') || (m.type || '').toLowerCase().includes('web');
      const wantTV = cleanType.includes('tv') || cleanType.includes('show') || cleanType.includes('series') || cleanType.includes('web');
      if (isTV !== wantTV) return false;
    }

    if (genre && genre !== 'all') {
      const searchGenre = genre.toLowerCase().trim().replace(/[^\w\s]/g, '');
      // Robust matching: check if search term is in movie genre OR movie genre is in search term
      const hasGenre = (m.genres || []).some(g => {
        const movieGenre = g.toLowerCase().trim().replace(/[^\w\s]/g, '');
        return movieGenre.includes(searchGenre) || searchGenre.includes(movieGenre);
      });
      if (!hasGenre) return false;
    }

    if (language && language !== 'all') {
      const targetLang = language.toLowerCase();
      const movieLangData = (m.language || '').toLowerCase();
      if (!movieLangData) return false;

      const mappedCountries = LANG_COUNTRY_MAP[targetLang] || [];
      // Match if the movie's language string contains the target language, 
      // or if it contains any of the mapped countries/keywords (e.g., "India" for "Hindi")
      const isMatch = movieLangData.includes(targetLang) ||
        mappedCountries.some(c => movieLangData.includes(c));

      if (!isMatch) return false;
    }

    if (minRating > 0 && (m.rating === null || m.rating < minRating)) return false;
    if (yearFrom && m.release_year && m.release_year < yearFrom) return false;
    if (yearTo && m.release_year && m.release_year > yearTo) return false;

    return true;
  });
}

function getUniqueGenres(filterLang = null) {
  const allowed = ['Action', 'Adventure', 'Horror', 'Comedy', 'Crime', 'Fantasy', 'Romance', 'Documentary', 'Drama', 'History'];
  const set = new Set();
  let movies = allMovies;

  // If a language is already selected, only show genres available for that language
  if (filterLang && filterLang.toLowerCase() !== 'any language') {
    movies = filterMovies({ language: filterLang });
  }

  movies.forEach(m => {
    if (m.genres && Array.isArray(m.genres)) {
      m.genres.forEach(g => {
        if (g) {
          const formatted = g.charAt(0).toUpperCase() + g.slice(1).toLowerCase();
          if (allowed.includes(formatted)) set.add(formatted);
        }
      });
    }
  });
  return allowed.filter(g => set.has(g));
}

function getUniqueLanguages() {
  const set = new Set();
  allMovies.forEach(m => {
    if (m.language) {
      m.language.split(',').forEach(l => {
        const clean = l.trim();
        if (clean) set.add(clean.charAt(0).toUpperCase() + clean.slice(1));
      });
    }
  });
  return Array.from(set).sort();
}

/* ── NLP-lite chat parsing ── */
function parseNLQuery(text) {
  const t = text.toLowerCase().trim();
  const filters = {};

  const genres = ['action', 'adventure', 'horror', 'comedy', 'crime', 'fantasy', 'romance', 'documentary', 'drama', 'history'];
  for (const g of genres) { if (t.includes(g)) { filters.genre = g; break; } }

  const langs = {
    english: ['english'],
    hindi: ['hindi', 'bollywood'],
    spanish: ['spanish'],
    french: ['french'],
    korean: ['korean'],
    japanese: ['japanese'],
    tamil: ['tamil'],
    telugu: ['telugu', 'telegu'],
    malayalam: ['malayalam'],
    kannada: ['kannada']
  };
  for (const [lang, keywords] of Object.entries(langs)) {
    if (keywords.some(k => t.includes(k))) { filters.language = lang; break; }
  }

  const yearMatch = t.match(/\b(19|20)\d{2}\b/g);
  if (yearMatch) { filters.yearFrom = parseInt(yearMatch[0]); filters.yearTo = parseInt(yearMatch[yearMatch.length - 1]); }

  const ratingMatch = t.match(/rated?\s+(above\s+)?(\d+(\.\d+)?)/);
  if (ratingMatch) filters.minRating = parseFloat(ratingMatch[2]);

  return filters;
}

window.filterMovies = filterMovies;
window.parseNLQuery = parseNLQuery;
window.getUniqueGenres = getUniqueGenres;
window.getUniqueLanguages = getUniqueLanguages;
window.loadDatasets = loadDatasets;
window.getAllMovies = () => allMovies;
window.allMovies = allMovies; // Ensure global access for sidebar stats