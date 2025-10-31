import { MutationRun } from "./mutasaurus.ts";

/**
 * Represents a source file in the extended file-centric report.
 */
export type ExtendedReportSourceFile = {
  /** The name of the file (extracted from path) */
  name: string;
  /** The absolute path to the file */
  path: string;
  /** The relative path to the file from the working directory */
  relativePath: string;
  /** The content of the file */
  content: string;
};

/**
 * Represents a single line of coverage information.
 * This is provisioned for future enhancement with V8 coverage parsing.
 */
export type CoverageLine = {
  /** The line number in the source file */
  line: number;
  /** The number of times this line was executed (future enhancement) */
  executionCount?: number;
};

/**
 * Represents a test file that covers a source file in the extended file-centric report.
 */
export type ExtendedReportTestFile = {
  /** The name of the file (extracted from path) */
  name: string;
  /** The absolute path to the file */
  path: string;
  /** The relative path to the file from the working directory */
  relativePath: string;
  /** The content of the file */
  content: string;
  /** Whether this test file covers the associated source file (file-level coverage) */
  coversSourceFile: boolean;
  /**
   * Line-level coverage information (future enhancement).
   * Currently empty - will be populated when V8 coverage parsing is implemented.
   */
  linesCovered?: Array<CoverageLine>;
};

/**
 * Represents mutations against a single source file, grouped by status.
 */
export type MutationsAgainstSourceFile = {
  /** The source file that was mutated */
  sourceFile: ExtendedReportSourceFile;
  /** Mutations that were killed by tests (good - mutation was detected) */
  killedMutations: Array<MutationRun>;
  /** Mutations that survived testing (bad - mutation was not detected) */
  survivedMutations: Array<MutationRun>;
  /** Mutations that caused the test suite to time out */
  timedOutMutations: Array<MutationRun>;
  /** Mutations that caused errors during execution */
  erroneousMutations: Array<MutationRun>;
  /** Mutations that caused TypeScript type errors */
  typeErrorMutations: Array<MutationRun>;
  /** Mutations that were not tested due to global timeout */
  incompleteMutations: Array<MutationRun>;
  /** Test files that provide coverage for this source file */
  coverage: Array<ExtendedReportTestFile>;
  /** The mutation score for this specific file (0-100) */
  mutationScore: number;
};

/**
 * The extended file-centric report format.
 * An array of mutation data grouped by source file.
 */
export type ExtendedFileCentricReport = {
  /** Metadata about the report generation */
  metadata: {
    /** Timestamp when the report was generated */
    timestamp: string;
    /** Total number of mutations across all files */
    totalMutations: number;
    /** Overall mutation score across all files */
    overallMutationScore: number;
    /** Mutasaurus version used to generate this report */
    mutasaurusVersion?: string;
  };
  /** Mutation data grouped by source file */
  sourceFiles: Array<MutationsAgainstSourceFile>;
};
