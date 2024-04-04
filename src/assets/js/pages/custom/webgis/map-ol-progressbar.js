/**
 * Renders a progress bar.
 * @param {HTMLElement} el The target element.
 * @constructor
 */
function Progress(el) {
  this.el = el;
  this.loading = 0;
  this.loaded = 0;
}

/**
 * Define prototype functions.
 */
Progress.prototype = {
  /**
   * Increment the count of loading tiles.
   */
  addLoading() {
    if (this.loading === 0) {
      this.show();
    }
    ++this.loading;
    this.update();
  },

  /**
   * Increment the count of loaded tiles.
   */
  addLoaded() {
    let this_ = this;
    setTimeout(function () {
      ++this_.loaded;
      this_.update();
    }, 100);
  },

  /**
   * Update the progress bar.
   */
  update() {
    this.el.style.width = ((this.loaded / this.loading) * 100).toFixed(1) + '%';
    if (this.loading === this.loaded) {
      this.loading = 0;
      this.loaded = 0;
      let this_ = this;
      setTimeout(function () {
        this_.hide();
      }, 500);
    }
  },

  /**
   * Show the progress bar.
   */
  show() {
    this.el.style.visibility = 'visible';
  },

  /**
   * Hide the progress bar.
   */
  hide() {
    if (this.loading === this.loaded) {
      this.el.style.visibility = 'hidden';
      this.el.style.width = '0';
    }
  }
};

export default new Progress(document.getElementById('map-progress-bar'));
