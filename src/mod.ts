import { expandGlob } from '@std/fs';

import { Mutator } from './core/mutator.ts';
import { Reporter } from './runner/reporter.ts';

type MutationStatus = 'killed' | 'survived' | 'error' | 'waiting';
type MutationRuns = {
  original: {
    filePath: string;
    content: string;
  };
  mutation: string;
  operator: string;
  start: number;
  status: MutationStatus;
  duration: number;
};

export interface MutasaurusConfig {
  sourceFiles: string[];
  testFiles: string[];
  operators?: string[];
  workers?: number;
  timeout?: number;
}

export interface MutasaurusResults {
  totalMutations: number;
  killedMutations: number;
  survivedMutations: number;
  mutations: MutationRuns[];
}

export class Mutasaurus {
  private config: MutasaurusConfig = {
    sourceFiles: [],
    testFiles: [],
    operators: ['arithmetic', 'logical', 'control'],
    workers: 4,
    timeout: 5000,
  };
  private mutator: Mutator;
  private reporter: Reporter;

  private ensureDirectoryExists(filePath: string): void {
    const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
    if (dirPath) {
      Deno.mkdirSync(dirPath, { recursive: true });
    }
  }

  constructor(config: MutasaurusConfig) {
    this.config = {
      ...this.config,
      ...config,
    };

    this.mutator = new Mutator();
    this.reporter = new Reporter();
  }

  private async expandFilepathGlobs(): Promise<void> {
    // Expand glob patterns in sourceFiles and testFiles
    const expandedSourceFiles: string[] = [];
    const expandedTestFiles: string[] = [];

    // Expand source files
    for (const pattern of this.config.sourceFiles) {
      for await (const file of expandGlob(pattern)) {
        expandedSourceFiles.push(file.path);
      }
    }

    // Expand test files
    for (const pattern of this.config.testFiles) {
      for await (const file of expandGlob(pattern)) {
        expandedTestFiles.push(file.path);
      }
    }

    // Remove any test files from the source files list
    const filteredSourceFiles = expandedSourceFiles.filter(
      (sourceFile) => !expandedTestFiles.includes(sourceFile),
    );

    // Update the config with expanded files
    this.config = {
      ...this.config,
      sourceFiles: filteredSourceFiles,
      testFiles: expandedTestFiles,
    };
  }

  async run(generateReport: boolean = true): Promise<MutasaurusResults> {
    // Initialize the config asynchronously
    await this.expandFilepathGlobs();
    console.log('Beginning run with config:');
    console.log(this.config);

    // Build a list of all possible mutations based off all the supplied files.
    const mutations: MutationRuns[] = [];
    for (const sourceFile of this.config.sourceFiles) {
      const content = await Deno.readTextFile(sourceFile);
      const fileMutations = this.mutator.generateMutationsList(content, sourceFile);

      for (const mutation of fileMutations) {
        let modifiedContent = content;
        modifiedContent = modifiedContent.slice(0, mutation.location.start) +
          ` ${mutation.operator} ` +
          modifiedContent.slice(mutation.location.end);
        mutations.push({
          original: {
            filePath: sourceFile,
            content,
          },
          mutation: modifiedContent,
          operator: mutation.operator,
          start: mutation.location.start,
          status: 'waiting',
          duration: 0,
        });
      }
    }

    // TODO: There is a way to parallelize this, using workers.
    // TODO: There is a way to only run the tests that are needed, based off the coverage report.
    // TODO: Errors may occur in this loop, but we don't handle them.
    // For each mutation, we test it using the provided test suite.
    for (const mutation of mutations) {
      const startTime = performance.now();

      // Create a temporary working directory for the mutation.
      const workingDirectory = `./.mutasaurus/${Math.random().toString(36).substring(7)}`;
      Deno.mkdirSync(workingDirectory, { recursive: true });

      // Copy all source and test files into the working directory
      for (const sourceFile of this.config.sourceFiles) {
        const filePath = `${sourceFile}`;
        const content = await Deno.readTextFile(filePath);
        const targetPath = `${workingDirectory}/${sourceFile}`;
        this.ensureDirectoryExists(targetPath);
        Deno.writeTextFileSync(targetPath, content);
      }

      for (const testFile of this.config.testFiles) {
        const filePath = `${testFile}`;
        const content = await Deno.readTextFile(filePath);
        const targetPath = `${workingDirectory}/${testFile}`;
        this.ensureDirectoryExists(targetPath);
        Deno.writeTextFileSync(targetPath, content);
      }

      // Copy the mutation into the working directory
      const mutationTargetPath = `${workingDirectory}/${mutation.original.filePath}`;
      this.ensureDirectoryExists(mutationTargetPath);
      Deno.writeTextFileSync(mutationTargetPath, mutation.mutation);

      const process = new Deno.Command('deno', {
        args: [
          'test',
          '--allow-read',
          '--allow-write',
          '--allow-run',
          `${workingDirectory}`,
        ],
        stdout: 'piped',
        stderr: 'piped',
      });

      const { stderr } = await process.output();
      const duration = performance.now() - startTime;

      if (new TextDecoder().decode(stderr).includes('Test failed')) {
        mutation.status = 'killed';
      } else {
        mutation.status = 'survived';
      }
      mutation.duration = duration;

      try {
        await Deno.remove(workingDirectory, { recursive: true });
      } catch (cleanupError) {
        console.error('Failed to cleanup temporary test directory:', cleanupError);
      }
    }

    const outcome = {
      totalMutations: mutations.length,
      killedMutations: mutations.filter((mutation) => mutation.status === 'killed').length,
      survivedMutations: mutations.filter((mutation) => mutation.status === 'survived').length,
      mutations,
    };
    if (generateReport) {
      await this.reporter.generateReport(outcome);
    }
    try {
      await Deno.remove('./.mutasaurus', { recursive: true });
    } catch (cleanupError) {
      console.error('Failed to cleanup temporary test directory:', cleanupError);
    }

    return outcome;
  }
}
