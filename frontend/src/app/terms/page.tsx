export default function TermsPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--ink)" }}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="rounded-2xl border p-8 space-y-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div>
            <h1 className="text-4xl font-bold mb-3" style={{ color: "var(--paper)", fontFamily: "var(--font-display)" }}>Terms of Service</h1>
            <p style={{ color: "var(--muted)" }}>
              Downhill Radar is a community archive for downhill racing history and rider profiles.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold" style={{ color: "var(--paper)" }}>Community Submissions</h2>
            <p style={{ color: "var(--muted)" }}>
              By submitting events, videos, images, or profile content, you confirm that
              you have the right to share that material and that it is accurate to the
              best of your knowledge.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold" style={{ color: "var(--paper)" }}>Moderation</h2>
            <p style={{ color: "var(--muted)" }}>
              Administrators may edit, approve, reject, or remove content that is
              inaccurate, abusive, duplicated, or otherwise unsuitable for the archive.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold" style={{ color: "var(--paper)" }}>Content Ownership</h2>
            <p style={{ color: "var(--muted)" }}>
              User-submitted media remains the property of its original owner. The platform
              only displays that content for community and archival purposes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold" style={{ color: "var(--paper)" }}>Availability</h2>
            <p style={{ color: "var(--muted)" }}>
              The service is provided as-is. We aim to preserve race history and keep the
              platform available, but we cannot guarantee uninterrupted service.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
