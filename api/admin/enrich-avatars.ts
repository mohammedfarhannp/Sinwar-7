import { handleAdminAvatarRequest } from '../../server/avatarRoute';

export function POST(request: Request): Promise<Response> {
  return handleAdminAvatarRequest(request);
}
