import { moduleName, applySettings, forceConstrain } from "../lockview.js";
import { getEnable } from "./misc.js";
import { getViewboxEnable } from "./viewbox.js";
import * as VIEWBOX from "./viewbox.js";
import { sendUpdate } from "./socket.js";
import { lockPan, lockZoom, boundingBox, autoScale, forceInit } from "./blocks.js";

/*
 * Initialize all settings
 */
export const registerSettings = function() {
  //Create the Help button
  game.settings.registerMenu(moduleName, 'helpMenu',{
    name: "LockView.Sett.HelpMenu",
    label: "LockView.Sett.HelpMenu",
    type: helpMenu,
    restricted: true
  });

  //Create the User Configuration button
  game.settings.registerMenu(moduleName, 'enableMenu',{
    name: "LockView.Sett.EnableMenu",
    label: "LockView.Sett.EnableMenu",
    type: enableMenu,
    restricted: true
  });

  //Screen width of TV
  game.settings.register(moduleName, "ScreenWidth", {
    name: "LockView.Sett.ScreenWidth",
    hint: "LockView.Sett.ScreenWidth_Hint",
    scope: "client",
    config: true,
    default: 930,
    type: Number,
    onChange: x => applySettings()
  });

  //Physical Gridsize
  game.settings.register(moduleName, "Gridsize", {
    name: "LockView.Sett.Gridsize",
    hint: "LockView.Sett.Gridsize_Hint",
    scope: "client",
    config: true,
    default: 25,
    type: Number,
    onChange: x => applySettings()
  });

  
  game.settings.register(moduleName,'viewbox', {
    name: "LockView.Sett.ForceEnable",
    hint: "LockView.Sett.ForceEnable_Hint",
    scope: "world",
    config: false,
    default: false,
    type: Boolean,
  });

  /*
  game.settings.register(moduleName,'updatePopupV1.4.3', {
    scope: "world",
    config: false,
    default: false,
    type: Boolean,
  });
  */

  game.settings.register(moduleName,'editViewbox', {
    name: "Viewbox edit mode",
    hint: "",
    scope: "client",
    config: false,
    default: false,
    type: Boolean
  });

  game.settings.register(moduleName, 'userSettings', {
    name: "userSettings",
    scope: "world",
    type: Object,
    default: [],
    config: false
  });

  game.settings.register(moduleName, 'userSettingsOverrides', {
    name: "userSettingsOverrides",
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
          title: "Lock View: "+game.i18n.localize("LockView.Sett.EnableMenu"),
          template: "./modules/LockView/templates/enableMenu.html",
          width: "400px"
      });
  }

  /**
   * Provide data to the template
   */
  getData() {
    const users = game.users._source;
    //const settings = game.settings.get(moduleName,'userSettings');
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

    let overrideSettings = game.settings.get(moduleName ,'userSettingsOverrides');
    if (overrideSettings[0] == undefined) {
      for (let i=0; i<5; i++) {
        const settingsNew = {
          role: i,
          enable: false,
          viewbox: false
        }
        overrideSettings.push(settingsNew);
      }
    }

    const overrides = [
      {
        role: game.i18n.localize("USER.RoleNone"),
        roleNr: 0,
        enable: overrideSettings[0].enable,
        viewbox: overrideSettings[0].viewbox
      },{
        role: game.i18n.localize("USER.RolePlayer"),
        roleNr: 1,
        enable: overrideSettings[1].enable,
        viewbox: overrideSettings[1].viewbox
      },{
        role: game.i18n.localize("USER.RoleTrusted"),
        roleNr: 2,
        enable: overrideSettings[2].enable,
        viewbox: overrideSettings[2].viewbox
      },{
        role: game.i18n.localize("USER.RoleAssistant"),
        roleNr: 3,
        enable: overrideSettings[3].enable,
        viewbox: overrideSettings[3].viewbox
      },{
        role: game.i18n.localize("USER.RoleGamemaster"),
        roleNr: 4,
        enable: overrideSettings[4].enable,
        viewbox: overrideSettings[4].viewbox
      }
    ]

      return {
          data: data,
          overrides
      } 
  }

  /**
   * Update on form submit
   * @param {*} event 
   * @param {*} formData 
   */
  async _updateObject(event, formData) {
    let settings = [];
    let idArray = formData.id;
    if (Array.isArray(idArray) == false) {
      idArray = [];
      idArray[0] = formData.id;
    }
    for (let id of idArray) {
      const settingsNew = {
        id,
        enable: formData?.[`enable-${id}`],
        viewbox: formData?.[`viewbox-${id}`]
      }
      settings.push(settingsNew);
    }
    this.updateSettings(settings);

    let overrides = [];
    for (let i=0; i<5; i++) {
      const settingsNew = {
        role: i,
        enable: formData?.[`enableOverride-${i}`],
        viewbox: formData?.[`viewboxOverride-${i}`]
      }
      overrides.push(settingsNew);
    }
    game.settings.set(moduleName ,'userSettingsOverrides',overrides);
  }

  activateListeners(html) {
      super.activateListeners(html);
      
  }

  async updateSettings(settings){
    await game.settings.set(moduleName,'userSettings',settings);
    //if (VIEWBOX.viewboxStorage == undefined || VIEWBOX.viewboxStorage.sceneId == undefined || VIEWBOX.viewboxStorage.sceneId != canvas.scene.data._id) {
      for (let i=0; i< VIEWBOX.viewbox.length; i++)
        if (VIEWBOX.viewbox[i] != undefined)
          VIEWBOX.viewbox[i].hide();

    await sendUpdate( {
      zoom:lockZoom,
      pan:lockPan,
      bBox:boundingBox, 
      aScale:autoScale, 
      fInit:forceInit
      } 
    );
    forceConstrain();
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
          title: "Lock View: "+game.i18n.localize("LockView.Sett.HelpMenu"),
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