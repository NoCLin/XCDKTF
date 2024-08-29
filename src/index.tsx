#!/usr/bin/env node --no-warnings
import { CDKTFDirectory } from "./cdktf.js";
import { promptSelect, promptActions, confirmAction } from "./utils.js";
import { stateManage } from "./states.js";
import * as fs from "node:fs";
import path from "node:path";

async function index() {
  const dir = process.argv[2] || process.cwd();

  console.log(`Running xcdktf on ${dir}`);

  if (!fs.existsSync(path.join(dir, "cdktf.json"))) {
    console.log(`${dir} is not a cdktf directory.`);
    return;
  }

  const cdktfDir = new CDKTFDirectory(dir, false);
  const stacks = cdktfDir.stacks();
  const stackName = await promptSelect({
    message: "Select stack: ",
    options: stacks,
  });
  if (!stackName) {
    console.log("no stack selected");
    return;
  }

  const stack = cdktfDir.getStack(stackName);

  while (true) {
    const action = await promptActions({
      message: `Select an action for ${stackName}:`,
      actions: [
        {
          name: "State",
        },
        {
          name: "Plan",
        },
        {
          name: "Deploy",
        },
        {
          name: "Exit",
        },
      ],
    });

    if (action === "State") {
      await stateManage(stack);
    }
    if (action === "Plan") {
      console.log("-----");
      stack.diff();
      console.log("-----");
    }
    if (action === "Deploy") {
      console.log("-----");
      stack.diff();
      console.log("-----");
      const confirmed = await confirmAction({});
      if (!confirmed) {
        console.log("aborted");
        continue;
      }
      stack.apply();
    }
    if (action === "Exit" || action === "") {
      break;
    }
  }
}

index().then();
