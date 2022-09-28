import { useEffect, useState } from 'react';

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

enum LocalStorageKey {
  HIGHLIGHTS = 'highlights',
  HIGHLIGHT_MODE = 'highlightMode',
  ROW_ORDER_LEFT = 'rowOrder',
  ROW_ORDER_RIGHT = 'rowOrderRight',
  COL_ORDER = 'colOrder',
  COL_OFFSETS = 'colOffsets',
  HIGHLIGHT_SAME_LETTERS_WHEN_CLICKED = 'highlightSameLettersWhenClicked',
  SHOW_SAME_LETTERS_ON_HOVER = 'showSameLettersOnHover',
  SHOW_MATCHING_LETTERS = 'showMatchingLetters',
  SHOW_COMMON_LETTERS_ON_EACH_ROW = 'showCommonLettersOnEachRow',
  SHOW_VOWELS = 'showVowels',
  SHOW_SUBSTITUTIONS = 'showSubstitutions',
  SUBSTITUTIONS = 'substitutions',
  VERSION = 'version',
}

type Side = 'left' | 'right';

const VERSION = 'v0.8.0';
const VERSION_TEXT = [VERSION, 'DAS#0437'].join(' / ');
const VERSION_TEXT_TITLE = 'Feel free to DM me on Discord if you have bug reports or feature requests';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const App = () => {
  const [rows, setRows] = useState([...rowData]);
  const [trueRows, setTrueRows] = useState(rows);
  const [rowOrderLeft, setRowOrderLeft] = useState(range(11));
  const [rowOrderRight, setRowOrderRight] = useState(range(11));
  const [colOrder, setColOrder] = useState(range(38));
  const [highlights, setHighlights] = useState<Record<string, number | undefined>>({});
  const [colOffsets, setColOffsets] = useState(Object.fromEntries(range(38).map(n => [n, 0])));
  const [highlightMode, setHighlightMode] = useState(0);

  const [substitutions, setSubstitutions] = useState<Record<string, string>>(
    Object.fromEntries([...ALPHABET].map(letter => [letter, letter])),
  );

  const [showSubstitutions, setShowSubstitutions] = useState(false);

  // These could be arrays instead of separate values, e.g. const [swapLeft, setSwapLeft] = useState<string[]>([])
  const [swapLeftRowFrom, setSwapLeftRowFrom] = useState('');
  const [swapLeftRowTo, setSwapLeftRowTo] = useState('');
  const [swapRightRowFrom, setSwapRightRowFrom] = useState('');
  const [swapRightRowTo, setSwapRightRowTo] = useState('');
  const [swapColFrom, setSwapColFrom] = useState('');
  const [swapColTo, setSwapColTo] = useState('');

  const [showSameLettersOnHover, setShowSameLettersOnHover] = useState(false);
  const [showMatchingLettersBetweenSides, setShowMatchingLettersBetweenSides] = useState(false);
  const [showCommonLettersBetweenSidesOnEachRow, setShowCommonLettersBetweenSidesOnEachRow] = useState(false);
  const [showVowels, setShowVowels] = useState(false);
  const [highlightSameLettersWhenClicked, setHighlightSameLettersWhenClicked] = useState(false);
  const [showOrdinals, setShowOrdinals] = useState(false); // TODO: Add a setting for this

  const [hoveredLetter, setHoveredLetter] = useState<string | undefined>();

  // Don't use this for rows, use rowToLetter instead since it handles column rotations
  const indexToLetter = (index: number): string => String.fromCharCode('A'.charCodeAt(0) + index - 1);

  const rowToLetter = (row: number): string => {
    while (row > 10) {
      row -= 10;
    }
    return indexToLetter(row);
  };

  const letterToIndex = (letter: string): number => {
    if (!letter) {
      return -1;
    }
    return letter.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
  };

  const getOrdinal = (letter: string): number => {
    return (letter.charCodeAt(0) - 'A'.charCodeAt(0) + 1);
  };

  const noDuplicateLabelsOnOneSide = (): boolean => {
    return colOrder.slice(0, 19).every(col => col < 19);
  };

  // Returns the cell value from the original grid at a given position
  // If you need a value from the current layout of the grid, use getTrueCell
  const getCell = (row: number, col: number, trueCol?: number, startColumnsFromOneOnBothSide = false): string => {
    if (row === 0 && (col < 1 || col > 36)) {
      return ''
    } else if (row === 0) {
      if (startColumnsFromOneOnBothSide && trueCol !== undefined && trueCol > 18 && noDuplicateLabelsOnOneSide()) {
        return (col > 18 ? (col - 18) : col).toString();
      }
      return col.toString();
    } else if (col === 0 || col === 37) {
      return rowToLetter(row);
    }

    const cell = rows[row - 1][col - 1];
    const letter = showSubstitutions ? substitutions[cell] : cell;
    return showOrdinals ? getOrdinal(letter).toString() : letter;
  };

  // True cell refers to the cell that is currently displayed at a given position
  // For example, getTrueCell(1, 1) returns the value currently displayed in the top-left corner of the letter grid
  const getTrueCell = (trueRow: number, trueCol: number): string => {
    const trueCell = trueRows[trueRow - 1][trueCol - 1];
    return showSubstitutions ? substitutions[trueCell] : trueCell;
  };

  const getCellKey = (row: number, col: number): string => {
    return [rowToLetter(row), col].join(',');
  };

  const getActiveCellStyle = (row: number, col: number, cell: string): string => {
    if (row === 0 && (col < 1 || col > 36)) {
      return '';
    }

    return (
      swapColFrom === cell || swapColTo === cell ||
      (col === 0 && (swapLeftRowFrom === cell || swapLeftRowTo === cell)) ||
      (col === 37 && (swapRightRowFrom === cell || swapRightRowTo === cell))
    ) ? 'cell-swap-active' : '';
  };

  const getMatchingCellStyle = (trueRow: number, trueCol: number): string => {
    const cell = getTrueCell(trueRow, trueCol);
    const oppositeCell = getTrueCell(trueRow, trueCol < 19 ? trueCol + 18 : trueCol - 18);
    return cell === oppositeCell ? 'cell-matching' : '';
  };

  const getCommonLetterCellStyle = (trueRow: number, trueCol: number): string => {
    // It's a bit inefficient to calculate this separately for each cell, since it only changes per row
    const cell = getTrueCell(trueRow, trueCol);
    const side = trueCol <= 18 ? 'left' : 'right';
    const otherSideCells = range(18).map(n => side === 'left' ? n + 19 : n + 1).map(col => getTrueCell(trueRow, col));
    return otherSideCells.includes(cell) ? 'cell-matching' : '';
  };

  const isVowel = (cell: string): boolean => 'AEIOU'.includes(cell);

  const getCellStyle = (row: number, col: number, trueRow: number, trueCol: number): string => {
    const cell = getCell(row, col, trueCol);

    if (row === 0 || col === 0 || col === 37) {
      return [
        'cursor-pointer',
        getActiveCellStyle(row, col, cell),
      ]
        .join(' ')
    }

    const colOffset = colOffsets[col];
    const key = getCellKey(row + colOffset, col);
    const highlight = highlights[key];

    return [
      highlight !== undefined ? `highlight-${highlight + 1}` : '',
      showSameLettersOnHover && cell === hoveredLetter ? 'hovered-letter-cell' : '',
      showMatchingLettersBetweenSides ? getMatchingCellStyle(trueRow, trueCol) : '',
      showMatchingLettersBetweenSides && showCommonLettersBetweenSidesOnEachRow ? getCommonLetterCellStyle(trueRow, trueCol) : '',
      showVowels && isVowel(cell) ? 'cell-vowel' : '',
    ]
      .join(' ');
  };

  const headerClicked = (row: number, col: number, trueRow: number, trueCol: number): void => {
    const cell = getCell(row, col, trueCol);

    // This could be refactored if from/to states are combined to a single array state

    if (row === 0) {
      if (swapColFrom === cell) {
        setSwapColFrom('');
      } else if (swapColTo === cell) {
        setSwapColTo('');
      } else if (!swapColFrom && cell !== swapColTo) {
        setSwapColFrom(cell);
      } else if (!swapColTo && cell !== swapColFrom) {
        setSwapColTo(cell);
      } else {
        setSwapColFrom(cell);
        setSwapColTo('');
      }
    } else if (col === 0) {
      if (swapLeftRowFrom === cell) {
        setSwapLeftRowFrom('');
      } else if (swapLeftRowTo === cell) {
        setSwapLeftRowTo('');
      } else if (!swapLeftRowFrom && cell !== swapLeftRowTo) {
        setSwapLeftRowFrom(cell);
      } else if (!swapLeftRowTo && cell !== swapLeftRowFrom) {
        setSwapLeftRowTo(cell);
      } else {
        setSwapLeftRowFrom(cell);
        setSwapLeftRowTo('');
      }
    } else if (col === 37) {
      if (swapRightRowFrom === cell) {
        setSwapRightRowFrom('');
      } else if (swapRightRowTo === cell) {
        setSwapRightRowTo('');
      } else if (!swapRightRowFrom && cell !== swapRightRowTo) {
        setSwapRightRowFrom(cell);
      } else if (!swapRightRowTo && cell !== swapRightRowFrom) {
        setSwapRightRowTo(cell);
      } else {
        setSwapRightRowFrom(cell);
        setSwapRightRowTo('');
      }
    }
  };

  const highlightAllCellsWithValue = (value: string): void => {
    const cellKeys: string[] = [];
    const newHighlights = { ...highlights };
    let shouldRemoveHighlights = true;

    range(11).forEach(row => {
      range(37).forEach(col => {
        if (row > 0 && col > 0) {
          const cell = getCell(row, col);

          if (cell === value) {
            const cellKey = getCellKey(row + colOffsets[col], col);
            cellKeys.push(cellKey);

            if (highlights[cellKey] !== highlightMode) {
              shouldRemoveHighlights = false;
            }
          }
        }
      });
    });

    cellKeys.forEach(cellKey => {
      newHighlights[cellKey] = shouldRemoveHighlights ? undefined : highlightMode;
    });

    window.localStorage.setItem(LocalStorageKey.HIGHLIGHTS, JSON.stringify(newHighlights));
    setHighlights(newHighlights);
  };

  const cellClicked = (row: number, col: number, trueRow: number, trueCol: number): void => {
    if (row === 0 || col === 0 || col === 37) {
      headerClicked(row, col, trueRow, trueCol);
      return;
    }

    const colOffset = colOffsets[col];
    const cellKey = getCellKey(row + colOffset, col);
    const cell = getCell(row, col, trueCol);

    if (showSameLettersOnHover && highlightSameLettersWhenClicked) {
      highlightAllCellsWithValue(cell);
    } else {
      const newHighlights = { ...highlights };

      newHighlights[cellKey] = highlights[cellKey] === highlightMode ? undefined : highlightMode;
  
      window.localStorage.setItem(LocalStorageKey.HIGHLIGHTS, JSON.stringify(newHighlights));
      setHighlights(newHighlights);
    }
  };

  const validateHighlights = (localHighlights: string): boolean => {
    try {
      const parsedHighlights = JSON.parse(localHighlights) as Record<string, number | undefined>;

      const isValidKeys = Object.keys(parsedHighlights).every(cell => {
        const [row, col] = cell.split(',');
        const colNumber = Number(col);
        return 'ABCDEFGHIJ'.includes(row) && !Number.isNaN(colNumber) && colNumber > 0 && colNumber < 37;
      });

      const isValidValues = Object.values(parsedHighlights).every(highlightMode => {
        return highlightMode === undefined || (highlightMode >= 0 && Number.isInteger(highlightMode));
      });

      if (isValidKeys && isValidValues) {
        return true;
      }
      throw new Error();
    } catch {
      window.localStorage.removeItem(LocalStorageKey.HIGHLIGHTS);
    }
    return false;
  };

  useEffect(() => {
    // This could be a bit more elegant

    const localHighlights = window.localStorage.getItem(LocalStorageKey.HIGHLIGHTS);
    const localRowOrderRight = window.localStorage.getItem(LocalStorageKey.ROW_ORDER_RIGHT);
    const localRowOrderLeft = window.localStorage.getItem(LocalStorageKey.ROW_ORDER_LEFT);
    const localColOrder = window.localStorage.getItem(LocalStorageKey.COL_ORDER);
    const localColOffsets = window.localStorage.getItem(LocalStorageKey.COL_OFFSETS);
    const localHighlightMode = window.localStorage.getItem(LocalStorageKey.HIGHLIGHT_MODE);
    const localHighlightSameLettersWhenClicked = window.localStorage.getItem(LocalStorageKey.HIGHLIGHT_SAME_LETTERS_WHEN_CLICKED);
    const localShowSameLetters = window.localStorage.getItem(LocalStorageKey.SHOW_SAME_LETTERS_ON_HOVER);
    const localShowMatchingLetters = window.localStorage.getItem(LocalStorageKey.SHOW_MATCHING_LETTERS);
    const localShowCommonLettersOnEachRow = window.localStorage.getItem(LocalStorageKey.SHOW_COMMON_LETTERS_ON_EACH_ROW);
    const localShowVowels = window.localStorage.getItem(LocalStorageKey.SHOW_VOWELS);
    const localShowSubstitutions = window.localStorage.getItem(LocalStorageKey.SHOW_SUBSTITUTIONS);
    const localSubstitutions = window.localStorage.getItem(LocalStorageKey.SUBSTITUTIONS);
    const localVersion = window.localStorage.getItem(LocalStorageKey.VERSION);

    if (localHighlights && validateHighlights(localHighlights)) {
      setHighlights(JSON.parse(localHighlights));
    }

    if (localRowOrderLeft) {
      setRowOrderLeft(JSON.parse(localRowOrderLeft));
    }

    if (localRowOrderRight) {
      setRowOrderRight(JSON.parse(localRowOrderRight));
    }

    if (localColOrder) {
      const newColOrder = JSON.parse(localColOrder);

      if (newColOrder.length === 38) {
        setColOrder(newColOrder);
      } else {
        window.localStorage.removeItem(LocalStorageKey.COL_ORDER);
      }
    }

    if (localColOffsets) {
      const newColOffsets = JSON.parse(localColOffsets);

      if (Object.keys(newColOffsets).length === 38) {
        setColOffsets(newColOffsets);
      } else {
        window.localStorage.removeItem(LocalStorageKey.COL_OFFSETS);
      }
    }

    if (localHighlightMode) {
      setHighlightMode(JSON.parse(localHighlightMode));
    }

    if (localHighlightSameLettersWhenClicked) {
      setHighlightSameLettersWhenClicked(JSON.parse(localHighlightSameLettersWhenClicked));
    }

    if (localShowSameLetters) {
      setShowSameLettersOnHover(JSON.parse(localShowSameLetters));
    }

    if (localShowMatchingLetters) {
      setShowMatchingLettersBetweenSides(JSON.parse(localShowMatchingLetters));
    }

    if (localShowCommonLettersOnEachRow) {
      setShowCommonLettersBetweenSidesOnEachRow(JSON.parse(localShowCommonLettersOnEachRow));
    }

    if (localShowVowels) {
      setShowVowels(JSON.parse(localShowVowels));
    }

    if (localShowSubstitutions) {
      setShowSubstitutions(JSON.parse(localShowSubstitutions));
    }

    if (localSubstitutions) {
      setSubstitutions(JSON.parse(localSubstitutions));
    }

    if (!localVersion || localVersion !== VERSION) {
      window.localStorage.setItem(LocalStorageKey.VERSION, VERSION);
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
    const trueRowsLeft = rowOrderLeft.slice(1).map(row => row - 1).map(row => {
      return colOrder.slice(1, 19).map(col => col - 1).map(col => {
        return rows[row][col];
      })
        .join('');
    });

    const trueRowsRight = rowOrderRight.slice(1).map(row => row - 1).map(row => {
      return colOrder.slice(19).map(col => col - 1).map(col => {
        return rows[row][col];
      })
        .join('');
    });

    const newTrueRows = range(10).map(i => [trueRowsLeft[i], trueRowsRight[i]].join(''));

    setTrueRows(newTrueRows);
  }, [rows, rowOrderLeft, rowOrderRight, colOrder]);

  const swapRows = (side: Side) => {
    const from = letterToIndex((side === 'left' ? swapLeftRowFrom : swapRightRowFrom));
    const to = letterToIndex((side === 'left' ? swapLeftRowTo : swapRightRowTo));

    if (from > 0 && from <= 10 && to > 0 && to <= 10) {
      const newRowOrder = (side === 'left' ? rowOrderLeft : rowOrderRight).map(n => {
        if (n === from) {
          return to;
        } else if (n === to) {
          return from;
        }
        return n;
      });

      window.localStorage.setItem(
        side === 'left' ? LocalStorageKey.ROW_ORDER_LEFT : LocalStorageKey.ROW_ORDER_RIGHT,
        JSON.stringify(newRowOrder),
      );

      if (side === 'left') {
        setRowOrderLeft(newRowOrder);
      } else {
        setRowOrderRight(newRowOrder);
      }
    }
  };

  const swapCols = (from: number, to: number) => {
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
    setSwapLeftRowFrom('');
    setSwapLeftRowTo('');
    setSwapRightRowFrom('');
    setSwapRightRowTo('');
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
    setRowOrderLeft(range(11));
    setRowOrderRight(range(11));
    window.localStorage.removeItem(LocalStorageKey.ROW_ORDER_LEFT);
    window.localStorage.removeItem(LocalStorageKey.ROW_ORDER_RIGHT);
  };

  const resetCols = (): void => {
    setColOrder(range(38));
    window.localStorage.removeItem(LocalStorageKey.COL_ORDER);
  };

  const resetHighlights = (): void => {
    setHighlights({});
    window.localStorage.removeItem(LocalStorageKey.HIGHLIGHTS);
  };

  const resetOffsets = (): void => {
    setColOffsets(Object.fromEntries(range(38).map(n => [n, 0])));
    window.localStorage.removeItem(LocalStorageKey.COL_OFFSETS);
  };

  const resetSubstitutions = (): void => {
    const newSubstitutions = Object.fromEntries([...ALPHABET].map(letter => [letter, letter]));
    setSubstitutions(newSubstitutions);
    window.localStorage.setItem(LocalStorageKey.SUBSTITUTIONS, JSON.stringify(newSubstitutions));
  };

  const resetAll = (): void => {
    resetRows();
    resetCols();
    resetHighlights();
    resetOffsets();
    clearSelectedRowsAndCols();
    resetSubstitutions();
  };

  const getOffsetStyle = (offset: number): string => {
    return ['arrow-cell', offset === 0 ? 'offset-faded' : ''].join(' ');
  };

  const hoverCell = (row: number, col: number, trueRow: number, trueCol: number, active: boolean): void => {
    setHoveredLetter(
      active && row > 0 && row <= 10 && col > 0 && col <= 36
        ? getCell(row, col, trueRow)
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

  const changeHighlightSameLettersWhenClicked = (checked: boolean): void => {
    setHighlightSameLettersWhenClicked(checked);
    window.localStorage.setItem(LocalStorageKey.HIGHLIGHT_SAME_LETTERS_WHEN_CLICKED, JSON.stringify(checked));
  };

  const changeShowVowels = (show: boolean): void => {
    setShowVowels(show);
    window.localStorage.setItem(LocalStorageKey.SHOW_VOWELS, JSON.stringify(show));
  };

  const resetRowsDisabled = (): boolean => {
    const defaultRange = range(11).toString();
    return rowOrderLeft.toString() === defaultRange && rowOrderRight.toString() === defaultRange;
  };

  const resetColsDisabled = (): boolean => colOrder.toString() === range(38).toString();

  const resetHighlightsDisabled = (): boolean => Object.values(highlights).every(highlight => highlight === undefined);

  const resetOffsetsDisabled = (): boolean => Object.values(colOffsets).every(offset => offset === 0);

  const noActiveSwaps = (): boolean => {
    return [
      swapLeftRowFrom,
      swapLeftRowTo,
      swapRightRowFrom,
      swapRightRowTo,
      swapColFrom,
      swapColTo,
    ]
      .every(t => !t);
  };

  const noSubstitutions = (): boolean => {
    return Object.entries(substitutions).every(([a, b]) => a === b);
  };

  const resetAllDisabled = (): boolean => {
    return [
      resetRowsDisabled(),
      resetColsDisabled(),
      resetHighlightsDisabled(),
      resetOffsetsDisabled(),
      noActiveSwaps(),
      noSubstitutions(),
    ]
      .every(t => t);
  };

  const changeSubstitution = (letter: string, substitution: string): void => {
    const isValid = ALPHABET.includes(substitution);

    if (!isValid && substitution !== 'BACKSPACE') {
      return;
    }

    const newSubstitutions = { ...substitutions };
    const newSubstitution = isValid ? substitution : letter;
    newSubstitutions[letter] = newSubstitution;
    setSubstitutions(newSubstitutions);
    window.localStorage.setItem(LocalStorageKey.SUBSTITUTIONS, JSON.stringify(newSubstitutions));

    if (hoveredLetter) {
      setHoveredLetter(newSubstitution);
    }
  };

  const columnSum = (col: number): number => {
    return rows.reduce((current, row) => current + getOrdinal(row[col - 1]), 0);
  };

  const copyToClipboard = (): void => {
    const data = trueRows.map((row, rowIndex) => {
      return [...row]
        .map((letter, colIndex) => (
          highlights[getCellKey(rowIndex + 1 + colOffsets[colIndex + 1], colIndex + 1)] === 5 ? ' ' : letter
        ))
        .join('')
        .match(/.{18}/g)
        ?.join(' ');
    }).join('\n');

    window.navigator.clipboard.writeText(data);
  };

  const renderCell = (row: number, col: number, trueRow: number, trueCol: number): JSX.Element => {
    return (
      <td
        key={getCellKey(row, col)}
        className={
          [
            row === 0 || col === 0 || col === 37 ? 'bold' : '',
            (row === 0 || col === 0 || col === 37) && (row !== trueRow || col != trueCol) ? 'cell-changed' : '',
            row === 0 ? 'border-bottom-bold' : '',
            col === 0 ? 'border-right-bold' : '',
            trueCol === 19 ? 'border-left-bold border-left-dashed' : '',
            col === 37 ? 'border-left-bold' : '',
            getCellStyle(row, col, trueRow, trueCol),
          ]
            .join(' ')
        }
        onClick={() => cellClicked(row, col, trueRow, trueCol)}
        onMouseEnter={() => hoverCell(row, col, trueRow, trueCol, true)}
        onMouseLeave={() => hoverCell(row, col, trueRow, trueCol, false)}
      >
        {getCell(row, col, trueCol, true)}
      </td>
    );
  };

  const renderSides = (): JSX.Element[] => {
    return range(11).map(row => (
      <tr key={`row-${row}`}>
        {colOrder.slice(0, 19).map((col, trueCol) => renderCell(rowOrderLeft[row], col, row, trueCol))}
        {colOrder.slice(19).map((col, trueCol) => renderCell(rowOrderRight[row], col, row, trueCol + 19))}
      </tr>
    ));
  };

  return (
    <div className="app">
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
                  {col > 0 && col <= 36 ? offset : ''}
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
                {col > 0 && col <= 36 ? '↑' : ''}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {renderSides()}
        </tbody>
        <tfoot>
          {showOrdinals ? (
            <tr>
              {colOrder.map(col => (
                <td
                  key={`ordinal-${col}`}
                  className="border-top-bold arrow-cell small-text"
                >
                  {col > 0 && col <= 36 ? columnSum(col) : ''}
                </td>
              ))}
            </tr>
          ) : null}
          <tr>
            {colOrder.map(col => (
              <td
                key={`tfoot-${col}`}
                className="border-top-bold arrow-cell"
                onClick={() => transposeCol(col, 1)}
              >
                {col > 0 && col <= 36 ? '↓' : ''}
              </td>
            ))}
          </tr>
          {showSubstitutions ? (
            <>
              <tr className="border-top-white">
                {range(38).map(i => {
                  const letter = indexToLetter(i - 5);
                  return (
                    <td
                      className="arrow-cell"
                      key={`substitution-key-${i}`}
                      onClick={() => {
                        if (showSameLettersOnHover && highlightSameLettersWhenClicked) {
                          highlightAllCellsWithValue(letter);
                        }
                      }}
                      onMouseEnter={() => setHoveredLetter(letter)}
                      onMouseLeave={() => setHoveredLetter(undefined)}
                    >
                      {i > 5 && i < 32 ? letter : ''}
                    </td>
                  );
                })}
              </tr>
              <tr>
                {range(38).map(i => {
                  const letter = indexToLetter(i - 5);
                  const substitution = substitutions[letter];
                  return (
                    <td
                      className="arrow-cell"
                      key={`substitution-value-${i}`}
                      onMouseEnter={() => setHoveredLetter(substitution)}
                      onMouseLeave={() => setHoveredLetter(undefined)}
                    >
                      {i > 5 && i < 32 ? (
                        <input
                          className={`substitution-input ${letter === substitution ? 'faded' : ''}`}
                          value={substitution}
                          readOnly
                          onKeyDown={e => changeSubstitution(letter, e.key.toUpperCase())}
                        />
                      ) : ''}
                    </td>
                  );
                })}
              </tr>
            </>
          ) : null}
        </tfoot>
      </table>
      <div className="footer-container">
        <div className="col">
          <div className="options-container">
            <span className="option-row">
              Cell highlight mode
            </span>
            <span className="option-row">
              <table className="black-borders">
                <tbody>
                  {range(2).map(row => (
                    <tr key={`highlight-row-${row}`}>
                      {range(6).map(n => n + (row * 6)).map(n => (
                        <td
                          key={`highlight-option-${n + 1}`}
                          className={`highlight-cell highlight-${n + 1} ${highlightMode === n ? 'check-mark' : ''} cursor-pointer`}
                          onClick={() => {
                            setHighlightMode(n);
                            window.localStorage.setItem(LocalStorageKey.HIGHLIGHT_MODE, JSON.stringify(n));
                          }}
                        >
                          {highlightMode === n ? '✔' : (row === 0 && n === 5 ? 'Hide' : '')}
                        </td>
                      ))}
                    </tr>
                  ))}
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
            <span className="option-row indent">
              <label>
                <input
                  type="checkbox"
                  checked={showCommonLettersBetweenSidesOnEachRow}
                  disabled={!showMatchingLettersBetweenSides}
                  onChange={({ target: { checked } }) => {
                    setShowCommonLettersBetweenSidesOnEachRow(checked);
                    window.localStorage.setItem(LocalStorageKey.SHOW_COMMON_LETTERS_ON_EACH_ROW, JSON.stringify(checked));
                  }}
                />
                Show common letters on each row
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
            <span className="option-row indent">
              <label>
                <input
                  type="checkbox"
                  checked={highlightSameLettersWhenClicked}
                  disabled={!showSameLettersOnHover}
                  onChange={e => changeHighlightSameLettersWhenClicked(e.target.checked)}
                />
                Highlight same letters when clicked
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
            {/* TODO: Show ordinals */}
            {false && (
              <span className="option-row">
                <label>
                  <input
                    type="checkbox"
                    checked={showOrdinals}
                    onChange={e => {
                      setShowOrdinals(e.target.checked);
                    }}
                  />
                  Show ordinals (experimental)
                </label>
              </span>
            )}
          </div>
        </div>
        <div className="col flex-gap">
          <span className="white small-text">
            Click row/column labels to select them
          </span>
          <div className="option-row">
            <button
              onClick={() => swapCols(Number(swapColFrom), Number(swapColTo))}
              disabled={!swapColFrom || !swapColTo}
              className="wide-button"
            >
              Swap columns
            </button>
          </div>
          <div className="option-row">
            <button
              onClick={() => swapRows('left')}
              disabled={!swapLeftRowFrom || !swapLeftRowTo}
            >
              Swap rows (left)
            </button>
            <button
              onClick={() => swapRows('right')}
              disabled={!swapRightRowFrom || !swapRightRowTo}
            >
              Swap rows (right)
            </button>
          </div>
          <div className="option-row">
            <button
              onClick={() => clearSelectedRowsAndCols()}
              disabled={
                !swapLeftRowFrom && !swapLeftRowTo && !swapRightRowFrom && !swapRightRowTo && !swapColFrom && !swapColTo
              }
              className="wide-button"
            >
              Clear selected rows/columns
            </button>
          </div>
        </div>
        <div className="col substitution-options">
          <span className="flex-gap">
            <button onClick={() => {
              const show = !showSubstitutions;
              setShowSubstitutions(show);
              window.localStorage.setItem(LocalStorageKey.SHOW_SUBSTITUTIONS, JSON.stringify(show));
            }}>
              Toggle substitutions
            </button>
            <button
              onClick={() => resetSubstitutions()}
              disabled={noSubstitutions()}
            >
              Reset substitutions
            </button>
          </span>
          <button onClick={() => copyToClipboard()}>
            Copy to clipboard
          </button>
          <span className="version-container">
            <span className="version-text" title={VERSION_TEXT_TITLE}>
              {VERSION_TEXT}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default App;
