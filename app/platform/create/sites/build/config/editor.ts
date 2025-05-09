import type { Editor, EditorConfig } from 'grapesjs';
import { FileManager, FileManagerConfig } from '../components/file-manager';
import 'grapesjs/dist/css/grapes.min.css';

// Initial file manager configuration
const fileManagerConfig: FileManagerConfig = {
  pages: [
    { name: 'Home', path: 'pages/index.html' },
    { name: 'About', path: 'pages/about.html' },
    { name: 'Contact', path: 'pages/contact.html' },
  ],
};

// Editor configuration
const editorConfig: EditorConfig = {
  container: '#gjs',
  height: '100%',
  width: '100%',
  fromElement: false,
  storageManager: false,
  deviceManager: {
    devices: [
      {
        name: 'Desktop',
        width: '',
      },
      {
        name: 'Tablet',
        width: '768px',
        widthMedia: '992px',
      },
      {
        name: 'Mobile',
        width: '320px',
        widthMedia: '480px',
      },
    ],
  },
  panels: {
    defaults: [],
  },
  canvas: {
    styles: [
      'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
    ],
    scripts: [],
  },
  blockManager: {
    appendTo: '#blocks',
    blocks: [
      {
        id: 'section',
        label: 'Section',
        category: 'Layout',
        content: `
          <section class="py-12">
            <div class="container mx-auto px-4">
              <h2 class="text-3xl font-bold mb-6">Section Title</h2>
              <p class="text-gray-600">Add your content here</p>
            </div>
          </section>
        `,
      },
      // Add more blocks as needed
    ],
  },
  layerManager: {
    appendTo: '#layers',
  },
  styleManager: {
    appendTo: '#styles',
  },
  traitManager: {
    appendTo: '#traits',
  },
};

// Initialize plugins and panels
const initEditor = (editor: Editor) => {
  // Initialize file manager
  const fileManager = new FileManager(editor, fileManagerConfig);
  
  // Add file manager command
  editor.Commands.add('show-files', {
    run: (editor, sender, options = {}) => {
      const { target } = options;
      if (target) {
        fileManager.render(target);
      }
    },
  });

  // Remove default panels
  editor.Panels.removePanel('commands');
  editor.Panels.removePanel('options');
  editor.Panels.removePanel('views');
  editor.Panels.removePanel('devices-c');

  // Add keyboard shortcuts
  editor.Commands.add('undo', {
    run: () => editor.UndoManager.undo(),
    options: { shortcuts: 'ctrl+z' },
  });

  editor.Commands.add('redo', {
    run: () => editor.UndoManager.redo(),
    options: { shortcuts: 'ctrl+shift+z' },
  });

  editor.Commands.add('save', {
    run: () => {
      const html = editor.getHtml();
      const css = editor.getCss();
      console.log('Saving...', { html, css });
    },
    options: { shortcuts: 'ctrl+s' },
  });

  // Set initial canvas size
  editor.Canvas.setZoom(100);
  editor.Canvas.setCoords(0, 0);

  return fileManager;
};

export { editorConfig, initEditor };