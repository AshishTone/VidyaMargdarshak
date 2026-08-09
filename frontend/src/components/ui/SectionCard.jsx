export default function SectionCard({ children, className = "" }) {
  return <div className={`panel rounded-3xl p-6 ${className}`}>{children}</div>;
}
