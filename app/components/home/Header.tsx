import Link from "next/link";

const Header = () => {
  return (
    <header className="border-border bg-background/90 sticky top-0 z-20 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          className="focus-visible:ring-ring flex items-center gap-3 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          href="/"
        >
          <span className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold tracking-tight shadow-sm">
            EI
          </span>
          <span className="text-base font-semibold sm:text-lg">
            Epimod Insights
          </span>
        </Link>
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="text-muted-foreground flex gap-6 text-sm font-medium">
            <li>
              <Link
                className="hover:text-foreground focus-visible:ring-ring transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                href="/#pipeline"
              >
                Pipeline
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-foreground focus-visible:ring-ring transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                href="/#pipeline"
              >
                Stack
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-foreground focus-visible:ring-ring transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                href="/theory"
              >
                Theory
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-foreground focus-visible:ring-ring transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                href="/upload"
              >
                Upload
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-foreground focus-visible:ring-ring transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                href="/results"
              >
                Results
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-foreground focus-visible:ring-ring transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                href="/results/alphafold3"
              >
                AlphaFold3
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
