module.exports = {
  
  setupFiles: ['dotenv/config'],
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['**/controllers/*.js', '**/models/*.js', '**/routes/*.js'],
  
};
