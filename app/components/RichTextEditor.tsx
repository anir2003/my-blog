'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useRef, useCallback } from 'react';
import { uploadFile } from '@/lib/upload';
import { toast } from 'react-hot-toast';

type RichTextEditorProps = {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
};

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Write your content here...',
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // AI enhancement states
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalContent, setOriginalContent] = useState<string | null>(null);
  const [showAIOptions, setShowAIOptions] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const toggleBold = () => {
    editor.chain().focus().toggleBold().run();
  };

  const toggleItalic = () => {
    editor.chain().focus().toggleItalic().run();
  };

  const toggleHeading = (level: 1 | 2 | 3) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const toggleBulletList = () => {
    editor.chain().focus().toggleBulletList().run();
  };

  const toggleOrderedList = () => {
    editor.chain().focus().toggleOrderedList().run();
  };

  const toggleBlockquote = () => {
    editor.chain().focus().toggleBlockquote().run();
  };

  const setLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl })
        .run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
  };

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageInput(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      
      // Upload the file
      const result = await uploadFile(file);
      
      // Insert the image in the editor
      editor
        .chain()
        .focus()
        .setImage({ src: result.url, alt: file.name })
        .run();
        
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      setShowImageInput(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const enhanceText = async (mode: 'grammar' | 'enhance') => {
    try {
      if (!editor) return;
      
      const currentContent = editor.getHTML();
      
      // Save the original content for possible revert
      if (!originalContent) {
        setOriginalContent(currentContent);
      }
      
      setIsProcessing(true);
      setShowAIOptions(false);
      
      const modeText = mode === 'grammar' ? 'grammar check' : 'enhancement';
      toast.loading(`Processing ${modeText}...`);
      
      // Extract and preserve structured content by using markers
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = currentContent;
      
      // Process paragraphs, headings, lists, etc.
      const processElementsRecursively = (element: HTMLElement) => {
        // Skip processing for style, script tags
        if (['STYLE', 'SCRIPT'].includes(element.tagName)) {
          return;
        }
        
        // Handle text nodes only for elements containing text
        if (element.childNodes.length === 0 || 
            (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE)) {
          if (element.textContent && element.textContent.trim() !== '') {
            // Mark this element for AI processing while preserving its tag
            const tagName = element.tagName?.toLowerCase() || '';
            if (tagName && tagName !== 'img' && tagName !== 'br') {
              const id = `element-${Math.random().toString(36).substr(2, 9)}`;
              element.setAttribute('data-ai-id', id);
            }
          }
        } else {
          // Process children recursively
          Array.from(element.childNodes).forEach(child => {
            if (child.nodeType === Node.ELEMENT_NODE) {
              processElementsRecursively(child as HTMLElement);
            }
          });
        }
      };
      
      processElementsRecursively(tempDiv);
      
      // Get the processed HTML with markers
      const htmlToProcess = tempDiv.innerHTML;
      
      const response = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: htmlToProcess,
          mode: mode,
        }),
      });
      
      toast.dismiss();
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to enhance text');
      }
      
      const { enhancedText } = await response.json();
      
      if (enhancedText) {
        // Set the enhanced content directly
        // The OpenAI API is instructed to preserve HTML structure
        editor.commands.setContent(enhancedText);
        onChange(enhancedText);
        toast.success(`${mode === 'grammar' ? 'Grammar corrected' : 'Text enhanced'} successfully!`);
      }
    } catch (error) {
      console.error('Error enhancing text:', error);
      toast.error(`Failed to ${mode === 'grammar' ? 'check grammar' : 'enhance text'}: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const revertChanges = () => {
    if (originalContent && editor) {
      editor.commands.setContent(originalContent);
      onChange(originalContent);
      setOriginalContent(null);
      toast.success('Changes reverted successfully');
    }
  };

  return (
    <div className="border border-zinc-700 rounded-md overflow-hidden">
      <div className="p-2 bg-zinc-800 border-b border-zinc-700 flex flex-wrap gap-1">
        <button
          type="button" 
          onClick={toggleBold}
          className={`p-2 rounded ${
            editor.isActive('bold') ? 'bg-zinc-700' : 'hover:bg-zinc-700'
          }`}
          title="Bold"
          onMouseDown={(e) => e.preventDefault()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
            <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
          </svg>
        </button>
        
        <button
          type="button"
          onClick={toggleItalic}
          className={`p-2 rounded ${
            editor.isActive('italic') ? 'bg-zinc-700' : 'hover:bg-zinc-700'
          }`}
          title="Italic"
          onMouseDown={(e) => e.preventDefault()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="4" x2="10" y2="4"></line>
            <line x1="14" y1="20" x2="5" y2="20"></line>
            <line x1="15" y1="4" x2="9" y2="20"></line>
          </svg>
        </button>
        
        <button
          type="button"
          onClick={() => toggleHeading(1)}
          className={`p-2 rounded ${
            editor.isActive('heading', { level: 1 }) ? 'bg-zinc-700' : 'hover:bg-zinc-700'
          }`}
          title="Heading 1"
          onMouseDown={(e) => e.preventDefault()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7V17"></path>
            <path d="M13 7V17"></path>
            <path d="M3 12H13"></path>
            <path d="M21 12V17"></path>
            <path d="M16 7V17"></path>
            <path d="M16 12H21"></path>
          </svg>
        </button>

        <button
          type="button"
          onClick={() => toggleHeading(2)}
          className={`p-2 rounded ${
            editor.isActive('heading', { level: 2 }) ? 'bg-zinc-700' : 'hover:bg-zinc-700'
          }`}
          title="Heading 2"
          onMouseDown={(e) => e.preventDefault()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7V17"></path>
            <path d="M13 7V17"></path>
            <path d="M3 12H13"></path>
            <path d="M21 17C21 14.7909 19.2091 13 17 13H16"></path>
            <path d="M16 7V13"></path>
          </svg>
        </button>
        
        <button
          type="button"
          onClick={() => toggleHeading(3)}
          className={`p-2 rounded ${
            editor.isActive('heading', { level: 3 }) ? 'bg-zinc-700' : 'hover:bg-zinc-700'
          }`}
          title="Heading 3"
          onMouseDown={(e) => e.preventDefault()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7V17"></path>
            <path d="M13 7V17"></path>
            <path d="M3 12H13"></path>
            <path d="M21 10C21 8.34315 19.6569 7 18 7H16"></path>
            <path d="M16 7V17"></path>
            <path d="M16 13H18C19.6569 13 21 14.3431 21 16C21 17.6569 19.6569 19 18 19H16"></path>
          </svg>
        </button>
        
        <button
          type="button"
          onClick={toggleBulletList}
          className={`p-2 rounded ${
            editor.isActive('bulletList') ? 'bg-zinc-700' : 'hover:bg-zinc-700'
          }`}
          title="Bullet List"
          onMouseDown={(e) => e.preventDefault()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="9" y1="6" x2="20" y2="6"></line>
            <line x1="9" y1="12" x2="20" y2="12"></line>
            <line x1="9" y1="18" x2="20" y2="18"></line>
            <circle cx="5" cy="6" r="2"></circle>
            <circle cx="5" cy="12" r="2"></circle>
            <circle cx="5" cy="18" r="2"></circle>
          </svg>
        </button>
        
        <button
          type="button"
          onClick={toggleOrderedList}
          className={`p-2 rounded ${
            editor.isActive('orderedList') ? 'bg-zinc-700' : 'hover:bg-zinc-700'
          }`}
          title="Ordered List"
          onMouseDown={(e) => e.preventDefault()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="10" y1="6" x2="21" y2="6"></line>
            <line x1="10" y1="12" x2="21" y2="12"></line>
            <line x1="10" y1="18" x2="21" y2="18"></line>
            <path d="M4 6h1v4"></path>
            <path d="M4 10h2"></path>
            <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
          </svg>
        </button>
        
        <button
          type="button"
          onClick={toggleBlockquote}
          className={`p-2 rounded ${
            editor.isActive('blockquote') ? 'bg-zinc-700' : 'hover:bg-zinc-700'
          }`}
          title="Blockquote"
          onMouseDown={(e) => e.preventDefault()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
        
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowLinkInput(!showLinkInput)}
            className={`p-2 rounded ${
              editor.isActive('link') ? 'bg-zinc-700' : 'hover:bg-zinc-700'
            }`}
            title="Link"
            onMouseDown={(e) => e.preventDefault()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
          </button>
          
          {showLinkInput && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-zinc-800 border border-zinc-700 rounded z-10 w-64">
              <div className="flex">
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded-l text-sm"
                />
                <button
                  onClick={setLink}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded-r text-sm"
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  Add
                </button>
              </div>
              {editor.isActive('link') && (
                <button
                  onClick={removeLink}
                  className="mt-1 px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-sm w-full"
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  Remove Link
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowImageInput(!showImageInput)}
            className="p-2 rounded hover:bg-zinc-700"
            title="Image"
            onMouseDown={(e) => e.preventDefault()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </button>
          
          {showImageInput && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-zinc-800 border border-zinc-700 rounded z-10 w-64">
              <div className="flex mb-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded-l text-sm"
                />
                <button
                  onClick={addImage}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded-r text-sm"
                >
                  Add
                </button>
              </div>
              
              <div className="border-t border-zinc-700 pt-2 mt-2">
                <p className="text-xs text-zinc-400 mb-2">Or upload an image:</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={triggerFileUpload}
                  disabled={isUploading}
                  className="w-full px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-sm flex items-center justify-center"
                >
                  {isUploading ? (
                    <span>Uploading...</span>
                  ) : (
                    <span>Upload Image</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="relative ml-auto">
          <button
            type="button"
            onClick={() => setShowAIOptions(!showAIOptions)}
            disabled={isProcessing}
            className={`p-2 rounded ${showAIOptions ? 'bg-zinc-700' : 'hover:bg-zinc-700'} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="AI Enhance"
            onMouseDown={(e) => e.preventDefault()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10 4 4 0 1 1-8 0 6 6 0 1 1-6 6V4.5"></path>
              <path d="M18 6 9 15l-3-3"></path>
            </svg>
            <span className="ml-1 text-xs">AI</span>
          </button>
          
          {showAIOptions && (
            <div className="absolute top-full right-0 mt-1 p-2 bg-zinc-800 border border-zinc-700 rounded z-10 w-64">
              <div className="space-y-2">
                <button
                  onClick={() => enhanceText('grammar')}
                  disabled={isProcessing}
                  className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm flex items-center justify-center"
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Check Grammar
                </button>
                
                <button
                  onClick={() => enhanceText('enhance')}
                  disabled={isProcessing}
                  className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm flex items-center justify-center"
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  AI Enhance (British English)
                </button>
                
                {originalContent && (
                  <button
                    onClick={revertChanges}
                    className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm flex items-center justify-center"
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    Revert Changes
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="relative">
        <EditorContent editor={editor} className="prose prose-invert max-w-none p-4 min-h-[200px] focus:outline-none" />
        
        {isProcessing && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
              <p className="text-white">Processing with AI...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 