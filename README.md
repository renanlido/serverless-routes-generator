# @renanlido/serverless-routes-generator

![GitHub Repo stars](https://img.shields.io/github/stars/renanlido/serverless-routes-generator?style=social)
![npm](https://img.shields.io/npm/v/serverless-routes-generator?style=plastic)
![GitHub](https://img.shields.io/github/license/renanlido/serverless-routes-generator?style=plastic)
![npm](https://img.shields.io/npm/dy/serverless-routes-generator?style=plastic)
![npm](https://img.shields.io/npm/dw/serverless-routes-generator?style=plastic)
![GitHub top language](https://img.shields.io/github/languages/top/renanlido/serverless-routes-generator?style=plastic)

Full starter stack to develop CJS/ESM compatible npm packages with TypeScript, Vitest, ESLint, Prettier, and GitHub Actions.

Introducing serverless-routes-generator – an npm package designed to simplify route creation for Serverless applications. With just a few commands, you can effortlessly generate and manage routes in your serverless.ts file, eliminating the need for manual configuration. Whether you’re building a small project or scaling a complex architecture, serverless-routes-generator streamlines your workflow, allowing you to focus on developing features instead of handling boilerplate setup. Enhance your Serverless development experience today with this intuitive and efficient tool!

## Tools

- **TypeScript**: TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.
- **biome**: Biome statically analyzes your code to quickly find problems.
- **GitHub Actions**: Automate your workflow from idea to production.
- **tsup** - Zero-config bundler for tiny TypeScript libraries.
- **glob** - Match files using the patterns the shell uses, like stars and stuff.

## Features

- **ESM/CJS ready** - Write your code in TypeScript and publish it as ESM and CJS with 0 configuration.
- **Are The types wrong? ready** - Passes all the checks for typings on <https://arethetypeswrong.github.io/> by default.
- **ESM/CJS test apps setup** - Test your package in both ESM and CJS environments already setup for you.
- **Test runner setup** - Coming soon
- **Linting setup** - Lint your code with ESLint and Prettier already setup for you.
- **GitHub Actions setup** - Automate deployments to npm by using GitHub Actions.

## Setup

1. Install the package:

npm

```bash
npm install @renanlido/serverless-routes-generator
```

yarn

```bash
yarn add @renanlido/serverless-routes-generator
```

pnpm

```bash
pnpm add @renanlido/serverless-routes-generator
```

2. Create de configuration file on root of your project:

javascript

```javascript
 module.exports = {
  pathPattern: "modules/**/handler.ts",
  projectRoot: "example/src",
  generatedFileName: "serverless-route",
};
```

json

```json
{
 "pathPattern": "modules/**/handler.ts",
 "projectRoot": "example/src",
 "generatedFileName": "serverless-route"
}

```

3. Integrate the functional decorator on your serverless handler:

```typescript
import { createHandler } from "@renanlido/serverless-routes-generator";

export const generatePresignedLink = createHandler(
  {
    method: 'POST',
    path: 'test/route-path',
    cors: true,
    name: 'route-path',
  },
  () => {
  // Any handler function here

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Hello World' }),
    }
  },
)
```

4. Run the command to generate the routes:

```bash
npx @renanlido/serverless-routes-generator

```

## Scripts

- `npm run build` - Build the package.
- `npm run test` - Run the tests.
- `npm run lint` - Lint the code.
- `npm run dev` - Start the package and ESM test app in watch mode for development.
- `npm run dev:cjs` - Start the package and CJS test app in watch mode for development.
