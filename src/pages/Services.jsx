// src/pages/Services.jsx
import { Link } from 'react-router-dom'

const services = [
  { slug: 'haircut', title: 'Haircut + Styling', blurb: 'Precision cuts & finish' },
  { slug: 'hydra-glow', title: 'Hydra Glow Facial', blurb: 'Event-safe glow' },
  { slug: 'bridal-makeup', title: 'Bridal Makeup (HD)', blurb: 'Trials + day-of' },
]

export default function Services(){
  return (
    <main className="container py-4">
      <h1 className="mb-3">Services</h1>
      <div className="row g-3">
        {services.map(s=>(
          <div key={s.slug} className="col-12 col-md-6 col-lg-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{s.title}</h5>
                <p className="card-text text-muted">{s.blurb}</p>
                <Link className="btn btn-dark" to={`/services/${s.slug}`}>View</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
