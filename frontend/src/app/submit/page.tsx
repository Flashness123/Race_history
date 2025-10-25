"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MapPicker from "@/components/MapPicker";

type Link = { name: string; url: string };
type Rider = { name: string; position: number };
type TrackRecord = { name: string; time: string };
type SubmissionMode = 'race' | 'spot' | 'batch';

function SubmitContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submissionMode, setSubmissionMode] = useState<SubmissionMode>('race');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [editingSubmissionId, setEditingSubmissionId] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [form, setForm] = useState({
    name: "",
    date_from: new Date().toISOString().slice(0,10),
    date_to: "",
    location: "",
    lat: 50.08804,
    lng: 14.42076,
    category: "WDSC",
    links: [{ name: "Event Page", url: "" }] as Link[],
  top_riders_open: [] as Rider[],
  top_riders_luge: [] as Rider[],
  top_riders_woman: [] as Rider[],
  top_qualifiers: [] as Rider[],
    track_record_open: null as TrackRecord | null,
    track_record_luge: null as TrackRecord | null,
    track_record_woman: null as TrackRecord | null,
    organizer_name: "",
    event_image: null as File | null,
    event_image_url: null as string | null,
    // Spot-specific fields
    spot_notes: "",
    // Batch upload fields
    batch_file: null as File | null,
    batch_results: null as any,
  });
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Check if the event is in the future
  const isFutureEvent = () => {
    if (!form.date_from) return false;
    const eventDate = new Date(form.date_from);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    eventDate.setHours(0, 0, 0, 0); // Reset time to start of day
    return eventDate > today;
  };

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        const data = await res.json();
        setIsAuthenticated(data.authenticated);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // Handle URL parameters for edit mode
  useEffect(() => {
    const edit = searchParams.get('edit');
    const eventId = searchParams.get('eventId');
    const submissionId = searchParams.get('submissionId');
    
    if (edit === 'true') {
      setIsEditMode(true);
      if (eventId) {
        setEditingEventId(parseInt(eventId));
      }
      if (submissionId) {
        setEditingSubmissionId(parseInt(submissionId));
      }
      
      // Prefill form with URL parameters
      setForm(prev => ({
        ...prev,
        name: searchParams.get('name') || '',
        location: searchParams.get('location') || '',
        lat: parseFloat(searchParams.get('lat') || '50.08804'),
        lng: parseFloat(searchParams.get('lng') || '14.42076'),
        category: searchParams.get('category') || 'WDSC',
        date_from: searchParams.get('date_from') ? new Date(searchParams.get('date_from')!).toISOString().slice(0,10) : new Date().toISOString().slice(0,10),
        date_to: searchParams.get('date_to') ? new Date(searchParams.get('date_to')!).toISOString().slice(0,10) : '',
        links: searchParams.get('source_url') ? 
          [{ name: "Event Page", url: searchParams.get('source_url') || '' }] : 
          [{ name: "Event Page", url: "" }],
        track_record_open: searchParams.get('track_record_open_name') && searchParams.get('track_record_open_time') ? 
          { name: searchParams.get('track_record_open_name') || '', time: searchParams.get('track_record_open_time') || '' } : 
          null,
        track_record_luge: searchParams.get('track_record_luge_name') && searchParams.get('track_record_luge_time') ? 
          { name: searchParams.get('track_record_luge_name') || '', time: searchParams.get('track_record_luge_time') || '' } : 
          null,
        track_record_woman: searchParams.get('track_record_woman_name') && searchParams.get('track_record_woman_time') ? 
          { name: searchParams.get('track_record_woman_name') || '', time: searchParams.get('track_record_woman_time') || '' } : 
          null,
        organizer_name: searchParams.get('organizer_name') || '',
      }));
      
      // Load rider data from URL parameters
      const loadRiderData = (category: string, riders: any[]) => {
        const riderData: any[] = [];
        let index = 0;
        while (searchParams.get(`${category}_${index}_name`)) {
          riderData.push({
            name: searchParams.get(`${category}_${index}_name`) || '',
            position: parseInt(searchParams.get(`${category}_${index}_position`) || '1'),
            country: searchParams.get(`${category}_${index}_country`) || '',
          });
          index++;
        }
        return riderData;
      };
      
      // Update form with rider data
      setForm(prev => ({
        ...prev,
        top_riders_open: loadRiderData('open', prev.top_riders_open),
        top_riders_luge: loadRiderData('luge', prev.top_riders_luge),
        top_riders_woman: loadRiderData('woman', prev.top_riders_woman),
        top_qualifiers: loadRiderData('qualifier', prev.top_qualifiers),
      }));
    }
  }, [searchParams]);

  // Helper functions for dynamic form management
  function addLink() {
    setForm(prev => ({
      ...prev,
      links: [...prev.links, { name: "", url: "" }]
    }));
  }

  function updateLink(index: number, field: keyof Link, value: string) {
    setForm(prev => ({
      ...prev,
      links: prev.links.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  }

  function removeLink(index: number) {
    setForm(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  }

  function addRider(category: 'top_riders_open' | 'top_riders_luge' | 'top_riders_woman' | 'top_qualifiers') {
    setForm(prev => ({
      ...prev,
      [category]: [...prev[category], { name: "", position: prev[category].length + 1 }]
    }));
  }

  function updateRider(category: 'top_riders_open' | 'top_riders_luge' | 'top_riders_woman' | 'top_qualifiers', index: number, field: keyof Rider, value: string | number) {
    setForm(prev => ({
      ...prev,
      [category]: prev[category].map((rider, i) => 
        i === index ? { ...rider, [field]: value } : rider
      )
    }));
  }

  function removeRider(category: 'top_riders_open' | 'top_riders_luge' | 'top_riders_woman' | 'top_qualifiers', index: number) {
    setForm(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  }

  function updateTrackRecord(category: 'track_record_open' | 'track_record_luge' | 'track_record_woman', field: keyof TrackRecord, value: string) {
    setForm(prev => ({
      ...prev,
      [category]: prev[category] ? { ...prev[category]!, [field]: value } : { name: "", time: "", [field]: value }
    }));
  }

  function clearTrackRecord(category: 'track_record_open' | 'track_record_luge' | 'track_record_woman') {
    setForm(prev => ({
      ...prev,
      [category]: null
    }));
  }

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setForm(prev => ({
        ...prev,
        event_image: file,
        event_image_url: URL.createObjectURL(file)
      }));
    }
  }

  function clearImage() {
    setForm(prev => ({
      ...prev,
      event_image: null,
      event_image_url: null
    }));
  }

  function getRandomEventImage() {
    const randomIndex = Math.floor(Math.random() * 6) + 1;
    return `/images/event-defaults/event_${randomIndex}.jpg`;
  }

  function handleBatchFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setForm(prev => ({
        ...prev,
        batch_file: file
      }));
    }
  }

  async function geocodeLocation(location: string): Promise<{lat: number, lng: number} | null> {
    try {
      const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=YOUR_API_KEY&limit=1`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry;
        return { lat, lng };
      }
    } catch (error) {
      console.warn('Geocoding failed:', error);
    }
    return null;
  }

  function mapCategoryToValue(category: string): string {
    switch (category?.toUpperCase()) {
      case 'WDSC': return 'WDSC';
      case 'IDF': return 'IDF';
      case 'EURO': return 'EURO';
      case 'FREERIDE': return 'FREERIDE';
      default: return 'WDSC';
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setBusy(true);
    try {
      if (submissionMode === 'batch') {
        await handleBatchSubmit();
        return;
      }

      // Filter out empty links and riders
      const filteredLinks = form.links.filter(link => link.name.trim() && link.url.trim());
      const filteredOpenRiders = form.top_riders_open.filter(rider => rider.name.trim());
      const filteredLugeRiders = form.top_riders_luge.filter(rider => rider.name.trim());
      const filteredWomanRiders = form.top_riders_woman.filter(rider => rider.name.trim());
      const filteredQualifiers = form.top_qualifiers.filter(rider => rider.name.trim());

      const payload = {
        name: form.name,
        date_from: form.date_from,
        date_to: form.date_to || null,
        location: form.location || null,
        lat: form.lat || null,
        lng: form.lng || null,
        category: submissionMode === 'spot' ? 'SPOT' : form.category,
        links: filteredLinks,
        top_riders_open: (submissionMode === 'spot' || isFutureEvent()) ? [] : filteredOpenRiders,
        top_riders_luge: (submissionMode === 'spot' || isFutureEvent()) ? [] : filteredLugeRiders,
        top_riders_woman: (submissionMode === 'spot' || isFutureEvent()) ? [] : filteredWomanRiders,
        top_qualifiers: (submissionMode === 'spot' || isFutureEvent()) ? [] : filteredQualifiers,
        track_record_open: submissionMode === 'spot' ? null : form.track_record_open,
        track_record_luge: submissionMode === 'spot' ? null : form.track_record_luge,
        track_record_woman: submissionMode === 'spot' ? null : form.track_record_woman,
        organizer_name: submissionMode === 'spot' ? null : form.organizer_name,
        spot_notes: submissionMode === 'spot' ? form.spot_notes : null,
        // Edit mode information
        is_edit: isEditMode,
        editing_event_id: isEditMode ? editingEventId : null,
      };
      
      // First, create the submission
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        setErr(`Server error: ${res.status} ${res.statusText}`);
        return;
      }
      
      if (!res.ok) {
        if (res.status === 401) {
          setErr("Please sign in to submit races");
          setIsAuthenticated(false);
        } else {
          setErr(data?.error || `Failed: ${res.status}`);
        }
        return;
      }

      // If there's an image, upload it
      if (form.event_image) {
        const formData = new FormData();
        formData.append('file', form.event_image);
        
        const imageRes = await fetch(`/api/uploads/submission-image/${data.id}`, {
          method: "POST",
          body: formData,
        });
        
        if (!imageRes.ok) {
          console.warn("Failed to upload image, but submission was successful");
        }
      }

      const modeText = submissionMode === 'spot' ? 'spot' : 'race';
      let editText = 'submission';
      if (isEditMode) {
        if (editingSubmissionId) {
          editText = 'updated pending submission';
        } else {
          editText = 'edit submission';
        }
      }
      setOk(`Submitted ${editText} #${data.id}. Awaiting approval.`);
    } catch (e: any) {
      setErr(e.message || "Network error");
    } finally {
      setBusy(false);
    }
  }

  async function handleBatchSubmit() {
    if (!form.batch_file) {
      setErr("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append('file', form.batch_file);
    
    const res = await fetch("/api/submit/batch", {
      method: "POST",
      body: formData,
    });
    
    let data;
    try {
      data = await res.json();
    } catch (jsonError) {
      setErr(`Server error: ${res.status} ${res.statusText}`);
      return;
    }
    
    if (!res.ok) {
      if (res.status === 401) {
        setErr("Please sign in to submit races");
        setIsAuthenticated(false);
      } else {
        setErr(data?.error || `Failed: ${res.status}`);
      }
      return;
    }

    setForm(prev => ({ ...prev, batch_results: data }));
    setOk(`Batch upload completed! ${data.message || `${data.successful} races submitted successfully. ${data.skipped} races were skipped (already exist).`}`);
  }

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            {isEditMode ? (editingSubmissionId ? 'Edit Pending Submission' : 'Edit Event Details') : 'Submit a Race'}
          </h1>
          {isEditMode && (
            <p className="text-gray-600 text-lg">
              {editingSubmissionId ? (
                <>Editing pending submission: <span className="font-semibold">{form.name}</span></>
              ) : (
                <>Updating event: <span className="font-semibold">{form.name}</span></>
              )}
            </p>
          )}
          
          {/* Registration Prompt for Unauthenticated Users */}
          {isAuthenticated === false && (
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">👥</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Join Our Community!
                </h2>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  You're viewing the submission form as a guest. <strong>Register for free</strong> to upload events, 
                  strengthen our community database, and help preserve downhill racing history. 
                  It only takes a minute!
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => router.push('/register')}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    🚀 Register Now
                  </button>
                  <button
                    onClick={() => router.push('/login')}
                    className="px-8 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200"
                  >
                    🔑 Sign In
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  You can still browse the form below, but you'll need to register to submit
                </p>
              </div>
            </div>
          )}
          
          {/* Submission Mode Selector */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              type="button"
              onClick={() => setSubmissionMode('race')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                submissionMode === 'race'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              🏁 Submit Race
            </button>
            <button
              type="button"
              onClick={() => setSubmissionMode('spot')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                submissionMode === 'spot'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              📍 Submit Spot
            </button>
            <button
              type="button"
              onClick={() => setSubmissionMode('batch')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                submissionMode === 'batch'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              📊 Batch Submit
            </button>
          </div>
          
          <p className="text-gray-600">
            {submissionMode === 'race' && 'Share your race with the community'}
            {submissionMode === 'spot' && 'Submit a new spot location'}
            {submissionMode === 'batch' && 'Upload multiple races from Excel/ODS file'}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
          {/* Race Submission Mode */}
          {submissionMode === 'race' && (
            <>
              {/* Basic Information and Event Image */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-6">
                    {/* Race Name - Required */}
              <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Race Name <span className="text-red-500">*</span>
                      </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter race name"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                />
              </div>

                    {/* Start Date - Required */}
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                  <input
                        type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        value={form.date_from}
                        onChange={(e) => setForm(prev => ({ ...prev, date_from: e.target.value }))}
                        required
                  />
                </div>

                    {/* End Date - Optional */}
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
                  <input
                        type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        value={form.date_to}
                        onChange={(e) => setForm(prev => ({ ...prev, date_to: e.target.value }))}
                      />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={form.category}
                  onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="WDSC">🏁 WDSC Event</option>
                  <option value="EURO">🌍 Euro Tour Event</option>
                  <option value="FREERIDE">🏄 Freeride Event</option>
                  <option value="IDF">🏆 IDF Event</option>
                  <option value="OUTLAW">⚡ Outlaw Event</option>
                  <option value="NATIONAL">🏆 National Championship</option>
                  <option value="RACE">🏁 Race Event</option>
                  <option value="SPOT">📍 Spot (not an event)</option>
                </select>
              </div>
            </div>
          </div>

                {/* Event Image - Smaller */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Image</h2>
                  <div className="space-y-4">
                    {form.event_image_url ? (
                      <div className="relative">
                        <img
                          src={form.event_image_url}
                          alt="Event preview"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={clearImage}
                          className="absolute top-2 right-2 px-2 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200 text-xs font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <div className="space-y-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-xl">📷</span>
                          </div>
              <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-1">Upload Image</h3>
                            <p className="text-xs text-gray-600 mb-3">Optional</p>
                <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="event-image-upload"
                            />
                            <label
                              htmlFor="event-image-upload"
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer text-sm"
                            >
                              <span>📁</span>
                              <span>Choose</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-2">
                        No image? Random selection
                      </p>
                      <div className="flex justify-center gap-1">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                          <img
                            key={i}
                            src={`/images/event-defaults/event_${i}.jpg`}
                            alt={`Sample ${i}`}
                            className="w-8 h-6 object-cover rounded border border-gray-200 opacity-60 hover:opacity-100 transition-opacity duration-200"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Spot Submission Mode */}
          {submissionMode === 'spot' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Spot Information</h2>
              <div className="space-y-6">
                {/* Spot Name - Required */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Spot Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter spot name"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                {/* Location - Optional */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location (Optional)</label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="City, Country"
                    value={form.location}
                    onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                {/* Map Picker for Spot */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Location on Map</label>
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    <MapPicker
                      lat={form.lat}
                      lng={form.lng}
                      onPick={(lat, lng) => setForm(prev => ({ ...prev, lat, lng }))}
                    />
                  </div>
                </div>

                {/* Important Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Important Information</label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 h-32 resize-none"
                    placeholder="Write down important things like what to care about, who to call, access information, etc."
                    value={form.spot_notes}
                    onChange={(e) => setForm(prev => ({ ...prev, spot_notes: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Batch Submission Mode */}
          {submissionMode === 'batch' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Batch Upload</h2>
              <div className="space-y-6">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excel/ODS File <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-3xl">📊</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Excel/ODS File</h3>
                        <p className="text-gray-600 mb-4">Supported formats: .xlsx, .ods</p>
                        <input
                          type="file"
                          accept=".xlsx,.ods"
                          onChange={handleBatchFileUpload}
                          className="hidden"
                          id="batch-file-upload"
                        />
                        <label
                          htmlFor="batch-file-upload"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
                        >
                          <span>📁</span>
                          <span>Choose File</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  {form.batch_file && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 text-sm">
                        <span className="font-medium">Selected:</span> {form.batch_file.name}
                      </p>
                    </div>
                  )}
          </div>

                         {/* Instructions */}
                         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                           <h3 className="font-medium text-blue-900 mb-2">Required Columns:</h3>
                           <div className="text-sm text-blue-800 space-y-1">
                             <p><strong>event_name</strong> - Race Name (required)</p>
                             <p><strong>date_start</strong> - Start Date (required)</p>
                             <p><strong>date_end</strong> - End Date (optional)</p>
                             <p><strong>location</strong> - Location (optional, will be automatically geocoded to coordinates)</p>
                             <p><strong>category</strong> or <strong>link_event_category</strong> - Categories: WDSC, IDF, EURO, FREERIDE, OUTLAW, NATIONAL, RACE (comma-separated for multiple)</p>
                             <p><strong>standup_top_1, standup_top_2, standup_top_3</strong> - Top 3 Open riders</p>
                             <p><strong>luge_top_1, luge_top_2, luge_top_3</strong> - Top 3 Luge riders</p>
                             <p><strong>women_top_1, women_top_2, women_top_3</strong> - Top 3 Women riders</p>
                             <p><strong>track_record_1, track_record_2, track_record_3, track_record_4, track_record_5, track_record_6</strong> - Track records (up to 6)</p>
                             <p><strong>organizer</strong> - Event organizer name(s) (comma-separated for multiple)</p>
                             <p><strong>event_description</strong> - Event description (optional)</p>
                             <p><strong>link_event_page</strong> - Event page URL</p>
                           </div>
                         <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                           <p className="text-sm text-green-800">
                             <strong>📍 Automatic Geocoding:</strong> Locations will be automatically converted to map coordinates. 
                             Processing may take a few seconds per location.
                           </p>
                         </div>
                         
                         {/* Template Download */}
                         <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                           <div className="flex items-center justify-between">
                             <div>
                               <h4 className="font-medium text-blue-900 mb-1">Recommended Template</h4>
                               <p className="text-sm text-blue-800">Download our sample file to see the correct column format</p>
                             </div>
                             <a
                               href="/batch_submission_template_custom.ods"
                               download="batch_submission_template_custom.ods"
                               className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                             >
                               <span>📥</span>
                               <span>Download Template</span>
                             </a>
                           </div>
                         </div>
                       </div>
              </div>
            </div>
          )}

          {/* Location - Only for race mode */}
          {submissionMode === 'race' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Location (Optional)</h2>
            <div className="space-y-6">
              {/* Map Picker */}
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <MapPicker
                  lat={form.lat}
                  lng={form.lng}
                  onPick={(lat, lng) => setForm(prev => ({ ...prev, lat, lng }))}
                />
              </div>

                {/* Location Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location Name (Optional)</label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="City, Country"
                    value={form.location}
                    onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

              {/* Lat/Lng inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={form.lat}
                    onChange={(e) =>
                      setForm(prev => ({ ...prev, lat: Number(e.target.value) }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={form.lng}
                    onChange={(e) =>
                      setForm(prev => ({ ...prev, lng: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Links - Only for race mode */}
          {submissionMode === 'race' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Links (Optional)</h2>
                <button
                  type="button"
                  onClick={addLink}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                >
                  <span>+</span>
                  <span>Add Link</span>
                </button>
              </div>
              <div className="space-y-4">
                {form.links.map((link, index) => (
                  <div key={index} className="flex gap-4 items-end">
                    <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Link Name</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="e.g., Event Page, Results, Photos"
                        value={link.name}
                        onChange={(e) => updateLink(index, 'name', e.target.value)}
                />
              </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="https://example.com"
                        value={link.url}
                        onChange={(e) => updateLink(index, 'url', e.target.value)}
                  />
                </div>
                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className="px-3 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Riders - Only for race mode, WDSC/EURO/IDF events, and past events */}
          {submissionMode === 'race' && form.category !== "SPOT" && form.category !== "FREERIDE" && !isFutureEvent() && (
            <div className="space-y-6">
              {/* Top Riders Open */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-xl">🏆</span>
                    Top Riders Open
              </h2>
                  <button
                    type="button"
                    onClick={() => addRider('top_riders_open')}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                  >
                    <span>+</span>
                    <span>Add Rider</span>
                  </button>
                </div>
              <div className="space-y-4">
                  {form.top_riders_open.map((rider, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">#{rider.position}</span>
                      </div>
                      <div className="flex-1">
                          <input
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Full name"
                          value={rider.name}
                          onChange={(e) => updateRider('top_riders_open', index, 'name', e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRider('top_riders_open', index)}
                        className="px-3 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                            </div>
                        </div>
                        
              {/* Top Riders Luge */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-xl">🛷</span>
                    Top Riders Luge
                  </h2>
                  <button
                    type="button"
                    onClick={() => addRider('top_riders_luge')}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                  >
                    <span>+</span>
                    <span>Add Rider</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {form.top_riders_luge.map((rider, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">#{rider.position}</span>
                      </div>
                      <div className="flex-1">
                        <input
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Full name"
                          value={rider.name}
                          onChange={(e) => updateRider('top_riders_luge', index, 'name', e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRider('top_riders_luge', index)}
                        className="px-3 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Riders Woman */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-xl">👩</span>
                    Top Riders Woman
                  </h2>
                  <button
                    type="button"
                    onClick={() => addRider('top_riders_woman')}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                  >
                    <span>+</span>
                    <span>Add Rider</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {form.top_riders_woman.map((rider, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">#{rider.position}</span>
                      </div>
                      <div className="flex-1">
                        <input
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Full name"
                          value={rider.name}
                          onChange={(e) => updateRider('top_riders_woman', index, 'name', e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRider('top_riders_woman', index)}
                        className="px-3 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                      </div>
                    </div>
                    
              {/* Top Qualifiers */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-xl">🏃</span>
                    Top Qualifiers
                  </h2>
                  <button
                    type="button"
                    onClick={() => addRider('top_qualifiers')}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                  >
                    <span>+</span>
                    <span>Add Qualifier</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {form.top_qualifiers.map((rider, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">#{rider.position}</span>
                      </div>
                      <div className="flex-1">
                        <input
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Full name"
                          value={rider.name}
                          onChange={(e) => updateRider('top_qualifiers', index, 'name', e.target.value)}
                        />
                      </div>
                              <button 
                                type="button" 
                        onClick={() => removeRider('top_qualifiers', index)}
                        className="px-3 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200"
                      >
                        ✕
                              </button>
                    </div>
                          ))}
                </div>
              </div>
            </div>
          )}

          {/* Future Event Message - Show when event is in the future */}
          {submissionMode === 'race' && form.category !== "SPOT" && form.category !== "FREERIDE" && isFutureEvent() && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-lg">ℹ️</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Future Event
                  </h3>
                  <p className="text-blue-800 mb-3">
                    This event is scheduled for the future. Top riders and qualifiers can only be added after the event has taken place.
                  </p>
                  <p className="text-sm text-blue-700">
                    You can still submit the event details now and add results later by editing the event.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Track Records - Only for race mode and WDSC/EURO/IDF events */}
          {submissionMode === 'race' && form.category !== "SPOT" && form.category !== "FREERIDE" && (
            <div className="space-y-6">
              {/* Track Record Open */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-xl">🏁</span>
                    Track Record Open
                  </h2>
                  {form.track_record_open && (
                    <button
                      type="button"
                      onClick={() => clearTrackRecord('track_record_open')}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {form.track_record_open ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rider Name</label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Full name"
                        value={form.track_record_open.name}
                        onChange={(e) => updateTrackRecord('track_record_open', 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="1,27.46"
                        value={form.track_record_open.time}
                        onChange={(e) => updateTrackRecord('track_record_open', 'time', e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => updateTrackRecord('track_record_open', 'name', '')}
                    className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors duration-200 w-full justify-center"
                  >
                    <span>+</span>
                    <span>Add Track Record</span>
                  </button>
                )}
              </div>

              {/* Track Record Luge */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-xl">🛷</span>
                    Track Record Luge
                  </h2>
                  {form.track_record_luge && (
                    <button
                      type="button"
                      onClick={() => clearTrackRecord('track_record_luge')}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {form.track_record_luge ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rider Name</label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Full name"
                        value={form.track_record_luge.name}
                        onChange={(e) => updateTrackRecord('track_record_luge', 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="1,27.46"
                        value={form.track_record_luge.time}
                        onChange={(e) => updateTrackRecord('track_record_luge', 'time', e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => updateTrackRecord('track_record_luge', 'name', '')}
                    className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors duration-200 w-full justify-center"
                  >
                    <span>+</span>
                    <span>Add Track Record</span>
                  </button>
                )}
              </div>

              {/* Track Record Woman */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-xl">👩</span>
                    Track Record Woman
                  </h2>
                  {form.track_record_woman && (
                    <button
                      type="button"
                      onClick={() => clearTrackRecord('track_record_woman')}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {form.track_record_woman ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rider Name</label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Full name"
                        value={form.track_record_woman.name}
                        onChange={(e) => updateTrackRecord('track_record_woman', 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="1,27.46"
                        value={form.track_record_woman.time}
                        onChange={(e) => updateTrackRecord('track_record_woman', 'time', e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => updateTrackRecord('track_record_woman', 'name', '')}
                    className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors duration-200 w-full justify-center"
                  >
                    <span>+</span>
                    <span>Add Track Record</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Organizer - Only for race mode */}
          {submissionMode === 'race' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>👤</span>
                Organizer
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Organizer Name (Optional)</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter organizer name"
                  value={form.organizer_name}
                  onChange={(e) => setForm(prev => ({ ...prev, organizer_name: e.target.value }))}
                />
                <p className="text-sm text-gray-500 mt-2">
                  The organizer will be treated as a rider and can be clicked on the event page.
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <button
              className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 hover-lift"
              disabled={busy || isAuthenticated === false}
            >
              {busy ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>🚀</span>
                  <span>Submit Race</span>
                </div>
              )}
            </button>
          </div>
        </form>

        {/* Feedback Messages */}
        {ok && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <p className="text-green-800 font-medium">{ok}</p>
            </div>
          </div>
        )}
        
        {err && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-sm">⚠</span>
              </div>
              <p className="text-red-800 font-medium">{err}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function Submit() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubmitContent />
    </Suspense>
  );
}
