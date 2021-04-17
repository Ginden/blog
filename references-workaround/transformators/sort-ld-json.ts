import { JSDOM } from 'jsdom';
import { chain } from 'lodash';

function sortAny<T = any>(obj: T): T {
    if (
        typeof obj === 'string' ||
        typeof obj === 'number' ||
        typeof obj === 'boolean' ||
        obj === null
    ) {
        return obj;
    }
    if (Array.isArray(obj)) {
        return (obj as any).map(sortAny);
    }
    if (typeof obj === 'object') {
        return chain(obj as any)
            .toPairs()
            .sortBy('0')
            .map(([k, v]) => [k, sortAny(v)])
            .fromPairs()
            .value() as any;
    }

    throw new Error(String(obj));
}

function sortJson(obj: string) {
    const parsed = JSON.parse(obj);
    const sorted = sortAny(parsed);
    return JSON.stringify(sorted);
}

export async function sortLdJson(dom: JSDOM): Promise<void> {
    const document = dom.window.document;

    const scripts: HTMLScriptElement[] = [
        ...document.querySelectorAll('script'),
    ];

    for (const script of scripts) {
        const { type, text } = script;
        if (type === 'application/ld+json') {
            script.text = '\n' + sortJson(text);
        }
    }
}
