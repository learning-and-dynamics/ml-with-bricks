import styled from "styled-components";
import Typography from "../Typography/Typography";

interface Props {
  text?: string;
  value: boolean;
  handleChange: (e: any) => void;
}

const SwitchInput = ({ text, value, handleChange }: Props) => {
  return (
    <Label>
      {!!text && <Typography.Text>{text}</Typography.Text>}
      <Input type="checkbox" onChange={handleChange} checked={value} />
      <Switch />
    </Label>
  );
};

const Label = styled.label`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  cursor: pointer;

  p {
    font-weight: 700;
  }
`;

const Switch = styled.div`
  position: relative;
  width: 45px;
  height: 24px;
  background: ${({ theme }) => theme.gray};
  border-radius: 26px;
  padding: 2px;
  transition: all 300ms ease;
  margin: 10px 0;

  &:before {
    transition: 300ms all;
    content: "";
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    top: 50%;
    left: 4px;
    background: white;
    transform: translate(0, -50%);
    box-shadow: 0 0 2px 0 #555;
  }
`;

const Input = styled.input`
  display: none;

  &:checked + ${Switch} {
    background: ${({ theme }) => theme.black};

    &:before {
      transform: translate(18px, -50%);
    }
  }
`;

export default SwitchInput;
