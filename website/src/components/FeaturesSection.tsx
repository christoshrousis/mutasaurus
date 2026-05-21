import { BarChart, Bug, Code, Dna, Target, Zap } from "lucide-preact";

const features = [
  {
    icon: <Bug className="h-10 w-10 text-red-500" />,
    title: "Mutant Generation",
    description:
      "Automatically creates code variants (mutants) to simulate bugs in your codebase.",
  },
  {
    icon: <Dna className="h-10 w-10 text-green-500" />,
    title: "Deno Native",
    description:
      "Built specifically for Deno projects with zero configuration required.",
  },
  {
    icon: <Zap className="h-10 w-10 text-yellow-500" />,
    title: "Fast",
    description:
      "Parallel test execution for rapid mutation analysis. Rust Oxc under the hood.",
  },
  {
    icon: <Target className="h-10 w-10 text-blue-500" />,
    title: "Mutation Score",
    description:
      "Provides a clear metric of how effective your tests are at catching bugs.",
  },
  {
    icon: <Code className="h-10 w-10 text-purple-500" />,
    title: "TypeScript Support",
    description:
      "Full support for TypeScript projects with accurate mutation analysis.",
  },
  {
    icon: <BarChart className="h-10 w-10 text-orange-500" />,
    title: "Reports",
    description:
      "Reports showing surviving mutants and areas needing better test coverage.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h2 class="text-3xl font-bold text-center mb-12">
        Excavate Better Tests
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-mono font-semibold mb-2 text-green-400">
                {feature.title}
              </h3>
              <p className="font-mono">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
