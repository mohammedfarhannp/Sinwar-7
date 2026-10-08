import { useParams } from 'react-router-dom';
import { PlaceholderPage } from './PlaceholderPage';

export function ProfilePage() {
  const { username } = useParams();
  return (
    <PlaceholderPage
      title={`Profile: @${username ?? 'account'}`}
      description="Profile details and personal list actions are planned for Phase 2."
    />
  );
}
