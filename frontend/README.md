# Arcade Transaction System -- Frontend

## Setup

To setup for frontend development, VSCode Dev Container is recommended. Platform specific instructions is available on the official documentation at [https://code.visualstudio.com/docs/devcontainers/containers](https://code.visualstudio.com/docs/devcontainers/containers). If you wish to setup the environment yourself, follow the devcontainer config file at [.devcontainer/devcontainer.json](.devcontainer/devcontainer.json).

## Usage

```sh
$ cd frontend
# Run the frontend in development mode, which is a preview with live reload.
$ npm run dev
# To build the frontend. The result is available in the /dist directory
$ npm run build
```

## File Structures

```
.
├── astro.config.mjs		# Astro config
├── node_modules			# Node.js modules. Don't commit them into git
├── package.json			# npm packages
├── package-lock.json		# Metadata automatically manages by npm
├── post-build.sh			# For minifying html
├── public					# Static files for frontend
├── README.md				# You're here
├── src					
│   ├── components			# Put individual components here
│   ├── env.d.ts			# For typescript			
│   ├── layouts				# Put html boilerplates here
│   └── pages				# Put the pages here
└── tsconfig.json			$ Typescript config
```
