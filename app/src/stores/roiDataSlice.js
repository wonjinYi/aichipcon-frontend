import { createSlice } from "@reduxjs/toolkit";

// 초기 상태
const initialState = {
  editIndex: null,
  data: [],
};

// Slice 생성
const roiDataSlice = createSlice({
  name: "roiData",
  initialState,
  reducers: {
    addRoiItem: (state, action) => {
      const item = action.payload;
      state.data.push(item);
    },
    updateRoiItem: (state, action) => {
      const { index, item } = action.payload;
      state.data[index] = item;
    },
    removeRoiItem: (state, action) => {
      const index = action.payload;
      state.data.splice(index, 1);
    },
    selectRoiItem: (state, action) => {
      state.editIndex = action.payload;
    },
    unselectRoiItem: (state) => {
      state.editIndex = null;
    },
  },
});

// 액션 및 리듀서 내보내기
export const {
  addRoiItem,
  updateRoiItem,
  removeRoiItem,
  selectRoiItem,
  unselectRoiItem,
} = roiDataSlice.actions;
export default roiDataSlice.reducer;
