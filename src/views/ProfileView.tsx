import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { auth, db } from "../firebase";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot 
} from "firebase/firestore";
import { 
  User as UserIcon, 
  LogOut, 
  Trophy, 
  Settings, 
  Shield, 
  Mail, 
  Calendar,
  ChevronRight,
  Gamepad2
} from "lucide-react";

interface ProfileViewProps {
  onBack: () => void;
}

export function ProfileView({ onBack }: ProfileViewProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        // Sync profile data
        const docRef = doc(db, "users", u.uid);
        const unsubDoc = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfileData(docSnap.data());
          } else {
            // Initialize profile
            const newData = {
              displayName: u.displayName,
              email: u.email,
              photoURL: u.photoURL,
              createdAt: new Date().toISOString(),
              stats: {
                gamesPlayed: 0,
                highScore: 0,
                level: 1,
                xp: 0
              }
            };
            setDoc(docRef, newData);
            setProfileData(newData);
          }
          setLoading(false);
        });
        return () => unsubDoc();
      } else {
        setProfileData(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-spectral border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface p-6 md:p-12 pt-24">
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-24 h-24 bg-spectral/10 rounded-full flex items-center justify-center mb-8 border border-spectral/20">
                <UserIcon size={48} className="text-spectral" />
              </div>
              <h1 className="text-4xl font-headline italic mb-4 tracking-tighter">Access the Astral Plane</h1>
              <p className="text-on-surface-variant max-w-md mb-12 opacity-60">
                Sign in to sync your progress, compete on leaderboards, and unlock exclusive spectral rewards.
              </p>
              <button
                onClick={handleLogin}
                className="flex items-center gap-4 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-spectral transition-all active:scale-95"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                Sign in with Google
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Profile Header */}
              <div className="flex flex-col md:flex-row items-center gap-8 bg-surface-container-low/40 backdrop-blur-xl p-8 rounded-3xl border border-on-surface-variant/10">
                <div className="relative">
                  <img 
                    src={user.photoURL || ""} 
                    alt={user.displayName || "User"} 
                    className="w-32 h-32 rounded-full border-4 border-spectral/30 shadow-[0_0_20px_rgba(77,238,225,0.2)]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-spectral text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    LVL {profileData?.stats?.level || 1}
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-4xl font-headline italic tracking-tighter mb-2">
                    {user.displayName}
                  </h1>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs uppercase tracking-widest opacity-60">
                    <span className="flex items-center gap-2"><Mail size={14} /> {user.email}</span>
                    <span className="flex items-center gap-2"><Calendar size={14} /> Joined {new Date(profileData?.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-6 py-3 bg-error/10 text-error border border-error/20 rounded-xl hover:bg-error/20 transition-all active:scale-95 text-xs font-bold uppercase tracking-widest"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface-container-low/40 backdrop-blur-xl p-6 rounded-2xl border border-on-surface-variant/10">
                  <Trophy className="text-spectral mb-4" size={24} />
                  <div className="text-[10px] uppercase tracking-widest opacity-40 mb-1">High Score</div>
                  <div className="text-3xl font-bold tracking-tighter">{profileData?.stats?.highScore || 0}</div>
                </div>
                <div className="bg-surface-container-low/40 backdrop-blur-xl p-6 rounded-2xl border border-on-surface-variant/10">
                  <Gamepad2 className="text-spectral mb-4" size={24} />
                  <div className="text-[10px] uppercase tracking-widest opacity-40 mb-1">Games Played</div>
                  <div className="text-3xl font-bold tracking-tighter">{profileData?.stats?.gamesPlayed || 0}</div>
                </div>
                <div className="bg-surface-container-low/40 backdrop-blur-xl p-6 rounded-2xl border border-on-surface-variant/10">
                  <Shield className="text-spectral mb-4" size={24} />
                  <div className="text-[10px] uppercase tracking-widest opacity-40 mb-1">Rank</div>
                  <div className="text-3xl font-bold tracking-tighter">Spectral Initiate</div>
                </div>
              </div>

              {/* Settings & Actions */}
              <div className="bg-surface-container-low/40 backdrop-blur-xl rounded-3xl border border-on-surface-variant/10 overflow-hidden">
                {[
                  { icon: Settings, label: "Account Settings", desc: "Manage your profile and privacy" },
                  { icon: Trophy, label: "Achievements", desc: "View your unlocked spectral badges" },
                  { icon: Shield, label: "Security", desc: "Two-factor authentication and sessions" }
                ].map((item, i) => (
                  <button 
                    key={i}
                    className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-all border-b border-on-surface-variant/5 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-spectral/10 rounded-xl">
                        <item.icon size={20} className="text-spectral" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-sm tracking-wide">{item.label}</div>
                        <div className="text-xs opacity-40">{item.desc}</div>
                      </div>
                    </div>
                    <ChevronRight size={20} className="opacity-20" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
