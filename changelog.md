# Changelog

### v2.0.3 - xx-xx-2026

Fixes:
* Fixed issue on the Forge where a stylesheet could not be edited to blacken the sidebar.

### v2.0.2 - 07-11-2025

Fixes:
* Using Exclude Sidebar with Bounding Box enabled could result in erratic panning behavior when trying to pan past the allowed bounds, this is fixed.
* Expanding or collapsing the sidebar will now automatically update the view if required by a bounding box.
* Default Scene Configuration could not be saved when Lock View was enabled, this is now fixed.
* Fixed issue where the Initial View Configurator would only allow rounded values for, for example, the scale.
* When loading a scene with Pan & Zoom locks enabled, the viewposition would not be updated to the last viewposition on that scene. Instead, it would keep the same viewposition as the previous scene.
* Fixed issue where, if the GM just loaded on a scene and tried to edit a player's viewbox before zooming/panning themselves, that player's view would not be updated or it would zoom in/out incorrectly.
* Blacken Sidebar now has the correct description in the scene config.
* Hide UI Elements "Scene Navigation" setting now also hides the expanded inactive scenes.

### v2.0.1 - 24-06-2025

Fixes:
* Fixed issue where user settings would not correctly return their value under certain circumstances. If, for example, 'Enable' was set to false, it would return the default 'Enable' setting instead of false. This could cause settings being enabled for users for which they should've been disabled.
* Fixed viewbox showing on wrong scene.
* Fixed viewbox not correctly being removed when a user logs off.

### v2.0.0 - 18-06-2025
The module has been completely rewritten, so new bugs are to be expected.
Compatible with Foundry v13, use older versions for Foundry v12 (or earlier).

Additions:
* LibWrapper is now used to help prevent module incompatibilities
* User Config: Added 'Static' option to create users that don't change scenes when they're normally activated. The GM can control which scene is viewed by these users by right-clicking a scene in the scene navigation
* Set View dialog: Options are stored and recalled when re-opened
* Set View dialog: Added user selection
* Scene Config: Expanded options for when to hide UI elements
* Scene Config: Added option to hide the camera feed
* Module Settings: Added 'Right-Drag Viewbox Editing' option to enable or disable dragging the viewbox with the right mouse button
* Module Settings: Added 'Force GM-Set Settings' for the 'Physical Grid Size' which allows the GM to override all user configured grid size settings
* Module Settings: Added 'Pan Canvas to Ping Behavior' to allow panning through pings even when locks are applied
* Added 'Clone View' functionality, which will clone the current view to selected players. This can be done using the 'Set View' control button, the new 'Clone View' control button, or a configurable hotkey (C + Alt, by default). You can configure if this should clone the pan and/or the zoom, and which users this should apply to ('Enabled' users, by default) through the module settings or by right-clicking the 'Clone View' control button
* Control buttons:Added 'Reset View' control button that resets the view of users as if the scene was reloaded
* Module Settings: Added 'Control Button Configurator', which can be used to configure which (if any) Lock View control buttons are displayed

Removals:
* Removed 'Rotation' option from scene config because it was too buggy

Other:
* Switched all applications over to ApplicationV2
* Reoganized scene flags. Old scene flags are no longer used, existing flags should automatically migrate


### v1.5.9 - 11-10-2023
Fixes:

* Default scene config is now properly applied on new scenes
* Physical Gridsize can now be applied to all scenes when accessed through the 'Set View' control button
* When editing what UI elements to hide, other changes to scene settings are no longer reset


### v1.5.8 - 14-09-2023
Fixes:

* Default user settings are no longer applied to GM users
* Removed debug message that would occasionally spam the console


### v1.5.7 - 14-06-2023
Fixes:

* Forgot to add the css folder to the release, preventing the module from functioning.


### v1.5.6 - 14-06-2023
Additions:

* Added a scene configurator to allow easy configuration of the Lock View settings, including copying settings from one scene to another and configuring the default configuration for new scenes. Accessible through a button in the scene configuration and the module settings
* Added default user settings which are applied to new or unconfigured users. By default this enables 'Enable' and 'Viewbox'
* Canvas can now be rotated from the Lock View menu in the Scene Configuration and using the 'Set View' dialog (thanks to Dylancyclone)


Fixes:

* Fixed 'hide control button' not hiding the control button in all cases
* Fixed error that would pop up when 'hide control button' was enabled and the scene configuration was closed
* Hiding UI elements now only sets the element to invisible, preventing other elements from shifting around


Other:

* Made compatible with Foundry V11, dropped compatibility with V9
* Changed 'Collapse Sidebar on Scene Load' to 'Sidebar on Scene Load' and made it a selection between 'No Change', 'Collapse' and 'Expand'


### v1.5.4 - 14-09-2022
Fixes:

