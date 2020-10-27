  /**
   * Modified _constrainView from foundry.js line 10117
   * Allows higher scaling resolution
   */
  export function _constrainView_Override({x, y, scale}) {
    const d = canvas.dimensions;
    if ( Number.isNumeric(scale) && (scale !== canvas.stage.scale.x) ) {
      const max = CONFIG.Canvas.maxZoom;
      const ratio = Math.max(d.width / window.innerWidth, d.height / window.innerHeight, max);
      scale = Math.round(Math.clamped(scale, 1 / ratio, max) * 2000) / 2000;
    } else {
      scale = canvas.stage.scale.x;
    }
    if ( Number.isNumeric(x) && x !== canvas.stage.pivot.x ) {
      const padw = 0.4 * (window.innerWidth / scale);
      x = Math.clamped(x, -padw, d.width + padw);
    }
    else x = canvas.stage.pivot.x;
    if ( Number.isNumeric(y) && x !== canvas.stage.pivot.y ) {
      const padh = 0.4 * (window.innerHeight / scale);
      y = Math.clamped(y, -padh, d.height + padh);
    }
    else y = canvas.stage.pivot.y;
    return {x, y, scale};
  }

  /**
 * Modified pan from foundry.js line 10034
 * redirects _constrainView to _constrainView_Override for higher scaling resolution
 */
  export function pan_OverrideHigherRes({x=null, y=null, scale=null}={}) {
    const constrained = _constrainView_Override({x, y, scale});
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
    const constrained = this._constrainView({scale});
    this.stage.pivot.set(constrained.x, constrained.y);
    this.stage.scale.set(constrained.scale, constrained.scale);
    this.sight.blurDistance = 20 / (CONFIG.Canvas.maxZoom - Math.round(constrained.scale) + 1);
    canvas.scene._viewPosition = constrained;
    Hooks.callAll("canvasPan", this, constrained);
    this.hud.align();
}