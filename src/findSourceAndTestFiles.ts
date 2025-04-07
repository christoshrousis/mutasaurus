import { expandGlob } from "@std/fs";

const ALL_TYPESCRIPT_FILES_GLOB = "**/*.ts";
const HIDDEN_DIRECTORIES_GLOB = ["**/.*/**"];

/**
 * Represents a file in the file system for the given user's project.
 */
type File = {
  /** The absolute path to the file. */
  path: string;
  /** The relative path to the file. Used as the unique identifier, and as the path to the file in the working directory. */
  relativePath: string;
  /** The content of the file. The content is read at least once for all files, whether it's a source or test file. */
  content: string;
};

/**
 * Typing helper, indicating source file.
 * A source file is any file that is not a test file.
 * A source file contains many "Points of Mutation" (PoM), which are the individual units of code that can be mutated.
 *
 * Currently, just a File.
 */
export type SourceFile = File;
/**
 * Typing helper, indicating test file.
 * A test file is any file that contains tests for the given project.
 * A test file will contain many test cases, which cover source files.
 *
 * Currently, just a File.
 */
export type TestFile = File;

export const findSourceAndTestFiles = async (): Promise<
  {
    sourceFiles: SourceFile[];
    testFiles: TestFile[];
  }
> => {
  const currentWorkingDirectory = Deno.cwd();

  const sourceFiles: SourceFile[] = [];
  const testFiles: TestFile[] = [];
  /**
   * Iterate over all files in the root directory where this is running.
   * if the file has a _test.ts, .test.ts or .spec.ts extension, add it to the list.
   * else, if the file contains the content "Deno.test(" add it to the list.
   * else, if the file imports from @std/assert, add it to the list.
   */

  for await (
    const file of expandGlob(ALL_TYPESCRIPT_FILES_GLOB, {
      exclude: HIDDEN_DIRECTORIES_GLOB,
    })
  ) {
    const readFile = await Deno.readTextFile(file.path);

    if (
      file.name.endsWith("_test.ts") || file.name.endsWith(".test.ts") ||
      file.name.endsWith(".spec.ts")
    ) {
      testFiles.push({
        path: file.path,
        relativePath: file.path.replace(currentWorkingDirectory, ""),
        content: readFile,
      });
    } else {
      if (readFile.includes("Deno.test(")) {
        testFiles.push({
          path: file.path,
          relativePath: file.path.replace(currentWorkingDirectory, ""),
          content: readFile,
        });
      } else if (readFile.includes("@std/assert")) {
        testFiles.push({
          path: file.path,
          relativePath: file.path.replace(currentWorkingDirectory, ""),
          content: readFile,
        });
      }
    }
  }

  /**
   * Iterate over all files in the root directory where this is running.
   * If the file does not match any of the test files, add it to the list of source files.
   */

  for await (
    const file of expandGlob(ALL_TYPESCRIPT_FILES_GLOB, {
      exclude: HIDDEN_DIRECTORIES_GLOB,
    })
  ) {
    if (!testFiles.some((testFile) => testFile.path === file.path)) {
      sourceFiles.push({
        path: file.path,
        relativePath: file.path.replace(currentWorkingDirectory, ""),
        content: await Deno.readTextFile(file.path),
      });
    }
  }

  return {
    sourceFiles,
    testFiles,
  };
};

export const findSourceAndTestFilesFromGlobLists = async (
  sourceFileGlobs: string[],
  testFileGlobs: string[],
): Promise<{
  sourceFiles: SourceFile[];
  testFiles: TestFile[];
}> => {
  const currentWorkingDirectory = Deno.cwd();

  const sourceFiles: SourceFile[] = [];
  const testFiles: TestFile[] = [];

  // Expand source files
  for (const pattern of sourceFileGlobs) {
    for await (const file of expandGlob(pattern)) {
      sourceFiles.push({
        path: file.path,
        relativePath: file.path.replace(currentWorkingDirectory, ""),
        content: await Deno.readTextFile(file.path),
      });
    }
  }

  // Expand test files
  for (const pattern of testFileGlobs) {
    for await (const file of expandGlob(pattern)) {
      testFiles.push({
        path: file.path,
        relativePath: file.path.replace(currentWorkingDirectory, ""),
        content: await Deno.readTextFile(file.path),
      });
    }
  }

  return {
    sourceFiles,
    testFiles,
  };
};
