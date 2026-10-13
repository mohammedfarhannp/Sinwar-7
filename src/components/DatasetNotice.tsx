import { IS_DEMO_DATASET } from '../config/dataset';

export function DatasetNotice() {
  if (IS_DEMO_DATASET) {
    return (
      <p className="dataset-notice" role="note">
        Preview data: these synthetic profiles are examples, not real Instagram
        accounts.
      </p>
    );
  }

  return (
    <p className="dataset-notice" role="note">
      This directory contains usernames only. It does not provide sources
      verifying anyone’s statements, silence, or position. A listing is not
      proof of a stance; check the account’s public statements yourself.
    </p>
  );
}
