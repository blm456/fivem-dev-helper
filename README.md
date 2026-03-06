# FiveM Dev

## Pages

| Page                           | Description                                                   |
| :----------------------------- | :------------------------------------------------------------ |
| [Commands](./docs/commands.md) | A list of CLI commands to use in place of the command line UI |

## Usage

Install the package globally `pnpm link -g` and run `fivem-dev` in a terminal window inside your project. Menu options guide your through the available options.

## Generated

### Builders

Custom builders resource that adds option to package.json file `"fivemIgnore": true` that prevents webpack from packing a resource.

### Types

In your resources, put .ts and .d.ts files inside a globals folder (`globals/client`, `globals/shared`, `globals/server`). After running generate types from the main menu, all your types will be available inside your resources. This only works for types and shouldn't be used to share code between resources.

Types bind to your namespace selected during project setup. For example the client globals from a resource "core" would be available from `@namespace/client/core`
