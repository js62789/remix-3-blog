const parseMarkdown = (markdown: string) => {
  // Match headers
  const headerRegex = /^(#{1,6})\s*(.*)/;

  // Match bold (**text** or __text__)
  const boldRegex = /(\*\*|__)(.*?)\1/g;

  // Match italic (*text* or _text_)
  const italicRegex = /(\*|_)(.*?)\1/g;

  // Match links ([text](url))
  const linkRegex = /\[([^\]]+)\]\(([^\)]+)\)/g;

  // Split the input into lines
  const lines = markdown.split("\n");

  return lines.map((line) => {
    // Handle headers
    const headerMatch = line.match(headerRegex);
    if (headerMatch) {
      const level = headerMatch[1].length; // Number of # determines header level
      return `<h${level}>${headerMatch[2]}</h${level}>`;
    }

    // Handle bold text
    line = line.replace(boldRegex, (_match, _p1, p2) => `<b>${p2}</b>`);

    // Handle italic text
    line = line.replace(italicRegex, (_match, _p1, p2) => `<i>${p2}</i>`);

    // Handle links
    line = line.replace(
      linkRegex,
      (_match, p1, p2) => {
        if (/^https?:\/\//.test(p2)) {
          return `<a href="${p2}" target="_blank" rel="noopener noreferrer">${p1}</a>`;
        } else {
          return `<a href="${p2}">${p1}</a>`;
        }
      },
    );

    // Return a paragraph element for any remaining text
    return `<p>${line}</p>`;
  }).join("");
};

export function Markdown({ children }: { children: string }) {
  return parseMarkdown(children);
}
