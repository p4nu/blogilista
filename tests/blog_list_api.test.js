const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);

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
},
];

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(initialBlogs);
});

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test('correct number of blogs are returned', async () => {
  const response = await api.get('/api/blogs');

  expect(response.body).toHaveLength(initialBlogs.length);
});

test('blog id is defined', async () => {
  const response = await api.get('/api/blogs');

  expect(response.body[0].id).toBeDefined();
});

test('new blog can be added', async () => {
  const newBlog = {
    title: 'This is a new blog from test',
    author: 'Blog-list api test',
    url: 'google.com',
    likes: 200,
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const response = await api.get('/api/blogs');

  const titles = response.body.map(r => r.title);

  expect(response.body).toHaveLength(initialBlogs.length + 1);
  expect(titles).toContain(
    'This is a new blog from test'
  );
});

test('a new blog with no likes added initializes as zero likes', async () => {
  const newBlog = {
    title: 'This blog gets initialized with zero likes automatically',
    author: 'Blog-list api test',
    url: 'google.com',
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const response = await api.get('/api/blogs');
  const foundBlog = response.body.find(blog =>
    blog.title === 'This blog gets initialized with zero likes automatically'
  );

  expect(response.body).toHaveLength(initialBlogs.length + 1);
  expect(foundBlog.likes).toEqual(0);
});

afterAll(() => {
  mongoose.connection.close();
});
