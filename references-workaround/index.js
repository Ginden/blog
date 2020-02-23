'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const jsdom_1 = require("jsdom");
const fs = require('fs').promises;
if (!fs) {
    throw new Error('Your node version have to support fs.promises API');
}
const { spawnSync } = require('child_process');
const [, , outputFolder] = process.argv;
const letters = 'abcdefghijklmnopqrstuvwxyz';
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
/**
 * Adds references to dom tree
 * @param dom
 * @return {Promise<void>}
 */
async function addReferences(dom) {
    const document = dom.window.document;
    const paras = [...document.querySelectorAll('p, li')];
    const referenceParagraphs = new Set();
    for (const p of paras) {
        if (!p) {
            continue;
        }
        const firstChild = p.firstElementChild;
        if (firstChild === null) {
            continue;
        }
        if (firstChild.tagName !== 'STRONG') {
            continue;
        }
        const textContent = firstChild.textContent;
        if (!(textContent.match(/\[\d*]/))) {
            continue;
        }
        if (p.textContent.trim().startsWith(textContent)) {
            referenceParagraphs.add(p);
            const newId = `reference-${textContent.trim().slice(1, -1)}`;
            firstChild.setAttribute('id', newId);
        }
    }
    let i = 0;
    const referencesMap = Object.create(null);
    for (const p of document.querySelectorAll('div.post-content')) {
        const nodeIterator = document.createNodeIterator(p, 4 /* text nodes */);
        const replacementsList = [];
        let currentNode;
        while (currentNode = nodeIterator.nextNode()) {
            const txt = currentNode.textContent;
            const splits = txt.split(/(\[\d*\])/);
            if (splits.length === 1)
                continue;
            const fullSplits = splits.filter(Boolean);
            const fragmentContent = fullSplits.map(txt => {
                const m = txt.match(/(\[\d+])/);
                if (!m)
                    return document.createTextNode(txt);
                const number = m[0].slice(1, -1);
                const el = document.createElement('a');
                el.setAttribute('href', `#reference-${number}`);
                el.setAttribute('id', `referencing-${i++}`);
                referencesMap[number] = referencesMap[number] || [];
                referencesMap[number].push(el);
                el.setAttribute('data-target', `reference-${number}`);
                el.classList.add('referencing');
                el.textContent = txt;
                return el;
            });
            const fragment = document.createDocumentFragment();
            for (const el of fragmentContent)
                fragment.appendChild(el);
            replacementsList.push([currentNode, fragment]);
        }
        for (const [nodeToReplace, newNodes] of replacementsList) {
            nodeToReplace.parentNode.replaceChild(newNodes, nodeToReplace);
        }
        for (const [referenceId, references] of Object.entries(referencesMap)) {
            const targetNode = document.querySelector(`#reference-${referenceId}`);
            if (!targetNode) {
                continue;
            }
            const returnList = document.createDocumentFragment();
            returnList.append(document.createTextNode(' '), ...references.slice(0, -1).map((r, i) => {
                const a = document.createElement('a');
                a.textContent = `^${letters[i]}`;
                a.href = `#${r.getAttribute('id')}`;
                a.classList.add('reference-return');
                const space = document.createTextNode(' ');
                const fragment = document.createDocumentFragment();
                if (r === targetNode) {
                    return fragment;
                }
                fragment.append(a, space);
                return fragment;
            }));
            targetNode.parentElement.insertBefore(returnList, targetNode.nextSibling);
        }
    }
}
