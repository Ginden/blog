import { JSDOM } from 'jsdom';
import { shortHash } from '../common';

const slug = require('slug');

export async function addHeaderLinks(dom: JSDOM): Promise<void> {
    const document = dom.window.document;

    const postContent = document.querySelector('.post-content');
    if (!postContent) {
        return;
    }

    const headers: Element[] = [
        ...postContent.querySelectorAll('h1, h2, h3, h4, h5, h6'),
    ];

    const usedNames: string[] = [];

    for (const [i, header] of headers.entries()) {
        header.classList.add('post-header');
        const normalizedTextContent = header
            .textContent!.trim()
            .replace(/[\u0300-\u036f]/g, '');
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
