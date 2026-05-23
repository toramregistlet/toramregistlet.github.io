function display(...args) {
  const regisContainer = document.querySelector(".regis-container");

  args.forEach(element => {
    regisContainer.appendChild(element);
  });
}

function resetDisplay() {
  const regisContainer = document.querySelector(".regis-container");
  regisContainer.replaceChildren();
}

function addRegisCounter(count) {
  const header = document.querySelector("header");
  const checkPara = document.querySelector("p");

  if (checkPara) {
    checkPara.remove();
  }
  
  const countHeader = document.createElement("p");
  countHeader.textContent = `Registlet found: ${count}`;
  header.appendChild(countHeader);
}

function addLevelToSelectBox(data, element) {
  for (const stoodieLv of data) {
    const optionLevel = document.createElement("option");
    optionLevel.value = stoodieLv.lv;
    optionLevel.textContent = `${stoodieLv.lv} - ${stoodieLv.map}`;

    element.appendChild(optionLevel);
  }
}

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
    const nameH2 = document.createElement("h2");
    const nameA = document.createElement("a");
    const detail = convertDetail(registlet.detail);
    const stdLv = document.createElement("p");
    const maxLvRarity = document.createElement("p");
    const slug = generateSlug(registlet.name);

    nameA.classList = "heading-anchor";
    nameA.href = `#${slug}`;
    nameA.id = slug;
    nameA.textContent = registlet.name;
    nameH2.append(nameA);

    stdLv.textContent = `(Lv: ${registlet.lv.join(", ")})`;
    maxLvRarity.innerHTML = `Max Level: ${registlet.max_lv}<br>Rarity: ${registlet.rarity}`;

    display(nameH2, stdLv, detail, maxLvRarity);
  }

  addRegisCounter(data.length);
}

function convertDetail(string) {
  const arrPara = string.split("\r\n> \r\n");
  const detail = document.createElement("blockquote");
  const regexBlockquote = />\s/g;  // originally `>` was used for `<blockquote>` in markdown format
  const regexNewLine = /\r\n/g;

  for (const detailPara of arrPara) {
    const para = document.createElement("p");
    const formatted = detailPara
      .replace(regexNewLine, "<br/>")
      .replace(regexBlockquote, "");
    const codeTagged = formatted
      .replace(/`([^`]+)`/g, '<code>$1</code>');

    para.innerHTML = codeTagged;
    detail.appendChild(para);
  }

  return detail;
}

function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // hapus karakter khusus
    .replace(/[\s_-]+/g, '-') // replace spasi/underscore jadi dash
    .replace(/^-+|-+$/g, ''); // hapus dash di awal/akhir
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
    const keywordFiltered = filterKeyword(
      data,
      keyword, 
      Number(level)
    );
    convertToHTML(keywordFiltered);
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

  selectLevel.addEventListener("change", (e) => {
    getFormResult(e, registletJSON.registlet, inputKeyword.value, selectLevel.value);
  });

  searchForm.addEventListener("submit", (e) => {
    getFormResult(e, registletJSON.registlet, inputKeyword.value, selectLevel.value);
  });
});
