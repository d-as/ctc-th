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

enum HighlightMode {
  HIGHLIGHT_1,
  HIGHLIGHT_2,
  HIGHLIGHT_3,
  HIGHLIGHT_4,
  HIDE,
}

enum LocalStorageKey {
  HIGHLIGHTS_1 = 'highlights',
  HIGHLIGHTS_2 = 'highlights2',
  HIGHLIGHTS_3 = 'highlights3',
  HIGHLIGHTS_4 = 'highlights4',
  HIDDEN = 'hidden',
  ROW_ORDER = 'rowOrder',
  COL_ORDER = 'colOrder',
  COL_OFFSETS = 'colOffsets',
  SHOW_SAME_LETTERS_ON_HOVER = 'showSameLettersOnHover',
  SHOW_MATCHING_LETTERS = 'showMatchingLetters',
  SHOW_VOWELS = 'showVowels',
}

const VERSION_TEXT = 'v0.4.4 / DAS#0437';
const VERSION_TEXT_TITLE = 'Discord Tag'

const App = () => {
  const [rows, setRows] = useState([...rowData]);
  const [trueRows, setTrueRows] = useState(rows);
  const [rowOrder, setRowOrder] = useState(range(11));
  const [colOrder, setColOrder] = useState(range(37));
  const [highlights1, setHighlights1] = useState(new Set<string>());
  const [highlights2, setHighlights2] = useState(new Set<string>());
  const [highlights3, setHighlights3] = useState(new Set<string>());
  const [highlights4, setHighlights4] = useState(new Set<string>());
  const [hidden, setHidden] = useState(new Set<string>());
  const [colOffsets, setColOffsets] = useState(Object.fromEntries(range(37).map(n => [n, 0])));
  const [highlightMode, setHighlightMode] = useState(HighlightMode.HIGHLIGHT_1);

  const [swapRowFrom, setSwapRowFrom] = useState('');
  const [swapRowTo, setSwapRowTo] = useState('');
  const [swapColFrom, setSwapColFrom] = useState('');
  const [swapColTo, setSwapColTo] = useState('');

  const [showSameLettersOnHover, setShowSameLettersOnHover] = useState(false);
  const [showMatchingLettersBetweenSides, setShowMatchingLettersBetweenSides] = useState(false);
  const [showVowels, setShowVowels] = useState(false);
  const [hoveredLetter, setHoveredLetter] = useState<string | undefined>();

  const indexToLetter = (row: number): string => {
    return String.fromCharCode('A'.charCodeAt(0) + row - 1);
  };

  const letterToIndex = (letter: string): number => {
    return letter.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
  }

  const noDuplicateLabelsOnOneSide = (): boolean => {
    return colOrder.slice(0, 19).every(col => col < 19);
  };

  const getCell = (row: number, col: number, trueRow: number, trueCol: number, visual = false): string => {
    if (row === 0 && col === 0) {
      return ''
    } else if (row === 0) {
      if (visual && trueCol > 18 && noDuplicateLabelsOnOneSide()) {
        return (col > 18 ? (col - 18) : col).toString();
      }
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

  const isVowel = (cell: string): boolean => 'AEIOU'.includes(cell);

  const getCellStyle = (row: number, col: number, trueRow: number, trueCol: number): string => {
    const cell = getCell(row, col, trueRow, trueCol);

    if (row === 0 || col === 0) {
      return [
        'cursor-pointer',
        getActiveCellStyle(row, col, cell),
      ]
        .join(' ')
    }

    const colOffset = colOffsets[col];
    const key = getCellKey((row + colOffset) % 10, col);
    const isHighlighted1 = highlights1.has(key);
    const isHighlighted2 = highlights2.has(key);
    const isHighlighted3 = highlights3.has(key);
    const isHighlighted4 = highlights4.has(key);
    const isHidden = hidden.has(key);

    return [
      isHighlighted1 ? 'highlight-1' : '',
      isHighlighted2 ? 'highlight-2' : '',
      isHighlighted3 ? 'highlight-3' : '',
      isHighlighted4 ? 'highlight-4' : '',
      isHidden ? 'hidden' : '',
      showSameLettersOnHover && cell === hoveredLetter ? 'hovered-letter-cell' : '',
      showMatchingLettersBetweenSides ? getMatchingCellStyle(trueRow, trueCol) : '',
      showVowels && isVowel(cell) ? 'cell-vowel' : '',
    ]
      .join(' ');
  };

  const headerClicked = (row: number, col: number, trueRow: number, trueCol: number): void => {
    const cell = getCell(row, col, trueRow, trueCol);

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

  const cellClicked = (row: number, col: number, trueRow: number, trueCol: number): void => {
    if (row === 0 || col === 0) {
      headerClicked(row, col, trueRow, trueCol);
      return;
    }

    const colOffset = colOffsets[col];
    const key = getCellKey((row + colOffset) % 10, col);

    const newHighlights1 = new Set(highlights1);
    const newHighlights2 = new Set(highlights2);
    const newHighlights3 = new Set(highlights3);
    const newHighlights4 = new Set(highlights4);
    const newHidden = new Set(hidden);

    if (highlightMode === HighlightMode.HIGHLIGHT_1) {
      if (newHighlights1.has(key)) {
        newHighlights1.delete(key);
      } else {
        newHighlights1.add(key);
      }

      newHighlights2.delete(key);
      newHighlights3.delete(key);
      newHighlights4.delete(key);
      newHidden.delete(key);
    } else if (highlightMode === HighlightMode.HIGHLIGHT_2) {
      if (newHighlights2.has(key)) {
        newHighlights2.delete(key);
      } else {
        newHighlights2.add(key);
      }

      newHighlights1.delete(key);
      newHighlights3.delete(key);
      newHighlights4.delete(key);
      newHidden.delete(key);
    } else if (highlightMode === HighlightMode.HIGHLIGHT_3) {
      if (newHighlights3.has(key)) {
        newHighlights3.delete(key);
      } else {
        newHighlights3.add(key);
      }

      newHighlights1.delete(key);
      newHighlights2.delete(key);
      newHighlights4.delete(key);
      newHidden.delete(key);
    } else if (highlightMode === HighlightMode.HIGHLIGHT_4) {
      if (newHighlights4.has(key)) {
        newHighlights4.delete(key);
      } else {
        newHighlights4.add(key);
      }

      newHighlights1.delete(key);
      newHighlights2.delete(key);
      newHighlights3.delete(key);
      newHidden.delete(key);
    } else if (highlightMode === HighlightMode.HIDE) {
      if (newHidden.has(key)) {
        newHidden.delete(key);
      } else {
        newHidden.add(key);
      }

      newHighlights1.delete(key);
      newHighlights2.delete(key);
      newHighlights3.delete(key);
      newHighlights4.delete(key);
    }

    window.localStorage.setItem(LocalStorageKey.HIGHLIGHTS_1, JSON.stringify(Array.from(newHighlights1)));
    window.localStorage.setItem(LocalStorageKey.HIGHLIGHTS_2, JSON.stringify(Array.from(newHighlights2)));
    window.localStorage.setItem(LocalStorageKey.HIGHLIGHTS_3, JSON.stringify(Array.from(newHighlights3)));
    window.localStorage.setItem(LocalStorageKey.HIGHLIGHTS_4, JSON.stringify(Array.from(newHighlights4)));
    window.localStorage.setItem(LocalStorageKey.HIDDEN, JSON.stringify(Array.from(newHidden)));

    setHighlights1(newHighlights1);
    setHighlights2(newHighlights2);
    setHighlights3(newHighlights3);
    setHighlights4(newHighlights4);
    setHidden(newHidden);
  };

  useEffect(() => {
    const localHighlights1 = window.localStorage.getItem(LocalStorageKey.HIGHLIGHTS_1);
    const localHighlights2 = window.localStorage.getItem(LocalStorageKey.HIGHLIGHTS_2);
    const localHighlights3 = window.localStorage.getItem(LocalStorageKey.HIGHLIGHTS_3);
    const localHighlights4 = window.localStorage.getItem(LocalStorageKey.HIGHLIGHTS_4);
    const localHidden = window.localStorage.getItem(LocalStorageKey.HIDDEN);
    const localRowOrder = window.localStorage.getItem(LocalStorageKey.ROW_ORDER);
    const localColOrder = window.localStorage.getItem(LocalStorageKey.COL_ORDER);
    const localColOffsets = window.localStorage.getItem(LocalStorageKey.COL_OFFSETS);
    const localShowSameLetters = window.localStorage.getItem(LocalStorageKey.SHOW_SAME_LETTERS_ON_HOVER);
    const localShowMatchingLetters = window.localStorage.getItem(LocalStorageKey.SHOW_MATCHING_LETTERS);
    const localShowVowels = window.localStorage.getItem(LocalStorageKey.SHOW_VOWELS);

    if (localHighlights1) {
      setHighlights1(new Set(JSON.parse(localHighlights1)));
    }

    if (localHighlights2) {
      setHighlights2(new Set(JSON.parse(localHighlights2)));
    }

    if (localHighlights3) {
      setHighlights3(new Set(JSON.parse(localHighlights3)));
    }

    if (localHighlights4) {
      setHighlights4(new Set(JSON.parse(localHighlights4)));
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

    if (localShowSameLetters) {
      setShowSameLettersOnHover(JSON.parse(localShowSameLetters));
    }

    if (localShowMatchingLetters) {
      setShowMatchingLettersBetweenSides(JSON.parse(localShowMatchingLetters));
    }

    if (localShowVowels) {
      setShowVowels(JSON.parse(localShowVowels));
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

      window.localStorage.setItem(LocalStorageKey.ROW_ORDER, JSON.stringify(newRowOrder));
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

      window.localStorage.setItem(LocalStorageKey.COL_ORDER, JSON.stringify(newColOrder));
      setColOrder(newColOrder);
    }
  };

  const clearSelectedRowsAndCols = () => {
    setSwapRowFrom('');
    setSwapRowTo('');
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
      window.localStorage.setItem(LocalStorageKey.COL_OFFSETS, JSON.stringify(newColOffsets));
    }
  };

  const resetColOffset = (col: number): void => {
    if (col > 0 && col <= 36) {
      const newColOffsets = { ...colOffsets };
      newColOffsets[col] = 0;
      setColOffsets(newColOffsets);
      window.localStorage.setItem(LocalStorageKey.COL_OFFSETS, JSON.stringify(newColOffsets));
    }
  };

  const resetRows = (): void => {
    setRowOrder(range(11));
    window.localStorage.removeItem(LocalStorageKey.ROW_ORDER);
  };

  const resetCols = (): void => {
    setColOrder(range(37));
    window.localStorage.removeItem(LocalStorageKey.COL_ORDER);
  };

  const resetHighlights = (): void => {
    setHighlights1(new Set());
    setHighlights2(new Set());
    setHighlights3(new Set());
    setHighlights4(new Set());
    setHidden(new Set());
    window.localStorage.removeItem(LocalStorageKey.HIGHLIGHTS_1);
    window.localStorage.removeItem(LocalStorageKey.HIGHLIGHTS_2);
    window.localStorage.removeItem(LocalStorageKey.HIGHLIGHTS_3);
    window.localStorage.removeItem(LocalStorageKey.HIGHLIGHTS_4);
    window.localStorage.removeItem(LocalStorageKey.HIDDEN);
  };

  const resetOffsets = (): void => {
    setColOffsets(Object.fromEntries(range(37).map(n => [n, 0])));
    window.localStorage.removeItem(LocalStorageKey.COL_OFFSETS);
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

  const hoverCell = (row: number, col: number, trueRow: number, trueCol: number, active: boolean): void => {
    setHoveredLetter(
      active && row > 0 && row <= 10 && col > 0 && col <= 36
        ? getCell(row, col, trueRow, trueCol)
        : undefined
    );
  };

  const changeShowSameLettersOnHover = (show: boolean): void => {
    setShowSameLettersOnHover(show);
    window.localStorage.setItem(LocalStorageKey.SHOW_SAME_LETTERS_ON_HOVER, JSON.stringify(show));
  };

  const changeShowMatchingLettersBetweenSides = (show: boolean): void => {
    setShowMatchingLettersBetweenSides(show);
    window.localStorage.setItem(LocalStorageKey.SHOW_MATCHING_LETTERS, JSON.stringify(show));
  };

  const changeShowVowels = (show: boolean): void => {
    setShowVowels(show);
    window.localStorage.setItem(LocalStorageKey.SHOW_VOWELS, JSON.stringify(show));
  };

  const resetRowsDisabled = (): boolean => rowOrder.toString() === range(11).toString();

  const resetColsDisabled = (): boolean => colOrder.toString() === range(37).toString();

  const resetHighlightsDisabled = (): boolean => (
    !highlights1.size && !highlights2.size && !highlights3.size && !highlights4.size && !hidden.size
  );

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
                onClick={() => cellClicked(row, col, trueRow, trueCol)}
                onMouseEnter={() => hoverCell(row, col, trueRow, trueCol, true)}
                onMouseLeave={() => hoverCell(row, col, trueRow, trueCol, false)}
              >
                {getCell(row, col, trueRow, trueCol, true)}
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
      <span className="white">
        Click row/column labels to select them
      </span>
      <div className="option-row">
        <button
          onClick={() => swapRows()}
          disabled={!swapRowFrom.trim() || !swapRowTo.trim()}
        >
          Swap rows
        </button>
        <button
          onClick={() => swapCols()}
          disabled={!swapColFrom.trim() || !swapColTo.trim()}
        >
          Swap columns
        </button>
      </div>
      <div className="option-row">
        <button
          onClick={() => clearSelectedRowsAndCols()}
          disabled={!swapRowFrom && !swapRowTo && !swapColFrom && !swapColTo}
          className="wide-button"
        >
          Clear selected rows/columns
        </button>
      </div>
      <div className="options-container">
        <span className="option-row">
          Cell highlight mode
        </span>
        <span className="option-row">
          <table className="black-borders">
            <tbody>
              <tr>
                {range(4).map(n => (
                  <td
                    key={`highlight-option-${n + 1}`}
                    className={`highlight-${n + 1} check-mark`}
                    onClick={() => setHighlightMode(n)}
                  >
                    {highlightMode === n ? '✔' : ''}
                  </td>
                ))}
                <td
                  className={`hide ${highlightMode === HighlightMode.HIDE ? 'check-mark' : ''}`}
                  onClick={() => setHighlightMode(HighlightMode.HIDE)}
                >
                  {highlightMode === HighlightMode.HIDE ? '✔' : 'Hide'}
                </td>
              </tr>
            </tbody>
          </table>
        </span>
        <div className="spacer"></div>
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
              checked={showVowels}
              onChange={e => changeShowVowels(e.target.checked)}
            />
            Show vowels
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
