export abstract class GameElement {
  static UID_COUNT = 0;
  uid: number;
  protected constructor() {
    //TODO: add hex here
    // then we can probably also switch to a custom honeycomb hex class

    this.uid = GameElement.UID_COUNT++;
  }

  static sanitizeName(name: string) {
    return name.toLowerCase().replace(" ", "_");
  }

  getFileName() {
    throw new Error("getFileName not implemented");
  }
}
