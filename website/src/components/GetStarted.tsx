export function GetStarted() {
  return (
    <div
      id="get-started"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <div class="text-center">
        <h2 class="text-3xl font-bold mb-8">Get Started in Minutes</h2>
        <div class="bg-gray-800 p-6 rounded-lg max-w-2xl mx-auto">
          <pre class="text-left text-gray-300 overflow-x-auto">
            <code>
                {GetStartedCode}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}

const GetStartedCode = `import { Mutasaurus } from "jsr:@mutasaurus/mutasaurus";

const mutasaurus = new Mutasaurus();
const mutationResult = await mutasaurus.run();
`;
