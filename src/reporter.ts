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
    } = results;
    const mutationScore = (killedMutations / totalMutations) * 100;

    let output = "\nMutation Testing Report\n";
    output += "=====================\n";

    if (survivedMutations > 0) {
      output += "\nSurvived Mutations:\n";
      output += "------------------\n";
      mutations
        .filter((r) => r.status === "survived")
        .forEach((r) => {
          const { line, column } = this.positionToLineAndColumn(
            r.original.content,
            r.start,
          );
          output += `File: ${r.original.path}:${line}:${column}\n`;
          output += `Operator: ${r.operator}\n`;

          output += "\n";
        });
    }

    output += "\nResults\n";
    output += "----------------------\n";
    output += `Total Mutations: ${totalMutations}\n`;
    output += `Killed Mutations: ${killedMutations}\n`;
    output += `Survived Mutations: ${survivedMutations}\n`;
    output += `Timed-out Mutations: ${timedOutMutations}\n`;
    output += `Erroneous Mutations: ${erroneousMutations}\n`;
    output += `Mutation Score: ${mutationScore.toFixed(2)}%\n\n`;

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
