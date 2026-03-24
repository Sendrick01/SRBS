import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import Markdown from "react-markdown";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  sendEmailVerification 
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  orderBy,
  getDocs,
  or,
  increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { 
  Home, 
  Search, 
  User, 
  Plus, 
  LogOut, 
  MapPin, 
  Calendar, 
  Box, 
  Eye, 
  CheckCircle2,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Building2,
  BarChart3,
  MessageSquare,
  Mail,
  FileText,
  Users,
  TrendingUp,
  Activity,
  Phone,
  ShieldAlert,
  Star,
  Clock,
  Filter,
  ArrowRight,
  Sparkles,
  Send,
  Bot,
  Minimize2,
  Maximize2,
  Bell,
  CreditCard,
  Upload,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Heart,
  LayoutDashboard,
  Settings,
  LogOut as LogOutIcon,
  User as UserIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  MapPin as MapPinIcon,
  Calendar as CalendarIcon,
  Plus as PlusIcon,
  Eye as EyeIcon,
  ShieldCheck as ShieldCheckIcon,
  MessageSquare as MessageSquareIcon,
  FileText as FileTextIcon,
  Users as UsersIcon,
  TrendingUp as TrendingUpIcon,
  Activity as ActivityIcon,
  Phone as PhoneIcon,
  ShieldAlert as ShieldAlertIcon,
  Star as StarIcon,
  Clock as ClockIcon,
  Filter as FilterIcon,
  ArrowRight as ArrowRightIcon,
  Sparkles as SparklesIcon,
  Send as SendIcon,
  Bot as BotIcon,
  Minimize2 as Minimize2Icon,
  Maximize2 as Maximize2Icon,
  Bell as BellIcon,
  CreditCard as CreditCardIcon,
  Upload as UploadIcon,
  MessageCircle as MessageCircleIcon,
  HelpCircle as HelpCircleIcon,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
  Heart as HeartIcon,
  LayoutDashboard as LayoutDashboardIcon,
  Settings as SettingsIcon
} from 'lucide-react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { TourProvider, useTour } from '@reactour/tour';

import { UserProfile, Property, Booking, UserRole, Inquiry, Review, Notification, Payment } from './types';
import { handleFirestoreError, OperationType } from './firestoreUtils';
import { ErrorBoundary } from './components/ErrorBoundary';
import { VRTourViewer } from './components/VRTourViewer';

// --- Components ---

