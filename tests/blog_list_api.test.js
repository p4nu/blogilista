const mongoose = require('mongoose');
const supertest = require('supertest');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);

const Blog = require('../models/blog');

describe('when there are initially some blogs saved', () => {
  let users;

  beforeAll(async () => {
    users = await helper.usersInDb();
  });

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
        userId: users[0]._id.toString(),
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
        userId: users[0]._id.toString(),
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
        author: 'AP',
        userId: users[0]._id.toString(),
      };

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400);

      const response = await api.get('/api/blogs');

      expect(response.body).toHaveLength(helper.initialBlogs.length);
    });
  });

  describe('updating a blog', () => {
    test('updates the like count properly', async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToUpdate = new Blog({
        ...blogsAtStart[0]._doc,
        likes: blogsAtStart[0].likes + 1,
      });

      await api
        .put(`/api/blogs/${blogToUpdate._id}`)
        .send(blogToUpdate)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);

      const updatedBlog = blogsAtEnd[0];
      expect(updatedBlog.likes).toEqual(blogToUpdate.likes);
    });
  });

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToDelete = blogsAtStart[0];

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204);

      const blogsAtEnd = await helper.blogsInDb();

      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1);

      const titles = blogsAtEnd.map(b => b.title);

      expect(titles).not.toContain(blogToDelete.title);
    });
  });
});

afterAll(() => {
  mongoose.connection.close();
});
