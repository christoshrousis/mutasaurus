# Mutasaurus

A Deno mutation testing library that helps you improve your test suite quality by introducing mutations into your code

## Features

- 🦕 Deno-first approach
- ⚡ High performance
- 📊 Mutation coverage reporting
- 🎯 Configurable mutation operators (TBD)
- 🔍 Source map support for accurate error reporting

## Quick Start

```typescript
import { Mutasaurus } from 'jsr:@mutasaurus/mutasaurus';

const mutasaurus = new Mutasaurus();

const results = await mutasaurus.run();
console.log(results);
```

## Configuration

When starting, you will want to pass no configuration to Mutasaurus.
By not passing sourceFiles, mutasaurus will proceed to search for source and
test file configurations on it's own.

#### Source files & Test Files
When supplying source files and test files, mutasaurus will consider the
provided files as the only files it's allowed to work with.

The parameters accept glob patterns.

Something to consider:

Let `m` be the number of possible mutations
Let `t` be the number of test files
Let `s` be the number of source files

For each mutation that's created `m`, we need to run every test file `t` against it. This creates a multiplicative relationship:
`O(m × t)`

However, the number of possible mutations `m` is also dependent on the number of source files `s` and the number of possible mutation points within each source file. 
If we consider `p` as the average number of possible mutation points per source file, then:
`m = s × p`

Therefore, the total complexity relationship could be defined as:
`O(s × p × t)`

All this is to say, if you define the relationships between the source files and the test files, you can improve the speed of
the mutation test harness.

So this:

```typescript
const featureAMutations = new Mutasaurus({
  sourceFiles: ['./src/a/1.ts', './src/a/2.ts', './src/a/3.ts'],
  testFiles: ['./tests/a/1.test.ts', './tests/a/2.test.ts'],
});
const featureBMutations = new Mutasaurus({
  sourceFiles: ['./src/b/1.ts', './src/b/2.ts', './src/b/3.ts'],
  testFiles: ['./tests/b/1.test.ts', './tests/b/2.test.ts'],
});
const resultsA = await featureAMutations.run();
const resultsB = await featureBMutations.run();

```

will perform better than this:

```typescript
const mutasaurus = new Mutasaurus({
  sourceFiles: ['./src/**/*.ts'],
  testFiles: ['./tests/**/*.test.ts'],
});
const results = await mutasaurus.run();
```

#### Exhaustive Mode
The test suite will only run a subset of cherry picked mutations that attempt to balance speed & accuracy.
If you suspect you want to run all possible permutations, you can pass a `exhaustiveMode: true` to 
Mutasaurus constructor to increase the number of mutants.

```typescript
const mutasaurus = new Mutasaurus({
  exhaustiveMode: true
});
```

This will increase the `p` in `O(s × p × t)`

#### Workers
Mutasaurus uses workers, to take advantage of parallel execution.
This will default to 4, but depending on your machine's cores and logical cores,
you may or may not see improvements if you alter this number.

#### Timeout
The amount of time you should allow a runner to go, before considering it
"timed-out". Note, that some mutations can cause infinite evaluations,
so it is suggested you don't set an arbitrarily large number here.

## Examples

TODO [Real-world examples]

## Development

This project assumes Deno 2.x or later.

### Formatting Code

```bash
deno task fmt
```

### Linting

```bash
deno task lint
```

### Testing

```bash
deno task ok
```

Note: Currently there is only a single E2E test

## Road to V1

- Parity mutation support with StrykerJS.
- Use coverage reporting to run test suite subset to increase performance.
- Implement cache system to avoid re-running whats not required.

## Contributing

To contribute to this project:
- Read the project goals.
- Write some code.
- Make sure `deno task ok` passes.
- Open a PR.

## Project Goals

This project started as an academic endeavor to explore mutation testing in Deno's ecosystem. The core question was "Can I create a mutation testing library written in Deno?"

Moving Forward, the guiding principles are:

- **Deno-First**
  - Built exclusively for Deno projects.
  - Should take cues from Deno's overall mission, and align where possible.
- **Performance-Focused**
  - Leverages V8 isolate and Web Workers for parallel execution
  - Smart defaults that balance coverage with execution time
  - Configurable mutation patterns for advanced use cases such as exhaustive coverage
  - Potential for Rust-based core components if performance demands it
- **Developer Experience**
  - Single-command setup and execution out of the box
  - Clear, actionable error messages with Deno-style hints
  - Comprehensive documentation with examples
  - Integration with Deno's testing ecosystem

## License

MIT

## Special Thanks

If you're working on a Node JS/TS project and want a mature/stable mutation testing library, please use [StykerJS](https://github.com/stryker-mutator/stryker-js) 😊
