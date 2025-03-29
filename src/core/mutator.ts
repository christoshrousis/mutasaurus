import { parseAndWalk } from "npm:oxc-walker";
import {
  AssignmentExpression,
  AssignmentOperator,
  BinaryExpression,
  BinaryOperator,
  Node,
} from "npm:oxc-parser";

export interface MutationLocation {
  file: string;
  line: number;
  column: number;
  operator: string;
}

export type AssignmentExpressionMutation = {
  operator: AssignmentOperator;
  location: {
    start: AssignmentExpression["left"]["end"];
    end: AssignmentExpression["right"]["start"];
  };
};

export type BinaryExpressionMutation = {
  operator: BinaryOperator;
  location: {
    start: BinaryExpression["left"]["end"];
    end: BinaryExpression["right"]["start"];
  };
};

export type Mutation = BinaryExpressionMutation | AssignmentExpressionMutation;

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

const isSupportedArithmeticOperator = (
  operator: BinaryOperator,
): operator is keyof typeof arithmeticOperators => {
  return operator in arithmeticOperators;
};

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

const isSupportedAssignmentOperator = (
  operator: AssignmentOperator,
): operator is keyof typeof assignmentOperators => {
  return operator in assignmentOperators;
};

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

              for (const operator of arithmeticOperators[node.operator]) {
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

              for (const operator of assignmentOperators[node.operator]) {
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
