import { ScaleLoader } from "react-spinners";
import { CircularProgressbar } from "react-circular-progressbar";
import styled, { useTheme } from "styled-components";
import "react-circular-progressbar/dist/styles.css";

type ButtonVariant = "filled" | "outlined";

interface Props {
  icon?: any;
  text?: string;
  onClick: (e: any) => void;
  active?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  type?: "button" | "submit" | "reset";
  loadingProgress?: number;
}

const Button = ({
  text,
  icon,
  onClick,
  variant = "outlined",
  active = true,
  loading = false,
  type,
  loadingProgress,
}: Props) => {
  const theme = useTheme();

  return (
    <Wrapper onClick={onClick} $active={active} $variant={variant} type={type}>
      {!!icon && !loading && icon}
      {!!loading &&
        (loadingProgress === undefined ? (
          <ScaleLoader
            color={variant === "filled" ? "#ffffff" : theme.black}
            width={2}
            height={12}
            margin={1}
          />
        ) : (
          <CircularProgressbar
            value={loadingProgress}
            circleRatio={1}
            strokeWidth={12}
            styles={{
              root: { width: "20px", height: "20px" },
              path: {
                // strokeLinecap: "butt",
                stroke: theme.black,
              },
              trail: {
                stroke: theme.gray,
                transition: "stroke-dashoffset 0.5s ease 0s",
              },
            }}
          />
        ))}
      {!!text && <Text $variant={variant}>{text}</Text>}
    </Wrapper>
  );
};

const Wrapper = styled.button<{
  $active: boolean;
  $variant: ButtonVariant;
}>`
  min-width: 100px;
  /* height: 50px; */

  border-radius: 5px;
  background-color: ${({ $variant, theme }) =>
    $variant === "filled" ? theme.black : "white"};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ $active }) => ($active ? "pointer" : "not-allowed")};
  padding: 10px 20px;
  column-gap: 10px;
  border: ${({ $variant, theme }) =>
    $variant === "outlined" ? `1px solid ${theme.black};` : "none"};

  flex: 0 1 auto;

  & > svg {
    fill: ${({ $variant, theme }) =>
      $variant === "outlined" ? theme.black : "white"};
    flex-shrink: 0;
  }

  & > p {
    flex-shrink: 0;
  }
`;

const Text = styled.p<{ $variant: ButtonVariant }>`
  font-size: 16px;
  font-weight: 600;
  color: ${({ $variant, theme }) =>
    $variant === "filled" ? "white" : theme.black};
`;

export default Button;
