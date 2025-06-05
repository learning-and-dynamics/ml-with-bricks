import styled from "styled-components";
import Typography from "../Typography/Typography";

export interface Segment {
  id: string;
  text: string;
}

interface SegmentControlProps {
  segments: Segment[];
  handleSelectOption: (selectedId: string) => void;
  currentId: string;
  disabled?: boolean;
  label?: string;
}

const SegmentControl = ({
  label,
  segments,
  handleSelectOption,
  currentId,
  disabled = false,
}: SegmentControlProps) => {
  return (
    <Wrapper>
      {!!label && <Typography.Text>{label}</Typography.Text>}
      <SegmentControlContainer disabled={disabled}>
        {segments.map((segment) => (
          <Segment
            key={segment.id}
            $active={currentId === segment.id}
            onClick={() => handleSelectOption(segment.id)}
          >
            <p>{segment.text}</p>
          </Segment>
        ))}
      </SegmentControlContainer>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  & p {
    font-weight: 600;
  }
`;

const SegmentControlContainer = styled.div<{ disabled: boolean }>`
  display: flex;
  width: 100%;
  max-width: 100%;
  border: 1px solid ${({ theme }) => theme.gray};
  border-radius: 5px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.lightGray};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
`;

const Segment = styled.div<{ $active: boolean }>`
  flex: 1;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: ${({ $active }) => ($active ? "700" : "400")};
  color: ${({ theme, $active }) => ($active ? "white" : theme.black)};
  background: transparent;
  border: none;
  background-color: ${({ theme, $active }) =>
    !$active ? "transparent" : theme.black};

  &:focus {
    outline: none;
  }
  border-radius: 5px;
  transition: all 0.4s ease;

  & > p {
    text-align: center;
  }
`;

export default SegmentControl;
