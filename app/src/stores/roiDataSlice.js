import { createSlice } from "@reduxjs/toolkit";

// 초기 상태
const initialState = [];

// Slice 생성
const roiDataSlice = createSlice({
  name: "roiData",
  initialState,
  reducers: {
    addRoiItem: (state, action) => {
      const item = action.payload;
      state.push(item);
    },
    updateRoiItem: (state, action) => {
      const { index, item } = action.payload;
      state[index] = item;
    },
    removeRoiItem: (state, action) => {
      const index = action.payload;
      state.splice(index, 1);
    },
  },
});

// 액션 및 리듀서 내보내기
export const { addRoiItem, updateRoiItem, removeRoiItem } =
  roiDataSlice.actions;
export default roiDataSlice.reducer;
