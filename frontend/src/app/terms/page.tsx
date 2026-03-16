export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8 space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Terms of Service</h1>
            <p className="text-gray-600">
              Downhill Radar is a community archive for downhill racing history and rider
              profiles.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">Community Submissions</h2>
            <p className="text-gray-700">
              By submitting events, videos, images, or profile content, you confirm that
              you have the right to share that material and that it is accurate to the
              best of your knowledge.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">Moderation</h2>
            <p className="text-gray-700">
              Administrators may edit, approve, reject, or remove content that is
              inaccurate, abusive, duplicated, or otherwise unsuitable for the archive.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">Content Ownership</h2>
            <p className="text-gray-700">
              User-submitted media remains the property of its original owner. The platform
              only displays that content for community and archival purposes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">Availability</h2>
            <p className="text-gray-700">
              The service is provided as-is. We aim to preserve race history and keep the
              platform available, but we cannot guarantee uninterrupted service.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
