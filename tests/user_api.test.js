const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/user');
const helper = require('./test_helper');

const api = supertest(app);

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('sekret', 10);
    const user = new User({ username: 'root', passwordHash });

    await user.save();
  });

  describe('user creation', () => {
    test('succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb();

      const newUser = {
        username: 'pansuola',
        name: 'Panu Valtanen',
        password: 'salainen',
      };

      await api
        .post('/api/users')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      const usersAtEnd = await helper.usersInDb();
      expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

      const usernames = usersAtEnd.map(u => u.username);
      expect(usernames).toContain(newUser.username);
    });

    describe('fails with proper message and status code 400 if', () => {
      test('username is already taken', async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
          username: 'root',
          name: 'Superuser',
          password: 'salainen',
        };

        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/);

        expect(result.body.error).toContain('`username` to be unique');

        const usersAtEnd = await helper.usersInDb();
        expect(usersAtEnd).toHaveLength(usersAtStart.length);
      });

      test('username is too short', async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
          username: 'fo',
          name: 'Ba',
          password: 'salainen',
        };

        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/);

        expect(result.body.error).toContain('is shorter than the minimum allowed length');

        const usersAtEnd = await helper.usersInDb();
        expect(usersAtEnd).toHaveLength(usersAtStart.length);
      });

      test('password is too short', async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
          username: 'fooo',
          name: 'Bar',
          password: 'fo',
        };

        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/);

        expect(result.body.error).toContain('is shorter than the minimum allowed length');

        const usersAtEnd = await helper.usersInDb();
        expect(usersAtEnd).toHaveLength(usersAtStart.length);
      });
    });
  });
});

afterAll(() => {
  mongoose.connection.close();
});
