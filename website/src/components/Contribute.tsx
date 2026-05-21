import { ViewOnGithubButton } from "./ViewOnButtons.tsx";

export function Contribute() {
  return (
    <section class="text-center py-12">
      <h2 class="text-3xl font-mono mb-6 text-amber-500 font-semibold">
        Join the Excavation
      </h2>
      <p class="font-mono text-lg mb-8 max-w-3xl mx-auto">
        Mutasaurus is an open-source project. <br />{" "}
        Help us dig up better ways to test Deno applications!
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        <ViewOnGithubButton />
      </div>
    </section>
  );
}
