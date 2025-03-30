# Mutasaurus

A Deno-native mutation testing library that helps you improve your test suite quality by
automatically introducing mutations into your code.

## Features

- 🦕 Deno-first approach
- ⚡ High performance
- 📊 Mutation coverage reporting
- 🎯 Configurable mutation operators
- 🔍 Source map support for accurate error reporting

## Quick Start

```typescript
import { Mutasaurus } from 'jsr:@mutasaurus/mutasaurus';

const mutasaurus = new Mutasaurus({
  sourceFiles: ['./src/**/*.ts'],
  testFiles: ['./tests/**/*.test.ts'],
  operators: ['arithmetic', 'logical', 'control'],
  workers: 4,
});

const results = await mutasaurus.run();
console.log(results);
```

## Configuration

TODO [Detailed configuration options]

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

## Contributing

To contribute to this project:
- Read the project goals.
- Write some code.
- Make sure `deno task ok` passes.
- Open a PR.

## Project Goals

This project started as an academic endeavor to explore mutation testing in Deno's ecosystem. The core question was "Can I create a mutation testing library that feels native to Deno?"

Moving Forward, the guiding principles are:

- **Deno-Native First**
  - Built exclusively for Deno, leveraging its unique features and security model
  - Should take cues from Deno's overall mission, and align where possible.
- **Performance-Focused**
  - Leverages Deno's V8 isolate and Web Workers for parallel execution
  - Smart defaults that balance coverage with execution time
  - Configurable mutation patterns for advanced use cases such as exhaustive coverage
  - Potential for Rust-based core components if performance demands it
- **Developer Experience**
  - Single-command setup and execution out of the box
  - Clear, actionable error messages with Deno-style hints
  - Comprehensive documentation with Deno-specific examples
  - Integration with Deno's testing ecosystem

## License

MIT

## Special Thanks

If you're working on a Node JS/TS project and want a mature/stable mutation testing library, please use [StykerJS](https://github.com/stryker-mutator/stryker-js) 😊
