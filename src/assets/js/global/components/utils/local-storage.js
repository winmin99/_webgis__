function AppStorage(app) {
  const local = localStorage;
  this._set = function (data) {
    local[this.app] = JSON.stringify(data);
  };
  this.app = app;
  this.data = JSON.parse(local[this.app] || '{}');
}

AppStorage.prototype = {
  get(key) {
    return this.data[key];
  },
  set(key, value) {
    this.data[key] = value;
  },
  remove(key) {
    delete this.data[key];
  },
  save() {
    this._set(this.data);
  }
};

export default AppStorage;
