'use strict';

import { JSDOM } from "jsdom";
import { addReferences } from './transformators/add-references';
import { addHeaderLinks } from './transformators/add-headers';
import { addDomainClasses } from './transformators/add-domain-classes';

const fs = require('fs').promises;
if (!fs) {
  throw new Error('Your node version have to support fs.promises API');
}
const { spawnSync } = require('child_process');

const [, , outputFolder] = process.argv;


const {
  stdout: fileListRaw
} = spawnSync('find', [outputFolder, '-print0'], { encoding: 'utf8' });

const fileList = (<string>fileListRaw)
  .split('\0')
  .filter((filePath) => filePath.endsWith('.html'));


(async () => {

  const fileContents = await Promise.all(fileList
    .map(path => [path, fs.readFile(path, 'utf8')])
    .map(a => Promise.all(a))
  );


  for (const [path, content] of fileContents) {
    console.log(`Reading ${path}`);

    const dom = new JSDOM(content);

    await addReferences(dom);
    await addHeaderLinks(dom);
    await addDomainClasses(dom);

    const output = dom.serialize();

    if (output !== content) {
      await fs.writeFile(path, output);
    }
  }
})().catch(err => {
  setImmediate(() => {
    throw err;
  });
});
