import request from 'supertest';
import app from './app.js'; // Your express app
import { pool } from './db.js'; // Your PG pool

describe('POST /users Integration Test', () => {
  
  // CLEANUP: This runs after all tests are finished
  afterAll(async () => {
    // Delete the specific test user we created
    await pool.query("DELETE FROM users WHERE email = 'test@example.com'");
    // Close the database connection pool
    await pool.end();
  });

  it('should successfully create a user and store it in PostgreSQL', async () => {
    const newUser = {
      username: 'TestUser123',
      email: 'test@example.com'
    };

    // Act: Send request to the API
    const response = await request(app)
      .post('/users')
      .send(newUser);

    // Assert: Check API Response
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.username).toBe(newUser.username);

    // Assert: Verify data is actually in the DATABASE (The "No Mocking" requirement)
    const dbResult = await pool.query('SELECT * FROM users WHERE email = $1', [newUser.email]);
    
    expect(dbResult.rows.length).toBe(1);
    expect(dbResult.rows[0].username).toBe(newUser.username);
    expect(dbResult.rows[0].email).toBe(newUser.email);
  });
});