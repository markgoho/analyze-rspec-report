import { FileWithRuntime } from 'split-config-generator';
import { FileWithRuntimeDictionary } from './models';
import { RspecExample } from 'rspec-report-analyzer';

export const rspecExamplesToRuntime = (
  examples: RspecExample[],
): FileWithRuntime[] => {
  const dictionary = examples.reduce(
    (totalConfig: FileWithRuntimeDictionary, example: RspecExample) => {
      const filePath = removeLeadingText(example.file_path);

      if (totalConfig[filePath] !== undefined) {
        const currentTotal = totalConfig[filePath].runtime;

        return {
          ...totalConfig,
          [filePath]: { runtime: currentTotal + example.run_time },
        };
      } else {
        return {
          ...totalConfig,
          [filePath]: { runtime: example.run_time },
        };
      }
    },
    {},
  );

  const filesWithRuntime = createFilesWithRuntime(dictionary);

  return filesWithRuntime;
};

const removeLeadingText = (filePath: string): string => {
  const specStringIndex = filePath.indexOf(filePath);
  return filePath.substring(specStringIndex);
};

const createFilesWithRuntime = (
  filesByRuntime: FileWithRuntimeDictionary,
): FileWithRuntime[] => {
  return Object.entries(filesByRuntime)
    .map(([key, value]) => {
      const { runtime } = value;
      return {
        filePath: key,
        runtime,
      };
    })
    .sort((a, b) => (a.runtime < b.runtime ? 1 : -1));
};
