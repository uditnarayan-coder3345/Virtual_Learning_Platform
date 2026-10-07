import { AuthProvider } from './context/AuthContext';
import { StudentProvider } from './context/StudentContext';
import { AdminProvider } from './context/AdminContext';
import { InstructorProvider } from './context/InstructorContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return <AuthProvider><StudentProvider><AdminProvider><InstructorProvider><AppRoutes /></InstructorProvider></AdminProvider></StudentProvider></AuthProvider>;
}

export default App;
