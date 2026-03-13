export default function Stars({ value=3 }){
  const full = Math.max(0, Math.min(5, value|0))
  return (
    <div aria-label={`${full} star rating`} role="img" style={{letterSpacing:'2px', fontSize:'18px'}}>
      {'★'.repeat(full)}{'☆'.repeat(5-full)}
    </div>
  )
}
