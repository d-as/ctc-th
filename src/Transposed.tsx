import { useContext, useEffect, useState } from "react";
import { AppContext } from "./AppContext";
import { LocalStorageKey, ROW_DATA_TRANSPOSED } from "./constants";
import { Highlights } from "./Highlights";
import { range } from "./util";
import { VersionInfo } from "./VersionInfo";

export const Transposed = (): JSX.Element => {
  const [rows] = useState([...ROW_DATA_TRANSPOSED]);
  const [highlightMode, setHighlightMode] = useState(0);
  const [highlights, setHighlights] = useState<Record<string, number | undefined>>({});
  const { setShowTransposedGrid } = useContext(AppContext);

  const getCellKey = (rowIndex: number, colIndex: number): string => [rowIndex, colIndex].join('_');

  const getHeaderStyles = (colIndex: number): string => {
    return [
      'bold border-bottom-bold',
      colIndex === 1 ? 'border-left-bold' : '',
      colIndex === 11 ? 'border-left-bold border-left-dashed' : '',
    ]
      .join(' ');
  };

  const getCellStyles = (rowIndex: number, colIndex: number): string => {
    const highlight = highlights[getCellKey(rowIndex, colIndex)];

    return [
      highlight !== undefined ? `highlight-${highlight + 1}` : '',
      colIndex === 0 ? 'bold' : '',
      colIndex === 1 ? 'border-left-bold' : '',
      rowIndex === 9 ? 'border-top-bold border-top-dashed' : '',
      colIndex === 11 ? 'border-left-bold border-left-dashed' : '',
    ]
      .join(' ');
  };

  useEffect(() => {
    const localHighlightMode = window.localStorage.getItem(LocalStorageKey.HIGHLIGHT_MODE);
    const localHighlights = window.localStorage.getItem(LocalStorageKey.HIGHLIGHTS_TRANSPOSED);

    if (localHighlightMode) {
      setHighlightMode(JSON.parse(localHighlightMode));
    }

    if (localHighlights) {
      setHighlights(JSON.parse(localHighlights));
    }
  }, []);

  const cellClicked = (rowIndex: number, colIndex: number): void => {
    if (colIndex < 1) {
      return;
    }

    const cellKey = getCellKey(rowIndex, colIndex);
    const newHighlights = { ...highlights };

    newHighlights[cellKey] = highlights[cellKey] === highlightMode ? undefined : highlightMode;

    window.localStorage.setItem(LocalStorageKey.HIGHLIGHTS_TRANSPOSED, JSON.stringify(newHighlights));
    setHighlights(newHighlights);
  };

  return (
    <div className="col">
      <a
        className="cursor-pointer"
        onClick={() => {
          setShowTransposedGrid(false);
          window.localStorage.setItem(LocalStorageKey.SHOW_TRANSPOSED_GRID, JSON.stringify(false));
        }}
      >
        Normal mode
      </a>
      <div className="spacer"></div>
      <table>
        <thead>
          <tr>
            {range(21).map(colIndex => (
              <td
                key={`thead-${colIndex}`}
                className={getHeaderStyles(colIndex)}
              >
                {colIndex > 0 ? colIndex : ''}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => `${String.fromCharCode(i + 'A'.charCodeAt(0))}${row}`).map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {[...row].map((letter, colIndex) => (
                <td
                  key={`row-${rowIndex}-${colIndex}`}
                  className={getCellStyles(rowIndex, colIndex)}
                  onClick={() => cellClicked(rowIndex, colIndex)}
                >
                  {letter}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="spacer-xs"></div>
      <div className="options-container">
        <span className="options-row">
          <Highlights
            highlightMode={highlightMode}
            setHighlightMode={setHighlightMode}
          />
        </span>
      </div>
      <VersionInfo />
    </div>
  );
};
