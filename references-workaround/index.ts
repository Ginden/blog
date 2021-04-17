'use strict';

import { JSDOM } from 'jsdom';
import { addReferences } from './transformators/add-references';
import { addHeaderLinks } from './transformators/add-headers';
import {
    addDomainClasses,
    popularDomains,
} from './transformators/add-domain-classes';
import { chain } from 'lodash';
import { sortLdJson } from './transformators/sort-ld-json';

const fs = require('fs').promises;
if (!fs) {
    throw new Error('Your node version have to support fs.promises API');
}
const { spawnSync } = require('child_process');

const [, , outputFolder] = process.argv;

const { stdout: fileListRaw } = spawnSync('find', [outputFolder, '-print0'], {
    encoding: 'utf8',
});

const fileList = (<string>fileListRaw)
    .split('\0')
    .filter((filePath) => filePath.endsWith('.html'));

(async () => {
    const fileContents = await Promise.all(
        fileList
            .map((path) => [path, fs.readFile(path, 'utf8')])
            .map((a) => Promise.all(a)),
    );

    for (const [path, content] of fileContents) {
        console.log(`Reading ${path}`);

        const dom = new JSDOM(content);

        await addReferences(dom);
        await addHeaderLinks(dom);
        await addDomainClasses(dom);
        await sortLdJson(dom);

        const output = dom.serialize();

        if (output !== content) {
            await fs.writeFile(path, output);
        }
    }

    const popularDomainsSorted = chain(popularDomains)
        .toPairs()
        .sortBy('1')
        .reverse()
        .slice(0, 20)
        .reverse()
        .fromPairs()
        .value();
    console.error(popularDomainsSorted);
})().catch((err) => {
    setImmediate(() => {
        throw err;
    });
});
