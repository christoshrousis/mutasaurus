import { Mutasaurus } from '../src/mod.ts';

const programStartTime = performance.now();
const mutasaurus = new Mutasaurus({
  sourceFiles: ['test/fixtures/*.ts'],
  testFiles: ['test/fixtures/*.test.ts'],
});
await mutasaurus.run();

const programEndTime = performance.now();
console.log(`Program took ${programEndTime - programStartTime}ms to run`);
