import * as MODULE from "../lockview.js";

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

export function blackSidebar(en){
  if (en) document.getElementById("sidebar").style.backgroundColor = "black";
  else document.getElementById("sidebar").style.backgroundColor = "";
}

export class enableMenu extends FormApplication {
  constructor(data, options) {
      super(data, options);
  }

  /**
   * Default Options for this FormApplication
   */
  static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
          id: "enableMenu",
          title: "Lock View: "+game.i18n.localize("MaterialDeck.Sett.EnableMenu"),
          template: "./modules/LockView/templates/enableMenu.html",
          width: "400px"
      });
  }

  /**
   * Provide data to the template
   */
  getData() {
    const users = game.users._source;
    const settings = game.settings.get(MODULE.moduleName,'userSettings');
    let data = [];

    for (let i=0; i<users.length; i++){
      const userData = users[i];
      let role;
      if (userData.role == 0) role = game.i18n.localize("USER.RoleNone");
      else if (userData.role == 1) role = game.i18n.localize("USER.RolePlayer");
      else if (userData.role == 2) role = game.i18n.localize("USER.RoleTrusted");
      else if (userData.role == 3) role = game.i18n.localize("USER.RoleAssistant");
      else if (userData.role == 4) role = game.i18n.localize("USER.RoleGamemaster");

      const dataNew = {
        index: i,
        name: userData.name,
        role: role,
        color: userData.color,
        id: userData._id,
        enable: getEnable(userData._id),
        viewbox: getViewboxEnable(userData._id)

      }
      data.push(dataNew);
    }
      return {
          data: data
      } 
  }

  /**
   * Update on form submit
   * @param {*} event 
   * @param {*} formData 
   */
  async _updateObject(event, formData) {
    let settings = [];
    for (let i=0; i<formData.id.length; i++){
      let settingsNew = {
        id: formData.id[i],
        enable: formData.enable[i],
        viewbox: formData.viewbox[i]
      }
      settings.push(settingsNew);
    }
    this.updateSettings(settings);
  }

  activateListeners(html) {
      super.activateListeners(html);
      
  }

  async updateSettings(settings){
    await game.settings.set(MODULE.moduleName,'userSettings',settings);
    //if (MODULE.viewboxStorage == undefined || MODULE.viewboxStorage.sceneId == undefined || MODULE.viewboxStorage.sceneId != canvas.scene.data._id) {
      for (let i=0; i< MODULE.viewbox.length; i++)
        if (MODULE.viewbox[i] != undefined)
            MODULE.viewbox[i].hide();

    const payload = {
      "msgType": "lockView_refreshSettings",
      "senderId": game.userId
    };
    game.socket.emit(`module.LockView`, payload);
  }
}

export class helpMenu extends FormApplication {
  constructor(data, options) {
      super(data, options);
  }

  /**
   * Default Options for this FormApplication
   */
  static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
          id: "helpMenu",
          title: "Lock View: "+game.i18n.localize("MaterialDeck.Sett.HelpMenu"),
          template: "./modules/LockView/templates/helpMenu.html",
          width: "500px"
      });
  }

  /**
   * Provide data to the template
   */
  getData() {
    
      return {
         
      } 
  }

  /**
   * Update on form submit
   * @param {*} event 
   * @param {*} formData 
   */
  async _updateObject(event, formData) {

  }

  activateListeners(html) {
      super.activateListeners(html);
      
  }
}

export function getEnable(userId){
  const settings = game.settings.get("LockView","userSettings");
  for (let i=0; i<settings.length; i++)
    if (settings[i].id == userId && settings[i].enable) return true;
  return false;
}

export function getViewboxEnable(userId){
  const settings = game.settings.get("LockView","userSettings");
  for (let i=0; i<settings.length; i++)
  if (settings[i].id == userId && settings[i].viewbox) return true;
  return false;
}