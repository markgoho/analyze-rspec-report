/* eslint-disable @typescript-eslint/prefer-for-of */
import { promises as fs } from 'fs';
import { tempFolder } from './folder-names';

export const moveRspecReports = async (
  groupFolderPath: string,
): Promise<void> => {
  const reportNames: string[] = await fs.readdir(groupFolderPath);

  for (let i = 0; i < reportNames.length; i++) {
    // Get the folder name, e.g. admin, cover_all, etc.
    const reportName = reportNames[i];

    // Create the full json report path
    const originalReportPath = `${groupFolderPath}/${reportName}/${reportName}-rspec-report.json`;

    // Make a temporary directory
    await fs.mkdir(tempFolder, { recursive: true });

    // Copy the json report to the new location
    await fs.copyFile(
      originalReportPath,
      `${tempFolder}/${reportName}-rspec-report.json`,
    );
  }
};
