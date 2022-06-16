/* eslint-disable no-console */
import { expect, test, describe, beforeAll, afterEach } from '@jest/globals';
import * as process from 'node:process';
import { execFileSync, ExecFileSyncOptions } from 'node:child_process';
import { join } from 'node:path';
import { rm, readFile } from 'node:fs/promises';
import { FileGroup } from 'split-config-generator';

describe('Testing output of actions', () => {
  // Default inputs
  const reportFolder = 'individual-reports';
  const outputReport = 'rspec-split-config.json';
  const upload = false;
  const uploadName = 'rspec-split-config';

  process.env['INPUT_INDIVIDUAL-REPORTS-FOLDER'] = reportFolder;
  process.env['INPUT_OUTPUT-REPORT'] = outputReport;
  process.env['INPUT_UPLOAD'] = upload.toString();
  process.env['INPUT_UPLOAD-NAME'] = uploadName;

  const np = process.execPath;
  // eslint-disable-next-line unicorn/prefer-module
  const ip = join(__dirname, '..', 'lib', 'main.js');
  const options: ExecFileSyncOptions = {
    env: process.env,
  };

  beforeAll(async () => {
    // Remove testing output folders and files
    await rm('rspec-processing', { recursive: true, force: true });
    await rm(outputReport, { force: true });
  });

  afterEach(async () => {
    // Remove testing output folders and files
    await rm('rspec-processing', { recursive: true, force: true });
    await rm(outputReport, { force: true });
  });

  test('test default inputs', async () => {
    try {
      // console.log(execFileSync(np, [ip], options).toString());
      execFileSync(np, [ip], options);
    } catch (error) {
      console.error('Could not exec file sync', error);
    }

    const reportFile: FileGroup[] = JSON.parse(
      await readFile(outputReport, 'utf8'),
    );

    expect(reportFile.length).toBe(3);
  });

  test('test default manual group count lower than suggested', async () => {
    process.env['INPUT_GROUP-COUNT'] = '2';
    try {
      // console.log(execFileSync(np, [ip], options).toString());
      execFileSync(np, [ip], options);
    } catch (error) {
      console.error('Could not exec file sync', error);
    }

    const reportFile: FileGroup[] = JSON.parse(
      await readFile(outputReport, 'utf8'),
    );

    expect(reportFile.length).toBe(2);
  });

  test('test default manual group count higher than allowed', async () => {
    process.env['INPUT_GROUP-COUNT'] = '15';
    try {
      // console.log(execFileSync(np, [ip], options).toString());
      execFileSync(np, [ip], options);
    } catch (error) {
      console.error('Could not exec file sync', error);
    }

    const reportFile: FileGroup[] = JSON.parse(
      await readFile(outputReport, 'utf8'),
    );

    expect(reportFile.length).toBe(3);
  });

  test('test single report path', async () => {
    // Alter inputs
    const singleReportPath =
      'benefit_sponsors/benefit_sponsors-rspec-report.json';
    process.env['INPUT_SINGLE-REPORT-PATH'] = singleReportPath;

    try {
      // console.log(execFileSync(np, [ip], options).toString());
      execFileSync(np, [ip], options);
    } catch (error) {
      console.error('Could not exec file sync', error);
    }

    const reportFile: FileGroup[] = JSON.parse(
      await readFile(outputReport, 'utf8'),
    );

    expect(reportFile.length).toBe(11);
  });
});
