const Blog = require('../models/blog');

const initialBlogs = [{
  title: 'Initial Blog One',
  author: 'Blog List API',
  url: 'google.com',
  likes: 60,
}, {
  title: 'Another blog in InitialBlogs',
  author: 'Panu Valtanen',
  url: 'youtube.com',
  likes: 5,
}];

const blogsInDb = async () => {
  const blogs = await Blog.find({});

  return blogs.map(blog => blog);
};

module.exports = {
  initialBlogs,
  blogsInDb,
};
