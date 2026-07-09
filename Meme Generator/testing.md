# Steps to set up the tooling:

1. Install the testing framework: `vitest`.
```
npm install -D vitest
```

2. Install the React Testing Library and its companions to render React components, add DOM matchers, and initiate user events.
```
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

3. Install a DOM environment to run the tests: `jsdom`.
```
npm install -D jsdom
```

4. Create the setup file in the project root, `test-setup.js`, and in it add:
```
import "@testing-library/jest-dom/vitest";
import { afterEach } from 'vitest'
import { cleanup } from "@testing-library/react";

afterEach(() => {
    cleanup();
});
```

5. In `vite.config.js`, add this `test` config:
```
test: {
    setupFiles: ["./test-setup.js"],
    environment: 'jsdom'
  }
```

6. Add the test script in `package.json`.
```
"test": "vitest"
```

7. Run `vitest` in `watch mode`.
```
npm run test
```

8. Install Mock Service Worker to test external service like a fetch request from an API
```
npm i -D msw
```

9. Install code coverage to guage how much the app's source code is executed during testing
```
npm i -D @vitest/coverage-istanbul
```

10. Add the following to scripts in package.json for the coverage testing
```
"test:coverage": "vitest --coverage"
```

11. Add the folowing to vite.config.js for the coverage testing under test
```
coverage: {
      provider: 'istanbul'
    }
```