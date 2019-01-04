'use strict';


const {JSDOM} = require('jsdom');
const fs = require('fs').promises;
if (!fs) {
    throw new Error('Your node version have to support fs.promises API');
}
const {spawnSync} = require('child_process');

const [,,outputFolder] = process.argv;

const {
    stdout: fileListRaw
} = spawnSync('find', [outputFolder, '-print0'], {encoding: 'utf8'});

const fileList = fileListRaw
    .split('\0')
    .filter((filePath) => filePath.endsWith('.html'));


(async () => {

    const fileContents = await Promise.all(fileList
        .map(path => [path, fs.readFile(path, 'utf8')])
        .map(a => Promise.all(a))
    );

    for(const [path, content] of fileContents) {
        console.log(`Reading ${path}`);

        const dom = new JSDOM(content);

        await addReferences(dom);

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


async function addReferences(dom) {
    const document = dom.window.document;

    const paras = [...document.querySelectorAll('p, li')];

    const referenceParagraphs = new Set();

    for(const p of paras) {
        const firstChild = p.firstElementChild;
        if (!firstChild) continue;
        if (!firstChild.tagName === 'STRONG') continue;
        if (!firstChild.textContent.match(/\[\d*]/)) continue;

        if (p.textContent.trim().startsWith(firstChild.textContent)) {
            referenceParagraphs.add(p);

            const newId = `reference-${firstChild.textContent.trim().slice(1,-1)}`;
            firstChild.setAttribute('id', newId);
        }
    }

    let i = 0;

    for(const p of document.querySelectorAll('div.post-content')) {
        const nodeIterator = document.createNodeIterator(p, 4 /* text nodes */);


        const replacementsList = [];
        let currentNode;

        while (currentNode = nodeIterator.nextNode()) {
            const txt = currentNode.textContent;
            const splits = txt.split(/(\[\d*\])/);
            if (splits.length === 1) continue;

            const fullSplits = splits.filter(Boolean);
            const fragmentContent = fullSplits.map(txt => {
                const m = txt.match(/(\[\d+])/);
                if (!m) return document.createTextNode(txt);
                const number = m[0].slice(1,-1);
                const el = document.createElement('a');
                el.setAttribute('href', `#reference-${number}`);
                el.setAttribute('id', `referencing-${i++}`);
                el.setAttribute('class', 'referencing');
                el.textContent = txt;
                return el;
            });

            const fragment = document.createDocumentFragment();
            for(const el of fragmentContent) fragment.appendChild(el);

            replacementsList.push([currentNode, fragment]);
        }

        for(const [nodeToReplace, newNodes] of replacementsList) {
            nodeToReplace.parentNode.replaceChild(newNodes, nodeToReplace);
        }



    }

}