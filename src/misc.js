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

    remove() {
      this.container.removeChildren();
    }
}

export function drawingConfigApp(app, html, data){
  let boundingBox_mode = 0;
  if (app.object.data.flags["LockView"]){
    if (app.object.data.flags["LockView"].boundingBox_mode){
      boundingBox_mode = app.object.getFlag('LockView', 'boundingBox_mode');
    } 
    else app.object.setFlag('LockView', 'boundingBox_mode', 0);
  }
  
  const options = [
    game.i18n.localize("LockView.boundingBox.Mode0"),
    game.i18n.localize("LockView.boundingBox.Mode1"),
    game.i18n.localize("LockView.boundingBox.Mode2")
  ];
  let optionsSelected = [
    "",
    "",
    ""
  ];
  optionsSelected[boundingBox_mode] = "selected"

  const tab = `<a class="item" data-tab="lockview">
  <i class="fas fa-lock"></i> Lock View
  </a>`;
  const contents = `
    <div class="tab" data-tab="lockview">
      <p class="notes">${game.i18n.localize("LockView.boundingBox.Note")}</p>
      <div class="form-group">
        <label>${game.i18n.localize("LockView.boundingBox.Label")}</label>
        <select name="LV_boundingBox" id="boundingBox" value=1>
          <option value="0" ${optionsSelected[0]}>${options[0]}</option>
          <option value="1" ${optionsSelected[1]}>${options[1]}</option>
          <option value="2" ${optionsSelected[2]}>${options[2]}</option>
        </select>
      </div>
    </div>
    `
    html.find(".tabs .item").last().after(tab);
    html.find(".tab").last().after(contents);
    
}
export function closeDrawingConfigApp(app,html){
  const boundingBox = html.find("select[name='LV_boundingBox']")[0].value;
  app.object.setFlag('LockView', 'boundingBox_mode', boundingBox);
}

export var controlledTokens = [];

export function getControlledTokens(){
  if (game.user.isGM) return;
  //Get a list of all tokens that are controlled by the user
  controlledTokens = [];
  let tokens = canvas.tokens.children[0].children;
  for (let i=0; i<tokens.length; i++){
    //Get the permission of each token, and store owned tokens in array
    const permission = tokens[i].actor.data.permission;
    let permissionString = JSON.stringify(permission);
    permissionString = permissionString.replace('{','');
    permissionString = permissionString.replace('}','');
    permissionString = permissionString.replaceAll('"','');
    let permissionArray = permissionString.split(',');
    let defaultPermission;
    let userPermission;
    for (let j=0; j<permissionArray.length; j++){
      const array = permissionArray[j].split(':');
      if (array[0] == 'default') defaultPermission = array[1];
      else if (array[0] == game.userId) userPermission = array[1];
      if (userPermission == undefined) userPermission = defaultPermission;
    }
    if (userPermission > 2) 
      controlledTokens.push(tokens[i]);
  }
}