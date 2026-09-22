import { combineReducers } from 'redux';
import commonData from './commonDataReducer';

const rootReducer = combineReducers({
  commonData,
});

export default rootReducer;
