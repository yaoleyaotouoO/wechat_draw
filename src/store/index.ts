import AuthStore from "./auth";
import EntryStore from "./entry";
import GameStore from "./game";

export class Store {
  authStore: AuthStore;
  entryStore: EntryStore;
  gameStore: GameStore;

  constructor() {
    this.authStore = new AuthStore();
    this.entryStore = new EntryStore();
    this.gameStore = new GameStore();
  }
}

export default new Store();