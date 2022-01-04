import { RspecExample, RspecReport } from 'rspec-report-analyzer';
// eslint-disable-next-line unicorn/prefer-node-protocol
import { promises as fs } from 'fs';
import { temporaryFolder } from './global-variables';

export const concatReports = async (): Promise<void> => {
  const allFiles: string[] = await fs.readdir(temporaryFolder);

  const rspecReports = allFiles.filter(file => file.endsWith('.json'));

  const singleReport: RspecReport[] = [];

  for (const rspecReport of rspecReports) {
    const path = `${temporaryFolder}/${rspecReport}`;

    // eslint-disable-next-line unicorn/prefer-json-parse-buffer
    const report = await fs.readFile(path, 'utf-8');

    singleReport.push(JSON.parse(report));
  }

  const examples: RspecExample[] = singleReport
    .flatMap(report => report.examples)
    .filter(report => report.status !== 'pending');

  await fs.writeFile(
    `${temporaryFolder}/local-rspec-report.json`,
    JSON.stringify(examples),
  );
};
