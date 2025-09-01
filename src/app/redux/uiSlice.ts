import { createSlice, PayloadAction } from "@reduxjs/toolkit";
interface UIState {
  theme: "light" | "dark" | "system";
  font: "default" | "serif" | "source";
}
const initialState: UIState = {
  theme: "system",
  font: "default",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<UIState["theme"]>) => {
      state.theme = action.payload;
    },
    setFont: (state, action: PayloadAction<UIState["font"]>) => {
      state.font = action.payload;
    },
  },
});

export const { setTheme, setFont } = uiSlice.actions;
export default uiSlice.reducer;
