// Turns the small markdown used in registlet.json into HTML:
//   `text`      -> <code>text</code>
//   *text*      -> <i>text</i>
//   a new line  -> <br>
// A single * (like a footnote mark) is not italic, it stays as it is.

// Makes text safe to put inside HTML (so "<" or "&" in the data can't break the page).
export function escapeHTML(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function markdownToHTML(text) {
  return escapeHTML(text)
    .replace(/\n/g, "<br>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*([^*]+)\*/g, "<i>$1</i>");
}
