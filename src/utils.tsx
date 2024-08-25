import { Text, render, useApp } from "ink";
import { TextInput } from "@inkjs/ui";

import React, { useState } from "react";
import { Actions } from "./components/Actions.js";
import { SelectWithAutoComplete } from "./components/Select.js";

export async function promptSelect({
  options,
  message,
  getOptions,
}: {
  options?: string[];
  getOptions?: () => Promise<string[]>;
  message?: string;
}) {
  function Inner() {
    const { exit } = useApp();
    const [enabled, setEnabled] = useState(true);

    return (
      <SelectWithAutoComplete
        enabled={enabled}
        message={message}
        options={options}
        getOptions={getOptions}
        onInput={(v) => {
          result = v;
          setEnabled(false);
          exit();
        }}
      />
    );
  }

  let result = "123";
  const { waitUntilExit } = render(<Inner />);
  await waitUntilExit();
  return result;
}

export async function prompt({ message }: { message?: string }) {
  function Inner() {
    const { exit } = useApp();
    const [show, setShow] = useState(true);
    if (!show) {
      return null;
    }

    return (
      <>
        <Text>{message ?? ""}</Text>
        <TextInput
          onSubmit={(v) => {
            result = v;
            setShow(false);
            exit();
          }}
        />
      </>
    );
  }

  let result = "";
  const { waitUntilExit } = render(<Inner />);
  await waitUntilExit();
  return result;
}

export async function promptActions({
  actions,
  message,
}: {
  message?: string;
  actions: {
    name: string;
  }[];
}): Promise<string> {
  let result = "";

  function Inner() {
    const { exit } = useApp();
    const [enabled, setEnabled] = useState(true);
    return (
      <>
        {message && <Text>{message}</Text>}
        <Actions
          actions={actions}
          enabled={enabled}
          onInput={(v) => {
            result = v;
            setEnabled(false);
            exit();
          }}
        />
      </>
    );
  }

  const { waitUntilExit } = render(<Inner />);
  await waitUntilExit();
  return result;
}

export async function confirmAction({ message }: { message?: string }) {
  const action = await promptActions({
    message: message,
    actions: [{ name: "NO" }, { name: "YES!" }],
  });
  return action == "YES!";
}
