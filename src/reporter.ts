import { MutasaurusResults } from "../mod.ts";

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
      mutations,
      errors,
    } = results;
    const mutationScore = (killedMutations / totalMutations) * 100;

    let output = "\nMutation Testing Report\n";
    output += "=====================\n";

    if (survivedMutations > 0) {
      const timestamp = new Date().toISOString();
      const timestampFilenameFriendly = timestamp.replace(/[:.]/g, "_");

      const survivedMutationsFilePath =
        `${Deno.cwd()}/mutasaurus/survived-mutations_${timestampFilenameFriendly}.txt`;
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

      Deno.mkdirSync(`${Deno.cwd()}/mutasaurus`, { recursive: true });
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
    output += `Survived Mutations: ${survivedMutations}\n`;
    output += `Timed-out Mutations: ${timedOutMutations}\n`;
    output += `Erroneous Mutations: ${erroneousMutations}\n`;
    if (!isNaN(mutationScore)) {
      output += `Mutation Score: ${mutationScore.toFixed(2)}%\n\n`;
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
