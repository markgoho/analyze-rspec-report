import { readdir, mkdir, copyFile } from 'node:fs/promises';

// eslint-disable-next-line import/no-unresolved
import { temporaryFolder } from './global-variables.js';

export const moveRspecReports = async (
  groupFolderPath: string,
): Promise<void> => {
  const reportNames: string[] = await readdir(groupFolderPath);

  for (const reportName of reportNames) {
    // Get the folder name, e.g. admin, cover_all, etc.

    // Create the full json report path
    const originalReportPath = `${groupFolderPath}/${reportName}/${reportName}-rspec-report.json`;

    // Make a temporary directory
    await mkdir(temporaryFolder, { recursive: true });

    // Copy the json report to the new location
    await copyFile(
      originalReportPath,
      `${temporaryFolder}/${reportName}-rspec-report.json`,
    );
  }
};
