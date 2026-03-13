export default function FloatingEmojis(){
  // denser grid so they feel “everywhere” but still lightweight
  const items = [
    ['✂️','10%','20%','28px','driftA'], ['💆','22%','12%','30px','driftB'],
    ['🧘','8%','72%','30px','driftC'],  ['💄','60%','70%','26px','driftD'],
    ['👁️','35%','10%','26px','driftB'], ['✨','48%','48%','22px','driftA'],
    ['✂️','80%','24%','24px','driftC'], ['💆','72%','64%','26px','driftB'],
    ['💄','30%','68%','22px','driftA'], ['🧘','18%','42%','26px','driftD'],
  ]
  return (
    <div className="drift-emojis" aria-hidden>
      {items.map((it, i)=>(
        <span key={i} className={`drift ${it[4]}`} style={{ left:it[1], top:it[2], fontSize:it[3] }}>
          {it[0]}
        </span>
      ))}
    </div>
  )
}
