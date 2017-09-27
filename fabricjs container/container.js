fabric.Container = fabric.util.createClass(fabric.Rect, {

    type: 'container',

    initialize: function(options) {
        options || (options = {});

        this.callSuper('initialize', options);
        this.set('objectCaching', false);
        this.set('fillColor', this.get('fill') || 'none');
        this.set('dblClick', this.get('dblClick') || false);
        this.set('patternSourceCanvas', new fabric.StaticCanvas());
        this.applyPattern();
        this.on('scaling', this._resize);
        this.on('moving', this._move);
        this.on('rotating', this._rotate);

        this.set('defaultBorderColor', this.get('borderColor'));
        this.set('defaultCornerColor', this.get('cornerColor'));
    },


    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            // label: this.get('label')
        });
    },

    applyPattern: function() {
        const container = this;
        const content = this.get('content');
        const fillColor = this.get('fillColor');
        // const dblClick = this.get('dblClick');
        const patternSourceCanvas = container.patternSourceCanvas;
        // console.log('----------============----------render with dblClick', dblClick);
        fabric.Image.fromURL(content.src, function(img) {
            content.image = img;
            // container.set('image', img);

            fillColor && patternSourceCanvas.setBackgroundColor(fillColor, container.patternSourceCanvas.renderAll.bind(patternSourceCanvas));

            patternSourceCanvas.setBackgroundImage(img, patternSourceCanvas.renderAll.bind(patternSourceCanvas), {
                top: content.top,
                left: content.left,
                width: content.width,
                height: content.height,
                angle: content.angle
                // originX: 'left',
                // originY: 'top'
            });
            patternSourceCanvas.renderAll();

            container.set({
                fill: container._pattern(container),
                content
            });

            if (!container.get('initialLoad')) {
                canvas.renderAll();
                container.set('initialLoad', true);
            }
        });
    },

    _setBorder: function() {
        this.set({
            borderColor: 'orange',
            cornerColor: 'orange'
        });
    },

    _resetBorder: function() {
        this.set({
            borderColor: this.get('defaultBorderColor'),
            cornerColor: this.get('defaultCornerColor')
        });
    },

    _onDoubleClick: function() {
        // const canvas = this.get('canvas');
        // const ctx = canvas.getContext("2d");

        // console.log('ctxctxctx', ctx);

        const dblClick = !this.get('dblClick');
        this.set('dblClick', dblClick);
        // this.callSuper('initialize');

        dblClick ? this._setBorder() : this._resetBorder();

        this.setCoords();
        this.get('canvas').renderAll();
    },

    _pattern: function(t) {
        return new fabric.Pattern({
            source: function() {
                this.patternSourceCanvas.setDimensions({
                    width: this.getWidth() + ((t.width || that.width) - this.getWidth()),
                    height: this.getHeight() + ((t.height || that.height) - this.getHeight()),
                });
                this.patternSourceCanvas.renderAll();
                return this.patternSourceCanvas.getElement();
            }.bind(this),
            repeat: 'no-repeat',
            offsetX: 0
        });
    },

    _rotateContainerContent: function() {
        const content = this.get('content');
        const angle = this.get('angle');

        content.angle = content.originalState.angle + angle;

        this.set({
            angle: this.get('originalState').angle,
            content
        });
        this.applyPattern();
    },

    _moveContainerContent: function() {
        const content = this.get('content');
        const top = this.get('top');
        const left = this.get('left');
        const topShift = top - this.get('originalState').top;
        const leftShift = left - this.get('originalState').left;

        content.image.top = content.top = content.originalState.top + topShift;
        content.image.left = content.left = content.originalState.left + leftShift;

        this.set({
            top: this.get('originalState').top,
            left: this.get('originalState').left
        });
        this.applyPattern();
    },


    _resizeContainer: function() {
        const content = this.get('content');
        const scaleX = this.get('scaleX');
        const scaleY = this.get('scaleY');
        const width = this.get('width');
        const height = this.get('height');

        const left = this.get('left');
        const originalLeft = this.get('originalState').left;
        const leftShift = originalLeft - left;

        const top = this.get('top');
        const originalTop = this.get('originalState').top;
        const topShift = originalTop - top;

        content.left = content.originalState.left + leftShift;
        content.image.left = content.left;

        content.top = content.originalState.top + topShift;
        content.image.top = content.top;

        this.set({
            scaleX: 1,
            scaleY: 1,
            width: width * scaleX,
            height: height * scaleY,
            content: content
        });
    },

    _resizeContainerContent: function() {
        const content = this.get('content');
        const scaleX = this.get('scaleX');
        const scaleY = this.get('scaleY');

        content.width = content.image.width = content.originalState.width * scaleX;
        content.height = content.image.height = content.originalState.height * scaleY;

        this.set({
            left: this.get('originalState').left,
            scaleX: 1,
            scaleY: 1,
            content: content
        });
    },

    _move: function() {
        if (!this.get('dblClick')) {
            // this._moveContainer();
        } else {
            this._moveContainerContent();
        }
    },

    _rotate: function() {
        if (this.get('dblClick')) {
            this._rotateContainerContent();
        }
    },

    _resize: function() {
        if (!this.get('dblClick')) {
            this.set({
                lockMovementX: false,
                lockMovementY: false
            });
            this._resizeContainer();
        } else {
            this.set({
                lockMovementX: true,
                lockMovementY: true
            });
            this._resizeContainerContent();
        }
        // this.setCoords();

        // const canvas = this.get('canvas');
        // const ctx = canvas.getContext("2d");

        // this.drawBorders(ctx)
    },

    // _render: function(ctx) {

    //   this.callSuper('_render', ctx);



    //   // this.callSuper('_render', ctx);
    // }
});