import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

type TextId = number;

interface Text {
  text: string[];
  currentIndex: number;
  error: number;
  isError: boolean;
  flagTime: boolean;
  status: string;
}

const initialState: Text = {
  text: [],
  currentIndex: 0,
  error: 0,
  isError: false,
  flagTime: false,
  status: "loading",
};

export const fetchText = createAsyncThunk(
  "text/fetchText",
    async (id: TextId) => {
        try {
            const response = await axios.get(
              `https://6803cc8b79cb28fb3f59b306.mockapi.io/text/${id}`
            );
            return response.data.text.split(""); // сплитом делаю массив чтобы отслеживать по индексам
          
        } catch (err) {
            console.log('Ошибка', err)
      }
  }
);

const textSlice = createSlice({
  name: "text",
  initialState,
  reducers: {
    setKeyBoard(state, action: PayloadAction<{ key: string }>) {
      const { key } = action.payload;

      const fireKey = ["Shift", "Alt", "Tab", "CapsLock", "Ctrl", "Escape", 'Enter', 'Backspace'];

      if (!state.text) return;

      if (fireKey.includes(key)) return; // проверяет нажатие кнопок из fireKey чтобы их игнорировать

      // в этом блоке кода отслеживаю первую и последнюю букву чтобы поставить таймер
      if (state.currentIndex === 0) {
        state.flagTime = true;
      } else if (state.currentIndex === state.text.length - 1) {
        state.flagTime = false;
      }

      if (key === state.text[state.currentIndex]) {
        // если нажатая кнопка равна букве в тексте то индекс добавляется
        state.currentIndex += 1;
        state.isError = false;
      } else {
        state.error += 1; // в противном случае добавляется ошибка
        state.isError = true;
      }
    },
    setReset(state, action) {
      state.currentIndex = 0;
      state.error = 0;
      state.flagTime = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchText.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchText.fulfilled, (state, action) => {
        state.status = "success";
        state.text = action.payload;
      })
      .addCase(fetchText.rejected, (state) => {
        state.status = "error";
        state.text = [];
      });
  },
});

export const { setKeyBoard, setReset } = textSlice.actions;
export default textSlice.reducer;
