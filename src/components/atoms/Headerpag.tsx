interface HeaderpagI {
    text1: string;
    text2: string
}

export default function Headerpag({text1, text2}: HeaderpagI) {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-black uppercase">{text1}</h1>
      <p className="tracking-[0.2em] font-bold text-[11px] text-black uppercase font-mono mt-1">{text2}</p>
    </div>
  )
}
