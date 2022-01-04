// eslint-disable-next-line unicorn/prefer-node-protocol
import { promises as fs } from 'fs';
import { temporaryFolder as temporaryFolder } from './global-variables';

export const moveRspecReports = async (
  groupFolderPath: string,
): Promise<void> => {
  const reportNames: string[] = await fs.readdir(groupFolderPath);

  for (const reportName of reportNames) {
    // Get the folder name, e.g. admin, cover_all, etc.

    // Create the full json report path
    const originalReportPath = `${groupFolderPath}/${reportName}/${reportName}-rspec-report.json`;

    // Make a temporary directory
    await fs.mkdir(temporaryFolder, { recursive: true });

    // Copy the json report to the new location
    await fs.copyFile(
      originalReportPath,
      `${temporaryFolder}/${reportName}-rspec-report.json`,
    );
  }
};
