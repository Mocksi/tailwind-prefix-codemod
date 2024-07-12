# Tailwind Prefix Codemod

Effortlessly add customizable prefixes to Tailwind CSS classes in your codebase. Optimize your Tailwind integration and prevent class name conflicts.
![whimsy-illustration-of-a-bird-with-a-long-tail](https://github.com/user-attachments/assets/61e30ec5-b2cb-4c7d-bde3-bcb84ec44099)

## Table of Contents
- [Why This Tool Exists](#why-this-tool-exists)
- [Features](#features)
- [Usage](#usage)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Dependencies](#dependencies)
- [License](#license)
- [Contributing](#contributing)

## Why This Tool Exists

The `prefix` option in Tailwind CSS allows you to add a custom prefix to all generated utility classes. This feature is particularly useful when integrating Tailwind CSS into existing projects where naming conflicts might arise. By setting a prefix, such as `tw-`, you ensure that all Tailwind classes are uniquely identified, avoiding clashes with other CSS frameworks or custom styles.

### Example Configuration

To add a `tw-` prefix to your Tailwind classes, configure the `tailwind.config.js` file as follows:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: 'tw-',
}
```

With this configuration, Tailwind generates classes like:

```css
.tw-text-left {
  text-align: left;
}
.tw-text-center {
  text-align: center;
}
.tw-text-right {
  text-align: right;
}
```

Classes with responsive or state modifiers will be prefixed as well:

```html
<div class="tw-text-lg md:tw-text-xl tw-bg-red-500 hover:tw-bg-blue-500">
  <!-- -->
</div>
```

For negative values, the prefix is added after the dash modifier:

```html
<div class="-tw-mt-8">
  <!-- -->
</div>
```

However, this built-in prefixing only applies to Tailwind-generated classes. Custom utilities need to be manually prefixed:

```css
@layer utilities {
  .tw-bg-brand-gradient { /* ... */ }
}
```

### Why Use Tailwind Prefix Codemod?

While Tailwind's `prefix` option is powerful, applying it to an existing codebase can be labor-intensive. The Tailwind Prefix Codemod automates this process, quickly and accurately updating all Tailwind classes in your project to include the desired prefix. This ensures consistency and saves valuable development time, especially in large codebases.

By integrating Tailwind Prefix Codemod, you can effortlessly maintain a clean and conflict-free CSS environment, allowing you to focus on building great features without worrying about class name collisions.

## Features

- Automated addition of customizable prefixes to Tailwind CSS classes.
- Supports JavaScript, TypeScript, and JSX files.
- Handles various Tailwind class formats:
  - Standard classes (e.g., `bg-red-500` becomes `prefix-bg-red-500`)
  - Responsive classes (e.g., `sm:bg-red-500` becomes `sm:prefix-bg-red-500`)
  - Pseudo-class variants (e.g., `hover:bg-blue-600` becomes `hover:prefix-bg-blue-600`)
  - Arbitrary values (e.g., `bg-[#123456]` becomes `prefix-bg-[#123456]`)
- Preserves non-Tailwind classes.
- Dry-run option for safely previewing changes.

## Usage

1. **Build the project:**

    ```bash
    npm run build
    ```

2. **Run the codemod:**

    ```bash
    npm run codemod -- <path-to-your-files>
    ```

3. **For a dry run (no changes applied):**

    ```bash
    npm run codemod:dry -- <path-to-your-files>
    ```

## Configuration

Customize the prefix by modifying the `defaultPrefix` variable in `add-mw-prefix.ts`. The default prefix is `mw-`.

## Development

### Prerequisites

- Node.js
- npm

### Setup

1. Clone the repository:

    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

### Scripts

- `npm run build`: Compiles TypeScript files.
- `npm run codemod`: Runs the codemod on specified files.
- `npm run codemod:dry`: Executes the codemod in dry-run mode.
- `npm test`: Runs the test suite.

## Testing

This project uses Jest for testing. Run the tests with:

```bash
npm test
```

## Project Structure

- `add-mw-prefix.ts`: Core codemod logic.
- `add-prefix.test.ts`: Test suite for the codemod.
- `jest.config.js`: Jest configuration.
- `tsconfig.json`: TypeScript configuration.
- `package.json`: Project metadata and dependencies.

## Dependencies

- `jscodeshift`: For parsing and transforming JavaScript code.
- `TypeScript`: For static typing.
- `Jest`: For testing.

## License

This project is licensed under the ISC License.

## Contributing

Contributions are welcome! Please submit a Pull Request.
