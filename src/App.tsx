import { useEffect, useState } from 'react';
import './App.scss'

const data = [
  ['YPWAIETOAENRMHMGEN', 'MIVWDMKDTCBANGBFKW'],
  ['NQLLWQMIRLVFSDROTN', 'VKIIAAKIRLHADHESVG'],
  ['LINVADMCURYBOFEUAI', 'DRULRHTDEESEBREPYE'],
  ['VRBOOHHSDEWEAANANN', 'EERATOLITEJEPEPZFN'],
  ['ANHIITBICPATELTTMH', 'FEKETCHPMSNAFEWNQM'],
  ['SFTOAINWLXARKLANFE', 'NEWEDSANENTEGQLHUA'],
  ['OENIRSRONOFKGVEKAR', 'TLBGONGUWHILPAFNAS'],
  ['EHERESSOVEMDGJTCWS', 'RDMCORRODAPJNLSAWY'],
  ['TASEWNHEVGRANOKNOT', 'SHTOELHTICUTMLHOIO'],
  ['HRFRONLRATTATTIQAT', 'ANEUOASGNHSFALEHND'],
];

const rowData = data.map(([l, r]) => `${l}${r}`);

const range = (size: number) => [...Array(size).keys()];

enum SelectMode {
  HIGHLIGHT,
  HIDE,
}

const VERSION_TEXT = 'v0.3.8 / DAS#0437';
const VERSION_TEXT_TITLE = 'Discord Tag'

