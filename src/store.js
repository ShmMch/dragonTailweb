import { createStore, combineReducers } from "redux";
import { reducer as form } from "redux-form";

const rootReducer = combineReducers({ form });
export default createStore(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
