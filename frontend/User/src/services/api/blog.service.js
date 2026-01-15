import axios from 'axios';

const BLOG_API_URL = import.meta.env.VITE_BLOG_API_URL || 'http://localhost:4000/api/blog';

const api = axios.create({
  baseURL: BLOG_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const blogService = {
  // Get all published posts
  getPosts: async (page = 1, limit = 10) => {
    const response = await api.get(`/posts?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get single post by slug
  getPostBySlug: async (slug) => {
    const response = await api.get(`/posts/${slug}`);
    return response.data;
  },

  // Get related posts
  getRelatedPosts: async (id, limit = 3) => {
    const response = await api.get(`/posts/${id}/related?limit=${limit}`);
    return response.data;
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Get posts by category
  getPostsByCategory: async (slug, page = 1, limit = 10) => {
    const response = await api.get(`/categories/${slug}/posts?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get tags
  getTags: async () => {
    const response = await api.get('/tags');
    return response.data;
  },

  // Get posts by tag
  getPostsByTag: async (slug, page = 1, limit = 10) => {
    const response = await api.get(`/tags/${slug}/posts?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Search posts
  searchPosts: async (query, page = 1, limit = 10) => {
    const response = await api.get(`/search?q=${query}&page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get author profile
  getAuthorProfile: async (slug) => {
    const response = await api.get(`/authors/${slug}`);
    return response.data;
  },
};

export default blogService;
