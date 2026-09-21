import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";

export default function FooterDash() {
    const { persona, usuario } = useAuth();
    
  return (
    <Link 
        to="/configuration" 
        className="block bg-[#A6FAFF] hover:bg-blue-100 group transition-colors duration-150 outline-none w-full"
    >
        <div className="p-5 flex flex-col gap-4">
            
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 border-2 border-white bg-black flex items-center justify-center text-white group-hover:border-black group-hover:text-black transition-colors duration-150">
                    <span className="text-xl font-black uppercase">
                        {usuario?.username ? usuario.username.substring(0, 2).toUpperCase() : "US"}
                    </span>
                </div>
                
                <div className="flex flex-col flex-1 overflow-hidden">
                    <span className="text-black group-hover:text-black text-xl font-black uppercase truncate leading-none">
                        {usuario?.username || "USUARIO"}
                    </span>
                    <span className="text-black group-hover:text-gray-600 font-bold text-xs tracking-widest uppercase mt-1.5 truncate leading-none">
                        ID: {persona?.name || "CARGANDO..."}
                    </span>
                </div>
            </div>

            <div className="bg-[#D4FF00] border-2 border-transparent group-hover:border-black text-black px-3 py-2 flex items-center justify-between">
                <span className="font-black text-sm uppercase tracking-wider">
                    Configuración
                </span>
                <Settings size={18} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
            </div>

        </div>
    </Link>
  )
}