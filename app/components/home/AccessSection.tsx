import { SECTION_PADDING } from "./constants";

const AccessSection = () => {
  return (
    <section id="auth" className={SECTION_PADDING}>
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="max-w-3xl space-y-4">
          <h2 className="text-foreground text-2xl font-semibold sm:text-3xl">
            Get ready to explore your epitranscriptome
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Request early access or sign in to monitor active runs, compare
            cohorts, and export normalized TSV/BED summaries. Forms are
            placeholders—wiring to the auth service lands soon.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <form
            aria-labelledby="register-heading"
            className="border-border bg-card space-y-6 rounded-2xl border p-8 shadow-sm transition-colors"
            noValidate
          >
            <div className="space-y-2">
              <h3
                id="register-heading"
                className="text-foreground text-xl font-semibold"
              >
                Request access
              </h3>
              <p className="text-muted-foreground text-sm">
                Tell us about your research group to join the beta cohort.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label
                  className="text-foreground/80 text-sm font-medium"
                  htmlFor="register-name"
                >
                  Full name
                </label>
                <input
                  id="register-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="border-input bg-background text-foreground focus-visible:ring-ring h-11 rounded-lg border px-3 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  className="text-foreground/80 text-sm font-medium"
                  htmlFor="register-email"
                >
                  Work email
                </label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="border-input bg-background text-foreground focus-visible:ring-ring h-11 rounded-lg border px-3 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  className="text-foreground/80 text-sm font-medium"
                  htmlFor="register-organization"
                >
                  Organization
                </label>
                <input
                  id="register-organization"
                  name="organization"
                  type="text"
                  autoComplete="organization"
                  className="border-input bg-background text-foreground focus-visible:ring-ring h-11 rounded-lg border px-3 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Join the beta waitlist
            </button>
          </form>

          <form
            aria-labelledby="login-heading"
            className="border-border bg-card space-y-6 rounded-2xl border p-8 shadow-sm transition-colors"
            noValidate
          >
            <div className="space-y-2">
              <h3
                id="login-heading"
                className="text-foreground text-xl font-semibold"
              >
                Sign in
              </h3>
              <p className="text-muted-foreground text-sm">
                Already working with Epimod? Access your dashboard to monitor
                job health and download results.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label
                  className="text-foreground/80 text-sm font-medium"
                  htmlFor="login-email"
                >
                  Email
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="border-input bg-background text-foreground focus-visible:ring-ring h-11 rounded-lg border px-3 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  className="text-foreground/80 text-sm font-medium"
                  htmlFor="login-password"
                >
                  Password
                </label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="border-input bg-background text-foreground focus-visible:ring-ring h-11 rounded-lg border px-3 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Continue
              </button>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Forgot password?
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AccessSection;
