// src/components/checkbox/FullCellCheckbox.jsx

import React from "react";
import "./full-cell-checkbox.css";
import classNames from "classnames";

export default function FullCellCheckbox({ checked, onChange, onClick, variant = "body" }) {
    const checkboxClass = classNames("full-cell-checkbox", {
        "checkbox-header": variant === "header",
        "checkbox-body": variant === "body",
    });

    return (
        <input
            type="checkbox"
            className={checkboxClass}
            checked={checked}
            onClick={onClick}
            onChange={onChange}
        />
    );
}
