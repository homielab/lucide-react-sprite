# lucide-react-sprite Example

This directory contains an example Next.js project that demonstrates how to use the `lucide-react-sprite` package.

## Setup

1.  **Navigate to the root of the `lucide-react-sprite` project.**
2.  **Build the `lucide-react-sprite` package:**
    ```bash
    npm install
    npm run build
    ```
3.  **Link the package globally:**
    ```bash
    npm link
    ```
4.  **Navigate into the `example` directory:**
    ```bash
    cd example
    ```
5.  **Install the example's dependencies and link the package:**
    ```bash
    npm install
    ```
    The `postinstall` script will automatically run `npm link lucide-react-sprite`.

## Running the Example

### Development

To run the example in development mode:

```bash
npm run dev
```

This will start the Next.js development server. You can view the example at [http://localhost:3000](http://localhost:3000).

In development, the icons are loaded as individual components and images, with hot-reloading enabled.

### Production

To build the example for production:

```bash
npm run build
```

This will first run the `lucide-sprite` command to generate the `public/icons.svg` sprite, and then build the Next.js application.

To run the production server:

```bash
npm run start
```

You can view the production build at [http://localhost:3000](http://localhost:3000).

In production, the icons are loaded from the single, optimized SVG sprite.