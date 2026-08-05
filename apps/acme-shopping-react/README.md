# ACME Shopping React

## Local Development

To run this locally:

1. Install dependencies

    ```bash
   npm install
    ```

2. Start Development Server

    ```bash
   npm run dev
    ```

## Production Build

To build this for production:

1. Run build

    ```bash
   npm run build
    ```

2. Run build

    ```bash
   npm run preview
    ```

## Lint

This project uses ESlint, to run:

1. Install dependencies

    ```bash
   npm run lint
    ```

## Using an internal/corporate npm registry mirror

If you're on a network that requires (or prefers) an internal Artifactory/mirror, point npm at it
locally instead of committing that anywhere:

```bash
# project-local, gitignored -- only affects this repo
echo "registry=https://your-internal-mirror/..." > .npmrc
# or, machine-wide
npm config set registry https://your-internal-mirror/...
```
