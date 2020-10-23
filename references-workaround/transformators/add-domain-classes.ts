import { JSDOM } from "jsdom";
import { URL } from 'url';

const domainFragmentClassMap: Record<string, string> = {
  'wikipedia.org': 'wikipedia',
  'web.archive.org': 'archive-org',
  'ncbi.nlm.nih.gov': 'pubmed',
};

const popularDomains: Record<string, number> = {};


export async function addDomainClasses(dom: JSDOM): Promise<void> {
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
    const url = new URL(link.href);
    popularDomains[link.hostname] = (popularDomains[link.hostname] ?? 0) + 1;
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
