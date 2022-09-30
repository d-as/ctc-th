import { VERSION_TEXT, VERSION_TEXT_TITLE } from "./constants";

export const VersionInfo = (): JSX.Element => (
  <span className="version-container">
    <span className="version-text" title={VERSION_TEXT_TITLE}>
      {VERSION_TEXT}
    </span>
  </span>
);
