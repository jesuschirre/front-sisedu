interface ButtonEdProps {
  text: string;
  onClick: () => void;
}

export default function ButtonEd({ text, onClick }: ButtonEdProps) {
  return (
    <button 
      onClick={onClick}
      className="font-mono text-lg font-black flex items-center gap-2 px-5 py-2.5 bg-[#6D28D9] text-black border-2 border-white shadow-[4px_4px_0_0_#ffffff] 
            hover:translate-x-0-5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#ffffff] 
            active:translate-x-1 active:translate-y-1active:shadow-none transition-all"
    >
      {text}
    </button>
  );
}