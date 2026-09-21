import { useState, useEffect } from "react";
import axios from "axios";
import { Url } from "../../../../url.ts";
import Swal from "sweetalert2";
import Modal from "../../../atoms/Modal.tsx";

// Interfaz para los datos del nivel
export interface LevelData {
  id: number;
  name: string;
}

interface EditLevelProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  level: LevelData | null;
}

export default function EditLevel({ isOpen, onClose, onSuccess, level }: EditLevelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [name, setName] = useState("");

  // Pre-cargar los datos del nivel seleccionado al abrir el modal
  useEffect(() => {
    if (level && isOpen) {
      setName(level.name || "");
      setErrorMsg("");
    }
  }, [level, isOpen]);

  if (!isOpen || !level) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMsg("El nombre del nivel es obligatorio.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      // El payload solo requiere el nombre, el id va en la URL según tu backend
      const payload = {
        name: name.trim(),
      };

      await axios.put(`${Url}/level/${level.id}`, payload);
      
      onSuccess();
      onClose();
      
      await Swal.fire({
        icon: "success",
        title: "¡NIVEL ACTUALIZADO!",
        text: "El nivel académico fue actualizado correctamente.",
        confirmButtonColor: "#7c3aed",
        background: '#15151c',
        color: '#fff'
      });
      
    } catch (error: any) {
      if (error.response?.status === 400) {
        setErrorMsg("El nombre del nivel es obligatorio.");
      } else if (error.response?.status === 404) {
        setErrorMsg("El nivel que intentas editar no fue encontrado.");
      } else {
        setErrorMsg(error.response?.data?.error || "Error de conexión con el servidor.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal onClosea={onClose} textHeader="Editar Nivel" isLoadinga={isLoading} onSubmit={handleSubmit} submitText="Actualizar Nivel">
      <div className="space-y-6 p-6">
          
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Nombre del Nivel *</label>
              <input 
                required 
                type="text" 
                value={name} 
                onChange={(e) => {
                  setName(e.target.value);
                  setErrorMsg("");
                }} 
                placeholder="Ej: Educación Primaria, Secundaria..."
                className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner placeholder-gray-600" 
              />
            </div>
          </div>

      </div>
    </Modal>
  );
}