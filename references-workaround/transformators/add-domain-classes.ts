import { JSDOM } from 'jsdom';
import { URL } from 'url';

const domainFragmentClassMap: Record<string, string> = {
    'wikipedia.org': 'wikipedia',
    'web.archive.org': 'archive-org',
    'ncbi.nlm.nih.gov': 'pubmed',
    'facebook.com': 'facebook',
    'doi.org': 'doi',
    'gov.pl': 'polish-gov'
};

export const popularDomains: Record<string, number> = {};

export async function addDomainClasses(dom: JSDOM): Promise<void> {
    const document = dom.window.document;

    const anchorElements = document.querySelectorAll('a');
    for (const link of anchorElements) {
        if (!link.href.startsWith('http')) {
            continue;
        }
        const url = new URL(link.href);
        popularDomains[link.hostname] =
            (popularDomains[link.hostname] ?? 0) + 1;
        for (const [domain, className] of Object.entries(
            domainFragmentClassMap,
        )) {
            if (url.host.includes(domain)) {
                if (domain !== link.hostname) {
                    popularDomains[domain] = (popularDomains[domain] ?? 0) + 1;
                }
                link.classList.add(`${className}-link`);
                link.classList.add('link-with-icon');
                break;
            }
        }
    }
}
