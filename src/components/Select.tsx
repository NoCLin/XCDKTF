import React, { useEffect, useState } from "react";
import { Box, Text } from "ink";
import { TextInput, Select, Spinner } from "@inkjs/ui";

export function SelectWithAutoComplete({
  onInput,
  options,
  message,
  getOptions,
  enabled,
}: {
  onInput: (value: string) => void;
  options?: string[];
  getOptions?: () => Promise<string[]>;
  message?: string;
  enabled?: boolean;
}) {
  if (!options && !getOptions) {
    throw new Error("options or getOptions must be provided");
  }

  const [value, setValue] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadedOptions, setLoadedOptions] = useState<string[]>([]);

  useEffect(() => {
    if (options) {
      setLoadedOptions(options);
      setLoading(false);
    } else {
      getOptions!().then((options) => {
        setLoadedOptions(options);
        setLoading(false);
      });
    }
  }, []);

  if (!enabled) {
    return null;
  }
  if (loading) {
    return <Spinner label="Loading..." />;
  }

  // makes filter logic as a parameter
  const filter = (opt: string) => value === "" || opt.startsWith(value);

  const suggestions = loadedOptions.filter(filter);
  const suggestionOptions = suggestions.map((s) => {
    return {
      value: s,
      label: s,
    };
  });

  return (
    <Box flexDirection="column">
      <Text>
        {message ?? ""}
        <TextInput onChange={(e) => setValue(e)}></TextInput>
      </Text>
      {suggestionOptions && (
        <Select
          options={suggestionOptions}
          onChange={(newValue) => {
            onInput(newValue);
          }}
          visibleOptionCount={5}
        />
      )}
      {!suggestionOptions && <Text>no suggestions</Text>}
    </Box>
  );
}
