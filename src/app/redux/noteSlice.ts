import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import axios from "axios";
import { NoteTypes, FilterType } from "../utils/types";
import { getSession } from "next-auth/react";

interface NotesState {
  notes: NoteTypes[];
  loading: boolean;
  isRefetching: boolean;
  error: string | null;
  filter: FilterType;
  filteredNotes: NoteTypes[];
  searchQuery: string;
  showSettings: boolean;
}

const initialState: NotesState = {
  notes: [],
  loading: false,
  isRefetching: false,
  error: null,
  filter: "all",
  filteredNotes: [],
  searchQuery: "",
  showSettings: false,
};

export const fetchNotes = createAsyncThunk<NoteTypes[]>(
  "notes/fetchNotes",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.auth.token;

      if (token) {
        const { data } = await axios.get("/api/notes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data;
      }

      const session = await getSession();
      if (!session?.user?.id) throw new Error("Not authenticated");
      const { data } = await axios.get("/api/notes", {
        headers: { Authorization: `Bearer ${session.user.id}` },
      });
      return data;
    } catch (err: unknown) {
      return thunkAPI.rejectWithValue(
        err instanceof Error ? err.message : "Failed to fetch notes"
      );
    }
  }
);

export const addNote = createAsyncThunk<
  NoteTypes,
  Partial<NoteTypes>,
  { state: RootState }
>("notes/addNote", async (note, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const { data } = await axios.post("/api/notes", note, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data as NoteTypes;
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue(
      err instanceof Error ? err.message : "Failed to add note"
    );
  }
});

export const updateNote = createAsyncThunk<
  NoteTypes,
  NoteTypes,
  { state: RootState }
>("notes/updateNote", async (note, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { _id, id, ...rest } = note as any;

    const { data } = await axios.put(
      "/api/notes",
      { id: _id || id, ...rest },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return data;
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue(
      err instanceof Error ? err.message : "Failed to update note"
    );
  }
});

export const deleteNote = createAsyncThunk<
  string,
  string,
  { state: RootState }
>("notes/deleteNote", async (_id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    await axios.delete("/api/notes", {
      data: { id: _id },
      headers: { Authorization: `Bearer ${token}` },
    });
    return _id;
  } catch (err: unknown) {
    return thunkAPI.rejectWithValue(
      err instanceof Error ? err.message : "Failed to delete note"
    );
  }
});

export const fetchGuestNotes = createAsyncThunk<NoteTypes[]>(
  "notes/fetchGuestNotes",
  async () => {
    try {
      const stored = localStorage.getItem("guestNotes");
      if (stored) return JSON.parse(stored);

      const { data } = await axios.get("/api/guestNotes");
      const dummyNotes = data.filter(
        (note: NoteTypes) => note.isDummy === true
      );

      localStorage.setItem("guestNotes", JSON.stringify(dummyNotes));
      return dummyNotes;
    } catch (err: unknown) {
      throw err;
    }
  }
);
const applyFilter = (
  notes: NoteTypes[],
  filter: NotesState["filter"]
): NoteTypes[] => {
  if (filter === "archived") return notes.filter((n) => n.isArchived);
  if (typeof filter === "object" && filter.tag)
    return notes.filter((n) => n.tags?.includes(filter.tag));
  return notes;
};

const noteSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    addGuestNote: (state, action: PayloadAction<NoteTypes>) => {
      const idx = state.notes.findIndex((n) => n._id === action.payload._id);
      if (idx !== -1) {
        state.notes[idx] = action.payload;
      } else {
        state.notes.push(action.payload);
      }
      state.filteredNotes = applyFilter(state.notes, state.filter);
      localStorage.setItem("guestNotes", JSON.stringify(state.notes));
    },
    updateGuestNote: (state, action: PayloadAction<NoteTypes>) => {
      const idx = state.notes.findIndex((n) => n._id === action.payload._id);
      if (idx !== -1) {
        state.notes[idx] = action.payload;
        state.filteredNotes = applyFilter(state.notes, state.filter);
        localStorage.setItem("guestNotes", JSON.stringify(state.notes));
      } else {
        state.notes.push(action.payload);
        state.filteredNotes = applyFilter(state.notes, state.filter);
        localStorage.setItem("guestNotes", JSON.stringify(state.notes));
      }
    },
    deleteGuestNote: (state, action: PayloadAction<string>) => {
      state.notes = state.notes.filter((n) => n._id !== action.payload);
      state.filteredNotes = applyFilter(state.notes, state.filter);
      localStorage.setItem("guestNotes", JSON.stringify(state.notes));
    },
    loadGuestNotes: (state) => {
      const stored = localStorage.getItem("guestNotes");
      if (stored) state.notes = JSON.parse(stored);
    },
    setFilter: (state, action: PayloadAction<FilterType>) => {
      if (action.payload === "archived" || typeof action.payload === "object") {
        state.filter = action.payload;
        state.filteredNotes = applyFilter(state.notes, action.payload);
      } else {
        state.filter = "all";
        state.filteredNotes = state.notes;
      }
    },
    setNotes: (state, action: PayloadAction<NoteTypes[]>) => {
      state.notes = action.payload;
      state.filteredNotes = applyFilter(action.payload, state.filter);
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    toggleSettings: (state) => {
      state.showSettings = !state.showSettings;
    },
    closeSettings: (state) => {
      state.showSettings = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.loading = state.notes.length === 0;
        state.isRefetching = state.notes.length > 0;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.isRefetching = false;
        state.notes = action.payload;
        state.filteredNotes = applyFilter(action.payload, state.filter);
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.isRefetching = false;
        state.error = (action.payload as string) || "Failed to fetch notes";
      })
      .addCase(addNote.fulfilled, (state, action: PayloadAction<NoteTypes>) => {
        state.notes.push(action.payload);
        state.filteredNotes = applyFilter(state.notes, state.filter);
      })
      .addCase(fetchGuestNotes.pending, (state) => {
        state.isRefetching = state.notes.length > 0;
        state.loading = state.notes.length === 0;
        state.error = null;
      })
      .addCase(fetchGuestNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.isRefetching = false;
        state.notes = action.payload;
        state.filteredNotes = applyFilter(action.payload, state.filter);
      })
      .addCase(fetchGuestNotes.rejected, (state, action) => {
        state.loading = false;
        state.isRefetching = false;
        state.error = action.error.message || "Failed to fetch guest notes";
      })
      .addCase(
        updateNote.fulfilled,
        (state, action: PayloadAction<NoteTypes>) => {
          const idx = state.notes.findIndex(
            (n) => n._id === action.payload._id
          );
          if (idx !== -1) {
            state.notes[idx] = action.payload;
          }
          state.filteredNotes = applyFilter(state.notes, state.filter);
        }
      )
      .addCase(deleteNote.fulfilled, (state, action: PayloadAction<string>) => {
        state.notes = state.notes.filter((n) => n._id !== action.payload);
        state.filteredNotes = applyFilter(state.notes, state.filter);
      });
  },
});

export const {
  addGuestNote,
  updateGuestNote,
  deleteGuestNote,
  loadGuestNotes,
  setNotes,
  setFilter,
  setSearchQuery,
  toggleSettings,
  closeSettings,
} = noteSlice.actions;
export const selectFilteredNotes = (state: RootState) =>
  state.notes.filteredNotes;
export const selectNotesState = (state: RootState) => state.notes;
export const selectVisibleNotes = (state: RootState) => {
  const { filteredNotes, searchQuery } = state.notes;
  const q = (searchQuery || "").trim().toLowerCase();
  if (!q) return filteredNotes;

  return filteredNotes.filter((note) => {
    const title = (note.title || "").toLowerCase();
    const content = (note.content || "").toLowerCase();
    const tags = (note.tags || []).map((t) => (t || "").toLowerCase());

    return (
      title.includes(q) ||
      content.includes(q) ||
      tags.some((t) => t.includes(q))
    );
  });
};
export default noteSlice.reducer;
