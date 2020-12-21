import {getControlledTokens,controlledTokens} from "./misc.js";

  /**
   * Modified _constrainView from foundry.js line 10117
   * Allows higher scaling resolution
   */
  export function constrainView_Override({x, y, scale}) {
    const d = canvas.dimensions;
    if (Number.isNumeric(scale) == false) scale = canvas.stage.scale.x;
    let boxDefined = false;
    let bound = {Xmin:0,Xmax:0,Ymin:0,Ymax:0};
    let rect = {Xmin:0,Xmax:0,Ymin:0,Ymax:0};
    let scaleChange = false;
    let drawings = canvas.scene.data.drawings;
    let scaleMin;

    if (canvas.scene.getFlag('LockView', 'boundingBox')){
      getControlledTokens();
      let tokensInBox = 0;
      let force = false;
      //Check all drawings in the scene
      for (let i=0; i<drawings.length; i++){
        //If drawing isn't a rectangle, continue
        if (drawings[i].type != "r" || force) continue;

        //Check boundingbox mode of the rectangle
        if (drawings[i].flags.LockView == undefined) continue;
        if (drawings[i].flags.LockView.boundingBox_mode == 0) continue;
        const mode = drawings[i].flags.LockView.boundingBox_mode;
       
        const lineWidth = drawings[i].strokeWidth;
        //Store rectangle location
        let rectTemp = {
          Xmin : drawings[i].x+lineWidth,
          Xmax : drawings[i].x+drawings[i].width-2*lineWidth,
          Ymin : drawings[i].y+lineWidth,
          Ymax : drawings[i].y+drawings[i].height-2*lineWidth
        }

        if (mode == 2) {
          rect.Xmin = rectTemp.Xmin;
          rect.Xmax = rectTemp.Xmax;
          rect.Ymin = rectTemp.Ymin;
          rect.Ymax = rectTemp.Ymax;
          boxDefined = true;
          force = true;
          break;
        }
        //Check if once of the tokens that are controlled by the user are within the box
        let activeToken = false;
        for (let j=0; j<controlledTokens.length; j++){
          let center = controlledTokens[j].getCenter(controlledTokens[j].x,controlledTokens[j].y);
          const x = center.x;
          const y = center.y;
          if (x>=rectTemp.Xmin && x<=rectTemp.Xmax && y>=rectTemp.Ymin && y<=rectTemp.Ymax){
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

      if ((boxDefined == false || tokensInBox != controlledTokens.length) && force == false) {
        rect.Xmin = canvas.dimensions.sceneRect.x;
        rect.Xmax = canvas.dimensions.sceneRect.x+canvas.dimensions.sceneRect.width;
        rect.Ymin = canvas.dimensions.sceneRect.y;
        rect.Ymax = canvas.dimensions.sceneRect.y+canvas.dimensions.sceneRect.height;
      }

      let horizontal;
      if ((window.innerWidth / (rect.Xmax-rect.Xmin)) > (window.innerHeight / (rect.Ymax-rect.Ymin))) horizontal = true;
      else horizontal = false;

      if (horizontal) scaleMin = window.innerWidth/(rect.Xmax-rect.Xmin);
      else scaleMin = window.innerHeight/(rect.Ymax-rect.Ymin);
    }

    if ( Number.isNumeric(scale) && (scale !== canvas.stage.scale.x) ) {
      scaleChange = true;
      const max = CONFIG.Canvas.maxZoom;
      const ratio = Math.max(d.width / window.innerWidth, d.height / window.innerHeight, max);
      let min = 1 / ratio;
      if (canvas.scene.getFlag('LockView', 'boundingBox')) min = scaleMin;
      
      scale = Math.round(Math.clamped(scale, min, max) * 2000) / 2000;

    } else {
      scale = canvas.stage.scale.x;
    }
    /*
    if (boxDefined == false) {
      bound.Xmin = canvas.dimensions.sceneRect.x+window.innerWidth/(2*scale);
      bound.Xmax = canvas.dimensions.sceneRect.x+canvas.dimensions.sceneRect.width-window.innerWidth/(2*scale);
      bound.Ymin = canvas.dimensions.sceneRect.y+window.innerHeight/(2*scale);
      bound.Ymax = canvas.dimensions.sceneRect.y+canvas.dimensions.sceneRect.height-window.innerHeight/(2*scale);
    }
    else {*/
      bound.Xmin = rect.Xmin+window.innerWidth/(2*scale);
      bound.Xmax = rect.Xmax-window.innerWidth/(2*scale);
      bound.Ymin = rect.Ymin+window.innerHeight/(2*scale);
      bound.Ymax = rect.Ymax-window.innerHeight/(2*scale);
    //}
    if ( Number.isNumeric(x) && x !== canvas.stage.pivot.x || scaleChange) {
      if (Number.isNumeric(x) == false)
        x = canvas.stage.pivot.x;
      const padw = 0.4 * (window.innerWidth / scale);
      if (canvas.scene.getFlag('LockView', 'boundingBox')){
        x = Math.clamped(x, bound.Xmin, bound.Xmax);
      }
      else x = Math.clamped(x, -padw, d.width + padw);
    }
    else x = canvas.stage.pivot.x;
    if ( Number.isNumeric(y) && x !== canvas.stage.pivot.y || scaleChange) {
      if (Number.isNumeric(y) == false)
        y = canvas.stage.pivot.y;
      const padh = 0.4 * (window.innerHeight / scale);
      if (canvas.scene.getFlag('LockView', 'boundingBox')){
        y = Math.clamped(y, bound.Ymin, bound.Ymax);
      }
      else y = Math.clamped(y, -padh, d.height + padh);
    }
    else y = canvas.stage.pivot.y;
  
    return {x, y, scale};
  }

  /**
 * Modified pan from foundry.js line 10034
 * redirects _constrainView to _constrainView_Override for higher scaling resolution
 */
  export function pan_OverrideHigherRes({x=null, y=null, scale=null}={}) {
    const constrained = constrainView_Override({x, y, scale});
    this.stage.pivot.set(constrained.x, constrained.y);
    this.stage.scale.set(constrained.scale, constrained.scale);
    this.sight.blurDistance = 20 / (CONFIG.Canvas.maxZoom - Math.round(constrained.scale) + 1);
    canvas.scene._viewPosition = constrained;
    Hooks.callAll("canvasPan", this, constrained);
    this.hud.align();
  }

/**
 * Empty function used to override Canvas.prototype._onMouseWheel and prototype._onDragCanvasPan to prevent zooming and/or panning
 */
export function _Override(event) {}

/**
 * Modified pan from foundry.js line 10034
 * Removes the x and y arguents from _constrainView to prevent panning
 */
export function pan_Override({x=null, y=null, scale=null}={}) {
    let constrained;
    if (canvas.scene.getFlag('LockView', 'boundingBox') && canvas.scene.getFlag('LockView', 'lockPan')) constrained = constrainView_Override({scale});
    else if (canvas.scene.getFlag('LockView', 'boundingBox') && canvas.scene.getFlag('LockView', 'lockPan') == false) constrained = constrainView_Override({x, y, scale});
    else constrained = this._constrainView({scale});
    this.stage.pivot.set(constrained.x, constrained.y);
    this.stage.scale.set(constrained.scale, constrained.scale);
    this.sight.blurDistance = 20 / (CONFIG.Canvas.maxZoom - Math.round(constrained.scale) + 1);
    canvas.scene._viewPosition = constrained;
    Hooks.callAll("canvasPan", this, constrained);
    this.hud.align();
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
  await CanvasAnimation.animateLinear(attributes, {
    name: "canvas.animatePan",
    duration: duration,
    ontick: (dt, attributes) => {
      this.hud.align();
      const stage = this.stage;
      Hooks.callAll("canvasPan", this, {x: stage.pivot.x, y: stage.pivot.y, scale: stage.scale.x});
    }
  });

  // Decrease blur as we zoom
  this._updateBlur(constrained.scale);

  // Update the scene tracked position
  canvas.scene._viewPosition = constrained;
}