# lucide-react-sprite

A high-performance icon system for React applications that uses lucide-react components during development and generates a single, optimized SVG sprite for production builds.

## Installation

```bash
npm install lucide-react-sprite --save
```

```bash
yarn add lucide-react-sprite
```

```bash
pnpm add lucide-react-sprite
```

```bash
bun add lucide-react-sprite
```

## Usage

### 1. Use the components

Use the `<LucideIcon />` and `<CustomIcon />` components in your React application.

```jsx
import { LucideIcon, CustomIcon } from 'lucide-react-sprite'

function MyComponent() {
  return (
    <div>
      <LucideIcon name='activity' />
      <CustomIcon name='my-logo' />
    </div>
  )
}
```

### 2. Add custom icons

Place your custom SVG icons in the `public/custom-icons/` directory.

### 3. Generate the sprite

Run the `lucide-sprite` command to generate the SVG sprite. This is typically done as part of your build process.

In your `package.json`:

```json
{
  "scripts": {
    "build": "your-build-command && lucide-sprite"
  }
}
```

This will generate a `public/icons.svg` file containing all the used Lucide icons and your custom icons.

## How it works

This package provides two sets of components:

- **Development**: In development, `<LucideIcon />` renders the dynamic icon from `lucide-react`, giving you the full benefit of hot-reloading and TypeScript support. `<CustomIcon />` renders an `<img>` tag pointing to your custom SVG file.
- **Production**: In production, both `<LucideIcon />` and `<CustomIcon />` render an `<svg>` element with a `<use>` tag that points to the generated `icons.svg` sprite. This minimizes network requests and bundle size.

The `lucide-sprite` CLI tool scans your project for `<LucideIcon />` usage and custom icons, and generates a single, optimized SVG sprite containing only the icons you need.

## Screenshots

![Screenshot](./screenshot.png)
