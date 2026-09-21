import { NavLink, Outlet } from "react-router-dom";
import FooterDash from "../atoms/FooterDash";
import HeaderDash from "../atoms/HeaderDash";
import {type ItemsArray } from "../../routes/Interfaces";
interface itemsInter {
  navItems: ItemsArray[]
  ruta: string
}
export default function DashBoard({navItems, ruta}: itemsInter) {
  return (
    <div className="flex h-screen bg-black text-gray-100 font-mono">
      <aside className="w-72 bg-black flex flex-col z-10  border-white">
            <div className="px-4 py-6 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col">
                <HeaderDash/>
            </div>

            <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar flex flex-col">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === ruta}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-6 py-4 border-2 border-white -mt-0.5 first:mt-0 transition-colors duration-150 outline-none ${
                                    isActive 
                                    ? "bg-[#6D28D9] text-white relative z-10" 
                                    : "bg-black text-white hover:bg-zinc-900 relative z-0"
                                }`
                            }
                        >
                            {() => (
                                <>
                                    <Icon 
                                        size={22} 
                                        strokeWidth={2} 
                                    />
                                    <span className="text-lg font-black tracking-wider uppercase">
                                      {item.name}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            
            </nav>
            



            <div className="px-4 py-6 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col">
                <FooterDash/>
            </div>
      </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#CCCCCC] border-l-0 border-16 border-black">
                <Outlet />
            </main>
        </div>
    </div>
  )
}
