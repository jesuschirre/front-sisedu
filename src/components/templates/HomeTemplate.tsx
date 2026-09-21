import Card from "../molecules/Card";
import { Link, useNavigate } from "react-router-dom";
import { 
  Users, 
  BookOpen, 
  FileSignature, 
  BarChartBig, 
  ShieldCheck, 
  Settings,
  LogOut 
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
export default function HomeTemplate() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const modules = [
    {
      title: "Personas",
      description: "Gestión de alumnos, docentes, padres de familia y personal administrativo.",
      icon: Users,
      path: "/people"
    },
    {
      title: "Estructura Académica",
      description: "Configuración de niveles, grados, secciones y currícula educativa.",
      icon: BookOpen,
      path: "/academic"
    },
    {
      title: "Matrículas",
      description: "Proceso de inscripción, traslados y registro de nuevos estudiantes.",
      icon: FileSignature,
      path: "/enrollment"
    },
    {
      title: "Calificaciones y Asistencia",
      description: "Registro de notas, libretas de progreso y control de faltas o tardanzas.",
      icon: BarChartBig,
      path: "/grades"
    },
    {
      title: "Permisos",
      description: "Administración de roles y accesos de seguridad para los usuarios del sistema.",
      icon: ShieldCheck,
      path: "/permissions"
    }
  ];
  const handleLogout = async () => {
      logout();
      navigate("/login")
  }

  // falta incluir "Horarios y Aulas" y "Pagos y Pensiones"
  return (
    
    <div className="p-8 min-h-screen bg-black text-gray-100 font-sans">

      {/* Header*/}
      <div className="mx-auto flex justify-end gap-5 mb-10">
        
        {/* Botón Configuración */}
        <Link 
          to="/configuration" 
          className="flex items-center gap-2 px-5 py-2.5 bg-[#A6FAFF] text-black font-bold border-2 border-white shadow-[4px_4px_0_0_#ffffff] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#ffffff] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          <Settings size={20} strokeWidth={2.5} />
          Configuración
        </Link>

        {/* Botón Cerrar Sesión */}
        <button 
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FF90E8] text-black font-bold border-2 border-white shadow-[4px_4px_0_0_#ffffff] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#ffffff] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          onClick={handleLogout}
        >
          <LogOut size={20} strokeWidth={2.5} />
          Cerrar Sesión
        </button>

      </div>

      {/* Cuadrícula de Módulos */}
      <div className=" mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {modules.map((module, index) => (
          <Link 
            key={index} 
            to={module.path} 
            className="block outline-none  group transition-all duration-300 transform hover:-translate-y-2"
          >
            <div>
              <Card 
                title={module.title}
                description={module.description}
                icon={module.icon}
              />
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}