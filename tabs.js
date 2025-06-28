// Cloudflare Worker
const FILES = {
  "index.html": {
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Hello World</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>Welcome to our website!</p>
</body>
</html>`,
    language: "html",
    type: "html",
  },
  "script.js": {
    content: `console.log("Hello World!");

function greet(name) {
    return \`Hello, \${name}!\`;
}

const message = greet("Monaco");
console.log(message);`,
    language: "javascript",
    type: "js",
  },
  "styles.css": {
    content: `body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background: #f5f5f5;
}

h1 {
    color: #333;
    text-align: center;
}`,
    language: "css",
    type: "css",
  },
  "package.json": {
    content: `{
  "name": "my-project",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "express": "^4.18.0"
  }
}`,
    language: "json",
    type: "json",
  },
  "README.md": {
    content: `# My Project

A sample project using Monaco Editor.

## Features
- Syntax highlighting
- Code completion
- File management

**Enjoy coding!**`,
    language: "markdown",
    type: "md",
  },
};

function generateHTML(currentFile) {
  const fileEntries = Object.entries(FILES);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monaco Editor - ${currentFile}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; background: #1e1e1e; color: #cccccc; height: 100vh; overflow: hidden; }
        
        .container { display: flex; height: 100vh; }
        
        .sidebar { width: 250px; background: #252526; border-right: 1px solid #3c3c3c; display: flex; flex-direction: column; }
        .sidebar-header { padding: 10px; background: #2d2d30; border-bottom: 1px solid #3c3c3c; font-weight: bold; }
        .file-list { flex: 1; overflow-y: auto; }
        .file-item { padding: 8px 15px; cursor: pointer; display: flex; align-items: center; font-size: 13px; border-bottom: 1px solid #2d2d2d; }
        .file-item:hover { background: #2a2d2e; }
        .file-item.active { background: #37373d; border-left: 2px solid #007acc; }
        .file-icon { width: 16px; height: 16px; margin-right: 8px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold; border-radius: 2px; }
        .file-icon.js { background: #f7df1e; color: #000; }
        .file-icon.html { background: #e34c26; color: #fff; }
        .file-icon.css { background: #1572b6; color: #fff; }
        .file-icon.json { background: #cbcb41; color: #000; }
        .file-icon.md { background: #083fa1; color: #fff; }
        
        .editor-container { flex: 1; display: flex; flex-direction: column; }
        .tab-bar { background: #2d2d30; border-bottom: 1px solid #3c3c3c; display: flex; align-items: center; min-height: 35px; overflow-x: auto; }
        .tab { display: flex; align-items: center; padding: 8px 12px; background: #2d2d30; border-right: 1px solid #3c3c3c; cursor: pointer; min-width: 120px; font-size: 13px; }
        .tab.active { background: #1e1e1e; border-bottom: 2px solid #007acc; }
        .tab-name { flex: 1; overflow: hidden; text-overflow: ellipsis; margin-right: 8px; }
        .close-btn { width: 16px; height: 16px; border: none; background: none; color: #cccccc; cursor: pointer; opacity: 0.7; }
        .close-btn:hover { opacity: 1; background: #e81123; color: white; border-radius: 2px; }
        .tab:not(:hover) .close-btn { opacity: 0; }
        
        .editor-content { flex: 1; }
        #monaco-editor { height: 100%; width: 100%; }
    </style>
    <script src="https://unpkg.com/monaco-editor@0.44.0/min/vs/loader.js"></script>
</head>
<body>
    <div class="container">
        <div class="sidebar">
            <div class="sidebar-header">FILES</div>
            <div class="file-list">
                ${fileEntries
                  .map(
                    ([filename, file]) => `
                    <div class="file-item ${
                      filename === currentFile ? "active" : ""
                    }" onclick="navigateToFile('${filename}')">
                        <div class="file-icon ${
                          file.type
                        }">${file.type.toUpperCase()}</div>
                        <span>${filename}</span>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        </div>
        
        <div class="editor-container">
            <div class="tab-bar" id="tabBar"></div>
            <div class="editor-content">
                <div id="monaco-editor"></div>
            </div>
        </div>
    </div>

    <script>
        const FILES = ${JSON.stringify(FILES)};
        const CURRENT_FILE = '${currentFile}';
        
        class TabManager {
            constructor() {
                this.openTabs = this.loadTabs();
                this.activeFile = CURRENT_FILE;
                
                // Add current file to tabs if not already open
                if (!this.openTabs.includes(CURRENT_FILE)) {
                    this.openTabs.push(CURRENT_FILE);
                }
                
                this.saveTabs();
                this.initMonaco();
                this.renderTabs();
            }
            
            loadTabs() {
                try {
                    const saved = localStorage.getItem('monacoTabs');
                    return saved ? JSON.parse(saved) : ['index.html'];
                } catch {
                    return ['index.html'];
                }
            }
            
            saveTabs() {
                localStorage.setItem('monacoTabs', JSON.stringify(this.openTabs));
            }
            
            renderTabs() {
                const tabBar = document.getElementById('tabBar');
                tabBar.innerHTML = this.openTabs.map(filename => {
                    const file = FILES[filename];
                    return \`
                        <div class="tab \${filename === this.activeFile ? 'active' : ''}" onclick="navigateToFile('\${filename}')">
                            <div class="file-icon \${file.type}">\${file.type.toUpperCase()}</div>
                            <div class="tab-name">\${filename}</div>
                            <button class="close-btn" onclick="event.stopPropagation(); closeTab('\${filename}')">×</button>
                        </div>
                    \`;
                }).join('');
            }
            
            initMonaco() {
                require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.44.0/min/vs' } });
                require(['vs/editor/editor.main'], () => {
                    const file = FILES[CURRENT_FILE];
                    monaco.editor.create(document.getElementById('monaco-editor'), {
                        value: file.content,
                        language: file.language,
                        theme: 'vs-dark',
                        fontSize: 14,
                        automaticLayout: true,
                        minimap: { enabled: true },
                        readOnly: true
                    });
                });
            }
        }
        
        function navigateToFile(filename) {
            window.location.href = '/' + filename;
        }
        
        function closeTab(filename) {
            const tabManager = window.tabManager;
            const index = tabManager.openTabs.indexOf(filename);
            if (index > -1) {
                tabManager.openTabs.splice(index, 1);
                tabManager.saveTabs();
                
                if (filename === CURRENT_FILE && tabManager.openTabs.length > 0) {
                    // Navigate to the first remaining tab
                    navigateToFile(tabManager.openTabs[0]);
                } else if (tabManager.openTabs.length === 0) {
                    // If no tabs left, go to index.html
                    navigateToFile('index.html');
                } else {
                    // Just re-render tabs
                    tabManager.renderTabs();
                }
            }
        }
        
        window.addEventListener('DOMContentLoaded', () => {
            window.tabManager = new TabManager();
        });
    </script>
</body>
</html>`;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    let path = url.pathname.slice(1); // Remove leading slash

    // Default to index.html if no path or root
    if (!path || path === "") {
      path = "index.html";
    }

    // Check if file exists
    if (!FILES[path]) {
      return new Response("File not found", { status: 404 });
    }

    if (!request.headers.get("accept")?.includes("text/html")) {
      return new Response(FILES[path].content);
    }

    const html = generateHTML(path);

    return new Response(html, {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "no-cache",
      },
    });
  },
};
