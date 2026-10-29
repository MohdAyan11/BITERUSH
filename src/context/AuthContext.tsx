import React, { createContext, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured, LocalCanteenStore, supabase } from '../lib/supabase';
import { UserProfile, UserRole } from '../types/canteen';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (
    fullName: string,
    email: string,
    studentId: string,
    pass: string,
    role?: UserRole
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchDemoRole: (targetRole: UserRole) => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize auth state
  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              setUser(profile as UserProfile);
            } else {
              // Create profile if missing
              const fallback: UserProfile = {
                id: session.user.id,
                full_name: session.user.user_metadata?.full_name || 'Student User',
                email: session.user.email || '',
                student_id: session.user.user_metadata?.student_id || 'STU-001',
                role: (session.user.user_metadata?.role as UserRole) || 'student',
              };
              setUser(fallback);
            }
          } else {
            setUser(null);
          }

          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, newSession) => {
              if (newSession?.user) {
                const { data: p } = await supabase!
                  .from('profiles')
                  .select('*')
                  .eq('id', newSession.user.id)
                  .single();
                if (p) setUser(p as UserProfile);
              } else {
                setUser(null);
              }
            }
          );
          setLoading(false);
          return () => subscription.unsubscribe();
        } catch (err) {
          console.error('Supabase auth init error:', err);
          setUser(LocalCanteenStore.getCurrentProfile());
          setLoading(false);
        }
      } else {
        // Fallback store
        setUser(LocalCanteenStore.getCurrentProfile());
        const unsub = LocalCanteenStore.subscribe(() => {
          setUser(LocalCanteenStore.getCurrentProfile());
        });
        setLoading(false);
        return () => unsub();
      }
    }

    initAuth();
  }, []);

  const login = async (email: string, _pass: string) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: _pass,
        });
        if (error) {
          setLoading(false);
          return { success: false, error: error.message };
        }
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          if (profile) setUser(profile as UserProfile);
        }
        setLoading(false);
        return { success: true };
      }

      // Emulated login: check if it's staff email or student
      const isAdminAccount = email.toLowerCase().includes('admin') || email.toLowerCase().includes('canteen');
      const profile: UserProfile = {
        id: isAdminAccount ? 'usr-admin-1' : 'usr-student-1',
        full_name: isAdminAccount ? 'Chef Ramesh Kumar' : 'Ayan Ansari',
        email: email,
        student_id: isAdminAccount ? 'STAFF-01' : 'CS-2024-042',
        role: isAdminAccount ? 'admin' : 'student',
      };
      LocalCanteenStore.setCurrentProfile(profile);
      setUser(profile);
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const signup = async (
    fullName: string,
    email: string,
    studentId: string,
    pass: string,
    role: UserRole = 'student'
  ) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: {
            data: {
              full_name: fullName,
              student_id: studentId,
              role,
            },
          },
        });
        if (error) {
          setLoading(false);
          return { success: false, error: error.message };
        }
        if (data.user) {
          // Insert profile record
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: fullName,
            email,
            student_id: studentId,
            role,
          });
        }
        setLoading(false);
        return { success: true };
      }

      // Local fallback
      const newProfile: UserProfile = {
        id: `usr-${Date.now()}`,
        full_name: fullName,
        email,
        student_id: studentId,
        role,
      };
      LocalCanteenStore.setCurrentProfile(newProfile);
      setUser(newProfile);
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'Signup failed' };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    LocalCanteenStore.setCurrentProfile(null);
    setUser(null);
  };

  const switchDemoRole = (targetRole: UserRole) => {
    if (targetRole === 'admin') {
      const adminProfile: UserProfile = {
        id: 'usr-admin-1',
        full_name: 'Chef Ramesh Kumar (Canteen Manager)',
        email: 'canteen.admin@campus.edu',
        student_id: 'STAFF-MANAGER-01',
        role: 'admin',
      };
      LocalCanteenStore.setCurrentProfile(adminProfile);
      setUser(adminProfile);
    } else {
      const studentProfile: UserProfile = {
        id: 'usr-student-1',
        full_name: 'Ayan Ansari',
        email: 'ansariayan7351@gmail.com',
        student_id: 'CS-2024-042',
        role: 'student',
      };
      LocalCanteenStore.setCurrentProfile(studentProfile);
      setUser(studentProfile);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    if (isSupabaseConfigured && supabase) {
      await supabase.from('profiles').update(data).eq('id', user.id);
    }
    LocalCanteenStore.setCurrentProfile(updated);
    setUser(updated);
  };

  const currentRole = user?.role || 'student';
  const isAdmin = currentRole === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        role: currentRole,
        isAdmin,
        loading,
        login,
        signup,
        logout,
        switchDemoRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
