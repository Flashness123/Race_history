export default function PrivacyPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--ink)" }}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="rounded-2xl border p-8 space-y-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div>
            <h1 className="text-4xl font-bold mb-3" style={{ color: "var(--paper)", fontFamily: "var(--font-display)" }}>Privacy Policy</h1>
            <p style={{ color: "var(--muted)" }}>
              Downhill Radar stores the minimum data needed to run rider profiles,
              submissions, moderation, and media interactions.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold" style={{ color: "var(--paper)" }}>What We Store</h2>
            <p style={{ color: "var(--muted)" }}>
              Account information includes your email address, name, hashed password,
              profile image, optional bio fields, and activity such as submissions,
              uploaded videos, and likes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold" style={{ color: "var(--paper)" }}>How We Use It</h2>
            <p style={{ color: "var(--muted)" }}>
              This information is used to authenticate you, connect your rider profile
              with race achievements, moderate community submissions, and display
              the content you choose to publish publicly.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold" style={{ color: "var(--paper)" }}>Community Content</h2>
            <p style={{ color: "var(--muted)" }}>
              Race data, rider achievements, videos, and uploaded images may be visible
              to other visitors once approved or published through the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold" style={{ color: "var(--paper)" }}>Contact</h2>
            <p style={{ color: "var(--muted)" }}>
              If you need content removed or want your profile data corrected, use the
              contact page so we can help.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
