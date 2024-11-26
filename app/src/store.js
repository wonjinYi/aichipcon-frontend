import { configureStore } from "@reduxjs/toolkit";

import videoFileSlice from "./stores/videoFileSlice";
import frameDataReducer from "./stores/frameDataSlice";
import frameConfigReducer from "./stores/frameConfigSlice";
import roiDataReducer from "./stores/roiDataSlice";
import loadingReducer from "./stores/loadingSlice";

const store = configureStore({
  reducer: {
    videoFile: videoFileSlice, // 선택된 비디오 파일
    frameConfig: frameConfigReducer, // 영상 프레임 선택 범위, 현재 프레임. (start, end, current frame)
    frameData: frameDataReducer, // 인퍼런스 돌린 결과.
    roiData: roiDataReducer, // ROI(폴리곤) 아이템 목록,
    loading: loadingReducer, // 로딩 상태
  },
});

export default store;
