# Changelog
### v1.5.9 - 11-10-2023
Fixes:
<ul>
<li>Default scene config is now properly applied on new scenes</li>
<li>Physical Gridsize can now be applied to all scenes when accessed through the 'Set View' control button</li>
<li>When editing what UI elements to hide, other changes to scene settings are no longer reset</li>
</ul>

### v1.5.8 - 14-09-2023
Fixes:
<ul>
    <li>Default user settings are no longer applied to GM users</li>
    <li>Removed debug message that would occasionally spam the console</li>
</ul>

### v1.5.7 - 14-06-2023
Fixes:
<ul>
    <li>Forgot to add the css folder to the release, preventing the module from functioning.</li>
</ul>

### v1.5.6 - 14-06-2023
Additions:
<ul>
    <li>Added a scene configurator to allow easy configuration of the Lock View settings, including copying settings from one scene to another and configuring the default configuration for new scenes. Accessible through a button in the scene configuration and the module settings</li>
    <li>Added default user settings which are applied to new or unconfigured users. By default this enables 'Enable' and 'Viewbox'</li>
    <li>Canvas can now be rotated from the Lock View menu in the Scene Configuration and using the 'Set View' dialog (thanks to Dylancyclone)</li>
</ul>

Fixes:
<ul>
    <li>Fixed 'hide control button' not hiding the control button in all cases</li>
    <li>Fixed error that would pop up when 'hide control button' was enabled and the scene configuration was closed</li>
    <li>Hiding UI elements now only sets the element to invisible, preventing other elements from shifting around</li>
</ul>

Other:
<ul>
    <li>Made compatible with Foundry V11, dropped compatibility with V9</li>
    <li>Changed 'Collapse Sidebar on Scene Load' to 'Sidebar on Scene Load' and made it a selection between 'No Change', 'Collapse' and 'Expand'</li>
</ul>

### v1.5.4 - 14-09-2022
Fixes:
<ul>
    <li>Fixed error related to canvas.blur, which prevented the canvas from loading in certain situations</li>
    <li>Fixed errors and warnings when boundingbox was active while panlock was not, and a controlled token moved outside the view (which should cause the canvas to pan automatically)</li>
    <li>Fixed compatibility warnings when editing drawings (for bounding box purposes)</li>
</ul>

### v1.5.3 - 31-08-2022

Additions:
<ul>
    <li>Added the option for players to control the module through control buttons. This can be enabled in the user configuration with the 'control' setting</li>
    <li>When using the 'Edit Viewbox' functionality, zooming and panning will only be affected when you hover your mouse over the user's viewbox (it used to affect all users)</li>
    <li>Added the UI (un)hide hotkey to the core keybinding menu. Defaults to Alt + U</li>
</ul>

Other:
<ul>
    <li>Improved the documentation and naming of things (mainly related to the user config). Please not that the old 'control' setting is renamed to 'enable'</li>
    <li>Made compatible with Foundry v10, dropped compatibility with Foundry v8</li>
</ul>

### v1.5.2 - 22-03-2022
Fixes:
<ul>
<li>Previous update broke the User Configuration if a user had not been configured before</li>
</ul>

### v1.5.1 - 22-03-2022
Fixes:
<ul>
<li>Fixed issue where zoom and pan lock would sometimes not be applied on scene load</li>
<li>Fixed issue where switching from a scene with UI elements hidden to a scene with 'Hide UI Elements on Sidebar Collapse' disabled would not always show all UI elements</li>
<li>Fixed issue where in the User Configuration, if an override was enabled, it also showed the setting as enabled for individual users</li>
</li>

Additions:
<ul>
<li>Added 'Hide Control Button' setting in the module settings</li>
</ul>

### v1.5.0 - 30-12-2021
Fixes:
<ul>
<li>View no longer resets to the 'Autoscale' setting after interacting with the sidebar</li>
<li>Fixed console error when the Stream View module was enabled</li>
</ul>

Additions:
<ul>
<li>User Configuration now has a user role specific override. To, for example, enable control for all Trusted Players</li>
</ul>

Other:
<ul>
<li>Made compatible with Foundry v9</li>
<li>Dropped compatibility with Foundry v0.7</li>
</ul>

### v1.4.14 - 01-09-2021
Fixes:
<ul>
<li>In the last update, 'Hide UI Elements on Sidebar Collapse' accedentally allowed the GM to hide the sidebar (this could lock the GM out of controlling the software), this has been fixed</li>
</ul>

<ul>
<li>Added the 'Ctrl+u' hotkey that can be used to hide/unhide the UI elements that have been configured in the scene config</li>
</ul>

