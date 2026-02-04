import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { 
  Cake, 
  Star, 
  MapPin, 
  Instagram, 
  Phone, 
  Lock, 
  Plus, 
  Trash2, 
  X,
  Menu,
  ChefHat,
  Users,
  Weight,
  LogOut,
  LogIn
} from 'lucide-react';

/* ===================================================================
  CONFIGURACIÓN DE YOHANA CAKE
  Conectado a tu proyecto: yohana-cake
  ===================================================================
*/
const firebaseConfig = {
  apiKey: "AIzaSyBxodpLmC6GblnNKLCFP1i8v65-_lPvd9g",
  authDomain: "yohana-cake.firebaseapp.com",
  projectId: "yohana-cake",
  storageBucket: "yohana-cake.firebasestorage.app",
  messagingSenderId: "78081226185",
  appId: "1:78081226185:web:b9221b77657574344f6418",
  measurementId: "G-EWH6JLEN6Y"
};

// Inicializar Firebase con tu configuración
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
  const [user, setUser] = useState(null);
  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el Login y Admin
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Estado para el formulario de nuevo pastel
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    servings: '',
    weight: '',
    imageUrl: ''
  });

  // 1. Escuchar estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      // Si el usuario se loguea, cerrar modal
      if (currentUser) setShowLoginModal(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Cargar Datos de Firestore (Colección 'cakes')
  useEffect(() => {
    // Nota: Asegúrate de que en Firestore Console las reglas permitan lectura
    const q = query(collection(db, 'cakes'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cakesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCakes(cakesData);
    }, (error) => {
      console.error("Error leyendo pasteles:", error);
      // Si falla por falta de índice o permisos, mostramos array vacío
    });

    return () => unsubscribe();
  }, []);

  // --- FUNCIONES DE AUTH ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error("Error login:", error);
      setLoginError("Credenciales incorrectas o error de conexión.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // --- FUNCIONES DE BASE DE DATOS ---
  const handleAddCake = async (e) => {
    e.preventDefault();
    if (!user) return alert("Debes iniciar sesión.");
    if (!newItem.name || !newItem.price) return;

    try {
      await addDoc(collection(db, 'cakes'), {
        ...newItem,
        price: parseFloat(newItem.price),
        createdAt: serverTimestamp(),
        createdBy: user.uid // Opcional: guardar quién lo creó
      });
      setNewItem({ name: '', description: '', price: '', servings: '', weight: '', imageUrl: '' });
      setShowForm(false);
      alert("¡Pastel agregado exitosamente!");
    } catch (error) {
      console.error("Error al agregar:", error);
      alert("Error al guardar: " + error.message);
    }
  };

  const handleDeleteCake = async (id) => {
    if (!user) return;
    if (window.confirm("¿Estás seguro de eliminar este pastel del menú?")) {
      try {
        await deleteDoc(doc(db, 'cakes', id));
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("No se pudo eliminar: " + error.message);
      }
    }
  };

  // Renderizado de Carga
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] text-[#8B7355]">Cargando Yohana Cake...</div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-slate-800 selection:bg-[#D4AF37] selection:text-white">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-[#E5E0D8] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2">
              <div className="bg-[#D4AF37] p-2 rounded-full text-white">
                <ChefHat size={24} />
              </div>
              <span className="text-2xl font-serif font-bold tracking-wide text-[#4A3B2B]">
                Yohana<span className="text-[#D4AF37]">Cake</span>
              </span>
            </div>
            
            <div className="hidden md:flex space-x-8 text-[#6B5B4A] font-medium text-sm tracking-widest uppercase">
              <a href="#inicio" className="hover:text-[#D4AF37] transition-colors">Inicio</a>
              <a href="#menu" className="hover:text-[#D4AF37] transition-colors">Menú</a>
              <a href="#ubicacion" className="hover:text-[#D4AF37] transition-colors">Ubicación</a>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                 <div className="flex items-center gap-2">
                   <span className="text-xs text-[#8B7355] hidden sm:block">Admin Conectado</span>
                   <button 
                     onClick={handleLogout}
                     className="p-2 bg-red-50 text-red-400 rounded-full hover:bg-red-100 transition-colors"
                     title="Cerrar Sesión"
                   >
                     <LogOut size={20} />
                   </button>
                 </div>
              ) : (
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="p-2 text-[#8B7355] hover:bg-[#F5F0E6] rounded-full transition-colors"
                  title="Acceso Admin"
                >
                  <Lock size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* --- MODAL LOGIN --- */}
      {showLoginModal && !user && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative border border-[#D4AF37]/20">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-6">
              <div className="inline-block p-3 bg-[#F5F0E6] rounded-full mb-3 text-[#D4AF37]">
                <Lock size={24} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#4A3B2B]">Acceso Administrativo</h2>
              <p className="text-sm text-gray-500 mt-1">Ingresa tus credenciales de Firebase</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#8B7355] mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-[#E5E0D8] rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none"
                  placeholder="admin@yohanacake.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#8B7355] mb-1">Contraseña</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-[#E5E0D8] rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none"
                  placeholder="••••••••"
                />
              </div>
              
              {loginError && (
                <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg text-center">
                  {loginError}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full py-3 bg-[#4A3B2B] text-white font-bold rounded-lg hover:bg-[#2c231b] transition-colors flex justify-center items-center gap-2"
              >
                <LogIn size={18} /> Iniciar Sesión
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- HERO SECTION (Solo visible si NO estamos en modo agregar, o siempre visible, depende de gusto. Lo dejo siempre visible) --- */}
      <header id="inicio" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=2000" 
            alt="Fondo Textura" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-block mb-4 px-3 py-1 border border-[#D4AF37] rounded-full text-[#D4AF37] text-xs font-bold tracking-[0.2em] uppercase bg-white/50 backdrop-blur">
            Repostería de Alta Gama
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-[#4A3B2B] mb-6 leading-tight">
            Dulces Momentos <br/> 
            <span className="italic text-[#D4AF37] font-light">Inolvidables</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-[#8B7355] mb-10 font-light">
            Creaciones artesanales que combinan el arte visual con sabores exquisitos. 
            Ubicados en el corazón de Barquisimeto.
          </p>
          <a href="#menu" className="inline-flex items-center px-8 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-[#D4AF37] hover:bg-[#B59230] transition-all shadow-xl shadow-[#D4AF37]/30">
            Ver Catálogo
          </a>
        </div>
      </header>

      {/* --- ADMIN PANEL (Solo visible si hay usuario logueado) --- */}
      {user && (
        <div className="pt-8 px-4 pb-12 max-w-4xl mx-auto animate-fade-in relative z-20">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E5E0D8] overflow-hidden">
            <div className="bg-[#4A3B2B] px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-serif text-white flex items-center gap-2">
                <Users size={18} className="text-[#D4AF37]" /> Gestión de Productos
              </h2>
              <button 
                onClick={() => setShowForm(!showForm)}
                className="bg-[#D4AF37] hover:bg-white hover:text-[#D4AF37] text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
              >
                {showForm ? <X size={16}/> : <Plus size={16}/>} 
                {showForm ? 'Cancelar' : 'Agregar Nuevo'}
              </button>
            </div>

            {/* Formulario de Agregar */}
            {showForm && (
              <div className="p-6 bg-[#FDFBF7] border-b border-[#E5E0D8]">
                <form onSubmit={handleAddCake} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-[#8B7355] uppercase tracking-wider mb-1">Nombre del Pastel</label>
                    <input 
                      required
                      type="text" 
                      value={newItem.name}
                      onChange={e => setNewItem({...newItem, name: e.target.value})}
                      className="w-full p-3 bg-white border border-[#E5E0D8] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none"
                      placeholder="Ej. Red Velvet Royal"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-[#8B7355] uppercase tracking-wider mb-1">Descripción</label>
                    <textarea 
                      required
                      value={newItem.description}
                      onChange={e => setNewItem({...newItem, description: e.target.value})}
                      className="w-full p-3 bg-white border border-[#E5E0D8] rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none"
                      rows="3"
                      placeholder="Ingredientes, sabor, detalles especiales..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8B7355] uppercase tracking-wider mb-1">Precio ($)</label>
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      value={newItem.price}
                      onChange={e => setNewItem({...newItem, price: e.target.value})}
                      className="w-full p-3 bg-white border border-[#E5E0D8] rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8B7355] uppercase tracking-wider mb-1">Peso (kg/g)</label>
                    <input 
                      type="text" 
                      value={newItem.weight}
                      onChange={e => setNewItem({...newItem, weight: e.target.value})}
                      className="w-full p-3 bg-white border border-[#E5E0D8] rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none"
                      placeholder="Ej. 2.5 kg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8B7355] uppercase tracking-wider mb-1">Porciones (Personas)</label>
                    <input 
                      type="text" 
                      value={newItem.servings}
                      onChange={e => setNewItem({...newItem, servings: e.target.value})}
                      className="w-full p-3 bg-white border border-[#E5E0D8] rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none"
                      placeholder="Ej. 12-15 personas"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8B7355] uppercase tracking-wider mb-1">URL Imagen</label>
                    <input 
                      type="url" 
                      value={newItem.imageUrl}
                      onChange={e => setNewItem({...newItem, imageUrl: e.target.value})}
                      className="w-full p-3 bg-white border border-[#E5E0D8] rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="md:col-span-2 pt-2">
                    <button type="submit" className="w-full py-3 bg-[#4A3B2B] text-white font-bold rounded-lg hover:bg-[#2c231b] transition-colors shadow-lg">
                      Guardar en Base de Datos
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Lista Admin */}
            <div className="bg-white max-h-96 overflow-y-auto">
               {cakes.length === 0 ? (
                 <div className="p-8 text-center text-gray-400">No hay pasteles registrados aún.</div>
               ) : (
                 <table className="w-full text-left border-collapse">
                   <thead className="bg-[#F5F0E6] text-[#6B5B4A] sticky top-0">
                     <tr>
                       <th className="p-4 font-serif font-bold">Pastel</th>
                       <th className="p-4 font-serif font-bold">Precio</th>
                       <th className="p-4 font-serif font-bold text-right">Acciones</th>
                     </tr>
                   </thead>
                   <tbody>
                     {cakes.map((cake) => (
                       <tr key={cake.id} className="border-b border-[#E5E0D8] hover:bg-gray-50">
                         <td className="p-4">
                           <div className="font-bold text-[#4A3B2B]">{cake.name}</div>
                           <div className="text-xs text-gray-500 truncate max-w-[200px]">{cake.description}</div>
                         </td>
                         <td className="p-4 text-[#D4AF37] font-bold">${cake.price}</td>
                         <td className="p-4 text-right">
                           <button 
                             onClick={() => handleDeleteCake(cake.id)}
                             className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                             title="Eliminar"
                           >
                             <Trash2 size={18} />
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               )}
            </div>
          </div>
        </div>
      )}

      {/* --- MENU GALLERY --- */}
      <section id="menu" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[#D4AF37] font-bold tracking-widest uppercase text-sm">Nuestras Creaciones</span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#4A3B2B] mt-2">Menú Exclusivo</h2>
          <div className="w-24 h-1 bg-[#D4AF37] mx-auto mt-6 rounded-full"></div>
        </div>

        {cakes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-[#F5F0E6]">
            <Cake size={48} className="mx-auto text-[#E5E0D8] mb-4" />
            <p className="text-[#8B7355] font-serif text-xl">El catálogo se está horneando...</p>
            {user && <p className="text-sm text-[#D4AF37] mt-2">Usa el panel admin arriba para agregar productos.</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {cakes.map((cake) => (
              <div key={cake.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#E5E0D8] flex flex-col h-full transform hover:-translate-y-1">
                {/* Imagen */}
                <div className="h-64 overflow-hidden relative bg-gray-100">
                  <img 
                    src={cake.imageUrl || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=1000"} 
                    alt={cake.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=1000"}}
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm text-[#4A3B2B] font-bold font-serif">
                    ${cake.price}
                  </div>
                </div>
                
                {/* Contenido */}
                <div className="p-8 flex-1 flex flex-col relative">
                   {/* Decoración Dorada */}
                   <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#FDFBF7] p-2 rounded-full border border-[#E5E0D8]">
                     <Star size={16} className="text-[#D4AF37] fill-current" />
                   </div>

                  <h3 className="text-2xl font-serif font-bold text-[#4A3B2B] mb-3 text-center group-hover:text-[#D4AF37] transition-colors">{cake.name}</h3>
                  <p className="text-[#8B7355] text-sm leading-relaxed text-center mb-6 flex-1">
                    {cake.description}
                  </p>

                  <div className="flex justify-center items-center gap-6 text-xs text-[#6B5B4A] uppercase tracking-wider border-t border-[#F5F0E6] pt-6">
                    {cake.servings && (
                      <div className="flex flex-col items-center gap-1">
                        <Users size={16} className="text-[#D4AF37]" />
                        <span>{cake.servings}</span>
                      </div>
                    )}
                    {cake.weight && (
                      <div className="flex flex-col items-center gap-1">
                        <Weight size={16} className="text-[#D4AF37]" />
                        <span>{cake.weight}</span>
                      </div>
                    )}
                  </div>
                  
                  <button className="w-full mt-6 bg-[#4A3B2B] text-white py-3 rounded-xl font-bold hover:bg-[#D4AF37] transition-colors duration-300 shadow-lg shadow-[#4A3B2B]/20">
                    Ordenar Ahora
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* --- INFO / LOCATION --- */}
      <footer id="ubicacion" className="bg-[#2C231B] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-serif font-bold text-[#D4AF37] mb-4">Yohana Cake</h3>
            <p className="text-gray-400 leading-relaxed">
              Elevando la repostería a un nivel de arte. Cada pastel es una obra maestra diseñada para tus momentos más especiales.
            </p>
          </div>
          
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center space-x-3 text-gray-300">
              <MapPin className="text-[#D4AF37]" />
              <span>Barquisimeto, Edo. Lara, Venezuela</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-300">
              <Phone className="text-[#D4AF37]" />
              <span>+58 412 123 4567</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-300">
              <Instagram className="text-[#D4AF37]" />
              <span>@yohanacake</span>
            </div>
          </div>

          <div className="text-center md:text-right">
             <h4 className="text-lg font-serif text-[#D4AF37] mb-4">Horario de Atención</h4>
             <ul className="text-gray-400 space-y-2">
               <li>Lun - Vie: 9:00 AM - 6:00 PM</li>
               <li>Sábados: 10:00 AM - 4:00 PM</li>
               <li>Domingos: Cerrado</li>
             </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Yohana Cake. Todos los derechos reservados. Diseñado con lujo y pasión.
        </div>
      </footer>
    </div>
  );
}
