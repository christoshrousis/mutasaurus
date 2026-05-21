import { GetStartedButton, ViewOnJsrButton } from "./ViewOnButtons.tsx";
import { MutasaurusSvg } from "./Mutasaurus.tsx";

export function HeroSection() {
  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center relative z-20">
        <div class="w-64 mx-auto mb-8">
          <MutasaurusSvg />
        </div>
        <h1 class="text-5xl md:text-6xl font-extrabold tracking-tight mb-8">
          <span class="text-green-400">Mutasaurus</span>
          <br />
          <span class="text-3xl md:text-4xl ">
            Mutation testing made simple
          </span>
        </h1>
        <p class="text-xl md:text-2xl text-gray-300 mx-auto mb-12">
          Improve your code quality by introducing code variants.{" "}
          <br />Find hidden bugs and strengthen your test suite.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <GetStartedButton />
          <ViewOnJsrButton />
        </div>
      </div>
    </div>
  );
}
