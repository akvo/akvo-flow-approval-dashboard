import { Store } from "pullstate";

const defaultUIState = {
  isLoggedIn: false,
  user: null,
  page: "Login",
};

const store = new Store(defaultUIState);

export default store;
