const Blog = require('../models/blog');
const User = require('../models/user');

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

const usersInDb = async () => {
  const users = await User.find({});

  return users.map(user => user);
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});

  return blogs.map(blog => blog);
};

module.exports = {
  initialBlogs,
  usersInDb,
  blogsInDb,
};
