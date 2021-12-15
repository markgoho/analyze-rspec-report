/* eslint-disable no-console */
import * as artifact from '@actions/artifact';
import * as core from '@actions/core';

import {
  FileWithRuntime,
  SplitConfig,
  createSplitConfig,
  runtimeDetails,
} from 'split-config-generator';
import { RspecExample, RspecReport } from 'rspec-report-analyzer';
import { concatenatedReportName, tempFolder } from './global-variables';

import { concatReports } from './concat-rspec-reports';
import { promises as fs } from 'fs';
import { moveRspecReports } from './move-rspec-reports';
import { removeLeadingText } from './remove-leading-text';
import { rspecExamplesToRuntime } from './examples-to-runtime';

async function run(): Promise<void> {
  const singleReportPath: string = core.getInput('single-report-path');

  const reportPath: string = singleReportPath.length
    ? singleReportPath
    : `${tempFolder}/${concatenatedReportName}`;

  if (singleReportPath.length) {
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

  let rspecExamples: RspecExample[];

  if (singleReportPath.length) {
    const singleReport: RspecReport = JSON.parse(rspecExamplesString);
    rspecExamples = singleReport.examples;
  } else {
    rspecExamples = JSON.parse(rspecExamplesString);
  }

  const files: FileWithRuntime[] = rspecExamplesToRuntime(rspecExamples);
  const splitConfig: SplitConfig = singleReportPath.length
    ? createSplitConfig(files).map(removeLeadingText)
    : createSplitConfig(files);

  console.log(splitConfig);

  const details = runtimeDetails(files);
  console.log('===============================');
  console.log(details);
  console.log('===============================');

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

  // Upload the report
  const shouldUpload: boolean = core.getBooleanInput('upload');
  const uploadName: string = core.getInput('upload-name');

  if (singleReportPath.length && uploadName === 'rspec-split-config') {
    core.setFailed(
      'If a single report is to be uploaded, please provide a name for the artifact',
    );
    return;
  }

  if (shouldUpload) {
    const artifactClient = artifact.create();
    const artifactName = singleReportPath.length
      ? uploadName
      : 'group-split-config';
    const filesToUpload = [outputPath];
    const rootDirectory = '.';

    try {
      await artifactClient.uploadArtifact(
        artifactName,
        filesToUpload,
        rootDirectory,
      );
    } catch (error) {
      if (error instanceof Error) {
        core.setFailed(`Uploading the artifact failed: ${error.message}`);
      }
    }
  }
}

run();
