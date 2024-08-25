import React, { useEffect, useState } from "react";
import { Box, Text } from "ink";
import { TextInput, Select, Spinner } from "@inkjs/ui";
export function SelectWithAutoComplete({ onInput, options, message, getOptions, enabled, }) {
    if (!options && !getOptions) {
        throw new Error("options or getOptions must be provided");
    }
    const [value, setValue] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadedOptions, setLoadedOptions] = useState([]);
    useEffect(() => {
        if (options) {
            setLoadedOptions(options);
            setLoading(false);
        }
        else {
            getOptions().then((options) => {
                setLoadedOptions(options);
                setLoading(false);
            });
        }
    }, []);
    if (!enabled) {
        return null;
    }
    if (loading) {
        return React.createElement(Spinner, { label: "Loading..." });
    }
    // makes filter logic as a parameter
    const filter = (opt) => value === "" || opt.startsWith(value);
    const suggestions = loadedOptions.filter(filter);
    const suggestionOptions = suggestions.map((s) => {
        return {
            value: s,
            label: s,
        };
    });
    return (React.createElement(Box, { flexDirection: "column" },
        React.createElement(Text, null,
            message ?? "",
            React.createElement(TextInput, { onChange: (e) => setValue(e) })),
        suggestionOptions && (React.createElement(Select, { options: suggestionOptions, onChange: (newValue) => {
                onInput(newValue);
            }, visibleOptionCount: 5 })),
        !suggestionOptions && React.createElement(Text, null, "no suggestions")));
}
