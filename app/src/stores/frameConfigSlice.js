import { createSlice } from "@reduxjs/toolkit";

// 초기 상태
const initialState = {
  startFrame: 1,
  endFrame: 1,
  currentFrame: 1,
  fps: 0,
};

// Slice 생성
const frameConfigSlice = createSlice({
  name: "frameConfig",
  initialState,
  reducers: {
    setStartFrame: (state, action) => {
      state.startFrame = action.payload;
    },
    setEndFrame: (state, action) => {
      state.endFrame = action.payload;
    },
    setCurrentFrame: (state, action) => {
      state.currentFrame = action.payload;
    },
    setFps: (state, action) => {
      state.fps = action.payload;
    },
  },
});

// 액션 및 리듀서 내보내기
export const { setStartFrame, setEndFrame, setCurrentFrame, setFps } =
  frameConfigSlice.actions;
export default frameConfigSlice.reducer;
