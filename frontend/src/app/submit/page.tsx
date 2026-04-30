"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MapPicker from "@/components/MapPicker";

type Link = { name: string; url: string };
type Rider = { name: string; position: number };
type TrackRecord = { name: string; time: string };
type SubmissionMode = 'race' | 'spot';

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
    event_description: "",
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
  });
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [attachmentErr, setAttachmentErr] = useState<string | null>(null);
  const [gpsLocMsg, setGpsLocMsg] = useState<string | null>(null);

  function detectLocationFromCSV(file: File): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = (e.target?.result as string) ?? "";
        const lines = text.split(/\r?\n/);
        let headerIdx = -1, latCol = -1, lngCol = -1;
        for (let i = 0; i < lines.length; i++) {
          const lower = lines[i].toLowerCase();
          if (lower.includes("latitude") && lower.includes("longitude")) {
            headerIdx = i;
            const headers = lines[i].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
            latCol = headers.findIndex((h) => h === "latitude" || h === "lat");
            lngCol = headers.findIndex((h) => h === "longitude" || h === "lng" || h === "lon");
            break;
          }
        }
        if (headerIdx === -1 || latCol === -1 || lngCol === -1) {
          reject(new Error("No GPS columns found in file"));
          return;
        }
        for (let i = headerIdx + 1; i < lines.length; i++) {
          const parts = lines[i].split(",");
          const lat = parseFloat(parts[latCol]);
          const lng = parseFloat(parts[lngCol]);
          if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
            resolve({ lat, lng });
            return;
          }
        }
        reject(new Error("No valid GPS coordinates found in file"));
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }

  async function handleGpsLocDetect(file: File) {
    setGpsLocMsg(null);
    try {
      const { lat, lng } = await detectLocationFromCSV(file);
      setForm((prev) => ({ ...prev, lat, lng }));
      setGpsLocMsg(`Location detected: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } catch (e: any) {
      setGpsLocMsg(`Could not detect location: ${e.message}`);
    }
  }

  // Check if the event is in the future
  const isFutureEvent = () => {
    if (!form.date_from) return false;
    const eventDate = new Date(form.date_from);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
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

      const editCategory = searchParams.get('category') || 'WDSC';
      setSubmissionMode(editCategory === 'SPOT' ? 'spot' : 'race');

      // Prefill form with URL parameters
      setForm(prev => ({
        ...prev,
        name: searchParams.get('name') || '',
        location: searchParams.get('location') || '',
        lat: parseFloat(searchParams.get('lat') || '50.08804'),
        lng: parseFloat(searchParams.get('lng') || '14.42076'),
        category: editCategory,
        date_from: searchParams.get('date_from') ? new Date(searchParams.get('date_from')!).toISOString().slice(0,10) : new Date().toISOString().slice(0,10),
        date_to: searchParams.get('date_to') ? new Date(searchParams.get('date_to')!).toISOString().slice(0,10) : '',
        links: searchParams.get('source_url') ?
          [{ name: "Event Page", url: searchParams.get('source_url') || '' }] :
          [{ name: "Event Page", url: "" }],
        event_description: searchParams.get('event_description') || '',
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
        spot_notes: searchParams.get('spot_notes') || '',
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setBusy(true);
    try {
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
        event_description: submissionMode === 'race' ? form.event_description.trim() || null : null,
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

      // Upload any attached documents
      for (const file of attachmentFiles) {
        const fd = new FormData();
        fd.append("file", file);
        const attRes = await fetch(`/api/submit/${data.id}/attachments`, {
          method: "POST",
          body: fd,
        });
        if (!attRes.ok) {
          console.warn(`Failed to upload attachment ${file.name}`);
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

  const inputStyle = { background: "var(--surface-raised)", border: "1px solid var(--border)", color: "var(--paper)" };
  const cardStyle = { background: "var(--surface)", border: "1px solid var(--border)" };

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--ink)" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }}></div>
          <p style={{ color: "var(--muted)" }}>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: "var(--ink)" }}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-6" style={{ color: "var(--paper)" }}>
            {isEditMode ? (editingSubmissionId ? 'Edit Pending Submission' : 'Edit Event Details') : 'Submit a Race'}
          </h1>
          {isEditMode && (
            <p className="text-lg" style={{ color: "var(--muted)" }}>
              {editingSubmissionId ? (
                <>Editing pending submission: <span className="font-semibold" style={{ color: "var(--paper)" }}>{form.name}</span></>
              ) : (
                <>Updating event: <span className="font-semibold" style={{ color: "var(--paper)" }}>{form.name}</span></>
              )}
            </p>
          )}

          {/* Registration Prompt for Unauthenticated Users */}
          {isAuthenticated === false && (
            <div className="mb-8 p-6 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">👥</span>
                </div>
                <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--paper)" }}>
                  Join Our Community!
                </h2>
                <p className="mb-6 max-w-2xl mx-auto" style={{ color: "var(--muted)" }}>
                  You're viewing the submission form as a guest. <strong style={{ color: "var(--paper)" }}>Register for free</strong> to upload events,
                  strengthen our community database, and help preserve downhill racing history.
                  It only takes a minute!
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => router.push('/register')}
                    className="px-8 py-3 font-semibold rounded-lg shadow-lg transition-all duration-200"
                    style={{ background: "var(--accent)", color: "var(--paper)" }}
                  >
                    🚀 Register Now
                  </button>
                  <button
                    onClick={() => router.push('/login')}
                    className="px-8 py-3 font-semibold rounded-lg transition-all duration-200"
                    style={{ background: "var(--surface-raised)", color: "var(--paper)", border: "1px solid var(--border)" }}
                  >
                    🔑 Sign In
                  </button>
                </div>
                <p className="text-sm mt-4" style={{ color: "var(--muted)" }}>
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
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
              style={submissionMode === 'race'
                ? { background: "var(--accent)", color: "var(--paper)" }
                : { background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}
            >
              🏁 Submit Race
            </button>
            <button
              type="button"
              onClick={() => setSubmissionMode('spot')}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
              style={submissionMode === 'spot'
                ? { background: "var(--accent)", color: "var(--paper)" }
                : { background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}
            >
              📍 Submit Spot
            </button>
          </div>

          <p style={{ color: "var(--muted)" }}>
            {submissionMode === 'race' && 'Share your race with the community'}
            {submissionMode === 'spot' && 'Submit a new spot location'}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
          {/* Race Submission Mode */}
          {submissionMode === 'race' && (
            <>
              {/* Basic Information and Event Image */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Basic Information */}
                <div className="lg:col-span-2 rounded-xl shadow-sm p-6" style={cardStyle}>
                  <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--paper)" }}>Basic Information</h2>
                  <div className="space-y-6">
                    {/* Race Name - Required */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>
                        Race Name <span style={{ color: "var(--accent)" }}>*</span>
                      </label>
                      <input
                        className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all duration-200"
                        style={inputStyle}
                        placeholder="Enter race name"
                        value={form.name}
                        onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>

                    {/* Start Date - Required */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>
                        Start Date <span style={{ color: "var(--accent)" }}>*</span>
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all duration-200"
                        style={inputStyle}
                        value={form.date_from}
                        onChange={(e) => setForm(prev => ({ ...prev, date_from: e.target.value }))}
                        required
                      />
                    </div>

                    {/* End Date - Optional */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>End Date (Optional)</label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all duration-200"
                        style={inputStyle}
                        value={form.date_to}
                        onChange={(e) => setForm(prev => ({ ...prev, date_to: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>
                        Event Description (Optional)
                      </label>
                      <textarea
                        className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all duration-200 min-h-[120px] resize-none"
                        style={inputStyle}
                        placeholder="Share context about the event, track, format, or anything useful for future riders."
                        value={form.event_description}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            event_description: e.target.value,
                          }))
                        }
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>Category</label>
                      <select
                        className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all duration-200"
                        style={inputStyle}
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
                <div className="rounded-xl shadow-sm p-6" style={cardStyle}>
                  <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--paper)" }}>Event Image</h2>
                  <div className="space-y-4">
                    {form.event_image_url ? (
                      <div className="relative">
                        <img
                          src={form.event_image_url}
                          alt="Event preview"
                          className="w-full h-48 object-cover rounded-lg"
                          style={{ border: "1px solid var(--border)" }}
                        />
                        <button
                          type="button"
                          onClick={clearImage}
                          className="absolute top-2 right-2 px-2 py-1 rounded-lg transition-colors duration-200 text-xs font-medium"
                          style={{ background: "var(--surface-raised)", color: "#ef4444", border: "1px solid var(--border)" }}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-lg p-4 text-center" style={{ borderColor: "var(--border)" }}>
                        <div className="space-y-3">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ background: "var(--surface-raised)" }}>
                            <span className="text-xl">📷</span>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium mb-1" style={{ color: "var(--paper)" }}>Upload Image</h3>
                            <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>Optional</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="event-image-upload"
                            />
                            <label
                              htmlFor="event-image-upload"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors duration-200 cursor-pointer text-sm"
                              style={{ background: "var(--accent)", color: "var(--paper)" }}
                            >
                              <span>📁</span>
                              <span>Choose</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="text-center">
                      <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>
                        No image? Random selection
                      </p>
                      <div className="flex justify-center gap-1">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                          <img
                            key={i}
                            src={`/images/event-defaults/event_${i}.jpg`}
                            alt={`Sample ${i}`}
                            className="w-8 h-6 object-cover rounded opacity-60 hover:opacity-100 transition-opacity duration-200"
                            style={{ border: "1px solid var(--border)" }}
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
            <div className="rounded-xl shadow-sm p-6" style={cardStyle}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--paper)" }}>Spot Information</h2>
              <div className="space-y-6">
                {/* Spot Name - Required */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>
                    Spot Name <span style={{ color: "var(--accent)" }}>*</span>
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all duration-200"
                    style={inputStyle}
                    placeholder="Enter spot name"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                {/* Location - Optional */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>Location (Optional)</label>
                  <input
                    className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all duration-200"
                    style={inputStyle}
                    placeholder="City, Country"
                    value={form.location}
                    onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                {/* Map Picker for Spot */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium" style={{ color: "var(--muted)" }}>Select Location on Map</label>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg cursor-pointer text-xs transition-opacity hover:opacity-80"
                      style={{ background: "var(--surface-raised)", color: "var(--paper)", border: "1px solid var(--border)" }}>
                      <span>📡</span>
                      <span>Detect from RaceBox CSV</span>
                      <input type="file" accept=".csv" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleGpsLocDetect(f); e.target.value = ""; }} />
                    </label>
                  </div>
                  {gpsLocMsg && (
                    <p className="text-xs mb-2" style={{ color: gpsLocMsg.startsWith("Could") ? "#ef4444" : "#22c55e" }}>{gpsLocMsg}</p>
                  )}
                  <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                    <MapPicker
                      lat={form.lat}
                      lng={form.lng}
                      onPick={(lat, lng) => setForm(prev => ({ ...prev, lat, lng }))}
                    />
                  </div>
                </div>

                {/* Important Notes */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>Important Information</label>
                  <textarea
                    className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all duration-200 h-32 resize-none"
                    style={inputStyle}
                    placeholder="Write down important things like what to care about, who to call, access information, etc."
                    value={form.spot_notes}
                    onChange={(e) => setForm(prev => ({ ...prev, spot_notes: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Location - Only for race mode */}
          {submissionMode === 'race' && (
            <div className="rounded-xl shadow-sm p-6" style={cardStyle}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--paper)" }}>Location (Optional)</h2>
              <div className="space-y-6">
                {/* Map Picker */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium" style={{ color: "var(--muted)" }}>Pin Location</label>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg cursor-pointer text-xs transition-opacity hover:opacity-80"
                      style={{ background: "var(--surface-raised)", color: "var(--paper)", border: "1px solid var(--border)" }}>
                      <span>📡</span>
                      <span>Detect from RaceBox CSV</span>
                      <input type="file" accept=".csv" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleGpsLocDetect(f); e.target.value = ""; }} />
                    </label>
                  </div>
                  {gpsLocMsg && (
                    <p className="text-xs mb-2" style={{ color: gpsLocMsg.startsWith("Could") ? "#ef4444" : "#22c55e" }}>{gpsLocMsg}</p>
                  )}
                  <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                    <MapPicker
                      lat={form.lat}
                      lng={form.lng}
                      onPick={(lat, lng) => setForm(prev => ({ ...prev, lat, lng }))}
                    />
                  </div>
                </div>

                {/* Location Name */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>Location Name (Optional)</label>
                  <input
                    className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all duration-200"
                    style={inputStyle}
                    placeholder="City, Country"
                    value={form.location}
                    onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                {/* Lat/Lng inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>Latitude</label>
                    <input
                      type="number"
                      step="any"
                      className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all duration-200"
                      style={inputStyle}
                      value={form.lat}
                      onChange={(e) =>
                        setForm(prev => ({ ...prev, lat: Number(e.target.value) }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>Longitude</label>
                    <input
                      type="number"
                      step="any"
                      className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all duration-200"
                      style={inputStyle}
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
            <div className="rounded-xl shadow-sm p-6" style={cardStyle}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold" style={{ color: "var(--paper)" }}>Links (Optional)</h2>
                <button
                  type="button"
                  onClick={addLink}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                  style={{ background: "var(--accent)", color: "var(--paper)" }}
                >
                  <span>+</span>
                  <span>Add Link</span>
                </button>
              </div>
              <div className="space-y-4">
                {form.links.map((link, index) => (
                  <div key={index} className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>Link Name</label>
                      <input
                        className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all duration-200"
                        style={inputStyle}
                        placeholder="e.g., Event Page, Results, Photos"
                        value={link.name}
                        onChange={(e) => updateLink(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>URL</label>
                      <input
                        className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all duration-200"
                        style={inputStyle}
                        placeholder="https://example.com"
                        value={link.url}
                        onChange={(e) => updateLink(index, 'url', e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className="px-3 py-3 rounded-lg transition-colors duration-200"
                      style={{ background: "var(--surface-raised)", color: "#ef4444", border: "1px solid var(--border)" }}
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
              <div className="rounded-xl shadow-sm p-6" style={cardStyle}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: "var(--paper)" }}>
                    <span className="text-xl">🏆</span>
                    Top Riders Open
                  </h2>
                  <button
                    type="button"
                    onClick={() => addRider('top_riders_open')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                    style={{ background: "var(--accent)", color: "var(--paper)" }}
                  >
                    <span>+</span>
                    <span>Add Rider</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {form.top_riders_open.map((rider, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-lg" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">#{rider.position}</span>
                      </div>
                      <div className="flex-1">
                        <input
                          className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all duration-200"
                          style={inputStyle}
                          placeholder="Full name"
                          value={rider.name}
                          onChange={(e) => updateRider('top_riders_open', index, 'name', e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRider('top_riders_open', index)}
                        className="px-3 py-3 rounded-lg transition-colors duration-200"
                        style={{ background: "var(--surface-raised)", color: "#ef4444", border: "1px solid var(--border)" }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Riders Luge */}
              <div className="rounded-xl shadow-sm p-6" style={cardStyle}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: "var(--paper)" }}>
                    <span className="text-xl">🛷</span>
                    Top Riders Luge
                  </h2>
                  <button
                    type="button"
                    onClick={() => addRider('top_riders_luge')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                    style={{ background: "var(--accent)", color: "var(--paper)" }}
                  >
                    <span>+</span>
                    <span>Add Rider</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {form.top_riders_luge.map((rider, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-lg" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">#{rider.position}</span>
                      </div>
                      <div className="flex-1">
                        <input
                          className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all duration-200"
                          style={inputStyle}
                          placeholder="Full name"
                          value={rider.name}
                          onChange={(e) => updateRider('top_riders_luge', index, 'name', e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRider('top_riders_luge', index)}
                        className="px-3 py-3 rounded-lg transition-colors duration-200"
                        style={{ background: "var(--surface-raised)", color: "#ef4444", border: "1px solid var(--border)" }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Riders Woman */}
              <div className="rounded-xl shadow-sm p-6" style={cardStyle}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: "var(--paper)" }}>
                    <span className="text-xl">👩</span>
                    Top Riders Woman
                  </h2>
                  <button
                    type="button"
                    onClick={() => addRider('top_riders_woman')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                    style={{ background: "var(--accent)", color: "var(--paper)" }}
                  >
                    <span>+</span>
                    <span>Add Rider</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {form.top_riders_woman.map((rider, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-lg" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">#{rider.position}</span>
                      </div>
                      <div className="flex-1">
                        <input
                          className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all duration-200"
                          style={inputStyle}
                          placeholder="Full name"
                          value={rider.name}
                          onChange={(e) => updateRider('top_riders_woman', index, 'name', e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRider('top_riders_woman', index)}
                        className="px-3 py-3 rounded-lg transition-colors duration-200"
                        style={{ background: "var(--surface-raised)", color: "#ef4444", border: "1px solid var(--border)" }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Qualifiers */}
              <div className="rounded-xl shadow-sm p-6" style={cardStyle}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: "var(--paper)" }}>
                    <span className="text-xl">🏃</span>
                    Top Qualifiers
                  </h2>
                  <button
                    type="button"
                    onClick={() => addRider('top_qualifiers')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                    style={{ background: "var(--accent)", color: "var(--paper)" }}
                  >
                    <span>+</span>
                    <span>Add Qualifier</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {form.top_qualifiers.map((rider, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-lg" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">#{rider.position}</span>
                      </div>
                      <div className="flex-1">
                        <input
                          className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all duration-200"
                          style={inputStyle}
                          placeholder="Full name"
                          value={rider.name}
                          onChange={(e) => updateRider('top_qualifiers', index, 'name', e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRider('top_qualifiers', index)}
                        className="px-3 py-3 rounded-lg transition-colors duration-200"
                        style={{ background: "var(--surface-raised)", color: "#ef4444", border: "1px solid var(--border)" }}
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
            <div className="rounded-xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "var(--surface-raised)" }}>
                  <span className="text-lg" style={{ color: "var(--accent)" }}>ℹ️</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--paper)" }}>
                    Future Event
                  </h3>
                  <p className="mb-3" style={{ color: "var(--muted)" }}>
                    This event is scheduled for the future. Top riders and qualifiers can only be added after the event has taken place.
                  </p>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>
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
              <div className="rounded-xl shadow-sm p-6" style={cardStyle}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: "var(--paper)" }}>
                    <span className="text-xl">🏁</span>
                    Track Record Open
                  </h2>
                  {form.track_record_open && (
                    <button
                      type="button"
                      onClick={() => clearTrackRecord('track_record_open')}
                      className="px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                      style={{ background: "var(--surface-raised)", color: "#ef4444", border: "1px solid var(--border)" }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                {form.track_record_open ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>Rider Name</label>
                      <input
                        className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all duration-200"
                        style={inputStyle}
                        placeholder="Full name"
                        value={form.track_record_open.name}
                        onChange={(e) => updateTrackRecord('track_record_open', 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>Time</label>
                      <input
                        className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all duration-200"
                        style={inputStyle}
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
                    className="flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg transition-colors duration-200 w-full justify-center"
                    style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                  >
                    <span>+</span>
                    <span>Add Track Record</span>
                  </button>
                )}
              </div>

              {/* Track Record Luge */}
              <div className="rounded-xl shadow-sm p-6" style={cardStyle}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: "var(--paper)" }}>
                    <span className="text-xl">🛷</span>
                    Track Record Luge
                  </h2>
                  {form.track_record_luge && (
                    <button
                      type="button"
                      onClick={() => clearTrackRecord('track_record_luge')}
                      className="px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                      style={{ background: "var(--surface-raised)", color: "#ef4444", border: "1px solid var(--border)" }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                {form.track_record_luge ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>Rider Name</label>
                      <input
                        className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all duration-200"
                        style={inputStyle}
                        placeholder="Full name"
                        value={form.track_record_luge.name}
                        onChange={(e) => updateTrackRecord('track_record_luge', 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>Time</label>
                      <input
                        className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all duration-200"
                        style={inputStyle}
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
                    className="flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg transition-colors duration-200 w-full justify-center"
                    style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                  >
                    <span>+</span>
                    <span>Add Track Record</span>
                  </button>
                )}
              </div>

              {/* Track Record Woman */}
              <div className="rounded-xl shadow-sm p-6" style={cardStyle}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: "var(--paper)" }}>
                    <span className="text-xl">👩</span>
                    Track Record Woman
                  </h2>
                  {form.track_record_woman && (
                    <button
                      type="button"
                      onClick={() => clearTrackRecord('track_record_woman')}
                      className="px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                      style={{ background: "var(--surface-raised)", color: "#ef4444", border: "1px solid var(--border)" }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                {form.track_record_woman ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>Rider Name</label>
                      <input
                        className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all duration-200"
                        style={inputStyle}
                        placeholder="Full name"
                        value={form.track_record_woman.name}
                        onChange={(e) => updateTrackRecord('track_record_woman', 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>Time</label>
                      <input
                        className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all duration-200"
                        style={inputStyle}
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
                    className="flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg transition-colors duration-200 w-full justify-center"
                    style={{ borderColor: "var(--border)", color: "var(--muted)" }}
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
            <div className="rounded-xl shadow-sm p-6" style={cardStyle}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--paper)" }}>
                <span>👤</span>
                Organizer
              </h2>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--muted)" }}>Organizer Name (Optional)</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all duration-200"
                  style={inputStyle}
                  placeholder="Enter organizer name"
                  value={form.organizer_name}
                  onChange={(e) => setForm(prev => ({ ...prev, organizer_name: e.target.value }))}
                />
                <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
                  The organizer will be treated as a rider and can be clicked on the event page.
                </p>
              </div>
            </div>
          )}

          {/* Supporting Documents - races only */}
          {submissionMode === 'race' && (
          <div className="rounded-xl shadow-sm p-6" style={cardStyle}>
              <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--paper)" }}>Supporting Documents</h2>
              <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
                Optionally attach qualifying results, race schedules, or other files (csv, xlsx, pdf, docx, txt — max 1 MB total).
              </p>

              {attachmentFiles.length > 0 && (
                <div className="flex flex-col gap-2 mb-4">
                  {attachmentFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}>
                      <span className="text-sm flex-1 truncate" style={{ color: "var(--paper)" }}>{f.name}</span>
                      <span className="text-xs flex-shrink-0" style={{ color: "var(--muted)" }}>
                        {f.size < 1024 ? "< 1 KB" : `${Math.round(f.size / 1024)} KB`}
                      </span>
                      <button
                        type="button"
                        onClick={() => { setAttachmentFiles(prev => prev.filter((_, j) => j !== i)); setAttachmentErr(null); }}
                        className="text-xs px-2 py-0.5 rounded flex-shrink-0"
                        style={{ color: "#ef4444", background: "var(--surface)" }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {attachmentErr && (
                <p className="text-sm mb-3" style={{ color: "#ef4444" }}>{attachmentErr}</p>
              )}

              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-opacity hover:opacity-80 text-sm"
                style={{ background: "var(--surface-raised)", color: "var(--paper)", border: "1px solid var(--border)" }}>
                <span>📎</span>
                <span>Add file</span>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,.doc,.docx,.pdf,.txt,.ods"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const MAX_TOTAL = 1 * 1024 * 1024;
                      const currentTotal = attachmentFiles.reduce((sum, f) => sum + f.size, 0);
                      if (currentTotal + file.size > MAX_TOTAL) {
                        const remaining = MAX_TOTAL - currentTotal;
                        setAttachmentErr(`Total attachment size would exceed 1 MB. You have ${remaining < 1024 ? "< 1" : Math.floor(remaining / 1024)} KB remaining.`);
                      } else {
                        setAttachmentErr(null);
                        setAttachmentFiles(prev => [...prev, file]);
                      }
                    }
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          )}

          {/* Submit Button */}
          <div className="rounded-xl shadow-sm p-6" style={cardStyle}>
            <button
              className="w-full px-8 py-4 font-semibold rounded-lg shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
              style={{ background: "var(--accent)", color: "var(--paper)" }}
              disabled={busy || isAuthenticated === false}
            >
              {busy ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }}></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>🚀</span>
                  <span>
                    {submissionMode === "spot" ? "Submit Spot" : "Submit Race"}
                  </span>
                </div>
              )}
            </button>
          </div>
        </form>

        {/* Feedback Messages */}
        {ok && (
          <div className="mt-6 p-4 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "var(--surface-raised)" }}>
                <span className="text-sm">✓</span>
              </div>
              <p className="font-medium" style={{ color: "var(--paper)" }}>{ok}</p>
            </div>
          </div>
        )}

        {err && (
          <div className="mt-6 p-4 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "var(--surface-raised)" }}>
                <span className="text-sm">⚠</span>
              </div>
              <p className="font-medium" style={{ color: "var(--paper)" }}>{err}</p>
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
