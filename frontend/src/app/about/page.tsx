import Link from "next/link";

export default function About() {
  const features = [
    "Track Results",
    "Map Locations",
    "Rider Profiles",
    "Race Submissions",
    "Global Community",
    "Analytics",
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#faf6f1] via-white to-[#f4ece3]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-gradient-to-br from-[var(--warm-accent)] to-[var(--warm-accent-dark)] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-3xl">D</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            About Downhill Radar
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive platform for tracking and discovering downhill longboard races around the world. 
            Our mission is to preserve the history of the sport and connect the global downhill community.
          </p>
        </div>

        {/* What We Do Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((title, i) => (
              <div key={i} className="text-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--warm-accent-soft)] text-[var(--warm-accent-dark)] flex items-center justify-center font-semibold">
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600">
                  {title === "Track Results" && "Race results and podium finishes"}
                  {title === "Map Locations" && "Race locations worldwide"}
                  {title === "Rider Profiles" && "Showcase achievements and stats"}
                  {title === "Race Submissions" && "Platform for community input"}
                  {title === "Global Community" && "Connect riders and organizers"}
                  {title === "Analytics" && "Track progress and trends"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--warm-accent)] to-[var(--warm-accent-dark)] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-semibold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Submit Races</h3>
              <p className="text-gray-600">Registered users can submit race information including location, results, and media.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--warm-accent)] to-[var(--warm-accent-dark)] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-semibold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Admin Review</h3>
              <p className="text-gray-600">All submissions are reviewed by administrators to ensure accuracy and quality.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--warm-accent)] to-[var(--warm-accent-dark)] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-semibold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Community Access</h3>
              <p className="text-gray-600">Once approved, races appear on the map and in search results for everyone to discover.</p>
            </div>
          </div>
        </div>

        {/* Community Section */}
        <div className="bg-gradient-to-r from-[var(--warm-accent)] to-[var(--warm-accent-dark)] rounded-2xl shadow-lg p-8 mb-12 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Our Community</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              We're built by and for the downhill longboarding community. Whether you're a 
              seasoned racer, event organizer, or just getting into the sport, this platform 
              helps you discover races, track your progress, and connect with fellow riders.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium">Racers</div>
              <div className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium">Organizers</div>
              <div className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium">Photographers</div>
              <div className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium">Videographers</div>
              <div className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium">Fans</div>
            </div>
          </div>
        </div>

        {/* Legal Information Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Legal Information</h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <span className="text-yellow-600 text-sm font-semibold">Note</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">Copyright Notice</h3>
                  <p className="text-yellow-700 leading-relaxed">
                    <strong>Important:</strong> All images, videos, and media content displayed on this platform are 
                    user-submitted and belong to their respective owners. Downhill Radar does not claim 
                    ownership or copyright over any of the visual content, race photos, videos, or other media 
                    materials featured on this website.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6 text-gray-700">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Content Ownership</h4>
                <ul className="space-y-2 list-disc list-inside">
                  <li>All race images, videos, and media are submitted by community members</li>
                  <li>Original creators retain full copyright and ownership rights</li>
                  <li>We act as a platform for sharing and discovery, not as content owners</li>
                  <li>If you own content that appears here and want it removed, please contact us</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">User-Generated Content</h4>
                <p className="leading-relaxed">
                  This platform relies on community contributions for race information, results, and media. 
                  We encourage users to only submit content they own or have permission to share. By submitting 
                  content, users confirm they have the right to do so and grant us permission to display it 
                  on the platform.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Fair Use & Attribution</h4>
                <p className="leading-relaxed">
                  We strive to properly attribute content when possible and operate under fair use principles 
                  for educational and community purposes. If you believe your copyrighted material is being 
                  used inappropriately, please contact us immediately for removal.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Get Involved Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Involved</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Have a race to submit? Want to help improve the platform? We'd love to hear from you!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="warm-button px-8 py-3 font-semibold hover-lift"
            >
              Get in Touch
            </Link>
            <Link 
              href="/submit" 
              className="warm-button-secondary px-8 py-3 font-semibold hover-lift"
            >
              Submit a Race
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
