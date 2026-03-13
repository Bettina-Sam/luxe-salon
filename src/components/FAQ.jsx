export default function FAQ({ items, idBase='faq' }){
  return (
    <div className='accordion' id={idBase}>
      {items.map((it, idx) => (
        <div className='accordion-item' key={idx}>
          <h2 className='accordion-header' id={idBase+'h'+idx}>
            <button className={'accordion-button ' + (idx===0?'':'collapsed')} type='button' data-bs-toggle='collapse' data-bs-target={'#'+idBase+'c'+idx}>
              {it.q}
            </button>
          </h2>
          <div id={idBase+'c'+idx} className={'accordion-collapse collapse ' + (idx===0?'show':'')} data-bs-parent={'#'+idBase}>
            <div className='accordion-body'>{it.a}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
