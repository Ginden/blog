'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const jsdom_1 = require("jsdom");
const add_references_1 = require("./transformators/add-references");
const add_headers_1 = require("./transformators/add-headers");
const add_domain_classes_1 = require("./transformators/add-domain-classes");
const fs = require('fs').promises;
if (!fs) {
    throw new Error('Your node version have to support fs.promises API');
}
const { spawnSync } = require('child_process');
const [, , outputFolder] = process.argv;
const { stdout: fileListRaw } = spawnSync('find', [outputFolder, '-print0'], { encoding: 'utf8' });
const fileList = fileListRaw
    .split('\0')
    .filter((filePath) => filePath.endsWith('.html'));
(async () => {
    const fileContents = await Promise.all(fileList
        .map(path => [path, fs.readFile(path, 'utf8')])
        .map(a => Promise.all(a)));
    for (const [path, content] of fileContents) {
        console.log(`Reading ${path}`);
        const dom = new jsdom_1.JSDOM(content);
        await add_references_1.addReferences(dom);
        await add_headers_1.addHeaderLinks(dom);
        await add_domain_classes_1.addDomainClasses(dom);
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
