import { initializeControlButtons } from "./src/controlButtons.js";
import { migrationHandler } from "./src/migrationHandler.js";
import { Locks } from "./src/locks.js";
import { SceneHandler } from "./src/sceneHandler.js";
import { registerSettings } from "./src/settings.js";
import { Helpers } from "./src/helpers.js";
import { Socket } from "./src/socket.js";
import { UserConfig } from "./src/apps/userConfig.js";
import { Viewbox } from "./src/viewbox.js";
import { registerLibWrapperFunctions } from "./src/libWrapper/overrides.js";
import { InitialViewConfig } from "./src/apps/initialViewConfig.js";
import { SceneConfigurator } from "./src/apps/sceneConfigurator.js";
import { StylesHandler } from "./src/stylesHandler.js";
import { SetViewDialog } from "./src/apps/setViewDialog.js";
import { CloneView } from "./src/apps/cloneView.js";

export const moduleName = "LockView";
export const documentationUrl = "https://materialfoundry.github.io/LockView/";

//CONFIG.debug.hooks = true;

class LockView {
  constructor() {
    let hideControlButton = game.settings.get(moduleName, "hideControlButton");
    this.controlButtonVisible = Helpers.getUserSetting('control') && !hideControlButton;
    this.locks = new Locks(Helpers.getUserSetting('enable'));
    this.migrationHandler = new migrationHandler();
    this.sceneHandler = new SceneHandler();
    this.Helpers = Helpers;
    this.socket = new Socket();
    this.apps = {
      userConfig: new UserConfig(),
      initialViewConfig: new InitialViewConfig(),
      sceneConfigurator: new SceneConfigurator(),
      setView: new SetViewDialog(),
      cloneView: new CloneView()
    }
    this.viewbox = new Viewbox();
    this.styles = new StylesHandler();
  }

  refresh(fromSocket=false) {
    const locks = canvas.scene.getFlag(moduleName, 'locks');
    this.locks.applyLocks = Helpers.getUserSetting('enable');
    this.locks.update(locks);
    this.viewbox.removeAll();
    this.sceneHandler.onSceneLoad(canvas.scene, 'canvasReady')
    
    if (!fromSocket) this.socket.refresh();

    setTimeout(()=> {
      if (Helpers.getUserSetting('control')) this.socket.requestViewbox();
    }, 100);
  }
}

Hooks.once('init', () => {
  registerLibWrapperFunctions();
  registerSettings();
  initializeControlButtons();
});

Hooks.once('setup', () => {
  globalThis.lockView = new LockView();
});

Hooks.once('ready', async()=>{
  if (Helpers.getUserSetting('control'))
    lockView.socket.requestViewbox();
  lockView.viewbox.emit();

  /**
   * Debug only
   */
  /*
  if (game.user.isGM) {
    setTimeout(()=>{
      //lockView.apps.userConfig.render(true);
      //lockView.apps.initialViewConfig.setScene(canvas.scene).render(true);
      //lockView.apps.sceneConfigurator.render(true);
      //lockView.apps.setView.render(true);
    },1000)
  }
  */
});