export default function WhatsAppButton({ phone="+911234567890" }){
  const href = `https://wa.me/${phone.replace(/\D/g,'')}`
  return (
    <a className="wa-fab" href={href} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
        <path d="M20.5 3.5A11 11 0 0 0 3.2 17.8L2 22l4.3-1.1A11 11 0 1 0 20.5 3.5Zm-8.4 16.2a9 9 0 0 1-4.6-1.3l-.3-.2-2.7.7.7-2.6-.2-.3a9 9 0 1 1 7.1 3.7Zm5-6.7c-.3-.2-1.7-.9-2-1-.3-.1-.5-.2-.7.2-.2.3-.9 1-.9 1.1s-.2.3-.5.1a7.3 7.3 0 0 1-2.2-1.4 8 8 0 0 1-1.5-1.9c-.2-.4 0-.6.1-.8l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.7-1.9c-.2-.5-.5-.4-.7-.4h-.6c-.2 0-.5 0-.7.3a3 3 0 0 0-1 2.1c0 1.2.8 2.3.9 2.4.1.2 1.7 2.7 4 3.8.6.3 1 .5 1.4.6.6.2 1.2.2 1.6.1.5-.1 1.7-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.4Z"/>
      </svg>
    </a>
  )
}
