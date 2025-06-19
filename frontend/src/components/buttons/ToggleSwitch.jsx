import React from "react";
import { ToggleSlider } from "react-toggle-slider";
import PropTypes from "prop-types";
import "./toggle-switch.css"

const getCSSVar = (variableName) =>
  getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();

const ToggleSwitch = ({
  value,
  onChange,
  label,
  disabled = false,
  textSize = "1rem",
  height = 20,
  width = 40,
  handleSize = 14,
  activeColor = getCSSVar("--accent-color"),
  inactiveColor = getCSSVar("--greys"),    
  handleColor = getCSSVar("--white"),   
}) => {
  return (
    <div
      className="label-container"
      style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? "none" : "auto" }}
    >
      <ToggleSlider
        value={value}
        onToggle={onChange}
        barBackgroundColorActive={activeColor}
        barBackgroundColorInactive={inactiveColor}
        handleBackgroundColor={handleColor}
        barHeight={height}
        barWidth={width}
        handleSize={handleSize}
      />
      <span style={{ fontSize: textSize }}>{label}</span>
    </div>
  );
};

ToggleSwitch.propTypes = {
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  height: PropTypes.number,
  width: PropTypes.number,
  activeColor: PropTypes.string,
  inactiveColor: PropTypes.string,
  handleColor: PropTypes.string,
};

export default ToggleSwitch;
