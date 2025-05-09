"use client"

import { useState, useEffect, useRef } from 'react'
import grapesjs from 'grapesjs'
import 'grapesjs/dist/css/grapes.min.css'
import { editorConfig, initEditor } from './config/editor'
import gjsPresetWebpage from 'grapesjs-preset-webpage'
import gjsBlocksBasic from 'grapesjs-blocks-basic'
import { FileManager } from './components/file-manager'
import { 
  Plus, 
  Share2, 
  Save, 
  Search, 
  HelpCircle, 
  Cloud, 
  MoreVertical, 
  X, 
  LayoutGrid, 
  Layers, 
  Paintbrush, 
  Settings, 
  FileText,
  Monitor,
  Tablet,
  Smartphone,
  Code,
  ChevronRight,
  FolderTree
} from 'lucide-react'

export default function SiteBuilder() {
  const editorRef = useRef<any>(null)
  const fileManagerRef = useRef<FileManager | null>(null)
  const [currentPage, setCurrentPage] = useState<string>('home')
  const [activePanel, setActivePanel] = useState<'files' | 'blocks' | 'layers' | 'styles' | 'traits'>('files')

  const handlePanelSwitch = (panelId: typeof activePanel) => {
    if (!editorRef.current) return
    
    setActivePanel(panelId)
    const editor = editorRef.current
    
    // Hide all panels first
    const panels = ['files', 'blocks', 'layers', 'styles', 'traits']
    panels.forEach(id => {
      const panel = document.getElementById(id)
      if (panel) {
        panel.style.display = id === panelId ? 'block' : 'none'
      }
    })

    // Render the active panel
    switch (panelId) {
      case 'files':
        if (fileManagerRef.current) {
          const filesPanel = document.getElementById('files')
          if (filesPanel) {
            fileManagerRef.current.render(filesPanel)
          }
        }
        break
      case 'blocks':
        editor.BlockManager.render()
        break
      case 'layers':
        editor.LayerManager.render()
        break
      case 'styles':
        editor.StyleManager.render()
        break
      case 'traits':
        editor.TraitManager.render()
        break
    }
  }

  useEffect(() => {
    if (!editorRef.current) {
      // Initialize editor
      const editor = grapesjs.init({
        ...editorConfig,
        container: '#gjs',
        height: '100%',
        width: '100%',
        plugins: [gjsPresetWebpage, gjsBlocksBasic],
        blockManager: {
          ...editorConfig.blockManager,
          appendTo: '#blocks',
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
        panels: { defaults: [] },
        storageManager: false,
      })

      // Store editor reference
      editorRef.current = editor

      // Initialize file manager
      const fileManager = new FileManager(editor, {
        pages: [
          { name: 'Home', path: 'pages/index.html' },
          { name: 'About', path: 'pages/about.html' },
          { name: 'Contact', path: 'pages/contact.html' },
        ],
        currentBranch: 'main',
        branches: ['main', 'development', 'staging'],
      })
      fileManagerRef.current = fileManager

      // Setup editor
      editor.on('load', () => {
        // Set initial canvas styles
        const frame = editor.Canvas.getFrameEl()
        if (frame) {
          const frameDoc = frame.contentDocument
          const styleTag = frameDoc.createElement('style')
          styleTag.textContent = `
            body {
              margin: 0 !important;
              padding: 0 !important;
              min-height: 100vh !important;
            }
          `
          frameDoc.head.appendChild(styleTag)
        }

        // Initial panel renders
        handlePanelSwitch('files')
      })

      // Component selection handler
      editor.on('component:selected', () => {
        if (activePanel === 'styles') {
          editor.StyleManager.render()
        } else if (activePanel === 'traits') {
          editor.TraitManager.render()
        }
      })

      // Component update handlers
      editor.on('component:update component:add component:remove', () => {
        if (activePanel === 'layers') {
          editor.LayerManager.render()
        }
      })
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy()
        editorRef.current = null
      }
    }
  }, [])

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e]">
      <div className="h-12 bg-[#2d2d2d] border-b border-[#3d3d3d] flex items-center px-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-white font-semibold">AffTrack</span>
            <button className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="flex items-center space-x-2 px-4 py-1 bg-[#252525] rounded">
            <span className="text-gray-300 text-sm">{currentPage}</span>
            <button className="text-gray-500 hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="text-gray-400 hover:text-white">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="text-green-500 hover:text-green-400">
            <Save className="w-5 h-5" />
          </button>
          <button className="text-gray-400 hover:text-white">
            <Search className="w-5 h-5" />
          </button>
          <button className="text-gray-400 hover:text-white">
            <HelpCircle className="w-5 h-5" />
          </button>
          <button className="text-gray-400 hover:text-white">
            <Cloud className="w-5 h-5" />
          </button>
          <button className="text-gray-400 hover:text-white">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Editor Canvas */}
        <div className="flex-1 relative">
          <div id="gjs" className="h-full w-full" />
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-[#2d2d2d] flex flex-col">
          <div className="flex bg-[#252525] border-b border-[#3d3d3d]">
            <button 
              className={`p-3 hover:bg-[#2d2d2d] ${activePanel === 'files' ? 'text-white bg-[#2d2d2d]' : 'text-gray-400'}`}
              onClick={() => handlePanelSwitch('files')}
              title="Files"
            >
              <FolderTree className="w-5 h-5" />
            </button>
            <button 
              className={`p-3 hover:bg-[#2d2d2d] ${activePanel === 'blocks' ? 'text-white bg-[#2d2d2d]' : 'text-gray-400'}`}
              onClick={() => handlePanelSwitch('blocks')}
              title="Blocks"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              className={`p-3 hover:bg-[#2d2d2d] ${activePanel === 'layers' ? 'text-white bg-[#2d2d2d]' : 'text-gray-400'}`}
              onClick={() => handlePanelSwitch('layers')}
              title="Layers"
            >
              <Layers className="w-5 h-5" />
            </button>
            <button 
              className={`p-3 hover:bg-[#2d2d2d] ${activePanel === 'styles' ? 'text-white bg-[#2d2d2d]' : 'text-gray-400'}`}
              onClick={() => handlePanelSwitch('styles')}
              title="Styles"
            >
              <Paintbrush className="w-5 h-5" />
            </button>
            <button 
              className={`p-3 hover:bg-[#2d2d2d] ${activePanel === 'traits' ? 'text-white bg-[#2d2d2d]' : 'text-gray-400'}`}
              onClick={() => handlePanelSwitch('traits')}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div id="files" className={`h-full ${activePanel !== 'files' && 'hidden'}`} />
            <div id="blocks" className={`h-full ${activePanel !== 'blocks' && 'hidden'}`} />
            <div id="layers" className={`h-full ${activePanel !== 'layers' && 'hidden'}`} />
            <div id="styles" className={`h-full ${activePanel !== 'styles' && 'hidden'}`} />
            <div id="traits" className={`h-full ${activePanel !== 'traits' && 'hidden'}`} />
          </div>
        </div>
      </div>

      <div className="h-8 bg-[#2d2d2d] border-t border-[#3d3d3d] flex items-center justify-between px-4">
        <div className="flex items-center text-sm text-gray-400">
          <span>body</span>
          <ChevronRight className="w-4 h-4" />
          <span>section</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button className="text-gray-400 hover:text-white">
              <Monitor className="w-4 h-4" />
            </button>
            <button className="text-gray-400 hover:text-white">
              <Tablet className="w-4 h-4" />
            </button>
            <button className="text-gray-400 hover:text-white">
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm text-gray-400">1920px</span>
          <button className="text-gray-400 hover:text-white">
            <Code className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}