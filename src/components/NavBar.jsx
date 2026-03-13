import { Link, NavLink } from 'react-router-dom'
import ThemeButton from './ThemeButton.jsx'

export default function NavBar() {
  return (
    <nav className='navbar navbar-expand-lg nav-glass position-fixed top-0 w-100' style={{ zIndex: 1300 }}>
      <div className='container nav-shell'>
        <Link className='navbar-brand fw-bold nav-brand' to='/'>Luxe Salon</Link>

        <button className='navbar-toggler' type='button' data-bs-toggle='collapse' data-bs-target='#nav' aria-label='Toggle navigation'>
          <span className='navbar-toggler-icon'></span>
        </button>

        <div id='nav' className='collapse navbar-collapse nav-collapse'>
          <ul className='navbar-nav ms-auto nav-list'>
            <li className="nav-item"><NavLink className="nav-link" to="/">Home</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/gallery">Gallery</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/review">Review</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/pricing">Pricing</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/appointment">Book</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/blog">Blog</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/avatar">Avatar</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/mirror">Mirror</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/games">Games</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/about">About</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/contact">Contact</NavLink></li>
          </ul>
          <div className="nav-theme-wrap">
            <ThemeButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
