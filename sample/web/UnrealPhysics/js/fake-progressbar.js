function ProgressBar() {
  let body = document.getElementsByTagName('body')[0];
  let canvas = document.getElementsByTagName('canvas')[0];

  this.panel = document.createElement('div');
  this.panel.style.position = 'absolute';
  this.panel.style.top = (canvas.offsetHeight/2 - 10) + 'px';
  this.panel.style.width = '80%';
  this.panel.style.transform = 'skewX(160deg)';

  let border = document.createElement('div');
  border.style.position = 'relative';
  border.style.left = '20%';
  border.style.border = '1px solid black';
  border.style.padding = '1px';
  border.style.width = '80%';
  border.style.height = '20px';

  this.panel.appendChild(border);

  this.bar = document.createElement('div');
  this.bar.style.background = '#1b96ff';
  this.bar.style.boxShadow = '3px 0px 5px 0px #77adff';
  this.bar.style.borderRight = '2px solid #0141a0';
  this.bar.style.width = '0';
  this.bar.style.height = '100%';

  border.appendChild(this.bar);

  body.appendChild(this.panel);
}

ProgressBar.prototype.begin = function(time) {
  this.bar.style.transition = time + 's';
  this.bar.style.width = '100%';
};

ProgressBar.prototype.remove = function() {
  this.setValue(100);

  this.panel.style.transition = '500ms';
  this.panel.style.opacity = 0;
  setTimeout(() => {
    this.panel.parentElement.removeChild(this.panel);
  }, 500);
};

ProgressBar.prototype.setValue = function(value) {
  this.bar.style.transition = 'none';
  this.bar.style.width = value + '%';
};
