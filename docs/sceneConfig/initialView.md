<div class="imgContainer"><img src="../../img/SceneConfig-ForceInitial.png"></div>
The initial view position is the view that players will see when a scene is loaded. This initial view position can be configured in the Basics tab of the scene config. The default Foundry behavior is that the view will center on owned tokens on the scene. Only if the player has no owned tokens, will the initial view position be applied.

Lock View allows you to always force the view to the initial view position, even if a player owns tokens on the scene.

Press the :fontawesome-solid-crop-simple: button to open the [Initial View Configurator](#initial-view-configurator)

??? info "Understanding the Initial View Position"
    The initial view position might not be exactly what you expect, in the sense that it does not describe how much of a scene is visible when a scene is loaded.

    <hr>
    <b>TLDR</b><br>
    The scale/zoom value of the initial view posiition describes how much the scene should be zoomed in, relative to the resolution of your display. So on displays with a different resolution, or different 'virtual' resolution (due to things like display scaling), more or less of the scene will be visible.
    <hr>

    <b>What exactly is the Initial View Position?</b><br>
    The initial view position is a combination of 3 values:

    * X-coordinate
    * Y-coordinate
    * Scale (sometimes called zoom)

    The X and Y-coordinates describe the center point of the view, which will be the same for everyone.<br>
    The scale describes how many pixels of the scene (or background image) correspond with 1 pixel on your display.

    A scale of 1 means that 1 pixel of the scene will correspond with 1 pixel on your display. So if you have a 1080p (1920x1080) display, 1920 pixels of the scene will be displayed horizontally.<br>
    A scale of 2 means that 2 pixels of the scene will correspond with 1 pixel on your display. So only 960 pixels of the scene will be displayed horizontally, so the scene is essentially zoomed in by a factor of 2.

    <b>What does this mean in practise?</b><br>
    This means that multiple things will influence how much of the scene will be visible at a specific scale:

    * <b>Display Resolution</b>: If you double the display resolution, twice as much of the scene will be visible. In other words: the scene will be zoomed in half as much.
    * <b>Display Aspect Ratio</b>: Most modern displays have an aspect ratio of 16:9 or 16:10 (e.g. 1920x1080 and 1920x1200, respectively). This means that, if the horizontal resolution is the same, the amount of the scene that's displayed in the vertical direction will be different.
    * <b>Display Scaling</b>: In the display settings of your operating system, you will be able to set a display scaling value, usually expressed in a percentage. 100% means that everything is displayed at the actual resolution of the display, 200% means that everything will be displayed twice as big. This means that, as far as your browser/Foundry is concerned, the resolution of your display is halved. So for a 1920x1080 display, the browser/Foundry will think it's a 960x540 display (if set to 200% scaling). This will have the same effect as having a display with a different resolution, as described above.
    * <b>Browser Zoom</b>: Browsers, such as Chrome or Firefox allow you to zoom in on a web page (in the menu at the top-right of the browser, 3 dots for Chrome, 3 horizontal lines for Firefox). The effect of this is exactly the same as display scaling, see above.

    <b>What to do about it?</b><br>
    First of all, you'll need to accept that it might not be possible for everyone to see exactly the same thing using a specific initial view position. If you want a more reliable way to make sure everyone sees the (almost) the same thing, consider using one of the autoscaling options in the [scene config](sceneConfig.md).

    There are some things you and your players can do:

    * If everyone has the same display resolution, make sure everyone uses the same display scaling and browser zoom level.
    * If someone has a higher resolution display, ask them to set display scaling or their browser's zoom level to a value so their 'virtual' resolution is closer to the display resolution of other players (e.g. if they have a 4k display and you have a 1080p display, ask them to set the zoom level to 200%).

    <b>Getting a perfect initial view position for a specific user</b><br>
    If you only care about the initial view position of a specific user, for example, when you have a TV table and you want to make sure the initial view is correct on the TV, you can do the following:

    1. Hook everything up as you would for a normal game
    2. Load the scene you want to configure
    3. Position the view on the TV the way you want the initial view position to be
    4. Go into the Lock View tab of the scene config and press the 'Configure Initial View' button in the 'Force Initial View' section
    5. In the new window, at 'Set to Player View' you select the TV player
    6. Press 'Capture View' and then 'Save Changes'

??? info "Autoscaling and the Initial View Position"
    If autoscaling is configured in the [scene config](./sceneConfig.md), some or all of the initial view position will be overridden.<br>
    For 'Physical Grid Size', only the X and Y position of the initial view position will take effect.<br>
    For all other autoscale options the initial view position will not do anything.

??? info "Bounding Box and the Initial View Position"
    With the 'Bounding Box' lock, you can force the view of users to stay within a specified area. If the initial view position would cause the view to be outside of that area, the view will be changed so it fits inside of the area.

## Initial View Configurator
<div class="imgContainer"><img src="../../img/SceneConfig-InitialViewConfig.png"></div>
The Initial View Configurator is a tool that allows you to easily configure the initial view position of the scene.

When this configurator is opened, a red Initial View rectangle will be displayed that corresponds to the initial view position. You can move the view position by dragging the :fontawesome-solid-arrows-up-down-left-right: icon, and resize it by dragging the :fontawesome-solid-arrows-to-dot: icon.

| Setting   | Description   |
|---|---|
| Current Initial View Position | Displays the currently configured initial view position.  |
| New Initial View Position     | Displays the new initial view position that will be applied if Save Changes is pressed.<br>You can manually enter values. |
| Size in Grid Spaces           | Displays the size of the new initial view position in terms of grid spaces.<br>You can manually enter values. |
| Set to Physical Grid Size     | Scales the initial view position to correspond with the physical grid size configured in the [module settings](../moduleSettings/moduleSettings.md).  |
| Set to Player View            | Select a (currently connected) player, the initial view position will be set to their current view.   |
| Snap to Grid                  | Select a corner, that corner will be snapped to the nearest grid intersection.    |
| Save Changes                  | Save the new initial view position.   |