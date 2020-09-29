const jwt = require('jsonwebtoken');
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

const initializeBlogs = async (token) => {
  const decodedToken = jwt.verify(token, process.env.SECRET);

  const user = await User.findById(decodedToken.id);

  const initialBlogsWithUser = [{
    ...initialBlogs[0],
    user: user._id,
  }, {
    ...initialBlogs[1],
    user: user._id,
  }];

  await Blog.insertMany(initialBlogsWithUser);
};

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
  initializeBlogs,
  usersInDb,
  blogsInDb,
};
