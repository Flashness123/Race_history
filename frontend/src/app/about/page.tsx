import Link from "next/link";

export default function About() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-3xl">D</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            About Downhill Race History
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
            {[
              { icon: "🏁", title: "Track Results", desc: "Race results and podium finishes" },
              { icon: "🗺️", title: "Map Locations", desc: "Race locations worldwide" },
              { icon: "👤", title: "Rider Profiles", desc: "Showcase achievements and stats" },
              { icon: "📝", title: "Race Submissions", desc: "Platform for community input" },
              { icon: "🌍", title: "Global Community", desc: "Connect riders and organizers" },
              { icon: "📊", title: "Analytics", desc: "Track progress and trends" }
            ].map((item, i) => (
              <div key={i} className="text-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Submit Races</h3>
              <p className="text-gray-600">Registered users can submit race information including location, results, and media.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">✅</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Admin Review</h3>
              <p className="text-gray-600">All submissions are reviewed by administrators to ensure accuracy and quality.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🌍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Community Access</h3>
              <p className="text-gray-600">Once approved, races appear on the map and in search results for everyone to discover.</p>
            </div>
          </div>
        </div>

        {/* Community Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 mb-12 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Our Community</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              We're built by and for the downhill longboarding community. Whether you're a 
              seasoned racer, event organizer, or just getting into the sport, this platform 
              helps you discover races, track your progress, and connect with fellow riders.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium">🏁 Racers</div>
              <div className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium">🎯 Organizers</div>
              <div className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium">📸 Photographers</div>
              <div className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium">🎥 Videographers</div>
              <div className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium">👥 Fans</div>
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
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover-lift"
            >
              Get in Touch
            </Link>
            <Link 
              href="/submit" 
              className="px-8 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200 hover-lift"
            >
              Submit a Race
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
