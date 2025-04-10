import { Mutator } from "./mutator.ts";
import { Reporter } from "./reporter.ts";
import { TestRunner } from "./testRunner.ts";
import {
  findSourceAndTestFiles,
  findSourceAndTestFilesFromGlobLists,
  SourceFile,
  TestFile,
} from "./findSourceAndTestFiles.ts";

/**
 * The different states that a MutationRun can be in, as part of the mutation testing process.
 *
 * - `waiting`: The mutation is waiting to be tested.
 * - `killed`: The mutation was killed by the tests.
 * - `survived`: The mutation survived the tests.
 * - `timed-out`: The test suite run for the mutation timed out.
 * - `error`: The worker process running the tests for the mutation caused an error to be thrown.
 */
export type MutationStatus =
  | "waiting"
  | "killed"
  | "survived"
  | "timed-out"
  | "error";

/**
 * A single mutation run, as part of the mutation testing process.
 *
 * This represents a single mutation, as it passes through it's different states,
 * from waiting, implying that the mutation is identified, to killed or survived,
 * implying that the mutation has been tested and it's result is known.
 */

export type MutationRun = {
  original: {
    relativePath: string;
    content: string;
  };
  testFilesToRun: string[];
  mutation: string;
  operator: string;
  start: number;
  status: MutationStatus;
  duration: number;
};

/**
 * The internal configuration for the Mutasaurus mutation testing framework.
 */
export interface MutasaurusConfig {
  /** Files identified as source files to be mutated. */
  sourceFiles: string[];
  /** Files identified as test files to be run against the mutations. */
  testFiles: string[];
  /** The operators to be used for the mutations. TODO: Define the operators instead of using strings */
  operators: string[];
  /** The number of workers to be used when creating worker pools to run the tests against the mutations. */
  workers: number;
  /** The timeout for the individual workers in the worker pools. */
  timeout: number;
  /** Whether to execute as many possible permutations as possible. Defaults to false.
   *
   * Instead of the Mutsaurus curated subset of mutations, this will run all possible mutations.
   * This may or may not be better suited to individual files or functions, where you want to test all possible mutations.
   *
   * TODO: Improve granularity by allowing users to provide their own mutation mappings?
   */
  exhaustiveMode: boolean;
}

/**
 * The internal configuration for the Mutasaurus mutation testing framework,
 * as optional parameters, accepted by the constructor of the Mutasaurus class.
 *
 * This allows the end user to optionally supply a subset of configuration,
 * while allowing us to set a default.
 *
 * Please refer to {@linkcode MutasaurusConfig} for additional information.
 */
export interface MutasaurusConfigInput {
  sourceFiles?: string[];
  testFiles?: string[];
  operators?: string[];
  workers?: number;
  timeout?: number;
  exhaustiveMode?: boolean;
  silent?: boolean;
}

/**
 * The results of the mutation testing process.
 *
 * This is passed to the {@linkcode Reporter}.
 */
export type MutasaurusResults = {
  totalMutations: number;
  killedMutations: number;
  survivedMutations: number;
  erroneousMutations: number;
  timedOutMutations: number;
  mutations: MutationRun[];
};

/**
 * The results of the mutation testing process.
 *
 * returned from the {@linkcode Mutasaurus.run} method.
 */
export type MutasaurusResultsReturn = MutasaurusResults & {
  /** The total time taken to run the mutation testing process. */
  totalTime: number;
};

/**
 * The core responsibility of this class is to orchestrate the mutation testing process.
 *
 * It will:
 * - Expand any file globs in the source and test files.
 * - Build a list of all possible mutations based off all the supplied files.
 * - Run the tests against the mutations.
 * - Generate a report.
 */
export class Mutasaurus {
  private config: MutasaurusConfig = {
    sourceFiles: [],
    testFiles: [],
    operators: ["arithmetic", "logical", "control"],
    workers: 4,
    timeout: 5000,
    exhaustiveMode: false,
  };
  private mutator: Mutator;
  private reporter: Reporter;
  private testRunner: TestRunner;

  private sourceFiles: SourceFile[] = [];
  private testFiles: TestFile[] = [];

  constructor(config?: MutasaurusConfigInput) {
    this.config = {
      ...this.config,
      ...config,
    };

    this.mutator = new Mutator(this.config.exhaustiveMode);
    this.reporter = new Reporter();
    this.testRunner = new TestRunner(this.config.workers, this.config.timeout);
  }

  async run(generateReport: boolean = true, reportOutputPath?: string): Promise<MutasaurusResultsReturn> {
    const startTime = performance.now();

    const sourceFilesProvided = this.config.sourceFiles.length !== 0;

    if (generateReport) {
      // Print opening statement.
      console.log("\n---------------------------------\n");
      console.log("Running Mutasaurus, with the following config...");
      console.log(this.config);

      if (!sourceFilesProvided) {
        console.log("\n---------------------------------\n");
        console.log(
          "Source files not provided, will search for source and test files in the current working directory",
        );
      }
      console.log("\n---------------------------------\n\n");
    }

    // Set source and test files.
    const { sourceFiles, testFiles } = sourceFilesProvided
      ? await findSourceAndTestFilesFromGlobLists(
        this.config.sourceFiles,
        this.config.testFiles,
      )
      : await findSourceAndTestFiles();
    this.sourceFiles = sourceFiles;
    this.testFiles = testFiles;

    const mutations = await this.generateMutations();
    const result = await this.testRunner.runTests(
      mutations,
      this.sourceFiles,
      this.testFiles,
    );

    const killedMutations =
      result.filter((result) => result.mutation.status === "killed").length;
    const survivedMutations =
      result.filter((result) => result.mutation.status === "survived").length;
    const erroneousMutations =
      result.filter((result) => result.mutation.status === "error").length;
    const timedOutMutations =
      result.filter((result) => result.mutation.status === "timed-out")
        .length;
    const outcome: Omit<MutasaurusResults, "totalTime"> = {
      totalMutations: mutations.length,
      killedMutations,
      survivedMutations,
      erroneousMutations,
      timedOutMutations,
      mutations: result.map((result) => result.mutation),
    };
    if (generateReport) {
      await this.reporter.generateReport(outcome, reportOutputPath);
    }

    try {
      await Deno.remove("./.mutasaurus", { recursive: true });
    } catch (cleanupError) {
      console.error(
        "Failed to cleanup temporary test directory:",
        cleanupError,
      );
    }

    const programEndTime = performance.now();
    if (generateReport) {
      console.log(`Program took ${programEndTime - startTime}ms to run`);
    }

    return {
      ...outcome,
      totalTime: programEndTime - startTime,
    };
  }

  private async generateMutations(): Promise<MutationRun[]> {
    const sourceFileToTestFileCoverage = await this.testRunner
      .initialTestRunsWithCoverage({
        sourceFiles: this.sourceFiles,
        testFiles: this.testFiles,
      });

    // Build a list of all possible mutations based off all the supplied files.
    const mutations: MutationRun[] = [];
    for (const sourceFile of sourceFileToTestFileCoverage.keys()) {
      const testFilesToRun = sourceFileToTestFileCoverage.get(sourceFile) ?? [];
      const content = await Deno.readTextFile(`${Deno.cwd()}${sourceFile}`);
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
            relativePath: sourceFile,
            content,
          },
          testFilesToRun,
          mutation: modifiedContent,
          operator: mutation.operator,
          start: mutation.location.start,
          status: "waiting",
          duration: 0,
        });
      }
    }
    return mutations;
  }
}
