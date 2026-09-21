import axios from "axios";
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { Url } from "../../../../url.ts";
import Swal from "sweetalert2";
import ButtonEd from "../../../atoms/ButtonEd.tsx";
import SearchB from "../../../atoms/SearchB.tsx";
import Headerpag from "../../../atoms/Headerpag.tsx";
import Tabla, { type TableColumn } from "../../../atoms/Tabla.tsx";

// Importamos los modales del personal
import CreateStaffModal from "../../../organisms/personas/staff/CreateStaff.tsx";
import EditStaffModal from "../../../organisms/personas/staff/EditStaff.tsx"; 

export interface StaffData {
  person_id: number;
  name: string;
  dni: string;
  email: string;
  address: string;
  staff_id: number;
  position: string;
}

export default function StaffTemplate() {
  const { persona } = useAuth();
  
  const [staffList, setStaffList] = useState<StaffData[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estados para los modales y la carga
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenEditar, setIsModalOpenEditar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectStaff, setSelectStaff] = useState<StaffData | null>(null);

  // Función para obtener el personal
  const GetStaff = async () => {
    if (!persona?.fk_school_id) return; 

    setIsLoading(true);
    
    try {
      // Usamos el parámetro fk_school_id que espera el backend
      const response = await axios.get(`${Url}/staff?fk_school_id=${persona.fk_school_id}`);
      await new Promise((resolve) => setTimeout(resolve, 200)); 
      setStaffList(response.data.data || response.data); 
    } catch (error) {
       console.error("❌ Error al obtener el personal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    GetStaff();
  }, [persona?.fk_school_id]);

  // Función para eliminar Personal (Envía el person_id para el borrado en cascada)
  const handleDelete = async (personId: number) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Se eliminará toda la información de este miembro del personal permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      background: '#15151c',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${Url}/staff/${personId}`);
        GetStaff();
        await Swal.fire({
          icon: "success",
          title: "¡ELIMINADO!",
          text: "El miembro del personal fue eliminado correctamente.",
          confirmButtonColor: "#7c3aed",
          background: '#15151c',
          color: '#fff'
        });
      } catch (error: any) {
        console.error("❌ Error al eliminar el personal:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.error || "Error al intentar eliminar el personal",
          background: '#15151c',
          color: '#fff'
        });
      }
    }
  };

  // Filtrado Multicampo
  const filteredStaff = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    
    return (staffList || []).filter((staff) => {
      const matchName = (staff.name || "").toLowerCase().includes(lowerSearch);
      const matchDni = (staff.dni || "").toLowerCase().includes(lowerSearch);
      const matchEmail = (staff.email || "").toLowerCase().includes(lowerSearch);
      const matchPosition = (staff.position || "").toLowerCase().includes(lowerSearch);

      return matchName || matchDni || matchEmail || matchPosition; 
    });
  }, [search, staffList]);

  // Paginación
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const paginatedStaff = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStaff.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStaff, currentPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const columns: TableColumn<StaffData>[] = [
    { key: "staff", label: "Personal", render: (staff) => <div><div className="font-black text-black">{staff.name}</div><div className="mt-1 text-xs text-black/60">DNI: {staff.dni}</div></div> },
    { key: "contact", label: "Contacto", render: (staff) => <div><div className="font-bold text-black">{staff.email || "Sin correo"}</div><div className="mt-1 max-w-50 truncate text-xs text-black/60">{staff.address || "Sin dirección"}</div></div> },
    { key: "position", label: "Cargo", render: (staff) => <span className="inline-block border-2 border-black bg-[#a7e8bd] px-2 py-1 text-xs font-black text-black">{staff.position || "Sin cargo"}</span> },
    { key: "actions", label: "Acciones", align: "right", render: (staff) => <div className="flex justify-end gap-2"><button type="button" onClick={() => { setSelectStaff(staff); setIsModalOpenEditar(true); }} className="border-2 border-black bg-[#ffd43b] px-3 py-1 font-black text-black shadow-[2px_2px_0_0_#111111] hover:shadow-none">Editar</button><button type="button" onClick={() => handleDelete(staff.person_id)} className="border-2 border-black bg-[#ff6b6b] px-3 py-1 font-black text-black shadow-[2px_2px_0_0_#111111] hover:shadow-none">Eliminar</button></div> },
  ];

  return (
    <div className="p-6 text-gray-100 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header y Acciones */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Headerpag text1="Gestión de Personal" text2="Administra el personal administrativo y de apoyo." />
          <ButtonEd onClick={() => setIsModalOpen(true)} text="+ Registrar Personal" />
        </div>

        {/* Barra de Búsqueda */}
        <SearchB text="BUSCAR POR NOMBRE, DNI, CARGO O EMAIL..." search={search} handleSearch={handleSearch} />
        {false && (<>
        <div className="relative w-full md:w-2/3 lg:w-1/2">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Busca por nombre, DNI, cargo o email..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-12 pr-4 py-3 bg-[#15151c] border border-gray-800 rounded-full focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all text-white placeholder-gray-500 shadow-inner"
          />
        </div>
        </>)}
        <Tabla columns={columns} data={paginatedStaff} rowKey={(staff) => staff.staff_id} isLoading={isLoading} emptyMessage="No se encontró personal registrado" currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        {false && (<>
        {/* Contenedor de la Tabla */}
        <div className="bg-[#15151c] border border-gray-800/60 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 uppercase bg-[#1a1a24] border-b border-gray-800">
                <tr>
                  <th className="px-6 py-5 font-semibold tracking-wider">Personal</th>
                  <th className="px-6 py-5 font-semibold tracking-wider">Contacto</th>
                  <th className="px-6 py-5 font-semibold tracking-wider">Cargo</th>
                  <th className="px-6 py-5 font-semibold tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="animate-pulse">
                      <td className="px-6 py-5 space-y-2">
                        <div className="h-4 bg-gray-800 rounded w-36"></div>
                        <div className="h-3 bg-gray-800 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-5 space-y-2">
                        <div className="h-4 bg-gray-800 rounded w-40"></div>
                        <div className="h-3 bg-gray-800 rounded w-32"></div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-6 bg-gray-800 rounded-full w-28"></div>
                      </td>
                      <td className="px-6 py-5 flex justify-end space-x-4 pt-7">
                        <div className="h-4 bg-gray-800 rounded w-10"></div>
                        <div className="h-4 bg-gray-800 rounded w-12"></div>
                      </td>
                    </tr>
                  ))
                ) : paginatedStaff.length > 0 ? (
                  paginatedStaff.map((staff) => (
                    <tr key={staff.staff_id} className="hover:bg-[#1c1c26] transition-colors group">
                      <td className="px-6 py-5">
                        <div className="font-semibold text-white">{staff.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">DNI: {staff.dni}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-medium text-gray-300">{staff.email || "Sin correo"}</div>
                        <div className="text-xs text-gray-500 mt-0.5 truncate 200px">{staff.address || "Sin dirección"}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full text-xs font-semibold tracking-wide">
                          {staff.position}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right space-x-4">
                        <button
                          onClick={() => { setSelectStaff(staff); setIsModalOpenEditar(true); }}  
                          className="text-violet-400 hover:text-violet-300 font-medium transition-colors opacity-80 hover:opacity-100"
                        >
                          Editar
                        </button>
                        <button 
                          /* Usamos person_id para borrar en cascada desde la tabla people */
                          onClick={() => handleDelete(staff.person_id)}
                          className="text-red-400 hover:text-red-300 font-medium transition-colors opacity-80 hover:opacity-100"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-14 h-14 mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <p className="text-lg">No se encontró personal registrado</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginación */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-between items-center px-2 text-sm text-gray-400">
            <div>
              Mostrando página <span className="font-semibold text-white">{currentPage}</span> de <span className="font-semibold text-white">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-5 py-2.5 bg-[#15151c] border border-gray-800 rounded-full hover:bg-[#1a1a24] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-300"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-5 py-2.5 bg-[#15151c] border border-gray-800 rounded-full hover:bg-[#1a1a24] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-300"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        </>
        )}

        {/* Modales */}
        <CreateStaffModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={GetStaff} 
        />
        <EditStaffModal
          isOpen={isModalOpenEditar}
          onClose={() => setIsModalOpenEditar(false)}
          onSuccess={GetStaff}
          staff={selectStaff}
        />
      </div>
    </div>
  );
}