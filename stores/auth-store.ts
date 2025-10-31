import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { create } from "zustand";

interface AuthState {
  session: Session | null;
  error: string | null;
  loading: boolean;

  initialize: () => Promise<void>;
  signin: (email: string, password: string) => Promise<void>;
  signout: () => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  error: null,
  loading: true,

  initialize: async () => {
    try {
      const { data } = await supabase.auth.getSession();
      set({ session: data.session, loading: false });

      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session });
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  signin: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      set({ session: data.session });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  signout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ session: null });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ loading: true, error: null });
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("You must be logged in.");

      // 🔐 Re-authenticate user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      });
      if (signInError) throw new Error("Your current password is incorrect.");

      // 🔄 Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) throw updateError;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));
