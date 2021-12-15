/* eslint-disable no-console */
import * as core from '@actions/core';

import {
  FileWithRuntime,
  SplitConfig,
  createSplitConfig,
  runtimeDetails,
} from 'split-config-generator';
import { concatenatedReportName, tempFolder } from './global-variables';
import { RspecExample } from 'rspec-report-analyzer';

import { concatReports } from './concat-rspec-reports';
import { promises as fs } from 'fs';
import { moveRspecReports } from './move-rspec-reports';
import { rspecExamplesToRuntime } from './examples-to-runtime';

async function run(): Promise<void> {
  const singleReportPath: string | undefined =
    core.getInput('single-report-path');

  const reportPath: string =
    singleReportPath ?? `${tempFolder}/${concatenatedReportName}`;

  if (singleReportPath !== undefined) {
    console.log(`Single report path: ${singleReportPath}`);
  } else {
    const individualReportsFolder: string = core.getInput(
      'individual-reports-folder',
    );

    // Move the rspec reports to a single folder
    try {
      await moveRspecReports(individualReportsFolder);
    } catch (error) {
      if (error instanceof Error) {
        core.setFailed(`Could not move the rspec reports: ${error.message}`);
        return;
      }
    }

    // Concatenate the rspec reports
    try {
      await concatReports();
    } catch (error) {
      if (error instanceof Error) {
        core.setFailed(
          `Could not concatenate the rspec reports: ${error.message}`,
        );
        return;
      }
    }
  }

  let rspecExamplesString: string;

  try {
    rspecExamplesString = await fs.readFile(reportPath, 'utf-8');
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(`Could not read report: ${error.message}`);
    }
    return;
  }

  const rspecExamples: RspecExample[] = JSON.parse(rspecExamplesString);

  const files: FileWithRuntime[] = rspecExamplesToRuntime(rspecExamples);
  const splitConfig: SplitConfig = createSplitConfig(files);
  const details = runtimeDetails(files);
  console.log(details);

  const outputPath = core.getInput('output-report');
  try {
    await fs.writeFile(outputPath, JSON.stringify(splitConfig));
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(
        `Setting report to ${outputPath} failed: ${error.message}`,
      );
    }
  }
}

run();
