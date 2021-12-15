import { FileGroup } from 'split-config-generator';

export const removeLeadingText = (fileGroup: FileGroup): FileGroup => {
  const existingFiles: string[] = fileGroup.files;

  const newFiles = existingFiles.map(file => {
    const specStringIndex = file.indexOf('spec');
    const newFilePath = file.substring(specStringIndex);

    return newFilePath;
  });

  return { files: newFiles };
};