* Fixed error related to canvas.blur, which prevented the canvas from loading in certain situations
* Fixed errors and warnings when boundingbox was active while panlock was not, and a controlled token moved outside the view (which should cause the canvas to pan automatically)
* Fixed compatibility warnings when editing drawings (for bounding box purposes)


### v1.5.3 - 31-08-2022

Additions:

* Added the option for players to control the module through control buttons. This can be enabled in the user configuration with the 'control' setting
* When using the 'Edit Viewbox' functionality, zooming and panning will only be affected when you hover your mouse over the user's viewbox (it used to affect all users)
* Added the UI (un)hide hotkey to the core keybinding menu. Defaults to Alt + U


Other:

* Improved the documentation and naming of things (mainly related to the user config). Please not that the old 'control' setting is renamed to 'enable'
* Made compatible with Foundry v10, dropped compatibility with Foundry v8


### v1.5.2 - 22-03-2022
Fixes:

* Previous update broke the User Configuration if a user had not been configured before


### v1.5.1 - 22-03-2022
Fixes:

* Fixed issue where zoom and pan lock would sometimes not be applied on scene load
* Fixed issue where switching from a scene with UI elements hidden to a scene with 'Hide UI Elements on Sidebar Collapse' disabled would not always show all UI elements
* Fixed issue where in the User Configuration, if an override was enabled, it also showed the setting as enabled for individual users


Additions:

* Added 'Hide Control Button' setting in the module settings


### v1.5.0 - 30-12-2021
Fixes:

* View no longer resets to the 'Autoscale' setting after interacting with the sidebar
* Fixed console error when the Stream View module was enabled


Additions:

* User Configuration now has a user role specific override. To, for example, enable control for all Trusted Players


Other:

* Made compatible with Foundry v9
* Dropped compatibility with Foundry v0.7


### v1.4.14 - 01-09-2021
Fixes:

* In the last update, 'Hide UI Elements on Sidebar Collapse' accedentally allowed the GM to hide the sidebar (this could lock the GM out of controlling the software), this has been fixed



* Added the 'Ctrl+u' hotkey that can be used to hide/unhide the UI elements that have been configured in the scene config


### v1.4.13 - 30-08-2021
Fixes:

* If 'Hide UI Elements was enabled', control buttons would not always hide if a scene was changed
* UI elements will now only be unhidden if they have been previously hidden by Lock View, allowing other modules to hide/unhide UI elements without Lock View interfering
* Lock View would cause the view to 'bounce' when combined with 'Always Centered'. This has been fixed.
* When configuring the initial view, dragging the box around could place tokens or templates, depending on what tool was selected, this has been fixed by automatically selecting the Lock View control


### v1.4.12 - 22-06-2021
Fixes:

* A change in the previous update made the module incompatible with Foundry 0.7, this has been fixed.


### v1.4.11 - 21-06-2021
Fixes:

* If 'Control' was enabled for the GM, and the sidebar was set to autohide, the GM would be locked out of all controls, essentially bricking the world until Lock View was disabled. To fix this, the sidebar can never be hidden for the GM
* Canvas layers were registered incorrectly, leading to module incompatibilities. This has been fixed thanks to SWW13 on Github


Other:

* Confirmed compatibility with Foundry 0.8.7


### v1.4.10 - 31-05-2021
Fixes:

* Removed some console errors about the canvas not being initialized
* The previous update didn't properly stop all unintended resets to the initial view


Additions:

* In the scene config, you can now set what UI elements to hide by pressing the button next to the 'Hide UI Elements on Sidebar Collapse' button


Other:

* Confirmed compatibility with Foundry 0.8.6


### v1.4.9 - 14-05-2021
Fixes:

* Autoscaling using Physical Gridsize was broken
* 'Set Initial View' configuration wouldn't work if no initial view position was configured previously
* In the scene config, fixed the hint for 'Force Initial View'. It didn't state that it also works if autoscale is set to 'Physical Gridsize', and added description of the button
* If 'Hide UI on Sidebar Collapse' was on, scene navigation would still be displayed after the GM switched a Lock View function on or off
* Various actions, such as starting combat, would reset the view to the initial view position, if 'Force Initial View' was enabled
* Changes to the scene configuration would not automatically update the control button states


Additions:

* In the 'Set Initial View' configuration, added the option to set the view to the current view of a connected player


### v1.4.8 - 05-05-2021
Fixes:

* Fixed issue with module settings, where 'Screen Width' and 'Gridsize' wouldn't update immediately


### v1.4.7 - 05-05-2021
Fixes:

* Increased the Z-index of the viewbox, so it's rendered on top of tiles, drawings, templates, etc


Other:

* Added support for Foundry 0.8.2


### v1.4.6 - 15-04-2021
Fixes:

* Sidebar collapse option didn't work for players


