import Link from "next/link";

export default function About() {
  return (
    <main className="min-h-screen" style={{ background: "var(--ink)" }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "var(--accent)" }}>
            <span className="font-bold text-3xl" style={{ color: "var(--paper)", fontFamily: "var(--font-display)" }}>D</span>
          </div>
          <h1 className="text-5xl font-bold mb-4" style={{ color: "var(--paper)", fontFamily: "var(--font-display)" }}>
            About Downhill Radar
          </h1>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: "var(--muted)" }}>
            A comprehensive platform for tracking and discovering downhill longboard races around the world.
            Our mission is to preserve the history of the sport and connect the global downhill community.
          </p>
        </div>

        {/* What We Do Section */}
        <div className="rounded-2xl border p-8 mb-12" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: "var(--paper)", fontFamily: "var(--font-display)" }}>What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "🏁", title: "Track Results", desc: "Race results and podium finishes" },
              { icon: "🗺️", title: "Map Locations", desc: "Race locations worldwide" },
              { icon: "👤", title: "Rider Profiles", desc: "Showcase achievements and stats" },
              { icon: "📝", title: "Race Submissions", desc: "Platform for community input" },
              { icon: "🌍", title: "Global Community", desc: "Connect riders and organizers" },
              { icon: "📊", title: "Analytics", desc: "Track progress and trends" }
            ].map((item, i) => (
              <div key={i} className="text-center p-6 rounded-xl transition-colors duration-200" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--paper)" }}>{item.title}</h3>
                <p style={{ color: "var(--muted)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="rounded-2xl border p-8 mb-12" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: "var(--paper)", fontFamily: "var(--font-display)" }}>How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { emoji: "📝", title: "Submit Races", desc: "Registered users can submit race information including location, results, and media." },
              { emoji: "✅", title: "Admin Review", desc: "All submissions are reviewed by administrators to ensure accuracy and quality." },
              { emoji: "🌍", title: "Community Access", desc: "Once approved, races appear on the map and in search results for everyone to discover." },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--accent)" }}>
                  <span className="text-2xl">{item.emoji}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: "var(--paper)" }}>{item.title}</h3>
                <p style={{ color: "var(--muted)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RaceBox GPS Runs Section */}
        <div className="rounded-2xl border p-8 mb-12" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--accent)" }}>
              <span className="text-2xl">📡</span>
            </div>
            <h2 className="text-3xl font-bold" style={{ color: "var(--paper)", fontFamily: "var(--font-display)" }}>GPS Run Tracking</h2>
          </div>

          <p className="text-lg mb-8" style={{ color: "var(--muted)" }}>
            Downhill Radar supports GPS run data from <strong style={{ color: "var(--paper)" }}>RaceBox</strong> devices. You can upload your run
            CSV files to any spot or race event and compare your speed, time, and trajectory against other riders.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              {
                step: "1",
                title: "Create Your Track in RaceBox",
                desc: "Open the RaceBox app and create a new track session. Place your start line and finish line manually on the map at your spot. You cannot import tracks from external files — they must be created inside the RaceBox app itself.",
              },
              {
                step: "2",
                title: "Drive the Track & Export",
                desc: "Drive your run with the RaceBox device recording. After your session, export your run data as a CSV file from the RaceBox app. The CSV contains your GPS coordinates, speed, altitude, and G-force data.",
              },
              {
                step: "3",
                title: "Upload & Compare",
                desc: "Open the event or spot on Downhill Radar and upload your RaceBox CSV. Your run is added to the leaderboard and you can visually compare your GPS track, speed chart, and G-forces against other riders' runs.",
              },
            ].map((item) => (
              <div key={item.step} className="rounded-xl p-5" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center mb-3 font-bold text-sm" style={{ background: "var(--accent)", color: "var(--paper)" }}>
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2" style={{ color: "var(--paper)" }}>{item.title}</h3>
                <p className="text-sm" style={{ color: "var(--muted)" }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-5" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">ℹ️</span>
              <div className="space-y-2 text-sm" style={{ color: "var(--muted)" }}>
                <p><strong style={{ color: "var(--paper)" }}>Route sharing:</strong> RaceBox does not support importing routes from external files or URLs. Each rider must create their own custom track inside the RaceBox app by manually placing the start and finish lines. Use the GPS coordinates shown on each spot page to find the correct start location.</p>
                <p><strong style={{ color: "var(--paper)" }}>Location auto-detect:</strong> When submitting a spot or race, you can upload a RaceBox CSV file to automatically pin the correct location on the map — no manual coordinate entry needed.</p>
                <p><strong style={{ color: "var(--paper)" }}>Distance limit:</strong> GPS runs can only be uploaded to an event if the recorded track starts within 10 km of the event location. This prevents runs from unrelated spots being mixed in.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Community Section */}
        <div className="rounded-2xl p-8 mb-12" style={{ background: "var(--accent)" }}>
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--paper)", fontFamily: "var(--font-display)" }}>Our Community</h2>
            <p className="text-xl max-w-3xl mx-auto mb-8" style={{ color: "var(--paper)", opacity: 0.85 }}>
              We're built by and for the downhill longboarding community. Whether you're a
              seasoned racer, event organizer, or just getting into the sport, this platform
              helps you discover races, track your progress, and connect with fellow riders.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {["🏁 Racers", "🎯 Organizers", "📸 Photographers", "🎥 Videographers", "👥 Fans"].map(label => (
                <div key={label} className="px-4 py-2 rounded-full text-sm font-medium" style={{ background: "rgba(0,0,0,0.2)", color: "var(--paper)" }}>{label}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Legal Section */}
        <div className="rounded-2xl border p-8 mb-12" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: "var(--paper)", fontFamily: "var(--font-display)" }}>Legal Information</h2>
          <div className="max-w-4xl mx-auto">
            <div className="rounded-xl p-6 mb-6 border" style={{ background: "var(--surface-raised)", borderColor: "var(--accent)" }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0" style={{ color: "var(--accent)" }}>⚠️</span>
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--paper)" }}>Copyright Notice</h3>
                  <p style={{ color: "var(--muted)" }}>
                    <strong style={{ color: "var(--paper)" }}>Important:</strong> All images, videos, and media content displayed on this platform are
                    user-submitted and belong to their respective owners. Downhill Radar does not claim
                    ownership or copyright over any of the visual content, race photos, videos, or other media
                    materials featured on this website.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6" style={{ color: "var(--muted)" }}>
              <div>
                <h4 className="text-lg font-semibold mb-3" style={{ color: "var(--paper)" }}>Content Ownership</h4>
                <ul className="space-y-2 list-disc list-inside">
                  <li>All race images, videos, and media are submitted by community members</li>
                  <li>Original creators retain full copyright and ownership rights</li>
                  <li>We act as a platform for sharing and discovery, not as content owners</li>
                  <li>If you own content that appears here and want it removed, please contact us</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-3" style={{ color: "var(--paper)" }}>User-Generated Content</h4>
                <p>
                  This platform relies on community contributions for race information, results, and media.
                  We encourage users to only submit content they own or have permission to share.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-3" style={{ color: "var(--paper)" }}>Fair Use & Attribution</h4>
                <p>
                  We strive to properly attribute content when possible and operate under fair use principles
                  for educational and community purposes. If you believe your copyrighted material is being
                  used inappropriately, please contact us immediately for removal.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Get Involved Section */}
        <div className="rounded-2xl border p-8 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--paper)", fontFamily: "var(--font-display)" }}>Get Involved</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: "var(--muted)" }}>
            Have a race to submit? Want to help improve the platform? We'd love to hear from you!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-3 font-semibold rounded-lg transition-opacity hover:opacity-90"
              style={{ background: "var(--accent)", color: "var(--paper)" }}
            >
              Get in Touch
            </Link>
            <Link
              href="/submit"
              className="px-8 py-3 font-semibold rounded-lg border transition-colors hover:opacity-80"
              style={{ color: "var(--paper)", borderColor: "var(--border)", background: "var(--surface-raised)" }}
            >
              Submit a Race
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
