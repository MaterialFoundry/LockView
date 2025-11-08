import { moduleName } from "../lockview.js";
import { Helpers } from "./helpers.js";

export class Socket {
    constructor() {

        game.socket.on('module.LockView', (payload) => {
            //console.log('pl', payload)
            const messageType = payload.messageType;
            const sender = payload.sender;
            const target = payload.target;
            const data = payload.data;

            if (target === 'all') {}
            else if (target === 'enable') {
                if (!Helpers.getUserSetting('enable')) return;
            }
            else if (target === 'control') {
                if (!Helpers.getUserSetting('control')) return;
            }
            else if (target === 'viewbox') {
                if (!Helpers.getUserSetting('viewbox')) return;
            }
            else if (target === 'static') {
                if (!Helpers.getUserSetting('static')) return;
            }
            else if (target === 'activeGM') {
                if (!game.user.isActiveGM) return;
            }
            else if (target !== game.userId) return;

            //console.log('Socket rec', messageType, sender, target, data)
            if (messageType === 'requestFlagSet') this.onRequestFlagSet(data);
            else if (messageType === 'updateLocks' && canvas?.scene?._id === data.scene) lockView.locks.update(data.locks, {fromSocket:true});
            else if (messageType === 'updateViewbox') lockView.viewbox.update(sender, data);
            else if (messageType === 'requestViewbox') lockView.viewbox.emit();
            else if (messageType === 'setView') this.onSetView(data);
            else if (messageType === 'pullStaticUsers') this.onPullStaticUsers(data);
            else if (messageType === 'setViewDialog') this.onSetViewDialog(data);
            else if (messageType === 'sceneUpdated') this.onSceneUpdated(data);
            else if (messageType === 'refresh') lockView.refresh(true);
        });
    }

    refresh() {
        this.emit('refresh', 'all');
    }

    requestFlagSet(data) {
        this.emit('requestFlagSet', 'activeGM', data);
    }

    onRequestFlagSet(data) {
        const scene = game.scenes.get(data.scene);
        if (!scene) return;
        scene.setFlag(moduleName, data.flag, data.value);
    }

    updateLocks(data) {
        this.emit('updateLocks', 'all', data);
    }

    requestViewbox() {
        this.emit('requestViewbox', 'all');
    }

    sceneUpdated(data) {
        this.emit('sceneUpdated', 'enable', data);
    }

    onSceneUpdated(data) {
        lockView.sceneHandler.onSceneUpdate(game.scenes.get(data.scene))
    }

    pullStaticUsers(data) {
        this.emit('pullStaticUsers', 'static', data);
    }

    onPullStaticUsers(data) {
        const scene = game.scenes.get(data);
        scene?.view({forceView: true})
    }

    emitViewbox() {
        if (!canvas?.scene?._viewPosition?.scale) return;
        let windowWidth = window.innerWidth;
        let position = structuredClone(canvas.scene._viewPosition);
        if (canvas.scene.getFlag(moduleName, 'sidebar')?.exclude) {
            windowWidth -= Helpers.getSidebarWidth();
            position.x -= 0.5*Helpers.getSidebarWidth()/canvas.scene._viewPosition.scale
        }
        
        this.emit('updateViewbox', 'control', {
            position,
            width: windowWidth/canvas.scene._viewPosition.scale,
            height: window.innerHeight/canvas.scene._viewPosition.scale,
            color: game.user.color,
            name: game.user.name,
            scene: canvas.scene.id
        });
    }

    setView(data) {
        this.emit('setView', data.userId, {
            type: data.type,
            position: data.position,
            width: data.width,
            height: data.height
        })
    }

    async onSetView(data) {
        const currentLocks = lockView.locks.applyLocks;
        if (currentLocks) lockView.locks.applyLocks = false;
        if (data.type === 'absolute') {
            let scale = canvas.scene._viewPosition.scale;
            let width = window.innerWidth/canvas.scene._viewPosition.scale;
            let height = window.innerHeight/canvas.scene._viewPosition.scale;
            if (data.width) {
                scale = window.innerWidth/data.width;
                width = data.width;
                height = window.innerHeight/scale;
                if (scale > 3 || scale < 0) return;
            }
            
            await canvas.pan({
                x: data.position.x + width/2,
                y: data.position.y + height/2,
                scale
            });
        }
        else if (data.type === 'relative') {
            let newPos = {
                x: data.position.x ? data.position.x*canvas.scene._viewPosition.scale + canvas.scene._viewPosition.x : undefined,
                y: data.position.y ? data.position.y*canvas.scene._viewPosition.scale + canvas.scene._viewPosition.y : undefined,
                scale: data.position.scale ? data.position.scale*canvas.scene._viewPosition.scale : undefined
            }
            canvas.pan(newPos)
        }
        lockView.viewbox.emit();
        if (currentLocks) lockView.locks.applyLocks = true;
    }

    setViewDialog(data, users) {
        for (let user of users) {
            if (user === game.userId) this.onSetViewDialog(data);
            else this.emit('setViewDialog', user, data);
        }
        
    }

    async onSetViewDialog(data) {
        const currentLocks = lockView.locks.applyLocks;
        if (currentLocks) lockView.locks.applyLocks = false;

        let position = {};

        if (data.pan === 'initialView') {
            position.x = canvas.scene.initial.x;
            position.y = canvas.scene.initial.y;
        }
        else if (data.pan === 'moveGridSpaces') {
            position = canvas.scene._viewPosition;
            if (data.grid?.x) position.x += data.grid?.x * canvas.grid.sizeX;
            if (data.grid?.y) position.y += data.grid?.y * canvas.grid.sizeY;
        }
        else if (data.pan === 'moveByCoords') {
            position = canvas.scene._viewPosition;
            if (data.coordinates?.x) position.x += data.coordinates.x;
            if (data.coordinates?.y) position.y += data.coordinates.y;
        }
        else if (data.pan === 'moveToCoords' || data.pan === 'cloneView') {
            position = canvas.scene._viewPosition;
            if (data.coordinates?.x) position.x = data.coordinates.x;
            if (data.coordinates?.y) position.y = data.coordinates.y;
        }
        else if (data.pan !== 'noChange') position = lockView.sceneHandler.getAutoscale(data.pan);

        if (data.zoom === 'set' || data.zoom === 'cloneView') position.scale = data.scale;
        else if (data.zoom === 'initialView') position.scale = canvas.scene.initial.scale;
        else if (data.zoom === 'physical') position.scale = lockView.sceneHandler.getAutoscale('physical').scale;

        await canvas.pan(position);
        
        lockView.viewbox.emit();
        if (currentLocks) lockView.locks.applyLocks = true;
    }

    emit(messageType, target='all', data) {
        //console.log('emit', messageType, target, data)
        game.socket.emit('module.LockView', {
            messageType,
            sender: game.userId,
            target, 
            data
        });
    }
}