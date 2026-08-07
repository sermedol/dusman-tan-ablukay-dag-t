export default function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-1.5 text-body-sm font-medium transition-colors duration-base ease-standard ${
        active
          ? 'border-ink bg-ink text-white'
          : 'border-border bg-surface text-ink-soft hover:border-border-strong'
      }`}
    >
      {children}
    </button>
  );
}
