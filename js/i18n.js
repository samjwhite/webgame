// All player-facing text lives in js/text/<language>.js; code reads it through T().
const TEXTS = {};
const LANGUAGES = ["uk", "en", "it"];
const LANGUAGE_KEY = "lito-v-seli-language";

function savedLanguage() {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (LANGUAGES.includes(saved)) return saved;
  } catch (error) {
    // Remembering the language is only a convenience.
  }
  return "uk";
}

let LANG = savedLanguage();

function T() {
  return TEXTS[LANG];
}

function setLanguage(language) {
  LANG = language;
  try {
    localStorage.setItem(LANGUAGE_KEY, language);
  } catch (error) {
    // Remembering the language is only a convenience.
  }
}

// Fills page elements marked with data-text (text) or data-label (aria-label), e.g. data-text="ui.title".
function lookup(path) {
  return path.split(".").reduce((value, key) => value[key], T());
}

function applyLanguageToPage() {
  document.documentElement.lang = LANG;
  document.title = T().ui.title;
  document.querySelectorAll("[data-text]").forEach((el) => {
    el.textContent = lookup(el.dataset.text);
  });
  document.querySelectorAll("[data-label]").forEach((el) => {
    el.setAttribute("aria-label", lookup(el.dataset.label));
  });
  document.getElementById("map-image").alt = T().ui.mapAlt;
  document.querySelectorAll("[data-language]").forEach((button) => {
    button.classList.toggle("selected", button.dataset.language === LANG);
  });
}
