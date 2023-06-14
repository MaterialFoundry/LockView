# Lock View
## Introduction

Lock View is a [Foundry VTT](https://foundryvtt.com/) module that gives the GM (or a designated player) control over the zoom and pan capabilities of players, such as locking the zoom or pan, moving the canvas, or setting the view to a specified setting.
The module was originally made as a companion app for the [Material Plane](https://github.com/CDeenen/MaterialPlane) module, and to make in-person play using a horizontally mounted TV easier.
Over time, however, the module's features have expanded greatly, including many functions that can be useful for online play.

The module has 6 main functions:
* **Autoscaling**: Scales the scene in various ways (horizontal fit, vertical fit, automatic fit, or scaled to a physical gridsize)
* **Zoom lock**: Locks the zooming of the scene
* **Pan lock**: Locks the panning of the scene
* **Bounding box**: Limit zoom and pan to stay within a bounding box
* **Force initial view**: After loading a new scene, the view is forced to the initial view (as set in the scene configuration menu), regardless of the position of tokens
* **Viewbox**: Allows the GM to see what's shown on players screens, and allows the GM to control the pan and zoom of those players

## Instructions
* [Wiki](https://github.com/CDeenen/LockView/wiki)

## Module Compatibility
When 'Zoom Lock' or 'Pan Lock' are enabled, this module disables all zooming and/or panning functionality, regardless of who or what is requesting that zoom or pan. This means that, for example, modules that try to pan or zoom won't work. <br>
<br>
Right now, there appear to be compatibility issues with the following modules:
* DF Active Lights
* DF Curvy Walls
* Zoom/Pan Options

## Foundry Compatibility
This module has been tested to work with Foundry V10 and V11.<br>

## Feedback
Feel free [report an issue/suggestion](https://github.com/CDeenen/LockView/issues), contact me on Discord (Cris#6864), or send me an email: cdeenen@outlook.com.

## Credits
**Author**: Cristian Deenen (Cris#6864 on Discord)

If you enjoy using my modules, please consider supporting me on [Patreon](https://www.patreon.com/materialfoundry) or buy me a coffee through [Ko-fi](https://ko-fi.com/materialfoundry). 

## Abandonment
Abandoned modules are a (potential) problem for Foundry, because users and/or other modules might rely on abandoned modules, which might break in future Foundry updates.<br>
I consider this module abandoned if all of the below cases apply:
* This module/github page has not received any updates in at least 3 months
* I have not posted anything on "the Foundry" and "the League of Extraordinary Foundry VTT Developers" Discord servers in at least 3 months
* I have not responded to emails or PMs on Discord in at least 1 month
* I have not announced a temporary break from development, unless the announced end date of this break has been passed by at least 3 months

If the above cases apply (as judged by the "League of Extraordinary Foundry VTT Developers" admins), I give permission to the "League of Extraordinary Foundry VTT Developers" admins to assign one or more developers to take over this module, including requesting the Foundry team to reassign the module to the new developer(s).<br>
I require the "League of Extraordinary Foundry VTT Developers" admins to send me an email 2 weeks before the reassignment takes place, to give me one last chance to prevent the reassignment.<br>
I require to be credited for my work in all future releases. 
