import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { Url } from "../../../../url.ts";
import Swal from "sweetalert2";
import { BookOpen } from "lucide-react";
import Modal from "../../../atoms/Modal.tsx";

// Interfaz para los niveles que listaremos en el select
interface LevelData {
  id: number;
  name: string;
}

// Interfaz del Grado que viene desde la tabla principal
export interface DegreeData {
  id: number;
  name: string;
  fk_levels: number;
  level_name: string;
}

interface EditDegreesProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  degree: DegreeData | null;
}

export default function EditDegrees({ isOpen, onClose, onSuccess, degree }: EditDegreesProps) {
  const { persona } = useAuth();
  
  // Estados para el manejo de carga y errores
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLevels, setIsFetchingLevels] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Estados para el formulario
  const [name, setName] = useState("");
  const [fkLevels, setFkLevels] = useState("");
  const [levels, setLevels] = useState<LevelData[]>([]);

  // Obtener la lista de niveles disponibles
  useEffect(() => {
    const fetchLevels = async () => {
      if (!isOpen || !persona?.fk_school_id) return;
      
      setIsFetchingLevels(true);
      try {
        const response = await axios.get(`${Url}/level?fk_school_id=${persona.fk_school_id}`);
        setLevels(response.data.data || []);
      } catch (error) {
        console.error("❌ Error al cargar los niveles:", error);
        setErrorMsg("No se pudieron cargar los niveles académicos.");
      } finally {
        setIsFetchingLevels(false);
      }
    };

    fetchLevels();
  }, [isOpen, persona?.fk_school_id]);

  // Pre-cargar los datos del grado seleccionado en el formulario
  useEffect(() => {
    if (degree && isOpen) {
      setName(degree.name || "");
      setFkLevels(degree.fk_levels ? degree.fk_levels.toString() : "");
      setErrorMsg("");
    }
  }, [degree, isOpen]);

  if (!isOpen || !degree) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !fkLevels) {
      setErrorMsg("El nombre del grado y el nivel son obligatorios.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const payload = {
        name: name.trim(),
        fk_levels: parseInt(fkLevels),
      };

      await axios.put(`${Url}/degrees/${degree.id}`, payload);
      
      onSuccess();
      onClose();
      
      await Swal.fire({
        icon: "success",
        title: "¡GRADO ACTUALIZADO!",
        text: "La información del grado fue actualizada correctamente.",
        confirmButtonColor: "#7c3aed",
        background: '#15151c',
        color: '#fff'
      });
      
    } catch (error: any) {
      if (error.response?.status === 400) {
        setErrorMsg("Faltan datos obligatorios para actualizar el grado.");
      } else if (error.response?.status === 404) {
        setErrorMsg("El grado que intentas editar no fue encontrado.");
      } else {
        setErrorMsg(error.response?.data?.error || "Error de conexión con el servidor.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal onClosea={onClose} textHeader="Editar Grado" isLoadinga={isLoading || isFetchingLevels} onSubmit={handleSubmit} submitText="Actualizar Grado">
      <div className="space-y-6 p-6">
        
        {/* Header del Modal */}
        <div className="hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/10 rounded-lg border border-violet-500/20">
              <BookOpen className="text-violet-400" size={24} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">Editar Grado</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-violet-400 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <div>
          
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-5">
            {/* Input de Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Nombre del Grado *</label>
              <input 
                required 
                type="text" 
                value={name} 
                onChange={(e) => {
                  setName(e.target.value);
                  setErrorMsg("");
                }} 
                placeholder="Ej: Primer Grado, 1er Año..."
                className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner placeholder-gray-600" 
              />
            </div>

            {/* Select de Nivel */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Nivel Académico *</label>
              <div className="relative">
                <select 
                  required
                  value={fkLevels}
                  onChange={(e) => {
                    setFkLevels(e.target.value);
                    setErrorMsg("");
                  }}
                  disabled={isFetchingLevels}
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner appearance-none disabled:opacity-50 cursor-pointer"
                >
                  <option value="" disabled className="text-gray-500">
                    {isFetchingLevels ? "Cargando niveles..." : "Seleccione un nivel..."}
                  </option>
                  {levels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="hidden">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-400 bg-transparent border border-gray-800 rounded-xl hover:bg-gray-800/50 hover:text-white transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isLoading || isFetchingLevels}
              className="px-6 py-2.5 text-sm font-medium text-white bg-violet-600 rounded-xl hover:bg-violet-500 shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Actualizando...
                </>
              ) : (
                "Actualizar Grado"
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}