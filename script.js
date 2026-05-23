function filterLevel(data, level) {
  return data.filter((registlet) => registlet.lv.includes(level));
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
});
