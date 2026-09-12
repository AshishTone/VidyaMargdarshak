export default function SectionCard({ children, className = "" }) {
  return <div className={`panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 ${className}`}>{children}</div>;
}
