/* eslint-disable unicorn/no-array-reduce */
import { FileWithRuntime } from 'split-config-generator';
import { RspecExample } from 'rspec-report-analyzer';

// eslint-disable-next-line import/no-unresolved
import { FileWithRuntimeDictionary } from './runtime-dictionary.js';

export const rspecExamplesToRuntime = (
  examples: RspecExample[],
): FileWithRuntime[] => {
  const dictionary = examples.reduce(
    (totalConfig: FileWithRuntimeDictionary, example: RspecExample) => {
      const filePath = removeLeadingDotSlash(example.file_path);

      if (totalConfig[filePath] === undefined) {
        return {
          ...totalConfig,
          [filePath]: { runtime: example.run_time },
        };
      } else {
        const currentTotal: number = totalConfig[filePath]?.runtime as number;

        return {
          ...totalConfig,
          [filePath]: { runtime: currentTotal + example.run_time },
        };
      }
    },
    {},
  );

  const filesWithRuntime = createFilesWithRuntime(dictionary);

  return filesWithRuntime;
};

const removeLeadingDotSlash = (filePath: string): string => {
  return filePath.replace(/\.\//, '');
};

const createFilesWithRuntime = (
  filesByRuntime: FileWithRuntimeDictionary,
): FileWithRuntime[] => {
  const filesWithRuntime: FileWithRuntime[] = [];

  for (const filePath in filesByRuntime) {
    const fileWithRuntime = filesByRuntime[filePath];

    if (fileWithRuntime !== undefined) {
      filesWithRuntime.push({
        filePath,
        runtime: fileWithRuntime === undefined ? 0 : fileWithRuntime?.runtime,
      });
    }
  }

  const filteredRuntimes: FileWithRuntime[] = filesWithRuntime.filter(
    f => f.runtime !== undefined,
  );

  return filteredRuntimes.sort((a, b) => (a.runtime < b.runtime ? 1 : -1));
};
