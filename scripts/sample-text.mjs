// Fill blueprint {{...}} markers with neutral sample text, for smoke tests only.

const SVG = '<svg viewBox="0 0 400 300" role="img" aria-label="Sample visual"><rect x="20" y="20" width="360" height="260" rx="24" fill="var(--c-accent)"/><circle cx="200" cy="150" r="70" fill="var(--c-bg)"/></svg>';

export function fill(html) {
  return html.replace(/\{\{([^}]*)\}\}/g, (_, hint) => {
    const h = hint.toLowerCase();
    if (h.startsWith('visual')) return SVG;
    if (h.startsWith('real number')) return '1.280';
    if (h.startsWith('real link')) return '#';
    if (h.startsWith('brand')) return 'Northwind Studio: sample page';
    if (/headline|statement|name or|place name|event or product/.test(h)) return 'Bread baked before the city wakes';
    if (/one sentence|deck|line:|two sentences|passage|belief|paragraph|pull quote|closing/.test(h)) {
      return 'Sample sentence for the blueprint check, long enough to wrap like real copy on a phone.';
    }
    return 'Sample item';
  });
}
