import createDataContext from "auto-react-context";
import loader from "../api/loader";
import { authTypes } from "./types";

const authReducer = (state, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

export const { Provider, Context } = createDataContext(authReducer, {}, {});
