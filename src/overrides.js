import { boundingBox, excludeSidebar } from "./blocks.js";
import { compatibilityHandler } from "./compatibilityHandler.js";
import { getEnable } from "./misc.js";

  /**
   * Modified _constrainView from foundry.js line 10117
   * Allows higher scaling resolution
   */
  export function constrainView_Override({x, y, scale}) {
    const d = canvas.dimensions;                    //Canvas dimensions
    let boxDefined = false;                         //Whether a bounding box has been drawn
    let bound = {Xmin:0,Xmax:0,Ymin:0,Ymax:0};      //Stores the bounding box values
    let rect = {Xmin:0,Xmax:0,Ymin:0,Ymax:0};       //Stores the bounding rectangle values
    let scaleChange = false;                        //Checks if the scale must be changed
    let drawings = canvas.scene.drawings.contents;      //The drawings on the canvas
    let scaleMin;                                   //The minimum acceptable scale
    let controlledTokens = [];                      //Array or tokens that are controlled by the user
    
    if (boundingBox && getEnable(game.userId)) {
      let tokensInBox = 0;                            //Number of tokens in the bounding box
      let force = false;                              //Rectangle is defined as 'Force Always'
      
      //Get the controlled tokens
      if (game.user.isGM == false) controlledTokens = canvas.tokens.controlled; 

      //Check all drawings in the scene
      for (let i=0; i<drawings.length; i++){
        const drawing = drawings[i];

        //If drawing isn't a rectangle, continue
        if (drawing.shape.type != "r" || force) continue;
      
        //Check boundingbox mode of the rectangle
        if (drawing.flags.LockView == undefined) continue;
        if (drawing.flags.LockView.boundingBox_mode == 0) continue;
        const mode = drawing.flags.LockView.boundingBox_mode;
        
        //Get the line width of the rectangle
        const lineWidth = drawing.strokeWidth;

        //Store rectangle location
        let rectTemp = {
          Xmin : drawing.x+lineWidth,
          Xmax : drawing.x+drawing.shape.width-2*lineWidth,
          Ymin : drawing.y+lineWidth,
          Ymax : drawing.y+drawing.shape.height-2*lineWidth
        }

        //If 'mode' is 'Always', set the rect variable and break the 'for statement'
        if (mode == 2) {
          rect.Xmin = rectTemp.Xmin;
          rect.Xmax = rectTemp.Xmax;
          rect.Ymin = rectTemp.Ymin;
          rect.Ymax = rectTemp.Ymax;
          boxDefined = true;
          force = true;
          break;
        }

        //Check if one of the tokens that are controlled by the user are within the rectangle
        let activeToken = false;
        for (let j=0; j<controlledTokens.length; j++){
          //Get the center of the token
          let center = compatibilityHandler('getCenter', controlledTokens[j], controlledTokens[j].x, controlledTokens[j].y);
          
          //Check if it is within the rectangle
          if (center.x>=rectTemp.Xmin && center.x<=rectTemp.Xmax && center.y>=rectTemp.Ymin && center.y<=rectTemp.Ymax){
            activeToken = true;
            tokensInBox++;

            //Extend rect variable so all rectanges that a controlled token is within are included
            if (rect.Xmin == 0 || rectTemp.Xmin < rect.Xmin) rect.Xmin = rectTemp.Xmin;
            if (rect.Xmax == 0 || rectTemp.Xmax > rect.Xmax) rect.Xmax = rectTemp.Xmax;
            if (rect.Ymin == 0 || rectTemp.Ymin < rect.Ymin) rect.Ymin = rectTemp.Ymin;
            if (rect.Ymax == 0 || rectTemp.Ymax > rect.Ymax) rect.Ymax = rectTemp.Ymax;
          }
        }

        if (activeToken == false) continue;
            boxDefined = true;
      }

      let controlledTokensLength = 0;
      if (game.user.isGM) 
        boxDefined = false; 
      else
        controlledTokensLength = controlledTokens.length;

      //If there is no box defined, or not all tokens are in the box, and no rectangle is set to 'Force Always', set 'rect' to the canvas size
      if ((boxDefined == false || tokensInBox != controlledTokensLength) && force == false) {
        rect.Xmin = canvas.dimensions.sceneRect.x;
        rect.Xmax = canvas.dimensions.sceneRect.x+canvas.dimensions.sceneRect.width;
        rect.Ymin = canvas.dimensions.sceneRect.y;
        rect.Ymax = canvas.dimensions.sceneRect.y+canvas.dimensions.sceneRect.height;
      }

      //If 'excludeSidebar' is enabled and the sidebar is not collapsed, add sidebar width to rect variable
      if (excludeSidebar && ui.sidebar._collapsed == false)
        rect.Xmax += Math.ceil(ui.sidebar.position.width/canvas.scene._viewPosition.scale);

      //Compare ratio between window size and rect size in x and y direction to determine if the fit should be horizontal or vertical
      const horizontal = ((window.innerWidth / (rect.Xmax-rect.Xmin)) > (window.innerHeight / (rect.Ymax-rect.Ymin))) ? true : false;

      //Get the minimum allowable scale
      if (horizontal) scaleMin = window.innerWidth/(rect.Xmax-rect.Xmin);
      else scaleMin = window.innerHeight/(rect.Ymax-rect.Ymin);
    }

    //Check if the scale is a number, otherwise set it to the current canvas' scale
    if ( Number.isNumeric(scale) == false) scale = canvas.scene._viewPosition.scale;
    
    //Get the max zoom
    const max = CONFIG.Canvas.maxZoom;

    //Calculate the min zoom
    const ratio = Math.max(d.width / window.innerWidth, d.height / window.innerHeight, max);
    let min = 1 / ratio;
    if (boundingBox) min = scaleMin;
    
    //Get the new scale
    scale = Math.round(compatibilityHandler('clamp', scale, min, max) * 2000) / 2000;
    
    //Set the bounding box
    bound.Xmin = rect.Xmin+window.innerWidth/(2*scale);
    bound.Xmax = rect.Xmax-window.innerWidth/(2*scale);
    bound.Ymin = rect.Ymin+window.innerHeight/(2*scale);
    bound.Ymax = rect.Ymax-window.innerHeight/(2*scale);
   
    //Get the new x value
    if (Number.isNumeric(x) == false) x = canvas.stage.pivot.x;
    const padw = 0.4 * (window.innerWidth / scale);
    if (boundingBox){
      x = compatibilityHandler('clamp', x, bound.Xmin, bound.Xmax);
    }
    else x = compatibilityHandler('clamp', x, -padw, d.width + padw);
   
    //Get the new y value
    if (Number.isNumeric(y) == false) y = canvas.stage.pivot.y;
    const padh = 0.4 * (window.innerHeight / scale);
    if (boundingBox){
      y = compatibilityHandler('clamp', y, bound.Ymin, bound.Ymax);
    }
    else y = compatibilityHandler('clamp', y, -padh, d.height + padh);
    
    return {x, y, scale};
  }

  /**
 * Modified pan from foundry.js
 * redirects _constrainView to _constrainView_Override for higher scaling resolution
 */
  export function pan_OverrideHigherRes({x=null, y=null, scale=null}={}) {
    const constrained = constrainView_Override({x, y, scale});
    this.stage.pivot.set(constrained.x, constrained.y);
    this.stage.scale.set(constrained.scale, constrained.scale);
    this.updateBlur();
    canvas.scene._viewPosition = constrained;
    Hooks.callAll("canvasPan", this, constrained);
    this.hud.align();
    compatibilityHandler('refreshVision');
  }

