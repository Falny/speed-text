import { configureStore } from '@reduxjs/toolkit'
import textSlice from './slices/textSlice'

export const store = configureStore({
    reducer: {
        textStore: textSlice,
    }
})


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;