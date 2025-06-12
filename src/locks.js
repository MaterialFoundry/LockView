import { Helpers } from "./helpers.js";

export class Locks {
    pan = false;
    zoom = false;
    boundingBox = false;

    constructor(applyLocks) {
        this.applyLocks = applyLocks;
    }

    get() {
        return {
            pan: this.pan,
            zoom: this.zoom,
            boundingBox: this.boundingBox
        }
    }

    update(locks, options = {fromSocket:false, save: false}) {
        if (locks) {
            if (locks.pan !== undefined) this.pan = locks.pan;
            if (locks.zoom !== undefined) this.zoom = locks.zoom;
            if (locks.boundingBox !== undefined) {
                this.boundingBox = locks.boundingBox;
                if (this.boundingBox) canvas.pan(canvas.scene._viewPosition);
            }
        }
        
        if (lockView.controlButtonVisible) {
            ui.controls.controls.lockView.tools.panLock.active = this.pan;
            ui.controls.controls.lockView.tools.zoomLock.active = this.zoom;
            ui.controls.controls.lockView.tools.boundingBox.active = this.boundingBox;
        }

        if (!options.fromSocket) {
            lockView.socket.updateLocks({
                locks: this.get(),
                scene: canvas.scene._id
            });
        }
        else if (lockView.controlButtonVisible){
            ui.controls._configureRenderOptions({reset:true});
            ui.controls.render();
        }

        if (options.save && Helpers.getUserSetting('control')) {
            if (game.user.isGM) {
                canvas.scene.setFlag('LockView', 'locks', this.get());
            }
            else {
                lockView.socket.requestFlagSet({flag: 'locks', value: this.get(), scene: canvas.scene._id});
            }
        }
        
    }

    
}