/**
 * Empty function used to override Canvas.prototype._onMouseWheel and prototype._onDragCanvasPan to prevent zooming and/or panning
 */
export function _Override(event) {}

/**
 * Modified pan from foundry.js
 * Removes the x and y arguents from _constrainView to prevent panning
 */
export function pan_Override({x=null, y=null, scale=null}={}) {
  // Constrain the resulting canvas view
  let constrained;
  if (canvas.scene.getFlag('LockView', 'boundingBox') && canvas.scene.getFlag('LockView', 'lockPan')) constrained = constrainView_Override({scale});
  else if (canvas.scene.getFlag('LockView', 'boundingBox') && canvas.scene.getFlag('LockView', 'lockPan') == false) constrained = constrainView_Override({x, y, scale});
  else constrained = constrainView({scale});
  const scaleChange = constrained.scale !== this.stage.scale.x;

  // Set the pivot point
  this.stage.pivot.set(constrained.x, constrained.y);

  // Set the zoom level
  if ( scaleChange ) {
    this.stage.scale.set(constrained.scale, constrained.scale);
    this.updateBlur(constrained.scale);
  }

  // Update the scene tracked position
  canvas.scene._viewPosition = constrained;

  // Call hooks
  Hooks.callAll("canvasPan", this, constrained);

  // Update controls
  this.controls._onCanvasPan();

  // Align the HUD
  this.hud.align();

  compatibilityHandler('refreshVision');
}

