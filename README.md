# Mutasaurus

A Deno-native mutation testing library that helps you improve your test suite quality by
automatically introducing mutations into your code.

## Features

- 🦕 Deno-first approach
- ⚡ High performance with parallel execution
- 🔒 Secure by default with explicit permissions
- 📊 Detailed mutation coverage reporting
- 🎯 Configurable mutation operators
- 🔍 Source map support for accurate error reporting

## Installation

## Quick Start

```typescript
import { Mutasaurus } from 'https://deno.land/x/mutasaurus/mod.ts';

const mutasaurus = new Mutasaurus({
  sourceFiles: ['./src/**/*.ts'],
  testFiles: ['./tests/**/*.test.ts'],
  operators: ['arithmetic', 'logical', 'control'],
  workers: 4,
});

const results = await mutasaurus.run();
console.log(results);
```

## Development

This project requires Deno 2.x or later.

### Running Tests

```bash
deno task test
```

### Formatting Code

```bash
deno task fmt
```

### Linting

```bash
deno task lint
```

## License

MIT

## Special Thanks

I am a big fan of StykerJS. If you're working on a JS/TS project and want a mature mutation testing
library, please use StykerJS.