### v1.4.13 - 30-08-2021
Fixes:
<ul>
<li>If 'Hide UI Elements was enabled', control buttons would not always hide if a scene was changed</li>
<li>UI elements will now only be unhidden if they have been previously hidden by Lock View, allowing other modules to hide/unhide UI elements without Lock View interfering</li>
<li>Lock View would cause the view to 'bounce' when combined with 'Always Centered'. This has been fixed.</li>
<li>When configuring the initial view, dragging the box around could place tokens or templates, depending on what tool was selected, this has been fixed by automatically selecting the Lock View control</li>
</ul>

### v1.4.12 - 22-06-2021
Fixes:
<ul>
<li>A change in the previous update made the module incompatible with Foundry 0.7, this has been fixed.</li>
</ul>

### v1.4.11 - 21-06-2021
Fixes:
<ul>
<li>If 'Control' was enabled for the GM, and the sidebar was set to autohide, the GM would be locked out of all controls, essentially bricking the world until Lock View was disabled. To fix this, the sidebar can never be hidden for the GM</li>
<li>Canvas layers were registered incorrectly, leading to module incompatibilities. This has been fixed thanks to SWW13 on Github</li>
</ul>

Other:
<ul>
<li>Confirmed compatibility with Foundry 0.8.7</li>
</ul>

### v1.4.10 - 31-05-2021
Fixes:
<ul>
<li>Removed some console errors about the canvas not being initialized</li>
<li>The previous update didn't properly stop all unintended resets to the initial view</li>
</ul>

Additions:
<ul>
<li>In the scene config, you can now set what UI elements to hide by pressing the button next to the 'Hide UI Elements on Sidebar Collapse' button</li>
</ul>

Other:
<ul>
<li>Confirmed compatibility with Foundry 0.8.6</li>
</ul>

### v1.4.9 - 14-05-2021
Fixes:
<ul>
<li>Autoscaling using Physical Gridsize was broken</li>
<li>'Set Initial View' configuration wouldn't work if no initial view position was configured previously</li>
<li>In the scene config, fixed the hint for 'Force Initial View'. It didn't state that it also works if autoscale is set to 'Physical Gridsize', and added description of the button</li>
<li>If 'Hide UI on Sidebar Collapse' was on, scene navigation would still be displayed after the GM switched a Lock View function on or off</li>
<li>Various actions, such as starting combat, would reset the view to the initial view position, if 'Force Initial View' was enabled</li>
<li>Changes to the scene configuration would not automatically update the control button states</li>
</ul>

Additions:
<ul>
<li>In the 'Set Initial View' configuration, added the option to set the view to the current view of a connected player</li>
</ul>

### v1.4.8 - 05-05-2021
Fixes:
<ul>
<li>Fixed issue with module settings, where 'Screen Width' and 'Gridsize' wouldn't update immediately</li>
</ul>

### v1.4.7 - 05-05-2021
Fixes:
<ul>
<li>Increased the Z-index of the viewbox, so it's rendered on top of tiles, drawings, templates, etc</li>
</ul>

Other:
<ul>
<li>Added support for Foundry 0.8.2</li>
</ul>

### v1.4.6 - 15-04-2021
Fixes:
<ul>
<li>Sidebar collapse option didn't work for players</li>
</ul>

### v1.4.5 - 14-04-2021
Fixes:
<ul>
<li>Fixed issue where, if 'Collapse Sidebar on Scene Load' was enabled, it would also collapse the sidebar whenever a control button was pressed</li>
</ul>

### v1.4.4 - 12-04-2021
Fixes:
<ul>
<li>Fixed issue where User Configuration would not be saved if no players were configured.</li>
<li>Fixed issue with Pathfinder 2e, where the zoom and pan lock would only be applied on the first loaded scene</li>
<li>Fixed "Cannot read property 'filter' of null" error on first load</li>
</ul>

Additions:
<ul>
<li>Added option to scene configuration to collapse the sidebar when a scene is loaded</li>
<li>Added option to scene configuration to hide the UI when the sidebar is collapsed</li>
</ul>

Other:
<ul>
<li>Removed popups to notify users of previous breaking setting changes, since I'm assuming all users have updated their settings already</li>
</ul>

### v1.4.3 - 28-02-2021
Additions:
<ul>
<li>Added 'Automatic Fit (outside) autoscale option (makes sure the whole canvas can always be seen, instead of zooming in, like the 'Automatic Fit (inside) option does)</li>
</ul>

### v1.4.2 - 25-02-2021
Additions:
<ul>
<li>Added hooks and hook listeners for external module integrations</li>
</ul>

### v1.4.1 - 01-02-2021
Fixes:
<ul>
<li>Fixed issue where dragging the viewbox would lock the GM's cursor in place</li>
<li>Autoscale now resets when sidebar is opened/collapsed and pan lock and zoom lock are enabled</li>
</ul>