let panTime = 0;

export function onDragCanvasPan_Override(event){
// Throttle panning by 200ms
  const now = Date.now();
  if ( now - (panTime || 0) <= 200 ) return;
  panTime = now;

  // Shift by 3 grid spaces at a time
  const {x, y} = event;
  const pad = 50;
  const shift = (this.dimensions.size * 3) / this.stage.scale.x;

  // Shift horizontally
  let dx = 0;
  if ( x < pad ) dx = -shift;
  else if ( x > window.innerWidth - pad ) dx = shift;

  // Shift vertically
  let dy = 0;
  if ( y < pad ) dy = -shift;
  else if ( y > window.innerHeight - pad ) dy = shift;

  const constrained = constrainView_Override({x:this.stage.pivot.x + dx, y:this.stage.pivot.y + dy});

  // Enact panning
  if ( dx || dy ) return this.animatePan({x: constrained.x, y: constrained.y, duration: 200});
}

export async function animatePan_Override({x, y, scale, duration=250, speed}) {
  // Determine the animation duration to reach the target
  if ( speed ) {
    let ray = new Ray(this.stage.pivot, {x, y});
    duration = Math.round(ray.distance * 1000 / speed);
  }

  // Constrain the resulting dimensions and construct animation attributes
  const constrained = constrainView_Override({x, y, scale});
  const attributes = [
    { parent: this.stage.pivot, attribute: 'x', to: constrained.x },
    { parent: this.stage.pivot, attribute: 'y', to: constrained.y },
    { parent: this.stage.scale, attribute: 'x', to: constrained.scale },
    { parent: this.stage.scale, attribute: 'y', to: constrained.scale },
  ].filter(a => a.to !== undefined);

  // Trigger the animation function
  await CanvasAnimation.animate(attributes, {
    name: "canvas.animatePan",
    duration: duration,
    easing: CanvasAnimation.easeInOutCosine,
    ontick: () => {
      this.hud.align();
      const stage = this.stage;
      Hooks.callAll("canvasPan", this, {x: stage.pivot.x, y: stage.pivot.y, scale: stage.scale.x});
    }
  });
  // Record final values
  this.updateBlur();

  // Update the scene tracked position
  canvas.scene._viewPosition = constrained;
}

/*
 * Original constrainView from Foundry.js
 */
function constrainView({x, y, scale}) {
  const d = canvas.dimensions;

  // Constrain the maximum zoom level
  if ( Number.isNumeric(scale) && (scale !== canvas.stage.scale.x) ) {
    const max = CONFIG.Canvas.maxZoom;
    const ratio = Math.max(d.width / window.innerWidth, d.height / window.innerHeight, max);
    scale = compatibilityHandler('clamp', scale, 1 / ratio, max);
  } else {
    scale = canvas.stage.scale.x;
  }
 

  // Constrain the pivot point using the new scale
  if ( Number.isNumeric(x) && x !== canvas.stage.pivot.x ) {
    const padw = 0.4 * (window.innerWidth / scale);
    x = compatibilityHandler('clamp', x, -padw, d.width + padw);
  }
  else x = canvas.stage.pivot.x;
  if ( Number.isNumeric(y) && y !== canvas.stage.pivot.y ) {
    const padh = 0.4 * (window.innerHeight / scale);
    y = compatibilityHandler('clamp', y, -padh, d.height + padh);
  }
  else y = canvas.stage.pivot.y;

  // Return the constrained view dimensions
  return {x, y, scale};
}