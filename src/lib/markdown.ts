function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderMarkdown(markdown: string): string {
  let html = escapeHtml(markdown);

  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  html = html.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    '<pre><code class="language-$1">$2</code></pre>'
  );
  html = html.replace(/`(.+?)`/g, "<code>$1</code>");

  html = html.replace(
    /^\> (.+)$/gm,
    "<blockquote><p>$1</p></blockquote>"
  );

  html = html.replace(/^\- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>");

  html = html.replace(
    /\!\[(.*?)\]\((.+?)\)/g,
    '<img src="$2" alt="$1" />'
  );

  html = html.replace(
    /\[(.+?)\]\((.+?)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  html = html.replace(/\n\n/g, "</p><p>");
  html = `<p>${html}</p>`;
  html = html.replace(/<p><(h[1-3]|pre|ul|ol|blockquote)/g, "<$1");
  html = html.replace(/<\/(h[1-3]|pre|ul|ol|blockquote)><\/p>/g, "</$1>");

  return html;
}
