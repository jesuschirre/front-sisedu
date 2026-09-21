import axios from "axios";
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext.tsx";
import { Url } from "../../../../url.ts";
import CreateUserModal from "../../../organisms/personas/users/createPeople.tsx";
import EditUserModal from "../../../organisms/personas/users/EditPeople.tsx";
import Swal from "sweetalert2";
import ButtonEd from "../../../atoms/ButtonEd.tsx";
import SearchB from "../../../atoms/SearchB.tsx";
import Headerpag from "../../../atoms/Headerpag.tsx";
import Tabla, { type TableColumn } from "../../../atoms/Tabla.tsx";

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

export default function UsersTemplate() {
  const { persona } = useAuth();
  const [usuarios, setUsuarios] = useState<UserData[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenEditar, setIsModalOpenEditar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectUser, setSelectUser] = useState<UserData | null>(null);

  const GetUsers = async () => {
    if (!persona?.fk_school_id) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`${Url}/users?idSchool=${persona.fk_school_id}`);
      await new Promise((resolve) => setTimeout(resolve, 200));
      setUsuarios(response.data);
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    GetUsers();
  }, [persona?.fk_school_id]);

  const handleDelete = async (userId: number) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el usuario permanentemente",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${Url}/users/${userId}`);
      await GetUsers();
      await Swal.fire({ icon: "success", title: "¡ELIMINADO!", text: "El usuario fue eliminado correctamente.", confirmButtonColor: "#000000" });
    } catch (error: any) {
      console.error("Error al eliminar el usuario:", error);
      await Swal.fire({ icon: "error", title: "Error al eliminar el usuario", text: error.message });
    }
  };

  const filteredUsers = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return usuarios.filter((user) => [user.name, user.dni, user.email, user.username, user.role_name].some((value) => (value || "").toLowerCase().includes(lowerSearch)));
  }, [search, usuarios]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const columns: TableColumn<UserData>[] = [
    {
      key: "user",
      label: "Usuario",
      render: (user) => <div><div className="font-black text-black">{user.username}</div><div className="mt-1 text-xs text-black/60">{user.email}</div></div>,
    },
    {
      key: "personal-data",
      label: "Datos personales",
      render: (user) => <div><div className="font-bold text-black">{user.name}</div><div className="mt-1 text-xs text-black/60">DNI: {user.dni}</div></div>,
    },
    {
      key: "role",
      label: "Rol",
      render: (user) => <span className="inline-block border-2 border-black bg-[#a7e8bd] px-2 py-1 text-xs font-black text-black">{user.role_name || "Sin rol"}</span>,
    },
    {
      key: "state",
      label: "Estado",
      render: (user) => <span className="inline-block border-2 border-black bg-[#b8d8ff] px-2 py-1 text-xs font-black text-black">{user.state}</span>,
    },
    {
      key: "actions",
      label: "Acciones",
      align: "right",
      render: (user) => <div className="flex justify-end gap-2">
        <button type="button" onClick={() => { setSelectUser(user); setIsModalOpenEditar(true); }} className="border-2 border-black bg-[#ffd43b] px-3 py-1 font-black text-black shadow-[2px_2px_0_0_#111111] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">Editar</button>
        <button type="button" onClick={() => handleDelete(user.person_id)} className="border-2 border-black bg-[#ff6b6b] px-3 py-1 font-black text-black shadow-[2px_2px_0_0_#111111] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">Eliminar</button>
      </div>,
    },
  ];

  return (
    <div className="p-6 text-gray-100 font-sans">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <Headerpag text1="Gestión de Usuarios" text2="Administra los accesos y datos del personal de tu plataforma." />
          <ButtonEd onClick={() => setIsModalOpen(true)} text="+ Crear Usuario" />
        </div>
        <SearchB text="BUSCAR POR NOMBRE, ROL, DNI..." search={search} handleSearch={handleSearch} />
        <Tabla columns={columns} data={paginatedUsers} rowKey={(user) => user.user_id} isLoading={isLoading} emptyMessage="No se encontraron usuarios" currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        <CreateUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={GetUsers} />
        <EditUserModal isOpen={isModalOpenEditar} onClose={() => setIsModalOpenEditar(false)} onSuccess={GetUsers} user={selectUser} />
      </div>
    </div>
  );
}
