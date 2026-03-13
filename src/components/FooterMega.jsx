import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function useInstallPrompt(){
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [installed, setInstalled] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [hint, setHint] = useState('Install Luxe Salon for faster access and offline support.')

  useEffect(() => {
    const isStandalone = () =>
      window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone
    if (isStandalone()) setInstalled(true)

    const ios = /iphone|ipad|ipod/i.test(window.navigator.userAgent || '') ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)
    const android = /android/i.test(window.navigator.userAgent || '')
    setIsIos(ios)
    setIsAndroid(android)

    const onBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setDeferredPrompt(event)
      setHint('Install is ready. Tap Install for one-tap access.')
    }
    const onInstalled = () => {
      setInstalled(true)
      setHint('Luxe Salon is installed on this device.')
    }
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isStandalone()) {
        setInstalled(true)
        setHint('Luxe Salon is installed on this device.')
      }
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  const promptInstall = async () => {
    if (installed) return

    if (deferredPrompt) {
      deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      setDeferredPrompt(null)
      if (choice?.outcome === 'accepted') {
        setInstalled(true)
        setHint('Luxe Salon is installed on this device.')
      } else {
        setHint('Install dismissed. You can try again from your browser menu.')
      }
      return
    }

    if (isIos) {
      setHint('On iPhone/iPad: Share -> Add to Home Screen.')
      window.alert('On iPhone/iPad: tap Share and then Add to Home Screen.')
      return
    }

    if (isAndroid) {
      setHint('On Android Chrome: browser menu (...) -> Install app / Add to Home screen.')
      window.alert('On Android Chrome, open browser menu (...) and choose Install app or Add to Home screen.')
      return
    }

    setHint('On desktop Chrome/Edge: open browser menu and choose Install app.')
    window.alert('If no prompt appears, open browser menu and choose Install app.')
  }

  return { installed, hint, isIos, canPrompt: Boolean(deferredPrompt), promptInstall }
}

export default function FooterMega(){
  const install = useInstallPrompt()

  return (
    <footer className="mega-footer">
      <div className="container mf-top-row">
        <section className="mf-cell">
          <h6 className="mf-title">Links</h6>
          <Link to="/">Home</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/contact">Contact</Link>
        </section>

        <section className="mf-cell">
          <h6 className="mf-title">Services</h6>
          <Link to="/services/hairstyle">Hair Care</Link>
          <Link to="/services/skincare">Skin Care</Link>
          <Link to="/services/makeup">Makeup</Link>
          <Link to="/services/eye">Eye Treatment</Link>
        </section>

        <section className="mf-cell">
          <h6 className="mf-title">Contact</h6>
          <a href="tel:+911234567890">+91 12345 67890</a>
          <a href="mailto:hello@luxesalon.example">hello@luxesalon.example</a>
          <span>123 Luxe Street, Chennai</span>
        </section>

        <section className="mf-cell">
          <h6 className="mf-title">Hours</h6>
          <span>Mon-Fri: 10:00 - 20:00</span>
          <span>Sat-Sun: 10:00 - 21:00</span>
        </section>
      </div>

      <div className="container mf-bottom-row">
        <div className="mf-bottom-left">
          <img src="/favicon.ico" alt="Luxe Salon logo" className="mf-logo-mark" />
          <div>
            <div className="mf-brand-name">Luxe Salon</div>
            <div className="mf-brand-copy">Premium care for hair, skin, and style.</div>
          </div>
        </div>

        <div className="mf-bottom-center">
          <span>Bettina Anne Sam</span>
        </div>

        <div className="mf-bottom-right">
          <div className="mf-install-title">Install App</div>
          <div className="mf-install-meta">
            <span className={`mf-install-dot ${install.installed ? 'is-on' : ''}`} aria-hidden="true"></span>
            <span>{install.installed ? 'Installed' : install.canPrompt ? 'Ready to install' : 'Manual install help'}</span>
          </div>
          <button
            type="button"
            className={`btn btn-sm mf-install-btn ${install.installed ? 'is-installed' : ''}`}
            onClick={install.promptInstall}
            disabled={install.installed}
          >
            {install.installed ? 'Installed' : (install.canPrompt ? 'Install Now' : install.isIos ? 'How to Install' : 'Install App')}
          </button>
          <div className="mf-install-hint">{install.hint}</div>
        </div>
      </div>
    </footer>
  )
}
