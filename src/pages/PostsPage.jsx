import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit3, Trash2, ExternalLink } from 'lucide-react';
import { fetchAdminPosts, deletePost } from '../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadPosts = () => {
    setLoading(true);
    fetchAdminPosts({ page, limit: 10, search, status })
      .then(res => {
        setPosts(res.data.posts);
        setTotalPages(res.data.pagination.totalPages);
      })
      .catch(() => toast.error('Failed to load posts'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPosts();
  }, [page, status, search]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post? This cannot be undone.')) {
      try {
        await deletePost(id);
        toast.success('Post deleted');
        loadPosts();
      } catch (err) {
        toast.error('Failed to delete post');
      }
    }
  };

  const getStatusBadge = (postStatus) => {
    const styles = {
      published: 'bg-green-500/10 text-green-400 border-green-500/20',
      draft: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    };
    return (
      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${styles[postStatus] || styles.draft}`}>
        {postStatus.charAt(0).toUpperCase() + postStatus.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Posts</h1>
          <p className="text-dark-400 text-sm mt-1">Manage your blog articles and tutorials.</p>
        </div>
        <Link to="/posts/new" className="admin-btn-primary flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> New Post
        </Link>
      </div>

      <div className="admin-card">
        {/* Toolbar */}
        <div className="p-4 border-b border-dark-700 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input 
              type="text" 
              placeholder="Search posts..." 
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="admin-input pl-9 py-2 text-sm"
            />
          </div>
          <select 
            value={status} 
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="admin-input block w-full sm:w-auto py-2 pr-8 text-sm cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm text-dark-300 whitespace-nowrap">
            <thead className="bg-dark-800 text-dark-200">
              <tr>
                <th className="px-5 py-4 font-semibold">Title</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Category</th>
                <th className="px-5 py-4 font-semibold">Date</th>
                <th className="px-5 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-dark-500">
                    No posts found.
                  </td>
                </tr>
              ) : (
                posts.map(post => (
                  <tr key={post._id} className="hover:bg-dark-800/50 transition-colors group">
                    <td className="px-5 py-4 max-w-[300px]">
                      <div className="font-medium text-white truncate">{post.title}</div>
                      <div className="text-xs text-dark-500 flex items-center gap-2 mt-1">
                        {post.isFeatured && <span className="text-yellow-500">★</span>}
                        {post.author?.name}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {getStatusBadge(post.status)}
                    </td>
                    <td className="px-5 py-4">{post.category}</td>
                    <td className="px-5 py-4 text-xs">
                      {format(new Date(post.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a 
                          href={`http://localhost:5173/post/${post.slug}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-1.5 text-dark-400 hover:text-white bg-dark-800 rounded-md transition-colors"
                          title="View live"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <Link 
                          to={`/posts/edit/${post._id}`}
                          className="p-1.5 text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(post._id)}
                          className="p-1.5 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination offset */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-dark-700 flex justify-between items-center">
            <span className="text-sm text-dark-400">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="admin-btn-secondary px-3 py-1 text-sm"
              >
                Previous
              </button>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="admin-btn-secondary px-3 py-1 text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
