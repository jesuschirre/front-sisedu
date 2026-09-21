import { Link } from "react-router-dom";

export default function HeaderDash() {
  return (

    <Link 
      to="/" 
      className="p-5 flex flex-col justify-center bg-[#D4FF00] hover:bg-amber-200 focus:bg-amber-200 outline-none transition-colors duration-150 cursor-pointer"
    >
        <div className="flex items-center gap-3">
            <span className="text-black font-sans text-4xl font-black uppercase truncate block w-full">
                EDUSIS+
            </span>
        </div>

        <div className="mt-1.5">
            <span className="text-black font-bold text-[13px] uppercase truncate block w-full">
                Gestión.Académica.Total.
            </span>
        </div>
    </Link>
  );
}