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

#### Persistent Workers
The original implementation of Mutasaurus would actually spawn a worker per 
mutation, but only run one at a time. This was inefficient as it used a lot
of I/O. Instead of completely removing the legacy implementation, I decided
to trial it with a config flag. After I was satisfied that it was stable, 
I then decided to flip it to default to true.

#### In Memory Mutations - Incomplete, in development.
Ideally, mutations should occur in memory, without writing mutated files to 
disk at all. This should improve performance by skipping I/O. This is 
currently in development and doesn't work yet.

#### Timeout
The amount of time you should allow a runner to go, before considering it
"timed-out". Note, that some mutations can cause infinite evaluations,
so it is suggested you don't set an arbitrarily large number here.

## Examples

See: [https://mutasaurus.com/showcase](https://mutasaurus.com/showcase) for a list of mutation runs against open source projects and their results.

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

- [ ] Close to parity¹ mutation support with StrykerJS.²
- [ ] Use coverage reporting to run test suite subset to increase performance.
- [ ] Implement StykerJS style cache system to avoid re-running whats not required.
  

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

¹ StrykerJS supports quite a number of mutations by default - Mutasaurus will opt out of some of those mutations in favour of a smaller subset. This could become configurable or be combined with "exhaustive mode" for more stricter requirements.
² [StrykerJS](https://github.com/stryker-mutator/stryker-js) is a mature mutation testing framework for Node based JavaScript/TypeScript projects.

## License

MIT

## Special Thanks

I have used [StrykerJS](https://github.com/stryker-mutator/stryker-js) in projects historically with great success. There is no reason not to keep using StrykerJS today. 😊
