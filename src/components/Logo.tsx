interface LogoProps {
  size?: number;
  withWordmark?: boolean;
}

export function Logo({ size = 32, withWordmark = true }: LogoProps) {
  return (
    <span className="logo-lockup">
      <svg
        className="logo-mark"
        width={size}
        height={size}
        viewBox="0 0 32 32"
        aria-hidden={withWordmark ? true : undefined}
        role={withWordmark ? undefined : 'img'}
        aria-label={withWordmark ? undefined : 'Operation Blockout'}
        focusable="false"
      >
        <path d="M16 28.8 1.3 3.2h29.4z" fill="currentColor" />
      </svg>
      {withWordmark && (
        <span className="logo-wordmark">Operation Blockout</span>
      )}
    </span>
  );
}
