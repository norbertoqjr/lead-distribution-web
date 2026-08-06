import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "The terms governing use of the Lead Distribution Platform, for both people submitting enquiries and administrators managing distribution.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms and Conditions" updated="6 August 2026">
      <p>
        These terms govern use of the Lead Distribution Platform. They apply
        both to people submitting an enquiry through a public form and to
        administrators managing brokers and distribution.
      </p>

      <h2>What the service does</h2>
      <p>
        The platform collects enquiries through a public form and routes each
        one to a single broker. Assignment is automatic and based on the share,
        working hours, working days, and daily capacity configured for each
        broker. Where no broker is eligible at the time of submission, the
        enquiry is held for manual assignment.
      </p>

      <h2>Submitting an enquiry</h2>
      <ul>
        <li>
          Provide accurate details. Contact information that is wrong or does
          not belong to you cannot be acted on.
        </li>
        <li>
          Submitting an enquiry is a request to be contacted. It does not create
          a contract, and it does not oblige any broker to provide a service.
        </li>
        <li>
          Do not submit another person&rsquo;s details without their permission,
          and do not use the form to send unlawful, abusive, or misleading
          content.
        </li>
        <li>
          Automated or bulk submissions are not permitted. The platform records
          IP addresses and detects duplicates in order to identify them.
        </li>
      </ul>

      <h2>Duplicate enquiries</h2>
      <p>
        An email address already routed to a broker will not be routed to a
        second one. Resubmitting the same address records a duplicate rather
        than creating a new assignment. This protects both you, from being
        contacted repeatedly about the same enquiry, and brokers, from paying
        for the same lead twice.
      </p>

      <h2>Administrator responsibilities</h2>
      <ul>
        <li>
          Keep account credentials confidential. Actions taken through an
          account are treated as taken by its holder.
        </li>
        <li>
          Configure broker timezones, hours, and caps accurately. Distribution
          is only as fair as the configuration behind it.
        </li>
        <li>
          Handle lead data lawfully, including obtaining any consent your
          jurisdiction requires before contacting a person.
        </li>
      </ul>

      <h2>Availability</h2>
      <p>
        The service is provided as-is. We do not guarantee uninterrupted
        availability, and maintenance or failures may make it temporarily
        unavailable. Where the service is unavailable, enquiries submitted
        during that period may not be recorded.
      </p>

      <h2>Liability</h2>
      <p>
        We are not party to any agreement you reach with a broker, and we are
        not responsible for a broker&rsquo;s conduct, the accuracy of their
        claims, or whether they respond at all. To the extent permitted by law,
        we exclude liability for indirect or consequential loss arising from use
        of the platform.
      </p>

      <h2>Changes</h2>
      <p>
        These terms may be updated. The date at the top of this page shows when
        they last changed, and continued use after that date constitutes
        acceptance.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms should go to the operator of the site you
        used.
      </p>
    </LegalPage>
  );
}
