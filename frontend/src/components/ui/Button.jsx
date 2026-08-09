export default function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}) {
  const variants = {
    primary: "bg-[var(--vm-primary)] text-white hover:bg-blue-900",
    secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
    ghost: "bg-blue-50 text-[var(--vm-primary)] hover:bg-blue-100",
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
