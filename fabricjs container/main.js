function sizeDownTextNew (canvasObj, limit_height) {
    console.log('-=sizeDownTextNew=-',canvasObj, limit_height);
    if (typeof(canvasObj) == "undefined" || canvasObj == null)
        return;
    var counter = 250; //Maximum of 10 iterations to size down
    var initial_height = limit_height;
    //Grab all the different sizes inside a single text object
    var sizeArray = [];
    $.each(canvasObj.styles, function(i, obj) {
        if (typeof(obj) != "undefined" && obj != null) {
            $.each(obj, function(j, style) {
                if (typeof(style) != "undefined" && style != null)
                    if (typeof(style.fontSize) != "undefined") {
                        var size = Math.round(style.fontSize * 100) / 100;
                        sizeArray.push(size)
                    }

            });
        }

    });
    //Remove the duplicate text sizes
    var sizeArrayUnique = new Array();
    $(sizeArray).each(function(index, item) {
        if ($.inArray(item, sizeArrayUnique) == -1)
            sizeArrayUnique.push(item);

    });
    if (sizeArrayUnique.length == 0)
        sizeArrayUnique.push(canvasObj.get('fontSize'));
    //Which size is max
    var max = Math.max.apply(Math, sizeArrayUnique);


    var min = 6; //This is our minimum size
    var foundmin = 0; //Flag if minimum is met
    while ((canvasObj.height + 2 < canvasObj._getTextHeight())) //While the height of text is larger then actual text, try reducing the lineHeight
    {
        canvasObj.set('fontSize', max)
        if (canvasObj.lineHeight > 1) {
            canvasObj.lineHeight = parseFloat(parseFloat(canvasObj.lineHeight) - 0.05);
            canvasObj.canvas.renderAll();
            canvasObj.height = initial_height
        } else {
            break;
        }
    } /**/
    //Now reduce the size of actual text font size property
    while (canvasObj.height + 2 < canvasObj._getTextHeight()) //While the height of text is larger then actual text, try reducing the lineHeight
    {

        var fontSize = parseFloat(canvasObj.get('fontSize'));
        fontSize = fontSize - fontSize / max; //reduce the size with a set ratio
        if (fontSize > min) //If main font is greater then min font, we will now reduce
        {
            canvasObj.set('fontSize', fontSize);
            canvasObj.height = initial_height
            if (typeof(canvasObj.styles) != "undefined") //If we have multiple font sizes defined inside a text obj
            {
                //traverse and reduce the sizes one by one
                $.each(canvasObj.styles, function(i, obj) {
                    if (typeof(obj) != "undefined") {
                        $.each(obj, function(j, style) {
                            if (typeof(style) != "undefined")
                                if (typeof(style.fontSize) != "undefined" && foundmin == 0) {
                                    //sizeArray.push(parseFloat(style.fontSize))
                                    var fontSize2 = parseFloat(style.fontSize);
                                    fontSize2 = fontSize2 - fontSize2 / max;
                                    fontSize2 = Math.round(fontSize2 * 100) / 100;
                                    if (fontSize2 > min) {

                                        style.fontSize = fontSize2;

                                        canvasObj.height = initial_height
                                    } else {
                                        foundmin = 1;
                                    }
                                }

                        });
                    }

                });
            }
        } else {
            break;
        }
        canvasObj._splitTextIntoLines(); //Internal fabric function to split lines
        canvasObj.canvas.renderAll();
        canvasObj.height = initial_height;
        canvasObj.setCoords();
        canvasObj.canvas.renderAll();

        if (counter == 0) //Failsafe to exit the while loop if no condition is met
            break;
    }

    //Now if we have resized and still some text is outside, increase the height of box as user will have to manuall delete text to make the box smaller
    if (canvasObj.height < canvasObj._getTextHeight())
        canvasObj.height = canvasObj._getTextHeight();
    canvasObj.setCoords();
    canvasObj.canvas.renderAll();
    trimDownText(canvasObj); //Now if still some text is outside the boundry of box, we need to remove it.

   // populateProperties();
    return max;
}
/**
 * Trims the additional text that goes beyond the boundry of text element
 *
 * @Param canvasObj Actual object on which the locks are to be applied
 */
function trimDownText (canvasObj) {

    var initial_height = canvasObj.height;
    if (canvasObj.height + 2 < canvasObj._getTextHeight()) {

        for (i = canvasObj._textLines.length - 1; i >= 0; i--) {

            var oldText = canvasObj._textLines[i];
            var text = canvasObj.text;
            canvasObj._textLines[i] = '';
            canvasObj.__lineHeights[i] = 0.000001;
            //canvasObj.canvas.renderAll();
        
            text = text.substring(0, text.lastIndexOf(oldText)) + '';
            console.log('_____====oldText', oldText, text);
            // text = trimLastLine(canvasObj);
            canvasObj.set('text', text);
            canvasObj.setCoords();
            canvasObj.canvas.renderAll();
            canvasObj.height = initial_height;
            if ((canvasObj.height + 2) < canvasObj._getTextHeight()) {

                continue;
            } else {

                main.canvas.deactivateAllWithDispatch();
                main.canvas.renderAll();
                main.canvas.setActiveObject(canvasObj); //Make it selected by default
                //canvasObj.enterEditing();
                canvasObj.canvas.renderAll();
                break;
            }
        }

    }

}