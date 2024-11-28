import { createSlice } from "@reduxjs/toolkit";

// 초기 상태
const initialState = {
  raw: [],
  filtered: [],
};

// Slice 생성
const frameDataSlice = createSlice({
  name: "frameData",
  initialState,
  reducers: {
    setFrameData: (state, action) => {
      state.raw = action.payload;
    },
    setFilteredFrameData: (state, action) => {
      state.filtered = action.payload; // App.js에서 frameData.raw, roiData 변화가 있을 때 다시 계산
    },
  },
});

// 액션 및 리듀서 내보내기
export const { setFrameData, setFilteredFrameData } = frameDataSlice.actions;
export default frameDataSlice.reducer;
