import type { Editor } from 'grapesjs';
import { FolderTree, File, Plus, Save, History, ChevronRight, FolderOpen, Folder } from 'lucide-react';

interface Page {
  id: string;
  name: string;
  path: string;
  content?: string;
  lastModified?: Date;
  parentId?: string | null;
  children?: Page[];
}

export interface FileManagerConfig {
  pages: Page[];
}

export class FileManager {
  private editor: Editor;
  private config: FileManagerConfig;
  private container: HTMLElement | null = null;

  constructor(editor: Editor, config: FileManagerConfig) {
    this.editor = editor;
    this.config = config;
    // Initialize page hierarchy
    this.buildPageHierarchy();
  }

  private buildPageHierarchy() {
    const pageMap = new Map<string, Page>();
    const rootPages: Page[] = [];

    // First pass: create map of all pages
    this.config.pages.forEach(page => {
      pageMap.set(page.id, { ...page, children: [] });
    });

    // Second pass: build hierarchy
    this.config.pages.forEach(page => {
      const pageWithChildren = pageMap.get(page.id)!;
      if (page.parentId && pageMap.has(page.parentId)) {
        const parent = pageMap.get(page.parentId)!;
        parent.children = parent.children || [];
        parent.children.push(pageWithChildren);
      } else {
        rootPages.push(pageWithChildren);
      }
    });

    this.config.pages = rootPages;
  }

  render(container: HTMLElement) {
    this.container = container;
    this.renderPanel();
  }

  private renderPanel() {
    if (!this.container) return;

    // Clear existing content
    this.container.innerHTML = '';

    // Create main container
    const panel = document.createElement('div');
    panel.className = 'p-4 space-y-6 text-white';

    // Pages List
    const pagesSection = this.createPagesSection();
    panel.appendChild(pagesSection);

    // Save Changes
    const saveSection = this.createSaveSection();
    panel.appendChild(saveSection);

    // Append to container
    this.container.appendChild(panel);
  }

  private createPagesSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'space-y-2';

    const header = document.createElement('div');
    header.className = 'flex items-center justify-between';
    
    const title = document.createElement('div');
    title.className = 'flex items-center gap-2 text-sm font-medium text-gray-300';
    title.innerHTML = `
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${FolderTree.toString()}
      </svg>
      <span>Pages</span>
    `;

    const addButton = document.createElement('button');
    addButton.className = 'p-1 text-gray-400 hover:text-white rounded';
    addButton.innerHTML = `
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${Plus.toString()}
      </svg>
    `;
    addButton.addEventListener('click', () => this.createNewPage());

    header.appendChild(title);
    header.appendChild(addButton);

    const list = document.createElement('div');
    list.className = 'space-y-1 mt-2';

    // Render page tree
    this.renderPageTree(this.config.pages, list);

    section.appendChild(header);
    section.appendChild(list);

    return section;
  }

  private renderPageTree(pages: Page[], container: HTMLElement, level: number = 0) {
    pages.forEach(page => {
      const pageItem = document.createElement('div');
      pageItem.className = 'flex flex-col';

      const pageHeader = document.createElement('div');
      pageHeader.className = 'flex items-center justify-between p-2 rounded hover:bg-[#252525] group cursor-pointer';
      pageHeader.style.paddingLeft = `${level * 16 + 8}px`;

      const pageInfo = document.createElement('div');
      pageInfo.className = 'flex items-center gap-2';
      
      const hasChildren = page.children && page.children.length > 0;
      const isExpanded = true; // You can make this stateful if needed

      pageInfo.innerHTML = `
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${hasChildren ? (isExpanded ? FolderOpen.toString() : Folder.toString()) : File.toString()}
        </svg>
        <span class="text-sm text-gray-300">${page.name}</span>
      `;

      const actions = document.createElement('div');
      actions.className = 'flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity';
      
      const addSubpageButton = document.createElement('button');
      addSubpageButton.className = 'p-1 text-gray-400 hover:text-white rounded';
      addSubpageButton.innerHTML = `
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${Plus.toString()}
        </svg>
      `;
      addSubpageButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.createNewPage(page.id);
      });

      const saveButton = document.createElement('button');
      saveButton.className = 'p-1 text-gray-400 hover:text-white rounded';
      saveButton.innerHTML = `
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${Save.toString()}
        </svg>
      `;
      saveButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.savePage(page.path);
      });

      const historyButton = document.createElement('button');
      historyButton.className = 'p-1 text-gray-400 hover:text-white rounded';
      historyButton.innerHTML = `
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${History.toString()}
        </svg>
      `;
      historyButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.viewHistory(page.path);
      });

      actions.appendChild(addSubpageButton);
      actions.appendChild(saveButton);
      actions.appendChild(historyButton);

      pageHeader.appendChild(pageInfo);
      pageHeader.appendChild(actions);
      pageHeader.addEventListener('click', () => this.openPage(page.path));

      pageItem.appendChild(pageHeader);

      // Render children if any
      if (hasChildren) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'ml-4';
        this.renderPageTree(page.children!, childrenContainer, level + 1);
        pageItem.appendChild(childrenContainer);
      }

      container.appendChild(pageItem);
    });
  }

  private createSaveSection(): HTMLElement {
    const section = document.createElement('div');
    section.className = 'space-y-2 pt-4 border-t border-[#3d3d3d]';

    const saveButton = document.createElement('button');
    saveButton.className = 'w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium flex items-center justify-center gap-2';
    saveButton.innerHTML = `
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${Save.toString()}
      </svg>
      <span>Save Changes</span>
    `;
    saveButton.addEventListener('click', () => this.saveAllChanges());

    section.appendChild(saveButton);

    return section;
  }

  // File Manager Actions
  private async createNewPage(parentId?: string) {
    const name = prompt('Enter page name:');
    if (!name) return;

    try {
      const newPage: Page = {
        id: crypto.randomUUID(),
        name,
        path: `pages/${name.toLowerCase().replace(/\s+/g, '-')}.html`,
        parentId: parentId || null,
        children: []
      };

      if (parentId) {
        // Add to parent's children
        const addToParent = (pages: Page[]): boolean => {
          for (const page of pages) {
            if (page.id === parentId) {
              page.children = page.children || [];
              page.children.push(newPage);
              return true;
            }
            if (page.children && addToParent(page.children)) {
              return true;
            }
          }
          return false;
        };

        addToParent(this.config.pages);
      } else {
        // Add to root level
        this.config.pages.push(newPage);
      }

      this.renderPanel();
    } catch (error) {
      console.error('Error creating page:', error);
    }
  }

  private async openPage(path: string) {
    try {
      console.log('Opening page:', path);
      // TODO: Load page content into editor
    } catch (error) {
      console.error('Error opening page:', error);
    }
  }

  private async savePage(path: string) {
    try {
      const html = this.editor.getHtml();
      const css = this.editor.getCss();
      console.log('Saving page:', path, { html, css });
    } catch (error) {
      console.error('Error saving page:', error);
    }
  }

  private async viewHistory(path: string) {
    try {
      console.log('Viewing history for:', path);
    } catch (error) {
      console.error('Error viewing history:', error);
    }
  }

  private async saveAllChanges() {
    try {
      const html = this.editor.getHtml();
      const css = editor.getCss();
      console.log('Saving all changes:', { html, css });
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  }
}