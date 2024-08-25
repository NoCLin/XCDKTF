import { CDKTFStack } from "./cdktf.js";
import { prompt, promptSelect, promptActions, confirmAction } from "./utils.js";

export async function stateManage(stack: CDKTFStack) {
  let action = "back";
  while (true) {
    const states = stack.states();
    const state = await promptSelect({
      message: "Select state:",
      options: [...states],
    });
    if (!state) {
      return;
    }
    action = await promptActions({
      message: `Select action for [${state}]`,
      actions: [
        { name: "Import" },
        { name: "Delete" },
        { name: "Rename" },
        { name: "Back" },
      ],
    });

    if (action === "Import") {
      const remoteId = await prompt({ message: "Enter remoteId" });

      console.log("confirm?", `import ${state} from ${remoteId}`);
      const confirmed = await confirmAction({});
      if (!confirmed) {
        console.log("not confirmed");
        continue;
      }
      stack.importState(state, remoteId);
    }
    if (action === "Delete") {
      console.log("confirm?", `delete ${state}`);
      const confirmed = await confirmAction({});
      if (!confirmed) {
        console.log("not confirmed");
        continue;
      }
      stack.removeState(state);
    }
    if (action === "Rename") {
      const newName = await prompt({ message: "Enter new state name" });
      console.log(`Rename ${state} to ${newName}`);
      const confirmed = await confirmAction({});
      if (!confirmed) {
        console.log("not confirmed");
        continue;
      }
      const resource = state.split(".")[0];
      const newTfName = resource + "." + newName;
      stack.renameState(state, newTfName);
    }
    if (action === "back" || action === "") {
      break;
    }
  }
}
