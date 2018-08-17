// @flow

export const MENU_SELECTED = 'MENU_SELECTED';

export function menuSelected(menu) {
  return {
    type: MENU_SELECTED,
    menu
  };
}

export function changedMenu(menu) {
  return (
    dispatch: (action: actionType) => void,
  ) => {
    dispatch(menuSelected(menu));
  };
}
