fabric.LabeledRect = fabric.util.createClass(fabric.Textbox, {

  type: 'labeledRect',

  initialize: function(text, options) {
    options || (options = { });

    this.callSuper('initialize', text, options);
    this.set('top', options.top || 0);
    this.set('left', options.left || 0);
    this.set('width', options.width || 100);
    this.set('height', options.height || 50);
    this.set('bottom', options.top + options.height);
    this.set('right', options.left + options.width);
  },

  // toObject: function() {
  //   return fabric.util.object.extend(this.callSuper('toObject'), {
  //     label: this.get('label')
  //   });
  // },

  _render: function(ctx) {
    let accumulatedHeight = 0;
    let newText = [];
    let newOriginalText = [];

    for (let i in this._textLines) {
        this._textLines[i].trim(' ');
        newOriginalText.push(this._textLines[i]);
        accumulatedHeight += this.__lineHeights[i];
        if (accumulatedHeight <= this.get('height')) {
            newText.push(this._textLines[i].trim());
        }
    }

    this.set('_textLines', newText);
    this.callSuper('_render', ctx);

    ctx.rect(
        this.get('top'),
        this.get('left'),
        this.get('bottom'),
        this.get('right')
    );
  }
});

(function() {
    //Override function for textbox to handle the size down and height based on restrictions

    fabric.Textbox.prototype._initDimensions = function(ctx) {


        if (this.__skipDimension) {
            return;
        }

        if (!ctx) {
            ctx = fabric.util.createCanvasElement().getContext('2d');
            this._setTextStyles(ctx);
        }

        // clear dynamicMinWidth as it will be different after we re-wrap line
        this.dynamicMinWidth = 0;

        // wrap lines
        this._textLines = this._splitTextIntoLines(ctx);


        // clear cache and re-calculate height
        this._clearCache();
        this.minHeight = this._getTextHeight(ctx);
        if (this.height <= 0)
            this.height = this.minHeight;


    }
}).call(this);



(function() {
    fabric.Canvas.prototype._setObjectScale = function(localMouse, transform, lockScalingX, lockScalingY, by, lockScalingFlip, _dim) {
        var target = transform.target,
            forbidScalingX = false,
            forbidScalingY = false,
            scaled = false,
            changeX, changeY, scaleX, scaleY;
        var t = transform.target;

        if (t instanceof fabric.Textbox) {
            transform.newScaleX = t.scaleX;
            transform.newScaleY = t.scaleY;
            transform.scaleX = t.get('scaleX');
            transform.scaleY = t.get('scaleY');
            transform.oldLeft = t.get('left');
            transform.oldHeight = t.get('height');
            transform.oldWidth = t.get('width');
            transform.oldTop = t.get('top');
            t.oldWidth = transform.oldWidth;
            t.oldHeight = transform.oldHeight;
            var h = t.height * ((localMouse.y / transform.scaleY) / (t.height + t.strokeWidth));

            t.isScaling = true;
            var w = t.width * ((localMouse.x / transform.scaleX) / (t.width + t.strokeWidth));
            if (w >= t.minWidth) {
                // t.set('width', w);
            }

            //t.set('width', w);
            // t.set('height', h);
            if (h >= t.minHeight) {
                //t.set('height', h);
            } else {
                // t.set('height', t.minHeight);
            }
            if (h < 10)
                h = 10;
            t.set('width', w);
            t.set('height', h);
            return true;

        } else {
            scaleX = localMouse.x * target.scaleX / _dim.x;
            scaleY = localMouse.y * target.scaleY / _dim.y;
            changeX = target.scaleX !== scaleX;
            changeY = target.scaleY !== scaleY;

            if (lockScalingFlip && scaleX <= 0 && scaleX < target.scaleX) {
                forbidScalingX = true;
            }

            if (lockScalingFlip && scaleY <= 0 && scaleY < target.scaleY) {
                forbidScalingY = true;
            }

            if (by === 'equally' && !lockScalingX && !lockScalingY) {
                transform.scaleX = target.get('scaleX');
                transform.scaleY = target.get('scaleY');
                transform.oldLeft = target.get('left');
                transform.oldTop = target.get('top');
                forbidScalingX || forbidScalingY || (scaled = this._scaleObjectEqually(localMouse, target, transform, _dim));
            } else if (!by) {
                transform.scaleX = target.get('scaleX');
                transform.scaleY = target.get('scaleY');
                transform.oldLeft = target.get('left');
                transform.oldTop = target.get('top');
                forbidScalingX || lockScalingX || (target.set('scaleX', scaleX) && (scaled = scaled || changeX));
                forbidScalingY || lockScalingY || (target.set('scaleY', scaleY) && (scaled = scaled || changeY));
            } else if (by === 'x' && !target.get('lockUniScaling')) {
                transform.scaleX = target.get('scaleX');
                transform.oldLeft = target.get('left');
                transform.oldTop = target.get('top');
                forbidScalingX || lockScalingX || (target.set('scaleX', scaleX) && (scaled = scaled || changeX));
            } else if (by === 'y' && !target.get('lockUniScaling')) {
                transform.scaleY = target.get('scaleY');
                transform.oldLeft = target.get('left');
                transform.oldTop = target.get('top');
                forbidScalingY || lockScalingY || (target.set('scaleY', scaleY) && (scaled = scaled || changeY));
            }
            transform.newScaleX = scaleX;
            transform.newScaleY = scaleY;
            forbidScalingX || forbidScalingY || this._flipObject(transform, by);
        }

        return scaled;

    }
}).call(this);