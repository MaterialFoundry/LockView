import * as MODULE from "../lockview.js";

export const registerSettings = function() {
    //initialize all settings
  game.settings.register(MODULE.moduleName,'Enable', {
    name: "LockView.Sett.Enable",
    hint: "LockView.Sett.Enable_Hint",
    scope: "client",
    config: true,
    default: false,
    type: Boolean,
    onChange: x => window.location.reload()
  });
  game.settings.register(MODULE.moduleName, "ScreenWidth", {
    name: "LockView.Sett.ScreenWidth",
    hint: "LockView.Sett.ScreenWidth_Hint",
    scope: "client",
    config: true,
    default: 1,
    type: Number,
    onChange: x => updateSettings()
  });
  game.settings.register(MODULE.moduleName, "Gridsize", {
    name: "LockView.Sett.Gridsize",
    hint: "LockView.Sett.Gridsize_Hint",
    scope: "client",
    config: true,
    default: 25,
    type: Number,
    onChange: x => updateSettings()
  });
  game.settings.register(MODULE.moduleName,'ForceEnable', {
    name: "Force Enable",
    hint: "Enables the module on all non-GM clients",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
    onChange: x => window.location.reload()
});
  game.settings.register(MODULE.moduleName,'viewbox', {
    name: "LockView.Sett.ForceEnable",
    hint: "LockView.Sett.ForceEnable_Hint",
    scope: "world",
    config: false,
    default: false,
    type: Boolean,
  });
  game.settings.register(MODULE.moduleName,'lockOverride', {
    name: "LockView.Sett.LockOverride",
    hint: "LockView.Sett.LockOverride_Hint",
    scope: "world",
    config: true,
    default: "Alt + Z",
    type: window.Azzu.SettingsTypes.KeyBinding,
  });
  game.settings.register(MODULE.moduleName,'editViewbox', {
    name: "Viewbox edit mode",
    hint: "",
    scope: "client",
    config: false,
    default: false,
    type: Boolean
  });
}