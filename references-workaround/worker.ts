import { promises as fs } from "fs";
import { readFile } from "fs/promises";
import { JSDOM } from "jsdom";
import { workerData } from "worker_threads";
import { addDomainClasses } from "./transformators/add-domain-classes";
import { addHeaderLinks } from "./transformators/add-headers";
import { addOpenGraphData } from "./transformators/add-open-graph-data";
import { addReferences } from "./transformators/add-references";
import { sortLdJson } from "./transformators/sort-ld-json";

const path = workerData.filePath;
(async () => {
  const content = await readFile(path, 'utf8');
  const dom = new JSDOM(content);

  await addReferences(dom);
  await addHeaderLinks(dom);
  await addDomainClasses(dom);
  await sortLdJson(dom);
  await addOpenGraphData(dom, path);

  const output = dom.serialize();

  if (output !== content) {
    await fs.writeFile(path, output);
  }
})()
  .then(() => process.exit(0))
  .catch((err) => {
    setImmediate(() => {
      throw err;
    });
  });
