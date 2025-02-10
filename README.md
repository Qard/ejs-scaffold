# ejs-scaffold

Scaffold a directory of files with ejs templating

## Install

```bash
npm install ejs-scaffold
```

## Usage

Make any number of template files in a directory:

```ejs
Hello, <%= name %>!
```

Then run the scaffold to generate the template files with the given variables
in the output directory:

```js
import { scaffold } from 'ejs-scaffold'

const inputDirectory = 'path/to/template'
const outputDirectory = 'path/to/output'
const variables = {
  name: 'John Doe',
  age: 30,
}

await scaffold(inputDirectory, outputDirectory, variables)
```
