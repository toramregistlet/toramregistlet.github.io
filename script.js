function display(...args) {
  const regisContainer = document.querySelector(".regis-container");

  args.forEach(element => {
    regisContainer.appendChild(element);
  });
}

function resetDisplay() {
  const regisContainer = document.querySelector(".regis-container");
  const hr = document.createElement("hr");
  regisContainer.replaceChildren();
  regisContainer.appendChild(hr);
}

function addRegisCounter(count) {
  const regisContainer = document.querySelector(".regis-container");

  if (regisContainer.firstElementChild.tagName === "P") {
    regisContainer.firstChild.remove();
  }
  
  const countPara = document.createElement("p");
  countPara.textContent = `Registlet found: ${count}`;
  regisContainer.insertBefore(countPara, regisContainer.firstChild);
}

function addLevelToSelectBox(data, element) {
  for (const stoodieLv of data) {
    const optionLevel = document.createElement("option");
    optionLevel.value = stoodieLv.lv;
    optionLevel.textContent = `${stoodieLv.lv} - ${stoodieLv.map}`;

    element.appendChild(optionLevel);
  }
}

class RegistletCard extends HTMLElement {
  set registlet(registlet) {
    const nameH2 = document.createElement("h2");
    const nameA = document.createElement("a");
    const detail = convertDetail(registlet.detail, registlet.note);
    const stdLv = document.createElement("p");
    const maxLvRarity = document.createElement("p");
    const slug = generateSlug(registlet.name);

    nameA.classList = "heading-anchor";
    nameA.href = `#${slug}`;
    nameA.id = slug;
    nameA.textContent = registlet.name;
    nameH2.append(nameA);

    stdLv.textContent = `(Lv: ${registlet.lv.join(", ")})`;
    maxLvRarity.innerHTML = `Max Level: ${registlet.max_lv}`;
    if (registlet.rarity) {
      maxLvRarity.innerHTML += `<br>Rarity: ${registlet.rarity}`;
    }

    this.replaceChildren(nameH2, stdLv, detail, maxLvRarity);
  }
}

customElements.define("registlet-card", RegistletCard);

function convertToHTML(data) {
  resetDisplay();

  if (data.length == 0) {
    const textNotFound = document.createElement("h1");
    textNotFound.textContent = "NOT FOUND";

    display(textNotFound);
    addRegisCounter(0);
    return;
  }

  for (const registlet of data) {
    const card = document.createElement("registlet-card");
    card.registlet = registlet;

    display(card);
  }

  addRegisCounter(data.length);
}

function convertDetail(string, note) {
  const arrPara = string.split("\n\n");
  const detail = document.createElement("blockquote");

  for (const detailPara of arrPara) {
    const para = document.createElement("p");

    para.innerHTML = convertMarkdown(detailPara);
    detail.appendChild(para);
  }

  if (note) {
    const para = document.createElement("p");

    para.innerHTML = `<i>Note: ${convertMarkdown(note)}</i>`;
    detail.appendChild(para);
  }

  return detail;
}

function convertMarkdown(string) {
  const regexNewLine = /\n/g;

  const cleaned = string
    .replace(regexNewLine, "<br/>");
  const codeTagged = cleaned
    .replace(/`([^`]+)`/g, '<code>$1</code>');
  const italic = codeTagged
    .replace(/\*([^\*]+)\*/g, '<i>$1</i>');

  return italic;
}

function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')  // delete all characters that aren't alphabet, white space and hyphen
    .replace(/[\s_-]+/g, '-'); // replace spaces, underscores & hyphens into 1 hyphen
}

function filterLevel(data, level) {
  return data.filter((registlet) => registlet.lv.includes(level));
}

function filterKeyword(data, keyword, level) {
  const regex = new RegExp(keyword, "i");
  let dataRegistlet = [];

  // 0 will be assumed as false (going into else)
  if (level) {
    dataRegistlet = filterLevel(data, level);
  } else {
    dataRegistlet = data;
  }

  return dataRegistlet.filter((registlet) => regex.test(registlet.name) || regex.test(registlet.detail));
}

function getFormResult(e, data, keyword, level) {
    e.preventDefault();
    const anchorResult = document.querySelector("#search-result");

    const keywordFiltered = filterKeyword(
      data,
      keyword, 
      Number(level)
    );
    convertToHTML(keywordFiltered);

    anchorResult.click();
}

function checkURLHash() {
  if (location.hash) {
    const target = document.querySelector(location.hash);

    if (target) {
      target.click();
    }
  }
}

async function fetchRegistletJSON(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();

    return data;
  } catch (err) {
    console.log("Error fetching data:", err);
  }
}

document.addEventListener("DOMContentLoaded", async (event) => {
  const registletUrl = "./registlet/registlet.json";
  const registletJSON = await fetchRegistletJSON(registletUrl);

  const searchForm = document.querySelector("form");
  const selectLevel = document.querySelector("#select-level");
  const inputKeyword = document.querySelector("#input-keyword");

  convertToHTML(registletJSON.registlet);
  addLevelToSelectBox(registletJSON.stoodie, selectLevel);
  checkURLHash();

  selectLevel.addEventListener("change", (e) => {
    getFormResult(e, registletJSON.registlet, inputKeyword.value, selectLevel.value);
  });

  searchForm.addEventListener("submit", (e) => {
    getFormResult(e, registletJSON.registlet, inputKeyword.value, selectLevel.value);
  });
});