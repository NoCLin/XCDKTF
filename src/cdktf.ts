import * as fs from "fs";
import * as path from "path";

import { execSync } from "child_process";

/**
 * Run shell command
 * @param command
 * @param cwd
 * @param pipe
 */
function runShell(
  command: string[],
  cwd: string,
  pipe?: boolean,
): { stdout: string; stderr: string } {
  try {
    console.log(`Running command: ${command.join(" ")}`);
    const stdout = execSync(command.join(" "), {
      cwd,
      stdio: (pipe ?? true) ? "pipe" : "inherit",
    });
    // TODO: stderr
    return { stdout: stdout?.toString() ?? "", stderr: "" };
  } catch (error: unknown) {
    console.log(`Run command ${command} failed.`);
    throw error;
  }
}

/**
 * Get all cdktf directories in the root directory
 * @param rootDirectory
 */
export function getCdktfDirectories(rootDirectory: string): string[] {
  const walk = (dir: string): string[] => {
    const files = fs.readdirSync(dir);
    let directories: string[] = [];
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        if (fs.existsSync(path.join(fullPath, "cdktf.json"))) {
          directories.push(fullPath);
        } else {
          directories = directories.concat(walk(fullPath));
        }
      }
    }
    return directories;
  };

  const directories = walk(rootDirectory);

  directories.sort();
  return directories;
}

/**
 * CDKTF Directory
 */
export class CDKTFDirectory {
  private readonly directory: string;
  private metadataJsonData: {
    stacks: {
      [key: string]: {
        workingDirectory: string;
      };
    };
  };
  private readonly cdktfFile: string;

  constructor(directory: string, noSynth = false) {
    this.directory = directory;
    this.metadataJsonData = { stacks: {} };
    this.cdktfFile = path.join(this.directory, "cdktf.json");
    if (!fs.existsSync(this.cdktfFile)) {
      throw new Error(`File not found: ${this.cdktfFile}`);
    }

    if (!noSynth) {
      this.synthInternal();
    }
    this.loadMetadata();
  }

  /**
   * Synth
   * @private
   */
  private synthInternal() {
    const config = JSON.parse(fs.readFileSync(this.cdktfFile, "utf-8")) as {
      app: string;
    };
    const appEntry = config.app;
    // FIXME: can run arbitrary command, need to sanitize
    runShell(appEntry.split(" "), this.directory);
  }

  private synth() {
    runShell(["cdktf", "synth"], this.directory);
  }

  loadMetadata() {
    const f = path.join(this.directory, "cdktf.out", "manifest.json");
    if (!fs.existsSync(f)) {
      throw new Error(`File not found: ${f}`);
    }
    this.metadataJsonData = JSON.parse(fs.readFileSync(f, "utf-8"));
  }

  /**
   * Get all stacks
   */
  stacks(): string[] {
    return Object.keys(this.metadataJsonData.stacks);
  }

  /**
   * Get stack
   * @param stackName
   */
  getStack(stackName: string): CDKTFStack {
    if (!this.metadataJsonData.stacks[stackName]) {
      throw new Error(`Stack not found: ${stackName}`);
    }
    const stack = this.metadataJsonData.stacks[stackName];
    const directory = path.join(
      this.directory,
      "cdktf.out",
      stack.workingDirectory,
    );
    return new CDKTFStack(directory);
  }
}

/**
 * CDKTF Stack
 */
export class CDKTFStack {
  private readonly workingDirectory: string;

  constructor(workingDirectory: string) {
    this.workingDirectory = workingDirectory;
    if (!fs.existsSync(this.workingDirectory)) {
      throw new Error(`Directory not found: ${this.workingDirectory}`);
    }
    runShell(["terraform", "init", "-migrate-state"], this.workingDirectory);
  }

  diff() {
    runShell(["terraform", "plan", "-no-color"], this.workingDirectory, false);
  }

  states(): string[] {
    const { stdout } = runShell(
      ["terraform", "state", "list"],
      this.workingDirectory,
    );
    return stdout.split("\n").filter(Boolean);
  }

  removeState(tfId: string) {
    runShell(["terraform", "state", "rm", tfId], this.workingDirectory, false);
  }

  importState(tfId: string, remoteId: string) {
    runShell(
      ["terraform", "import", tfId, remoteId],
      this.workingDirectory,
      false,
    );
  }

  renameState(tfId: string, newId: string) {
    runShell(
      ["terraform", "state", "mv", tfId, newId],
      this.workingDirectory,
      false,
    );
  }

  apply() {
    runShell(
      ["terraform", "apply", "--auto-approve"],
      this.workingDirectory,
      false,
    );
  }

  // TODO: implement
  getResourceSchemas(): never {
    const { stdout } = runShell(
      ["terraform", "providers", "schema", "-json"],
      this.workingDirectory,
    );
    return JSON.parse(stdout) as never;
  }
}
