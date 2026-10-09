import { IS_DEMO_DATASET } from '../data/accounts';

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
      This directory contains usernames only. Display names, categories, and
      verification details were not provided or inferred.
    </p>
  );
}
