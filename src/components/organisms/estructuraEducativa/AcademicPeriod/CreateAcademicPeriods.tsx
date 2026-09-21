import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { Url } from "../../../../url.ts";
import Swal from "sweetalert2";
import Modal from "../../../atoms/Modal.tsx";

interface CreateAcademicPeriodsProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateAcademicPeriods({ isOpen, onClose, onSuccess }: CreateAcademicPeriodsProps) {
  const { persona } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Estado inicial del formulario
  const [formData, setFormData] = useState({
    name: "",
    start_date: "",
    end_date: "",
    status: "Activo",
    year: new Date().getFullYear(),
  });

  // Limpiar el formulario al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        start_date: "",
        end_date: "",
        status: "Activo",
        year: new Date().getFullYear(),
      });
      setErrorMsg("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Manejador de cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "year" ? parseInt(value) || "" : value,
    }));
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!persona?.fk_school_id) {
      setErrorMsg("Error de sesión: No se identificó la escuela.");
      return;
    }

    if (!formData.name.trim() || !formData.start_date || !formData.end_date || !formData.year) {
      setErrorMsg("Todos los campos principales son obligatorios.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      // Payload que se enviará al backend
      const payload = {
        name: formData.name.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
        year: Number(formData.year),
        fk_school_id: persona.fk_school_id,
      };

      // Ajusta la ruta base según tu backend (ej. /academic-periods)
      await axios.post(`${Url}/periodos`, payload);
      
      onSuccess();
      onClose();
      
      await Swal.fire({
        icon: "success",
        title: "¡PERIODO CREADO!",
        text: "El periodo académico fue registrado correctamente.",
        confirmButtonColor: "#7c3aed",
        background: '#15151c',
        color: '#fff'
      });
      
    } catch (error: any) {
      if (error.response?.status === 400) {
        setErrorMsg("Faltan datos obligatorios o el formato es incorrecto.");
      } else {
        setErrorMsg(error.response?.data?.error || "Error de conexión con el servidor.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal onClosea={onClose} textHeader="Crear Periodo Académico" isLoadinga={isLoading} onSubmit={handleSubmit} submitText="Guardar Periodo">
      <div className="space-y-5 p-6">
        
          
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Nombre del Periodo */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Nombre del Periodo *</label>
            <input 
              required 
              type="text" 
              name="name"
              value={formData.name} 
              onChange={handleChange} 
              placeholder="Ej: Año Escolar 2026, Semestre I..."
              className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner placeholder-gray-600" 
            />
          </div>

          {/* Fechas: Inicio y Fin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Fecha de Inicio *</label>
              <input 
                required 
                type="date" 
                name="start_date"
                value={formData.start_date} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner scheme-dark" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Fecha de Fin *</label>
              <input 
                required 
                type="date" 
                name="end_date"
                value={formData.end_date} 
                onChange={handleChange} 
                className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner scheme-dark" 
              />
            </div>
          </div>

          {/* Año y Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Año *</label>
              <input 
                required 
                type="number" 
                name="year"
                value={formData.year} 
                onChange={handleChange} 
                placeholder="Ej: 2026"
                className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner placeholder-gray-600" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Estado</label>
              <select 
                name="status"
                value={formData.status} 
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner cursor-pointer"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Cerrado">Cerrado</option>
              </select>
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
              disabled={isLoading}
              className="px-6 py-2.5 text-sm font-medium text-white bg-violet-600 rounded-xl hover:bg-violet-500 shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                "Guardar Periodo"
              )}
            </button>
          </div>
        </div>
    </Modal>
  );
}