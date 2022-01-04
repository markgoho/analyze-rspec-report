import { expect, test, describe, beforeAll, afterEach } from '@jest/globals';
import * as process from 'process';
import * as cp from 'child_process';
import * as path from 'path';
import { promises as fs } from 'fs';
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
  const ip = path.join(__dirname, '..', 'lib', 'main.js');
  const options: cp.ExecFileSyncOptions = {
    env: process.env,
  };

  beforeAll(async () => {
    // Remove testing output folders and files
    await fs.rm('rspec-processing', { recursive: true, force: true });
    await fs.rm(outputReport, { force: true });
  });

  afterEach(async () => {
    // Remove testing output folders and files
    await fs.rm('rspec-processing', { recursive: true, force: true });
    await fs.rm(outputReport, { force: true });
  });

  test('test default inputs', async () => {
    try {
      // console.log(cp.execFileSync(np, [ip], options).toString());
      cp.execFileSync(np, [ip], options);
    } catch (e) {
      console.error('Could not exec file sync', e);
    }

    const reportFile: FileGroup[] = JSON.parse(
      await fs.readFile(outputReport, 'utf8'),
    );

    expect(reportFile.length).toBe(3);
  });

  test('test default manual group count lower than suggested', async () => {
    process.env['INPUT_GROUP-COUNT'] = '2';
    try {
      // console.log(cp.execFileSync(np, [ip], options).toString());
      cp.execFileSync(np, [ip], options);
    } catch (e) {
      console.error('Could not exec file sync', e);
    }

    const reportFile: FileGroup[] = JSON.parse(
      await fs.readFile(outputReport, 'utf8'),
    );

    expect(reportFile.length).toBe(2);
  });

  test('test default manual group count higher than allowed', async () => {
    process.env['INPUT_GROUP-COUNT'] = '15';
    try {
      // console.log(cp.execFileSync(np, [ip], options).toString());
      cp.execFileSync(np, [ip], options);
    } catch (e) {
      console.error('Could not exec file sync', e);
    }

    const reportFile: FileGroup[] = JSON.parse(
      await fs.readFile(outputReport, 'utf8'),
    );

    expect(reportFile.length).toBe(3);
  });

  test('test single report path', async () => {
    // Alter inputs
    const singleReportPath =
      'benefit_sponsors/benefit_sponsors-rspec-report.json';
    process.env['INPUT_SINGLE-REPORT-PATH'] = singleReportPath;

    try {
      // console.log(cp.execFileSync(np, [ip], options).toString());
      cp.execFileSync(np, [ip], options);
    } catch (e) {
      console.error('Could not exec file sync', e);
    }

    const reportFile: FileGroup[] = JSON.parse(
      await fs.readFile(outputReport, 'utf8'),
    );

    expect(reportFile.length).toBe(11);
  });
});
