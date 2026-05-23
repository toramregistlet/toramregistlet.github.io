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

  console.log(registletJSON);
  console.log(filterLevel(registletJSON.registlet, 70));
  console.log(filterKeyword(registletJSON.registlet, "pror"));
  console.log(filterKeyword(registletJSON.registlet, "pror", 190));
});
