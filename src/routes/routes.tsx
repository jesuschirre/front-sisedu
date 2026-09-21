import { Routes, Route } from "react-router-dom";

import Login from "../pages/login";
import DashboardLayoutPEr from "../components/templates/personas/DashboardLayoutPer";
import Home from "../pages/Home";
import HomePer from "../components/templates/personas/HomePer";
import Users from "../pages/personas/users";
import Students from "../pages/students/students";
import Teacher from "../pages/teachers/teachers";
import Parent from "../pages/parents/Parent";
import Staff from "../pages/staff/Staff";
import DashboardLayoutCon from "../components/templates/configuracion/DashboardLayoutCon";
import DashboardLayoutPermi from "../components/templates/persmisos/DashBoardPersmisos";
import HomePermi from "../components/templates/persmisos/HomePermi";
import Roles from "../pages/rol/Roles";
import DashboardEstructuraEdu from "../components/templates/EstructuraEducativa/DashboardEstructuraEdu";
import HomeEstructuraEdu from "../components/templates/EstructuraEducativa/HomeEstructuraEdu";
import Levels from "../pages/levels/Levels";
import Degrees from "../pages/degrees/Degrees";
import AcademicPeriods from "../pages/periodoAcademico/AcademicPeriods";
import Curses from "../pages/curses/Curses";
import DashMatri from "../components/templates/matriculas/DashMatri";
import HomeMatri from "../components/templates/matriculas/HomeMatri";
import Matricula from "../pages/matricula/Matricula";
import DashCalAsis from "../components/templates/calificacionesAsistencias/DashCalAsis";
import HomeCaAsi from "../components/templates/calificacionesAsistencias/HomeCaAsi";
import Asistencias from "../pages/asistencias/Asistencias";
import Calificaciones from "../pages/calificaciones/Calificaciones";
import ProtectedRoute from "../hooks/protectRoute";

export default function Routers() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
      <Route path="/" element={<Home/>} />
      
      <Route path="/people" element={<DashboardLayoutPEr />}>
          <Route index element={<HomePer/>} />
          <Route path="/people/user" element= {<Users/>}/>
          <Route path="/people/student" element= {<Students/>} />
          <Route path="/people/teacher" element= {<Teacher/>} />
          <Route path="/people/parents" element= {<Parent/>} />
          <Route path="/people/staff" element= {<Staff/>} />
      </Route>
      
      <Route path="/configuration" element={<DashboardLayoutCon/>}>
          
      </Route>
      
      <Route path="/permissions" element={<DashboardLayoutPermi/>}>
          <Route index element={<HomePermi/>}/>
          <Route path="/permissions/rol" element={<Roles/>}/>
      </Route>

      <Route path="/academic" element={<DashboardEstructuraEdu/>}>
          <Route index element={<HomeEstructuraEdu/>}/>
          <Route path="/academic/level" element={<Levels/>}/>
          <Route path="/academic/degrees" element={<Degrees/>}/>
          <Route path= "/academic/academicperiod" element={<AcademicPeriods/>}/>
          <Route path= "/academic/curses" element={<Curses/>}/>
      </Route>
      
      <Route path="/enrollment" element={<DashMatri/>}>
          <Route index element={<HomeMatri/>}/>
          <Route path="/enrollment/matricula" element={<Matricula/>}/>
      </Route>

      <Route path="/grades" element={<DashCalAsis/>}>
          <Route index element={<HomeCaAsi/>}/>
          <Route path="/grades/asistencia" element={<Asistencias/>}/>
          <Route path="/grades/calificacion" element={<Calificaciones/>}/>
      </Route>
      </Route>

    </Routes>
  );
}