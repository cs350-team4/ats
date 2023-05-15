# Arcade Transaction System -- Frontend

## Setup

To setup for frontend development, VSCode Dev Container is recommended. Platform specific instructions is available on the official documentation at [https://code.visualstudio.com/docs/devcontainers/containers](https://code.visualstudio.com/docs/devcontainers/containers). If you wish to setup the environment yourself, follow the devcontainer config file at [.devcontainer/devcontainer.json](.devcontainer/devcontainer.json).

## Usage

```sh
$ cd frontend
# Install dependencies
# Tip: If the dependencies are messed up, simply delete the node_module folder.
$ npm install
# Run the frontend in development mode, which is a preview with live reload.
$ npm run dev
# To build the frontend. The result is available in the /dist directory
$ npm run build
# Open storybook, a component documentation and testing framework
$ npm run storybook
```

## File Structures

```
.
├── astro.config.mjs              # Astro config
├── node_modules                  # Node.js modules. Don't commit them into git
├── package.json                  # npm packages
├── package-lock.json             # Metadata automatically manages by npm
├── README.md                     # You're here
├── post-build.sh                 # For minifying html and other post processings
├── public                        # Put static files for frontend here
├── src					
│   ├── components                # Put individual components here
│   │   ├── [Name].stories.tsx    # For storybook (documentation and testing)
│   │   ├── [Name].tsx            # Actual component code
│   ├── env.d.ts                  # For typescript
│   ├── layouts                   # Put html boilerplates here
│   └── pages                     # Put the pages here
└── tsconfig.json                 # Typescript config
```
