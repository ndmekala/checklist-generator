# checklist-generator

> A simple CLI tool to generate a checklist ✅ csv from a json configuration file

## Usage

`./checklist-generator.js <month> <year> <path/to/checklist.json>`

- `month` should be the lowercase full month name
- `year` should be the 4 digit year

You can then pipe the `stdout` wherever you’d like, but probably to something like `checklist.csv`.

## Development

- Just clone the repo and run `npm install`!

## Deployment

- Run `npx webpack`
- Copy `bundle.js` to the location of your choice
- Add a line with `#!/usr/bin/env node` to the top of the file
- Make executable with `chmod u+x bundle.js`
