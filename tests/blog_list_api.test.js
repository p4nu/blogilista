const mongoose = require('mongoose');
const supertest = require('supertest');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);

const Blog = require('../models/blog');

describe('when there are initially some blogs saved', () => {
  let token;

  beforeAll(async () => {
    const response = await api
      .post('/api/login')
      .send({
        username: 'root',
        password: 'sekret',
      });

    token = response.body.token;
  });

  beforeEach(async () => {
    await Blog.deleteMany({});
    await helper.initializeBlogs(token);
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
    describe('succeeds', () => {
      test('with valid data', async () => {
        const newBlog = {
          title: 'This is a new blog from test',
          author: 'Blog-list api test',
          url: 'google.com',
          likes: 200,
        };

        await api
          .post('/api/blogs')
          .set('Authorization', `Bearer ${token}`)
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

      test('inserting zero likes when likes are not declared in creation', async () => {
        const newBlog = {
          title: 'This blog gets initialized with zero likes automatically',
          author: 'Blog-list api test',
          url: 'google.com',
        };

        await api
          .post('/api/blogs')
          .set('Authorization', `Bearer ${token}`)
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
    });

    describe('fails with', () => {
      test('status code 400 if title and url are not defined', async () => {
        const newBlog = {
          author: 'AP',
        };

        await api
          .post('/api/blogs')
          .set('Authorization', `Bearer ${token}`)
          .send(newBlog)
          .expect(400);

        const blogsAtEnd = await helper.blogsInDb();

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
      });

      test('status code 401 if token is not defined', async () => {
        const newBlog = {
          title: 'This blog is valid to be added in database, but the token is missing',
          author: 'Blog-list api test',
          url: 'google.com',
        };

        await api
          .post('/api/blogs')
          .send(newBlog)
          .expect(401);

        const blogsAtEnd = await helper.blogsInDb();
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
      });
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
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      const blogsAtEnd = await helper.blogsInDb();

      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1);

      const titles = blogsAtEnd.map(b => b.title);

      expect(titles).not.toContain(blogToDelete.title);
    });

    test('fails with status code 401 if token is not included', async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToDelete = blogsAtStart[0];

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(401);

      const blogsAtEnd = await helper.blogsInDb();
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
    });
  });
});

afterAll(() => {
  mongoose.connection.close();
});
