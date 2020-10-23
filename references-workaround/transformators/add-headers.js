"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const slug = require('slug');
const shortHash = (s) => {
    const md5Hash = crypto_1.createHash('md5').update(s).digest();
    const numbers = [...new Uint16Array(md5Hash.buffer)];
    return numbers.map(n => n.toString(32).padStart(3, '0')).join('');
};
async function addHeaderLinks(dom) {
    const document = dom.window.document;
    const postContent = document.querySelector('.post-content');
    if (!postContent) {
        return;
    }
    const headers = [...postContent.querySelectorAll('h1, h2, h3, h4, h5, h6')];
    const usedNames = [];
    for (const [i, header] of headers.entries()) {
        header.classList.add('post-header');
        const normalizedTextContent = header.textContent.trim().replace(/[\u0300-\u036f]/g, "");
        let referenceName = slug(normalizedTextContent);
        if (usedNames.includes(referenceName)) {
            referenceName += shortHash(usedNames[i - 1]);
        }
        usedNames[i] = referenceName;
        header.setAttribute('name', referenceName);
        const anchor = document.createElement('a');
        anchor.setAttribute('href', `#${referenceName}`);
        anchor.classList.add('hash-header-link');
        anchor.textContent = '#';
        header.append(document.createTextNode(' '), anchor);
    }
}
exports.addHeaderLinks = addHeaderLinks;
