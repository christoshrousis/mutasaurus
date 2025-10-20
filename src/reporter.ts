import { MutasaurusResults } from "../mod.ts";
import {
  type ExtendedFileCentricReport,
  type ExtendedReportSourceFile,
  type ExtendedReportTestFile,
  type MutationsAgainstSourceFile,
} from "./extendedReportTypes.ts";
import { type EnhancedCoverageData } from "./testRunner.ts";
import type { SourceFile, TestFile } from "./findSourceAndTestFiles.ts";

/**
 * Formats the results of the mutation testing process into a human readable report.
 *
 * If a mutation is not killed, it will provide a "sourcemap" style link
 * that is clickable in the terminal to take the user to the mutation location.
 */
export class Reporter {
  formatResults(results: MutasaurusResults): string {
    const {
      totalMutations,
      killedMutations,
      survivedMutations,
      timedOutMutations,
      erroneousMutations,
      typeErrorMutations,
      mutations,
      errors,
    } = results;
    const mutationScore =
      ((killedMutations + typeErrorMutations) / totalMutations) * 100;

    let output = "\nMutation Testing Report\n";
    output += "=====================\n";

    if (survivedMutations > 0) {
      const timestamp = new Date().toISOString();
      const timestampFilenameFriendly = timestamp.replace(/[:.]/g, "_");

      const survivedMutationsFilePath =
        `${Deno.cwd()}/.mutasaurus/reports/survived-mutations_${timestampFilenameFriendly}.txt`;
      output += "\nSurvived Mutations:\n";
      output += "------------------\n";
      output += `Survived Mutation count: ${survivedMutations}\n`;
      output +=
        `Files and locations of survived mutations recorded to::\n ${survivedMutationsFilePath}\n\n`;

      let survivedMutationOutput = "";
      survivedMutationOutput += `[${timestamp}] \nSurvived Mutations:\n`;
      survivedMutationOutput += "------------------\n";
      mutations
        .filter((r) => r.status === "survived")
        .forEach((r) => {
          const { line, column } = this.positionToLineAndColumn(
            r.original.content,
            r.start,
          );
          survivedMutationOutput +=
            `File: ${r.original.path}:${line}:${column}\n`;
          survivedMutationOutput += `Operator: ${r.operator}\n\n`;
        });

      Deno.mkdirSync(`${Deno.cwd()}/.mutasaurus/reports`, { recursive: true });
      Deno.writeTextFileSync(
        survivedMutationsFilePath,
        survivedMutationOutput + "\n\n",
        { append: true },
      );
    }

    output += "\nResults\n";
    output += "----------------------\n";
    output += `Total Mutations: ${totalMutations}\n`;
    output += `Killed Mutations: ${killedMutations}\n`;
    output += `Type Error Mutations: ${typeErrorMutations}\n`;
    output += `Survived Mutations: ${survivedMutations}\n`;
    output += `Timed-out Mutations: ${timedOutMutations}\n`;
    output += `Erroneous Mutations: ${erroneousMutations}\n`;

    if (!isNaN(mutationScore)) {
      output += `Mutation Score: ${
        mutationScore.toFixed(2)
      }% (Killed + Type Errors)\n\n`;
    }

    if (errors.length > 0) {
      output += "\nErrors mapping test files\n";
      output += "----------------------\n";
      output +=
        "Mutasaurus is still new, and we've had some internal errors.\n";
      output +=
        "Your mutation score is likely reporting less than it should be.\n";
      output +=
        "Below is a list of files that have run into an error, this is probably Mutasaurus's fault, not yours.\n";
      output += "----------------------\n\n";
      errors
        .forEach((e) => {
          output += `${e.testFile.relativePath}\n`;
          output += `${e.error}`;
          output += "----------------------\n";
        });
    }

    return output;
  }

  async generateReport(
    results: MutasaurusResults,
    outputPath?: string,
  ): Promise<void> {
    const report = this.formatResults(results);

    if (outputPath) {
      await Deno.writeTextFile(outputPath, report);
    } else {
      console.log(report);
    }
  }

  /**
   * Generates an extended file-centric JSON report.
   * Groups mutations by source file and includes coverage information.
   */
  async generateExtendedFileCentricReport(
    results: MutasaurusResults,
    sourceFiles: SourceFile[],
    enhancedCoverageData: Map<string, Array<EnhancedCoverageData>>,
    outputPath?: string,
  ): Promise<void> {
    const report = this.formatExtendedFileCentricReport(
      results,
      sourceFiles,
      enhancedCoverageData,
    );

    const timestamp = new Date().toISOString();
    const timestampFilenameFriendly = timestamp.replace(/[:.]/g, "_");
    const defaultOutputPath =
      `${Deno.cwd()}/.mutasaurus/reports/extended-file-centric-report_${timestampFilenameFriendly}.json`;

    const finalOutputPath = outputPath ?? defaultOutputPath;

    // Ensure directory exists
    Deno.mkdirSync(`${Deno.cwd()}/.mutasaurus/reports`, { recursive: true });

    // Write JSON report
    await Deno.writeTextFile(finalOutputPath, JSON.stringify(report, null, 2));

    console.log(
      `\nExtended file-centric report saved to: ${finalOutputPath}\n`,
    );
  }

