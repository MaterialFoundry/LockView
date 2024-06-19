import { moduleName, applySettings, forceConstrain, onKeyPress } from "../lockview.js";
import { getEnable } from "./misc.js";
import { getViewboxEnable } from "./viewbox.js";
import * as VIEWBOX from "./viewbox.js";
import { sendUpdate } from "./socket.js";
import { lockPan, lockZoom, boundingBox, autoScale, rotation, forceInit } from "./blocks.js";

const defaultSceneConfig = {
  lockPan: false,
  lockPanInit: false,
  lockZoom: false,
  lockZoomInit: false,
  boundingBox: false,
  boundingBoxInit: false,
  autoScale: 0,
  rotation: 0,
  sidebar: "noChange",
  blackenSidebar: false,
  excludeSidebar: false,
  hideUI: false,
  forceInit: false,
  hideUIelements: {
    controls: true,
    hotbar: true,
    logo: true,
    navigation: true,
    players: true,
    sidebar: false
  }
};

export let dataTypes = [
  {name: 'lockPan', var: 'lockPanInit', type: 'checkbox', value: false, label: "LockView.Scene.LockPan"},
  {name: 'lockZoom', var: 'lockZoomInit', type: 'checkbox', value: false, label: "LockView.Scene.LockZoom"},
  {name: 'boundingBox', var: 'boundingBoxInit', type: 'checkbox', value: false, label: "LockView.Scene.boundingBox"},
  {name: 'autoScale', type: 'select', value: 0, label: "LockView.Scene.Autoscale.Label"},
  {name: 'rotation', type: 'select', value: 0, label: "LockView.Scene.Rotation.Label"},
  {name: 'excludeSidebar', type: 'checkbox', value: false, label: "LockView.Scene.ExcludeSidebar"},
  {name: 'blackenSidebar', type: 'checkbox', value: false, label: "LockView.Scene.BlackenSidebar"},
  {name: 'sidebar', type: 'select', value: 'noChange', label: "LockView.Scene.SidebarShort"},
  {name: 'hideUI', type: 'checkbox', value: false, label: "LockView.Scene.HideUIShort"},
  {name: 'logo', type: 'hideUIcheckbox', value: true, label: "LockView.Scene.HideUIDialog.Logo"},
  {name: 'navigation', type: 'hideUIcheckbox', value: true, label: "LockView.Scene.HideUIDialog.Navigation"},
  {name: 'controls', type: 'hideUIcheckbox', value: true, label: "LockView.Scene.HideUIDialog.Controls"},
  {name: 'players', type: 'hideUIcheckbox', value: true, label: "LockView.Scene.HideUIDialog.Players"},
  {name: 'hotbar', type: 'hideUIcheckbox', value: true, label: "LockView.Scene.HideUIDialog.Hotbar"},
  {name: 'sidebar', type: 'hideUIcheckbox', value: true, label: "LockView.Scene.HideUIDialog.Sidebar"},
  {name: 'forceInit', type: 'checkbox', value: false, label: "LockView.Scene.ForceInit"}
]

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

  //Create the Scene Configurator button
  game.settings.registerMenu(moduleName, 'sceneConfiguratorMenu',{
    name: "LockView.Sett.SceneConfigurator.Title",
    label: "LockView.Sett.SceneConfigurator.Title",
    type: SceneConfigurator,
    restricted: true
  });

  //Hide the control button
  game.settings.register(moduleName, "hideControlButton", {
    name: "LockView.Sett.HideControlBtn",
    hint: "LockView.Sett.HideControlBtn_Hint",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
    onChange: x => window.location.reload()
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

  game.settings.register(moduleName, 'defaultUserSettings', {
    name: "defaultUserSettings",
    scope: "world",
    type: Object,
    default: {
      enable: true,
      viewbox: true,
      control: false
    },
    config: false
  })

  game.settings.register(moduleName, 'userSettingsOverrides', {
    name: "userSettingsOverrides",
    scope: "world",
    type: Object,
    default: [],
    config: false
  });

  game.settings.register(moduleName, 'defaultSceneConfig', {
    name: "defaultSceneConfig",
    scope: "world",
    type: Object,
    default: defaultSceneConfig,
    config: false
  })

  const {SHIFT, CONTROL, ALT} = KeyboardManager.MODIFIER_KEYS;
  game.keybindings.register("LockView", "(Un)hide UI Elements", {
    name: "LockView.Keybindings.HideUi",
    editable: [
      {key: "KeyU", modifiers: [ALT]}
    ],
    onDown: onKeyPress,
    precedence: CONST.KEYBINDING_PRECEDENCE.DEFERRED
  });
}

export async function configureSettings() {
  if (!game.user.isGM) return;
  //Configure settings for new users
  let userSettings = game.settings.get(moduleName, 'userSettings');
  const defaultUserSettings = game.settings.get(moduleName, 'defaultUserSettings');
  for (let user of game.users) {
    if (user.role == 4) continue;
    let settings = userSettings.find(u => u.id == user.id);
    if (settings == undefined) {
      userSettings.push({
        id: user.id,
        enable: defaultUserSettings.enable,
        viewbox: defaultUserSettings.viewbox,
        control: defaultUserSettings.control
      })
    }
  }
  game.settings.set(moduleName, 'userSettings', userSettings);

  //Reconfigure some scene settings
  let scenes = game.scenes;
  for (let scene of scenes) {
    let flags = scene.flags.LockView;
    const def = game.settings.get(moduleName, 'defaultSceneConfig')
    if (flags == undefined) flags = def;
    else flags = fillMissingSceneSettings(flags, false);
    if ('collapseSidebar' in flags) {
      if (flags.collapseSidebar)  flags.sidebar = 'collapse';
      else flags.sidebar = 'noChange';
      scene.unsetFlag('LockView','collapseSidebar');
    }
    for (let flag of Object.entries(flags)) {
      await scene.setFlag('LockView',flag[0],flag[1]);
    }
  }
}

export function fillMissingSceneSettings(flags, returnAll = true) {
  if (flags == undefined) flags = {};
  const def = game.settings.get(moduleName, 'defaultSceneConfig')
  let missing = {};
  for (let flag of Object.entries(def)) {
    if (!(flag[0] in flags)) {
      if (returnAll) flags[flag[0]] = flag[1]
      else missing[flag[0]] = flag[1];
    }
  }

  if (returnAll) return flags;
  else return missing;
}

export class SceneConfigurator extends FormApplication {
  constructor(data, options) {
    super(data, options);
    this.copyData = {};
  }

  /**
   * Default Options for this FormApplication
   */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
        id: "lockView_sceneConfigurator",
        title: "Lock View: "+game.i18n.localize("LockView.Sett.SceneConfigurator.Title"),
        template: "./modules/LockView/templates/sceneConfigurator.html",
        maxWidth: "auto"
    });
  }

  /**
   * Provide data to the template
   */
  getData() {
    let sceneData = [];

    for (let d of dataTypes) d.label = game.i18n.localize(d.label)

    for (let i=0; i<=game.scenes.size; i++) {
      let sceneName;
      let sceneId;
      let sceneFlags;
      
      let autoScaleOptions = [
        {label: game.i18n.localize("LockView.Scene.Autoscale.Off"), value:'0', selected:''},
        {label: game.i18n.localize("LockView.Scene.Autoscale.Hor"), value:'1', selected:''},
        {label: game.i18n.localize("LockView.Scene.Autoscale.Vert"), value:'2', selected:''},
        {label: game.i18n.localize("LockView.Scene.Autoscale.Auto"), value:'3', selected:''},
        {label: game.i18n.localize("LockView.Scene.Autoscale.AutoOutside"), value:'4', selected:''},
        {label: game.i18n.localize("LockView.Scene.Autoscale.Grid"), value:'5', selected:''}, 
      ];

      let sidebarOptions = [
        {label: game.i18n.localize("LockView.Scene.Sidebar_NoChange"), value:'noChange', selected:''},
        {label: game.i18n.localize("LockView.Scene.Sidebar_Collapse"), value:'collapse', selected:''},
        {label: game.i18n.localize("LockView.Scene.Sidebar_Expand"), value:'expand', selected:''}
      ];

      let rotationOptions = [
        {label: game.i18n.localize("LockView.Scene.Rotation.Landscape_Short"), value:'0', selected:''},
        {label: game.i18n.localize("LockView.Scene.Rotation.Portrait_Short"), value:'90', selected:''},
        {label: game.i18n.localize("LockView.Scene.Rotation.FlippedLandscape_Short"), value:'180', selected:''},
        {label: game.i18n.localize("LockView.Scene.Rotation.FlippedPortrait_Short"), value:'270', selected:''}
      ];
      
      if (i == game.scenes.size) {
        sceneName = game.i18n.localize("LockView.Sett.SceneConfigurator.Default");
        sceneId = 'default';
        sceneFlags = game.settings.get(moduleName,"defaultSceneConfig");
      }
      else {
        sceneName = game.scenes.contents[i].name;
        sceneId = game.scenes.contents[i].id;
        sceneFlags = game.scenes.contents[i].flags.LockView;
      }

      sceneFlags = fillMissingSceneSettings(sceneFlags);

      for (let option of autoScaleOptions) {
        if (option.value == sceneFlags.autoScale) option.selected = 'selected';
      }

      for (let option of sidebarOptions) {
        if (option.value == sceneFlags.sidebar) option.selected = 'selected';
      }

      for (let option of rotationOptions) {
        if (option.value == sceneFlags.rotation) option.selected = 'selected';
      }

      let settings = [];
      for (let d of dataTypes) {
        if (d.type == 'hideUIcheckbox') settings.push({name:d.name, value:sceneFlags.hideUIelements[d.name], type:d.type})
        else if (d.var) settings.push({name:d.var, value:sceneFlags[d.var], type:d.type})
        else settings.push({name:d.name, value:sceneFlags[d.name], type:d.type})
      }

      let data = {
        name: sceneName,
        id: sceneId,
        settings,
        autoScaleOptions: autoScaleOptions,
        sidebarOptions: sidebarOptions,
        rotationOptions: rotationOptions,
        default: sceneId == 'default'
      }
      if (data.settings.hideUIelements == undefined) data.settings.hideUIelements = defaultSceneConfig.hideUIelements
      sceneData.push(data);
    }

    return {
      sceneData,
      dataTypes
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

    for (let d of dataTypes) {

      if (d.type == 'checkbox') {
        if (d.var == undefined) d.var = d.name;
        html.find(`input[name='${d.var}']`).on('change', event => {
          const id = event.currentTarget.id.replace(`${d.var}-`,'')
          if (id == 'default') {
            let conf = game.settings.get(moduleName,"defaultSceneConfig");
            conf[d.var] = event.currentTarget.checked;
            game.settings.set(moduleName,"defaultSceneConfig",conf);
          }
          else {
            game.scenes.get(id).setFlag('LockView',d.var,event.currentTarget.checked);
          }
        });
      }
      else if (d.type == 'hideUIcheckbox') {
        html.find(`input[name='${d.name}']`).on('change', event => {
          const id = event.currentTarget.id.replace(`${d.name}-`,'')
          if (id == 'default') {
            let conf = game.settings.get(moduleName,"defaultSceneConfig");
            conf.hideUIelements[d.name] = event.currentTarget.checked;
            game.settings.set(moduleName,"defaultSceneConfig",conf);
          }
          else {
            let elements = game.scenes.get(id).flags.LockView.hideUIelements;
            elements[d.name] = event.currentTarget.checked;
            game.scenes.get(id).setFlag('LockView','hideUIelements',elements);
          }
        });
      }
      else if (d.type == 'select') {
        html.find(`select[name='${d.name}']`).on('change', event => {
          const id = event.currentTarget.id.replace(`${d.name}-`,'')
          if (id == 'default') {
            let conf = game.settings.get(moduleName,"defaultSceneConfig");
            conf[d.name] = event.currentTarget.value;
            game.settings.set(moduleName,"defaultSceneConfig",conf);
          }
          else {
            game.scenes.get(id).setFlag('LockView',d.name,event.currentTarget.value);
          }
        })
      }
    }

    html.find("button[name='copy']").on('click', event => {
      const id = event.currentTarget.id.replace('copy-','')
      if (id == 'default') {
        this.copyData = {
          id,
          name: 'default',
          sceneConfig: game.settings.get(moduleName,"defaultSceneConfig")
        }
      }
      else {
        this.copyData = {
          id,
          name: game.scenes.get(id).name,
          sceneConfig: game.scenes.get(id).flags.LockView
        }
      }
      this.refreshScene(id, true);
    })

    html.find("button[name='paste']").on('click', async event => {
      const id = event.currentTarget.id.replace('paste-','')
      if (this.copyData.id == undefined) {
        ui.notifications.warn("No Lock View configuration copied");
        return;
      }
      await game.scenes.get(id).update({
        flags: {
          LockView: this.copyData.sceneConfig
        }
      });
      this.refreshScene(id);
    })

    html.find("button[name='reset'").on('click', async event => {
      const id = event.currentTarget.id.replace('reset-','')
      if (id == 'default') {
        await game.settings.set(moduleName,"defaultSceneConfig",defaultSceneConfig)
      }
      else {
        await game.scenes.get(id).update({
          flags: {
            LockView: game.settings.get(moduleName,"defaultSceneConfig")
          }
        });
      }
      
      this.refreshScene(id);
    })
      
  }

  refreshScene(id, copy=false) {
    const config = id == 'default' ? game.settings.get(moduleName,"defaultSceneConfig") : game.scenes.get(id).flags.LockView;
    for (let d of dataTypes) {
      if (d.var == undefined) d.var = d.name;
      if (d.type == 'checkbox') document.getElementById(`${d.var}-${id}`).checked = config[d.var];
      else if (d.type == 'hideUIcheckbox') document.getElementById(`${d.var}-${id}`).checked = config.hideUIelements[d.var];
      else if (d.type == 'select') document.getElementById(`${d.var}-${id}`).value = config[d.var];
    }
    if (copy && this.copyData.name != undefined) {
      for (let s of document.getElementsByName('nameCopy')) {
        if (s.id == `nameCopy-${id}`) s.innerHTML = " (copied)";
        else s.innerHTML = "";
      }
    }
  }

}

