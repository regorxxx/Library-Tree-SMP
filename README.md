# Library-Tree-SMP
[![version][version_badge]][changelog]
[![CodeFactor][codefactor_badge]](https://www.codefactor.io/repository/github/regorxxx/Library-Tree-SMP/overview/main)
[![CodacyBadge][codacy_badge]](https://www.codacy.com/gh/regorxxx/Library-Tree-SMP/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=regorxxx/Library-Tree-SMP&amp;utm_campaign=Badge_Grade)
![GitHub](https://img.shields.io/github/license/regorxxx/Library-Tree-SMP)  
Feature rich library viewer and browser for [foobar2000](https://www.foobar2000.org) and [Spider Monkey Panel](https://theqwertiest.github.io/foo_spider_monkey_panel)/[JSplitter](https://foobar2000.ru/forum/viewtopic.php?t=6378). Improved version of the original Library Tree, which tons of new features, performance optimizations and fixes.

> [!TIP]
> This version can be installed over old Library Tree, without requiring any special action. Just update to the new package and it will keep using previous settings. 

## FEATURES
- Tree viewer
- Album / Artist art browser + Flow mode
- Single / Multiple panel modes + Facets
- Statistics
- Library and multi-playlists sources
- Auto-DJ
- Top Tracks
- Duplicates handling and filtering
- Mode presets
     - Browser: keep playing playlist
     - Player: play without a playlist
     - Default: choice of all actions

### Screenshots

#### Two panel mode with artist images and covers
<kbd> <img src="https://user-images.githubusercontent.com/35600752/155884212-9bea1326-3430-46a4-a86e-3bc4b09e4dd4.png"> </kbd>
The screenshot is using the dark theme and columns UI with dividing splitter hidden. Left pane: quick setup: artist photos (labels right). Right pane: quick setup: album covers (labels bottom)

#### Flow mode (upper) and tree modes (lower)
<kbd> <img src="https://user-images.githubusercontent.com/35600752/155903327-9631a328-2f67-4f25-9cbd-316e5f5210b5.png"> </kbd>
Tree modes shows various node styles with, left to right: user interface theme; dark theme; blend theme; album art background

#### Two panel mode with alphabet index and covers
<kbd> <img src="https://user-images.githubusercontent.com/35600752/156163852-5d8295f4-3ff2-4ef4-849f-0bd5ce24ba8e.png"> </kbd>
To set up the above, position two Spider Monkey Panels side by side. Add library tree to each. The screenshot is using the dark theme (display tab) and columns UI with the dividing splitter hidden.
- Right panel: set source to panel & follow instructions on pop-up
- Left panel: on display tab, tick 'List view (tree)'. Use a view pattern something like: 
```
$cut(%artist%,1)|%artist%|$if2(%album%,εXtra)|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%
```

#### Dark mode colours (left and right) + album art background (middle)
<kbd> <img src="https://user-images.githubusercontent.com/35600752/188288519-e8056889-9dd0-409d-bbfc-feb6026d0eac.png"> </kbd>
- LEFT: Quick setup: covers (labels right)
- MIDDLE: Tree with jump search and cover as background. Setup: display tab > theme > cover and adjust cover opacity according to taste
- RIGHT: Tree with item durations, item counts and sort menu. Quick setup: ultra modern
- Display of durations can be enabled for any tree or album art view on the display tab

### Credits
- Original Jscript library search (2013): thanhdat1710
- Original JS smooth browser design (2015): Br3tt (aka falstaff)
- Collaborative code effort and inspiration: [TT-ReBORN](https://github.com/TT-ReBORN)
- Original script (2023): [Wil-B](https://github.com/Wil-B)

## Requirements (only one host component required)
 1. [Spider Monkey Panel or JSplitter](../../wiki/SMP-vs-JSplitter-notes): JavaScript host component required to install this. Available in x86 and x64.
 2. [Playback Statistics](https://www.foobar2000.org/components/view/foo_playcount): Some statistics and filters will only work if present.
 3. [Enhanced Playback Statistics](https://www.foobar2000.org/components/view/foo_enhanced_playcount): Some statistics and filters will only work if present.
 4. [Required fonts](https://github.com/regorxxx/foobar2000-assets/tree/main/Fonts): FontAwesome, Segoe UI, Arial Unicode MS

## Installation
See [Wiki](../../wiki/Installation) or the [_INSTALLATION (txt)](../main/_INSTALLATION.txt).
Not properly following the installation instructions will result in scripts not working as intended. Please don't report errors before checking this.

## Support
 1. [Issues tracker](../../issues).
 2. [Hydrogenaudio forum](hydrogenaudio.org/index.php/topic,129076).
 3. [Wiki](../../wiki).

## Nightly releases
Automatic package [built from GitHub](https://nightly.link/regorxxx/Library-Tree-SMP/workflows/build/main/file.zip) (using the latest commit). Unzip 'file.zip' downloaded and load the '\*-SMP-\*-\*-\*-package.zip' inside as package within your JS host component.

[changelog]: CHANGELOG.md
[version_badge]: https://img.shields.io/github/release/regorxxx/Library-Tree-SMP.svg
[codacy_badge]: https://api.codacy.com/project/badge/Grade/e04be28637dd40d99fae7bd92f740677
[codefactor_badge]: https://www.codefactor.io/repository/github/regorxxx/Library-Tree-SMP/badge/main
