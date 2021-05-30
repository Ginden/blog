import { createHash } from 'crypto';
import { JSDOM } from 'jsdom';

export const letters = 'abcdefghijklmnopqrstuvwxyz';

export function createDomElement(
    dom: JSDOM,
    prop: string,
    attributes: Record<string, string | number | boolean> = {},
    children: (Element | string)[] = [],
): Element {
    const el = dom.window.document.createElement(prop);
    for (const [key, value] of Object.entries(attributes)) {
        el.setAttribute(key, String(value));
    }

    for (const child of children) {
        if (typeof child === 'string') {
            el.appendChild(dom.window.document.createTextNode(child));
        } else {
            el.appendChild(child);
        }
    }

    return el;
}

export const shortHash = (s: string) => {
    const md5Hash = createHash('md5').update(s).digest();
    const numbers: number[] = [...new Uint16Array(md5Hash.buffer)];
    return numbers.map((n) => n.toString(32).padStart(3, '0')).join('');
};
