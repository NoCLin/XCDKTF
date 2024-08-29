import { Text, render, useApp } from "ink";
import { TextInput } from "@inkjs/ui";
import React, { useState } from "react";
import { Actions } from "./components/Actions.js";
import { SelectWithAutoComplete } from "./components/Select.js";
export async function promptSelect({ options, message, getOptions, }) {
    let result = "";
    function Inner() {
        const { exit } = useApp();
        const [enabled, setEnabled] = useState(true);
        return (React.createElement(SelectWithAutoComplete, { enabled: enabled, message: message, options: options, getOptions: getOptions, onInput: (v) => {
                result = v;
                setEnabled(false);
                exit();
            } }));
    }
    const { waitUntilExit } = render(React.createElement(Inner, null));
    await waitUntilExit();
    return result;
}
export async function prompt({ message }) {
    function Inner() {
        const { exit } = useApp();
        const [show, setShow] = useState(true);
        if (!show) {
            return null;
        }
        return (React.createElement(React.Fragment, null,
            React.createElement(Text, null, message ?? ""),
            React.createElement(TextInput, { onSubmit: (v) => {
                    result = v;
                    setShow(false);
                    exit();
                } })));
    }
    let result = "";
    const { waitUntilExit } = render(React.createElement(Inner, null));
    await waitUntilExit();
    return result;
}
export async function promptActions({ actions, message, }) {
    let result = "";
    function Inner() {
        const { exit } = useApp();
        const [enabled, setEnabled] = useState(true);
        return (React.createElement(React.Fragment, null,
            message && React.createElement(Text, null, message),
            React.createElement(Actions, { actions: actions, enabled: enabled, onInput: (v) => {
                    result = v;
                    setEnabled(false);
                    exit();
                } })));
    }
    const { waitUntilExit } = render(React.createElement(Inner, null));
    await waitUntilExit();
    return result;
}
export async function confirmAction({ message }) {
    const action = await promptActions({
        message: message,
        actions: [{ name: "NO" }, { name: "YES!" }],
    });
    return action == "YES!";
}
