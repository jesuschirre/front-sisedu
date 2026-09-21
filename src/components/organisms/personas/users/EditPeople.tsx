import { useState, useEffect } from "react";
import axios from "axios";
import { Url } from "../../../../url.ts";
import { useAuth } from "../../../../context/AuthContext.tsx";
import Swal from "sweetalert2";
import Modal from "../../../atoms/Modal.tsx";

// Interfaz para el usuario que recibiremos desde la tabla
interface UserData {
  user_id: number;
  person_id: number;
  username: string;
  name: string;
  dni: string;
  email: string;
  state: string;
  address: string;
  role_name: string;
}

// Interfaz basada en la estructura de tu base de datos
interface Role {
  id: number;
  name: string;
  description?: string;
  fk_school_id?: number;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: UserData | null;
}

export default function EditUserModal({ isOpen, onClose, onSuccess, user }: EditUserModalProps) {
  const { persona } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [roles, setRoles] = useState<Role[]>([]); 
  
  const [formData, setFormData] = useState({
    name: "",
    dni: "",
    email: "",
    address: "",
    username: "",
    password: "",
    state: "activo",
    fk_rol: "", 
  });

  // Obtener los roles
  const rolesGet = async () => {
    if (!persona?.fk_school_id) return;

    try {
        const res = await axios.get(`${Url}/rol?fk_school_id=${persona.fk_school_id}`);
        setRoles(res.data.data); 
    } catch (error) {
        console.error("❌ Error al cargar los roles:", error);
    }
  };

  // Se ejecuta el componente
  useEffect(() => {
    rolesGet();
  }, [persona?.fk_school_id]);

  // Llenar el formulario cuando se abre el modal, cambia el usuario o terminan de cargar los roles
  useEffect(() => {
    if (user && roles.length > 0) {
      const selectedRole = roles.find((r) => r.name === user.role_name);
      const roleId = selectedRole ? selectedRole.id.toString() : "";

      setFormData({
        name: user.name || "",
        dni: user.dni || "",
        email: user.email || "",
        address: user.address || "",
        username: user.username || "",
        password: "",
        state: user.state || "activo",
        fk_rol: roleId,
      });
      setErrorMsg(""); 
    }
  }, [user, isOpen, roles]);

  if (!isOpen || !user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg("");
  };
  // funcion para editar el usuario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const dataToSend: any = {
        name: formData.name,
        dni: formData.dni,
        email: formData.email,
        address: formData.address,
        username: formData.username,
        state: formData.state,
      };

      if (formData.password.trim() !== "") {
        dataToSend.password = formData.password;
      }

      if (formData.fk_rol !== "") {
        dataToSend.fk_rol = Number(formData.fk_rol);
      }

      if (dataToSend.dni.length != 8 || /^[a-zA-Z]+$/.test(dataToSend.dni)) {
        setErrorMsg("El DNI debe ser de 8 caracteres y debe ser solo numeros");
        return;
      }
      await axios.put(`${Url}/users/${user.user_id}`, dataToSend);

      onSuccess();
      onClose();
      await Swal.fire({
        icon: "success",
        title: "ACTUALIZADO",
        text: "El usuario fue actualizado Satisfactoriamente",
        confirmButtonColor: "#000000",
      })
    } catch (error: any) {
      if (error.response?.status === 409) {
        setErrorMsg("El DNI o el nombre de usuario ya se encuentran registrados por otra persona.");
      } else if (error.response?.status === 400) {
        setErrorMsg("Faltan datos obligatorios (Nombre, DNI o Usuario).");
      } else if (error.response?.status === 404) {
        setErrorMsg("Usuario no encontrado en el sistema.");
      } else {
        setErrorMsg(error.response?.data?.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal onClosea={onClose} textHeader="Editar Usuario" isLoadinga={isLoading} onSubmit={handleSubmit} submitText="Actualizar Usuario">
        <div className="p-6 space-y-6">
          
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* SECCIÓN DATOS PERSONALES */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-violet-400/80 uppercase tracking-widest border-b border-gray-800/60 pb-2 mb-4">
                Datos Personales
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Nombre Completo *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner placeholder-gray-600" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">DNI *</label>
                <input required type="text" name="dni" value={formData.dni} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner placeholder-gray-600" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner placeholder-gray-600" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Dirección</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner placeholder-gray-600" />
              </div>
            </div>

            {/* SECCIÓN DATOS DE USUARIO */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-violet-400/80 uppercase tracking-widest border-b border-gray-800/60 pb-2 mb-4">
                Datos de Acceso
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Usuario *</label>
                <input required type="text" name="username" value={formData.username} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner placeholder-gray-600" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Nueva Contraseña <span className="text-xs text-gray-500 font-normal">(Opcional)</span>
                </label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} 
                  placeholder="Dejar en blanco para mantener"
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner placeholder-gray-600/60" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Rol</label>
                <select name="fk_rol" value={formData.fk_rol} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner">
                  <option value="" disabled className="text-gray-500">Seleccione un rol...</option>
                  
                  {roles.map((rol) => (
                    <option key={rol.id} value={rol.id}>
                      {rol.name}
                    </option>
                  ))}

                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Estado</label>
                <select name="state" value={formData.state} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-[#0a0a0c] border border-gray-800 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none text-white transition-all shadow-inner">
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="bloqueado">Bloqueado</option>
                </select>
              </div>
            </div>
          </div>

        </div>
    </Modal>
  );
}