"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const domainFragmentClassMap = {
    'wikipedia.org': 'wikipedia',
    'web.archive.org': 'archive-org',
    'ncbi.nlm.nih.gov': 'pubmed',
};
const popularDomains = {};
async function addDomainClasses(dom) {
    var _a;
    const document = dom.window.document;
    const postContent = document.querySelector('.post-content');
    if (!postContent) {
        return;
    }
    const anchorElements = postContent.querySelectorAll('a');
    for (const link of anchorElements) {
        if (!link.href.startsWith('http')) {
            continue;
        }
        const url = new url_1.URL(link.href);
        popularDomains[link.hostname] = (_a = popularDomains[link.hostname], (_a !== null && _a !== void 0 ? _a : 0)) + 1;
        for (const [domain, className] of Object.entries(domainFragmentClassMap)) {
            if (url.host.includes(domain)) {
                link.classList.add(`${className}-link`);
                link.classList.add('link-with-icon');
                break;
            }
        }
    }
    console.error(popularDomains);
}
exports.addDomainClasses = addDomainClasses;
