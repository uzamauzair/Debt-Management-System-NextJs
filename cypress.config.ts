import { defineConfig } from "cypress";
export default defineConfig({
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
  env: {
    BASE_URL: "http://localhost:3000",
    USER_EMAIL: "usama19026@gmail.com",
    USER_PASSWORD: "123456789At)"
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});