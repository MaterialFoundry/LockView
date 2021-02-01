# Changelog
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