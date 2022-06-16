import { RspecExample, RspecReport } from 'rspec-report-analyzer';
import { readdir, readFile, writeFile } from 'node:fs/promises';

// eslint-disable-next-line import/no-unresolved
import { temporaryFolder } from './global-variables.js';

export const concatReports = async (): Promise<void> => {
  const allFiles: string[] = await readdir(temporaryFolder);

  const rspecReports = allFiles.filter(file => file.endsWith('.json'));

  const singleReport: RspecReport[] = [];

  for (const rspecReport of rspecReports) {
    const path = `${temporaryFolder}/${rspecReport}`;

    const report = await readFile(path, 'utf8');

    singleReport.push(JSON.parse(report));
  }

  const examples: RspecExample[] = singleReport
    .flatMap(report => report.examples)
    .filter(report => report.status !== 'pending');

  await writeFile(
    `${temporaryFolder}/local-rspec-report.json`,
    JSON.stringify(examples),
  );
};
