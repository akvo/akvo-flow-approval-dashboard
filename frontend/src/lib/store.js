import { Store } from "pullstate";

const defaultUIState = {
  isLoggedIn: false,
  user: null,
  formId: null,
  pending: null,
  approved: null,
  rejected: null,
};

const store = new Store(defaultUIState);

export default store;
