export function PageHead({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="pagehead rise">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="display pagehead__title">{title}</h1>
      {lede ? <p className="pagehead__lede">{lede}</p> : null}
      {children}
    </div>
  );
}
