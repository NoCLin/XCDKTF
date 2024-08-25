import React, { useState } from "react";
import { Box, useInput } from "ink";
import { Tab, Tabs } from "ink-tab";
export function Actions({ onInput, actions, enabled, }) {
    const [value, setValue] = useState("");
    useInput((input, key) => {
        if (key?.return) {
            onInput(value);
        }
    }, { isActive: enabled });
    if (!enabled) {
        return null;
    }
    return (React.createElement(Box, { flexDirection: "column", gap: 1 },
        React.createElement(Tabs, { onChange: (_value) => setValue(_value) }, actions.map((action) => {
            return (React.createElement(Tab, { name: action.name, key: action.name }, action.name));
        }))));
}
