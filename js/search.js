export function searchRegistlets(registlets, keyword, level) {
  const text = keyword.trim().toLowerCase();

  return registlets.filter((registlet) => {
    const matchLevel = level === 0 || registlet.lv.includes(level);
    const matchKeyword =
      registlet.name.toLowerCase().includes(text) ||
      registlet.detail.toLowerCase().includes(text);

    return matchLevel && matchKeyword;
  });
}
