import { createSlice } from "@reduxjs/toolkit";

// 초기 상태
const initialState = null;

// Slice 생성
const videoFileSlice = createSlice({
  name: "videoFile",
  initialState,
  reducers: {
    setVideoFile: (state, action) => {
      state = action.payload;
    },
  },
});

// 액션 및 리듀서 내보내기
export const { setVideoFile } = videoFileSlice.actions;
export default videoFileSlice.reducer;
