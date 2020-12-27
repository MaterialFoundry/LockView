import * as MODULE from "../lockview.js";
import { enableMenu, helpMenu } from "./misc.js";

export const registerSettings = function() {
    //initialize all settings
  game.settings.registerMenu(MODULE.moduleName, 'helpMenu',{
    name: "MaterialDeck.Sett.HelpMenu",
    label: "MaterialDeck.Sett.HelpMenu",
    type: helpMenu,
    restricted: true
  });

  game.settings.registerMenu(MODULE.moduleName, 'enableMenu',{
    name: "MaterialDeck.Sett.EnableMenu",
    label: "MaterialDeck.Sett.EnableMenu",
    type: enableMenu,
    restricted: true
  });
  game.settings.register(MODULE.moduleName, "ScreenWidth", {
    name: "LockView.Sett.ScreenWidth",
    hint: "LockView.Sett.ScreenWidth_Hint",
    scope: "client",
    config: true,
    default: 1,
    type: Number,
    onChange: x => MODULE.updateSettings()
  });
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