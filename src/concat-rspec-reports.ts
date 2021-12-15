/* eslint-disable @typescript-eslint/prefer-for-of */
import { RspecExample, RspecReport } from 'rspec-report-analyzer';
import { promises as fs } from 'fs';
import { tempFolder } from './global-variables';

export const concatReports = async (): Promise<void> => {
  const allFiles: string[] = await fs.readdir(tempFolder);

  const rspecReports = allFiles.filter(file => file.endsWith('.json'));

  const singleReport: RspecReport[] = [];

  for (let index = 0; index < rspecReports.length; index++) {
    const path = `${tempFolder}/${rspecReports[index]}`;

    const report = await fs.readFile(path, 'utf-8');

    singleReport.push(JSON.parse(report));
  }

  const examples: RspecExample[] = singleReport
    .map(report => report.examples)
    .flat()
    .filter(report => report.status !== 'pending');

  await fs.writeFile(
    `${tempFolder}/local-rspec-report.json`,
    JSON.stringify(examples),
  );
};
