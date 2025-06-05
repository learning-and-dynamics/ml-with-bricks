import React, { useCallback } from "react";
import styled from "styled-components";

interface Props {
  value: number;
  handleValueChange(v: number): void;
  minValue: number;
  maxValue: number;
}

const NumericInput: React.FC<Props> = ({
  value,
  handleValueChange,
  minValue,
  maxValue,
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputVal = e.target.value;

      // If input is empty, revert to last known good value (no update)
      if (inputVal.trim() === "") {
        // Reset input to the current value prop by re-rendering
        e.target.value = String(value);
        return;
      }

      // Try to parse as integer
      const parsed = parseInt(inputVal, 10);

      // If parse fails or there's a non-integer scenario
      if (isNaN(parsed)) {
        // Reset to last known good value
        e.target.value = String(value);
        return;
      }

      // Clamp the value within min/max range
      const clamped = Math.min(Math.max(parsed, minValue), maxValue);

      // If clamped value differs from what was typed (out of range), correct it
      if (clamped !== parsed) {
        e.target.value = String(clamped);
        handleValueChange(clamped);
        return;
      }

      // Valid integer within range
      handleValueChange(parsed);
    },
    [value, handleValueChange, minValue, maxValue]
  );

  // Prevent invalid keys from even being entered (optional but extra robust):
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow: Backspace, Delete, Arrow keys, Tab, Enter
      if (
        e.key === "Backspace" ||
        e.key === "Delete" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "Tab" ||
        e.key === "Enter"
      ) {
        return;
      }

      // Disallow any non-digit characters
      if (!/^[0-9]$/.test(e.key)) {
        e.preventDefault();
      }
    },
    []
  );

  return (
    <Wrapper>
      <input
        type="number"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        min={minValue}
        max={maxValue}
        step={1}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  /* You can style the wrapper or input as needed */
  input {
    width: 100px;
    padding: 4px;
    font-size: 14px;
  }
`;

export default NumericInput;
