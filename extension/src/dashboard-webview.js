function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function dashboardHtml(summary, dependencyNames = []) {
  const rows = Object.entries(summary)
    .map(([k, v]) => `<li><strong>${escapeHtml(k)}:</strong> ${escapeHtml(v)}</li>`)
    .join("\n");
  const deps = dependencyNames.map((name) => `<li class="dep-item">${escapeHtml(name)}</li>`).join("\n");

  return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
      body { font-family: var(--vscode-font-family); padding: 16px; color: var(--vscode-foreground); }
      .actions { display:flex; gap:8px; flex-wrap: wrap; margin-top: 12px; }
      button { border: 1px solid var(--vscode-button-border, transparent); background: var(--vscode-button-background); color: var(--vscode-button-foreground); padding: 6px 10px; border-radius: 6px; cursor: pointer; }
      ul { line-height: 1.7; }
      .muted { opacity: 0.8; margin-top: 8px; }
      .search-wrap { margin-top: 14px; display: grid; gap: 8px; }
      #depSearch { padding: 8px; border-radius: 6px; border: 1px solid var(--vscode-input-border); background: var(--vscode-input-background); color: var(--vscode-input-foreground); }
      .dep-list { max-height: 220px; overflow: auto; border: 1px solid var(--vscode-panel-border); border-radius: 8px; padding: 0; margin: 0; list-style: none; }
      .dep-item { padding: 6px 10px; cursor: pointer; }
      .dep-item.active, .dep-item:hover { background: var(--vscode-list-hoverBackground); }
    </style>
  </head>
  <body>
    <h2>Supe Dependency Dashboard</h2>
    <ul>${rows}</ul>
    <div class="actions">
      <button data-cmd="refresh">Refresh Insights</button>
      <button data-cmd="install">Install Package</button>
      <button data-cmd="packageAction">Package Action</button>
    </div>
    <div class="search-wrap">
      <label for="depSearch"><strong>Search dependencies (mouse + keyboard)</strong></label>
      <input id="depSearch" type="text" placeholder="Type to filter, ↑/↓ to navigate, Enter to select" />
      <ul class="dep-list" id="depList">${deps}</ul>
    </div>
    <div class="muted">Hybrid UX: keep TreeView for navigation + this panel for fast command actions.</div>
    <script>
      const vscode = acquireVsCodeApi();
      document.querySelectorAll('button[data-cmd]').forEach((btn) => {
        btn.addEventListener('click', () => vscode.postMessage({ command: btn.dataset.cmd }));
      });

      const input = document.getElementById('depSearch');
      const list = document.getElementById('depList');
      let selectedIndex = 0;

      function currentItems() {
        return Array.from(list.querySelectorAll('.dep-item'));
      }

      function applySelection(items) {
        items.forEach((el, idx) => el.classList.toggle('active', idx === selectedIndex));
        if (items[selectedIndex]) items[selectedIndex].scrollIntoView({ block: 'nearest' });
      }

      function filterList() {
        const query = input.value.trim().toLowerCase();
        const items = currentItems();
        items.forEach((el) => {
          const show = !query || el.textContent.toLowerCase().includes(query);
          el.style.display = show ? '' : 'none';
        });
        const visible = items.filter((el) => el.style.display !== 'none');
        selectedIndex = Math.min(selectedIndex, Math.max(visible.length - 1, 0));
        applySelection(visible);
      }

      input.addEventListener('input', filterList);
      input.addEventListener('keydown', (event) => {
        const visible = currentItems().filter((el) => el.style.display !== 'none');
        if (!visible.length) return;
        if (event.key === 'ArrowDown') {
          selectedIndex = Math.min(visible.length - 1, selectedIndex + 1);
          applySelection(visible);
          event.preventDefault();
        } else if (event.key === 'ArrowUp') {
          selectedIndex = Math.max(0, selectedIndex - 1);
          applySelection(visible);
          event.preventDefault();
        } else if (event.key === 'Enter') {
          visible[selectedIndex]?.click();
          event.preventDefault();
        }
      });

      currentItems().forEach((item) => {
        item.addEventListener('click', () => {
          input.value = item.textContent.trim();
          vscode.postMessage({ command: 'searchDependencies', query: input.value });
          filterList();
        });
      });

      filterList();
    </script>
  </body>
</html>`;
}
