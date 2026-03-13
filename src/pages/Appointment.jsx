// src/pages/Appointment.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import ConfettiBurst from "../components/ConfettiBurst.jsx";
import "../styles/booking.css"; // styles for floating/hover + fixes

const SERVICES = [
  "Hairstyle","Skin Care","Spondy Relaxation","Facial Treatment","Makeup","Eye Treatment",
  "Cut & Style","Color & Gloss","Keratin Smooth",
  "Classic Cut","Fade & Style","Beard Groom",
  "Hydra Glow Facial","Acne Defense Peel","Bright-C Therapy",
  "Detan & Cleanse","Oil-Control Facial","Festive Glow Facial",
];

const STYLISTS = ["Any available","Aarav","Maya","Ishita","Rahul"];

export default function Appointment() {
  const imgRef = useRef(null);
  const [imgName, setImgName] = useState("");
  const [ok, setOk] = useState(false);            // confetti trigger
  const [step, setStep] = useState(1);            // 1 Service → 2 Slot → 3 Confirm
  const [lastBooked, setLastBooked] = useState(null); // banner/intimation

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    date: "",
    time: "",
    stylist: "Any available",
    note: "",
  });

  // Prefill service from ?service=
  useEffect(() => {
    const usp = new URLSearchParams(window.location.search);
    const svc = usp.get("service");
    setForm((f) => ({ ...f, service: svc || f.service }));
    document.title = "Luxe Salon — Book Appointment";
  }, []);

  // Quick estimate just for points preview
  const estPrice = useMemo(() => {
    const cheap = ["Classic Cut","Fade & Style","Beard Groom","Eye Treatment"];
    const mid = ["Cut & Style","Color & Gloss","Hydra Glow Facial","Detan & Cleanse","Oil-Control Facial","Skin Care","Facial Treatment","Bright-C Therapy"];
    const premium = ["Keratin Smooth","Makeup","Festive Glow Facial","Spondy Relaxation","Hairstyle"];
    const s = form.service || "";
    if (premium.some(v => s.includes(v))) return 3499;
    if (mid.some(v => s.includes(v))) return 1999;
    if (cheap.some(v => s.includes(v))) return 699;
    return 999;
  }, [form.service]);
  const points = useMemo(() => Math.max(5, Math.round((estPrice / 1000) * 10)), [estPrice]);

  function handleFile(e) {
    const file = e.target.files?.[0];
    setImgName(file ? file.name : "");
    if (!file || !imgRef.current) {
      if (imgRef.current) imgRef.current.removeAttribute("src");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => imgRef.current.setAttribute("src", ev.target.result);
    reader.readAsDataURL(file);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function next(e) {
    e?.preventDefault?.();
    if (step === 1 && (!form.name || !form.phone || !form.service)) return shake("#step1");
    if (step === 2 && (!form.date || !form.time)) return shake("#step2");
    setStep((s) => Math.min(3, s + 1));
  }
  function back(e) {
    e?.preventDefault?.();
    setStep((s) => Math.max(1, s - 1));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.service || !form.date || !form.time) {
      return shake("#step3");
    }

    // Success toast (Bootstrap)
    const toastEl = document.getElementById("successToast");
    if (toastEl && window.bootstrap?.Toast) {
      const toast = new window.bootstrap.Toast(toastEl, { delay: 3500 });
      toast.show();
    }

    // Confetti 🎉
    setOk(false);
    requestAnimationFrame(() => setOk(true));

    // Show on-page "intimation" banner
    setLastBooked({
      service: form.service,
      date: form.date,
      time: form.time,
      stylist: form.stylist,
    });

    // Reset form for next booking
    setForm({
      name: "",
      email: "",
      phone: "",
      service: "",
      date: "",
      time: "",
      stylist: "Any available",
      note: "",
    });
    setImgName("");
    if (imgRef.current) imgRef.current.removeAttribute("src");
    setStep(1);
  }

  return (
    <main className="booking container py-4">
      {/* Booking success/banner (intimation) */}
      {lastBooked && (
        <div className="booked-banner glass show">
          <div className="msg">
            <strong>✅ Booked!</strong>&nbsp; {lastBooked.service} on <strong>{lastBooked.date}</strong> at <strong>{lastBooked.time}</strong>{lastBooked.stylist ? <> &middot; Stylist: <strong>{lastBooked.stylist}</strong></> : null}
          </div>
          <button
            className="btn btn-sm btn-outline-light"
            onClick={() => setLastBooked(null)}
            aria-label="Dismiss"
          >
            Dismiss
          </button>
        </div>
      )}

      <h1 className="mb-3">Book Appointment</h1>

      <div className="row g-4">
        {/* Wizard steps */}
        <div className="col-12 col-lg-8">
          {/* Step indicator */}
          <div className="stepper glass mb-3">
            <StepDot n={1} active={step >= 1} label="Service" />
            <StepLine />
            <StepDot n={2} active={step >= 2} label="Slot" />
            <StepLine />
            <StepDot n={3} active={step >= 3} label="Confirm" />
          </div>

          {/* Step 1 — Service */}
          <section id="step1" className={`panel glass ${step === 1 ? "show" : "hide"}`}>
            <header className="panel-h">
              <h2 className="h5 m-0">1 · Your details & service</h2>
            </header>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Name</label>
                <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  pattern="[0-9]{10,}"
                  placeholder="10+ digits"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Service</label>
                <select id="serviceSelect" className="form-select" name="service" value={form.service} onChange={handleChange} required>
                  <option value="">Choose…</option>
                  {SERVICES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="col-12">
                <label className="form-label">Reference Image (optional)</label>
                <input type="file" className="form-control" accept="image/*" name="image" onChange={handleFile} />
                {imgName && <small className="text-muted d-block mt-1">Selected: {imgName}</small>}
                <img ref={imgRef} alt="" className="preview" />
              </div>
            </div>

            <div className="panel-f">
              <button className="btn btn-dark" onClick={next}>Continue — Pick a slot</button>
            </div>
          </section>

          {/* Step 2 — Slot */}
          <section id="step2" className={`panel glass ${step === 2 ? "show" : "hide"}`}>
            <header className="panel-h">
              <h2 className="h5 m-0">2 · Date & time</h2>
            </header>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Date</label>
                <input type="date" className="form-control" name="date" value={form.date} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Time</label>
                <input type="time" className="form-control" name="time" value={form.time} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Stylist preference</label>
                <select className="form-select" name="stylist" value={form.stylist} onChange={handleChange}>
                  {STYLISTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Notes (optional)</label>
                <textarea className="form-control" rows={3} name="note" value={form.note} onChange={handleChange} placeholder="Any specifics we should know?" />
              </div>
            </div>

            <div className="panel-f d-flex gap-2">
              <button className="btn btn-outline-dark" onClick={back}>Back</button>
              <button className="btn btn-dark" onClick={next}>Continue — Confirm</button>
            </div>
          </section>

          {/* Step 3 — Confirm */}
          <section id="step3" className={`panel glass ${step === 3 ? "show" : "hide"}`}>
            <header className="panel-h">
              <h2 className="h5 m-0">3 · Confirm & send</h2>
            </header>

            <ul className="confirm-list">
              <li><strong>Service:</strong> {form.service || <em>—</em>}</li>
              <li><strong>Date:</strong> {form.date || <em>—</em>} &nbsp; <strong>Time:</strong> {form.time || <em>—</em>}</li>
              <li><strong>Stylist:</strong> {form.stylist}</li>
              <li><strong>Name:</strong> {form.name || <em>—</em>} &nbsp; <strong>Phone:</strong> {form.phone || <em>—</em>}</li>
              {form.note && (<li className="muted"><strong>Notes:</strong> {form.note}</li>)}
            </ul>

            <form onSubmit={handleSubmit}>
              <button className="btn btn-primary btn-lg">Confirm Booking</button>
            </form>
          </section>

          {/* Confetti layer */}
          <ConfettiBurst run={ok} />
        </div>

        {/* Sticky Summary */}
        <aside className="col-12 col-lg-4">
          <div className="summary glass floaty">
            <header className="d-flex justify-content-between align-items-center mb-2">
              <h3 className="h6 m-0">Your Summary</h3>
              <span className="badge rounded-pill bg-success">+{points} pts</span>
            </header>
            <div className="summ-row"><span>Service</span><strong>{form.service || "—"}</strong></div>
            <div className="summ-row"><span>Date</span><strong>{form.date || "—"}</strong></div>
            <div className="summ-row"><span>Time</span><strong>{form.time || "—"}</strong></div>
            <div className="summ-row"><span>Stylist</span><strong>{form.stylist}</strong></div>
            <div className="divider" />
            <div className="summ-row"><span>Est. price</span><strong>₹{estPrice.toLocaleString("en-IN")}</strong></div>
            <div className="muted small mt-2">Loyalty preview: earn <strong>{points}</strong> points for this booking. Redeem later for deals.</div>
          </div>
        </aside>
      </div>

      {/* Success toast (Bootstrap) */}
      <div
        id="successToast"
        className="toast align-items-center text-bg-success border-0 position-fixed bottom-0 end-0 m-4"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="d-flex">
          <div className="toast-body">🎉 Appointment request received! We’ll confirm shortly.</div>
          <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    </main>
  );
}

/* helpers */
function StepDot({ n, active, label }) {
  return (
    <div className={`step-dot ${active ? "active" : ""}`} aria-current={active ? "step" : undefined}>
      <span>{n}</span><em>{label}</em>
    </div>
  );
}
function StepLine() { return <div className="step-line" aria-hidden />; }
function shake(sel) {
  const el = document.querySelector(sel);
  if (!el) return;
  el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake");
}
