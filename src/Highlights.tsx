import { LocalStorageKey } from "./constants";
import { range } from "./util";

interface Props {
  highlightMode: number
  setHighlightMode: (highlightMode: number) => void
};

export const Highlights = ({ highlightMode, setHighlightMode }: Props): JSX.Element => {
  return (
    <div>
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
    </div>
  );
};
