import { Node, parseAndWalk } from "oxc-walker";
import {
  AssignmentExpression,
  AssignmentOperator,
  BinaryExpression,
  BinaryOperator,
} from "oxc-project-types";

/**
 * The location of a mutation, as it's found in the source code.
 */
export interface MutationLocation {
  file: string;
  line: number;
  column: number;
  operator: string;
}

/**
 * A mutation that is an assignment expression.
 *
 * TODO:
 * This library will align closer to OXC over time,
 * and this particular typing is expected to change.
 * The location is used to mutate the source code, outside of this
 * class, when the mutation operation is expected to
 * be moved outside of the "Mutasaurus" class and into the "Mutator" class.
 * Making this type obsolete.
 */
export type AssignmentExpressionMutation = {
  operator: AssignmentOperator;
  location: {
    start: AssignmentExpression["left"]["end"];
    end: AssignmentExpression["right"]["start"];
  };
};

/**
 * A mutation that is an binary expression.
 *
 * TODO:
 * This library will align closer to OXC over time,
 * and this particular typing is expected to change.
 * The location is used to mutate the source code, outside of this
 * class, when the mutation operation is expected to
 * be moved outside of the "Mutasaurus" class and into the "Mutator" class.
 * Making this type obsolete.
 */
export type BinaryExpressionMutation = {
  operator: BinaryOperator;
  location: {
    start: BinaryExpression["left"]["end"];
    end: BinaryExpression["right"]["start"];
  };
};

/**
 * Mutations are either a binary expression mutation or an assignment expression mutation.
 *
 * TODO: As this library evolves over time, the shape of "Mutation" will change
 * to support all types of expressions.
 */
export type Mutation = BinaryExpressionMutation | AssignmentExpressionMutation;

/**
 * The configuration object of how to mutate a particular arithmetic operator.
 *
 * E.g. '+' is mutated to "-", "*" & "/", and .\
 */
const arithmeticOperators: Record<
  BinaryOperator,
  Array<BinaryOperator>
> = {
  "+": ["-", "*", "/"],
  "-": ["+", "*", "/"],
  "*": ["+", "-", "/"],
  "/": ["+", "-", "*"],
  "%": ["+", "-", "*"],
  "**": ["+", "-", "*"],
  "<<": [],
  ">>": [],
  ">>>": [],
  "|": [],
  "^": [],
  "&": [],

  "in": ["+"],
  "instanceof": [],

  "==": ["===", "!=", "!=="],
  "!=": ["==", "===", "!=="],
  "===": ["==", "!=", "!=="],
  "!==": ["==", "!=", "==="],

  "<": ["<=", ">", ">="],
  "<=": ["<", ">", ">="],
  ">": ["<", "<=", ">="],
  ">=": ["<", "<=", ">"],
} as const;

/**
 * Checks if an operator is supported for arithmetic mutations.
 */
const isSupportedArithmeticOperator = (
  operator: BinaryOperator,
): operator is keyof typeof arithmeticOperators => {
  return operator in arithmeticOperators;
};

/**
 * The configuration object of how to mutate a particular assignment operator.
 *
 * E.g. '=' is only mutated to '+='. and '+=' is mutated to "=", "-=", "*=" & "/=".
 */
const assignmentOperators: Record<
  AssignmentOperator,
  Array<AssignmentOperator>
> = {
  "=": ["+="],
  "+=": ["=", "-=", "*=", "/="],
  "-=": ["=", "+=", "*=", "/="],
  "*=": ["=", "-=", "+=", "/="],
  "/=": ["=", "-=", "*=", "+="],
  "%=": ["=", "-=", "*=", "/="],
  "**=": ["=", "-=", "*=", "/="],
  "<<=": ["=", "-=", "*=", "/="],
  ">>=": ["=", "-=", "*=", "/="],
  ">>>=": ["=", "-=", "*=", "/="],
  "|=": ["=", "-=", "*=", "/="],
  "^=": ["=", "-=", "*=", "/="],
  "&=": ["=", "-=", "*=", "/="],
  "||=": ["=", "-=", "*=", "/="],
  "&&=": ["=", "-=", "*=", "/="],
  "??=": ["=", "-=", "*=", "/="],
} as const;

/**
 * Checks if an operator is supported for assignment mutations.
 */
const isSupportedAssignmentOperator = (
  operator: AssignmentOperator,
): operator is keyof typeof assignmentOperators => {
  return operator in assignmentOperators;
};

/**
 * The Mutator is responsible for generating a list of mutations for a given source file.
 *
 * It will parse the source file using OXC, and for each node that is a binary expression or an assignment expression,
 * it will generate a list of mutations.
 */
export class Mutator {
  constructor() {}

  generateMutationsList(content: string, filePath: string): Mutation[] {
    const fileName = filePath.split("/").pop()!;
    const mutations: Mutation[] = [];

    parseAndWalk(content, fileName, {
      enter(node: Node) {
        switch (node.type) {
          case "BinaryExpression":
            if (isSupportedArithmeticOperator(node.operator)) {
              const start = node.left.end;
              const end = node.right.start;

              for (
                const operator of arithmeticOperators[node.operator]
              ) {
                const mutation: BinaryExpressionMutation = {
                  operator,
                  location: {
                    start,
                    end,
                  },
                };
                mutations.push(mutation);
              }
            }
            break;
          case "AssignmentExpression":
            if (isSupportedAssignmentOperator(node.operator)) {
              const start = node.left.end;
              const end = node.right.start;

              for (
                const operator of assignmentOperators[node.operator]
              ) {
                const mutation: AssignmentExpressionMutation = {
                  operator,
                  location: {
                    start,
                    end,
                  },
                };
                mutations.push(mutation);
              }
            }
            break;
        }
      },
    });

    return mutations;
  }
}