  /**
   * Formats mutation results into an extended file-centric report structure.
   */
  private formatExtendedFileCentricReport(
    results: MutasaurusResults,
    sourceFiles: SourceFile[],
    enhancedCoverageData: Map<string, Array<EnhancedCoverageData>>,
  ): ExtendedFileCentricReport {
    const { totalMutations, mutations } = results;

    // Group mutations by source file
    const mutationsBySourceFile = new Map<
      string,
      MutationsAgainstSourceFile
    >();

    // Initialize structure for each source file
    for (const sourceFile of sourceFiles) {
      const extendedSourceFile: ExtendedReportSourceFile = {
        name: this.extractFileName(sourceFile.path),
        path: sourceFile.path,
        relativePath: sourceFile.relativePath,
        content: sourceFile.content,
      };

      // Get coverage data for this source file
      const coverageData = enhancedCoverageData.get(sourceFile.path) ?? [];
      const coverageTestFiles: ExtendedReportTestFile[] = coverageData.map(
        (data) => ({
          name: this.extractFileName(data.testFile.path),
          path: data.testFile.path,
          relativePath: data.testFile.relativePath,
          content: data.testFile.content,
          coversSourceFile: true,
          // TODO: Future enhancement - parse V8 coverage JSON to populate linesCovered
          linesCovered: [],
        }),
      );

      mutationsBySourceFile.set(sourceFile.path, {
        sourceFile: extendedSourceFile,
        killedMutations: [],
        survivedMutations: [],
        timedOutMutations: [],
        erroneousMutations: [],
        typeErrorMutations: [],
        coverage: coverageTestFiles,
        mutationScore: 0,
      });
    }

    // Categorize mutations by status and source file
    for (const mutation of mutations) {
      const sourceFilePath = mutation.original.path;
      const fileData = mutationsBySourceFile.get(sourceFilePath);

      if (!fileData) {
        // This shouldn't happen, but handle gracefully
        continue;
      }

      switch (mutation.status) {
        case "killed":
          fileData.killedMutations.push(mutation);
          break;
        case "survived":
          fileData.survivedMutations.push(mutation);
          break;
        case "timed-out":
          fileData.timedOutMutations.push(mutation);
          break;
        case "error":
          fileData.erroneousMutations.push(mutation);
          break;
        case "type-error":
          fileData.typeErrorMutations.push(mutation);
          break;
      }
    }

    // Calculate mutation scores for each file
    for (const [_, fileData] of mutationsBySourceFile) {
      const totalForFile =
        fileData.killedMutations.length +
        fileData.survivedMutations.length +
        fileData.timedOutMutations.length +
        fileData.erroneousMutations.length +
        fileData.typeErrorMutations.length;

      if (totalForFile > 0) {
        fileData.mutationScore =
          ((fileData.killedMutations.length +
            fileData.typeErrorMutations.length) /
            totalForFile) * 100;
      } else {
        fileData.mutationScore = 0;
      }
    }

    // Calculate overall mutation score
    const overallMutationScore = totalMutations > 0
      ? ((results.killedMutations + results.typeErrorMutations) /
        totalMutations) * 100
      : 0;

    // Get mutasaurus version
    const mutasaurusVersion = this.getMutasaurusVersion();

    // Build metadata with conditional mutasaurusVersion
    const metadata: ExtendedFileCentricReport["metadata"] = {
      timestamp: new Date().toISOString(),
      totalMutations,
      overallMutationScore,
    };

    if (mutasaurusVersion !== undefined) {
      metadata.mutasaurusVersion = mutasaurusVersion;
    }

    return {
      metadata,
      sourceFiles: Array.from(mutationsBySourceFile.values()),
    };
  }

  /**
   * Extracts the filename from a full path.
   */
  private extractFileName(path: string): string {
    const parts = path.split("/");
    return parts[parts.length - 1] ?? "";
  }

  /**
   * Attempts to get the mutasaurus version from deno.json.
   */
  private getMutasaurusVersion(): string | undefined {
    try {
      const denoJsonPath = new URL("../../deno.json", import.meta.url)
        .pathname;
      const denoJsonContent = Deno.readTextFileSync(denoJsonPath);
      const denoJson = JSON.parse(denoJsonContent);
      return denoJson.version;
    } catch {
      return undefined;
    }
  }

  private positionToLineAndColumn = (
    content: string,
    position: number,
  ): { line: number; column: number } => {
    let line = 1;
    let column = 1;
    let currentPosition = 0;

    for (let i = 0; i < content.length && i < position; i++) {
      if (content[i] === "\n") {
        line++;
        column = 1;
      } else {
        column++;
      }
      currentPosition++;
    }
    return { line, column };
  };
}
