import React, { useState } from "react";
import { Box, useInput } from "ink";
import { Tab, Tabs } from "ink-tab";

export function Actions({
  onInput,
  actions,
  enabled,
}: {
  onInput: (value: string) => void;
  enabled: boolean;
  actions: {
    name: string;
  }[];
}) {
  const [value, setValue] = useState("");
  useInput(
    (input, key) => {
      if (key?.return) {
        onInput(value);
      }
    },
    { isActive: enabled },
  );

  if (!enabled) {
    return null;
  }

  return (
    <Box flexDirection="column" gap={1}>
      <Tabs onChange={(_value) => setValue(_value)}>
        {actions.map((action) => {
          return (
            <Tab name={action.name} key={action.name}>
              {action.name}
            </Tab>
          );
        })}
      </Tabs>
    </Box>
  );
}
