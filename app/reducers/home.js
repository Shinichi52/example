// @flow
import { MENU_SELECTED } from '../actions/home';

export default function home(state = {}, action: actionType) {
  switch (action.type) {
    case MENU_SELECTED:
      return {
        ...state,
        menu: action.menu
      };
    default:
      return state;
  }
}
