import { createSlice } from "@reduxjs/toolkit";

// 초기 상태
const initialState = false;

// Slice 생성
const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    startLoading: () => true,
    endLoading: () => false,
  },
});

// 액션 및 리듀서 내보내기
export const { startLoading, endLoading } = loadingSlice.actions;
export default loadingSlice.reducer;
