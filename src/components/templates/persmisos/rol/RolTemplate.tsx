import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import { Url } from "../../../../url";
import ButtonEd from "../../../atoms/ButtonEd";
import Headerpag from "../../../atoms/Headerpag";
import SearchB from "../../../atoms/SearchB";
import Tabla, { type TableColumn } from "../../../atoms/Tabla";
import CreateRol from "../../../organisms/permisos/rol/CreateRol";
import EditRol from "../../../organisms/permisos/rol/EditRol";

export interface RolData {
  id: number;
  name: string;
  description: string;
  fk_school_id: number;
  permissions: number[];
}

export default function RolTemplate() {
  const { persona } = useAuth();
  const [roles, setRoles] = useState<RolData[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRol, setSelectedRol] = useState<RolData | null>(null);
  const itemsPerPage = 10;

  const getRoles = useCallback(async () => {
    if (!persona?.fk_school_id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.get(`${Url}/rol?fk_school_id=${persona.fk_school_id}`);
      setRoles(response.data?.data || response.data || []);
    } catch (error) {
      console.error("Error al obtener los roles:", error);
    } finally {
      setIsLoading(false);
    }
  }, [persona?.fk_school_id]);

  useEffect(() => {
    getRoles();
  }, [getRoles]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "¿Eliminar rol?",
      text: "El rol y sus permisos asignados serán eliminados permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${Url}/rol/${id}`);
      await getRoles();
      await Swal.fire({ icon: "success", title: "¡ROL ELIMINADO!", text: "El rol fue eliminado correctamente.", confirmButtonColor: "#000000" });
    } catch (error: any) {
      await Swal.fire({ icon: "error", title: "Error al eliminar", text: error.response?.data?.error || "No se pudo eliminar el rol." });
    }
  };

  const filteredRoles = useMemo(() => {
    const query = search.toLowerCase();
    return roles.filter((role) => [role.name, role.description].some((value) => (value || "").toLowerCase().includes(query)));
  }, [roles, search]);

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const paginatedRoles = useMemo(() => filteredRoles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [currentPage, filteredRoles]);

  const columns: TableColumn<RolData>[] = [
    {
      key: "role",
      label: "Rol de sistema",
      render: (role) => <div className="flex items-center gap-3"><div className="border-2 border-black bg-[#b8d8ff] p-2"><ShieldCheck size={18} /></div><div><div className="font-black text-black">{role.name}</div><div className="mt-1 max-w-md text-xs text-black/60">{role.description || "Sin descripción asignada"}</div></div></div>,
    },
    {
      key: "permissions",
      label: "Permisos asignados",
      render: (role) => <span className="inline-block border-2 border-black bg-[#a7e8bd] px-2 py-1 text-xs font-black text-black">{role.permissions?.length || 0} permisos</span>,
    },
    {
      key: "actions",
      label: "Acciones",
      align: "right",
      render: (role) => <div className="flex justify-end gap-2"><button type="button" onClick={() => { setSelectedRol(role); setIsEditOpen(true); }} className="border-2 border-black bg-[#ffd43b] px-3 py-1 font-black text-black shadow-[2px_2px_0_0_#111111] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">Editar</button><button type="button" onClick={() => handleDelete(role.id)} className="border-2 border-black bg-[#ff6b6b] px-3 py-1 font-black text-black shadow-[2px_2px_0_0_#111111] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">Eliminar</button></div>,
    },
  ];

  return <div className="min-h-full bg-[#d6d2c4] p-6 font-sans text-black"><div className="mx-auto max-w-7xl space-y-8">
    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center"><Headerpag text1="Gestión de Roles" text2="Administra los perfiles y permisos de acceso del sistema." /><ButtonEd text="+ Crear Rol" onClick={() => setIsCreateOpen(true)} /></div>
    <SearchB text="BUSCAR POR NOMBRE O DESCRIPCIÓN..." search={search} handleSearch={(event) => { setSearch(event.target.value); setCurrentPage(1); }} />
    <Tabla columns={columns} data={paginatedRoles} rowKey={(role) => role.id} isLoading={isLoading} emptyMessage="No se encontraron roles registrados" currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    <CreateRol isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={getRoles} />
    <EditRol isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onSuccess={getRoles} rol={selectedRol} />
  </div></div>;
}
