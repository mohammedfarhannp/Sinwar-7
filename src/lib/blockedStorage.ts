import { blockedStateSchema, type BlockedState } from '../types/account';

export const BLOCKED_STORAGE_KEY = 'sinwar7:blocked';

function emptyBlockedState(): BlockedState {
  return {
    version: 1,
    usernames: [],
    updatedAt: new Date(0).toISOString(),
  };
}

export function parseBlockedState(rawValue: string | null): BlockedState {
  if (!rawValue) {
    return emptyBlockedState();
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue);
    const result = blockedStateSchema.safeParse(parsedValue);

    if (!result.success) {
      return emptyBlockedState();
    }

    return {
      ...result.data,
      usernames: [
        ...new Set(result.data.usernames.map((name) => name.toLowerCase())),
      ],
    };
  } catch {
    return emptyBlockedState();
  }
}

export function readBlockedState(): BlockedState {
  if (typeof window === 'undefined') {
    return emptyBlockedState();
  }

  try {
    return parseBlockedState(window.localStorage.getItem(BLOCKED_STORAGE_KEY));
  } catch {
    return emptyBlockedState();
  }
}

export function writeBlockedState(state: BlockedState): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const validatedState = blockedStateSchema.safeParse(state);
  if (!validatedState.success) {
    return false;
  }

  try {
    window.localStorage.setItem(
      BLOCKED_STORAGE_KEY,
      JSON.stringify(validatedState.data),
    );
    return true;
  } catch {
    return false;
  }
}