const App = () => {
  const [rows, setRows] = useState([...rowData]);
  const [trueRows, setTrueRows] = useState(rows);
  const [rowOrder, setRowOrder] = useState(range(11));
  const [colOrder, setColOrder] = useState(range(37));
  const [highlights, setHighlights] = useState(new Set<string>());
  const [hidden, setHidden] = useState(new Set<string>());
  const [colOffsets, setColOffsets] = useState(Object.fromEntries(range(37).map(n => [n, 0])));
  const [selectMode, setSelectMode] = useState(SelectMode.HIGHLIGHT);

  const [swapRowFrom, setSwapRowFrom] = useState('');
  const [swapRowTo, setSwapRowTo] = useState('');
  const [swapColFrom, setSwapColFrom] = useState('');
  const [swapColTo, setSwapColTo] = useState('');

  const [showSameLettersOnHover, setShowSameLettersOnHover] = useState(false);
  const [showMatchingLettersBetweenSides, setShowMatchingLettersBetweenSides] = useState(false);
  const [hoveredLetter, setHoveredLetter] = useState<string | undefined>();

  const indexToLetter = (row: number): string => {
    return String.fromCharCode('A'.charCodeAt(0) + row - 1);
  };

  const letterToIndex = (letter: string): number => {
    return letter.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
  }

  const getCell = (row: number, col: number): string => {
    if (row === 0 && col === 0) {
      return ''
    } else if (row === 0) {
      return col.toString();
    } else if (col === 0) {
      return indexToLetter(row);
    }
    return rows[row - 1][col - 1];
  };

  const getTrueCell = (trueRow: number, trueCol: number): string => {
    return trueRows[trueRow - 1][trueCol - 1];
  };

  const getCellKey = (row: number, col: number): string => {
    return [indexToLetter(row), col].join(',');
  };

  const getActiveCellStyle = (row: number, col: number, cell: string): string => {
    return (row !== 0 || col !== 0) && (
      swapColFrom === cell || swapColTo === cell ||
      swapRowFrom.toUpperCase() === cell || swapRowTo.toUpperCase() === cell
    ) ? 'cell-swap-active' : '';
  };

  const getMatchingCellStyle = (trueRow: number, trueCol: number): string => {
    const cell = getTrueCell(trueRow, trueCol);
    const oppositeCell = getTrueCell(trueRow, trueCol < 19 ? trueCol + 18 : trueCol - 18);
    return cell === oppositeCell ? 'cell-matching' : '';
  };

  const getCellStyle = (row: number, col: number, trueRow: number, trueCol: number): string => {
    const cell = getCell(row, col);

    if (row === 0 || col === 0) {
      return [
        'cursor-pointer',
        getActiveCellStyle(row, col, cell),
      ]
        .join(' ')
    }

    const colOffset = colOffsets[col];
    const key = getCellKey((row + colOffset) % 10, col);
    const isHighlighted = highlights.has(key);
    const isHidden = hidden.has(key);

    return [
      isHighlighted ? 'highlight' : (isHidden ? 'hidden' : ''),
      showSameLettersOnHover && cell === hoveredLetter ? 'hovered-letter-cell' : '',
      showMatchingLettersBetweenSides ? getMatchingCellStyle(trueRow, trueCol) : '',
    ]
      .join(' ');
  };

  const headerClicked = (row: number, col: number): void => {
    const cell = getCell(row, col);

    if (row === 0) {
      if (swapColFrom.trim() === cell) {
        setSwapColFrom('');
      } else if (swapColTo.trim() === cell) {
        setSwapColTo('');
      } else if (!swapColFrom.trim() && cell !== swapColTo) {
        setSwapColFrom(cell);
      } else if (!swapColTo.trim() && cell !== swapColFrom) {
        setSwapColTo(cell);
      } else {
        setSwapColFrom(cell);
        setSwapColTo('');
      }
    } else if (col === 0) {
      if (swapRowFrom.trim().toUpperCase() === cell) {
        setSwapRowFrom('');
      } else if (swapRowTo.trim().toUpperCase() === cell) {
        setSwapRowTo('');
      } else if (!swapRowFrom.trim() && cell !== swapRowTo) {
        setSwapRowFrom(cell);
      } else if (!swapRowTo.trim() && cell !== swapRowFrom) {
        setSwapRowTo(cell);
      } else {
        setSwapRowFrom(cell);
        setSwapRowTo('');
      }
    }
  };

  const cellClicked = (row: number, col: number): void => {
    if (row === 0 || col === 0) {
      headerClicked(row, col);
      return;
    }

    const colOffset = colOffsets[col];
    const key = getCellKey((row + colOffset) % 10, col);

    const newHighlights = new Set(highlights);
    const newHidden = new Set(hidden);

    if (selectMode === SelectMode.HIGHLIGHT) {
      if (newHighlights.has(key)) {
        newHighlights.delete(key);
      } else {
        newHighlights.add(key);
      }
      newHidden.delete(key);
    } else {
      if (newHidden.has(key)) {
        newHidden.delete(key);
      } else {
        newHidden.add(key);
      }
      newHighlights.delete(key);
    }

    window.localStorage.setItem('highlights', JSON.stringify(Array.from(newHighlights)));
    window.localStorage.setItem('hidden', JSON.stringify(Array.from(newHidden)));

    setHighlights(newHighlights);
    setHidden(newHidden);
  };

  useEffect(() => {
    const localHighlights = window.localStorage.getItem('highlights');
    const localHidden = window.localStorage.getItem('hidden');
    const localRowOrder = window.localStorage.getItem('rowOrder');
    const localColOrder = window.localStorage.getItem('colOrder');
    const localColOffsets = window.localStorage.getItem('colOffsets');

    if (localHighlights) {
      setHighlights(new Set(JSON.parse(localHighlights)));
    }

    if (localHidden) {
      setHidden(new Set(JSON.parse(localHidden)));
    }

    if (localRowOrder) {
      setRowOrder(JSON.parse(localRowOrder));
    }

    if (localColOrder) {
      setColOrder(JSON.parse(localColOrder));
    }

    if (localColOffsets) {
      setColOffsets(JSON.parse(localColOffsets));
    }
  }, [])

  useEffect(() => {
    const newRows = range(10).map(row => {
      return range(36).map(col => {
        const colOffset = colOffsets[col + 1];
        return rowData[(row + colOffset) % 10][col];
      })
        .join('');
    });

    setRows(newRows);
  }, [colOffsets]);

  useEffect(() => {
    const newTrueRows = rowOrder.slice(1).map(row => row - 1).map(row => {
      return colOrder.slice(1).map(col => col - 1).map(col => {
        return rows[row][col];
      })
        .join('');
    });

    setTrueRows(newTrueRows);
  }, [rows, rowOrder, colOrder]);

  const swapRows = () => {
    const from = letterToIndex(swapRowFrom.toUpperCase().trim());
    const to = letterToIndex(swapRowTo.toUpperCase().trim());

    if (from > 0 && from <= 10 && to > 0 && to <= 10) {
      const newRowOrder = rowOrder.map(n => {
        if (n === from) {
          return to;
        } else if (n === to) {
          return from;
        }
        return n;
      });

      window.localStorage.setItem('rowOrder', JSON.stringify(newRowOrder));
      setRowOrder(newRowOrder);
    }
  };

  const swapCols = () => {
    const from = Number(swapColFrom);
    const to = Number(swapColTo);

    if (!Number.isNaN(from) && !Number.isNaN(to) && from > 0 && from <= 36 && to > 0 && to <= 36) {
      const newColOrder = colOrder.map(n => {
        if (n === from) {
          return to;
        } else if (n === to) {
          return from;
        }
        return n;
      });

      window.localStorage.setItem('colOrder', JSON.stringify(newColOrder));
      setColOrder(newColOrder);
    }
  };

  const clearSwapRowInputs = () => {
    setSwapRowFrom('');
    setSwapRowTo('');
  };

  const clearSwapColInputs = () => {
    setSwapColFrom('');
    setSwapColTo('');
  };

  const transposeCol = (col: number, offset: number): void => {
    if (col > 0 && col <= 36) {
      const newColOffsets = { ...colOffsets };
      let newOffset = newColOffsets[col];
      newOffset -= offset;

      if (newOffset < 0) {
        newOffset += 10;
      } else if (newOffset >= 10) {
        newOffset -= 10;
      }

      newColOffsets[col] = newOffset;
      setColOffsets(newColOffsets);
      window.localStorage.setItem('colOffsets', JSON.stringify(newColOffsets));
    }
  };

  const resetColOffset = (col: number): void => {
    if (col > 0 && col <= 36) {
      const newColOffsets = { ...colOffsets };
      newColOffsets[col] = 0;
      setColOffsets(newColOffsets);
      window.localStorage.setItem('colOffsets', JSON.stringify(newColOffsets));
    }
  };

  const resetRows = (): void => {
    setRowOrder(range(11));
    window.localStorage.removeItem('rowOrder');
  };

  const resetCols = (): void => {
    setColOrder(range(37));
    window.localStorage.removeItem('colOrder');
  };

  const resetHighlights = (): void => {
    setHighlights(new Set());
    setHidden(new Set());
    window.localStorage.removeItem('highlights');
    window.localStorage.removeItem('hidden');
  };

  const resetOffsets = (): void => {
    setColOffsets(Object.fromEntries(range(37).map(n => [n, 0])));
    window.localStorage.removeItem('colOffsets');
  };

  const resetInputs = (): void => {
    setSwapRowFrom('');
    setSwapRowTo('');
    setSwapColFrom('');
    setSwapColTo('');
  };

  const resetAll = (): void => {
    resetRows();
    resetCols();
    resetHighlights();
    resetOffsets();
    resetInputs();
  };

  const getOffsetStyle = (offset: number): string => {
    return ['arrow-cell', offset === 0 ? 'offset-faded' : ''].join(' ');
  };

  const hoverCell = (row: number, col: number, active: boolean): void => {
    setHoveredLetter(active && row > 0 && row <= 10 && col > 0 && col <= 36 ? getCell(row, col) : undefined);
  };

  const changeShowSameLettersOnHover = (show: boolean): void => {
    setShowSameLettersOnHover(show);
  };

  const changeShowMatchingLettersBetweenSides = (show: boolean): void => {
    setShowMatchingLettersBetweenSides(show);
  };

  const resetRowsDisabled = (): boolean => rowOrder.toString() === range(11).toString();

  const resetColsDisabled = (): boolean => colOrder.toString() === range(37).toString();

  const resetHighlightsDisabled = (): boolean => highlights.size === 0 && hidden.size === 0;

  const resetOffsetsDisabled = (): boolean => Object.values(colOffsets).every(offset => offset === 0);

  const allInputsEmpty = (): boolean => {
    return [
      swapRowFrom,
      swapRowTo,
      swapColFrom,
      swapColTo,
    ]
      .every(t => !t);
  };

  const resetAllDisabled = (): boolean => {
    return [
      resetRowsDisabled(),
      resetColsDisabled(),
      resetHighlightsDisabled(),
      resetOffsetsDisabled(),
      allInputsEmpty(),
    ]
      .every(t => t);
  };

  return (
    <div className="App">
      <span className="reset-container">
        <button
          onClick={() => resetRows()}
          disabled={resetRowsDisabled()}
        >
          Reset rows
        </button>
        <button
          onClick={() => resetCols()}
          disabled={resetColsDisabled()}
        >
          Reset columns
        </button>
        <button
          className="danger"
          onClick={() => resetAll()}
          disabled={resetAllDisabled()}
        >
          Reset all
        </button>
        <button
          onClick={() => resetHighlights()}
          disabled={resetHighlightsDisabled()}
        >
          Reset highlights
        </button>
        <button
          onClick={() => resetOffsets()}
          disabled={resetOffsetsDisabled()}
        >
          Reset offsets
        </button>
      </span>
      <table>
        <thead>
          <tr>
            {colOrder.map(col => {
              const offset = (10 - colOffsets[col]) % 10;
              return (
                <td
                  key={`thead-offset-${col}`}
                  className={getOffsetStyle(offset)}
                  onClick={() => resetColOffset(col)}
                >
                  {col > 0 ? offset : ''}
                </td>
              );
            })}
          </tr>
          <tr>
            {colOrder.map(col => (
              <td
                key={`thead-${col}`}
                className="border-bottom-bold arrow-cell"
                onClick={() => transposeCol(col, -1)}
              >
                {col > 0 ? '↑' : ''}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowOrder.map((row, trueRow) => (
            <tr key={row}>
              {colOrder.map((col, trueCol) => (
              <td
                key={getCellKey(row, col)}
                className={
                  [
                    row === 0 || col === 0 ? 'bold' : '',
                    (row === 0 || col === 0) && (row !== trueRow || col != trueCol) ? 'cell-changed' : '',
                    row === 0 ? 'border-bottom-bold' : '',
                    col === 0 ? 'border-right-bold' : '',
                    trueCol === 19 ? 'border-left-bold' : '',
                    getCellStyle(row, col, trueRow, trueCol),
                  ]
                    .join(' ')
                }
                onClick={() => cellClicked(row, col)}
                onMouseEnter={() => hoverCell(row, col, true)}
                onMouseLeave={() => hoverCell(row, col, false)}
              >
                {getCell(row, col)}
              </td>
            ))}
            </tr>)
          )}
        </tbody>
        <tfoot>
          <tr>
            {colOrder.map(col => (
              <td
                key={`tfoot-${col}`}
                className="border-top-bold arrow-cell"
                onClick={() => transposeCol(col, 1)}
              >
                {col > 0 ? '↓' : ''}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
      <div className="swap">
        <span className="swap-gap">
          <button
            onClick={() => clearSwapRowInputs()}
            disabled={!swapRowFrom && !swapRowTo}
          >
            Clear inputs
          </button>
          <input
            value={swapRowFrom}
            onChange={e => setSwapRowFrom(e.target.value)}
            maxLength={1}
            placeholder="Row"
          />
          ⇄
          <input
            value={swapRowTo}
            onChange={e => setSwapRowTo(e.target.value)}
            maxLength={1}
            placeholder="Row"
          />
          <button
            onClick={() => swapRows()}
            disabled={!swapRowFrom.trim() || !swapRowTo.trim()}
          >
            Swap rows
          </button>
        </span>
      </div>
      <div className="swap">
        <span className="swap-gap">
          <button
            onClick={() => clearSwapColInputs()}
            disabled={!swapColFrom && !swapColTo}
          >
            Clear inputs
          </button>
          <input
            value={swapColFrom}
            onChange={e => setSwapColFrom(e.target.value)}
            maxLength={2}
            placeholder="Column"
          />
          ⇄
          <input
            value={swapColTo}
            onChange={e => setSwapColTo(e.target.value)}
            maxLength={2}
            placeholder="Column"
          />
          <button
            onClick={() => swapCols()}
            disabled={!swapColFrom.trim() || !swapColTo.trim()}
          >
            Swap columns
          </button>
        </span>
      </div>
      <div className="highlight-container">
        <label>
          <input
            type="radio"
            checked={selectMode === SelectMode.HIGHLIGHT}
            onChange={e => setSelectMode(e.target.checked ? SelectMode.HIGHLIGHT : SelectMode.HIDE)}
          />
          Highlight
        </label>
        <label>
          <input
            type="radio"
            checked={selectMode === SelectMode.HIDE}
            onChange={e => setSelectMode(e.target.checked ? SelectMode.HIDE : SelectMode.HIGHLIGHT)}
          />
          Hide
        </label>
      </div>
      <div className="options-container">
        <span className="option-row">
          <label>
            <input
              type="checkbox"
              checked={showSameLettersOnHover}
              onChange={e => changeShowSameLettersOnHover(e.target.checked)}
            />
            Show same letters on hover
          </label>
        </span>
        <span className="option-row">
          <label>
            <input
              type="checkbox"
              checked={showMatchingLettersBetweenSides}
              onChange={e => changeShowMatchingLettersBetweenSides(e.target.checked)}
            />
            Show matching letters between sides
          </label>
        </span>
      </div>
      <span className="version-container">
        <span className="version-text" title={VERSION_TEXT_TITLE}>
          {VERSION_TEXT}
        </span>
      </span>
    </div>
  );
};

export default App;
