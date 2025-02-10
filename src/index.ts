import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'

import ejs from 'ejs'

export interface FileInfo {
  path: string
  contents: string
}

async function templateFile(from: string, to: string, variables: any): Promise<FileInfo> {
  const template = await readFile(from, 'utf8')
  const contents = ejs.render(template, variables)
  await writeFile(to, contents)
  return { path: to, contents }
}

async function templateDirectory(from: string, to: string, variables: any): Promise<FileInfo[]> {
  await mkdir(to, { recursive: true })
  const entries = await readdir(from, { withFileTypes: true })

  // Template all files in the directory.
  const tasks = entries.map(({ name }) => {
    return scaffold(join(from, name), join(to, name), variables)
  })

  const fileSets = await Promise.all(tasks)
  return fileSets.flat()
}

export default async function scaffold(from: string, to: string, variables: any): Promise<FileInfo[]> {
  const fileInfo = await stat(from)

  // If it's a single file, just directly render and write it.
  if (fileInfo.isFile()) {
    const file = await templateFile(from, to, variables)
    return [ file ]
  }

  // If it's a directory, recursively render all files in the directory.
  if (fileInfo.isDirectory()) {
    return templateDirectory(from, to, variables)
  }

  // If it's not a file or directory, throw an error.
  throw new Error(`Path ${from} is not a file or directory`)
}