const FeaturedSlideshow = ({ properties, onSelect }: { properties: Property[], onSelect: (p: Property) => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const featured = properties.filter(p => p.isFeatured).slice(0, 5);

  useEffect(() => {
    if (featured.length === 0) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex(prev => (prev + 1) % featured.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [featured.length]);

  if (featured.length === 0) return null;

  const current = featured[currentIndex];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="relative h-[600px] w-full rounded-[40px] overflow-hidden shadow-2xl group">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div 
          key={current.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.5 }
          }}
          className="absolute inset-0"
        >
          <img 
            src={current.images[0]} 
            alt={current.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-transparent" />
          
          <div className="absolute bottom-16 left-12 right-12 text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="bg-emerald-500 text-stone-900 text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-6 inline-block shadow-lg">
                Premium Listing
              </span>
              <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6 leading-tight">{current.title}</h2>
              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-emerald-400" />
                  <span className="text-stone-200 font-medium">{current.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">UGX</span>
                  <span className="text-2xl font-bold">{current.rent.toLocaleString()}</span>
                </div>
              </div>
              <button 
                onClick={() => onSelect(current)}
                className="bg-emerald-500 text-stone-900 px-10 py-4 rounded-2xl font-bold hover:bg-emerald-400 transition-all shadow-xl active:scale-95 flex items-center gap-3 group/btn"
              >
                Explore Property <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {featured.map((_, i) => (
          <button 
            key={i}
            onClick={() => {
              setDirection(i > currentIndex ? 1 : -1);
              setCurrentIndex(i);
            }}
            className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIndex ? 'bg-emerald-500 w-12' : 'bg-white/30 w-4 hover:bg-white/50'}`}
          />
        ))}
      </div>

      <button 
        onClick={() => {
          setDirection(-1);
          setCurrentIndex(prev => (prev - 1 + featured.length) % featured.length);
        }}
        className="absolute left-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-emerald-500 hover:text-stone-900 transition-all opacity-0 group-hover:opacity-100 z-20 border border-white/20"
      >
        <ChevronLeft size={28} />
      </button>
      <button 
        onClick={() => {
          setDirection(1);
          setCurrentIndex(prev => (prev + 1) % featured.length);
        }}
        className="absolute right-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-emerald-500 hover:text-stone-900 transition-all opacity-0 group-hover:opacity-100 z-20 border border-white/20"
      >
        <ChevronRight size={28} />
      </button>
    </div>
  );
};

const PropertyMarquee = ({ properties }: { properties: Property[] }) => {
  const marqueeImages = properties.flatMap(p => p.images).slice(0, 12);
  
  return (
    <div className="py-20 overflow-hidden bg-stone-900/50 backdrop-blur-sm border-y border-white/5">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...marqueeImages, ...marqueeImages].map((img, i) => (
          <div key={i} className="inline-block px-4">
            <div className="w-[400px] h-[250px] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl">
              <img 
                src={img} 
                alt="Property" 
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LandingPage = ({ properties, onLogin }: { properties: Property[], onLogin: () => void }) => {
  return (
    <div className="min-h-screen bg-surface">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm shadow-emerald-900/5 flex justify-between items-center px-6 py-4">
        <Logo />
        <div className="flex items-center gap-4">
          <button 
            onClick={onLogin}
            className="bg-emerald-800 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-900 transition-all shadow-lg active:scale-95"
          >
            Sign In
          </button>
        </div>
      </header>

      <main className="pt-20 pb-32">
        {/* Hero Section */}
        <section className="relative px-6 pt-6 pb-20">
          <div className="relative h-[500px] w-full rounded-[2.5rem] overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80" 
              alt="Luxury Ugandan Villa" 
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 mb-12">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-headline font-extrabold text-white text-4xl md:text-6xl max-w-2xl leading-[1.1] tracking-tight mb-6"
              >
                Find Your Perfect Ugandan Home
              </motion.h2>
            </div>
          </div>
          
          {/* Floating Search Bar */}
          <div className="absolute bottom-0 left-6 right-6 transform translate-y-1/2">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl p-4 shadow-[0_24px_48px_-12px_rgba(0,76,34,0.12)] flex flex-col md:flex-row gap-4 items-center ring-1 ring-black/[0.03]">
              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
                <div className="flex items-center gap-3 py-2">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Location</span>
                    <input 
                      className="bg-transparent border-none p-0 focus:ring-0 text-sm font-semibold text-on-surface placeholder:text-slate-400" 
                      placeholder="Kampala, Entebbe..." 
                      type="text"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2 border-t md:border-t-0 md:border-l border-slate-100">
                  <span className="material-symbols-outlined text-primary">home_work</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Property Type</span>
                    <select className="bg-transparent border-none p-0 focus:ring-0 text-sm font-semibold text-on-surface appearance-none pr-8">
                      <option>Modern Apartments</option>
                      <option>Luxury Villas</option>
                      <option>Studio Lofts</option>
                    </select>
                  </div>
                </div>
              </div>
              <button 
                onClick={onLogin}
                className="w-full md:w-auto px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95"
              >
                Search Now
              </button>
            </div>
          </div>
        </section>

        {/* Feature Cards (Bento Style) */}
        <section className="px-6 mt-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-low p-8 rounded-[2rem] group hover:bg-emerald-50 transition-colors duration-500">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-primary text-3xl">view_in_ar</span>
              </div>
              <h3 className="font-headline font-bold text-xl mb-3">Immersive VR Tours</h3>
              <p className="text-secondary text-sm leading-relaxed">Walk through your future home from anywhere in the world with high-definition virtual reality.</p>
            </div>
            <div className="bg-surface-container-low p-8 rounded-[2rem] group hover:bg-emerald-50 transition-colors duration-500">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-primary text-3xl">shield</span>
              </div>
              <h3 className="font-headline font-bold text-xl mb-3">Secure Payments</h3>
              <p className="text-secondary text-sm leading-relaxed">Integrated bank-grade encryption for all transactions, ensuring your deposit is safe and traceable.</p>
            </div>
            <div className="bg-surface-container-low p-8 rounded-[2rem] group hover:bg-emerald-50 transition-colors duration-500">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-primary text-3xl">verified</span>
              </div>
              <h3 className="font-headline font-bold text-xl mb-3">Verified Listings</h3>
              <p className="text-secondary text-sm leading-relaxed">Every property on Digital Estate is manually inspected and verified by our local experts.</p>
            </div>
          </div>
        </section>

        {/* Featured Properties (Horizontal Scroll) */}
        <section className="mt-20">
          <div className="px-6 flex justify-between items-end mb-8">
            <div>
              <span className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-2 block">Curated Selection</span>
              <h2 className="font-headline font-extrabold text-3xl">Featured Properties</h2>
            </div>
            <button onClick={onLogin} className="text-primary font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
              View all listings <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="flex overflow-x-auto gap-6 px-6 no-scrollbar pb-8">
            {properties.filter(p => p.isFeatured).map(property => (
              <div key={property.id} className="flex-none w-[320px] md:w-[400px]">
                <div className="bg-surface-container-lowest rounded-[2rem] overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-500 ring-1 ring-black/[0.02]">
                  <div className="relative h-[260px]">
                    <img 
                      src={property.images[0]} 
                      alt={property.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4">
                      <div className="glass-effect bg-white/40 text-on-surface px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>view_in_ar</span>
                        VR TOUR READY
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-headline font-bold text-xl mb-1 group-hover:text-primary transition-colors">{property.title}</h3>
                        <div className="flex items-center gap-1 text-secondary text-xs">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          {property.location}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block font-headline font-extrabold text-primary text-xl">UGX {property.rent.toLocaleString()}</span>
                        <span className="text-[10px] text-secondary font-bold uppercase tracking-tighter">per month</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 mt-12 mb-12">
          <div className="bg-gradient-to-br from-emerald-900 to-primary-container rounded-[2.5rem] p-10 md:p-20 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <h2 className="font-headline font-extrabold text-white text-3xl md:text-5xl mb-6">Experience Your Next Home in Full 3D</h2>
              <p className="text-emerald-100 text-lg mb-8 leading-relaxed">Stop guessing and start touring. Our advanced VR technology allows you to explore every corner of a property without leaving your couch.</p>
              <button 
                onClick={onLogin}
                className="px-8 py-4 bg-white text-primary font-bold rounded-2xl shadow-xl shadow-black/20 hover:scale-105 transition-transform"
              >
                Launch VR Explorer
              </button>
            </div>
            <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-20 hidden md:block">
              <span className="material-symbols-outlined text-[300px] text-white rotate-12 transform translate-x-20 translate-y-20">view_in_ar</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const Logo = ({ className = "", size = 40 }: { className?: string, size?: number }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div 
      style={{ width: size, height: size }} 
      className="rounded-xl bg-gradient-to-br from-[#004c22] to-[#166534] flex items-center justify-center text-white shadow-lg shadow-[#004c22]/20"
    >
      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>domain</span>
    </div>
    <div className="flex flex-col leading-none">
      <span className="text-lg font-extrabold tracking-tighter text-[#004c22] font-headline">Digital Estate</span>
      <span className="text-[8px] font-medium text-stone-400 tracking-widest uppercase">Smart Rental Booking System</span>
    </div>
  </div>
);

const Navbar = ({ 
  user, 
  profile, 
  onLogout,
  notifications,
  isNotificationsOpen,
  setIsNotificationsOpen,
  onMarkAsRead,
  onViewChange,
  currentView
}: { 
  user: any, 
  profile: UserProfile | null, 
  onLogout: () => void,
  notifications: Notification[],
  isNotificationsOpen: boolean,
  setIsNotificationsOpen: (open: boolean) => void,
  onMarkAsRead: (id: string) => void,
  onViewChange: (view: string) => void,
  currentView: string
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm shadow-emerald-900/5 flex justify-between items-center px-6 py-4">
      <div className="flex items-center gap-3" data-tour="welcome">
        <div 
          className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center overflow-hidden border-2 border-primary/10 cursor-pointer" 
          data-tour="profile"
          onClick={() => onViewChange('profile')}
        >
          <img 
            src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
            alt="User profile" 
            className="w-full h-full object-cover"
          />
        </div>
        <Logo />
      </div>
      
      <div className="hidden md:flex items-center gap-8">
        <nav className="flex gap-6">
          <button 
            onClick={() => onViewChange('landing')}
            className={`font-semibold text-sm transition-colors ${currentView === 'landing' ? 'text-emerald-700' : 'text-slate-500 hover:text-emerald-700'}`}
          >
            Home
          </button>
          <button 
            onClick={() => onViewChange('properties')}
            data-tour="explore"
            className={`font-semibold text-sm transition-colors ${currentView === 'properties' ? 'text-emerald-700' : 'text-slate-500 hover:text-emerald-700'}`}
          >
            Explore
          </button>
          <button 
            onClick={() => onViewChange('bookings')}
            data-tour="bookings"
            className={`font-semibold text-sm transition-colors ${currentView === 'bookings' ? 'text-emerald-700' : 'text-slate-500 hover:text-emerald-700'}`}
          >
            Bookings
          </button>
          {profile?.role === 'admin' && (
            <button 
              onClick={() => onViewChange('analytics')}
              className={`font-semibold text-sm transition-colors ${currentView === 'analytics' ? 'text-emerald-700' : 'text-slate-500 hover:text-emerald-700'}`}
            >
              Analytics
            </button>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" data-tour="notifications">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 text-stone-400 hover:text-emerald-800 transition-colors relative"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsNotificationsOpen(false)} 
                />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-stone-100 z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-stone-100 flex justify-between items-center">
                    <h4 className="font-bold text-stone-900">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`p-4 border-b border-stone-50 hover:bg-stone-50 transition-colors cursor-pointer ${!notif.read ? 'bg-emerald-50/30' : ''}`}
                          onClick={() => {
                            onMarkAsRead(notif.id);
                            setIsNotificationsOpen(false);
                          }}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-stone-900">{notif.title}</span>
                            <span className="text-[10px] text-stone-400">{format(new Date(notif.createdAt), 'MMM dd, HH:mm')}</span>
                          </div>
                          <p className="text-xs text-stone-500 leading-relaxed">{notif.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <span className="material-symbols-outlined text-stone-200 text-4xl mb-2">notifications_off</span>
                        <p className="text-sm text-stone-400">No notifications yet</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <button className="p-2 rounded-full hover:bg-slate-50 transition-colors active:scale-95 duration-200">
          <span className="material-symbols-outlined text-emerald-900">search</span>
        </button>
        <button 
          onClick={onLogout}
          className="hidden md:flex items-center gap-2 text-slate-500 font-medium hover:text-emerald-700 transition-colors"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </header>
  );
};

const BottomNavBar = ({ currentView, onViewChange }: { currentView: string, onViewChange: (view: string) => void }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white/80 backdrop-blur-xl rounded-t-[2rem] z-50 shadow-[0_-8px_32px_rgba(0,76,34,0.06)] border-t border-slate-200/20">
      <button 
        onClick={() => onViewChange('landing')}
        className={`flex flex-col items-center justify-center px-5 py-2 transition-transform active:scale-90 duration-300 ${currentView === 'landing' ? 'bg-emerald-100/50 text-emerald-900 rounded-2xl' : 'text-slate-400'}`}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: currentView === 'landing' ? "'FILL' 1" : "'FILL' 0" }}>home</span>
        <span className="font-inter text-[11px] font-semibold tracking-wide uppercase mt-1">Home</span>
      </button>
      <button 
        onClick={() => onViewChange('properties')}
        className={`flex flex-col items-center justify-center px-5 py-2 transition-transform active:scale-90 duration-300 ${currentView === 'properties' ? 'bg-emerald-100/50 text-emerald-900 rounded-2xl' : 'text-slate-400'}`}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: currentView === 'properties' ? "'FILL' 1" : "'FILL' 0" }}>search_insights</span>
        <span className="font-inter text-[11px] font-semibold tracking-wide uppercase mt-1">Explore</span>
      </button>
      <button 
        onClick={() => onViewChange('bookings')}
        className={`flex flex-col items-center justify-center px-5 py-2 transition-transform active:scale-90 duration-300 ${currentView === 'bookings' ? 'bg-emerald-100/50 text-emerald-900 rounded-2xl' : 'text-slate-400'}`}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: currentView === 'bookings' ? "'FILL' 1" : "'FILL' 0" }}>view_in_ar</span>
        <span className="font-inter text-[11px] font-semibold tracking-wide uppercase mt-1">Bookings</span>
      </button>
      <button 
        onClick={() => onViewChange('profile')}
        className={`flex flex-col items-center justify-center px-5 py-2 transition-transform active:scale-90 duration-300 ${currentView === 'profile' ? 'bg-emerald-100/50 text-emerald-900 rounded-2xl' : 'text-slate-400'}`}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: currentView === 'profile' ? "'FILL' 1" : "'FILL' 0" }}>person</span>
        <span className="font-inter text-[11px] font-semibold tracking-wide uppercase mt-1">Profile</span>
      </button>
    </nav>
  );
};

const ContactAgentModal = ({ 
  property, 
  profile, 
  onClose 
}: { 
  property: Property, 
  profile: UserProfile, 
  onClose: () => void 
}) => {
  const [subject, setSubject] = useState(`Inquiry about ${property.title}`);
  const [message, setMessage] = useState(`Hello, I am interested in your property "${property.title}" located at ${property.location}. Please provide more details.`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [landlordProfile, setLandlordProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        const docRef = doc(db, 'users', property.landlordId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setLandlordProfile(docSnap.data() as UserProfile);
        }
      } catch (err) {
        console.error("Error fetching landlord profile:", err);
      }
    };
    fetchLandlord();
  }, [property.landlordId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'inquiries'), {
        userId: profile.uid,
        userEmail: profile.email,
        userRole: profile.role,
        subject,
        message,
        status: 'new',
        createdAt: new Date().toISOString(),
        propertyId: property.id,
        landlordId: property.landlordId
      });
      alert('Inquiry sent to the agent successfully!');
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'inquiries');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl"
      >
        <div className="p-8 border-b border-stone-100 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-serif font-bold text-stone-900">Contact Agent</h3>
            {landlordProfile && (
              <p className="text-sm text-stone-500 mt-1 flex items-center gap-2">
                <Phone size={14} className="text-emerald-600" /> {landlordProfile.phoneNumber}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Subject</label>
            <input 
              type="text" 
              required 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Message</label>
            <textarea 
              required 
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 resize-none"
            />
          </div>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-800 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-900 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Sending...' : <><MessageSquare size={20} /> Send Message</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const PropertyCard: React.FC<{ 
  property: Property; 
  onBook: (p: Property) => void; 
  onViewTour: (p: Property) => void;
  onContactAgent: (p: Property) => void;
  reviews: Review[];
  onUpdateStatus?: (propertyId: string, newStatus: 'available' | 'rented') => void;
  isOwner?: boolean;
  onBoost?: (id: string) => void;
  isBoosting?: boolean;
}> = ({ property, onBook, onViewTour, onContactAgent, reviews, onUpdateStatus, isOwner, onBoost, isBoosting }) => {
  const propertyReviews = reviews.filter(r => r.propertyId === property.id);
  const avgRating = propertyReviews.length > 0 
    ? propertyReviews.reduce((acc, r) => acc + r.rating, 0) / propertyReviews.length 
    : 0;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
      onClick={() => onBook(property)}
    >
      <div className="relative h-72 overflow-hidden">
        <img 
          src={property.images[0] || `https://picsum.photos/seed/${property.id}/800/600`} 
          alt={property.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        {property.vrTourUrl && (
          <div className="absolute top-4 left-4 glass-effect bg-white/30 px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/20">
            <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>view_in_ar</span>
            <span className="text-white text-[11px] font-bold tracking-widest uppercase">VR Tour</span>
          </div>
        )}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {property.isFeatured && (
            <span className="bg-emerald-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
              <Sparkles size={12} /> Featured
            </span>
          )}
          <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
            <Star size={12} className={avgRating > 0 ? "fill-amber-400 text-amber-400" : "text-stone-300"} />
            <span className="text-[10px] font-bold text-stone-800">{avgRating > 0 ? avgRating.toFixed(1) : 'New'}</span>
          </div>
        </div>
        <div className="absolute bottom-4 left-4 flex gap-2">
          <span className={`px-3 py-1 rounded-lg backdrop-blur-md text-white text-xs font-bold tracking-tight ${
            property.status === 'available' ? 'bg-emerald-900/80' : 'bg-red-900/80'
          }`}>
            {property.status === 'available' ? 'Verified' : 'Rented'}
          </span>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-headline font-bold text-xl text-on-surface group-hover:text-primary transition-colors">{property.title}</h3>
            <div className="flex items-center gap-1 text-secondary mt-1">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              <span className="text-sm">{property.location}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-primary font-extrabold text-xl tracking-tight">UGX {property.rent.toLocaleString()}</p>
            <p className="text-secondary text-[10px] font-bold uppercase tracking-widest">Per Month</p>
          </div>
        </div>
        
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-secondary">
              <span className="material-symbols-outlined text-[18px]">bed</span>
              <span className="text-xs font-semibold">{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1.5 text-secondary">
              <span className="material-symbols-outlined text-[18px]">bathtub</span>
              <span className="text-xs font-semibold">{property.bathrooms}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {isOwner && onUpdateStatus && (
              <button 
                onClick={(e) => { e.stopPropagation(); onUpdateStatus(property.id, property.status === 'available' ? 'rented' : 'available'); }}
                className="bg-surface-container-low text-primary px-4 py-2 rounded-xl font-bold text-xs active:scale-95 transition-all"
              >
                {property.status === 'available' ? 'Mark Rented' : 'Mark Available'}
              </button>
            )}
            {isOwner && onBoost && !property.isFeatured && (
              <button 
                onClick={(e) => { e.stopPropagation(); onBoost(property.id); }}
                className="bg-amber-100 text-amber-800 px-4 py-2 rounded-xl font-bold text-xs active:scale-95 transition-all flex items-center gap-1"
              >
                <Sparkles size={12} /> Boost
              </button>
            )}
            {!isOwner && (
              <button className="primary-gradient text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/10 active:scale-95 transition-all">
                Book Now
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const VerifyEmail = ({ user, onResend }: { user: any, onResend: () => void }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-secondary p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center"
      >
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="text-emerald-800" size={40} />
        </div>
        <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">Verify Your Email</h2>
        <p className="text-stone-600 mb-8">
          We've sent a verification link to <span className="font-semibold">{user.email}</span>. 
          Please check your inbox and click the link to activate your account.
        </p>
        <div className="space-y-4">
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-emerald-800 text-white py-4 rounded-2xl font-medium hover:bg-emerald-900 transition-all shadow-md active:scale-95"
          >
            I've Verified My Email
          </button>
          <button 
            onClick={onResend}
            className="w-full bg-stone-100 text-stone-600 py-4 rounded-2xl font-medium hover:bg-stone-200 transition-all active:scale-95"
          >
            Resend Verification Email
          </button>
        </div>
        <p className="mt-8 text-sm text-stone-400">
          Didn't receive the email? Check your spam folder or try resending.
        </p>
      </motion.div>
    </div>
  );
};

const ProfileView = ({ profile, onRestartTour }: { profile: UserProfile, onRestartTour: () => void }) => {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-[40px] p-8 shadow-xl border border-stone-100">
      <div className="flex flex-col items-center mb-8">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-100 mb-4">
          <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-stone-900">{profile.displayName}</h2>
        <p className="text-stone-500 capitalize">{profile.role}</p>
      </div>
      
      <div className="space-y-6">
        <div className="p-6 bg-stone-50 rounded-3xl">
          <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Account Details</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-stone-500">Email</span>
              <span className="font-medium text-stone-900">{profile.email}</span>
            </div>
            {profile.phoneNumber && (
              <div className="flex justify-between">
                <span className="text-stone-500">Phone</span>
                <span className="font-medium text-stone-900">{profile.phoneNumber}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-stone-500">Joined</span>
              <span className="font-medium text-stone-900">{format(new Date(profile.createdAt), 'MMMM dd, yyyy')}</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100">
          <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-4">Help & Support</h4>
          <button 
            onClick={onRestartTour}
            className="w-full bg-white text-emerald-800 py-4 rounded-2xl font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 border border-emerald-100 shadow-sm"
          >
            <Sparkles size={20} /> Restart Guided Tour
          </button>
        </div>
      </div>
    </div>
  );
};

const RoleSelection = ({ user, onComplete }: { user: any, onComplete: (data: Partial<UserProfile>) => void }) => {
  const [role, setRole] = useState<UserRole>('tenant');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState(user?.displayName || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({ role, phoneNumber: phone, displayName: name });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-10">
        <img 
          src="https://picsum.photos/seed/kampala-suburbs/1920/1080" 
          alt="Role Selection Background" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="max-w-4xl w-full relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-stone-900 mb-4">Complete Your Profile</h2>
          <p className="text-stone-600">Tell us a bit more about yourself to get started</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-sm p-10 rounded-[40px] shadow-2xl border border-stone-100">
          <div className="grid md:grid-cols-2 gap-12 mb-10">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-3 bg-stone-100 border border-stone-200 rounded-2xl text-stone-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input 
                    type="tel" 
                    required 
                    placeholder="+256 ..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-stone-700 mb-4">Select Your Role</label>
              <div className="grid gap-4">
                <button 
                  type="button"
                  onClick={() => setRole('tenant')}
                  className={`p-6 rounded-3xl border-2 text-left transition-all ${role === 'tenant' ? 'border-emerald-800 bg-emerald-50' : 'border-stone-100 hover:border-stone-200'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === 'tenant' ? 'bg-emerald-800 text-white' : 'bg-stone-100 text-stone-500'}`}>
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900">I'm a Tenant</h4>
                      <p className="text-xs text-stone-500">Find and book rental properties</p>
                    </div>
                  </div>
                </button>

                <button 
                  type="button"
                  onClick={() => setRole('landlord')}
                  className={`p-6 rounded-3xl border-2 text-left transition-all ${role === 'landlord' ? 'border-emerald-800 bg-emerald-50' : 'border-stone-100 hover:border-stone-200'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === 'landlord' ? 'bg-emerald-800 text-white' : 'bg-stone-100 text-stone-500'}`}>
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900">I'm a Landlord</h4>
                      <p className="text-xs text-stone-500">List and manage your properties</p>
                    </div>
                  </div>
                </button>

                {user?.email === 'realevrug@gmail.com' && (
                  <button 
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`p-6 rounded-3xl border-2 text-left transition-all ${role === 'admin' ? 'border-emerald-800 bg-emerald-50' : 'border-stone-100 hover:border-stone-200'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === 'admin' ? 'bg-emerald-800 text-white' : 'bg-stone-100 text-stone-500'}`}>
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900">I'm an Admin</h4>
                        <p className="text-xs text-stone-500">Full platform control and analytics</p>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-emerald-800 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-900 transition-all shadow-lg active:scale-95"
          >
            Complete Setup
          </button>
        </form>
      </div>
    </div>
  );
};

const AnalyticsView = ({ properties, bookings, inquiries }: { properties: Property[], bookings: Booking[], inquiries: Inquiry[] }) => {
  const totalRevenue = bookings.filter(b => b.status === 'confirmed').reduce((acc, b) => acc + b.totalPrice, 0);
  const occupancyRate = properties.length > 0 ? (properties.filter(p => p.status === 'rented').length / properties.length) * 100 : 0;
  
  const totalViews = properties.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalInquiries = inquiries.length;
  const inquiryRate = totalViews > 0 ? (totalInquiries / totalViews) * 100 : 0;
  
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const conversionRate = totalInquiries > 0 ? (confirmedBookings / totalInquiries) * 100 : 0;

  const bookingTrends = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun
  bookings.forEach(b => {
    const date = new Date(b.createdAt);
    const day = (date.getDay() + 6) % 7; // Convert Sun-Sat (0-6) to Mon-Sun (0-6)
    bookingTrends[day]++;
  });
  const maxBookings = Math.max(...bookingTrends, 1);

  const [isTriggering, setIsTriggering] = useState(false);

  const handleTriggerReminders = async () => {
    setIsTriggering(true);
    try {
      const response = await fetch('/api/admin/test-reminders', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        alert(`Successfully sent ${data.sentCount} reminder emails.`);
      } else {
        alert('Failed to send reminders.');
      }
    } catch (error) {
      console.error('Error triggering reminders:', error);
      alert('Error triggering reminders.');
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-stone-50 p-6 rounded-3xl border border-stone-100">
        <div>
          <h3 className="text-xl font-serif font-bold text-stone-900">Admin Controls</h3>
          <p className="text-stone-500 text-sm">System-wide automated tasks and triggers.</p>
        </div>
        <button 
          onClick={handleTriggerReminders}
          disabled={isTriggering}
          className="bg-emerald-800 text-white px-6 py-3 rounded-2xl font-medium hover:bg-emerald-900 transition-all flex items-center gap-2 shadow-md active:scale-95 disabled:opacity-50"
        >
          <Bell size={18} /> {isTriggering ? 'Sending...' : 'Trigger Daily Reminders'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-800 mb-4">
            <TrendingUp size={20} />
          </div>
          <p className="text-stone-500 text-sm font-medium">Total Revenue</p>
          <h4 className="text-2xl font-bold text-stone-900 mt-1">UGX {totalRevenue.toLocaleString()}</h4>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-800 mb-4">
            <Activity size={20} />
          </div>
          <p className="text-stone-500 text-sm font-medium">Occupancy Rate</p>
          <h4 className="text-2xl font-bold text-stone-900 mt-1">{occupancyRate.toFixed(1)}%</h4>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-800 mb-4">
            <Users size={20} />
          </div>
          <p className="text-stone-500 text-sm font-medium">Active Bookings</p>
          <h4 className="text-2xl font-bold text-stone-900 mt-1">{bookings.filter(b => b.status === 'confirmed').length}</h4>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-800 mb-4">
            <Home size={20} />
          </div>
          <p className="text-stone-500 text-sm font-medium">Total Properties</p>
          <h4 className="text-2xl font-bold text-stone-900 mt-1">{properties.length}</h4>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-stone-100 shadow-sm">
          <h3 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-emerald-800" /> Booking Trends
          </h3>
          <div className="h-64 flex items-end gap-2 px-4">
            {bookingTrends.map((count, i) => {
              const height = (count / maxBookings) * 100;
              return (
                <div key={i} className="flex-1 bg-emerald-100 rounded-t-lg relative group transition-all hover:bg-emerald-800">
                  <div style={{ height: `${Math.max(height, 5)}%` }} className="w-full bg-emerald-800/20 group-hover:bg-emerald-800 transition-all rounded-t-lg" />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {count} bookings
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-4 px-4 text-[10px] text-stone-400 font-bold uppercase tracking-widest">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-stone-100 shadow-sm">
          <h3 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
            <Users size={20} className="text-emerald-800" /> User Engagement
          </h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm text-stone-600">Total Property Views</span>
              </div>
              <span className="font-bold">{totalViews.toLocaleString()}</span>
            </div>
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: '100%' }} />
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-sm text-stone-600">Inquiry Rate</span>
              </div>
              <span className="font-bold">{inquiryRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full" style={{ width: `${Math.min(inquiryRate * 5, 100)}%` }} />
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-sm text-stone-600">Booking Conversion</span>
              </div>
              <span className="font-bold">{conversionRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full" style={{ width: `${Math.min(conversionRate * 5, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewList = ({ reviews }: { reviews: Review[] }) => {
  return (
    <div className="space-y-4 mt-6">
      <h4 className="font-serif font-bold text-stone-900 flex items-center gap-2">
        <Star size={18} className="text-amber-400 fill-amber-400" /> Reviews ({reviews.length})
      </h4>
      {reviews.length === 0 ? (
        <p className="text-stone-400 text-sm italic">No reviews yet for this property.</p>
      ) : (
        <div className="grid gap-4">
          {reviews.map(review => (
            <div key={review.id} className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-stone-200 overflow-hidden">
                    {review.tenantPhoto ? (
                      <img src={review.tenantPhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs font-bold">
                        {review.tenantName[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-900">{review.tenantName}</p>
                    <p className="text-[10px] text-stone-400">{format(new Date(review.createdAt), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star 
                      key={s} 
                      size={12} 
                      className={s <= review.rating ? "fill-amber-400 text-amber-400" : "text-stone-200"} 
                    />
                  ))}
                </div>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const UsersManagementView = ({ users, onUpdateRole }: { users: UserProfile[], onUpdateRole: (userId: string, newRole: UserRole) => void }) => {
  return (
    <div className="bg-white rounded-[40px] border border-stone-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-stone-100">
        <h3 className="text-2xl font-serif font-bold text-stone-900">User Management</h3>
        <p className="text-stone-500 mt-1">Manage platform users and their access permissions.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50">
              <th className="px-8 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">User</th>
              <th className="px-8 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Email</th>
              <th className="px-8 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Role</th>
              <th className="px-8 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Joined</th>
              <th className="px-8 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.uid} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold overflow-hidden">
                      {u.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full object-cover" /> : u.displayName[0]}
                    </div>
                    <span className="font-bold text-stone-900">{u.displayName}</span>
                  </div>
                </td>
                <td className="px-8 py-4 text-stone-600 text-sm">{u.email}</td>
                <td className="px-8 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                    u.role === 'landlord' ? 'bg-blue-100 text-blue-800' : 
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-8 py-4 text-stone-400 text-xs">{format(new Date(u.createdAt), 'MMM dd, yyyy')}</td>
                <td className="px-8 py-4 text-right">
                  <select 
                    value={u.role}
                    onChange={(e) => onUpdateRole(u.uid, e.target.value as UserRole)}
                    className="bg-stone-100 border-none rounded-xl text-xs font-bold px-3 py-2 focus:ring-2 focus:ring-emerald-800/20 outline-none cursor-pointer"
                  >
                    <option value="tenant">Tenant</option>
                    <option value="landlord">Landlord</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const InquirySection = ({ profile, inquiries }: { profile: UserProfile, inquiries: Inquiry[] }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'inquiries'), {
        userId: profile.uid,
        userEmail: profile.email,
        userRole: profile.role,
        subject,
        message,
        status: 'new',
        createdAt: new Date().toISOString()
      });
      setSubject('');
      setMessage('');
      alert('Inquiry submitted successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'inquiries');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-12">
      <div className="lg:col-span-1 space-y-8">
        <div className="bg-emerald-900 text-white p-8 rounded-[40px] shadow-xl">
          <h3 className="text-2xl font-serif font-bold mb-4">Terms & Conditions</h3>
          <div className="space-y-4 text-emerald-100/80 text-sm leading-relaxed">
            <p>1. <strong>Verification:</strong> All properties listed are verified by our team. Fraudulent listings will be removed and reported.</p>
            <p>2. <strong>VR Tours:</strong> VR tours are for visualization. Physical inspection is recommended before final payment.</p>
            <p>3. <strong>Legal Implications:</strong> By using SRBS, both parties agree to abide by the Landlord and Tenant Act of Uganda. Disputes will be mediated by our legal department before court action.</p>
            <p>4. <strong>Tenant Requirements:</strong> Tenants must provide valid national ID/Passport and proof of income. Subletting without landlord consent is strictly prohibited.</p>
            <p>5. <strong>Landlord Requirements:</strong> Landlords must ensure properties are habitable, secure, and have functional utilities. Maintenance issues must be addressed within 48 hours.</p>
            <p>6. <strong>Liability:</strong> SRBS is not liable for damages to property or loss of personal items. Tenants are responsible for their belongings.</p>
            <p>7. <strong>Cancellations:</strong> Refunds are subject to a 10% administrative fee if cancelled within 7 days of check-in.</p>
            <p>8. <strong>Contact:</strong> For urgent matters, contact Mr. Barasa Fahad at 0707836957 or 0791125934.</p>
          </div>
          <button className="mt-8 flex items-center gap-2 text-white font-bold hover:underline">
            <FileText size={18} /> Read Full Document
          </button>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-stone-100 shadow-sm">
          <h3 className="text-xl font-serif font-bold mb-6">Your Inquiries</h3>
          <div className="space-y-4">
            {inquiries.map(inq => (
              <div key={inq.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-bold text-stone-900 text-sm">{inq.subject}</h5>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    inq.status === 'new' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {inq.status}
                  </span>
                </div>
                <p className="text-xs text-stone-500 line-clamp-2">{inq.message}</p>
                <p className="text-[10px] text-stone-400 mt-2">{format(new Date(inq.createdAt), 'MMM dd, HH:mm')}</p>
              </div>
            ))}
            {inquiries.length === 0 && <p className="text-stone-400 text-sm text-center py-4">No inquiries yet.</p>}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white p-10 rounded-[40px] border border-stone-100 shadow-sm">
          <h3 className="text-2xl font-serif font-bold mb-2">Submit an Inquiry</h3>
          <p className="text-stone-500 mb-8">Have a question? Our support team is here to help.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Subject</label>
              <input 
                type="text" 
                required 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Booking Issue, Property Verification"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Message</label>
              <textarea 
                required 
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your inquiry in detail..."
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 resize-none"
              />
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-800 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-900 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Submitting...' : <><MessageSquare size={20} /> Send Inquiry</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const PaymentsView = ({ 
  payments, 
  onConfirm, 
  onUploadReceipt,
  profile,
  properties,
  bookings
}: { 
  payments: Payment[], 
  onConfirm: (p: Payment) => void,
  onUploadReceipt: (paymentId: string, file: File) => Promise<void>,
  profile: UserProfile,
  properties: Property[],
  bookings: Booking[]
}) => {
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, paymentId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingId(paymentId);
    try {
      await onUploadReceipt(paymentId, file);
      alert('Receipt uploaded successfully! The landlord has been notified.');
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingId(null);
      setCurrentPaymentId(null);
      e.target.value = '';
    }
  };

  const totalPaid = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8">
      <input 
        type="file" 
        id="receipt-upload"
        className="hidden"
        onChange={(e) => currentPaymentId && handleFileChange(e, currentPaymentId)}
        accept="image/*,application/pdf"
      />

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-emerald-800 text-white p-8 rounded-[40px] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <h4 className="text-emerald-100/60 text-xs font-bold uppercase tracking-widest mb-2">Total Received/Paid</h4>
          <p className="text-4xl font-serif font-bold">UGX {totalPaid.toLocaleString()}</p>
          <div className="mt-6 flex items-center gap-2 text-emerald-100/80 text-sm">
            <CheckCircle2 size={16} /> Verified Payments
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-stone-100 shadow-sm">
          <h4 className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-2">Pending Confirmation</h4>
          <p className="text-4xl font-serif font-bold text-stone-900">UGX {pendingAmount.toLocaleString()}</p>
          <div className="mt-6 flex items-center gap-2 text-amber-600 text-sm font-bold">
            <Activity size={16} /> {payments.filter(p => p.status === 'pending').length} Transactions Pending
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[40px] border border-stone-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-serif font-bold flex items-center gap-2 text-stone-900">
            <CreditCard size={24} className="text-emerald-800" /> Payment History
          </h3>
          <div className="flex gap-2">
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
              <CheckCircle2 size={12} /> Received
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full">
              <Activity size={12} /> Paid (Pending)
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="pb-4 font-serif font-bold text-stone-900">Property</th>
                <th className="pb-4 font-serif font-bold text-stone-900">Amount</th>
                <th className="pb-4 font-serif font-bold text-stone-900">Receipt</th>
                <th className="pb-4 font-serif font-bold text-stone-900">Status</th>
                <th className="pb-4 font-serif font-bold text-stone-900">Date</th>
                <th className="pb-4 font-serif font-bold text-stone-900 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {payments.map(payment => {
                const booking = bookings.find(b => b.id === payment.bookingId);
                const property = properties.find(p => p.id === booking?.propertyId);
                return (
                  <tr key={payment.id} className="group hover:bg-stone-50 transition-colors">
                    <td className="py-4">
                      <p className="font-bold text-stone-900">{property?.title || 'Rental Unit'}</p>
                      <p className="text-xs text-stone-400">ID: {payment.transactionId}</p>
                    </td>
                    <td className="py-4">
                      <span className="font-bold text-emerald-800">UGX {payment.amount.toLocaleString()}</span>
                    </td>
                    <td className="py-4">
                      {payment.receiptUrl ? (
                        <a 
                          href={payment.receiptUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-emerald-800 hover:text-emerald-900 text-xs font-bold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors w-fit"
                        >
                          <FileText size={14} /> View Receipt
                        </a>
                      ) : (
                        <button 
                          onClick={() => {
                            setCurrentPaymentId(payment.id);
                            document.getElementById('receipt-upload')?.click();
                          }}
                          disabled={uploadingId === payment.id}
                          className="text-stone-400 hover:text-emerald-800 transition-colors flex items-center gap-1 text-xs font-bold"
                        >
                          {uploadingId === payment.id ? (
                            <div className="w-4 h-4 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <><Upload size={14} /> Upload</>
                          )}
                        </button>
                      )}
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        payment.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 
                        payment.status === 'failed' ? 'bg-red-100 text-red-800' : 
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {payment.status === 'completed' ? 'Received' : payment.status === 'pending' ? 'Paid' : payment.status}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-stone-500">
                      {format(new Date(payment.createdAt), 'MMM dd, HH:mm')}
                    </td>
                    <td className="py-4 text-right">
                      {payment.status === 'pending' && (profile.role === 'admin' || profile.role === 'landlord') && (
                        <button 
                          onClick={() => onConfirm(payment)}
                          className="bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-900 transition-all shadow-md active:scale-95 whitespace-nowrap"
                        >
                          Confirm Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-stone-400 italic">
                    No payment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-amber-50 p-8 rounded-[40px] border border-amber-100 flex flex-col md:flex-row items-center gap-8">
        <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center text-amber-600 shrink-0">
          <CreditCard size={40} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-xl font-serif font-bold text-stone-900 mb-2">Secure Payment via Flutterwave</h4>
          <p className="text-stone-500 text-sm mb-6">
            All payments (Rent Deposits & Property Boosts) are processed securely through Flutterwave. 
            After making a payment, please upload your receipt in the table above for verification.
          </p>
          <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
            <a 
              href="https://flutterwave.com/pay/kqzjo6m6yy4x" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-amber-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-amber-700 transition-all shadow-lg active:scale-95"
            >
              Pay Now <ChevronRight size={18} />
            </a>
            <div className="flex flex-col text-[10px] text-amber-800 font-bold uppercase tracking-widest">
              <span>Finance Manager: Mr. Barasa Fahad</span>
              <span>0707836957 / 0791125934</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- AI Assistant Component ---

const AIAssistant = ({ user, profile }: { user: any, profile: UserProfile | null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [useSearch, setUseSearch] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: "Hello! I'm your SRBS Smart Assistant. How can I help you find your perfect home in Uganda today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMessage,
        config: {
          systemInstruction: "You are a helpful real estate assistant for SRBS (Smart Rental Booking System) in Uganda. You help users find properties, explain the rental process in Uganda, and answer questions about the platform. Be professional, friendly, and knowledgeable about Ugandan real estate (Kampala, Entebbe, Jinja, etc.). Mention features like VR tours, secure payments via Flutterwave, and verified listings. Keep responses concise and helpful.",
          tools: useSearch ? [{ googleSearch: {} }] : undefined,
        },
      });

      const botResponse = response.text || "I'm sorry, I couldn't process that. Please try again.";
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'bot', text: "I'm having a bit of trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSupport = async () => {
    if (!user) {
      alert("Please sign in to contact support.");
      return;
    }
    
    try {
      // Find admin to notify
      const q = query(collection(db, 'users'), where('role', '==', 'admin'));
      const adminSnap = await getDocs(q);
      const adminId = adminSnap.docs[0]?.id || 'system';

      await addDoc(collection(db, 'inquiries'), {
        userId: user.uid,
        userEmail: user.email,
        subject: "AI Assistant Help Request",
        message: `User requested help after AI chat. Last message: ${messages[messages.length - 1]?.text}`,
        status: 'new',
        createdAt: new Date().toISOString(),
        type: 'support'
      });

      setMessages(prev => [...prev, { role: 'bot', text: "I've forwarded your request to our human support team. They'll get back to you via email soon!" }]);
    } catch (error) {
      console.error("Support Error:", error);
      alert("Failed to send support request.");
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-emerald-800 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50 group"
      >
        <Bot size={32} />
        <span className="absolute right-20 bg-stone-900 text-white px-4 py-2 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Ask AI Assistant
        </span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-8 right-8 w-[400px] bg-white rounded-[40px] shadow-2xl border border-stone-100 overflow-hidden z-50 transition-all duration-300 ${isMinimized ? 'h-20' : 'h-[600px]'}`}>
      <div className="bg-emerald-800 p-6 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-serif font-bold">SRBS Assistant</h3>
            <p className="text-[10px] text-emerald-200 uppercase tracking-widest font-bold">Powered by AI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setUseSearch(!useSearch)} 
            className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${useSearch ? 'bg-emerald-500 text-stone-900' : 'hover:bg-white/10'}`}
            title="Toggle Google Search Grounding"
          >
            <Search size={14} /> {useSearch ? 'Search ON' : 'Search OFF'}
          </button>
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 h-[380px] overflow-y-auto p-6 space-y-4 bg-stone-50/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-emerald-800 text-white rounded-tr-none' 
                    : 'bg-white text-stone-700 shadow-sm border border-stone-100 rounded-tl-none'
                }`}>
                  <div className="markdown-body">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-3xl rounded-tl-none shadow-sm border border-stone-100">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-6 border-t border-stone-100 bg-white space-y-4">
            <div className="flex justify-center">
              <button 
                onClick={handleContactSupport}
                className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-emerald-800 transition-colors flex items-center gap-2"
              >
                <HelpCircle size={14} /> Need human help? Contact Support
              </button>
            </div>
            <div className="relative">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="w-full px-6 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 pr-14"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-2 w-10 h-10 bg-emerald-800 text-white rounded-xl flex items-center justify-center hover:bg-emerald-900 transition-all disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default function App() {
  const tourSteps = [
    {
      selector: '[data-tour="welcome"]',
      content: 'Welcome to SRBS! Your smart rental booking system for Uganda.',
    },
    {
      selector: '[data-tour="explore"]',
      content: 'Browse through our curated list of properties in Kampala and beyond.',
    },
    {
      selector: '[data-tour="bookings"]',
      content: 'Manage your active rentals and booking requests here.',
    },
    {
      selector: '[data-tour="notifications"]',
      content: 'Stay updated with real-time notifications about your bookings and payments.',
    },
    {
      selector: '[data-tour="profile"]',
      content: 'Access your profile and account settings anytime.',
    },
  ];

  return (
    <TourProvider 
      steps={tourSteps}
      styles={{
        popover: (base) => ({
          ...base,
          borderRadius: '24px',
          padding: '24px',
          backgroundColor: '#ffffff',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        }),
        maskArea: (base) => ({
          ...base,
          rx: 24,
        }),
      }}
    >
      <AppContent />
    </TourProvider>
  );
}

function AppContent() {
  const { setIsOpen } = useTour();
  const [user, loading, error] = useAuthState(auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isVRTourOpen, setIsVRTourOpen] = useState(false);
  const [activeTourProperty, setActiveTourProperty] = useState<Property | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const currentView = location.pathname === '/' ? 'landing' : location.pathname.split('/')[1] || 'properties';

  const handleViewChange = (view: string) => {
    if (view === 'landing') {
      navigate('/');
    } else {
      navigate(`/${view}`);
    }
  };

  const getHeaderInfo = () => {
    switch (currentView) {
      case 'analytics':
        return { title: 'System Analytics', desc: 'Monitor platform performance and user engagement' };
      case 'users':
        return { title: 'User Management', desc: 'Manage platform users and their roles' };
      case 'properties':
        return { 
          title: profile?.role === 'landlord' ? 'My Properties' : profile?.role === 'admin' ? 'Property Inventory' : 'Available Properties', 
          desc: profile?.role === 'landlord' ? 'Manage your listings and track performance' : 'Explore the best rentals in Kampala and beyond' 
        };
      case 'bookings':
        return { title: 'Bookings & Reservations', desc: 'Manage property bookings and schedules' };
      case 'payments':
        return { title: 'Financial Overview', desc: 'Track payments, deposits and escrow status' };
      case 'inquiries':
        return { title: 'Customer Inquiries', desc: 'Respond to potential tenants and manage leads' };
      default:
        return { title: 'Dashboard', desc: 'Welcome back to your real estate portal' };
    }
  };

  const { title: headerTitle, desc: headerDesc } = getHeaderInfo();

  const [isAuthReady, setIsAuthReady] = useState(false);
  const [selectedBookingForReceipt, setSelectedBookingForReceipt] = useState<Booking | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedPropertyForReview, setSelectedPropertyForReview] = useState<Property | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isPaying, setIsPaying] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [contactProperty, setContactProperty] = useState<Property | null>(null);
  const [isBoosting, setIsBoosting] = useState<string | null>(null);
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [selectedPropertyForBoost, setSelectedPropertyForBoost] = useState<Property | null>(null);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const generateAIDescription = async (title: string, location: string) => {
    if (!title || !location) {
      alert("Please provide a title and location first to generate a description.");
      return;
    }

    setIsGeneratingDescription(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a professional and enticing real estate description for a property in Uganda with the following details:
        Title: ${title}
        Location: ${location}
        
        The description should highlight modern features, security, and convenience. Keep it under 150 words.`,
      });

      const description = response.text || "";
      const textarea = document.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
      if (textarea) {
        textarea.value = description;
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      alert("Failed to generate description. Please try again.");
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // Auth & Profile Sync
  useEffect(() => {
    if (loading) return;
    
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          
          // Auto-promote master account to admin if not already
          if (user.email === 'realevrug@gmail.com' && data.role !== 'admin') {
            updateDoc(userDocRef, { role: 'admin' }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`));
            return; // onSnapshot will trigger again
          }

          // Sync email verification status
          if (user.emailVerified && !data.emailVerified) {
            updateDoc(userDocRef, { emailVerified: true }).catch(err => console.error('Error syncing emailVerified:', err));
          }

          setProfile(data);
          
          // Trigger tour if not seen
          if (!data.hasSeenTour && user.emailVerified) {
            setTimeout(() => setIsOpen(true), 1500);
            updateDoc(userDocRef, { hasSeenTour: true }).catch(err => console.error('Error updating tour status:', err));
          }

          // If admin, default to analytics
          if (data.role === 'admin' && currentView === 'properties') {
            handleViewChange('analytics');
          }
        } else {
          setProfile(null);
        }
        setIsAuthReady(true);
      }, (err) => handleFirestoreError(err, OperationType.GET, `users/${user.uid}`));
      return () => unsubscribe();
    } else {
      setProfile(null);
      setIsAuthReady(true);
    }
  }, [user, loading]);

  // Properties Sync & Seeding
  useEffect(() => {
    if (!isAuthReady || !user) {
      if (properties.length > 0) setProperties([]);
      return;
    }
    
    const q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty && profile?.role === 'admin') {
        // Seed some properties if empty and user is admin
        const seedProperties = [
          {
            title: "Villy Vu Residentials - Unit A",
            description: "Modern 2-bedroom apartment with a stunning view of Nakawa. Features include a spacious living room, modern kitchen, and 24/7 security.",
            rent: 1200000,
            location: "Nakawa, Kampala",
            landlordId: user?.uid || 'system',
            images: ["https://picsum.photos/seed/villy1/800/600"],
            vrTourUrl: "https://kuula.co/share/collection/7vX9z?logo=1&info=1&fs=1&vr=1&sd=1&thumbs=1",
            arModelUrl: "https://example.com/ar-model-1",
            status: "available",
            isPremium: true,
            views: 0,
            createdAt: new Date().toISOString()
          },
          {
            title: "Hillside Heights Apartment",
            description: "Luxury 3-bedroom penthouse with premium finishes and access to a rooftop pool. Perfect for young professionals.",
            rent: 2500000,
            location: "Kololo, Kampala",
            landlordId: user?.uid || 'system',
            images: ["https://picsum.photos/seed/villy2/800/600"],
            vrTourUrl: "https://kuula.co/share/collection/7vX9z?logo=1&info=1&fs=1&vr=1&sd=1&thumbs=1",
            arModelUrl: "https://example.com/ar-model-2",
            status: "available",
            isPremium: false,
            views: 0,
            createdAt: new Date().toISOString()
          }
        ];
        for (const p of seedProperties) {
          try {
            await addDoc(collection(db, 'properties'), p);
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, 'properties');
          }
        }
      }
      const props = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
      setProperties(props);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'properties'));
    
    return () => unsubscribe();
  }, [isAuthReady, profile, user]);

  // Notifications Sync
  useEffect(() => {
    if (!isAuthReady || !user) {
      setNotifications([]);
      return;
    }

    const q = query(
      collection(db, 'notifications'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      setNotifications(notifs);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'notifications'));

    return () => unsubscribe();
  }, [isAuthReady, user]);

  // Inquiries Sync
  useEffect(() => {
    if (!isAuthReady || !profile || !user) {
      setInquiries([]);
      return;
    }

    let q;
    if (profile.role === 'admin') {
      q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
    } else if (profile.role === 'landlord') {
      q = query(
        collection(db, 'inquiries'), 
        or(where('userId', '==', user.uid), where('landlordId', '==', user.uid)),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'inquiries'), 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const inqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inquiry));
      setInquiries(inqs);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'inquiries'));

    return () => unsubscribe();
  }, [isAuthReady, profile, user]);

  // All Users Sync (Admin only)
  useEffect(() => {
    if (!isAuthReady || profile?.role !== 'admin') {
      setAllUsers([]);
      return;
    }

    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ ...doc.data() } as UserProfile));
      setAllUsers(users);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));

    return () => unsubscribe();
  }, [isAuthReady, profile]);

  const createNotification = async (userId: string, title: string, message: string, type: 'booking' | 'payment' | 'system', link?: string) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        title,
        message,
        type,
        read: false,
        createdAt: new Date().toISOString(),
        link
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'notifications');
    }
  };

  // Reviews Sync
  useEffect(() => {
    if (!isAuthReady) return;
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'reviews'));
    return () => unsubscribe();
  }, [isAuthReady]);

  // Bookings Sync
  useEffect(() => {
    if (!isAuthReady || !user || !profile) return;

    let q;
    if (profile.role === 'admin') {
      q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    } else if (profile.role === 'landlord') {
      q = query(collection(db, 'bookings'), where('landlordId', '==', user.uid), orderBy('createdAt', 'desc'));
    } else {
      q = query(collection(db, 'bookings'), where('tenantId', '==', user.uid), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setBookings(bks);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'bookings'));

    return () => unsubscribe();
  }, [isAuthReady, user, profile]);

  // Payments Sync
  useEffect(() => {
    if (!isAuthReady || !user || !profile) return;
    
    let q;
    if (profile.role === 'admin') {
      q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
    } else if (profile.role === 'landlord') {
      q = query(collection(db, 'payments'), where('landlordId', '==', user.uid), orderBy('createdAt', 'desc'));
    } else {
      q = query(collection(db, 'payments'), where('tenantId', '==', user.uid), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
      setPayments(pms);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'payments'));

    return () => unsubscribe();
  }, [isAuthReady, user, profile]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err) {
      console.error('Login Error:', err);
    }
  };

  const handleResendVerification = async () => {
    if (!user) return;
    try {
      await sendEmailVerification(user);
      alert('Verification email sent! Please check your inbox.');
    } catch (err) {
      console.error('Error sending verification email:', err);
      alert('Failed to send verification email. Please try again later.');
    }
  };

  const handleOnboardingComplete = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: data.displayName || user.displayName || 'User',
      phoneNumber: data.phoneNumber,
      role: data.role as UserRole,
      photoURL: user.photoURL || '',
      emailVerified: user.emailVerified,
      hasSeenTour: false,
      createdAt: new Date().toISOString()
    };
    
    try {
      await setDoc(doc(db, 'users', user.uid), newProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedProperty) return;

    const booking: Omit<Booking, 'id'> = {
      propertyId: selectedProperty.id,
      tenantId: user.uid,
      landlordId: selectedProperty.landlordId,
      checkInDate: new Date().toISOString(),
      checkOutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      totalPrice: selectedProperty.rent,
      depositPaid: false,
      escrowStatus: 'none',
      occupied: false,
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'bookings'), booking);
      await createNotification(
        selectedProperty.landlordId,
        'New Booking Request',
        `You have a new booking request for ${selectedProperty.title}`,
        'booking',
        'bookings'
      );
      setIsBookingModalOpen(false);
      
      const paymentUrl = "https://flutterwave.com/pay/kqzjo6m6yy4x";
      if (confirm('Booking request sent! To secure your booking, you need to pay the rent deposit. Would you like to pay now via Flutterwave?')) {
        window.open(paymentUrl, '_blank');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'bookings');
    }
  };

  const handleAddProperty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    setIsUploading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const imageUrls: string[] = [];
      
      // Upload images to Firebase Storage
      for (const file of selectedFiles) {
        const storageRef = ref(storage, `properties/${Date.now()}-${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        imageUrls.push(downloadURL);
      }

      // Fallback if no images are uploaded
      if (imageUrls.length === 0) {
        imageUrls.push(`https://picsum.photos/seed/${Math.random()}/800/600`);
      }

      const newProperty: Omit<Property, 'id'> = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        rent: Number(formData.get('rent')),
        location: formData.get('location') as string,
        landlordId: user.uid,
        images: imageUrls,
        vrTourUrl: formData.get('vrTourUrl') as string || '',
        arModelUrl: 'https://example.com/ar-model',
        status: 'available',
        isPremium: false,
        isFeatured: false,
        views: 0,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'properties'), newProperty);
      setIsAddPropertyModalOpen(false);
      setSelectedFiles([]);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'properties');
    } finally {
      setIsUploading(false);
    }
  };

  const handleBookingStatus = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    try {
      const updateData: any = { status };
      if (status === 'confirmed') {
        updateData.confirmedAt = new Date().toISOString();
      }
      await updateDoc(doc(db, 'bookings', bookingId), updateData);
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        const prop = properties.find(p => p.id === booking.propertyId);
        await createNotification(
          booking.tenantId,
          `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          `Your booking for ${prop?.title || 'a property'} has been ${status}`,
          'booking',
          'bookings'
        );
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${bookingId}`);
    }
  };

  const handlePayment = async (booking: Booking) => {
    if (!user) return;
    
    // Open Flutterwave payment link
    window.open('https://flutterwave.com/pay/kqzjo6m6yy4x', '_blank');
    
    setIsPaying(true);
    
    const depositAmount = booking.totalPrice * 3;
    const transactionId = `FLW-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    try {
      // 1. Create Pending Payment Record
      await addDoc(collection(db, 'payments'), {
        bookingId: booking.id,
        tenantId: user.uid,
        landlordId: booking.landlordId,
        amount: depositAmount,
        currency: 'UGX',
        status: 'pending',
        type: 'deposit',
        transactionId,
        createdAt: new Date().toISOString()
      });

      // 2. Notify Landlord
      await createNotification(
        booking.landlordId,
        'Payment Initiated',
        `Tenant has initiated a payment of ${depositAmount.toLocaleString()} UGX for ${properties.find(p => p.id === booking.propertyId)?.title}. Please verify on Flutterwave.`,
        'payment',
        'bookings'
      );

      alert('Payment link opened in a new tab. Once you have completed the payment, the admin will verify it and update your status.');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'payments');
    } finally {
      setIsPaying(false);
    }
  };

  const handleConfirmPayment = async (payment: Payment) => {
    if (!user || !profile || (profile.role !== 'admin' && profile.role !== 'landlord')) return;

    try {
      const response = await fetch('/api/admin/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentId: payment.id })
      });

      const result = await response.json();
      if (result.success) {
        alert('Payment confirmed successfully!');
      } else {
        alert('Failed to confirm payment: ' + result.error);
      }
    } catch (err) {
      console.error('Error confirming payment:', err);
      alert('Error confirming payment.');
    }
  };

  const handleConfirmOccupancy = async (booking: Booking) => {
    try {
      await updateDoc(doc(db, 'bookings', booking.id), {
        occupied: true,
        escrowStatus: 'released'
      });
      await createNotification(
        booking.landlordId,
        'Occupancy Confirmed',
        `The tenant has confirmed occupancy. Funds have been released to your account.`,
        'booking',
        'bookings'
      );
      alert('Occupancy confirmed! Funds have been released to the landlord.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${booking.id}`);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `notifications/${notificationId}`);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      alert(`User role updated to ${newRole}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const handleBoostProperty = async (propertyId: string) => {
    if (!profile) return;
    
    setIsBoosting(propertyId);
    try {
      // 1. Create a payment record
      const payment: Omit<Payment, 'id'> = {
        bookingId: `boost_${propertyId}`,
        propertyId: propertyId,
        tenantId: profile.uid,
        landlordId: 'admin',
        amount: 50000,
        currency: 'UGX',
        status: 'completed',
        type: 'boost',
        transactionId: `BST-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'payments'), payment);

      // 2. Update the property to be featured
      await updateDoc(doc(db, 'properties', propertyId), {
        isFeatured: true
      });

      // 3. Notify the landlord
      await addDoc(collection(db, 'notifications'), {
        userId: profile.uid,
        title: 'Property Boosted!',
        message: 'Your property is now featured on the homepage. Good luck with your listing!',
        type: 'system',
        read: false,
        createdAt: new Date().toISOString()
      });

      setIsBoostModalOpen(false);
      alert('Your property has been successfully boosted!');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `properties/${propertyId}`);
    } finally {
      setIsBoosting(null);
    }
  };

  const handleViewProperty = async (property: Property) => {
    try {
      const propertyRef = doc(db, 'properties', property.id);
      await updateDoc(propertyRef, {
        views: increment(1)
      });
    } catch (err) {
      console.error('Error tracking view:', err);
    }
  };

  const handleUploadReceipt = async (paymentId: string, file: File) => {
    try {
      const storageRef = ref(storage, `receipts/${paymentId}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      await updateDoc(doc(db, 'payments', paymentId), {
        receiptUrl: downloadURL
      });
      
      // Notify the tenant
      const payment = payments.find(p => p.id === paymentId);
      if (payment) {
        await createNotification(
          payment.tenantId,
          'Receipt Uploaded',
          `A receipt has been uploaded for your payment of UGX ${payment.amount.toLocaleString()}.`,
          'payment',
          '/payments'
        );
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `payments/${paymentId}`);
    }
  };

  const handleUpdatePropertyStatus = async (propertyId: string, newStatus: 'available' | 'rented') => {
    try {
      await updateDoc(doc(db, 'properties', propertyId), { status: newStatus });
      alert(`Property status updated to ${newStatus}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `properties/${propertyId}`);
    }
  };

  const handleAddReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !profile || !selectedPropertyForReview) return;

    const formData = new FormData(e.currentTarget);
    const rating = Number(formData.get('rating'));
    const comment = formData.get('comment') as string;

    const review: Omit<Review, 'id'> = {
      propertyId: selectedPropertyForReview.id,
      tenantId: user.uid,
      tenantName: profile.displayName,
      tenantPhoto: profile.photoURL,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'reviews'), review);
      setIsReviewModalOpen(false);
      alert('Thank you for your review!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'reviews');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-secondary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-stone-500 font-serif italic">Loading SRBS...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen font-sans relative">
        {/* Subtle Dashboard Background */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-5">
          <img 
            src="https://picsum.photos/seed/kampala-city/1920/1080" 
            alt="Dashboard Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="relative z-10">
          <Navbar 
            user={user} 
            profile={profile} 
            onLogout={() => signOut(auth)} 
            notifications={notifications}
            isNotificationsOpen={isNotificationsOpen}
            setIsNotificationsOpen={setIsNotificationsOpen}
            onMarkAsRead={handleMarkAsRead}
            onViewChange={handleViewChange}
            currentView={currentView}
          />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32 md:pb-12">
          {!user ? (
            <LandingPage properties={properties} onLogin={handleLogin} />
          ) : !user.emailVerified ? (
            <VerifyEmail user={user} onResend={handleResendVerification} />
          ) : !profile ? (
            <RoleSelection user={user} onComplete={handleOnboardingComplete} />
          ) : (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                  <h2 className="text-4xl font-serif font-bold text-stone-900">
                    {headerTitle}
                  </h2>
                  <p className="text-stone-500 mt-1">
                    {headerDesc}
                  </p>
                </div>
                
                <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                  <div className="flex bg-stone-100 p-1 rounded-2xl shrink-0">
                    {profile.role === 'admin' && (
                      <>
                        <button 
                          onClick={() => handleViewChange('analytics')}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'analytics' ? 'bg-white text-emerald-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                        >
                          <BarChart3 size={16} /> Analytics
                        </button>
                        <button 
                          onClick={() => handleViewChange('users')}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'users' ? 'bg-white text-emerald-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                        >
                          <Users size={16} /> Users
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => handleViewChange('properties')}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'properties' ? 'bg-white text-emerald-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                      <Home size={16} /> Properties
                    </button>
                    {(profile.role === 'landlord' || profile.role === 'admin') && (
                      <>
                        <button 
                          onClick={() => handleViewChange('bookings')}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'bookings' ? 'bg-white text-emerald-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                        >
                          <Calendar size={16} /> Bookings {bookings.length > 0 && <span className="ml-1 bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full text-[10px]">{bookings.length}</span>}
                        </button>
                        <button 
                          onClick={() => handleViewChange('payments')}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'payments' ? 'bg-white text-emerald-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                        >
                          <CreditCard size={16} /> Payments {payments.filter(p => p.status === 'pending').length > 0 && <span className="ml-1 bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full text-[10px]">{payments.filter(p => p.status === 'pending').length}</span>}
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => handleViewChange('inquiries')}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${currentView === 'inquiries' ? 'bg-white text-emerald-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                      <MessageSquare size={16} /> Inquiries
                    </button>
                  </div>
                  
                  {currentView === 'properties' && (
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="Search location..." 
                        className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 transition-all"
                      />
                    </div>
                  )}
                  
                  {profile.role === 'landlord' && currentView === 'properties' && (
                    <button 
                      onClick={() => setIsAddPropertyModalOpen(true)}
                      className="bg-emerald-800 text-white px-6 py-3 rounded-2xl font-medium hover:bg-emerald-900 transition-all flex items-center gap-2 shadow-md active:scale-95 shrink-0"
                    >
                      <Plus size={20} /> Add Property
                    </button>
                  )}
                </div>
              </div>

              <Routes>
                <Route path="/analytics" element={<AnalyticsView properties={properties} bookings={bookings} inquiries={inquiries} />} />
                <Route path="/users" element={<UsersManagementView users={allUsers} onUpdateRole={handleUpdateUserRole} />} />
                <Route path="/payments" element={
                  <PaymentsView 
                    payments={payments} 
                    onConfirm={handleConfirmPayment} 
                    onUploadReceipt={handleUploadReceipt}
                    profile={profile} 
                    properties={properties}
                    bookings={bookings}
                  />
                } />
                <Route path="/inquiries" element={<InquirySection profile={profile} inquiries={inquiries} />} />
                <Route path="/profile" element={<ProfileView profile={profile} onRestartTour={() => setIsOpen(true)} />} />
                <Route path="/properties" element={
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {properties
                        .filter(p => profile.role === 'landlord' ? p.landlordId === user.uid : true)
                        .map(property => (
                          <PropertyCard 
                            key={property.id} 
                            property={property} 
                            onBook={(p) => {
                              setSelectedProperty(p);
                              setIsBookingModalOpen(true);
                            }}
                            onViewTour={(p) => {
                              setActiveTourProperty(p);
                              setIsVRTourOpen(true);
                              handleViewProperty(p);
                            }}
                            onContactAgent={(p) => setContactProperty(p)}
                            reviews={reviews}
                            onUpdateStatus={handleUpdatePropertyStatus}
                            isOwner={property.landlordId === user.uid}
                            onBoost={(id) => {
                              const prop = properties.find(p => p.id === id);
                              if (prop) {
                                setSelectedPropertyForBoost(prop);
                                setIsBoostModalOpen(true);
                              }
                            }}
                            isBoosting={isBoosting === property.id}
                          />
                        ))}
                    </div>

                    {properties.filter(p => profile.role === 'landlord' ? p.landlordId === user.uid : true).length === 0 && (
                      <div className="text-center py-20 bg-white rounded-[40px] border border-stone-100">
                        <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center text-stone-300 mx-auto mb-6">
                          <Home size={40} />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">No properties found</h3>
                        <p className="text-stone-500">Start by adding your first property listing.</p>
                      </div>
                    )}
                  </>
                } />
                <Route path="/bookings" element={
                  <div className="space-y-12">
                    {['pending', 'confirmed', 'cancelled'].map(status => {
                      const statusBookings = bookings.filter(b => b.status === status);
                      if (statusBookings.length === 0) return null;

                      return (
                        <div key={status} className="space-y-6">
                          <div className="flex items-center gap-3 px-2">
                            <div className={`w-2 h-8 rounded-full ${
                              status === 'confirmed' ? 'bg-emerald-500' :
                              status === 'cancelled' ? 'bg-red-500' :
                              'bg-amber-500'
                            }`} />
                            <h3 className="text-xl font-serif font-bold text-stone-900 capitalize flex items-center gap-2">
                              {status === 'confirmed' && <CheckCircle2 className="text-emerald-600" size={20} />}
                              {status === 'pending' && <Activity className="text-amber-600" size={20} />}
                              {status === 'cancelled' && <X className="text-red-600" size={20} />}
                              {status} Bookings
                              <span className="text-sm font-sans font-normal text-stone-400 ml-2">({statusBookings.length})</span>
                            </h3>
                          </div>
                          
                          <div className="grid gap-6">
                            {statusBookings.map(booking => {
                              const property = properties.find(p => p.id === booking.propertyId);
                              return (
                                <div key={booking.id} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                  <div className="flex gap-4 items-center">
                                    <div className="w-16 h-16 bg-stone-100 rounded-2xl overflow-hidden">
                                      <img src={property?.images[0]} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    </div>
                                    <div>
                                      <h4 className="font-serif font-bold text-stone-900">{property?.title || 'Unknown Property'}</h4>
                                      <p className="text-stone-500 text-sm flex items-center gap-1"><MapPin size={14} /> {property?.location}</p>
                                      <p className="text-xs text-stone-400 mt-1">Requested on {format(new Date(booking.createdAt), 'MMM dd, yyyy')}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-col items-end gap-2">
                                    <div className="flex gap-2 items-center">
                                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 
                                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                        'bg-amber-100 text-amber-800'
                                      }`}>
                                        {booking.status}
                                      </span>
                                      {booking.depositPaid && (
                                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                          <ShieldCheck size={10} /> Escrow: {booking.escrowStatus}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-emerald-800 font-bold">UGX {booking.totalPrice.toLocaleString()}</p>
                                  </div>

                                  <div className="flex gap-2">
                                    {profile.role === 'tenant' && booking.status === 'confirmed' && !booking.depositPaid && (
                                      <button 
                                        onClick={() => handlePayment(booking)}
                                        disabled={isPaying}
                                        className="bg-emerald-800 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-900 transition-all flex items-center gap-2"
                                      >
                                        {isPaying ? 'Processing...' : <><Activity size={16} /> Pay 3-Month Deposit</>}
                                      </button>
                                    )}

                                    {profile.role === 'tenant' && booking.depositPaid && !booking.occupied && (
                                      <button 
                                        onClick={() => handleConfirmOccupancy(booking)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-all flex items-center gap-2"
                                      >
                                        <CheckCircle2 size={16} /> Confirm Occupancy
                                      </button>
                                    )}

                                    {profile.role === 'tenant' && booking.occupied && (
                                      <button 
                                        onClick={() => {
                                          const prop = properties.find(p => p.id === booking.propertyId);
                                          if (prop) {
                                            setSelectedPropertyForReview(prop);
                                            setIsReviewModalOpen(true);
                                          }
                                        }}
                                        className="bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-600 transition-all flex items-center gap-2"
                                      >
                                        <Star size={16} /> Leave Review
                                      </button>
                                    )}

                                    {booking.depositPaid && (
                                      <button 
                                        onClick={() => {
                                          setSelectedBookingForReceipt(booking);
                                          setIsReceiptModalOpen(true);
                                        }}
                                        className="border border-stone-200 text-stone-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-stone-50 transition-all flex items-center gap-2"
                                      >
                                        <FileText size={16} /> Receipt
                                      </button>
                                    )}

                                    {(profile.role === 'landlord' || profile.role === 'admin') && booking.status === 'pending' && (
                                      <>
                                        <button 
                                          onClick={() => handleBookingStatus(booking.id, 'confirmed')}
                                          className="bg-emerald-800 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-900 transition-all"
                                        >
                                          Confirm
                                        </button>
                                        <button 
                                          onClick={() => handleBookingStatus(booking.id, 'cancelled')}
                                          className="border border-stone-200 text-stone-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-stone-50 transition-all"
                                        >
                                          Decline
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    
                    {bookings.length === 0 && (
                      <div className="text-center py-20 bg-white rounded-[40px] border border-stone-100">
                        <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center text-stone-300 mx-auto mb-6">
                          <Calendar size={40} />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">No bookings yet</h3>
                        <p className="text-stone-500">When tenants request your properties, they'll appear here.</p>
                      </div>
                    )}
                  </div>
                } />
                <Route path="/" element={<Navigate to={profile.role === 'admin' ? "/analytics" : "/properties"} replace />} />
              </Routes>
            </>
          )}
        </main>

        {/* Receipt Modal */}
        <AnimatePresence>
          {isReceiptModalOpen && selectedBookingForReceipt && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsReceiptModalOpen(false)}
                className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl"
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <Logo size={32} />
                      <span className="font-serif font-bold text-xl tracking-tighter">SRBS</span>
                    </div>
                    <button onClick={() => setIsReceiptModalOpen(false)} className="text-stone-400 hover:text-stone-900">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-stone-900">Payment Receipt</h3>
                    <p className="text-stone-500 text-sm">Transaction Successful</p>
                  </div>

                  <div className="space-y-4 border-t border-b border-stone-100 py-6 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-500">Property</span>
                      <span className="font-bold text-stone-900">{properties.find(p => p.id === selectedBookingForReceipt.propertyId)?.title}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-500">Payment Type</span>
                      <span className="font-bold text-stone-900">3-Month Security Deposit</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-500">Amount Paid</span>
                      <span className="font-bold text-emerald-800">UGX {(selectedBookingForReceipt.totalPrice * 3).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-500">Date</span>
                      <span className="font-bold text-stone-900">{format(new Date(), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-500">Escrow Status</span>
                      <span className="font-bold text-blue-600 uppercase tracking-widest text-[10px]">{selectedBookingForReceipt.escrowStatus}</span>
                    </div>
                  </div>

                  <div className="bg-stone-50 p-4 rounded-2xl mb-8">
                    <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest mb-1">Transaction ID</p>
                    <p className="font-mono text-xs text-stone-600">TXN-{selectedBookingForReceipt.id.substring(0, 8).toUpperCase()}</p>
                  </div>

                  <button 
                    onClick={() => window.print()}
                    className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold hover:bg-stone-800 transition-all flex items-center justify-center gap-2"
                  >
                    <FileText size={20} /> Download PDF Receipt
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* VR Tour Viewer */}
        <VRTourViewer 
          isOpen={isVRTourOpen}
          onClose={() => setIsVRTourOpen(false)}
          tourUrl={activeTourProperty?.vrTourUrl || ''}
          title={activeTourProperty?.title || ''}
        />

        {/* Boost Property Modal */}
        <AnimatePresence>
          {isBoostModalOpen && selectedPropertyForBoost && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsBoostModalOpen(false)}
                className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl"
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-serif font-bold text-stone-900">Boost Your Listing</h3>
                      <p className="text-stone-500">Get 10x more visibility</p>
                    </div>
                    <button onClick={() => setIsBoostModalOpen(false)} className="text-stone-400 hover:text-stone-900">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center">
                          <SparklesIcon size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-stone-900">Featured Placement</p>
                          <p className="text-xs text-stone-500">Appear at the top of search results</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-emerald-100">
                        <span className="text-stone-600 font-medium">Boost Fee</span>
                        <span className="text-xl font-bold text-emerald-800">50,000 UGX</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs text-stone-400 text-center">
                        By clicking "Pay & Boost", you agree to our terms of service. Your property will be featured for 30 days.
                      </p>
                      <button 
                        onClick={() => handleBoostProperty(selectedPropertyForBoost.id)}
                        disabled={isBoosting !== null}
                        className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-stone-800 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                      >
                        {isBoosting ? 'Processing...' : <><CreditCardIcon size={20} /> Pay & Boost Now</>}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Review Modal */}
        <AnimatePresence>
          {isReviewModalOpen && selectedPropertyForReview && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsReviewModalOpen(false)}
                className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl"
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-serif font-bold text-stone-900">Rate Your Stay</h3>
                      <p className="text-stone-500">{selectedPropertyForReview.title}</p>
                    </div>
                    <button onClick={() => setIsReviewModalOpen(false)} className="text-stone-400 hover:text-stone-900">
                      <X size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleAddReview} className="space-y-6">
                    <div className="flex flex-col items-center gap-4">
                      <p className="text-sm font-medium text-stone-700">How was your experience?</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <label key={star} className="cursor-pointer group">
                            <input type="radio" name="rating" value={star} className="hidden peer" required />
                            <Star 
                              size={32} 
                              className="text-stone-200 group-hover:text-amber-400 transition-colors peer-checked:text-amber-400 peer-checked:fill-amber-400" 
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Your Review</label>
                      <textarea 
                        name="comment" 
                        required 
                        rows={4} 
                        placeholder="Tell others about the property, location, and landlord..."
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 resize-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-stone-800 transition-all shadow-lg active:scale-95"
                    >
                      Submit Review
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Booking Modal */}
        <AnimatePresence>
          {isBookingModalOpen && selectedProperty && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsBookingModalOpen(false)}
                className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl"
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-serif font-bold text-stone-900">Confirm Booking</h3>
                      <p className="text-stone-500">{selectedProperty.title}</p>
                    </div>
                    <button onClick={() => setIsBookingModalOpen(false)} className="text-stone-400 hover:text-stone-900">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-emerald-900 font-medium">Monthly Rent</span>
                        <span className="text-xl font-bold text-emerald-900">UGX {selectedProperty.rent.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-3 text-emerald-800 text-sm">
                        <Calendar size={18} />
                        <span>Standard 1-week processing for first month</span>
                      </div>
                    </div>

                    <form onSubmit={handleBooking} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1.5">Full Name</label>
                        <input 
                          type="text" 
                          required 
                          defaultValue={user?.displayName || ''}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full bg-emerald-800 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-900 transition-all shadow-lg active:scale-95"
                      >
                        Confirm Booking Request
                      </button>
                    </form>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Add Property Modal */}
        <AnimatePresence>
          {contactProperty && profile && (
            <ContactAgentModal 
              property={contactProperty} 
              profile={profile} 
              onClose={() => setContactProperty(null)} 
            />
          )}

          {isAddPropertyModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddPropertyModalOpen(false)}
                className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl"
              >
                <div className="p-8 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-3xl font-serif font-bold text-stone-900">List New Property</h3>
                      <p className="text-stone-500">Fill in the details to showcase your property</p>
                    </div>
                    <button onClick={() => setIsAddPropertyModalOpen(false)} className="text-stone-400 hover:text-stone-900">
                      <X size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleAddProperty} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1.5">Property Title</label>
                          <input name="title" required placeholder="e.g. Modern 2BR Apartment in Nakawa" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1.5">Location</label>
                          <input name="location" required placeholder="e.g. Nakawa, Kampala" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1.5">Monthly Rent (UGX)</label>
                          <input name="rent" type="number" required placeholder="e.g. 1500000" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1.5">VR Tour URL (360° Link)</label>
                          <input name="vrTourUrl" placeholder="e.g. https://kuula.co/share/..." className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-sm font-medium text-stone-700">Description</label>
                            <button 
                              type="button"
                              onClick={(e) => {
                                const form = e.currentTarget.closest('form');
                                if (form) {
                                  const title = (form.elements.namedItem('title') as HTMLInputElement).value;
                                  const location = (form.elements.namedItem('location') as HTMLInputElement).value;
                                  generateAIDescription(title, location);
                                }
                              }}
                              disabled={isGeneratingDescription}
                              className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 transition-colors disabled:opacity-50"
                            >
                              {isGeneratingDescription ? (
                                <div className="w-3 h-3 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Sparkles size={14} />
                              )}
                              AI Generate
                            </button>
                          </div>
                          <textarea name="description" required rows={7} placeholder="Describe your property features..." className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 resize-none"></textarea>
                        </div>
                      </div>
                    </div>

                    <div className="bg-stone-50 p-6 rounded-3xl border border-stone-200 border-dashed relative">
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files) {
                            setSelectedFiles(Array.from(e.target.files));
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-stone-400 mb-3 shadow-sm">
                          <Plus size={24} />
                        </div>
                        <p className="text-sm font-medium text-stone-700">
                          {selectedFiles.length > 0 ? `${selectedFiles.length} Photos Selected` : 'Upload Property Photos'}
                        </p>
                        <p className="text-xs text-stone-400 mt-1">Drag and drop or click to select</p>
                      </div>
                    </div>

                    {selectedFiles.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {selectedFiles.map((file, idx) => (
                          <div key={idx} className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-stone-200">
                            <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-stone-600 hover:text-red-600"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-4 pt-4">
                      <button 
                        type="button"
                        disabled={isUploading}
                        onClick={() => {
                          setIsAddPropertyModalOpen(false);
                          setSelectedFiles([]);
                        }}
                        className="flex-1 px-6 py-4 border border-stone-200 rounded-2xl font-bold text-stone-600 hover:bg-stone-50 transition-all disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={isUploading}
                        className="flex-[2] bg-emerald-800 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-900 transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isUploading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Uploading...
                          </>
                        ) : 'Publish Listing'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <footer className="bg-white border-t border-stone-200 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-6">
                  <Logo className="scale-75 origin-left" />
                </div>
                <p className="text-stone-500 max-w-sm leading-relaxed">
                  Modernizing the Ugandan rental market with immersive AR and VR technology. 
                  A case study of Villy Vu Residentials in Nakawa Division.
                </p>
              </div>
              <div>
                <h4 className="font-serif font-bold text-stone-900 mb-6">Quick Links</h4>
                <ul className="space-y-4 text-stone-500 text-sm">
                  <li><a href="#" className="hover:text-emerald-800 transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-emerald-800 transition-colors">Browse Properties</a></li>
                  <li><a href="#" className="hover:text-emerald-800 transition-colors">Landlord Portal</a></li>
                  <li><a href="#" className="hover:text-emerald-800 transition-colors">Support Center</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-serif font-bold text-stone-900 mb-6">Contact</h4>
                <ul className="space-y-4 text-stone-500 text-sm">
                  <li className="flex items-center gap-2"><MapPin size={16} /> Nakawa, Kampala, Uganda</li>
                  <li className="flex items-center gap-2"><Phone size={16} /> +256 700 123 456</li>
                  <li className="flex items-center gap-2"><Phone size={16} /> +256 770 987 654</li>
                  <li className="flex items-center gap-2"><ShieldCheck size={16} /> Verified Platform</li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-stone-400 text-xs">© 2026 Smart Rental Booking System (SRBS). All rights reserved.</p>
              <div className="flex gap-6 text-stone-400 text-xs">
                <a href="#" className="hover:text-stone-900">Privacy Policy</a>
                <a href="#" className="hover:text-stone-900">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
        <AIAssistant user={user} profile={profile} />
        {user && profile && <BottomNavBar currentView={currentView} onViewChange={handleViewChange} />}
      </div>
    </div>
  </ErrorBoundary>
);
}
