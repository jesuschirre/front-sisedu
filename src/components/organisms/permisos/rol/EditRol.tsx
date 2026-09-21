import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { Url } from "../../../../url.ts";
import Swal from "sweetalert2";
import { Check } from "lucide-react";
import Modal from "../../../atoms/Modal.tsx";

// Interfaz para el catálogo de permisos
interface PermissionData {
  id: number;
  name: string;
  description: string;
  codigo: string;
}

// Interfaz de los datos del rol que recibiremos desde la tabla
export interface RolData {
  id: number;
  name: string;
  description: string;
  fk_school_id: number;
  permissions: number[];
}

interface EditRolProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  rol: RolData | null;
}

export default function EditRol({ isOpen, onClose, onSuccess, rol }: EditRolProps) {
  const { persona } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPerms, setIsFetchingPerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Estado para el catálogo completo de permisos disponibles
  const [availablePermissions, setAvailablePermissions] = useState<PermissionData[]>([]);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [listPermiss, setListPermiss] = useState<number[]>([]);

  // Obtener el catálogo de permisos al abrir el modal
  useEffect(() => {
    const fetchPermissions = async () => {
      if (!isOpen) return;
      setIsFetchingPerms(true);
      try {
        const response = await axios.get(`${Url}/permission`);
        setAvailablePermissions(response.data.data || response.data);
      } catch (error) {
        console.error("❌ Error al cargar los permisos:", error);
        setErrorMsg("No se pudo cargar el catálogo de permisos.");
      } finally {
        setIsFetchingPerms(false);
      }
    };

    fetchPermissions();
  }, [isOpen]);

  // Pre-cargar los datos del rol seleccionado en el formulario
  useEffect(() => {
    if (rol && isOpen) {
      setFormData({
        name: rol.name || "",
        description: rol.description || "",
      });
      // Pre-cargar los permisos que ya tiene asignados
      setListPermiss(rol.permissions || []);
      setErrorMsg("");
    }
  }, [rol, isOpen]);

  if (!isOpen || !rol) return null;

  // Manejador de inputs de texto
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg("");
  };

  // Manejador para seleccionar/deseleccionar permisos
  const togglePermission = (id: number) => {
    setListPermiss((prev) => 
      prev.includes(id) 
        ? prev.filter((permId) => permId !== id) 
        : [...prev, id]                     
    );
    setErrorMsg("");
  };

  // Enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!persona?.fk_school_id) {
      setErrorMsg("Error de sesión: No se identificó la escuela.");
      return;
    }

    if (listPermiss.length === 0) {
      setErrorMsg("Debes asignar al menos un permiso a este rol.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      // Payload alineado con lo que espera tu backend
      const payload = {
        name: formData.name,
        description: formData.description,
        fk_school_id: persona.fk_school_id,
        listPermiss: listPermiss
      };

      // Hacemos el PUT al ID del rol actual
      await axios.put(`${Url}/rol/${rol.id}`, payload);
      
      onSuccess();
      onClose();
      
      await Swal.fire({
        icon: "success",
        title: "¡ROL ACTUALIZADO!",
        text: "El rol y sus permisos fueron actualizados correctamente.",
        confirmButtonColor: "#7c3aed",
        background: '#15151c',
        color: '#fff'
      });
      
    } catch (error: any) {
      if (error.response?.status === 409) {
        setErrorMsg("Ya existe otro rol con ese nombre en tu escuela.");
      } else if (error.response?.status === 400) {
        setErrorMsg("Faltan datos obligatorios para actualizar el rol.");
      } else if (error.response?.status === 404) {
        setErrorMsg("El rol que intentas editar no fue encontrado.");
      } else {
        setErrorMsg(error.response?.data?.error || "Error de conexión con el servidor.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      onClosea={onClose}
      textHeader="Editar Rol"
      isLoadinga={isLoading || isFetchingPerms}
      onSubmit={handleSubmit}
      submitText="Actualizar Rol"
    >
      <div className="max-h-[65vh] space-y-8 overflow-y-auto p-6">
          
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* --- SECCIÓN DATOS DEL ROL --- */}
          <div className="space-y-5">
            <h3 className="text-xs font-bold text-violet-400/80 uppercase tracking-widest border-b border-gray-800/60 pb-2">
              Información General
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Nombre del Rol *</label>
                <input 
                  required 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="Ej: Administrador, Docente..."
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner placeholder-gray-600" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Descripción (Opcional)</label>
                <input 
                  type="text" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  placeholder="Breve descripción del perfil..."
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner placeholder-gray-600" 
                />
              </div>
            </div>
          </div>

          {/* --- SECCIÓN ASIGNACIÓN DE PERMISOS --- */}
          <div className="space-y-5">
            <div className="flex justify-between items-end border-b border-gray-800/60 pb-2">
              <h3 className="text-xs font-bold text-violet-400/80 uppercase tracking-widest">
                Asignación de Permisos *
              </h3>
              <span className="text-xs text-gray-500 font-medium">
                Seleccionados: <span className="text-violet-400">{listPermiss.length}</span>
              </span>
            </div>
            
            {isFetchingPerms ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
              </div>
            ) : availablePermissions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availablePermissions.map((perm) => {
                  const isSelected = listPermiss.includes(perm.id);
                  return (
                    <div 
                      key={perm.id}
                      onClick={() => togglePermission(perm.id)}
                      className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col gap-1 overflow-hidden group
                        ${isSelected 
                          ? 'bg-violet-600/10 border-violet-500 shadow-[0_0_15px_rgba(124,58,237,0.15)]' 
                          : 'bg-[#0a0a0c] border-gray-800 hover:border-gray-600 hover:bg-[#111116]'
                        }`}
                    >
                      {/* Indicador visual de selección */}
                      <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border flex items-center justify-center transition-colors
                        ${isSelected ? 'bg-violet-500 border-violet-500 text-white' : 'border-gray-600 bg-transparent'}`}>
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>

                      <span className="text-sm font-bold text-white pr-6">{perm.name}</span>
                      <span className="text-xs font-mono text-violet-400/70">{perm.codigo}</span>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {perm.description || "Sin descripción"}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 bg-[#0a0a0c] rounded-xl border border-gray-800 border-dashed">
                No hay permisos disponibles en el catálogo.
              </div>
            )}
          </div>
      </div>
    </Modal>
  );
}