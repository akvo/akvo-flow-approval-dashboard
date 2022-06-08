import { Store } from "pullstate";

const defaultUIState = {
  isLoggedIn: false,
  user: null,
  extraButton: false,
};

const store = new Store(defaultUIState);

export default store;
