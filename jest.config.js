/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // frontend and backend have their own dependency management and test subcommands
  testPathIgnorePatterns: [
    "frontend",
    "backend"
  ],
};