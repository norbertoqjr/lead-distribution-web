import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What personal data the Lead Distribution Platform collects, why it is collected, who it is shared with, and how long it is kept.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="6 August 2026">
      <p>
        This policy explains what personal data the Lead Distribution Platform
        collects when you submit an enquiry form, why it is collected, who it is
        shared with, and how long it is kept.
      </p>

      <h2>What we collect</h2>
      <p>
        When you submit a lead form, we record the details you enter and a small
        amount of technical information about the request:
      </p>
      <ul>
        <li>
          <strong>Your name and email address.</strong> Required, so a broker
          can identify and contact you.
        </li>
        <li>
          <strong>Your phone number.</strong> Optional. Provide it only if you
          are happy to be contacted by phone.
        </li>
        <li>
          <strong>Your IP address.</strong> Captured automatically at the moment
          of submission. We use it to detect duplicate and automated
          submissions.
        </li>
        <li>
          <strong>The time of submission and which form you used.</strong>
        </li>
      </ul>
      <p>
        We do not use advertising or analytics cookies, and we do not track you
        across other websites. The only cookie the platform sets is a session
        cookie for administrators signing in to the private area.
      </p>

      <h2>How your email address is handled</h2>
      <p>
        Email addresses are normalised before storage, meaning surrounding
        spaces are removed and the address is lowercased. This lets us recognise
        that two submissions belong to the same person even if they were typed
        differently, so your enquiry is not passed to more than one broker.
      </p>

      <h2>Why we collect it</h2>
      <p>
        The lawful basis is your consent, given when you submit the form. The
        purpose is to pass your enquiry to a single broker who can respond to
        it. We do not sell your data, and we do not send marketing you have not
        asked for.
      </p>

      <h2>Who your data is shared with</h2>
      <p>
        Your enquiry is routed to <strong>one</strong> broker registered on the
        platform. Selection is automatic and based on each broker&rsquo;s
        configured share, working hours, and capacity. It is not based on any
        characteristic of you.
      </p>
      <p>
        Once assigned, that broker acts as an independent controller of your
        data and their own privacy policy applies to how they use it. If a
        broker cannot be assigned immediately, your enquiry is held until an
        administrator assigns it manually.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Lead records are retained while they remain commercially relevant and
        are then deleted. Duplicate submissions are retained as a record that a
        duplicate occurred, so the same enquiry is not routed twice.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live, you may have the right to access a copy of
        your data, correct it, have it deleted, object to processing, or
        withdraw consent. To exercise any of these, contact the operator of the
        site you submitted the form on. We will respond within the period
        required by applicable law.
      </p>

      <h2>Security</h2>
      <p>
        Administrator accounts are protected by a password, stored only as a
        hash, and access to lead data requires an authenticated session. The
        administration interface is not publicly indexed.
      </p>

      <h2>Changes</h2>
      <p>
        If this policy changes, the date at the top of this page will be
        updated.
      </p>
    </LegalPage>
  );
}
