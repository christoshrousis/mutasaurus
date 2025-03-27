const ensureDirectoryExists = (filePath: string): void => {
  const dirPath = filePath.substring(0, filePath.lastIndexOf("/"));
  if (dirPath) {
    Deno.mkdirSync(dirPath, { recursive: true });
  }
};

self.onmessage = async (e) => {
  const { sourceFiles, testFiles, mutation } = e.data;

  // Create a temporary working directory for the mutation using absolute path
  const workingDirectory = `${Deno.cwd()}/.mutasaurus/${
    Math.random().toString(36).substring(7)
  }`;
  Deno.mkdirSync(workingDirectory, { recursive: true });

  // Copy all source and test files into the working directory
  for (const sourceFile of sourceFiles) {
    const content = await Deno.readTextFile(sourceFile);
    const targetPath = `${workingDirectory}/${sourceFile}`;
    ensureDirectoryExists(targetPath);
    Deno.writeTextFileSync(targetPath, content);
  }

  for (const testFile of testFiles) {
    const content = await Deno.readTextFile(testFile);
    const targetPath = `${workingDirectory}/${testFile}`;
    ensureDirectoryExists(targetPath);
    Deno.writeTextFileSync(targetPath, content);
  }

  // Copy the mutation into the working directory
  const mutationTargetPath =
    `${workingDirectory}/${mutation.original.filePath}`;
  ensureDirectoryExists(mutationTargetPath);
  Deno.writeTextFileSync(mutationTargetPath, mutation.mutation);

  const startTime = performance.now();
  try {
    const process = new Deno.Command("deno", {
      args: [
        "test",
        "--allow-read",
        "--allow-write",
        "--allow-run",
        workingDirectory,
      ],
      stdout: "piped",
      stderr: "piped",
    });

    const { code, stderr } = await process.output();
    const duration = performance.now() - startTime;

    const decodedError = new TextDecoder().decode(stderr);
    if (decodedError.includes("Test failed")) {
      mutation.status = "killed";
    } else {
      mutation.status = "survived";
    }
    mutation.duration = duration;

    self.postMessage(
      {
        mutation,
        success: code === 0,
        error: code !== 0 ? decodedError : undefined,
        duration,
      },
    );
  } catch (error) {
    const duration = performance.now() - startTime;
    self.postMessage({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration,
    });
  }
};
