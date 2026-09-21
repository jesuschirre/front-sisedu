import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { Url } from "../../../../url.ts";
import Swal from "sweetalert2";
import Modal from "../../../atoms/Modal.tsx";

interface CreateLevelProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateLevel({ isOpen, onClose, onSuccess }: CreateLevelProps) {
  const { persona } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [name, setName] = useState("");

  // Limpiar el formulario al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setName("");
      setErrorMsg("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!persona?.fk_school_id) {
      setErrorMsg("Error de sesión: No se identificó la escuela.");
      return;
    }

    if (!name.trim()) {
      setErrorMsg("El nombre del nivel es obligatorio.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      // El payload que espera el backend según la ruta POST
      const payload = {
        name: name.trim(),
        fk_school_id: persona.fk_school_id,
      };

      await axios.post(`${Url}/level`, payload);
      
      onSuccess();
      onClose();
      
      await Swal.fire({
        icon: "success",
        title: "¡NIVEL CREADO!",
        text: "El nivel académico fue registrado satisfactoriamente.",
        confirmButtonColor: "#7c3aed",
        background: '#15151c',
        color: '#fff'
      });
      
    } catch (error: any) {
      if (error.response?.status === 400) {
        setErrorMsg("Faltan datos obligatorios para crear el nivel.");
      } else {
        setErrorMsg(error.response?.data?.error || "Error de conexión con el servidor.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal onClosea={onClose} textHeader="Crear Nivel" isLoadinga={isLoading} onSubmit={handleSubmit} submitText="Guardar Nivel">
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