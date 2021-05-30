import { execFileSync } from 'child_process';
import { JSDOM } from 'jsdom';
import { copyFile, stat } from 'fs/promises';
import { join } from 'path';
import { createDomElement, shortHash } from '../common';
import {URL} from 'url';
import slug from 'slug';

const repositoryRoot = join(process.cwd(), '..');
const cacheFolder = join(repositoryRoot, '.cache');

export async function addOpenGraphData(
    dom: JSDOM,
    path: string,
): Promise<void> {
    const document = dom.window.document;

    const postContent = document.querySelector('.post-content');
    if (!postContent) {
        return;
    }

    const slicedPath = path.slice(repositoryRoot.length + '/docs'.length);

    const head = document.head;

    if (!head.querySelector('meta[property="og:image"]')) {
      const { url, baseurl } = document.documentElement.dataset;
        const title = document.querySelector<HTMLMetaElement>(
            'meta[property="og:title"]',
        )!.content;

        const hashName = `${slug(title)}-image.png`;
        const outputPath = join(repositoryRoot, 'docs', 'assets', hashName);
        const cacheFilePath = join(cacheFolder, hashName);
        const cacheEntryExists = await stat(cacheFilePath).catch(() => false);

        if (!cacheEntryExists) {
            execFileSync(
                'pango-view',
                [
                    '--font=mono',
                    '-t',
                    title,
                    '-w',
                    '128',
                    '-q',
                    '-o',
                    cacheFilePath,
                ],
                {
                    stdio: 'inherit',
                },
            );
        }
        await copyFile(cacheFilePath, outputPath);
        const fileUrlFragment = join(baseurl!, 'assets', hashName);
        const fileUrl = new URL(fileUrlFragment, url!);
        head.appendChild(
            createDomElement(dom, 'meta', {
                property: 'og:image',
                content: fileUrl.toString(),
            }),
        );
    }
}
