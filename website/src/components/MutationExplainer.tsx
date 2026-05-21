import { useEffect, useState } from "preact/hooks";
import { Play, RotateCcw } from "lucide-preact";

export default function MutationExplainer() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const originalCode = `function add(a, b) {
  return a + b;
}`;

  const mutatedCode = `function add(a, b) {
  return a - b;
}`;

  const testCode = `test("add function", () => {
  assertEquals(add(2, 2), 4);
})`;

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (step < 4) {
        setStep(step + 1);
      } else {
        setIsPlaying(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [step, isPlaying]);

  const resetDemo = () => {
    setStep(0);
    setIsPlaying(false);
  };

  const startDemo = () => {
    resetDemo();
    setIsPlaying(true);
  };

  return (
    <div class="mx-auto">
      <div class="bg-gray-800 rounded-lg p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 class="font-pixel text-amber-400 mb-2">Original Code</h3>
            <pre class="bg-gray-900 p-4 rounded font-mono text-green-400 overflow-x-auto">{originalCode}</pre>
          </div>

          <div>
            <h3 class="font-pixel text-amber-400 mb-2">Your Test</h3>
            <pre class="bg-gray-900 p-4 rounded font-mono text-green-400 overflow-x-auto">{testCode}</pre>
          </div>
        </div>

        {step >= 1 && (
          <div class="mb-6">
            <h3 class="font-pixel text-amber-400 mb-2">
              Mutated Code (Mutant)
            </h3>
            <pre class="bg-gray-900 p-4 rounded font-mono text-red-400 overflow-x-auto">{mutatedCode}</pre>
            <div class="text-center mt-2 font-mono text-sm">
              <span class="text-red-400">+ becomes -</span>{" "}
              (Arithmetic Operator Mutation)
            </div>
          </div>
        )}

        {step >= 2 && (
          <div class="mb-6">
            <h3 class="font-pixel text-amber-400 mb-2">
              Running Your Tests Against Mutant
            </h3>
            <div class="bg-gray-900 p-4 rounded font-mono">
              <div class="flex items-center">
                <div class="w-4 h-4 rounded-full bg-yellow-400 animate-pulse mr-2">
                </div>
                <span>Running test "add function"...</span>
              </div>
            </div>
          </div>
        )}

        {step >= 3 && (
          <div class="mb-6">
            <h3 class="font-pixel text-amber-400 mb-2">Test Result</h3>
            <div class="bg-gray-900 p-4 rounded font-mono">
              <div class="flex items-center">
                <div class="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                <span class="text-red-400">
                  FAIL: add function
                  <br />
                  Expected: 4
                  <br />
                  Actual: 0
                </span>
              </div>
            </div>
          </div>
        )}

        {step >= 4 && (
          <div class="mb-6">
            <h3 class="font-pixel text-amber-400 mb-2">Mutation Result</h3>
            <div class="bg-gray-900 p-4 rounded font-mono">
              <div class="flex items-center">
                <div class="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                <span class="text-green-400">
                  Mutant killed! Your test detected the bug. 🦖
                </span>
              </div>
            </div>
          </div>
        )}

        <div class="flex justify-center gap-4 mt-8">
          <button
            type="button"
            onClick={startDemo}
            disabled={isPlaying}
            class="cursor-pointer px-8 py-3 text-lg font-semibold rounded-md bg-green-500 hover:bg-green-600 transition-colors flex items-center"
          >
            {step === 0
              ? (
                <>
                  <span class="mr-2">Show me!</span>
                  <Play class="h-4 w-4" />
                </>
              )
              : (
                <>
                  <span class="mr-2">Replay?</span>
                  <RotateCcw class="h-4 w-4" />
                </>
              )}
          </button>
        </div>
      </div>
    </div>
  );
}
