import Link from "next/link";

export default function About() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">About Downhill Race History</h1>
      
      <div className="prose prose-gray max-w-none">
        <p className="text-lg text-gray-700 mb-6">
          Downhill Race History is a comprehensive platform for tracking and discovering 
          downhill longboard races around the world. Our mission is to preserve the history 
          of the sport and connect the global downhill community.
        </p>
        
        <h2 className="text-2xl font-semibold mb-4">What We Do</h2>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Track race results and podium finishes</li>
          <li>Map race locations worldwide</li>
          <li>Showcase rider profiles and achievements</li>
          <li>Provide a platform for race submissions</li>
          <li>Connect riders, organizers, and fans</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
        <div className="grid gap-4 mb-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold">Submit Races</h3>
            <p className="text-gray-600">Registered users can submit race information including location, results, and media.</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold">Admin Review</h3>
            <p className="text-gray-600">All submissions are reviewed by administrators to ensure accuracy and quality.</p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="font-semibold">Community Access</h3>
            <p className="text-gray-600">Once approved, races appear on the map and in search results for everyone to discover.</p>
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold mb-4">Our Community</h2>
        <p className="text-gray-700 mb-6">
          We're built by and for the downhill longboarding community. Whether you're a 
          seasoned racer, event organizer, or just getting into the sport, this platform 
          helps you discover races, track your progress, and connect with fellow riders.
        </p>
        
        <h2 className="text-2xl font-semibold mb-4">Get Involved</h2>
        <p className="text-gray-700">
          Have a race to submit? Want to help improve the platform? 
          <Link href="/contact" className="text-blue-600 hover:underline ml-1">Get in touch</Link> with us!
        </p>
      </div>
    </main>
  );
}
