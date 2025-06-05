import React from "react";
import styled from "styled-components";

interface Props {
  value: number;
  placeholder?: string;
  required?: boolean;
  label: string | React.ReactNode;
  name?: string;
  disabled?: boolean;
  minValue: number;
  maxValue: number;
  onChange: (v: number) => void;
  onMouseUp?: (v: number) => void;

  stepDevisor?: number;
  writeValue?: boolean;
  fullWidth?: boolean;
}

const SliderInput = ({
  value,
  required = false,
  label,
  name,
  disabled = false,
  placeholder = "",
  minValue,
  maxValue,
  stepDevisor = 1,
  writeValue,
  onChange,
  onMouseUp,
  fullWidth,
}: Props) => {
  const handleChange = (e: any) => {
    onChange(e.target.value / stepDevisor);
  };

  const handleMouseUp = (e: any) => {
    if (!!onMouseUp) onMouseUp(e.target.value / stepDevisor);
  };

  return (
    <Field $fullWidth={fullWidth}>
      <Label>
        {label}
        {writeValue && `: ${value}`}
      </Label>
      <Input
        type="range"
        id={name}
        value={value * stepDevisor}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        onChange={handleChange}
        onMouseUp={handleMouseUp}
        min={minValue * stepDevisor}
        max={maxValue * stepDevisor}
      />
      <MinValue>{minValue}</MinValue>
      <MaxValue>{maxValue}</MaxValue>
    </Field>
  );
};

const Label = styled.span`
  font-family: var(--main-font);
  font-weight: 700;
  font-size: 18px;
  line-height: 24px;
  position: absolute;
  left: 0px;
  top: -5px;

  /* @media (max-width: 1600px) {
    font-size: 11px;
  }

  @media (max-width: 1200px) {
    top: 1px;
    left: 15px;
  }

  @media (max-width: 600px) {
    font-size: 10px;
    line-height: 20px;
    top: 0px;
  } */
`;

const Field = styled.label<{ $fullWidth?: boolean }>`
  /* max-width: 500px; */
  /* width: 100%; */
  flex: 1;
  display: block;
  position: relative;
  border-radius: 5px;
  padding: 25px 0 25px 0;
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 24px;
  width: ${({ $fullWidth }) => (!!$fullWidth ? "100%" : "auto")};

  &:focus {
    outline: none;
  }

  /* @media (max-width: 1200px) {
    font-size: 14px;
    line-height: 21px;
  }

  @media (max-width: 600px) {
    font-size: 13px;
    line-height: 19px;
    padding: 15px 16px 4px 16px;
  } */
`;

const Input = styled.input`
  appearance: none;
  border: none;
  background: transparent;
  width: 100%;

  &:focus {
    outline: none;
  }
  &[type="range"] {
    appearance: none;
    -webkit-appearance: none;
    height: 7px;
    border-radius: 5px;
    background: ${({ theme }) => theme.gray};
    /* border: 1px solid black; */

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 20px;
      width: 20px;
      border-radius: 50%;
      background: ${() => "#fff"};
      border: 1px solid ${({ theme }) => theme.gray};
      cursor: pointer;
      box-shadow: 0 0 2px 0 #555;
      /* transition: background 0.3s ease-in-out; */

      &:hover {
        box-shadow: #5a5a5a50 0px 0px 0px 4px;
      }
      &:active {
        box-shadow: #5a5a5a50 0px 0px 0px 6px;
        transition: box-shadow 350ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
          left 350ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
          bottom 350ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
      }
    }

    &::-webkit-slider-runnable-track {
      -webkit-appearance: none;
      box-shadow: none;
      border: none;
      background: transparent;
    }
  }
`;

const MinValue = styled.span`
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  line-height: 24px;
  position: absolute;
  left: 0;
  bottom: -5px;

  /* @media (max-width: 1600px) {
    font-size: 11px;
  }

  @media (max-width: 1200px) {
    top: 1px;
    left: 15px;
  }

  @media (max-width: 600px) {
    font-size: 10px;
    line-height: 20px;
    top: 0px;
  } */
`;

const MaxValue = styled.span`
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  line-height: 24px;
  position: absolute;
  right: 0;
  bottom: -5px;
  /* 
  @media (max-width: 1600px) {
    font-size: 11px;
  }

  @media (max-width: 1200px) {
    top: 1px;
    left: 15px;
  }

  @media (max-width: 600px) {
    font-size: 10px;
    line-height: 20px;
    top: 0px;
  } */
`;

export default SliderInput;
