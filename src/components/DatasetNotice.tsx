import { IS_DEMO_DATASET } from '../data/accounts';

export function DatasetNotice() {
  if (!IS_DEMO_DATASET) {
    return null;
  }

  return (
    <p className="dataset-notice" role="note">
      Preview data: these synthetic profiles are examples, not real Instagram
      accounts.
    </p>
  );
}
