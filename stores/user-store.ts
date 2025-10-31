import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";
import { User, UserUpdate } from "@/types/user-type";
import { decode as atob } from "base-64";
import * as FileSystem from "expo-file-system/legacy";
import * as mime from "react-native-mime-types";
import { create } from "zustand";

interface UserState {
  users: User[];
  logonUser: User | null;
  loading: boolean;
  error: string | null;

  fetchAllUsers: () => Promise<void>;
  fetchUserById: (id: string) => Promise<User | null>;
  fetchLogonUser: () => Promise<void>;
  updateUser: (updates: UserUpdate, avatarUri?: string) => Promise<void>;
  uploadAvatar: (
    fileUri: string
  ) => Promise<{ avatar_url: string; avatar_path: string }>;
  subscribeToUsers: () => () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  logonUser: null,
  loading: false,
  error: null,

  /* --------------------------- FETCH USERS --------------------------- */
  fetchAllUsers: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ users: data || [] });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch users" });
    } finally {
      set({ loading: false });
    }
  },

  /* --------------------------- FETCH BY ID --------------------------- */
  fetchUserById: async (id) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch user" });
      return null;
    }
  },

  /* -------------------------- FETCH LOGGED USER ----------------------- */
  fetchLogonUser: async () => {
    const { session } = useAuthStore.getState();
    const userId = session?.user?.id;
    if (!userId) {
      set({ logonUser: null });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      set({ logonUser: data || null });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch logged user" });
    }
  },

  /* ----------------------------- UPLOAD AVATAR ------------------------ */
  uploadAvatar: async (fileUri) => {
    const { logonUser } = get();
    if (!logonUser) throw new Error("No logged in user found");

    try {
      const fileExt = fileUri.split(".").pop() || "jpg";
      const fileName = `${logonUser.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: "base64",
      });

      const contentType = mime.lookup(fileUri) || "image/jpeg";

      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const fileBuffer = new Uint8Array(byteNumbers);

      if (logonUser.avatar_path) {
        await supabase.storage.from("avatars").remove([logonUser.avatar_path]);
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, fileBuffer, { contentType, upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      if (!publicData?.publicUrl) throw new Error("Failed to get avatar URL");

      return {
        avatar_url: publicData.publicUrl,
        avatar_path: filePath,
      };
    } catch (err: any) {
      set({ error: err.message || "Failed to upload avatar" });
      throw err;
    }
  },

  /* ----------------------------- UPDATE USER -------------------------- */
  updateUser: async (updates, avatarUri) => {
    const { logonUser } = get();
    if (!logonUser) throw new Error("No logged in user found");

    set({ loading: true, error: null });

    try {
      let avatar_url = logonUser.avatar_url;
      let avatar_path = logonUser.avatar_path;

      if (avatarUri) {
        const uploaded = await get().uploadAvatar(avatarUri);
        avatar_url = uploaded.avatar_url;
        avatar_path = uploaded.avatar_path;
      }

      const finalData: UserUpdate = { ...updates, avatar_url, avatar_path };

      const { data, error } = await supabase
        .from("users")
        .update(finalData)
        .eq("id", logonUser.id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        logonUser: data,
        users: state.users.map((u) => (u.id === data.id ? data : u)),
      }));
    } catch (err: any) {
      set({ error: err.message || "Failed to update user" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  /* ------------------------ REALTIME SUBSCRIBE ------------------------ */
  subscribeToUsers: () => {
    const channel = supabase
      .channel("users-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        (payload) => {
          const { eventType, new: newUser, old: oldUser } = payload;
          const { users, logonUser } = get();

          if (eventType === "INSERT" && newUser) {
            set({ users: [newUser as User, ...users] });
          }

          if (eventType === "UPDATE" && newUser) {
            set({
              users: users.map((u) =>
                u.id === oldUser.id ? (newUser as User) : u
              ),
              logonUser:
                logonUser && logonUser.id === newUser.id
                  ? (newUser as User)
                  : logonUser,
            });
          }

          if (eventType === "DELETE" && oldUser) {
            set({ users: users.filter((u) => u.id !== oldUser.id) });
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },
}));
