# Lock View Documentation

!!! warning "Lock View v2 only"
    This documentation is for Lock View v2.0.0+. Refer to the [old documentation](https://github.com/MaterialFoundry/LockView/wiki) for older versions of Lock View.
<br clear="left">

Welcome to the Lock View documentation.<br>
Click the links above to navigate the documentation.<br>
Make sure you start [here](#getting-started).


## Introduction

Lock View is a [Foundry VTT](https://foundryvtt.com/) module that provides the GM or a designated player with options to control how Foundry is displayed and controlled. The main features include:

* <b>Autoscaling</b>: Autoscaling the scene so it fills the display or scaled so the grid corresponds with physical dimensions.
* <b>Locks</b>: Pan & zoom locks to prevent users from panning or zooming, or force their view to stay within a specified bounding box.
* <b>Force Initial View</b>: Make sure that a scene loads to a specified view position and scale.
* <b>Viewbox</b>: Allows the GM to see the view of users, represented by rectangles drawn on the canvas.
* <b>Panning & Zooming User Views</b>: Move a user's view to a specific point, or offset it by a specific amount of grid spaces.
* <b>Cloning View</b>: Apply your current view to users.

## Getting Started
!!! warning "New Users: Please Read"
    When first starting out with Lock View, it can be a bit confusing and daunting. While effort has been put into making everything as easy to understand as possible, due to the amount of things the module can do, some confusion might still arise.<br>
    Please read (at least) this page very carefully.
<br clear="left">

### Core Concepts

#### Scene Settings
Almost all Lock View features are configured on a scene-by-scene basis (it is possible to configure default settings). These settings can be set in the scene's [configuration](./sceneConfig/sceneConfig.md). Additionally Lock View's [scene configurator](./moduleSettings/sceneConfigurator.md) allows for quick editing for multiple scenes.

#### User Settings
The various functions Lock View can be enabled or disabled for specific users in the [User Configurator](./moduleSettings/userConfigurator.md) by the gamemaster. For the module to have any effect on a user, at least one of the settings needs to be enabled.<br>
In the module and this documentation, references are made to Enable users or Control users, which means users that have Enable or Control enabled, respectively.

#### Locks
One of the main parts of the module is the [locks functionality](./sceneConfig/locks.md). Locks are used to prevent Enable users from panning, zooming, or it can limit a player's view to a specified bounding box.<br>
Locks are configured on a scene-by-scene basis, and they can be changed by pressing the relevant [control buttons](./controlButtons.md).

#### Control Buttons
Lock View's [control buttons](./controlButtons.md) give quick access to some of its features.

#### Viewbox
The [viewbox](./viewbox.md) allows Control users to see what Viewbox users are seeing by drawing a rectangle representing the view on the canvas. Additionally, Control users can edit the viewbox, which means that they can control what Viewbox users see.

#### Autoscaling
Lock View provides multiple autoscaling options in the [scene configuration](./sceneConfig/autoscale.md) that will automatically set the scale/zoom level for Enable users. For example, it is possible to fit the scene so the entire scene is visible, or set a physical grid size and have scene scaled so it's grid corresponds with real world dimensions.

### Recommended Configuration

* You should configure which features apply to which users in the [User Configurator](./moduleSettings/userConfigurator.md).
* Configure scene settings in a scene's [configuration](./sceneConfig/sceneConfig.md) or Lock View's [Scene Configurator](./moduleSettings/sceneConfigurator.md).
* If you plan on using [Physical Grid Size autoscaling](./sceneConfig/autoscale.md#physical-grid-size), you must configure it in the user settings.

### Example Configurations
Example configurations for common usecases can be found [here](./exampleConfigurations.md).