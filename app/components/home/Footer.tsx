const Footer = () => {
  return (
    <footer className="border-border bg-muted/60 border-t">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>
          © {new Date().getFullYear()} Epimod Pipeline. All rights reserved.
        </p>
        <div className="flex gap-4">
          <a
            className="hover:text-foreground focus-visible:ring-ring transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            href="#"
          >
            Privacy
          </a>
          <a
            className="hover:text-foreground focus-visible:ring-ring transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            href="#"
          >
            Security center
          </a>
          <a
            className="hover:text-foreground focus-visible:ring-ring transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            href="#"
          >
            Status
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
