import { escapeHTML, markdownToHTML } from "./markdown.js";

class RegistletCard extends HTMLElement {
  set registlet(registlet) {
    const slug = generateSlug(registlet.name);
    const rarity = registlet.rarity
      ? `<br>Rarity: ${escapeHTML(registlet.rarity)}`
      : "";

    this.innerHTML = `
      <h2><a class="heading-anchor" id="${slug}" href="#${slug}">${escapeHTML(registlet.name)}</a></h2>
      <p>(Lv: ${registlet.lv.join(", ")})</p>
      <blockquote>${detailToHTML(registlet.detail, registlet.note)}</blockquote>
      <p>Max Level: ${registlet.max_lv}${rarity}</p>
    `;
  }
}

function detailToHTML(detail, note) {
  const paragraphs = detail
    .split("\n\n")
    .map((text) => `<p>${markdownToHTML(text)}</p>`);

  if (note) {
    paragraphs.push(`<p><i>Note: ${markdownToHTML(note)}</i></p>`);
  }

  return paragraphs.join("");
}

function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // delete all characters that aren't alphabet, white space and hyphen
    .replace(/[\s_-]+/g, "-"); // replace spaces, underscores & hyphens into 1 hyphen
}

customElements.define("registlet-card", RegistletCard);
