import { Clock, Route, ShieldCheck, UserCheck } from "lucide-react";

/**
 * The public form is the one page a stranger sees, and the only one asking
 * them for a phone number. A bare card on an empty background gives them
 * nothing to decide with, so the surrounding copy answers the three questions
 * people actually have before typing: who is this, what happens next, and
 * where do my details go.
 *
 * Reading order is heading, form, reassurance — in the DOM, so it holds on a
 * phone and for a screen reader. The two-column desktop layout is placement
 * only: the heading and the assurances share the left column with the form
 * beside them, without either moving in the document.
 */

const ASSURANCES = [
  {
    icon: UserCheck,
    title: "One specialist, not a call centre",
    body: "Your enquiry goes to a single named person, who owns it from there.",
  },
  {
    icon: Clock,
    title: "A reply within one business day",
    body: "Sent on to an available specialist the moment you submit.",
  },
  {
    icon: ShieldCheck,
    title: "Your details stay private",
    body: "Used only to answer your enquiry. Never sold, never added to a mailing list.",
  },
];

export function FormShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main
      id="main"
      className="flex min-h-dvh flex-col justify-center px-6 py-12 sm:py-16"
    >
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_26rem] lg:items-start lg:gap-x-16 lg:gap-y-9">
        <header className="lg:col-start-1 lg:row-start-1 lg:pt-1">
          <span className="text-muted-foreground inline-flex items-center gap-2 text-sm font-medium">
            <span className="bg-accent text-accent-foreground grid size-7 place-items-center rounded-md">
              <Route className="size-4" aria-hidden="true" />
            </span>
            Lead Distribution
          </span>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {title}
          </h1>

          <p className="text-muted-foreground mt-3 max-w-prose text-base/7">
            Tell us how to reach you and we will put you in front of the right
            person. It takes about a minute.
          </p>
        </header>

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          {children}
        </div>

        <ul className="space-y-5 lg:col-start-1 lg:row-start-2">
          {ASSURANCES.map(({ icon: Icon, title: heading, body }) => (
            <li key={heading} className="flex gap-3.5">
              <span
                className="bg-accent text-accent-foreground mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg"
                aria-hidden="true"
              >
                <Icon className="size-4" />
              </span>
              <div>
                <p className="font-medium">{heading}</p>
                <p className="text-muted-foreground mt-0.5 text-sm/6">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
