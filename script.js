function display(...args) {
  const regisContainer = document.querySelector(".regis-container");

  args.forEach(element => {
    regisContainer.appendChild(element);
  });
}

function addLevelToSelectBox(data) {
  const selectLevel = document.querySelector("#select-level");

  for (const stoodieLv of data) {
    const optionLevel = document.createElement("option");
    optionLevel.value = stoodieLv.lv;
    optionLevel.textContent = `${stoodieLv.lv} - ${stoodieLv.map}`;

    selectLevel.appendChild(optionLevel);
  }
}

function convertToHTML(data) {
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

function filterKeyword(data, keyword, level = false) {
  const regex = new RegExp(keyword, "i");
  let dataRegistlet = [];

  if (level) {
    dataRegistlet = filterLevel(data, level);
  } else {
    dataRegistlet = data;
  }

  return dataRegistlet.filter((registlet) => regex.test(registlet.name) || regex.test(registlet.detail));
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

  convertToHTML(registletJSON.registlet);
  addLevelToSelectBox(registletJSON.stoodie);
});
