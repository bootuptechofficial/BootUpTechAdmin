import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, Image as ImageIcon } from 'lucide-react';
import TipTapEditor from '../components/cms/TipTapEditor';
import { createPost, uploadImage } from '../utils/api';
import toast from 'react-hot-toast';

export default function CreatePostPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'Uncategorized',
    tags: '',
    status: 'draft',
    isFeatured: false,
    seoTitle: '',
    seoDescription: '',
    featuredImage: ''
  });

  const handleImageUpload = async (file) => {
    try {
      const res = await uploadImage(file);
      return `http://localhost:5000${res.data.url}`; // Full URL for editor
    } catch (error) {
      toast.error('Failed to upload image');
      throw error;
    }
  };

  const handleFeaturedImageUpload = async (e) => {
    if (e.target.files?.length) {
      try {
        const url = await handleImageUpload(e.target.files[0]);
        setPost({ ...post, featuredImage: url });
      } catch (error) { }
    }
  };

  const handleSave = async (status = null) => {
    if (!post.title || !post.content) {
      toast.error('Title and content are required');
      return;
    }

    setLoading(true);
    try {
      const tagsArray = post.tags.split(',').map(t => t.trim()).filter(Boolean);
      const dataToSave = { 
        ...post, 
        tags: tagsArray,
        ...(status && { status }) 
      };

      await createPost(dataToSave);
      toast.success('Post created successfully!');
      navigate('/posts');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sticky top-16 bg-dark-950/80 backdrop-blur-md z-20 py-4 border-b border-dark-800">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/posts')}
            className="p-2 rounded-xl border border-dark-700 text-dark-300 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white">Create New Post</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleSave('draft')}
            disabled={loading}
            className="admin-btn-secondary flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button 
            onClick={() => handleSave('published')}
            disabled={loading}
            className="admin-btn-primary flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Sector */}
        <div className="lg:col-span-2 space-y-6">
          <input
            type="text"
            placeholder="Post Title..."
            value={post.title}
            onChange={e => setPost({ ...post, title: e.target.value })}
            className="w-full bg-transparent border-none text-4xl font-black text-white focus:outline-none placeholder:text-dark-600 mb-2"
          />
          
          <TipTapEditor 
            content={post.content} 
            onChange={(html) => setPost({ ...post, content: html })} 
            onImageUpload={handleImageUpload}
          />

          <div className="admin-card p-5">
            <h3 className="text-lg font-bold text-white mb-4">Excerpt</h3>
            <textarea
              value={post.excerpt}
              onChange={e => setPost({ ...post, excerpt: e.target.value })}
              placeholder="Short summary for the index pages... (optional, auto-generated if left blank)"
              className="admin-input h-24 resize-none"
            />
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          {/* Status & Options */}
          <div className="admin-card p-5 space-y-4">
            <h3 className="font-bold text-white">Publish Settings</h3>
            <div>
              <label className="block text-sm text-dark-400 mb-1">Status</label>
              <select 
                value={post.status} 
                onChange={e => setPost({ ...post, status: e.target.value })}
                className="admin-input"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-dark-700 bg-dark-800/50 hover:bg-dark-800 transition-colors">
              <input
                type="checkbox"
                checked={post.isFeatured}
                onChange={e => setPost({ ...post, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500 bg-dark-900"
              />
              <span className="text-sm font-medium text-dark-200">Feature this post</span>
            </label>
          </div>

          {/* Categorization */}
          <div className="admin-card p-5 space-y-4">
            <h3 className="font-bold text-white">Categorization</h3>
            <div>
              <label className="block text-sm text-dark-400 mb-1">Category</label>
              <input
                type="text"
                value={post.category}
                onChange={e => setPost({ ...post, category: e.target.value })}
                className="admin-input"
                placeholder="e.g. React"
              />
            </div>
            <div>
              <label className="block text-sm text-dark-400 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={post.tags}
                onChange={e => setPost({ ...post, tags: e.target.value })}
                className="admin-input"
                placeholder="e.g. javascript, frontend, hooks"
              />
            </div>
          </div>

          {/* Featured Image */}
          <div className="admin-card p-5">
            <h3 className="font-bold text-white mb-4">Featured Image</h3>
            {post.featuredImage ? (
              <div className="relative group">
                <img src={post.featuredImage} alt="Featured" className="w-full aspect-video object-cover rounded-xl border border-dark-700" />
                <button 
                  onClick={() => setPost({...post, featuredImage: ''})}
                  className="absolute top-2 right-2 bg-dark-900/80 p-1.5 rounded-lg text-red-400 hover:text-red-300 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-dark-700 rounded-xl cursor-pointer bg-dark-800/50 hover:bg-dark-800 hover:border-primary-500/50 transition-colors group">
                <ImageIcon className="w-8 h-8 text-dark-500 group-hover:text-primary-400 mb-2" />
                <span className="text-sm text-dark-400 group-hover:text-primary-400 font-medium">Click to upload</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFeaturedImageUpload} />
              </label>
            )}
          </div>

          {/* SEO Metadata */}
          <div className="admin-card p-5 space-y-4">
            <h3 className="font-bold text-white">SEO Metadata</h3>
            <div>
              <label className="block text-sm text-dark-400 mb-1">SEO Title</label>
              <input
                type="text"
                value={post.seoTitle}
                onChange={e => setPost({ ...post, seoTitle: e.target.value })}
                className="admin-input"
                placeholder="Keep it around 60 chars"
              />
            </div>
            <div>
              <label className="block text-sm text-dark-400 mb-1">SEO Description</label>
              <textarea
                value={post.seoDescription}
                onChange={e => setPost({ ...post, seoDescription: e.target.value })}
                className="admin-input h-20 resize-none"
                placeholder="Keep it around 155 chars"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
