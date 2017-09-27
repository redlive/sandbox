'use strict';
(function(window) {
    var fabric = window.fabric || (window.fabric = {});

    fabric.util.object.extend(fabric.Object.prototype, {


        _setLineDash: function(ctx, dashArray, alternative) {
            console.log('++++++++++++++++++++++ _setLineDash');
            if (!dashArray) {
                return;
            }
            // Spec requires the concatenation of two copies the dash list when the number of elements is odd
            if (1 & dashArray.length) {
                dashArray.push.apply(dashArray, dashArray);
            }
            if (supportsLineDash) {
                ctx.setLineDash(dashArray);
            } else {
                alternative && alternative(ctx);
            }
        },

        saveState: function(options) {
            console.log('++++++++++++++++++++++ saveState');
            this.stateProperties.forEach(function(prop) {
                this.originalState[prop] = this.get(prop);
                if (this.content) {
                    this.content.originalState = this.content.originalState || {};
                    if (['width', 'height', 'top', 'left'].indexOf(prop) > -1) {
                        this.content.originalState[prop] = this.get('content')[prop];
                    }
                }
            }, this);

            if (options && options.stateProperties) {
                options.stateProperties.forEach(function(prop) {
                    this.originalState[prop] = this.get(prop);
                    if (this.content) {
                        this.content.originalState = this.content.originalState || {};
                        if (['width', 'height', 'top', 'left'].indexOf(prop) > -1) {
                            this.content.originalState[prop] = this.get('content')[prop];
                        }
                    }
                }, this);
            }

            return this;
        },


        _drawControl: function(control, ctx, methodName, left, top, styleOverride) {

            console.log('++++++++++++++++++++++ _drawControl');
            styleOverride = styleOverride || {};
            if (!this.isControlVisible(control)) {
                return;
            }
            var size = this.cornerSize,
                stroke = !this.transparentCorners && this.cornerStrokeColor;
            switch (styleOverride.cornerStyle || this.cornerStyle) {
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(left + size / 2, top + size / 2, size / 2, 0, 2 * Math.PI, false);
                    ctx[methodName]();
                    if (stroke) {
                        ctx.stroke();
                    }
                    break;
                default:
                    this.transparentCorners || ctx.clearRect(left, top, size, size);
                    ctx[methodName + 'Rect'](left, top, size, size);
                    if (stroke) {
                        ctx.strokeRect(left, top, size, size);
                    }
            }
        },




        drawControls: function(ctx) {
            console.log('++++++++++++++++++++++ drawControls');
            if (!this.hasControls) {
                return this;
            }

            var wh = this._calculateCurrentDimensions(),
                width = wh.x,
                height = wh.y,
                scaleOffset = this.cornerSize,
                left = -(width + scaleOffset) / 2,
                top = -(height + scaleOffset) / 2,
                methodName;



            if (!this.useCustomIcons) {
                ctx.lineWidth = 1;
                ctx.globalAlpha = this.isMoving ? this.borderOpacityWhenMoving : 1;
                ctx.strokeStyle = ctx.fillStyle = this.cornerColor;

                if (!this.transparentCorners) {
                    ctx.strokeStyle = this.cornerStrokeColor;
                }

                methodName = this.transparentCorners ? 'stroke' : 'fill';
            } else {
                methodName = 'drawImage';
            }

            ctx.save();
            this._setLineDash(ctx, this.cornerDashArray, null);

            // top-left


            if (this.type === 'container' && this.dblClick) {
                left += this.content.image.left;
                top += this.content.image.top;
                width = this.content.image.width;
                height = this.content.image.height;
            }

            this._drawControl('tl', ctx, methodName,
                left,
                top,
                this.tlIcon,
                this.tlSettings
            );

            // top-right
            this._drawControl('tr', ctx, methodName,
                left + width,
                top,
                this.trIcon,
                this.trSettings
            );

            // bottom-left
            this._drawControl('bl', ctx, methodName,
                left,
                top + height,
                this.blIcon,
                this.blSettings
            );

            // bottom-right
            this._drawControl('br', ctx, methodName,
                left + width,
                top + height,
                this.brIcon,
                this.brSettings
            );

            if (!this.get('lockUniScaling')) {

                // middle-top
                this._drawControl('mt', ctx, methodName,
                    left + width / 2,
                    top,
                    this.mtIcon,
                    this.mtSettings
                );

                // middle-bottom
                this._drawControl('mb', ctx, methodName,
                    left + width / 2,
                    top + height,
                    this.mbIcon,
                    this.mbSettings
                );

                // middle-right
                this._drawControl('mr', ctx, methodName,
                    left + width,
                    top + height / 2,
                    this.mrIcon,
                    this.mrSettings
                );

                // middle-left
                this._drawControl('ml', ctx, methodName,
                    left,
                    top + height / 2,
                    this.mlIcon,
                    this.mlSettings
                );
            }

            // middle-top-rotate
            if (this.hasRotatingPoint) {
                this._drawControl('mtr', ctx, methodName,
                    left + width / 2,
                    top - this.rotatingPointOffset,
                    this.mtrIcon,
                    this.mtrSettings
                );
            }

            ctx.restore();

            return this;
        },


        // _getNonTransformedDimensions: function() {
        //   var dim = this.callSuper('_getNonTransformedDimensions');
        //           console.log('_______________________________________dimdimdim', dim);
        //   if (this.strokeLineCap === 'butt') {
        //     if (this.width === 0) {
        //       dim.y -= this.strokeWidth;
        //     }
        //     if (this.height === 0) {
        //       dim.x -= this.strokeWidth;
        //     }
        //   }
        //   return dim;
        // },

        _rebuildCoords: function(coords) {
            coords.tl.x = this.left + this.content.left;
            coords.tl.y = this.top + this.content.top;

            coords.tr.x = this.left + this.content.left + this.content.width;
            coords.tr.y = this.top + this.content.top;

            coords.bl.x = this.left + this.content.left;
            coords.bl.y = this.top + this.content.top + this.content.height;

            coords.br.x = this.left + this.content.left + this.content.width;
            coords.br.y = this.top + this.content.top + this.content.height;

            coords.ml.x = this.left + this.content.left;
            coords.ml.y = this.top + this.content.top + this.content.height / 2;

            coords.mr.x = this.left + this.content.left + this.content.width;
            coords.mr.y = this.top + this.content.top + this.content.height / 2;

            coords.mt.x = this.left + this.content.left + this.content.width / 2;
            coords.mt.y = this.top + this.content.top;

            coords.mb.x = this.left + this.content.left + this.content.width / 2;
            coords.mb.y = this.top + this.content.top + this.content.height;

            coords.mtr.x = this.left + this.content.left + this.content.width / 2;
            coords.mtr.y = this.top;
            return coords;
        },

        _setCornerCoords: function() {

            console.log('++++++++++++++++++++++ _setCornerCoords', this.__corner, this);

            var degreesToRadians = function(degrees) {
                // return degrees * PiBy180;
                return degrees * Math.PI / 180;
            };
            var coords = this.oCoords,
                newTheta = degreesToRadians(45 - this.angle),
                /* Math.sqrt(2 * Math.pow(this.cornerSize, 2)) / 2, */
                /* 0.707106 stands for sqrt(2)/2 */
                cornerHypotenuse = this.cornerSize * 0.707106,
                cosHalfOffset = cornerHypotenuse * Math.cos(newTheta),
                sinHalfOffset = cornerHypotenuse * Math.sin(newTheta),
                x, y;
            const containerContentShift = {
                tl: {
                    x: 0,
                    y: 0
                },
                tr: {
                    x: 0,
                    y: 0
                },
                bl: {
                    x: 0,
                    y: 0
                },
                br: {
                    x: 0,
                    y: 0
                }
            }


            for (var point in coords) {

                if (this.type === 'container' && this.dblClick) {
                    // containerContentShift.tl = { x: this.image.left, y: this.image.top };
                    // containerContentShift.tr = { x: this.image.left, y: this.image.top };
                    // containerContentShift.tl = { x: this.image.left, y: this.image.top };
                    // containerContentShift.tl = { x: this.image.left, y: this.image.top };
                    coords = this._rebuildCoords(coords);


                    // console.log('___===', coords);
                    // this.canvas.add(new fabric.Rect({
                    //   top: coords.mtr.y,
                    //   left: coords.mtr.x,
                    //   width: 10,
                    //   height: 10,
                    //   fill: 'green'
                    // }));
                }
                x = coords[point].x;
                y = coords[point].y;

                coords[point].corner = {
                    tl: {
                        x: x - sinHalfOffset,
                        y: y - cosHalfOffset
                    },
                    tr: {
                        x: x + cosHalfOffset,
                        y: y - sinHalfOffset
                    },
                    bl: {
                        x: x - cosHalfOffset,
                        y: y + sinHalfOffset
                    },
                    br: {
                        x: x + sinHalfOffset,
                        y: y + cosHalfOffset
                    }
                };
            }
            // console.log('___________setCornerCoords', coords, this.image);
            // return coords;
        },

        drawBorders: function(ctx, styleOverride) {
            const typeConteiner = (this.type === 'container' && this.dblClick);
            console.log('++++++++++++++++++++++ drawBorders');
            styleOverride = styleOverride || {};

            console.log('_______________________________________', this, this.get('scaleX'));

            var wh = this._calculateCurrentDimensions(),
                strokeWidth = 1 / this.borderScaleFactor,
                width = wh.x + strokeWidth,
                height = wh.y + strokeWidth,
                drawRotatingPoint = typeof styleOverride.hasRotatingPoint !== 'undefined' ?
                    styleOverride.hasRotatingPoint : this.hasRotatingPoint,
                hasControls = typeof styleOverride.hasControls !== 'undefined' ?
                    styleOverride.hasControls : this.hasControls,
                rotatingPointOffset = typeof styleOverride.rotatingPointOffset !== 'undefined' ?
                    styleOverride.rotatingPointOffset : this.rotatingPointOffset;

            ctx.save();
            ctx.strokeStyle = styleOverride.borderColor || this.borderColor;
            this._setLineDash(ctx, styleOverride.borderDashArray || this.borderDashArray, null);


            if (typeConteiner) {
                ctx.strokeRect(-width / 2 + this.content.image.left, -height / 2 + this.content.image.top,
                    this.content.image.width,
                    this.content.image.height
                );
            } else {
                ctx.strokeRect(-width / 2, -height / 2,
                    width,
                    height
                );
            }
            // this.setCoords();

            if (drawRotatingPoint && this.isControlVisible('mtr') && hasControls) {

                var rotateHeight = typeConteiner ? (-height + this.content.image.top) / 2 : -height / 2;

                ctx.beginPath();
                ctx.moveTo(0, rotateHeight);

                if (typeConteiner) {
                    ctx.lineTo(0, rotateHeight);
                } else {
                    ctx.lineTo(0, rotateHeight - rotatingPointOffset);
                }

                ctx.closePath();
                ctx.stroke();
            }

            ctx.restore();
            return this;
        }
    });

    if (typeof exports !== 'undefined') {
        module.exports = this;
    }

})(window);