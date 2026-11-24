import "./registlet-card.js"; // defines <registlet-card>
import { searchRegistlets } from "./search.js";

const REGISTLET_URL = "./registlet/registlet.json";

const header = document.querySelector("header");
const form = document.querySelector("form");
const selectLevel = document.querySelector("#select-level");
const inputKeyword = document.querySelector("#input-keyword");
const results = document.querySelector(".results");
const resultCount = document.querySelector("#result-count");
const registletList = document.querySelector("#registlet-list");

async function fetchRegistletJSON(url) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Error fetching ${url}: ${res.status}`);
  }

  return res.json();
}

function addLevelToSelectBox(stoodie) {
  for (const stoodieLv of stoodie) {
    const optionLevel = document.createElement("option");
    optionLevel.value = stoodieLv.lv;
    optionLevel.textContent = `${stoodieLv.lv} - ${stoodieLv.map}`;

    selectLevel.appendChild(optionLevel);
  }
}

// Shows the given registlets and the counter. This is the only place that changes the list.
function render(registlets) {
  resultCount.textContent = `Registlet found: ${registlets.length}`;

  if (registlets.length === 0) {
    registletList.innerHTML = '<p class="not-found">NOT FOUND</p>';
    return;
  }

  const cards = registlets.map((registlet) => {
    const card = document.createElement("registlet-card");
    card.registlet = registlet;

    return card;
  });

  registletList.replaceChildren(...cards);
}

function setupSearch(registlets) {
  function search(e) {
    e.preventDefault();

    render(
      searchRegistlets(
        registlets,
        inputKeyword.value,
        Number(selectLevel.value),
      ),
    );
    results.scrollIntoView();
  }

  selectLevel.addEventListener("change", search);
  form.addEventListener("submit", search);
}

function keepHeaderHeightInCSS() {
  const update = () => {
    document.documentElement.style.setProperty(
      "--header-height",
      `${header.offsetHeight}px`,
    );
  };

  new ResizeObserver(update).observe(header);
}

// The page is built by JS, so the browser can't jump to a #slug link by itself on load.
function scrollToHash() {
  const id = location.hash.slice(1);

  if (id) {
    document.getElementById(id)?.scrollIntoView();
  }
}

async function init() {
  keepHeaderHeightInCSS();

  let registletJSON;
  try {
    registletJSON = await fetchRegistletJSON(REGISTLET_URL);
  } catch (err) {
    console.error(err);
    resultCount.textContent =
      "Failed to load the registlet data. Please try again later.";
    return;
  }

  addLevelToSelectBox(registletJSON.stoodie);
  render(registletJSON.registlet);
  scrollToHash();
  setupSearch(registletJSON.registlet);
}

init();
