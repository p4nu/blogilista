const mongoose = require('mongoose');
const supertest = require('supertest');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);

const Blog = require('../models/blog');

describe('when there are initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    await Blog.insertMany(helper.initialBlogs);
  });

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('correct number of blogs are returned', async () => {
    const response = await api.get('/api/blogs');

    expect(response.body).toHaveLength(helper.initialBlogs.length);
  });

  test('blog id is defined', async () => {
    const response = await api.get('/api/blogs');

    expect(response.body[0].id).toBeDefined();
  });

  describe('creation of a new blog', () => {
    test('succeeds with valid data', async () => {
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

      expect(response.body).toHaveLength(helper.initialBlogs.length + 1);
      expect(titles).toContain(
        'This is a new blog from test'
      );
    });

    test('succeeds to insert zero likes when it is not declared before', async () => {
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

      expect(response.body).toHaveLength(helper.initialBlogs.length + 1);
      expect(foundBlog.likes).toEqual(0);
    });

    test('fails with status code 400 if title and url are not defined', async () => {
      const newBlog = {
        author: 'AP'
      };

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400);

      const response = await api.get('/api/blogs');

      expect(response.body).toHaveLength(helper.initialBlogs.length);
    });
  });
});

afterAll(() => {
  mongoose.connection.close();
});
