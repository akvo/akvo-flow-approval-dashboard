import { Store } from "pullstate";

const defaultUIState = {
  isLoggedIn: false,
  user: null,
  dashboardData: null,
};

const store = new Store(defaultUIState);

export default store;
