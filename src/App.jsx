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
// Iconos de lujo
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
  ChefHat,
  Users,
  Weight,
  LogOut,
  LogIn,
  UploadCloud,
  Image as ImageIcon
} from 'lucide-react';

/* ===================================================================
  CONFIGURACIÓN DE YOHANA CAKE
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

// Inicializar Firebase (Solo Auth y Firestore para evitar costos)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
  const [user, setUser] = useState(null);
  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para Login
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Estado para Formulario
  const [showForm, setShowForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    servings: '',
    weight: '',
    imageUrl: ''
  });

  // 1. Autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) setShowLoginModal(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Base de Datos
  useEffect(() => {
    const q = query(collection(db, 'cakes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cakesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCakes(cakesData);
    }, (error) => console.error("Error:", error));
    return () => unsubscribe();
  }, []);

  // --- TRUCO: Compresor de Imágenes (Gratis) ---
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600; 
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.6)); 
        }
        img.onerror = (error) => reject(error);
      }
    });
  }

  const handleImageSelect = async (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoginError("Credenciales incorrectas.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleAddCake = async (e) => {
    e.preventDefault();
    if (!user) return alert("Debes iniciar sesión.");
    setIsProcessing(true);
    try {
      let finalImageUrl = newItem.imageUrl;
      if (imageFile) {
        finalImageUrl = await compressImage(imageFile);
      }
      await addDoc(collection(db, 'cakes'), {
        ...newItem,
        imageUrl: finalImageUrl,
        price: parseFloat(newItem.price),
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });
      setNewItem({ name: '', description: '', price: '', servings: '', weight: '', imageUrl: '' });
      setImageFile(null);
      setPreviewUrl(null);
      setShowForm(false);
      alert("¡Pastel agregado con éxito!");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteCake = async (id) => {
    if (!user) return;
    if (window.confirm("¿Estás seguro de eliminar este pastel?")) {
      await deleteDoc(doc(db, 'cakes', id));
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] text-[#8B7355] font-serif">Cargando la dulzura...</div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-slate-800 selection:bg-[#D4AF37] selection:text-white">
      
      {/* --- NAVBAR LUJOSO --- */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-[#E5E0D8] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2">
              <div className="bg-[#D4AF37] p-2 rounded-full text-white shadow-lg shadow-[#D4AF37]/40">
                <ChefHat size={24} />
              </div>
              <span className="text-2xl font-serif font-bold tracking-wide text-[#4A3B2B]">
                Yohana<span className="text-[#D4AF37]">Cake</span>
              </span>
            </div>
            
            <div className="hidden md:flex space-x-8 text-[#6B5B4A] font-medium text-sm tracking-widest uppercase">
              <a href="#inicio" className="hover:text-[#D4AF37] transition-colors duration-300">Inicio</a>
              <a href="#menu" className="hover:text-[#D4AF37] transition-colors duration-300">Menú</a>
              <a href="#ubicacion" className="hover:text-[#D4AF37] transition-colors duration-300">Ubicación</a>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                 <div className="flex items-center gap-2">
                   <span className="text-xs text-[#8B7355] hidden sm:block font-serif italic">Admin</span>
                   <button onClick={handleLogout} className="p-2 bg-red-50 text-red-400 rounded-full hover:bg-red-100 transition-colors shadow-sm">
                     <LogOut size={20} />
                   </button>
                 </div>
              ) : (
                <button onClick={() => setShowLoginModal(true)} className="p-2 text-[#8B7355] hover:bg-[#F5F0E6] rounded-full transition-colors hover:text-[#D4AF37]">
                  <Lock size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* --- MODAL LOGIN ELEGANTE --- */}
      {showLoginModal && !user && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#4A3B2B]/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative border border-[#D4AF37]/30">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-[#D4AF37] transition-colors"><X size={20} /></button>
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-[#F5F0E6] rounded-full mb-4 text-[#D4AF37] shadow-inner">
                <Lock size={28} />
              </div>
              <h2 className="text-3xl font-serif font-bold text-[#4A3B2B]">Acceso Privado</h2>
              <p className="text-[#8B7355] text-sm mt-2">Panel administrativo de Yohana Cake</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#8B7355] uppercase tracking-wider mb-2">Correo Electrónico</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} 
                  className="w-full p-3 bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8B7355] uppercase tracking-wider mb-2">Contraseña</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} 
                  className="w-full p-3 bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all" />
              </div>
              {loginError && <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg text-center border border-red-100">{loginError}</div>}
              <button type="submit" className="w-full py-3 bg-[#4A3B2B] text-white font-bold rounded-lg hover:bg-[#D4AF37] transition-all duration-300 shadow-lg flex justify-center items-center gap-2 uppercase tracking-widest text-xs">
                <LogIn size={16} /> Ingresar al Sistema
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- HERO SECTION DE LUJO --- */}
      <header id="inicio" className="relative pt-32 pb-20 lg:pt-52 lg:pb-40 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=2000" 
            alt="Fondo Textura" 
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#FDFBF7]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-block mb-6 px-4 py-1.5 border border-[#D4AF37] rounded-full text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase bg-white/80 backdrop-blur-sm shadow-sm animate-fade-in-up">
            Repostería de Alta Gama
          </div>
          <h1 className="text-5xl md:text-8xl font-serif font-bold text-[#4A3B2B] mb-8 leading-tight drop-shadow-sm">
            Dulces Momentos <br/> 
            <span className="italic text-[#D4AF37] font-light font-serif">Inolvidables</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-[#8B7355] mb-12 font-light leading-relaxed">
            Creaciones artesanales que combinan el arte visual con sabores exquisitos. 
            Ubicados en el corazón de Barquisimeto.
          </p>
          <a href="#menu" className="inline-flex items-center px-10 py-4 border border-transparent text-sm font-bold tracking-widest uppercase rounded-full text-white bg-[#D4AF37] hover:bg-[#B59230] transition-all shadow-xl shadow-[#D4AF37]/30 transform hover:-translate-y-1">
            Ver Catálogo
          </a>
        </div>
      </header>

      {/* --- PANEL ADMIN (Gestión Completa) --- */}
      {user && (
        <div className="px-4 pb-12 max-w-5xl mx-auto relative z-20 -mt-10">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E0D8] overflow-hidden">
            <div className="bg-[#4A3B2B] px-8 py-5 flex justify-between items-center border-b border-[#D4AF37]/20">
              <h2 className="text-xl font-serif text-white flex items-center gap-3">
                <Users size={20} className="text-[#D4AF37]" /> Gestión de Productos
              </h2>
              <button onClick={() => setShowForm(!showForm)} className="bg-[#D4AF37] hover:bg-white hover:text-[#D4AF37] text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg">
                {showForm ? <X size={16}/> : <Plus size={16}/>} {showForm ? 'Cancelar' : 'Agregar Nuevo'}
              </button>
            </div>

            {showForm && (
              <div className="p-8 bg-[#FDFBF7] border-b border-[#E5E0D8]">
                <form onSubmit={handleAddCake} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-[#8B7355] uppercase tracking-wider mb-2">Nombre del Pastel</label>
                    <input required type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full p-4 bg-white border border-[#E5E0D8] rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none shadow-sm" placeholder="Ej. Tarta Real de Chocolate" />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-[#8B7355] uppercase tracking-wider mb-2">Descripción Detallada</label>
                    <textarea required value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full p-4 bg-white border border-[#E5E0D8] rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none shadow-sm" rows="3" placeholder="Ingredientes, notas de sabor..." />
                  </div>

                  <div><label className="block text-xs font-bold text-[#8B7355] uppercase tracking-wider mb-2">Precio ($)</label><input required type="number" step="0.01" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="w-full p-4 bg-white border border-[#E5E0D8] rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none shadow-sm" /></div>
                  <div><label className="block text-xs font-bold text-[#8B7355] uppercase tracking-wider mb-2">Peso (Kg)</label><input type="text" value={newItem.weight} onChange={e => setNewItem({...newItem, weight: e.target.value})} className="w-full p-4 bg-white border border-[#E5E0D8] rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none shadow-sm" /></div>
                  <div><label className="block text-xs font-bold text-[#8B7355] uppercase tracking-wider mb-2">Porciones</label><input type="text" value={newItem.servings} onChange={e => setNewItem({...newItem, servings: e.target.value})} className="w-full p-4 bg-white border border-[#E5E0D8] rounded-xl focus:ring-2 focus:ring-[#D4AF37] outline-none shadow-sm" /></div>

                  {/* SUBIDA DE IMAGEN CON ESTILO */}
                  <div className="md:col-span-2 bg-white p-6 rounded-xl border-2 border-dashed border-[#D4AF37]/50 hover:border-[#D4AF37] transition-colors text-center cursor-pointer group">
                    <label className="cursor-pointer block w-full h-full">
                      <div className="flex flex-col items-center gap-3 text-[#8B7355] group-hover:text-[#D4AF37] transition-colors">
                        <UploadCloud size={40} />
                        <div>
                          <span className="font-bold text-sm uppercase tracking-wide block">Toca aquí para subir foto</span>
                          <span className="text-xs text-gray-400 font-light">(Se guardará directamente en la base de datos)</span>
                        </div>
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                    </label>

                    {previewUrl && (
                      <div className="mt-6 relative inline-block animate-fade-in">
                        <img src={previewUrl} alt="Vista previa" className="h-40 rounded-lg shadow-lg border-4 border-white" />
                        <button type="button" onClick={() => {setImageFile(null); setPreviewUrl(null)}} className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-md transition-colors"><X size={14}/></button>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 pt-4">
                    <button type="submit" disabled={isProcessing} className={`w-full py-4 text-white font-bold text-sm uppercase tracking-widest rounded-xl shadow-xl transition-all ${isProcessing ? 'bg-gray-400' : 'bg-[#4A3B2B] hover:bg-[#D4AF37] hover:-translate-y-1'}`}>
                      {isProcessing ? 'Procesando y Guardando...' : 'Guardar Pastel en el Menú'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* LISTA ESTILO TABLA DE LUJO */}
            <div className="bg-white max-h-[500px] overflow-y-auto">
               {cakes.length === 0 ? (
                 <div className="p-12 text-center text-gray-400 font-serif">Aún no hay pasteles en el sistema.</div>
               ) : (
                 <table className="w-full text-left border-collapse">
                   <thead className="bg-[#F5F0E6] text-[#6B5B4A] sticky top-0 z-10">
                     <tr>
                       <th className="p-5 font-serif font-bold text-sm uppercase tracking-wider">Producto</th>
                       <th className="p-5 font-serif font-bold text-sm uppercase tracking-wider">Detalles</th>
                       <th className="p-5 font-serif font-bold text-sm uppercase tracking-wider text-right">Precio</th>
                       <th className="p-5 font-serif font-bold text-sm uppercase tracking-wider text-right">Acción</th>
                     </tr>
                   </thead>
                   <tbody>
                     {cakes.map((cake) => (
                       <tr key={cake.id} className="border-b border-[#E5E0D8] hover:bg-[#FDFBF7] transition-colors">
                         <td className="p-5">
                           <div className="flex items-center gap-4">
                             {cake.imageUrl ? (
                               <img src={cake.imageUrl} alt="mini" className="w-16 h-16 rounded-lg object-cover border border-[#E5E0D8] shadow-sm" />
                             ) : (
                               <div className="w-16 h-16 bg-[#F5F0E6] rounded-lg flex items-center justify-center text-[#D4AF37]"><ImageIcon size={24}/></div>
                             )}
                             <span className="font-bold text-[#4A3B2B] font-serif text-lg">{cake.name}</span>
                           </div>
                         </td>
                         <td className="p-5 text-sm text-[#8B7355]">
                           <div className="max-w-[200px] truncate">{cake.description}</div>
                           <div className="text-xs text-gray-400 mt-1 flex gap-2">
                             {cake.weight && <span>• {cake.weight}</span>}
                             {cake.servings && <span>• {cake.servings}</span>}
                           </div>
                         </td>
                         <td className="p-5 text-right font-bold text-[#D4AF37] text-lg">${cake.price}</td>
                         <td className="p-5 text-right">
                           <button onClick={() => handleDeleteCake(cake.id)} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-all" title="Eliminar del menú">
                             <Trash2 size={20} />
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

      {/* --- MENU GALLERY (Diseño de Tarjetas Premium) --- */}
      <section id="menu" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <span className="text-[#D4AF37] font-bold tracking-[0.2em] uppercase text-xs">Colección Exclusiva</span>
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-[#4A3B2B] mt-4 mb-6">Nuestro Menú</h2>
          <div className="w-32 h-1 bg-[#D4AF37] mx-auto rounded-full opacity-60"></div>
        </div>

        {cakes.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-[#F5F0E6]">
            <Cake size={64} className="mx-auto text-[#E5E0D8] mb-6" />
            <p className="text-[#8B7355] font-serif text-2xl">El catálogo se está horneando...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {cakes.map((cake) => (
              <div key={cake.id} className="group bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-[#E5E0D8] flex flex-col h-full transform hover:-translate-y-2">
                <div className="h-72 overflow-hidden relative bg-[#F5F0E6]">
                  {cake.imageUrl ? (
                    <img 
                      src={cake.imageUrl} 
                      alt={cake.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#D4AF37]/30"><ImageIcon size={48}/></div>
                  )}
                  <div className="absolute top-0 right-0 bg-[#D4AF37] text-white px-4 py-2 rounded-bl-2xl font-serif font-bold text-lg shadow-lg">
                    ${cake.price}
                  </div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col relative">
                   <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-full border border-[#E5E0D8] shadow-md group-hover:scale-110 transition-transform duration-300">
                     <Star size={20} className="text-[#D4AF37] fill-current" />
                   </div>

                  <h3 className="text-2xl font-serif font-bold text-[#4A3B2B] mb-4 text-center group-hover:text-[#D4AF37] transition-colors mt-2">{cake.name}</h3>
                  <p className="text-[#8B7355] text-sm leading-relaxed text-center mb-8 flex-1 font-light">
                    {cake.description}
                  </p>

                  <div className="flex justify-center items-center gap-6 text-xs text-[#6B5B4A] uppercase tracking-wider border-t border-[#F5F0E6] pt-6">
                    {cake.servings && (
                      <div className="flex flex-col items-center gap-1 group-hover:text-[#4A3B2B] transition-colors">
                        <Users size={16} className="text-[#D4AF37]" />
                        <span>{cake.servings}</span>
                      </div>
                    )}
                    {cake.weight && (
                      <div className="flex flex-col items-center gap-1 group-hover:text-[#4A3B2B] transition-colors">
                        <Weight size={16} className="text-[#D4AF37]" />
                        <span>{cake.weight}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* BOTÓN ORDENAR AHORA CON WHATSAPP */}
                  <a 
                    href={`https://wa.me/584266531604?text=Hola, estoy interesado en ordenar el pastel: ${encodeURIComponent(cake.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center mt-8 bg-[#4A3B2B] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#D4AF37] transition-colors duration-300 shadow-lg shadow-[#4A3B2B]/20"
                  >
                    Ordenar Ahora
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* --- FOOTER DE LUJO --- */}
      <footer id="ubicacion" className="bg-[#1a1510] text-white py-20 px-4 border-t-4 border-[#D4AF37]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
              <ChefHat size={32} className="text-[#D4AF37]" />
              <h3 className="text-3xl font-serif font-bold text-white">Yohana<span className="text-[#D4AF37]">Cake</span></h3>
            </div>
            <p className="text-gray-400 text-sm leading-7 font-light">
              Elevando la repostería a un nivel de arte. Cada pastel es una obra maestra diseñada meticulosamente para convertir tus celebraciones en recuerdos eternos.
            </p>
          </div>
          
          <div className="flex flex-col items-center justify-center space-y-6">
            <h4 className="text-[#D4AF37] font-bold uppercase tracking-widest text-xs mb-2">Contacto Directo</h4>
            <div className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
              <MapPin size={20} className="text-[#D4AF37]" /> 
              <span>Barquisimeto, Edo. Lara</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
              <Phone size={20} className="text-[#D4AF37]" /> 
              <span>+58 426 653 1604</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
              <Instagram size={20} className="text-[#D4AF37]" /> 
              <span>@yohanacake</span>
            </div>
          </div>

          <div className="text-center md:text-right">
             <h4 className="text-[#D4AF37] font-bold uppercase tracking-widest text-xs mb-8">Horario de Atención</h4>
             <ul className="text-gray-400 text-sm space-y-3 font-light">
               <li className="flex justify-center md:justify-end gap-4"><span>Lunes - Viernes</span> <span className="text-white font-medium">9:00 AM - 6:00 PM</span></li>
               <li className="flex justify-center md:justify-end gap-4"><span>Sábados</span> <span className="text-white font-medium">10:00 AM - 4:00 PM</span></li>
               <li className="flex justify-center md:justify-end gap-4"><span>Domingos</span> <span className="text-[#D4AF37]">Cerrado</span></li>
             </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-800 text-center text-xs text-gray-600 uppercase tracking-widest">
          © {new Date().getFullYear()} Yohana Cake. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