<ul>
<li>Added a button to the scene configuration (next to 'Force Initial View') that opens a dialog to allow precise initial view position configuration</li>
</ul>

### v1.4.0 - 06-01-2021
Additions:
<ul>
<li>Added a way to change the view of individual players by adding a move and scale icon on the top-left and bottom-right corners of the viewbox if the 'Edit Viewbox' control button is selected</li>
<li>Added the name of the player above each viewbox</li>
<li>Module settings for new non-GM players are automatically enabled</li>
</ul>
Fixes:
<ul>
<li>Much of the code has been rewritten for improved stability and performance, and a lot of bugs have been fixed</li>
</ul>

### v1.3.2 - 27-12-2020
Fixes:
<ul>
<li>Enabling zoom and pan lock for the GM caused issues</li>
<li>Fixed issues where scene config settings would not properly load</li>
<li>Autoscale would not load in scene load</li>
<li>Scene would not properly load to Initial View Position, even with module off for the user</li> 
</ul>

### v1.3.1 - 25-12-2020
Additions:
<ul>
<li>Option to exclude the sidebar area from the boundary box and autoscaling</li>
<li>Option to blacken the background of the sidebar when sidebar area is excluded</li>
<li>User config button in the module settings that replaces the 'Enable' and 'Force Enable' settings</li>
<li>Help button in the module settings</li>
</ul>
Other:
<ul>
<li>(Temporary) removed the hotkey lock override, since it no longer works</li>
<li>Moved LockView settings in the Scene Config to its own section</li>
</ul>

### v1.3.0 - 20-12-2020
Fixes:
<ul>
<li>Disabling pan lock would not enable canvasPan on token move</li>
<li>Viewbox is now being updated more reliably</li>
<li>Fixed some problems with the viewbox when changing scenes</li>
<li>Disabling the viewbox now also disables 'viewbox edit'</li>
</ul>
Additions:
<ul>
<li>Limit players' zoom and pan to stay within a drawn rectangle or the canvas</li>
<li>Confirmed 0.7.9 support</li>
</ul>

### v1.2.0 - 08-12-2020
Fixes:
<ul>
<li>Fixed issue where module settings would not be saved</li>
</ul>
Additions:
<ul>
<li>Added automatic fit option that automatically selects horizontal or vertical fit so no non-image background will ever be seen</li>
<li>Confirmed 0.7.8 support</li>
</ul>

### v1.1.0 - 10-11-2020
Fixes:
<ul>
<li>0.7.6 support</li>
<li>Manifest url fix</li>
</ul>
<b>Note:</b> Updating from any previous version requires a manual uninstall of the module

### v1.0.5 - 27-10-2020
Fixes:
<ul>
<li>PIXI memory leak</li>
<li>Slight code clean-up</li>
</ul>
Other:
<ul>
<li>Confirmed core 0.7.5 support</li>
</ul>

### v1.0.4 - 08-10-2020
Fixes:
<ul>
<li>PIXI memory leak (not fully fixed)</li>
<li>Viewbox would sometimes not show</li>
</ul>
Additions:
<ul>
<li>Localization support</li>
<li>Fit to screen option</li>
<li>Force intial view option</li>
</ul>
Other:
<ul>
<li>Confirmed core 0.7.3 support</li>
</ul>

### v1.0.3 - 15-09-2020
Fixes:
<ul>
<li>Multiple viewboxes can now be displayed at the same time</li>
<li>Zoom and Pan Lock control buttons were broken</li>
</ul>
Additions:
<ul>
<li>Changed 'Reset View' control button to 'Set View', expanded it with more options</li>
</ul>

### v1.0.2 - 14-09-2020
Fixes: 
<ul>
<li>Cleaned up code a bit</li>
<li>Zoom and Pan lock now work when moving a token to the edge of the screen, and when teleporting (at least with dynamicFX)</li>
</ul>
Changes:
<ul>
<li>Changed behavior of zoom and pan lock control buttons</li>
</ul>
Additions:
<ul>
<li>Added 'edit viewbox' control button, which allows the GM to pan and zoom the client's screen</li>
<li>Confirmation dialog box on 'Reset TV view' button</li>
<li>Add warning when viewbox is switched on when no enabled clients are connected</li>
</ul>

### v1.0.1 - 12-09-2020
Fixes: 
<ul>
<li>Refresh no longer needed after changing scene configuration
</ul>
Additions:
<ul>
<li>Lock override keybinding</li>
<li>Reset TV view button</li>
<li>Pan lock override button</li>
<li>Zoom lock override button</li>
<li>Viewbox enable button</li>
<li>Force enable tickbox</li>
</ul>

### v1.0.0 - 09-09-2020
Initial release<br>