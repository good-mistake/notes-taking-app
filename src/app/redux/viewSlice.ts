import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AppView =
  | "home"
  | "search"
  | "archive"
  | "tags"
  | "settings"
  | "noteDetail";

interface ViewState {
  view: AppView;
  selectedNoteId: string | null;
  searchOpen: boolean;
}

const initialState: ViewState = {
  view: "home",
  selectedNoteId: null,
  searchOpen: false,
};

const viewSlice = createSlice({
  name: "view",
  initialState,
  reducers: {
    setView: (state, action: PayloadAction<AppView>) => {
      state.view = action.payload;
      state.searchOpen = action.payload === "search";
    },
    openSearch: (state) => {
      state.view = "search";
      state.searchOpen = true;
    },
    closeSearch: (state) => {
      state.searchOpen = false;
      if (state.view === "search") state.view = "home";
    },
    setSelectedNote: (state, action: PayloadAction<string | null>) => {
      state.selectedNoteId = action.payload;
      state.view = action.payload ? "noteDetail" : state.view;
    },
    clearSelection: (state) => {
      state.selectedNoteId = null;
      if (state.view === "noteDetail") state.view = "home";
    },
  },
});

export const {
  setView,
  openSearch,
  closeSearch,
  setSelectedNote,
  clearSelection,
} = viewSlice.actions;
export default viewSlice.reducer;
