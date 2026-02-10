# Changelog

## [Table of Contents]
- [Unreleased](#unreleased)
- [1.0.0](#100---2026-01-30)
- [2.4.0.mod.34]

## [Unreleased][]
### Added
- Contextual menu: presence of tree items contextual menu (associated to selected tracks) is now configurable. Can be hidden (disabled), shown at the main R. Click menu, as a submenu or only called on demand (to avoid the performance impact when selecting a huge number of tracks). By default is now set to be called on demand.
- Quick-search: added Shift/Ctrl modifiers to perform lookup at any position instead of only the start of strings. Display will show a '*' when feature is used. For ex. '*coltrane'. Note Ctrl + Key combinations are also used for some shortcuts, so these will be processed instead of quick-search.
- Shortcuts: new 'Ctrl + <' shortcut to Invert selection.
- Sources: drag n' drop while using Playback queue source now sends selection to Playback queue if mouse is anywhere but the search box. At search box it performs the standard query search like any other source. Pressing 'Ctrl' will also send the tracks to the front of the playback queue (instead of adding them at the end).
- External integration: added integration with [Timeline-SMP](https://github.com/regorxxx/Timeline-SMP). If Timeline-SMP panels are set to use panel as source, you can directly send tracks to them for statistics purposes. It works the same than panel source mode on Library-Tree-SMP, just by adding the library tree panel name as source.
- External integration: added documentation to settings menu. See [here](https://hydrogenaudio.org/index.php/topic,129076.msg1077214.html#msg1077214).
- Auto-DJ: new 'From live view ' option plays tracks from the entire tree available, being adjusted to any view, search or filter changes on every new track (so it can be tweaked with dynamic filters on real time).
- UI: new quicksetup presets.
- Views: added new default view patterns.
- Readme: added Quick help entry, at settings menu, which will show a popup with the most basic functions of the panel.
### Changed
- Sources: playback queue source now also shows the currently playing track by default. A new setting has been added to toggle this behavior (''Library Source: Playback Queue show now playing' at properties panel). See [here](https://hydrogenaudio.org/index.php/topic,129076.msg1077224.html#msg1077224).
- Statistics: playback queue index statistics now also show the currently playing track, if available. As '▶' or '0'. See [here](https://hydrogenaudio.org/index.php/topic,129076.msg1077224.html#msg1077224).
- Auto-DJ: 'From panel selection' option plays tracks from the tree selection at the moment Auto-DJ started, ignoring any further selection  or view changes. There are additional entries to append further tracks at any point.
- Auto-DJ: 'From current view ' option plays tracks from the entire tree available at the moment Auto-DJ started, ignoring any future changes to the tree (view, search or filter changes at a latter point). There are additional entries to append further tracks at any point.
- Auto-DJ: submenu entry is now checked while it's running.
- UI: filter button can now be used  as a Filter | View (on Shift) | Source (on Ctrl) multi-button, showing respective menus.
- UI: cleanup of Quick setup menu.
- Shortcuts: changed 'Ctrl + A' shortcut so it works as a toggle. i.e. Selects All or Selects None.
- Sources: contextual menu while using Playback queue source has been changed to allow easy queue manipulation. Menu entries related to playlist sending have been removed.
- External integration: changed callbacks.
	* 'Library-Tree-SMP: switch source'		-> { window: string[], sourceName: string, sourceIdx: number, sourcePlaylistName: string, sourcePlaylistIdx: number[]|number, sourcePanel: string}
		- sourceName allows alternate names. i.e. Playlist|Playlists|Playlist(s) and Panel|Panels|Panel(s)
		- sourcePlaylistIdx can be a number or array of numbers
		- sourcePanel and sourcePlaylistName allow multiple values, joined with '|'.
		- performance improvements and code cleanup.
- Helpers: support for long paths (>260 chars) in multiple internal file handling functions.
### Removed
### Fixed
- Statistics: bug on original script related to playback queue index statistics when a track was added multiple times to the queue. Queue index was duplicated in such cases. See [here](https://hydrogenaudio.org/index.php/topic,129076.msg1077224.html#msg1077224).
- Drag n' drop: fixed handling for internal drag n' drop in some cases using Playback queue source. See [here](https://hydrogenaudio.org/index.php/topic,129076.msg1076851.html#msg1076851).
- Sources: 'Sources\Select playlist(s)' submenu being disabled when it shouldn't.
- Shortcuts: fixed bug on original script related to usage of 'Ctrl + A' (select All) shortcut crashing the panel while using Playlist sources if 'Behaviour\Mode\Keystroke' was set to 'Send to playlist'. When set to 'Select' it simply didn't work. Now the shortcut works as intended.

## [1.0.0] - 2026-01-30
### Added
- Syntax: added special Library-Tree-SMP syntax docs which can be opened via 'search menu\Help\Library-Tree-SMP syntax'. These docs show all special functions using on views, filter, search box and sorting. Also added a link to this file at the HTML options panel at relevant places; note that your browser may fail opening it due to security settings, but the link may be copied and pasted on any web/file browser. <ins>[new]</ins>
- Auto-DJ: added new Auto-DJ feature which will randomly take tracks from current view and add them to the queue. Note whatever affects the tracks shown on panel will also affect Auto-DJ (filters, search box,...). The algorithm tries to never take the same track 2 times, if possible, and stops whenever playback is manually stopped by user or if no more tracks are found. To fully make use of this feature is recommended to enable the global duplicates removal filter, so tracks with same user-chosen tags are also skipped (for ex. to avoid playing live and studio versions). Additionally, using a dynamic filter based on playback will allow Auto-DJ to keep adding new tracks to the queue based on what was played before, similar to Spotify ('Nowplaying similar' default filter is ideal for this use case); alternatively, a personalized query at the search input box could also help ensuring the listening session is limited to specific dates, genres, etc. <ins>[new]</ins>
- Views: added separators support at views menu. To insert one, a view named 'separator' must be created (the pattern must be anything but empty, like a '.'). [from Library-Tree-v2.4.0.mod.21]
- Views: added new default view patterns: Decade, Genre, Style, Genre tree, Artist initial (asciified values compatible with Japanese and Chinese chars). [from Library-Tree-v2.4.0.mod.21]
- Filters: added separators support at filter menu. To insert one, a filter named 'separator' must be created (the query must be anything but empty, like a '.'). [from Library-Tree-v2.4.0.mod.21]
- Filters: added support for $nowplayingorselected{} TF expressions which uses the focused track as fallback while not playing anything. This allows filters which should work for both playing and selected tracks. [from Library-Tree-v2.4.0.mod.21]
- Filters: added new default filter query expressions like: 'Nowplaying Similar Artists', 'Nowplaying Genre', 'Nowplaying Style',... Similar artist filter needs previous tagging with other scripts like [Infinity-Tools-SMP](github.com/regorxxx/Infinity-Tools-SMP) to get such tag from ListenBrainz or Music Map. [from Library-Tree-v2.4.0.mod.21]
- Filters: added global duplicates removal filter, with customizable TF expressions, which can be applied in top of any View and Filter setting. See [Issue 2](https://github.com/regorxxx/Library-Tree-SMP/issues/2). <ins>[new]</ins>
- Filters: added global show duplicates filter, with customizable TF expressions, which can be applied in top of any View and Filter setting. See [Issue 2](https://github.com/regorxxx/Library-Tree-SMP/issues/2). <ins>[new]</ins>
- Search: added $nowplaying{}, $nowplayingorselected{} and $selected{} support at search input box. They are also updated on playback or selection changes, so they behave exactly the same than 'Filters', but being directly editable on the UI (and applied on top of them). Note this feature has a great performance impact if used (compared to filters); is preferable to directly use a Filter pattern than permanently using the search box with a dynamic expression, since its much faster. Obviously this warning only applies to $selected{} and $nowplayingorselected{} expressions during normal usage (since selection will change a lot), and it can be ignored for any other expression. It will not have any performance impact if you don't use the extended TF expressions at all. The behaviour can be switched at 'Search' tab (HTML options panel) or 'Search Auto-refresh TF Expressions' (properties panel). [from Library-Tree-v2.4.0.mod.21]
- Search: added RegExp support at search input box. They must be written in /[expression]/[flags] form, where flags can be any of 'gimsuyt'. Tags used for lookup are those present on the current View TF expression, ignoring those related to track and disc number; on folder view, paths are used instead. RegExps and queries can not be mixed. [from Library-Tree-v2.4.0.mod.21]
- Search: added non-official flag 't' to search RegExp support (see above), which will apply transliteration to tag values before matching. Transliteration supports Cyrillic, Greek and Japanese (Katakana and Hiragana), like quick-search and sorting. Note it only works for RegExp because standard searches uses queries, so they are directly processed by foobar2000. [from Library-Tree-v2.4.0.mod.33]
- Search: drag n' drop tooltip over search box text is now modified according to action being used, indicating if query will be joined or replaced and the tags used. Note multi-value tag and inter-tracks operators are not displayed, only inter-tag operator. [from Library-Tree-v2.4.0.mod.21]
- Search: drag n' drop support into search box. Dropping any selection will now perform a search based on file tags (or filenames) and modified by keyboard key pressed, according to your settings. The modifiers can be adjusted with different tags, multi-value tag, inter-tags, inter-tracks and inter-query operators at the HTML options panel (or looking for 'Search Drag n' Drop ... ' at the properties panel). [from Library-Tree-v2.4.0.mod.21]
- Full rework of sorting logic for tree view.  [from Library-Tree-v2.4.0.mod.33]
  - 4 custom sorting methods: 
    * library tree (original): original behaviour of Library Tree (2023 version).
    * library tree (updated): modified behaviour following TT's Georgia Reborn logic.
    * windows (simple): simple method to partially follow Windows behaviour.
    * windows (advanced): advanced logic to mimic Windows behavior in most cases.
  - Sorting methods are applied recursively to entire string, not only to first char.
  - These sorting methods can be applied to views by TF and Folders, with independent settings.
  - Additional setting to apply transliteration of Cyrillic, Greek and Japanese (Katakana and Hiragana) language to Latin script.
  - For library sources, a new setting allows to directly use the sorting provided by foobar2000. This built-in sorting should 100% match Windows behaviour, but it only works for tracked items on library.
  - Can be tweaked at 'Behaviour' tab (HTML options panel) or 'View By Sorting...' and 'View By Folder Sorting...' (properties panel).
- HTML: complete rework of HTML options panel, with new tabs and settings added, help texts, etc. [from Library-Tree-v2.4.0.mod.21]
- HTML: added R. click on links, within HTML options panel, to copy the URL. As a workaround for links always opening within IE. [from Library-Tree-v2.4.0.mod.22]
- HTML: added tooltips to links within HTML options panel. [from Library-Tree-v2.4.0.mod.22]
- Top Tracks: new 'Send top tracks' and 'Add top tracks' contextual menu entries which filter and sort the current selection on panel with customizable expressions. Note this custom filter is totally independent to the view/filter patterns being used on the panel, and is applied on top of them.  [from Library-Tree-v2.4.0.mod.21]
	* Target playlist follows the 'Target playlist for send to playlist' setting (HTML options panel)  or 'Playlist: Send to Current' (properties panel).
	* Send entry replaces all tracks on destination, while Add entry inserts them at the end.
	* Customizable query and TF expressions can be found at 'Behaviour\Top tracks selection' (HTML options panel) or 'Playlist: Top tracks filter' and 'Playlist: Top tracks sorting' (properties panel).
	* Support for $nowplaying{}, $nowplayingorselected{} and $selected{}.
	* By default it uses '%RATING% GREATER 3 OR %FEEDBACK% IS 1 OR %2003_LOVED% IS 1' as filter and '$rand()' as sorting.
- Top tracks: new 'Send top tracks' and 'Add top tracks' mouse actions for Alt + L. Click and M. Click. Available for current and default playlist. [from Library-Tree-v2.4.0.mod.21]
- Top tracks: default action for Alt + L. Click is now 'Send Top tracks to default playlist'. [from Library-Tree-v2.4.0.mod.21]
- Top tracks: sorting TF supports $selected{}, $nowplaying{} and $nowplayingorselected{}. Note the selection points to the previous item selected within foobar2000 before retrieving the new tracks. <ins>[new]</ins>
- Top tracks: sorting TF supports $harmonicsort{}, $harmonicmix{} and $shufflebytags{tagName,sortBias,sortDir}. <ins>[new]</ins>
	* $harmonicsort{bShuffle}: performs sorting by incremental KEY.
	* $harmonicmix{bShuffle}: performs sorting by harmonic mixing rules.
	* $shufflebytags{tagName,sortBias,sortDir}: aplies semi-random patterns, not allowing the same tag 2 times in a row, while not falling into strict intercalation. The sorting bias is used to prefer tracks by specific conditions.
		º 'tagName' can be a single string or a JSON array of strings(i.e. '["ARTIST","ALBUM ARTIST"]')
		º 'sortBias' can only be one string from: playcount, rating, popularity, lastplayed, key, key6acentered, random, none. Or omitted (random used).
		º 'sortDir' can be 1, -1 or omitted (1 used).
	* These 3 functions can be applied on top of any standard TF expressions, being replaced with $not(0) on real time. The special sorting algorithms will then be applied before the standard TF sorting.
	* Execution order: harmonicsort ->  harmonicmix -> shufflebytags -> standard TF
	* Conditional execution can be partially achieved, but note the special sorting functions are evaluated only once (for all tracks).
	* For further info, check the built-in docs in html at 'search menu\Help\Library-Tree-SMP syntax'.
- Playlist sort order: sorting TF supports $selected{}, $nowplaying{} and $nowplayingorselected{}. See above. <ins>[new]</ins>
- Playlist sort order: sorting TF supports $harmonicsort{}, $harmonicmix{} and $shufflebytags{tagName,sortBias,sortDir}. See above. <ins>[new]</ins>
- Statistics: added number of decimals setting for statistics. 1 by default. [from Library-Tree-v2.4.0.mod.21]
- Statistics: added 6 customizable statistics slots, 3 for averaged values and 3 for summed ones. it uses the decimals setting (see above). Slots and labelscan be modified easily at the HTML options panel or at 'Statistics Titleformat Custom-X (sum)' and 'Statistics Titleformat Custom-X (avg)' and 'Statistics Titleformat Custom labels' (properties panel). By default the panel includes custom expressions as example. [from Library-Tree-v2.4.0.mod.21]
- Statistics: added Loved, Hated and Feedback (loved - hated) statistics. Nodes show the sum of loved/hated tracks within their subnodes. [from Library-Tree-v2.4.0.mod.21]
- Contextual menu: new menu entry to show previously played track. [from Library-Tree-v2.4.0.mod.21]
- Contextual menu: new menu entry to show the currently focused item. [from Library-Tree-v2.4.0.mod.21]
- Sources: added multi-playlist source capabilities, being able to select multiple playlists and merge them as source (previously only a single playlist was allowed). Playlist may also be set by GUID instead of name if JS Host allows it. <ins>[new]</ins>
- Sources: added 'Playback Queue' source which displays the current queue (and updates it on real time). It can work in conjunction with any of the view, filter or album art settings. To display the queue with its internal order overriding any sorting by view patterns, a new setting has been added at the views submenu ('Sort by Queue idx'). If enabled, the view pattern is only used for display purposes of every item (but not their sorting). Using 'Statistics\Playback queue' setting may also help using the panel as a queue viewer. Note the queue is limited to 256 items; this is a foobar2000 limitation. If the panel is used to play any queue item, the selection will be sent to the top and any remaining items added after them, before playback starts. Also note clicking stop or playing any other track outside the panel will flush the playback queue (thus clearing the tree), which is also a foobar2000 limitation. <ins>[new]</ins>
- UI: added double click action to scrollbar buttons to jump to top/bottom of the list. [from Library-Tree-v2.4.0.mod.21]
- UI: added double click action to scrollbar current bar position to show now playing item (while playing) or focused item (while stopped). [from Library-Tree-v2.4.0.mod.21]
- UI: added new settings to adjust the portion of the art used (x and width) to draw the background. These 2 settings may be used to split the image and draw an art grid. They can be found as properties ('Image Background x-offset (%)', 'Image Background w-offset (%)') but a new menu entry at quick setup allows to easily set every panel via input popups. It will probably look much better using blur, minimizing minor offset errors due to layout differences. As example, to set a 3-panel grid with artwork filling, they must be set as: x: -66%, w: 0% | x: 34%, w: 34% | x: 66%, w: 0% [from Library-Tree-v2.4.0.mod.21]
- UI: added tooltip over search input box which displays the entire search string (useful for long queries) along the found tracks count. [from Library-Tree-v2.4.0.mod.21]
- UI: added Alt + Up/Down shortcuts and Alt + Home/End shortcuts (equivalent), jump to first/last sibling within the same parent. For ex. to quickly go to the first/last album by same artist. Note it also works on 'Show album art' mode in which case it will simply try to jump to the first/last node within same parent if it was shown as a tree following the View TF pattern in use. Additionally only when selecting a node on first level, it will automatically expand it and select the first/last child. <ins>[new]</ins>
- UI: added tooltip font and style settings for tree and art views at 'Custom' tab (HTML options panel) or 'Custom Font Tooltip' and 'Custom Font Album Art Tooltip' (properties panel). See [Issue 11](https://github.com/regorxxx/Library-Tree-SMP/issues/11) <ins>[new]</ins>
- UI: added setting to switch whether to follow selection image while not playing  or not at 'Display' tab (HTML options panel) or 'Theme Follow Selection Item Image' (properties panel). It's enabled by default, matching original behaviour. See [Issue 1](https://github.com/regorxxx/Library-Tree-SMP/issues/1) <ins>[new]</ins>
- External integration: added external integration via window.NotifyOthers(callback, arg) with other scripts. Window arg property should be an array with desired target panel names. All panels execute the action if it is not provided, otherwise only the matching panels. Note panel notifications only work within the same JS host component (i.e. no SMP <-> JSplitter). Currently available callbacks (name -> arg): <ins>[new]</ins>
	* 'Library-Tree-SMP: new'				-> { window: [string] }, based on current selection within panel
	* 'Library-Tree-SMP: insert'			-> { window: [string] }, based on current selection within panel
	* 'Library-Tree-SMP: add'				-> { window: [string] }, based on current selection within panel
	* 'Library-Tree-SMP: show now playing'	-> { window: [string] }
	* 'Library-Tree-SMP: show handle'		-> { window: [string], handle: FbMetadbHandle }
	* 'Library-Tree-SMP: switch show art'	-> { window: [string] }
	* 'Library-Tree-SMP: show art'		-> { window: [string] }
	* 'Library-Tree-SMP: show tree'		-> { window: [string] }
	* 'Library-Tree-SMP: switch show artists / albums'	-> { window: [string], forceShowArt: boolean }
	* 'Library-Tree-SMP: show artists'		-> { window: [string], forceShowArt: boolean }
	* 'Library-Tree-SMP: show albums'		-> { window: [string], forceShowArt: boolean }
	* 'Library-Tree-SMP: collapse all'		-> { window: [string] }
	* 'Library-Tree-SMP: quicksearch'		-> { window: [string], search: string }
	* 'Library-Tree-SMP: search'		-> { window: [string], search: string }
	* 'Library-Tree-SMP: search clear'			-> { window: [string] }
	* 'Library-Tree-SMP: search focus'			-> { window: [string] }
	* 'Library-Tree-SMP: switch view'		-> { window: [string], viewName: string, viewIdx: number }, viewIdx = -1 for folder view, names follow menu names
	* 'Library-Tree-SMP: switch filter'		-> { window: [string], filterName: string, filterIdx: number }, filterIdx = -1 or 0 for no filter, names follow menu names
	* 'Library-Tree-SMP: switch source'		-> { window: [string], sourceName: string, sourceIdx: number, sourcePlaylistName: string, sourcePlaylistIdx: number, sourcePanel: string }, sourceIdx = -1 or 0 for library, sourcePlaylistIdx = -1 for active playlist, names follow menu names
	* 'Library-Tree-SMP: switch art type'	-> { window: [string], artName: string, artIdx: number }, artIdx = -1 or 0 for front art, names follow menu names
	* 'Library-Tree-SMP: switch statistics'	-> { window: [string], statisticsName: string, statisticsIdx: number }, statisticsIdx = -1 or 0 for default stats (usually # tracks), names follow menu names and can be matched by entire label (all), user label only or 'custom-X (...)' labels (custom entries only)
- Debug: added profiling logging for library loading. Enabled by default, can be tweaked at 'Advanced' tab within HTML options panel. [from Library-Tree-v2.4.0.mod.21]
- Debug: Added alerts to HTML options panel in case an input box or checkbox doesn't match the associated property. This is a non-functional change which will help debugging possible errors like the ones fixed at top. [from Library-Tree-v2.4.0.mod.24]
- Debug: Added custom alert function with object parsing for variables, contrary to alert(). <ins>[new]</ins>
### Changed
- Multi-panel: for facets mode (panel source), now every panel sends updates to other panels when being refreshed. i.e. there is no need to set multiple sources, only the most immediate parent's name, since the entire chain will be updated if needed; for ex. for a Genre|Artist|Album 3-panel layout (Album would use Artist as source, and Artist uses Genre). Multiple sources should only be needed if they are fully independent sources; for ex. 2 Artists trees with different filter views in an Artist1|Artist2|Album layout (Album would use Artist1|Artist2 as sources). A new property has been added to disable this behavior, if desired ('Library Source: Chained source notifications'), thus requiring an active selection on a panel to send it to immediate child panels (instead of automatic refreshing the entire chain). [from Library-Tree-v2.4.0.mod.21]
- Multi-panel: for facets mode (panel source), if chained source notifications is enabled and more than one source is set, the different sources are merged and deduplicated, instead of replaced by the last one selected. This way is now possible to merge selections from different panels, even with total different views, for ex. selecting one artist in one panel and all Rock tracks at other panel. The destination panel will sort and display the selection according to the panel settings (not following any source sorting). [from Library-Tree-v2.4.0.mod.21]
- Multi-panel: removed unnecessary usage of cache playlists while using Facets mode (panel source). Selection is now sent to other panels on real time and saved to a playlist file at package data folder for loading on startup, without the need of cluttering the UI with a visible playlist. On non supported JS host components, panel notifications as fallback. Should work with any SMP version, one way or another. There is a property to restore original behavior if desired ('Playlist: Prefer internal cache (if supported)'). [from Library-Tree-v2.4.0.mod.21]
- Views: changed default view patterns to create branches for multi-value artist tags and also swap prefixes. i.e. The Rolling Stones -> Rolling Stones, The [from Library-Tree-v2.4.0.mod.21]
- Views: changed default view patterns to split/sort albums with different %COMMENT% or %MUSICBRAINZ_ALBUMID% (if the first doesn't exist). Previously multiple versions of the same album were just joined together, which was undesirable. Now proper tagging may fix it. [from Library-Tree-v2.4.0.mod.21]
- Views: changed default view Date pattern to only use the year part of the tag (intended usage). This should only affect people who put full dates on %DATE% tag. [from Library-Tree-v2.4.0.mod.21]
- Views: changed default prefixes to Strip or Swap setting to 'A|An|The|Las|Los|Les|La|El|Le|Lo|Au|Aux|Il|I|L\'|Gli|Una|Uno|Une|Unas|Unos|Unes|Der|Das|Die|Al|Ar|Ul|Ur|Els|Uns|Des|O|Os|As|Um|Uma|Uns|Umas'. <ins>[new]</ins>
- Filters: all default filter presets using $nowplaying{} have been tweaked to use $nowplayingorselected{} instead, so they always work with selection as fallback. [from Library-Tree-v2.4.0.mod.21]
- Filters: changed default filter query expressions to be compatible with foo_playcount, foo_enhanced_playcount, foo_playcount_2003 and foo_truepeak. [from Library-Tree-v2.4.0.mod.21]
- Filters: changed default filter query expressions to be compatible with multi-valued tags (like Nowplaying Artist). [from Library-Tree-v2.4.0.mod.21]
- Quick-search: changed the way quick-search works for non ASCII characters, similar to foobar2000 asymmetric search where 'á' or 'a' are equivalent when pressing 'a' key. As result, jumping by letter across the panel will not skip anymore words starting with accents, etc. Additionally, there is internal transliteration between Greek, Cyrilic and Japanese (Katakana and Hiragana) to roman letters, so 'Σ' or 'σ' are also matched with 's', 'п' to 'p', etc. [from Library-Tree-v2.4.0.mod.21] and [from Library-Tree-v2.4.0.mod.33]
- Selection: changed behavior when sending items to playlist; now items are also selected on the destination playlist. This ensures other panels/scripts tracking selection changes work properly with Library-Tree-SMP. A new setting has been added in case the legacy behavior is desired at 'Behaviour\Playlist selection behaviour' (HTML options panel) or 'Playlist: Select added items' (properties panel). [from Library-Tree-v2.4.0.mod.21]
- UI: panel uses DPI setting exposed by JS host if available, instead of using windows registry. This will probably be irrelevant for most users except those using Wine. [from Library-Tree-v2.4.0.mod.21]
- UI: button tooltip text font name and size uses by default the same values than all my scripts (https://regorxxx.github.io/foobar2000-SMP.github.io/), which can be found on an auto-generated file at '[foobar profile]\js_data\presets\global\globFonts.json'. People already using any of my other scripts will have such file already present. If you wish to change the font used, check that file. The base size is also set at that file, but further adjusted by DPI and your custom scale within the panel. <ins>[new]</ins>
- UI: with the above change, button tooltip text size is now 1 point smaller by default and uses Tahoma font instead (it can be customized anyway). <ins>[new]</ins>
- UI: cleanup of search history menu. Added RegExp reference. [from Library-Tree-v2.4.0.mod.21]
- Performance: filters and search expressions using $selected{}, etc. are now only checked to associated changes, instead of playback or selection triggering a check to all of them. [from Library-Tree-v2.4.0.mod.21]
- Performance: improvements retrieving items from library, playlist or panel source. Previously it always retrieved all and then the selected one was chosen, now only the selected one is computed. In most cases the library is the biggest one, so it may only be noticeable when using the other sources on huge libraries. It should also reduce peak memory usage. [from Library-Tree-v2.4.0.mod.21]
- Performance: huge improvements when changing any library item tag (for example %RATING%) while using any kind of statistics. Previously to refresh them a panel sorting was triggered, which could easily take more than 1 second for large libraries, therefore blocking the entire UI on every tag change. Now statistics are entirely recalculated instead, which takes less time. <ins>[new]</ins>
- HTML: minor improvements and cleanup at HTML options panel. [from Library-Tree-v2.4.0.mod.21]
- HTML: minor fixes to HTML options panel. In some cases initial values after opening the window were not properly updated on original script or checkboxes were enabled when they shouldn't. [from Library-Tree-v2.4.0.mod.21]
- HTML: updated help text at HTML options panel to reflect the new changes. <ins>[new]</ins>
- Playlist viewer: default associated playlist to panel selection is now named 'Library Viewer Selection' to match DUI and CUI album list panels default setting. Note it can be changed at the options panel if desired. [from Library-Tree-v2.4.0.mod.21]
- Playlist viewer: avoids creating the default playlist if it's not used by current action. Not considered a bug since it seems to be a deliberate design decision on original script. A new setting has been added at 'Behaviour\Playlist' (HTML options panel) and 'Playlist: Default Create always' (properties panel) to tweak it. By default is now false. See [issue 5](https://github.com/regorxxx/Library-Tree-SMP/issues/5) <ins>[new]</ins>
- Console: now supports any kind of object parsing using [Console-SMP](https://github.com/regorxxx/Console-SMP). <ins>[new]</ins>
- Most settings pointing to tags or queries now use the same default values than all my scripts (https://regorxxx.github.io/foobar2000-SMP.github.io/), which can be found on an auto-generated file at '[foobar profile]\js_data\presets\global\globTags.json' and '[foobar profile]\js_data\presets\global\globQuery.json'. People already using any of my other scripts will have such file already present. If you wish to default tags used on first panel installations, check that file. They also apply when the panel properties are reset. <ins>[new]</ins>
- Changed how built-in icons paths are handled, using relative paths. [from Library-Tree-v2.4.0.mod.21]
- Internal changes (for future development). Changed file structure. [from Library-Tree-v2.4.0.mod.21]
- Code cleanup and performance improvements if panel is disabled or during startup. <ins>[new]</ins>
- Simplified and unified code at multiple places, replacing hardcoding with easier to maintain alternatives (and less prone to bugs). Multiple console warnings have also been set when errors are found. [from Library-Tree-v2.4.0.mod.21]
- Moved all licenses to 'assets\licenses'. [from Library-Tree-v2.4.0.mod.28]
### Removed
- Removed code on original script related to 'UserInterface.id.local' references which was never set, used nor called. [from Library-Tree-v2.4.0.mod.22]
- Removed license popup on first installations. [from Library-Tree-v2.4.0.mod.28]
### Fixed
- Views: fixed logic, on original script, related to View sorting identification. It now find matches for %YEAR%, %DATE% and %ALBUM% (case insensitive), instead of only matching lowercase values, ensuring it works with default and user-added TF patterns. [from Library-Tree-v2.4.0.mod.33]
- Quick-Search: fixed quick-search not working when looking for a word whose first letter is the same than currently focused one. i.e. can't look for "bad ..." when you are at "b". Now advancing works only when you press the key on rapid succession, otherwise does quick-search. [from Library-Tree-v2.4.0.mod.21]
- Search: fixed search history not being updated immediately when pressing Enter, but waiting 3 seconds before adding the new expression (so later changes affected or even skipped saving it). Any other kind of search still uses the delay as originally intended. [from Library-Tree-v2.4.0.mod.21]
- Search: fixed bug, on original script. related to sorting while any search is active using 'View by Folder Structure'. If library items were added or moved, new items would appear at the top of the list and/or with sorting reversed. See [Issue 3](https://github.com/regorxxx/Library-Tree-SMP/issues/3). <ins>[new]</ins>
- Sorting: fix sorting under View By Folder Structure, fixing errors found at [jimmywan's fix ](https://github.com/Wil-B/Library-Tree/pull/3) and TT's fix. [from Library-Tree-v2.4.0.mod.33]
- Fixed crashes due to division by zero and NaN indexes at some points of the code. For ex. clicking on panel with no items being shown on album art mode. See [here](https://hydrogenaudio.org/index.php/topic,111060.msg1072121.html#msg1072121). [from Library-Tree-v2.4.0.mod.21]
- Fixed multiple bugs on automatic group handling for default view patterns and cases where a default group was not found. See [here](https://hydrogenaudio.org/index.php/topic,111060.msg1072121.html#msg1072121). [from Library-Tree-v2.4.0.mod.21]
- Fixed bug on original script related to throttle helper. [from Library-Tree-v2.4.0.mod.22]
- Fixed bug on older foobar versions (v1.6.x) and newer SMP/JSplitter releases during playback. [from Library-Tree-v2.4.0.mod.22]
- HTML: Fixed bug on original script within HTML options panel on dropdown layout when opening help boxes. Now they are placed relative to the buttons which open them. Also fixed global overflow problems. [from Library-Tree-v2.4.0.mod.23]
- HTML: fixed bug with high DPI settings on HTML message popup. See [here](https://hydrogenaudio.org/index.php/topic,111060.msg1072346.html#msg1072346). [from Library-Tree-v2.4.0.mod.22]
- HTML: fixed multiple bugs, on original script, related to pressing 'Reset all' on HTML options panel, which broke a lot of settings only fixed on panel reload. [from Library-Tree-v2.4.0.mod.26]
- HTML: fixed bug, on original script, related to pressing 'Reset page' at 'Album Art' tab on HTML options panel, which broke a lot of settings if pressing apply afterwards. There was some misplaced code related to 'Behaviour' tab, which broke the rest of the tab logic. [from Library-Tree-v2.4.0.mod.24]
- HTML: fixed bug, on original script, related to pressing 'Reset page' at 'Album Art' tab on HTML options panel, which applied the image index instead of the icon for art stub lists. [from Library-Tree-v2.4.0.mod.25]
- HTML: fixed bug, on original script, related to pressing 'Reset page' at 'Behaviour' tab on HTML options panel, with  some default values never being applied and others being applied to wrong keys. [from Library-Tree-v2.4.0.mod.25]
- HTML: fixed text errors at 'Reset all' button popup, on original script,  on HTML options panel. [from Library-Tree-v2.4.0.mod.25]
- HTML: fixed bug, on original script, related to pressing 'Reset all' on HTML options panel, which did not reset custom Views and Filters added. [from Library-Tree-v2.4.0.mod.27]
- HTML: fixed bug on original script within HTML options panel on dropdown layout when opening help boxes. Now they are placed relative to the buttons which open them. Also fixed global overflow problems on every element, substituting previous hacks with proper CSS formatting. [from Library-Tree-v2.4.0.mod.28]
- HTML: fixed bug, on original script, related to Playlist sort setting changes not being applied without a panel reload. [from Library-Tree-v2.4.0.mod.29]
- HTML: fixed checkboxes behaviour, on original script, at HTML options panel. [from Library-Tree-v2.4.0.mod.29]
- HTML: fixed bug, on original script, related to 'Prefixes to Strip or Swap (| Separator)' setting not being applied without a panel reload. [from Library-Tree-v2.4.0.mod.30]
- HTML: fixed bug, on original script, when changing currently in use view or filter TF pattern and any other setting afterwards. When the first condition is met, the panel is reloaded after clicking the apply button and the HTML options panel is no longer a valid instance. As workaround, after panel reloading, the HTML options panel is automatically closed and reopened at the same page. This allows further settings editing without errors. [from Library-Tree-v2.4.0.mod.32]
- UI: fixed bug, on original script, related to SMP resizing artifacts of Album Art and Artist images, resulting on grey borders in some cases. [from Library-Tree-v2.4.0.mod.34]
- UI: fixed bug, on original script, related to circular mask producing artifacts in some cases. [from Library-Tree-v2.4.0.mod.34]
- Assets: fixed multiple inconsistencies, artifacts, size errors, etc. on no artist, no cover and root images used on original script. File sizes has also been greatly improved which could result on performance improvements in some cases. [from Library-Tree-v2.4.0.mod.34]
- Statistics: some statistics were not being updated unless the entire view was updated on library item tag changes. For example %RATING% if current view TF did not include such tag, but rating statistics was used. Old value was being shown instead. <ins>[new]</ins>

[Unreleased]: ../../compare/v1.0.0...HEAD
[1.0.0]: ../../compare/ffc967f5...v1.0.0
[2.4.0.mod.34]: ../../compare/f2d83e13...ffc967f5