### v1.4.5 - 14-04-2021
Fixes:

* Fixed issue where, if 'Collapse Sidebar on Scene Load' was enabled, it would also collapse the sidebar whenever a control button was pressed


### v1.4.4 - 12-04-2021
Fixes:

* Fixed issue where User Configuration would not be saved if no players were configured.
* Fixed issue with Pathfinder 2e, where the zoom and pan lock would only be applied on the first loaded scene
* Fixed "Cannot read property 'filter' of null" error on first load


Additions:

* Added option to scene configuration to collapse the sidebar when a scene is loaded
* Added option to scene configuration to hide the UI when the sidebar is collapsed


Other:

* Removed popups to notify users of previous breaking setting changes, since I'm assuming all users have updated their settings already


### v1.4.3 - 28-02-2021
Additions:

* Added 'Automatic Fit (outside) autoscale option (makes sure the whole canvas can always be seen, instead of zooming in, like the 'Automatic Fit (inside) option does)


### v1.4.2 - 25-02-2021
Additions:

* Added hooks and hook listeners for external module integrations


### v1.4.1 - 01-02-2021
Fixes:

* Fixed issue where dragging the viewbox would lock the GM's cursor in place
* Autoscale now resets when sidebar is opened/collapsed and pan lock and zoom lock are enabled



* Added a button to the scene configuration (next to 'Force Initial View') that opens a dialog to allow precise initial view position configuration


### v1.4.0 - 06-01-2021
Additions:

* Added a way to change the view of individual players by adding a move and scale icon on the top-left and bottom-right corners of the viewbox if the 'Edit Viewbox' control button is selected
* Added the name of the player above each viewbox
* Module settings for new non-GM players are automatically enabled

Fixes:

* Much of the code has been rewritten for improved stability and performance, and a lot of bugs have been fixed


### v1.3.2 - 27-12-2020
Fixes:

* Enabling zoom and pan lock for the GM caused issues
* Fixed issues where scene config settings would not properly load
* Autoscale would not load in scene load
* Scene would not properly load to Initial View Position, even with module off for the user 


### v1.3.1 - 25-12-2020
Additions:

* Option to exclude the sidebar area from the boundary box and autoscaling
* Option to blacken the background of the sidebar when sidebar area is excluded
* User config button in the module settings that replaces the 'Enable' and 'Force Enable' settings
* Help button in the module settings

Other:

* (Temporary) removed the hotkey lock override, since it no longer works
* Moved LockView settings in the Scene Config to its own section


### v1.3.0 - 20-12-2020
Fixes:

* Disabling pan lock would not enable canvasPan on token move
* Viewbox is now being updated more reliably
* Fixed some problems with the viewbox when changing scenes
* Disabling the viewbox now also disables 'viewbox edit'

Additions:

* Limit players' zoom and pan to stay within a drawn rectangle or the canvas
* Confirmed 0.7.9 support


### v1.2.0 - 08-12-2020
Fixes:

* Fixed issue where module settings would not be saved

Additions:

* Added automatic fit option that automatically selects horizontal or vertical fit so no non-image background will ever be seen
* Confirmed 0.7.8 support


### v1.1.0 - 10-11-2020
Fixes:

* 0.7.6 support
* Manifest url fix

<b>Note:</b> Updating from any previous version requires a manual uninstall of the module

### v1.0.5 - 27-10-2020
Fixes:

* PIXI memory leak
* Slight code clean-up

Other:

* Confirmed core 0.7.5 support


### v1.0.4 - 08-10-2020
Fixes:

* PIXI memory leak (not fully fixed)
* Viewbox would sometimes not show

Additions:

* Localization support
* Fit to screen option
* Force intial view option

Other:

* Confirmed core 0.7.3 support


### v1.0.3 - 15-09-2020
Fixes:

* Multiple viewboxes can now be displayed at the same time
* Zoom and Pan Lock control buttons were broken

Additions:

* Changed 'Reset View' control button to 'Set View', expanded it with more options


### v1.0.2 - 14-09-2020
Fixes: 

* Cleaned up code a bit
* Zoom and Pan lock now work when moving a token to the edge of the screen, and when teleporting (at least with dynamicFX)

Changes:

* Changed behavior of zoom and pan lock control buttons

Additions:

* Added 'edit viewbox' control button, which allows the GM to pan and zoom the client's screen
* Confirmation dialog box on 'Reset TV view' button
* Add warning when viewbox is switched on when no enabled clients are connected


### v1.0.1 - 12-09-2020
Fixes: 

* Refresh no longer needed after changing scene configuration

Additions:

* Lock override keybinding
* Reset TV view button
* Pan lock override button
* Zoom lock override button
* Viewbox enable button
* Force enable tickbox


### v1.0.0 - 09-09-2020
Initial release<br>