import { handleCronAvatarRequest } from '../../server/avatarRoute';

export function GET(request: Request): Promise<Response> {
  return handleCronAvatarRequest(request);
}
