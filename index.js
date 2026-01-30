const OMDB_KEY = "5865c4f9";
const OMDB_URL = "https://www.omdbapi.com/";

let contrastToggle = false;

const SEED_MOVIES = [
  { title: "Blade Runner 2049", year: "2017" },
  { title: "The Lighthouse", year: "2019" },
  { title: "F1", year: "" }, 
  { title: "The Blair Witch Project", year: "1999" },
  { title: "Captain America: The Winter Soldier", year: "2014" },
  { title: "The Hangover", year: "2009" },
];

document.addEventListener("DOMContentLoaded", () => {
  seedSixCards();
  const contrastBtn = document.querySelector(".contrast-toggle");
  if (contrastBtn) {
    contrastBtn.addEventListener("click", () => {
      toggleContrast();
      contrastBtn.setAttribute("aria-pressed", String(contrastToggle));
    });
  }

  const genreSelect = document.querySelector(".results__select");
  if (genreSelect) {
    genreSelect.addEventListener("change", (event) => {
      applyGenreFilter(event.target.value);
    });
  }

  const searchForm = document.querySelector(".search");
  const searchInput = document.querySelector(".search__input");
  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      applyKeywordFilter(searchInput.value);
    });
    searchInput.addEventListener("input", () => {
      applyKeywordFilter(searchInput.value);
    });
  }
});

function toggleContrast() {
  contrastToggle = !contrastToggle;
  if (contrastToggle) {
      document.body.classList.toggle("dark-theme");
  }
  else {
   document.body.classList.remove("dark-theme")
  } 
}

async function fetchByTitle(title, year = "") {
  const url =
    `${OMDB_URL}?apikey=${OMDB_KEY}` +
    `&t=${encodeURIComponent(title)}` +
    (year ? `&y=${encodeURIComponent(year)}` : "") +
    `&plot=short`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.Response === "False") return null;
  return data;
}

function posterOrFallback(poster) {
  if (poster && poster !== "N/A") return poster;
  return "https://via.placeholder.com/600x900?text=No+Poster";
}

function safeText(value, fallback = "—") {
  return value && value !== "N/A" ? value : fallback;
}

async function seedSixCards() {
  const cards = document.querySelectorAll(".movie");
  if (cards.length < 6) {
    console.warn("Not enough .movie cards in HTML (need at least 6).");
    return;
  }

  const details = await Promise.all(
    SEED_MOVIES.map((m) => fetchByTitle(m.title, m.year))
  );

  details.forEach((movie, idx) => {
    const card = cards[idx];
    if (!card) return;

    if (!movie) {
      fillCard(card, {
        Title: SEED_MOVIES[idx].title,
        Year: "",
        Genre: "",
        Runtime: "",
        Poster: "N/A",
      });
      return;
    }

    fillCard(card, movie);
  });
}

function fillCard(cardEl, movie) {
  const img = cardEl.querySelector(".movie__img");
  const titleEl = cardEl.querySelector(".movie__title");

  const yearSpan = cardEl.querySelector(".year span");
  const genreSpan = cardEl.querySelector(".genre span");
  const runtimeSpan = cardEl.querySelector(".run-time span");

  if (img) {
    img.src = posterOrFallback(movie.Poster);
    img.alt = safeText(movie.Title, "Movie poster");
  }

  if (titleEl) titleEl.textContent = safeText(movie.Title);
  if (yearSpan) yearSpan.textContent = safeText(movie.Year);
  if (genreSpan) genreSpan.textContent = safeText(movie.Genre);
  if (runtimeSpan) runtimeSpan.textContent = safeText(movie.Runtime);

  cardEl.dataset.title = safeText(movie.Title, "");
  cardEl.dataset.genre = safeText(movie.Genre, "");
}

function applyGenreFilter(value) {
  const selected = (value || "").toLowerCase();
  const cards = document.querySelectorAll(".movie");

  cards.forEach((card) => {
    if (selected === "all") {
      card.style.display = "";
      return;
    }

    const title = (card.dataset.title || "").toLowerCase();
    const genre = (card.dataset.genre || "").toLowerCase();
    const matchesGenre = genre.includes(selected);
    const matchesComedyFallback =
      selected === "comedy" && title.includes("the hangover");

    card.style.display = matchesGenre || matchesComedyFallback ? "" : "none";
  });
}

function applyKeywordFilter(value) {
  const query = (value || "").trim().toLowerCase();
  const cards = document.querySelectorAll(".movie");

  cards.forEach((card) => {
    if (!query) {
      card.style.display = "";
      return;
    }

    const title = (card.dataset.title || "").toLowerCase();
    card.style.display = title.includes(query) ? "" : "none";
  });
}
