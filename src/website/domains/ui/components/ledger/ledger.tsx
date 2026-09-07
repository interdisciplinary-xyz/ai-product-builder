/** The ledger is a list of documents; it should say so to a screen reader. */
export function Ledger({ children }: { children: React.ReactNode }) {
  return <ul className="ledger">{children}</ul>;
}
