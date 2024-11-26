import { createSlice } from "@reduxjs/toolkit";

// 초기 상태
const initialState = [];

// Slice 생성
const frameDataSlice = createSlice({
  name: "frameData",
  initialState,
  reducers: {
    setFrameData: (state, action) => {
      return action.payload;
    },
  },
});

// 액션 및 리듀서 내보내기
export const { setFrameData } = frameDataSlice.actions;
export default frameDataSlice.reducer;
