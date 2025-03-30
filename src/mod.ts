// mod.ts
/**
 * The core responsibility of this module is to orchestrate the mutation testing process.
 *
 * It will:
 * - Expand any file globs in the source and test files.
 * - Build a list of all possible mutations based off all the supplied files.
 * - Run the tests against the mutations.
 * - Generate a report.
 *
 * @module
 */

import { expandGlob } from "@std/fs";

import { Mutator } from "./core/mutator.ts";
import { Reporter } from "./runner/reporter.ts";
import { TestRunner } from "./runner/test.ts";

export type MutationStatus = "killed" | "survived" | "error" | "waiting";
export type MutationRun = {
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
  operators: string[];
  workers: number;
  timeout: number;
}

export interface MutasaurusConfigInput {
  sourceFiles?: string[];
  testFiles?: string[];
  operators?: string[];
  workers?: number;
  timeout?: number;
}

export interface MutasaurusResults {
  totalMutations: number;
  killedMutations: number;
  survivedMutations: number;
  mutations: MutationRun[];
}

export class Mutasaurus {
  private config: MutasaurusConfig = {
    sourceFiles: [],
    testFiles: [],
    operators: ["arithmetic", "logical", "control"],
    workers: 4,
    timeout: 5000,
  };
  private mutator: Mutator;
  private reporter: Reporter;
  private testRunner: TestRunner;

  constructor(config: MutasaurusConfigInput) {
    this.config = {
      ...this.config,
      ...config,
    };

    this.mutator = new Mutator();
    this.reporter = new Reporter();
    this.testRunner = new TestRunner(this.config.workers, this.config.timeout);
  }

  async run(generateReport: boolean = true): Promise<MutasaurusResults> {
    // Initialize the config asynchronously
    await this.expandFilepathGlobs();
    console.log("Beginning run with config:");
    console.log(this.config);

    // Build a list of all possible mutations based off all the supplied files.
    const mutations: MutationRun[] = [];
    for (const sourceFile of this.config.sourceFiles) {
      const content = await Deno.readTextFile(sourceFile);
      const fileMutations = this.mutator.generateMutationsList(
        content,
        sourceFile,
      );

      for (const mutation of fileMutations) {
        // TODO: This operation probably resides elsewhere.
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
          status: "waiting",
          duration: 0,
        });
      }
    }

    // TODO: There is a way to only run the tests that are needed, based off the coverage report.
    // TODO: Errors may occur in this loop, but we don't handle them.
    const result = await this.testRunner.runTests({
      mutations,
      sourceFiles: this.config.sourceFiles,
      testFiles: this.config.testFiles,
    });
    const killedMutations =
      result.filter((result) => result.mutation.status === "killed").length;
    const survivedMutations =
      result.filter((result) => result.mutation.status === "survived").length;
    const outcome = {
      totalMutations: mutations.length,
      killedMutations,
      survivedMutations,
      mutations: result.map((result) => result.mutation),
    };
    if (generateReport) {
      await this.reporter.generateReport(outcome);
    }

    try {
      await Deno.remove("./.mutasaurus", { recursive: true });
    } catch (cleanupError) {
      console.error(
        "Failed to cleanup temporary test directory:",
        cleanupError,
      );
    }

    return outcome;
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
}
