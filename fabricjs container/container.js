fabric.Container = fabric.util.createClass(fabric.Rect, {

  type: 'container',

  initialize: function(options) {
    options || (options = { });

    this.callSuper('initialize', options);
    this.set('objectCaching', false);
    this.set('fillColor', this.get('fill') || 'none');
    this.set('dblClick', this.get('dblClick') || false);
    this.set('patternSourceCanvas', new fabric.StaticCanvas());
    this.applyPattern();
    this.on('scaling', this._resize);
    this.on('moving', this._move);

    this.set('defaultBorderColor', this.get('borderColor'));
    this.set('defaultCornerColor', this.get('cornerColor'));
  },


  toObject: function() {
    return fabric.util.object.extend(this.callSuper('toObject'), {
      // label: this.get('label')
    });
  },

  applyPattern: function(){
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

  _setBorder: function(){
    this.set({
      borderColor:'orange',
      cornerColor:'orange'
    });
  },

  _resetBorder: function(){
    this.set({
      borderColor: this.get('defaultBorderColor'),
      cornerColor: this.get('defaultCornerColor')
    });
  },

  _onDoubleClick: function(){
    // const canvas = this.get('canvas');
    // const ctx = canvas.getContext("2d");

  // console.log('ctxctxctx', ctx);

    const dblClick = !this.get('dblClick') ? true : false;
    this.set('dblClick', dblClick);
    // this.callSuper('initialize'); 

    dblClick ? this._setBorder() : this._resetBorder();
      
    this.setCoords();
    this.get('canvas').renderAll();
  },

  _pattern: function(t){
    return new fabric.Pattern({
      source: function() {
        this.patternSourceCanvas.setDimensions({
          width: this.getWidth() + ( (t.width || that.width) - this.getWidth() ),
          height: this.getHeight() + ( (t.height || that.height) - this.getHeight() ),
        });
        this.patternSourceCanvas.renderAll();
        return this.patternSourceCanvas.getElement();
      }.bind(this),
      repeat: 'no-repeat',
      offsetX: 0
    });
  },

 _moveContainerContent: function(){
  // this.callSuper('_setCornerCoords');
  // var pointer = canvas.getPointer(event.e);
  // var posX = pointer.x;
  // var posY = pointer.y;
  // console.log(posX+", "+posY);
  console.log('______________moveContainerContent', this);
    // console.log('ttttttttt',this);
    // const scaleX = this.get('scaleX');
    // const scaleY = this.get('scaleY');
    // const width = this.get('width');
    // const height = this.get('height');
    // const originalState = this.get('originalState');
    // const content = this.get('content');
    // content.image.left *= scaleX;
    // content.image.top *= scaleY;
    // content.left *= scaleX;
    // content.top *= scaleY;
    // content.image.left = originalState.left - content.left;
    // content.left = content.image.left;
    // content.image.top = originalState.top;
    // content.top = content.image.top;
    this.set({

      // width: width * scaleX,
      // height: height * scaleY,
     // content
    });
    // this.setCoords();
    this.applyPattern();
  },


  _resizeContainer: function(){
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
      content
    });
  },

  _resizeContainerContent: function(){
    // this.set({
    //       lockMovementX: true,
    //       lockMovementY: true
    //     });
    const content = this.get('content');
    const scaleX = this.get('scaleX');
    const scaleY = this.get('scaleY');
    const width = content['image']['_originalElement'].width;
    const height = content['image']['_originalElement'].height;

    // console.log(this);
    // const { image } = content;
    content.image.width = width * scaleX;
    content.image.height = height * scaleY;
    content.width = content.image.width;
    content.height = content.image.height;
    this.set({
      // scaleX: 1,
      // scaleY: 1,
      content
    });
    this.setCoords();
  },

  _move: function(){
    if (!this.get('dblClick')) {
      // this._moveContainer();
        this.set({
          lockMovementX: false,
          lockMovementY: false
        });
    } else {
      this.set({
          lockMovementX: true,
          lockMovementY: true
        });
      this._moveContainerContent();
    }
    // this.setCoords();
  },

  _resize: function(){
    if (!this.get('dblClick')) {
      this._resizeContainer();
    } else {
      this._resizeContainerContent();
    }
    this.setCoords();

    // const canvas = this.get('canvas');
    // const ctx = canvas.getContext("2d");

    // this.drawBorders(ctx)
  },

  // _render: function(ctx) {

  //   this.callSuper('_render', ctx); 
    


  //   // this.callSuper('_render', ctx); 
  // }
});