export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8 space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
            <p className="text-gray-600">
              Downhill Radar stores the minimum data needed to run rider profiles,
              submissions, moderation, and media interactions.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">What We Store</h2>
            <p className="text-gray-700">
              Account information includes your email address, name, hashed password,
              profile image, optional bio fields, and activity such as submissions,
              uploaded videos, and likes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">How We Use It</h2>
            <p className="text-gray-700">
              This information is used to authenticate you, connect your rider profile
              with race achievements, moderate community submissions, and display
              the content you choose to publish publicly.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">Community Content</h2>
            <p className="text-gray-700">
              Race data, rider achievements, videos, and uploaded images may be visible
              to other visitors once approved or published through the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">Contact</h2>
            <p className="text-gray-700">
              If you need content removed or want your profile data corrected, use the
              contact page so we can help.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