export class enableMenu extends FormApplication {
  constructor(data, options) {
      super(data, options);
  }

  /**
   * Default Options for this FormApplication
   */
  static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
          id: "enableMenu",
          title: "Lock View: "+game.i18n.localize("LockView.Sett.EnableMenu"),
          template: "./modules/LockView/templates/enableMenu.html"
      });
  }

  /**
   * Provide data to the template
   */
  getData() {
    const users = game.users._source;
    const settings = game.settings.get(moduleName,'userSettings');
    let data = [];

    for (let i=0; i<users.length; i++){
      const userData = users[i];
      let role;
      if (userData.role == 0) role = game.i18n.localize("USER.RoleNone");
      else if (userData.role == 1) role = game.i18n.localize("USER.RolePlayer");
      else if (userData.role == 2) role = game.i18n.localize("USER.RoleTrusted");
      else if (userData.role == 3) role = game.i18n.localize("USER.RoleAssistant");
      else if (userData.role == 4) role = game.i18n.localize("USER.RoleGamemaster");

      const userSettings = settings.filter(u => u.id == userData._id)[0];

      const dataNew = {
        index: i,
        name: userData.name,
        role: role,
        color: userData.color,
        id: userData._id,
        enable: userSettings?.enable ? userSettings.enable : false,
        viewbox: userSettings?.viewbox ? userSettings.viewbox : false,
        control: userSettings?.control ? userSettings.control : false

      }
      data.push(dataNew);
    }

    let overrideSettings = game.settings.get(moduleName ,'userSettingsOverrides');
    if (overrideSettings[0] == undefined) {
      for (let i=0; i<5; i++) {
        const settingsNew = {
          role: i,
          enable: false,
          viewbox: false,
          control: false
        }
        overrideSettings.push(settingsNew);
      }
    }

    const overrides = [
      {
        role: game.i18n.localize("USER.RoleNone"),
        roleNr: 0,
        enable: overrideSettings[0].enable,
        viewbox: overrideSettings[0].viewbox,
        control: overrideSettings[0].control
      },{
        role: game.i18n.localize("USER.RolePlayer"),
        roleNr: 1,
        enable: overrideSettings[1].enable,
        viewbox: overrideSettings[1].viewbox,
        control: overrideSettings[1].control
      },{
        role: game.i18n.localize("USER.RoleTrusted"),
        roleNr: 2,
        enable: overrideSettings[2].enable,
        viewbox: overrideSettings[2].viewbox,
        control: overrideSettings[2].control
      },{
        role: game.i18n.localize("USER.RoleAssistant"),
        roleNr: 3,
        enable: overrideSettings[3].enable,
        viewbox: overrideSettings[3].viewbox,
        control: overrideSettings[3].control
      },{
        role: game.i18n.localize("USER.RoleGamemaster"),
        roleNr: 4,
        enable: overrideSettings[4].enable,
        viewbox: overrideSettings[4].viewbox,
        control: true
      }
    ]

      return {
          data: data,
          defaultUserSettings: game.settings.get(moduleName,'defaultUserSettings'),
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
        viewbox: formData?.[`viewbox-${id}`],
        control: formData?.[`control-${id}`]
      }
      settings.push(settingsNew);
    }
    this.updateSettings(settings);

    let overrides = [];
    for (let i=0; i<5; i++) {
      const settingsNew = {
        role: i,
        enable: formData?.[`enableOverride-${i}`],
        viewbox: formData?.[`viewboxOverride-${i}`],
        control: formData?.[`controlOverride-${i}`]
      }
      overrides.push(settingsNew);
    }
    game.settings.set(moduleName ,'userSettingsOverrides',overrides);

    const defaultUserSettings = {
      enable: formData?.['enable-defaultUserSettings'],
      viewbox: formData?.['viewbox-defaultUserSettings'],
      control: formData?.['control-defaultUserSettings']
    }
    game.settings.set(moduleName,'defaultUserSettings',defaultUserSettings)
  }

  activateListeners(html) {
      super.activateListeners(html);
      
  }

  async updateSettings(settings){
    await game.settings.set(moduleName,'userSettings',settings);
    for (let i=0; i< VIEWBOX.viewbox.length; i++)
      if (VIEWBOX.viewbox[i] != undefined)
        VIEWBOX.viewbox[i].hide();

    await sendUpdate( {
      zoom:lockZoom,
      pan:lockPan,
      bBox:boundingBox, 
      aScale:autoScale, 
      rotation:rotation, 
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
      return foundry.utils.mergeObject(super.defaultOptions, {
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