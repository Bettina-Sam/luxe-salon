// src/pages/Pricing.jsx
import { useMemo, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { categories, addons, pricingMeta } from "../data/pricing";
import { packages } from "../data/packages";
import "../styles/pricing.css";

const GENDERS = ["Women", "Men"];

export default function Pricing() {
  const [gender, setGender] = useState("Women");
  const [filter, setFilter] = useState("All");

  const tabs = useMemo(() => ["All", ...categories.map((c) => c.title)], []);
  const format = (n) => `${pricingMeta.currency}${n.toLocaleString("en-IN")}`;
  const filtered = categories.filter((c) => filter === "All" || c.title === filter);

  // Mouse tilt and dance animation
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll(".pricing-card"));
    const onMove = (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      const mx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const my = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      e.currentTarget.style.setProperty("--tiltX", (-my * 8) + "deg");
      e.currentTarget.style.setProperty("--tiltY", (mx * 8) + "deg");
    };
    const onLeave = (e) => {
      e.currentTarget.style.setProperty("--tiltX", "0deg");
      e.currentTarget.style.setProperty("--tiltY", "0deg");
    };
    cards.forEach((c) => {
      c.addEventListener("mousemove", onMove);
      c.addEventListener("mouseleave", onLeave);
    });
    return () => {
      cards.forEach((c) => {
        c.removeEventListener("mousemove", onMove);
        c.removeEventListener("mouseleave", onLeave);
      });
    };
  }, []);

  return (
    <main className="pricing-page container py-4">
      {/* HEADER */}
      <header className="pricing-hero glass mb-3">
        <h1 className="fw-bold mb-1">💆 Luxe Salon Pricing</h1>
        <p className="hero-note">{pricingMeta.gstNote}</p>
      </header>

      {/* CONTROLS */}
      <div className="controls-bar mb-4">
        <div className="gender-group">
          {GENDERS.map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={`btn btn-sm ${gender === g ? "btn-dark" : "btn-outline-dark"}`}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="tabs-group">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`btn btn-sm ${filter === t ? "btn-secondary" : "btn-outline-secondary"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* SECTIONS */}
      {filtered.map((section) => (
        <section key={section.title} className="mb-5">
          <h3 className="h5 border-bottom pb-2 mb-3 text-uppercase section-title">
            {section.title}
          </h3>
          <div className="row g-4">
            {section.items
              .filter((it) => (it.prices?.[gender] ?? 0) > 0)
              .map((item) => (
                <div key={item.id} className="col-12 col-md-6 col-lg-4">
                  <div className="card shadow-sm h-100 pricing-card border-0">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 className="card-title mb-1">{item.name}</h5>
                          <p className="text-muted small mb-1">{item.duration}</p>
                        </div>
                        <div className="price-tag fs-6 fw-bold">
                          {format(item.prices[gender])}
                        </div>
                      </div>
                      {item.notes?.length ? (
                        <ul className="small text-muted mt-2 mb-0">
                          {item.notes.map((n, i) => (
                            <li key={i}>{n}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                    <div className="card-footer bg-transparent border-0 pt-0">
                      <NavLink
                        to={`/appointment?service=${encodeURIComponent(item.name)}&gender=${gender}`}
                        className="btn btn-dark w-100"
                      >
                        Book {gender} – {item.name}
                      </NavLink>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      ))}

      {/* ADD-ONS */}
      <section className="mb-5">
        <h3 className="h5 border-bottom pb-2 mb-3 text-uppercase section-title">Add-Ons</h3>
        <div className="row g-4">
          {addons.map((add) => (
            <div key={add.id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm pricing-card">
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">{add.name}</h6>
                    <small className="text-muted">{add.duration}</small>
                  </div>
                  <span className="price-tag fw-bold">{format(add.price)}</span>
                </div>
                <div className="card-footer bg-transparent border-0 pt-0">
                  <NavLink
                    to={`/appointment?service=${encodeURIComponent(add.name)}&gender=${gender}`}
                    className="btn btn-outline-dark w-100"
                  >
                    Add to Booking
                  </NavLink>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COMBO PACKAGES */}
      <section className="mb-5">
        <h3 className="h5 border-bottom pb-2 mb-3 text-uppercase section-title">
          Combo Packages
        </h3>
        <div className="row g-4">
          {packages.map((pkg) => {
            const savings = Math.max(0, Math.round((1 - pkg.comboPrice / pkg.mrp) * 100));
            return (
              <div key={pkg.slug} className="col-12 col-md-6">
                <div className="card border-0 shadow-lg h-100 pricing-card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <h5 className="fw-bold mb-1">{pkg.title}</h5>
                      {savings > 0 && (
                        <span className="badge bg-success">Save {savings}%</span>
                      )}
                    </div>
                    <ul className="small text-muted mt-2 mb-3">
                      {pkg.includes.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                    <div className="d-flex gap-2 align-items-center">
                      <span className="text-muted text-decoration-line-through">
                        {format(pkg.mrp)}
                      </span>
                      <span className="fw-bold fs-6">{format(pkg.comboPrice)}</span>
                    </div>
                    <small className="text-muted d-block mt-1">
                      {pkg.duration} · {pkg.validity}
                    </small>
                  </div>
                  <div className="card-footer bg-transparent border-0 pt-0">
                    <NavLink
                      to={`/appointment?combo=${encodeURIComponent(pkg.slug)}&title=${encodeURIComponent(pkg.title)}`}
                      className="btn btn-primary w-100"
                    >
                      {pkg.ctaLabel || "Book Package"}
                    </NavLink>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
