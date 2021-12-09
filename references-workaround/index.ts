'use strict';

import { cpus } from 'os';
import { chunk } from 'lodash';
import { join } from 'path';

const { Worker } = require('worker_threads');

const fs = require('fs').promises;
if (!fs) {
    throw new Error('Your node version have to support fs.promises API');
}
const { spawnSync } = require('child_process');

const [, , outputFolder] = process.argv;

const { stdout: fileListRaw } = spawnSync('find', [outputFolder, '-print0'], {
    encoding: 'utf8',
});

const fileList = (<string>fileListRaw)
    .split('\0')
    .filter((filePath) => filePath.endsWith('.html'));

(async () => {
    for (const files of chunk<string>(fileList, cpus().length)) {
        await Promise.all(
            files.map((filePath) => {
                console.log(`Spawning worker for ${filePath}`);
                return new Promise((resolve, reject) => {
                    const worker = new Worker(join(__dirname, 'worker.js'), {
                        workerData: {
                            filePath,
                        },
                    });
                    worker.on('error', reject);
                    worker.on('exit', (exitCode: number) => {
                        if (exitCode === 0) {
                            resolve(null);
                        } else {
                            reject(new Error(String(exitCode)));
                        }
                    });
                }).then(() => console.log(`Processing ended for ${filePath}`));
            }),
        );
    }
})().catch((err) => {
    console.error(err);
    setImmediate(() => {
        throw err;
    });
});
