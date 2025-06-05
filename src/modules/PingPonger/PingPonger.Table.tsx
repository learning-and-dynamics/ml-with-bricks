import { useTranslation } from "react-i18next";
import styled from "styled-components";

interface Props {
  data: Record<string, any>[];
  handleRemoveData: (id: string) => void;
  handleTableRowHover(id: string | null): void;
}

const PingPongerTable = ({
  data,
  handleRemoveData,
  handleTableRowHover,
}: Props) => {
  const { t } = useTranslation();

  return (
    <TableWrapper>
      <TableRow>
        {[t("PingPonger.xAxisTitle"), t("PingPonger.yAxisTitle"), t("PingPonger.delete")].map((col, index) => (
          <HeaderCell key={index}>{col}</HeaderCell>
        ))}
      </TableRow>
      <Body>
        {data.map((row) => (
          <TableRow
            key={row.id}
            onMouseEnter={() => handleTableRowHover(row.id)}
            onMouseLeave={() => handleTableRowHover(null)}
          >
            <TableCell>
              <p>{row.distance}</p>
            </TableCell>
            <TableCell>
              <ProgressBar>
                <ProgressBarFill style={{ width: `${row.power}%` }}>
                  {row.power > 15 && (
                    <ProgressLabel>{`⚡ ${row.power}%`}</ProgressLabel>
                  )}
                </ProgressBarFill>
                {row.power <= 15 && (
                  <OutsideLabel>{`⚡ ${row.power}%`}</OutsideLabel>
                )}
              </ProgressBar>
            </TableCell>
            <ClickableCell>
              <p onClick={() => handleRemoveData(row.id)}>🗑️</p>
            </ClickableCell>
          </TableRow>
        ))}
      </Body>
    </TableWrapper>
  );
};

const TableWrapper = styled.div`
  display: grid;
  border: 1px solid ${({ theme }) => theme.black};
  border-radius: 5px;
  overflow: hidden;
  font-family: var(--main-font);
  font-size: 16px;
  font-weight: 400;
`;

const HeaderCell = styled.span`
  display: table-header-group;
  vertical-align: middle;
  background-color: ${({ theme }) => theme.black};
  padding: 10px 15px;
  color: white;
  font-weight: 900;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;

  &:nth-child(odd) {
    background-color: ${({ theme }) => theme.gray};
  }
  &:nth-child(even) {
    background-color: white;
  }

  &:last-of-type,
  &:first-of-type {
    border: none;
  }
`;

const Body = styled.div`
  overflow-y: auto;
  max-height: 300px;
  scroll-padding-bottom: 50px;
  margin: 1px 0;
`;

const TableCell = styled.span`
  text-align: left;
  padding: 5px 15px;

  display: flex;
  align-items: center;
  justify-content: start;
  gap: 10px;
`;

const ProgressBar = styled.span`
  flex: 1;
  border-radius: 5px;
  border: 1px solid ${({ theme }) => theme.black};
  height: 20px;
  background: ${({ theme }) => theme.white};
  position: relative;
  overflow: hidden;
`;

const ProgressBarFill = styled.span`
  display: block;
  height: 100%;
  /* background: linear-gradient(to right, #f4ff5b, #ff8400); */
  background: linear-gradient(to right, #fffb83, #fdcd55);
  /* background: #fdcd55; */
  transition: width 0.3s ease-in-out;
  position: relative;
`;

const ProgressLabel = styled.span`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-weight: bold;
  font-size: 12px;
  color: ${({ theme }) => theme.black};
  white-space: nowrap;
`;

const OutsideLabel = styled.span`
  font-weight: bold;
  font-size: 12px;
  color: ${({ theme }) => theme.black};
  white-space: nowrap;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 0;
`;

const ClickableCell = styled(TableCell)`
  & > p {
    cursor: pointer;
    display: inline-block;
  }
`;

export default PingPongerTable;
