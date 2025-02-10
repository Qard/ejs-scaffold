import { strictEqual } from 'node:assert'
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import test from 'node:test'

import scaffold from './index.js'

test('template a file', async () => {
  const input = 'Hello, <%= name %>!'
  const output = 'Hello, world!'
  const variables = { name: 'world' }

  const inputFile = await tmpFile(input)
  const outputFile = tmpLocation()

  const files = await scaffold(
    inputFile,
    outputFile,
    variables
  )

  // Validate that the file was written correctly
  const result = await readFile(outputFile, 'utf8')
  strictEqual(result, output)

  // Validate that correct FileInfo is returned
  strictEqual(files.length, 1)
  const [ file ] = files
  strictEqual(file.path, outputFile)
  strictEqual(file.contents, output)
})

test('template a directory', async () => {
  const input = [
    {
      path: 'index.html',
      contents: 'Hello, <%= name %>!'
    },
    {
      path: 'subdir/index.html',
      contents: 'Hello, <%= subName %>!'
    },
  ]
  const output = [
    {
      path: 'index.html',
      contents: 'Hello, world!'
    },
    {
      path: 'subdir/index.html',
      contents: 'Hello, foobar!'
    },
  ]
  const variables = {
    name: 'world',
    subName: 'foobar'
  }

  const inputFolder = await tmpFolder(input)
  const outputFolder = tmpLocation()

  const files = await scaffold(
    inputFolder,
    outputFolder,
    variables
  )

  strictEqual(files.length, output.length)
  for (let i = 0; i < output.length; i++) {
    const found = files[i]
    const expected = output[i]

    // Validate that correct FileInfo is returned
    strictEqual(found.path, join(outputFolder, expected.path))
    strictEqual(found.contents, expected.contents)

    // Validate that the file was written correctly
    const result = await readFile(found.path, 'utf8')
    strictEqual(result, expected.contents)
  }
})

/**
 * Test helpers
 */

interface File {
  path: string
  contents: string
}

function tmpLocation() {
  const loc = join(tmpdir(), randomUUID())
  return loc
}

async function tmpFile(contents: string) {
  const path = tmpLocation()
  await ensureFile(path, contents)
  return path
}

async function tmpFolder(files: File[]) {
  const path = tmpLocation()
  for (const file of files) {
    await ensureFile(join(path, file.path), file.contents)
  }
  return path
}

async function ensureFile(path: string, contents: string) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, contents)
}
