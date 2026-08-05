import Link from 'next/link';
import {
  ActivityIcon,
  ArrowRightIcon,
  ClockIcon,
  ShieldIcon,
  UsersIcon,
} from '@/components/icons';

const capabilities = [
  {
    icon: <UsersIcon />,
    title: 'Fair broker share',
    body: 'Each broker gets a target percentage. The next lead goes to whoever is furthest behind their share.',
  },
  {
    icon: <ClockIcon />,
    title: 'Timezone aware',
    body: 'Opening hours, working days, and daily caps are evaluated in the broker’s own timezone, not the server’s.',
  },
  {
    icon: <ShieldIcon />,
    title: 'No duplicate leads',
    body: 'Emails are normalized on submission. An address already sent to a broker is never routed to a second one.',
  },
  {
    icon: <ActivityIcon />,
    title: 'Full audit trail',
    body: 'Every lead is recorded with its captured IP address and status: sent, unsent, duplicate, or failed.',
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <p className="eyebrow">Admin platform</p>

          <h1>Route every lead to the right broker.</h1>

          <p className="hero__lede">
            One public form, one distribution, many brokers. Leads are captured
            with their IP address, checked for duplicates, and assigned by
            percentage share within each broker’s working hours and daily cap.
          </p>

          <div className="actions">
            <Link className="btn btn--primary" href="/health">
              View system health
              <ArrowRightIcon />
            </Link>
            <a
              className="btn btn--secondary"
              href="https://github.com/norbertoqjr/lead-distribution-platform"
              target="_blank"
              rel="noreferrer noopener"
            >
              Documentation
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section__title">How distribution works</h2>

          <div className="grid">
            {capabilities.map((item) => (
              <article className="card" key={item.title}>
                <span className="card__icon">{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
