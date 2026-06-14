interface SpinnerProps {
  size?: number;
}

export function Spinner({ size = 18 }: SpinnerProps) {
  return (
    <span
      style={{ width: size, height: size }}
      className="inline-block animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden
    />
  );
}
