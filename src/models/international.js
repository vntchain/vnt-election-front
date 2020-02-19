// import { effects } from "redux-sirius";

// const { put } = effects;

export default {
  state: {
    language: "zh"
  },
  reducer: {
    setLanguage: (state, { payload }) => ({
      ...state,
      language: payload
    })
  }
};
