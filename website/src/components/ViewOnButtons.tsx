export const ViewOnGithubButton = () => {
  return (
    <a
      href="https://github.com/christoshrousis/mutasaurus"
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-center gap-2 px-8 py-3 text-lg font-semibold rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
    >
      View on GitHub
    </a>
  );
};

export const ViewOnJsrButton = () => {
  return (
    <a
      href="https://jsr.io/@mutasaurus/mutasaurus"
      target="_blank"
      rel="noopener noreferrer"
      class="cursor-pointer px-8 py-3 text-lg font-semibold rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
    >
      View on JSR
    </a>
  );
};

export const GetStartedButton = () => {
  return (
    <a
      href="#get-started"
      class="cursor-pointer px-8 py-3 text-lg font-semibold rounded-md bg-green-500 hover:bg-green-600 transition-colors"
    >
      Get Started
    </a>
  );
};
