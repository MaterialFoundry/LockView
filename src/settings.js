import * as MODULE from "../lockview.js";
import * as MISC from "./misc.js";
import * as VIEWBOX from "./viewbox.js";
import * as SOCKET from "./socket.js";
import * as BLOCKS from "./blocks.js";

/*
 * Initialize all settings
 */
export const registerSettings = function() {
  //Create the Help button
  game.settings.registerMenu(MODULE.moduleName, 'helpMenu',{
    name: "MaterialDeck.Sett.HelpMenu",
    label: "MaterialDeck.Sett.HelpMenu",
    type: helpMenu,
    restricted: true
  });

  //Create the User Configuration button
  game.settings.registerMenu(MODULE.moduleName, 'enableMenu',{
    name: "MaterialDeck.Sett.EnableMenu",
    label: "MaterialDeck.Sett.EnableMenu",
    type: enableMenu,
    restricted: true
  });

  //Screen width of TV
  game.settings.register(MODULE.moduleName, "ScreenWidth", {
    name: "LockView.Sett.ScreenWidth",
    hint: "LockView.Sett.ScreenWidth_Hint",
    scope: "client",
    config: true,
    default: 1,
    type: Number,
    onChange: x => MODULE.updateSettings()
  });

  //Physical Gridsize
  game.settings.register(MODULE.moduleName, "Gridsize", {
    name: "LockView.Sett.Gridsize",
    hint: "LockView.Sett.Gridsize_Hint",
    scope: "client",
    config: true,
    default: 25,
    type: Number,
    onChange: x => MODULE.updateSettings()
  });

  
  game.settings.register(MODULE.moduleName,'viewbox', {
    name: "LockView.Sett.ForceEnable",
    hint: "LockView.Sett.ForceEnable_Hint",
    scope: "world",
    config: false,
    default: false,
    type: Boolean,
  });

  game.settings.register(MODULE.moduleName,'updatePopupV1.3.2', {
    scope: "world",
    config: false,
    default: false,
    type: Boolean,
  });

  /*
  game.settings.register(MODULE.moduleName,'lockOverride', {
    name: "LockView.Sett.LockOverride",
    hint: "LockView.Sett.LockOverride_Hint",
    scope: "world",
    config: true,
    default: "Alt + Z",
    type: window.Azzu.SettingsTypes.KeyBinding,
  });
  */
  game.settings.register(MODULE.moduleName,'editViewbox', {
    name: "Viewbox edit mode",
    hint: "",
    scope: "client",
    config: false,
    default: false,
    type: Boolean
  });

  game.settings.register(MODULE.moduleName, 'userSettings', {
    name: "userSettings",
    scope: "world",
    type: Object,
    default: [],
    config: false
});
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
        enable: MISC.getEnable(userData._id),
        viewbox: VIEWBOX.getViewboxEnable(userData._id)

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
    //if (VIEWBOX.viewboxStorage == undefined || VIEWBOX.viewboxStorage.sceneId == undefined || VIEWBOX.viewboxStorage.sceneId != canvas.scene.data._id) {
      for (let i=0; i< VIEWBOX.viewbox.length; i++)
        if (VIEWBOX.viewbox[i] != undefined)
          VIEWBOX.viewbox[i].hide();

    await SOCKET.sendUpdate( {
      zoom:BLOCKS.lockZoom,
      pan:BLOCKS.lockPan,
      bBox:BLOCKS.boundingBox, 
      aScale:BLOCKS.autoScale, 
      fInit:BLOCKS.forceInit
      } 
    );
    MODULE.forceConstrain();
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