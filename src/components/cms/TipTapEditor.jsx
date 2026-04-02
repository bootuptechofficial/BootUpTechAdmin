import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import { 
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3, 
  List, ListOrdered, Quote, Image as ImageIcon, Link as LinkIcon, Video as YoutubeIcon,
  Undo2, Redo2
} from 'lucide-react';
import toast from 'react-hot-toast';

const MenuBar = ({ editor, onImageUpload }) => {
  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('URL');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addYoutube = () => {
    const url = window.prompt('YouTube URL');
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
  };

  const handleImageClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      if (e.target.files?.length) {
        try {
          const url = await onImageUpload(e.target.files[0]);
          editor.chain().focus().setImage({ src: url }).run();
        } catch (error) {
          toast.error('Image upload failed');
        }
      }
    };
    input.click();
  };

  const ToolbarBtn = ({ action, isActive, disabled, children }) => (
    <button
      onClick={(e) => { e.preventDefault(); action(); }}
      disabled={disabled}
      className={`p-1.5 rounded-lg transition-colors ${
        isActive 
          ? 'bg-primary-500 text-white' 
          : 'text-dark-300 hover:text-white hover:bg-dark-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-dark-700 bg-dark-800/80 rounded-t-xl sticky top-16 z-10">
      <ToolbarBtn action={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}>
        <Bold className="w-4 h-4" />
      </ToolbarBtn>
      <ToolbarBtn action={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}>
        <Italic className="w-4 h-4" />
      </ToolbarBtn>
      <ToolbarBtn action={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')}>
        <Strikethrough className="w-4 h-4" />
      </ToolbarBtn>
      <ToolbarBtn action={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')}>
        <Code className="w-4 h-4" />
      </ToolbarBtn>

      <div className="w-px h-6 bg-dark-700 mx-1" />

      <ToolbarBtn action={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })}>
        <Heading1 className="w-4 h-4" />
      </ToolbarBtn>
      <ToolbarBtn action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })}>
        <Heading2 className="w-4 h-4" />
      </ToolbarBtn>
      <ToolbarBtn action={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })}>
        <Heading3 className="w-4 h-4" />
      </ToolbarBtn>

      <div className="w-px h-6 bg-dark-700 mx-1" />

      <ToolbarBtn action={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}>
        <List className="w-4 h-4" />
      </ToolbarBtn>
      <ToolbarBtn action={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}>
        <ListOrdered className="w-4 h-4" />
      </ToolbarBtn>
      <ToolbarBtn action={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')}>
        <Quote className="w-4 h-4" />
      </ToolbarBtn>

      <div className="w-px h-6 bg-dark-700 mx-1" />

      <ToolbarBtn action={addLink} isActive={editor.isActive('link')}>
        <LinkIcon className="w-4 h-4" />
      </ToolbarBtn>
      <ToolbarBtn action={handleImageClick}>
        <ImageIcon className="w-4 h-4" />
      </ToolbarBtn>
      <ToolbarBtn action={addYoutube} isActive={editor.isActive('youtube')}>
        <YoutubeIcon className="w-4 h-4" />
      </ToolbarBtn>

      <div className="flex-1" />

      <ToolbarBtn action={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        <Undo2 className="w-4 h-4" />
      </ToolbarBtn>
      <ToolbarBtn action={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        <Redo2 className="w-4 h-4" />
      </ToolbarBtn>
    </div>
  );
};

export default function TipTapEditor({ content, onChange, onImageUpload }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: true }),
      Link.configure({ openOnClick: false }),
      Youtube.configure({ inline: false, width: 840, height: 472.5 })
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'p-6 min-h-[400px] text-dark-100 placeholder:text-dark-500'
      }
    }
  });

  // Handle case where content comes in late (e.g. from fetch)
  useEffect(() => {
    if (editor && content && editor.getHTML() === '<p></p>') {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="admin-card overflow-hidden focus-within:ring-1 focus-within:ring-primary-500 transition-shadow">
      <MenuBar editor={editor} onImageUpload={onImageUpload} />
      <div className="bg-dark-900 overflow-y-auto max-h-[70vh]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
