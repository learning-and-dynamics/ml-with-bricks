import { useTranslation } from "react-i18next";
import styled from "styled-components";

interface Props {
  table: (number | undefined)[][];
  currentStateIx: number;
  currentActionIx: number | null;
}

const CrawlerTable = ({ table, currentStateIx, currentActionIx }: Props) => {
  const { t } = useTranslation();
  return (
    <Body>
      {table.map((row, rowIx) => [
        row.map((cell, colIx) => (
          <TableCell
            key={`${rowIx}-${colIx}`}
            $value={table[rowIx][colIx]}
            style={{ gridArea: `cell${rowIx + 1}-${colIx + 1}` }}
            $active={currentStateIx === rowIx && currentActionIx == colIx}
          >
            <p>
              {cell === undefined
                ? ""
                : cell > 0
                ? `+${Math.round(cell * 100) / 100}`
                : Math.round(cell * 100) / 100}
            </p>
          </TableCell>
        )),
        <ImageTableCell
          key={`row-image-${rowIx + 1}`}
          style={{ gridArea: `state${rowIx + 1}` }}
          $bgImage={`crawler/state_${rowIx}.png`}
          $active={currentStateIx === rowIx}
        />,
        <ImageTableCell
          key={`column-image-${rowIx + 1}`}
          style={{ gridArea: `action${rowIx + 1}` }}
          $bgImage={`crawler/state_${rowIx}.png`}
          $active={currentActionIx === rowIx}
        />,
      ])}
      <HeaderBlock style={{ gridArea: "a" }}>
        <HeaderText>{t("Crawler.table.columnsHeader")}</HeaderText>
      </HeaderBlock>
      <HeaderBlock style={{ gridArea: "b" }}>
        <HeaderText
          style={{ textOrientation: "mixed", writingMode: "sideways-lr" }}
        >
          {t("Crawler.table.rowsHeader")}
        </HeaderText>
      </HeaderBlock>
      <PlaceHolder />
    </Body>
  );
};

const Body = styled.div`
  width: 100%;
  aspect-ratio: 1/1;
  display: grid;
  grid-template-areas:
    "x x a a a a"
    "x x action1 action2 action3 action4"
    "b state1 cell1-1 cell1-2 cell1-3 cell1-4"
    "b state2 cell2-1 cell2-2 cell2-3 cell2-4"
    "b state3 cell3-1 cell3-2 cell3-3 cell3-4"
    "b state4 cell4-1 cell4-2 cell4-3 cell4-4";

  grid-template-columns: 30px 1fr 1fr 1fr 1fr 1fr;
  grid-template-rows: 30px 1fr 1fr 1fr 1fr 1fr;
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.darkGray};

  font-weight: 600;
  font-family: var(--main-font);
`;

const TableCell = styled.div<{
  $value?: number;
  $active?: boolean;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ $value, theme, $active }) => {
    if ($value === undefined || $value === 0)
      return $active ? theme.gray : theme.lightGray;
    if ($value > 0) return $active ? theme.green : theme.lightGreen;
    return $active ? theme.red : theme.lightRed;
  }};
  aspect-ratio: 1 / 1;
  outline: 1px solid ${({ theme }) => theme.darkGray};
  overflow: hidden;
  max-width: 100%;
  max-height: 100%;
  padding: 10px;

  & > p {
    max-width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    font-weight: 600;
  }
`;

const ImageTableCell = styled(TableCell)<{
  $bgImage: string;
}>`
  background-size: cover;
  background-color: ${({ theme, $active }) =>
    $active ? theme.darkGray : theme.gray};
  background-image: ${({ $bgImage }) => !!$bgImage && `url(${$bgImage})`};
`;

const HeaderBlock = styled(TableCell)`
  /* outline: 1px solid ${({ theme }) => theme.darkGray}; */
  aspect-ratio: unset;
  background-color: ${({ theme }) => theme.gray};
  padding: 0;
  & > p {
    overflow: unset;
  }
`;

const HeaderText = styled.p`
  text-align: center;
  /* line-height: 1.5; */
`;

const PlaceHolder = styled(TableCell)`
  background-color: ${({ theme }) => theme.gray};
  aspect-ratio: unset;
  grid-area: x;
`;

export default CrawlerTable;
