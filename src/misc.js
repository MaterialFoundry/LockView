export function registerLayer() {
  const layers = mergeObject(Canvas.layers, {
    lockview: LockViewLayer
  });
  Object.defineProperty(Canvas, 'layers', {
    get: function () {
      return layers
    }
  });
}

export class LockViewLayer extends PlaceablesLayer {
  constructor() {
    super();
  }

  static get layerOptions() {
    return mergeObject(super.layerOptions, {
      canDragCreate: false,
      objectClass: Note,
      sheetClass: NoteConfig
    });
  }

  activate() {
    CanvasLayer.prototype.activate.apply(this);
    //canvas.activeLayer = this;
    
    return this
  }

  deactivate() {
    CanvasLayer.prototype.deactivate.apply(this);
    //super.deactivate();
    return this
  }

  async draw() {
    super.draw();
  }
}
  
export class Viewbox extends CanvasLayer {
    constructor() {
      super();
      this.init();
    }
  
    init() {
      this.container = new PIXI.Container();
      this.addChild(this.container);
    }
  
    async draw() {
      super.draw();
    }
  
    updateViewbox(data) {
      this.container.removeChildren();
      var rect = new PIXI.Graphics();
      //rect.cacheAsBitmap = true;
      rect.lineStyle(2, data.c, 1);
      rect.drawRect(0,0,data.w,data.h);
      this.container.addChild(rect);
      let x = data.x - Math.floor(data.w / 2);
      let y = data.y - Math.floor(data.h / 2);
      this.container.setTransform(x, y);
      this.container.visible = true;
    }
    
    hide() {
      this.container.visible = false;
    }
  
    show() {
      this.container.visible = true;
    }
  }