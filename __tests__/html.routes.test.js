/**
 * @fileoverview Integration test for HTML error routes.
 * Verifies that the /v1/error_test endpoint returns an HTML error page
 * with the expected content and status code.
 */

const request = require('supertest');
const app = require('../app');

describe('HTML Error Routes', () => {
  /**
   * Ensures that requesting /v1/error_test with Accept: text/html
   * returns an HTTP 200 response containing a valid HTML error page.
   */
  test('GET /v1/error_test returns HTML page', async () => {
    const res = await request(app)
      .get('/v1/error_test')
      .set('Accept', 'text/html');

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('<!DOCTYPE html>');
    expect(res.text).toContain('Express-MongoDB API Framework - Error');
  });
});
