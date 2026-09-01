'use strict';
//01/09/26

/* exported FileExplorer */

/* global ui:readable, ppt:readable, $:readable, tooltip:readable, panel:readable, explorer:readable, sbar:readable, lib:readable, but:readable, search:readable, pop:readable */
/* global DT_SINGLELINE:readable, DT_NOPREFIX:readable, DT_END_ELLIPSIS:readable, MF_STRING:readable, MF_GRAYED:readable, MF_DISABLED:readable, IDC_ARROW:readable, IDC_APPSTARTING:readable */
/* global tryGetter:readable */
/* global capitalize:readable */
/* global Flag:readable */
/* global fso:readable, _explorer:readable, _deleteFile:readable, _run:readable, _runCmd:readable, parseWinApiError:readable, findRecursiveFile:readable, findRecursiveDirs:readable */
/* global opaqueColor:readable, _gr:readable */
/* global _menu:readable */
/* global Input:readable */

/* exported Panel */

class FileExplorer {
	constructor() {
		this.img = {
			folder: null,
			folderOpen: null,
			folderFav: null,
			folderFavOpen: null,
			file: null,
			musicFile: null,
			textFile: null,
			root: null,
			drive: null,
			cdRom: null,
			ramDisk: null,
			removableDrive: null,
			networkDrive: null,
			favorites: null,
			computer: null,
			plus: null,
			minus: null,
			archiveFile: null,
			vCursor: null
		};
		// Properties
		this.scrollbarW = 16;
		this.sort = true; // Property
		this.showFavorites = true; // Property
		this.showFilesystem = true; // Property
		this.fileType = {
			'mp2': 'music',
			'mp3': 'music',
			'mp4': 'music',
			'm4a': 'music',
			'mpc': 'music',
			'ogg': 'music',
			'flac': 'music',
			'wma': 'music',
			'wav': 'music',
			'ape': 'music',
			'aac': 'music',
			'wv': 'music',
			'2sf': 'music',
			'aa': 'music',
			'ac3': 'music',
			'ac4': 'music',
			'aiff': 'music',
			'dff': 'music',
			'dts': 'music',
			'eac3': 'music',
			'hmi': 'music',
			'la': 'music',
			'lpcm': 'music',
			'minincsf': 'music',
			'ogx': 'music',
			'opus': 'music',
			'ra': 'music',
			'snd': 'music',
			'shn': 'music',
			'spc': 'music',
			'tak': 'music',
			'tta': 'music',
			'vgm': 'music',
			'cue': 'archive',
			'iso': 'archive',
			'zip': 'archive',
			'rar': 'archive',
			'txt': 'text',
			'ini': 'text',
			'json': 'text',
			'nfo': 'text',
			'jpg': 'image',
			'png': 'image'
		};
		this.fileFilters = window.GetProperty('File Explorer: File Type Filter', Object.keys(this.fileType).join(';')).split(';');
		this.calcSize = window.GetProperty('File Explorer: Calculate file/folder size', false);
		this.smpFileMethods = window.GetProperty('File Explorer: JS-Host file parsing methods', false);
		this.font = {
			main: ui.font.main,
			hover: gdi.Font(ui.font.main.Name, ui.font.main.Size, 4)
		};
		this.col = {
			bgSelBottom: opaqueColor(ui.col.bgSel, 50),
			bgSelTop: opaqueColor(ui.col.bgSel, 25),
			bgSelFrame: ui.col.bgSelFrame,
			text: ui.col.text
		};
		this.y = panel.tree.y;
		this.xOffset = 0;
		this.yOffset = 0;
		this.g_drag = false;
		this.c_drag = false;
		this.reset = false;
		this.redrawDrives = false;
		this.root = new FileNode();
		this.treeIndentW = 20;
		this.markerIndentW = 14;
		this.treeLineH = _gr.CalcTextHeight('tfg', this.font.main);
		this.treePadX = 2;
		this.treePadY = 2;
		this.lineCounter = 0;
		this.cLineCounter = 0;
		this.favLabels = [];
		this.favPaths = [];
		this.maxDeltaH = 0;
		this.vCursorW = this.scrollbarW;
		this.vCursorH = 20;;
		this.favNodeIdx = -1;
		this.fileNodeIdx = -1;
	}

	// main Tools
	getType(fType) {
		return this.fileType[fType.toLowerCase()] || 'unknown';
	}

	sortTab(tab2sort) {
		let tab = [];
		let i, j;
		let tmp = new FileNode();
		for (i = 0; i < tab2sort.length; i++) {
			for (j = i; j < tab2sort.length; j++) {
				if (tab2sort[i].label.toUpperCase() > tab2sort[j].label.toUpperCase()) {
					tmp = tab2sort[i];
					tab2sort[i] = tab2sort[j];
					tab2sort[j] = tmp;
				}
			}
			tab.push(tab2sort[i]);
			tab[i].idx = i;
		}
		return tab;
	}

	// Tree Tools
	scanExpanded(gr, node, draw) {
		let i, j;
		if (node !== this.root || ppt.rootNode > 0) {
			if (draw) {
				node.draw(gr, this.yOffset + this.lineCounter * this.treeLineH);
				this.lineCounter++;
			} else {
				node.checkPos(this.yOffset + this.cLineCounter * this.treeLineH);
				this.cLineCounter++;
			}
		}
		if (!node.collapsed) {
			for (i = 0; i < node.child.length; i++) {
				this.scanExpanded(gr, node.child[i], draw);
			}
			for (j = 0; j < node.item.length; j++) {
				if (draw) {
					node.item[j].draw(gr, this.yOffset + this.lineCounter * this.treeLineH);
					this.lineCounter++;
				} else {
					node.item[j].checkPos(this.yOffset + this.cLineCounter * this.treeLineH);
					this.cLineCounter++;
				}
			}
		}
	}

	scanCheckAll(node, event, x, y) {
		let i, j;
		// node action below
		let temp = node.checkMouse(event, x, y);
		if (!node.collapsed) {
			for (i = 0; i < node.child.length; i++) {
				this.scanCheckAll(node.child[i], event, x, y);
			}
			for (j = 0; j < node.item.length; j++) {
				node.item[j].checkMouse(event, x, y);
			}
		}
		return temp;
	}

	resetNodeFocus(node) {
		let i, j;
		node.focus = false;
		for (i = 0; i < node.child.length; i++) {
			this.resetNodeFocus(node.child[i]);
		}
		for (j = 0; j < node.item.length; j++) {
			node.item[j].focus = false;
		}
	}

	collapseAll(node) {
		let i;
		if (node.level > 1) node.collapsed = true;
		for (i = 0; i < node.child.length; i++) {
			this.collapseAll(node.child[i]);
		}
	}

	fillTreeLevel(path, node, recursive) {
		if (this.smpFileMethods) {
			const folders = findRecursiveDirs(path, 0).map((subFolder) => path + subFolder);
			node.childChecked = true;
			for (const folder of folders) {
				// Add new node
				const size = '?';
				const folderName = folder.endsWith('\\') ? folder.split('\\').at(-2) : folder.split('\\').at(-1);
				node.addChild(folderName, folder, { size });
				if (recursive) {
					this.fillTreeLevel(folder, node.child[node.child.length - 1], true);
				}
			}
			// sort folders on label
			if (this.sort && !recursive) node.child = this.sortTab(node.child);
			// checking for files in the current folder
			const files = findRecursiveFile('*.*', [path], 0);
			const bFilter = this.fileFilters.length > 0;
			for (const file of files) {
				const [, fileName, ext] = utils.SplitFilePath(file);
				if (bFilter) {
					if (this.fileFilters.some((f) => ('.' + f.toLowerCase()) === ext.toLowerCase())) {
						const size = this.calcSize ? utils.FormatFileSize(utils.GetFileSize(file)) : '?';
						node.addItem(fileName + ext, file, { size });
					}
				} else {
					const size = this.calcSize ? utils.FormatFileSize(utils.GetFileSize(file)) : '?';
					node.addItem(fileName + ext, file, { size });
				}
			}
		} else {
			const oFolder = fso.GetFolder(path);
			node.childChecked = true;
			try {
				for (const folder of oFolder.SubFolders) {
					try {
						const attribute = new Flag(folder.Attributes);
						// Add new node
						if (attribute.has(2) || attribute.has(4)) { continue; }
						const size = this.calcSize ? utils.FormatFileSize(tryGetter('Size', folder, '0')()) : '?';
						node.addChild(folder.Name, folder.Path, { size });
						if (recursive) {
							this.fillTreeLevel(folder.Path, node.child[node.child.length - 1], true);
						}
					} catch (e) { console.log(window.ScriptInfo.Name + ': ' + parseWinApiError(e.message)); continue; } // eslint-disable-line no-unused-vars
				}
			} catch (e) { console.log(window.ScriptInfo.Name + ': ' + parseWinApiError(e.message)); } // eslint-disable-line no-unused-vars
			// sort folders on label
			if (this.sort && !recursive) node.child = this.sortTab(node.child);
			// checking for files in the current folder
			const bFilter = this.fileFilters.length > 0;
			try {
				for (const file of oFolder.Files) {
					try {
						const [, fileName, ext] = utils.SplitFilePath(file);
						const attribute = new Flag(file.Attributes);
						// Add new node
						if (attribute.has(2) || attribute.has(4)) { continue; }
						if (bFilter) {
							if (this.fileFilters.some((f) => ('.' + f.toLowerCase()) === ext.toLowerCase())) {
								const size = this.calcSize ? utils.FormatFileSize(tryGetter('Size', file, '0')()) : '?';
								node.addItem(fileName + ext, file.Path, { size });
							}
						} else {
							const size = utils.FormatFileSize(tryGetter('Size', file, '0')());
							node.addItem(fileName + ext, file.Path, { size });
						}
					} catch (e) { console.log(window.ScriptInfo.Name + ': ' + parseWinApiError(e.message)); continue; } // eslint-disable-line no-unused-vars
				}
			} catch (e) { console.log(window.ScriptInfo.Name + ': ' + parseWinApiError(e.message)); } // eslint-disable-line no-unused-vars
		}
		// sort files on label
		if (this.sort && !recursive) node.item = this.sortTab(node.item);
	}

	fillFavorites(node) {
		this.favLabels = window.GetProperty('File Explorer: Fav Labels', '').split(';');
		this.favPaths = window.GetProperty('File Explorer: Fav Paths', '').split(';');
		this.favPaths.forEach((path, i) => {
			node.addChild(this.favLabels[i], path);
			node.child[i].type = 'favorite';
		});
	}

	refreshFavorites() {
		let i = 0;
		this.favLabels = [];
		this.favPaths = [];
		for (const item of this.root.child[this.favNodeIdx].child) {
			item.idx = i;
			this.favLabels.push(item.label);
			this.favPaths.push(item.path);
			i++;
		}
		window.SetProperty('File Explorer: Fav Paths', this.favPaths.join(';'));
		window.SetProperty('File Explorer: Fav Labels', this.favLabels.join(';'));
	}

	fillDrives(node) {
		let drv;
		let e = new Enumerator(fso.Drives);
		for (; !e.atEnd(); e.moveNext()) {
			drv = e.item();
			if ((drv.IsReady || drv.DriveType == 4) && (drv.DriveType != 5)) {
				const letter = drv.DriveLetter.toUpperCase();
				if (!drv.IsReady && drv.DriveType == 4) {
					node.addChild('N/A' + ' (' + letter + ':) ', letter + ':\\');
					node.child[node.child.length - 1].ready = false;
				} else if (drv.IsReady) {
					const free = utils.FormatFileSize(drv.FreeSpace);
					const total = utils.FormatFileSize(drv.TotalSize);
					node.addChild((drv.VolumeName ? drv.VolumeName + ' ' : '') + '(' + letter + ':) ' + free + ' / ' + total, drv.Path + '\\', { size: total });
					node.child[node.child.length - 1].ready = true;
				}
				node.child[node.child.length - 1].type = 'drive';
				node.child[node.child.length - 1].sType = drv.DriveType;
			}
		}
	}

	getPos(y) {
		return (y * -1) / (this.lineCounter * this.treeLineH - ui.h) * (ui.h - this.vCursorH);
	}

	getYoffset(y) {
		return (y * -1) / (ui.h - this.vCursorH) * (this.lineCounter * this.treeLineH - ui.h);
	}

	refreshDrives() {
		let i, node;
		this.redrawDrives = false;
		for (i = 0; i < this.root.child[this.fileNodeIdx].child.length; i++) {
			node = this.root.child[this.fileNodeIdx].child[i];
			// check if drive ready before resuming
			if (node.type == 'drive') {
				try {
					const drive = fso.GetDrive(fso.GetDriveName(node.path));
					if (drive.IsReady) {
						if (!node.ready) this.redrawDrives = true;
						node.ready = true;
						const free = utils.FormatFileSize(drive.FreeSpace);
						const total = utils.FormatFileSize(drive.TotalSize);
						node.label = (drive.VolumeName ? drive.VolumeName + ' ' : '') + '(' + drive.Path + ') ' + free + '/' + total;
						node.data.size = total;
					} else {
						if (node.ready) this.redrawDrives = true;
						node.ready = false;
						node.label = 'N/A' + ' (' + drive.DriveLetter.toUpperCase() + ':) ';
						node.child.splice(0, node.child.length);
						node.item.splice(0, node.item.length);
						node.childChecked = true;
					}
				} catch (e) { // eslint-disable-line no-unused-vars
					this.root.child[this.fileNodeIdx].child.splice(i, 1);
				}
			}
		}
	}

	on_size() {
		this.y = panel.tree.y;
		this.favNodeIdx = -1;
		this.fileNodeIdx = -1;

		if (this.showFavorites) {
			this.favNodeIdx = 0;
			if (this.showFilesystem) {
				this.fileNodeIdx = 1;
			}
		} else {
			if (this.showFilesystem) {
				this.fileNodeIdx = 0;
			}
		}

		// build of all images
		this.setImages();

		if (typeof this.root.label === 'undefined' || this.reset) {
			this.root.init({ label: 'Root', level: 0, idx: 0, type: 'root' });
			this.root.childChecked = true;
			// favorites
			if (this.showFavorites) {
				this.root.addChild('Favorites', '');
				this.root.child[this.favNodeIdx].childChecked = true;
				this.root.child[this.favNodeIdx].type = 'favorites';
				this.fillFavorites(this.root.child[this.favNodeIdx]);
			}
			// drives
			if (this.showFilesystem) {
				this.root.addChild('Computer', '');
				this.root.child[this.fileNodeIdx].childChecked = true;
				this.root.child[this.fileNodeIdx].type = 'computer';
				this.fillDrives(this.root.child[this.fileNodeIdx]);
			}
			//
			this.reset = false;
		}
	}

	on_paint(gr) {
		if (!window.ID) { return; }
		if (!window.Width || !window.Height) { return; }
		if (this.cLineCounter == 0 && !this.c_drag) {
			this.scanExpanded(null, this.root, false);
		}
		this.cLineCounter = 0;
		this.lineCounter = 0;
		this.scanExpanded(gr, this.root, true);
		// vscrollbar
		if (this.lineCounter * this.treeLineH > ui.h) {
			gr.DrawLine(ui.w, 0, ui.w, ui.h, 1, $.RGBA(100, 100, 100, 50));
			gr.DrawImage(this.img.vCursor, ui.w, this.getPos(this.yOffset), this.img.vCursor.Width, this.img.vCursor.Height, 0, 0, this.img.vCursor.Width, this.img.vCursor.Height, 0, this.c_drag ? 255 : 130);
		}
	}

	on_mouse_lbtn_down(x, y) {
		if (this.showFilesystem) this.refreshDrives();
		if (x < ui.w) {
			this.g_drag = true;
			this.scanCheckAll(this.root, 'down', x, y);
		} else {
			if (this.lineCounter * this.treeLineH > ui.h) {
				this.c_drag = true;
				if (y > this.getPos(this.yOffset) && y < this.getPos(this.yOffset) + this.vCursorH) {
					window.RepaintRect(ui.w, this.getPos(this.yOffset), this.vCursorW, this.vCursorH);
				} else {
					this.yOffset = this.y + this.getYoffset(y - this.vCursorH / 2);
					if (this.yOffset > this.y) this.yOffset = this.y;
					if (this.yOffset < (this.y + this.treeLineH * this.lineCounter - ui.h) * -1) this.yOffset = (this.y + this.treeLineH * this.lineCounter - ui.h) * -1;
					window.Repaint();
				}
			} else {
				this.c_drag = false;
				this.yOffset = this.y;
				window.Repaint();
			}
		}
	};

	on_mouse_lbtn_dblclk(x, y) {
		this.scanCheckAll(this.root, 'dblclick', x, y);
	};

	on_mouse_lbtn_up(x, y) {
		this.g_drag = false;
		this.scanCheckAll(this.root, 'up', x, y);
		if (this.c_drag) {
			this.c_drag = false;
			window.RepaintRect(ui.w, this.getPos(this.yOffset), this.vCursorW, this.vCursorH);
		}
	};

	on_mouse_rbtn_down(x, y) {
		// check drives
		if (this.showFilesystem) this.refreshDrives();
		// end.
		return this.scanCheckAll(this.root, 'right', x, y);
	}

	on_mouse_move(x, y) {

		this.scanCheckAll(this.root, 'move', x, y);

		if (this.g_drag) {
			if (x > panel.m.x) {
				this.xOffset += this.treeIndentW;
				if (this.xOffset > 0) this.xOffset = 0;
				window.Repaint();
			} else if (x < panel.m.x) {
				this.xOffset -= this.treeIndentW;
				if (this.xOffset < this.maxDeltaH * -1) {
					this.xOffset = this.maxDeltaH * -1;
				}
				window.Repaint();
			}
		}

		if (this.c_drag) {
			this.yOffset = this.y + this.getYoffset(y - this.vCursorH / 2);
			if (this.yOffset > this.y) this.yOffset = this.y;
			if (this.yOffset < (this.y + this.treeLineH * this.lineCounter - ui.h) * -1) this.yOffset = (this.y + this.treeLineH * this.lineCounter - ui.h) * -1;
			window.Repaint();
		}

		if (this.yOffset < (this.y + this.treeLineH * this.lineCounter - ui.h) * -1) {
			this.yOffset = (this.y + this.treeLineH * this.lineCounter - ui.h) * -1;
			if (this.yOffset > this.y) this.yOffset = this.y;
			window.Repaint();
		}
	}

	on_mouse_wheel(step) {
		if (step > 0) {
			this.yOffset += this.treeLineH * 2;
			if (this.yOffset > this.y) this.yOffset = this.y;
		} else if (this.treeLineH * this.lineCounter > ui.h - this.treePadY) {
			this.yOffset -= this.treeLineH * 2;
			if (this.yOffset < (this.y + this.treeLineH * this.lineCounter - ui.h) * -1) this.yOffset = (this.y + this.treeLineH * this.lineCounter - ui.h) * -1;
		}
		window.Repaint();
	}

	on_mouse_leave() {
		this.scanCheckAll(this.root, 'leave', 0, 0);
		window.Repaint();
	}

	setImages() {
		let gb;

		this.img.plus = gdi.CreateImage(11, 11);
		gb = this.img.plus.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillGradRect(0, 0, 8, 8, 90, $.RGB(240, 240, 240), $.RGB(160, 170, 180));
		gb.DrawRoundRect(0, 0, 8, 8, 1, 1, 1, $.RGB(160, 160, 160));
		gb.SetSmoothingMode(0);
		gb.FillSolidRect(4, 2, 1, 5, $.RGB(0, 0, 0));
		gb.FillSolidRect(2, 4, 5, 1, $.RGB(0, 0, 0));
		this.img.plus.ReleaseGraphics(gb);

		this.img.minus = gdi.CreateImage(11, 11);
		gb = this.img.minus.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillGradRect(0, 0, 8, 8, 90, $.RGB(240, 240, 240), $.RGB(160, 170, 180));
		gb.DrawRoundRect(0, 0, 8, 8, 1, 1, 1, $.RGB(160, 160, 160));
		gb.SetSmoothingMode(0);
		gb.FillSolidRect(2, 4, 5, 1, $.RGB(0, 0, 0));
		this.img.minus.ReleaseGraphics(gb);

		this.img.favorites = gdi.CreateImage(25, 21);
		gb = this.img.favorites.GetGraphics();
		gb.SetSmoothingMode(2);
		let star_points = [2, 5, 7, 5, 9, 0, 11, 5, 16, 5, 12, 8, 14, 13, 9, 10, 4, 13, 6, 8];
		gb.FillPolygon($.RGB(240, 240, 120), 0, star_points);
		gb.DrawPolygon($.RGB(150, 150, 80), 0, star_points);
		this.img.favorites.ReleaseGraphics(gb);

		this.img.folder = gdi.CreateImage(20, 16);
		gb = this.img.folder.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillGradRect(1, 1, 15, 11, 90, $.RGB(240, 240, 110), $.RGB(200, 200, 80));
		gb.DrawRoundRect(1, 1, 15, 11, 1, 1, 1, $.RGB(160, 160, 70));
		gb.FillRoundRect(1, 0, 5, 4, 1, 1, $.RGB(200, 200, 80));
		gb.DrawRoundRect(1, 0, 5, 4, 1, 1, 1, $.RGB(160, 160, 60));
		gb.FillGradRect(2, 2, 13, 9, 90, $.RGB(240, 240, 110), $.RGB(200, 200, 80));
		gb.SetSmoothingMode(0);
		gb.FillGradRect(2, 2, 13, 9, 90, $.RGB(240, 240, 110), $.RGB(200, 200, 80));
		this.img.folder.ReleaseGraphics(gb);

		this.img.folderOpen = gdi.CreateImage(20, 16);
		gb = this.img.folderOpen.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillGradRect(1, 1, 15, 11, 90, $.RGB(160, 160, 110), $.RGB(200, 200, 80));
		gb.DrawRoundRect(1, 1, 15, 11, 1, 1, 1, $.RGB(160, 160, 70));
		gb.FillRoundRect(1, 0, 5, 4, 1, 1, $.RGB(160, 160, 90));
		gb.DrawRoundRect(1, 0, 5, 4, 1, 1, 1, $.RGB(160, 160, 60));
		gb.FillGradRect(4, 4, 13, 6, 90, $.RGB(240, 240, 110), $.RGB(190, 190, 80));
		gb.SetSmoothingMode(0);
		gb.FillGradRect(4, 4, 13, 6, 90, $.RGB(240, 240, 110), $.RGB(190, 190, 80));
		this.img.folderOpen.ReleaseGraphics(gb);

		const star = gdi.CreateImage(25, 21);
		gb = star.GetGraphics();
		gb.SetSmoothingMode(2);
		const starPoints = [2, 5, 7, 5, 9, 0, 11, 5, 16, 5, 12, 8, 14, 13, 9, 10, 4, 13, 6, 8];
		gb.FillPolygon($.RGB(170, 170, 80), 0, starPoints);
		gb.DrawPolygon($.RGB(140, 140, 70), 0, starPoints);
		star.ReleaseGraphics(gb);

		this.img.folderFav = gdi.CreateImage(20, 16);
		gb = this.img.folderFav.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillGradRect(1, 1, 15, 11, 90, $.RGB(240, 240, 110), $.RGB(200, 200, 80));
		gb.DrawRoundRect(1, 1, 15, 11, 1, 1, 1, $.RGB(160, 160, 70));
		gb.FillRoundRect(1, 0, 5, 4, 1, 1, $.RGB(240, 240, 80));
		gb.DrawRoundRect(1, 0, 5, 4, 1, 1, 1, $.RGB(160, 160, 60));
		gb.FillGradRect(2, 2, 13, 9, 90, $.RGB(240, 240, 110), $.RGB(200, 200, 80));
		gb.SetSmoothingMode(0);
		gb.FillGradRect(2, 2, 13, 9, 90, $.RGB(240, 240, 110), $.RGB(200, 200, 80));
		gb.DrawImage(star, 4, 3, star.Width - 11, star.Height - 10, 0, 0, star.Width, star.Height, 0, 255);
		this.img.folderFav.ReleaseGraphics(gb);

		this.img.folderFavOpen = gdi.CreateImage(20, 16);
		gb = this.img.folderFavOpen.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillGradRect(1, 1, 15, 11, 90, $.RGB(160, 160, 110), $.RGB(200, 200, 80));
		gb.DrawRoundRect(1, 1, 15, 11, 1, 1, 1, $.RGB(160, 160, 70));
		gb.FillRoundRect(1, 0, 5, 4, 1, 1, $.RGB(160, 160, 90));
		gb.DrawRoundRect(1, 0, 5, 4, 1, 1, 1, $.RGB(160, 160, 60));
		gb.FillGradRect(4, 4, 13, 6, 90, $.RGB(240, 240, 110), $.RGB(190, 190, 80));
		gb.SetSmoothingMode(0);
		gb.FillGradRect(4, 4, 13, 6, 90, $.RGB(240, 240, 110), $.RGB(190, 190, 80));
		gb.DrawImage(star, 5, 5, star.Width - 12, star.Height - 13, 0, 0, star.Width, star.Height, 0, 255);
		this.img.folderFavOpen.ReleaseGraphics(gb);

		this.img.file = gdi.CreateImage(20, 16);
		gb = this.img.file.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillRoundRect(3, 0, 12, 13, 1, 1, $.RGB(190, 220, 250));
		gb.DrawRoundRect(3, 0, 12, 13, 1, 1, 1, $.RGB(150, 180, 220));
		this.img.file.ReleaseGraphics(gb);

		this.img.archiveFile = gdi.CreateImage(20, 16);
		gb = this.img.archiveFile.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillRoundRect(3, 1, 5, 5, 1, 1, $.RGB(190, 220, 250));
		gb.DrawRoundRect(3, 1, 5, 5, 1, 1, 1, $.RGB(150, 180, 220));
		gb.FillRoundRect(10, 1, 5, 5, 1, 1, $.RGB(190, 220, 250));
		gb.DrawRoundRect(10, 1, 5, 5, 1, 1, 1, $.RGB(150, 180, 220));
		gb.FillRoundRect(3, 8, 5, 5, 1, 1, $.RGB(190, 220, 250));
		gb.DrawRoundRect(3, 8, 5, 5, 1, 1, 1, $.RGB(150, 180, 220));
		gb.FillRoundRect(10, 8, 5, 5, 1, 1, $.RGB(190, 220, 250));
		gb.DrawRoundRect(10, 8, 5, 5, 1, 1, 1, $.RGB(150, 180, 220));
		this.img.archiveFile.ReleaseGraphics(gb);

		this.img.musicFile = gdi.CreateImage(20, 16);
		gb = this.img.musicFile.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillRoundRect(3, 0, 12, 13, 1, 1, $.RGB(220, 240, 250));
		gb.DrawRoundRect(3, 0, 12, 13, 1, 1, 1, $.RGB(150, 180, 220));
		gb.FillEllipse(5, 7, 6, 5, $.RGB(150, 180, 220));
		gb.DrawLine(10, 2, 11, 10, 1, $.RGB(150, 180, 220));
		gb.DrawLine(10, 2, 12, 3, 1, $.RGB(150, 180, 220));
		this.img.musicFile.ReleaseGraphics(gb);

		this.img.textFile = gdi.CreateImage(20, 16);
		gb = this.img.textFile.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillRoundRect(3, 0, 12, 13, 1, 1, $.RGB(190, 220, 250));
		gb.DrawRoundRect(3, 0, 12, 13, 1, 1, 1, $.RGB(150, 180, 220));
		gb.SetSmoothingMode(0);
		gb.FillSolidRect(6, 4, 7, 1, $.RGB(150, 150, 150));
		gb.FillSolidRect(6, 6, 7, 1, $.RGB(150, 150, 150));
		gb.FillSolidRect(6, 8, 7, 1, $.RGB(150, 150, 150));
		gb.FillSolidRect(6, 10, 7, 1, $.RGB(150, 150, 150));
		this.img.textFile.ReleaseGraphics(gb);

		this.img.imageFile = gdi.CreateImage(20, 16);
		gb = this.img.imageFile.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillRoundRect(3, 0, 12, 13, 1, 1, $.RGB(190, 220, 250));
		gb.DrawRoundRect(3, 0, 12, 13, 1, 1, 1, $.RGB(150, 180, 220));
		gb.SetSmoothingMode(0);
		gb.FillSolidRect(6, 4, 7, 7, $.RGB(250, 250, 250));
		gb.FillSolidRect(7, 5, 5, 5, $.RGB(150, 220, 150));
		this.img.imageFile.ReleaseGraphics(gb);

		this.img.root = gdi.CreateImage(20, 16);
		gb = this.img.root.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillRoundRect(2, 3, 14, 10, 1, 1, $.RGB(190, 220, 250));
		gb.DrawRoundRect(2, 3, 14, 10, 1, 1, 1, $.RGB(150, 180, 220));
		gb.FillEllipse(2, 1, 14, 5, $.RGB(190, 220, 250));
		gb.FillEllipse(2, 10, 14, 5, $.RGB(190, 220, 250));
		gb.DrawEllipse(2, 1, 14, 5, 1, $.RGB(150, 180, 220));
		gb.DrawEllipse(2, 10, 14, 5, 1, $.RGB(150, 180, 220));
		gb.FillEllipse(2, 9, 14, 5, $.RGB(190, 220, 250));
		this.img.root.ReleaseGraphics(gb);

		this.img.computer = gdi.CreateImage(20, 16);
		gb = this.img.computer.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillRoundRect(2, 1, 14, 12, 1, 1, $.RGB(190, 220, 250));
		gb.DrawRoundRect(2, 1, 14, 12, 1, 1, 1, $.RGB(150, 180, 220));
		gb.SetSmoothingMode(0);
		gb.FillRoundRect(4, 3, 10, 6, 1, 1, $.RGB(130, 170, 200));
		gb.DrawRect(4, 3, 10, 6, 1, $.RGB(120, 140, 180));
		this.img.computer.ReleaseGraphics(gb);

		this.img.drive = gdi.CreateImage(20, 16);
		gb = this.img.drive.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillGradRect(2, 5, 14, 7, 45, $.RGB(200, 200, 200), $.RGB(150, 150, 150));
		gb.DrawRoundRect(2, 5, 14, 7, 1, 1, 1, $.RGB(130, 130, 130));
		gb.SetSmoothingMode(0);
		gb.FillSolidRect(4, 7, 4, 2, $.RGB(100, 225, 100));
		gb.DrawRect(4, 7, 4, 2, 1, $.RGB(50, 125, 50));
		gb.FillSolidRect(12, 7, 4, 1, $.RGB(130, 130, 130));
		gb.FillSolidRect(12, 9, 4, 1, $.RGB(130, 130, 130));
		this.img.drive.ReleaseGraphics(gb);

		this.img.ramDiskDrive = gdi.CreateImage(20, 16);
		gb = this.img.ramDiskDrive.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillGradRect(2, 5, 14, 7, 45, $.RGB(200, 200, 200), $.RGB(150, 150, 150));
		gb.DrawRoundRect(2, 5, 14, 7, 1, 1, 1, $.RGB(130, 130, 130));
		this.img.ramDiskDrive.ReleaseGraphics(gb);

		this.img.removableDrive = gdi.CreateImage(20, 16);
		gb = this.img.removableDrive.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillGradRect(2, 5, 14, 7, 45, $.RGB(200, 200, 200), $.RGB(150, 150, 150));
		gb.DrawRoundRect(2, 5, 14, 7, 1, 1, 1, $.RGB(130, 130, 130));
		gb.SetSmoothingMode(0);
		gb.FillSolidRect(7, 6, 1, 6, $.RGB(200, 200, 200));
		gb.FillSolidRect(6, 6, 1, 6, $.RGB(130, 130, 130));
		this.img.removableDrive.ReleaseGraphics(gb);

		this.img.cdRomDrive = gdi.CreateImage(20, 16);
		gb = this.img.cdRomDrive.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillGradRect(2, 5, 14, 7, 45, $.RGB(200, 200, 200), $.RGB(150, 150, 150));
		gb.DrawRoundRect(2, 5, 14, 7, 1, 1, 1, $.RGB(130, 130, 130));
		gb.FillEllipse(4, 1, 12, 12, $.RGBA(0, 0, 0, 120));
		gb.FillEllipse(5, 0, 12, 12, $.RGB(200, 230, 250));
		gb.DrawEllipse(5, 0, 12, 12, 1, $.RGB(130, 130, 130));
		gb.DrawEllipse(8, 3, 6, 6, 1, $.RGB(160, 160, 160));
		gb.FillEllipse(10, 5, 2, 2, $.RGB(20, 20, 20));
		this.img.cdRomDrive.ReleaseGraphics(gb);

		this.img.networkDrive = gdi.CreateImage(20, 16);
		gb = this.img.networkDrive.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillGradRect(2, 5, 14, 7, 45, $.RGB(200, 200, 200), $.RGB(150, 150, 150));
		gb.DrawRoundRect(2, 5, 14, 7, 1, 1, 1, $.RGB(130, 130, 130));
		gb.SetSmoothingMode(0);
		gb.FillSolidRect(4, 7, 4, 2, $.RGB(100, 225, 100));
		gb.DrawRect(4, 7, 4, 2, 1, $.RGB(50, 125, 50));
		gb.FillSolidRect(12, 7, 4, 1, $.RGB(130, 130, 130));
		gb.FillSolidRect(12, 9, 4, 1, $.RGB(130, 130, 130));
		gb.SetSmoothingMode(2);
		gb.FillEllipse(4, 2, 10, 8, $.RGBA(0, 0, 0, 120));
		gb.FillEllipse(5, 0, 8, 8, $.RGB(190, 220, 250));
		gb.DrawEllipse(5, 0, 8, 8, 1, $.RGB(130, 170, 200));
		gb.FillEllipse(4, 3, 4, 4, $.RGB(170, 200, 220));
		gb.FillEllipse(8, 2, 4, 4, $.RGB(240, 250, 255));
		this.img.networkDrive.ReleaseGraphics(gb);

		this.img.vCursor = gdi.CreateImage(this.vCursorW, this.vCursorH);
		gb = this.img.vCursor.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.FillRoundRect(3, 2, this.scrollbarW - 6, 15, 2, 2, $.RGB(160, 190, 220));
		gb.DrawRoundRect(3, 2, this.scrollbarW - 6, 15, 2, 2, 1, $.RGB(120, 150, 190));
		this.img.vCursor.ReleaseGraphics(gb);
	}

	showContextMenu(node, x, y) {
		const menu = new _menu();
		// Helpers
		const sendToPlsAndPlay = (plsIdx, paths) => {
			plman.ClearPlaylist(plsIdx);
			fb.AddLocationsAsyncV2(paths)
				.then((handleList) => {
					plman.InsertPlaylistItems(plsIdx, 0, handleList);
					plman.ExecutePlaylistDefaultAction(plsIdx, 0);
				});
		};
		const refreshPlsNodes = () => {
			if (this.root.child[0].child.length > 0) { this.root.child[0].child.splice(0, this.root.child[0].child.length); }
			this.FillPlaylists(this.root.child[0]);
			this.root.child[0].childChecked = true;
			this.root.child[0].collapsed = false;
			window.Repaint();
		};
		// Menu
		switch (node.type) {
			case 'root':
				menu.newEntry({ entryText: 'Settings:', flags: MF_GRAYED });
				menu.newSeparator();
				menu.newEntry({
					entryText: 'Auto Collapse', func: () => {
						ppt.toggle('autoCollapse');
						this.resetTree();
					}, checkFunc: () => ppt.autoCollapse
				});
				menu.newEntry({
					entryText: 'Sort Folders', func: () => {
						this.sort = !this.sort;
						window.SetProperty('File Explorer: Sort Items', this.sort);
						this.resetTree();
					}, checkFunc: () => this.sort
				});
				menu.newSeparator();
				{
					const menuName = menu.newMenu('Show');
					menu.newEntry({
						menuName,
						entryText: 'Favorites', func: () => {
							this.showFavorites = !this.showFavorites;
							window.SetProperty('File Explorer: Show Favorites', this.showFavorites);
							this.resetTree();
						}, checkFunc: () => this.showFavorites
					});
					menu.newEntry({
						menuName,
						entryText: 'FileSystem', func: () => {
							this.showFilesystem = !this.showFilesystem;
							window.SetProperty('File Explorer: Show Filesystem', this.showFilesystem);
							this.resetTree();
						}, checkFunc: () => this.showFilesystem
					});
				}
				menu.newSeparator();
				{
					const menuName = menu.newMenu('File parsing');
					menu.newEntry({
						menuName,
						entryText: 'Edit file types filter...', func: () => {
							const input = Input.string('string', this.fileFilters.join(';'), 'ex: mp3;ogg (empty=no filter)', 'Change file types to filter', 'mp3;ogg');
							if (input === null) { return; }
							this.fileFilters = (input || '').split(';');
							window.SetProperty('File Explorer: File Type Filter', input);
							this.resetTree();
						}
					});
					menu.newSeparator(menuName);
					menu.newEntry({
						menuName,
						entryText: 'Calculate file/folder size', func: () => {
							this.calcSize = !this.calcSize;
							window.SetProperty('File Explorer: Calculate file/folder size', this.calcSize);
							this.resetTree();
						}, checkFunc: () => this.calcSize
					});
					menu.newEntry({
						menuName,
						entryText: 'JS-Host parsing methods', func: () => {
							this.smpFileMethods = !this.smpFileMethods;
							window.SetProperty('File Explorer: JS-Host file parsing methods', this.smpFileMethods);
							this.resetTree();
						}, checkFunc: () => this.smpFileMethods
					});
				}
				break;
			case 'playlists':
				break;
			case 'playlist':
				menu.newEntry({
					entryText: 'Move Up', func: () => {
						plman.MovePlaylist(node.path, node.path - 1);
						plman.ActivePlaylist = node.path - 1;
						refreshPlsNodes();
					}, flags: (node.path > 0) ? MF_STRING : MF_GRAYED | MF_DISABLED
				});
				menu.newEntry({
					entryText: 'Move Down', func: () => {
						plman.MovePlaylist(node.path, node.path + 1);
						plman.ActivePlaylist = node.path + 1;
						refreshPlsNodes();
					}, flags: (node.path < plman.PlaylistCount - 1) ? MF_STRING : MF_GRAYED | MF_DISABLED
				});
				menu.newSeparator();
				menu.newEntry({
					entryText: 'Rename this playlist...', func: () => {
						let newname = utils.InputBox(0, 'Actual Playlist name: ' + node.label, 'Rename a Playlist', node.label);
						if (typeof newname === 'undefined' || !newname || newname == '') newname = node.label;
						if (newname.length > 1 || (newname.length == 1 && (newname >= 'a' && newname <= 'z') || (newname >= 'A' && newname <= 'Z') || (newname >= '0' && newname <= '9'))) {
							plman.RenamePlaylist(node.path, newname);
							node.label = newname;
							window.Repaint();
						}
					}
				});
				menu.newEntry({
					entryText: 'Delete this playlist...', func: () => {
						plman.RemovePlaylist(node.idx);
						refreshPlsNodes();
					}
				});
				menu.newEntry({
					entryText: 'Save this playlist...', func: () => {
						fb.SavePlaylist();
					}
				});
				menu.newEntry({
					entryText: 'Duplicate this playlist', func: () => {
						plman.DuplicatePlaylist(node.path, 'Copy of ' + node.label);
						plman.ActivePlaylist = node.path + 1;
						refreshPlsNodes();
					}
				});
				menu.newSeparator();
				menu.newEntry({
					entryText: 'Insert a new AutoPlaylist...', func: () => {
						const new_idx = plman.PlaylistCount;
						plman.CreateAutoPlaylist(new_idx, '', '');
						plman.MovePlaylist(new_idx, node.path + 1);
						plman.ActivePlaylist = node.path + 1;
						plman.ShowAutoPlaylistUI(node.path + 1);
						refreshPlsNodes();
					}
				});
				if (plman.IsAutoPlaylist(node.path)) {
					menu.newEntry({
						entryText: 'AutoPlaylist Properties...', func: () => {
							plman.ShowAutoPlaylistUI(node.path);
						}
					});
					menu.newEntry({
						entryText: 'Convert to a normal Playlist', func: () => {
							plman.DuplicatePlaylist(node.path, node.label);
							plman.RemovePlaylist(node.path);
							plman.ActivePlaylist = node.path;
							window.Repaint();
						}
					});
				}
				menu.newSeparator();
				menu.newEntry({
					entryText: 'Insert a new playlist', func: () => {
						const new_idx = plman.PlaylistCount;
						plman.CreatePlaylist(new_idx, '');
						plman.MovePlaylist(new_idx, node.path + 1);
						plman.ActivePlaylist = node.path + 1;
						refreshPlsNodes();
					}
				});
				menu.newEntry({
					entryText: 'Load a playlist...', func: () => {
						fb.LoadPlaylist();
					}
				});
				break;
			case 'favorites':
				menu.newEntry({ entryText: 'Favorites:', flags: MF_GRAYED });
				menu.newSeparator();
				menu.newEntry({
					entryText: 'Edit paths', func: () => {
						const input = Input.string('string', this.favPaths.join(';'), 'Edit paths:\n(separated by ;)', 'Favorite paths', 'B:\\MP3;B:\\FLAC');
						if (input === null) { return; }
						this.favPaths = (input || '').split(';');
						window.SetProperty('File Explorer: Fav Paths', input);
						this.resetTree();
					}
				});
				menu.newEntry({
					entryText: 'Edit labels', func: () => {
						const input = Input.string('string', this.favLabels.join(';'), 'Edit labels:\n(separated by ;)', 'Favorite labels', 'MP3;FLAC');
						if (input === null) { return; }
						this.favPaths = (input || '').split(';');
						window.SetProperty('File Explorer: Fav Labels', input);
						this.resetTree();
					}
				});
				menu.newSeparator();
				menu.newEntry({
					entryText: 'Show Favorites', func: () => {
						this.showFavorites = !this.showFavorites;
						window.SetProperty('File Explorer: Show Favorites', this.showFavorites);
						this.resetTree();
					}, checkFunc: () => this.showFavorites
				});
				break;
			case 'favorite':
				if (node.enabled) {
					menu.newEntry({
						entryText: 'Remove from Favorites', func: () => {
							this.root.child[this.favNodeIdx].child.splice(node.idx, 1);
							this.refreshFavorites();
							window.Repaint();
						}
					});
					menu.newEntry({
						entryText: 'Refresh folder content...', func: () => {
							if (node.child.length > 0) node.child.splice(0, node.child.length);
							if (node.item.length > 0) node.item.splice(0, node.item.length);
							this.fillTreeLevel(node.path, node, false);
							node.childChecked = true;
							node.collapsed = false;
							window.Repaint();
						}
					});
					menu.newSeparator();
					menu.newEntry({
						entryText: 'Add tracks to playlist', func: () => {
							const paths = node.item.filter((item) => item.fType === 'music' || item.fType === 'archive')
								.map((item) => item.path);
							plman.AddLocations(plman.ActivePlaylist, paths);
						}, flags: node.item.length > 0 ? MF_STRING : MF_GRAYED | MF_DISABLED
					});
					menu.newEntry({
						entryText: 'Send tracks to playlist and Play', func: () => {
							const paths = node.item.filter((item) => item.fType === 'music' || item.fType === 'archive')
								.map((item) => item.path);
							sendToPlsAndPlay(plman.ActivePlaylist, paths);
						}, flags: node.item.length > 0 ? MF_STRING : MF_GRAYED | MF_DISABLED
					});
				} else {
					menu.newEntry({
						entryText: 'Dead Link > Remove it from Favorites', func: () => {
							this.root.child[this.favNodeIdx].child.splice(node.idx, 1);
							this.refreshFavorites();
							window.Repaint();
						}
					});
				}
				break;
			case 'computer':
				menu.newEntry({ entryText: 'Filesystem:', flags: MF_GRAYED });
				menu.newSeparator();
				menu.newEntry({
					entryText: 'Refresh content...', func: () => {
						if (node.child.length > 0) node.child.splice(0, node.child.length);
						if (node.item.length > 0) node.item.splice(0, node.item.length);
						this.fillDrives(this.root.child[this.fileNodeIdx]);
						this.root.child[this.fileNodeIdx].childChecked = false;
						this.refreshDrives();
						window.Repaint();
					}
				});
				menu.newSeparator();
				menu.newEntry({
					entryText: 'Show Filesystem', func: () => {
						this.showFilesystem = !this.showFilesystem;
						window.SetProperty('File Explorer: Show Filesystem', this.showFilesystem);
						this.resetTree();
					}, checkFunc: () => this.showFilesystem
				});
				break;
			case 'drive':
			case 'folder':
				if (node.type == 'folder' && this.showFavorites) {
					menu.newEntry({
						entryText: 'Add folder to Favorites', func: () => {
							this.root.child[this.favNodeIdx].addChild(node.label, node.path);
							this.root.child[this.favNodeIdx].child[this.root.child[this.favNodeIdx].child.length - 1].type = 'favorite';
							this.root.child[this.favNodeIdx].collapsed = false;
							this.refreshFavorites();
							window.Repaint();
						}
					});
				}
				menu.newEntry({
					entryText: 'Refresh folder content...', func: () => {
						if (node.child.length > 0) node.child.splice(0, node.child.length);
						if (node.item.length > 0) node.item.splice(0, node.item.length);
						this.fillTreeLevel(node.path, node, false);
						node.childChecked = true;
						node.collapsed = false;
						window.Repaint();
					}
				});
				menu.newEntry({
					entryText: 'Open in Windows Explorer...', func: () => {
						_explorer(node.path);
					}
				});
				menu.newSeparator();
				menu.newEntry({
					entryText: 'Add found tracks to playlist', func: () => {
						const paths = node.item.filter((item) => item.fType === 'music' || item.fType === 'archive')
							.map((item) => item.path);
						plman.AddLocations(plman.ActivePlaylist, paths);
					}, flags: node.item.length > 0 ? MF_STRING : MF_GRAYED | MF_DISABLED
				});
				menu.newEntry({
					entryText: 'Send found tracks to playlist and Play', func: () => {
						const paths = node.item.filter((item) => item.fType === 'music' || item.fType === 'archive')
							.map((item) => item.path);
						sendToPlsAndPlay(plman.ActivePlaylist, paths);
					}, flags: node.item.length > 0 ? MF_STRING : MF_GRAYED | MF_DISABLED
				});
				break;
			case 'file':
				if (node.fType == 'music' || node.fType == 'archive') {
					menu.newEntry({
						entryText: 'Add to playlist', func: () => {
							plman.AddLocations(plman.ActivePlaylist, [node.path]);
						}
					});
					menu.newEntry({
						entryText: 'Send to playlist and Play', func: () => {
							sendToPlsAndPlay(plman.ActivePlaylist, [node.path]);
						}
					});
					menu.newSeparator();
				}
				menu.newEntry({
					entryText: 'Rename file', func: () => {
						let newname = utils.InputBox(0, 'Actual filename: ' + node.label, 'Rename a file', node.label);
						if (typeof (newname) == 'undefined' || !newname || newname == '') {
							newname = node.label;
						} else {
							if (newname.length > 1 || (newname.length == 1 && (newname >= 'a' && newname <= 'z') || (newname >= 'A' && newname <= 'Z') || (newname >= '0' && newname <= '9'))) {
								let i = node.path.length;
								while (i >= 0) {
									if (node.path.charAt(i) == '\\') { break; }
									i--;
								}
								try {
									const newpath = node.path.substring(0, i + 1) + newname;
									fso.MoveFile(node.path, newpath);
									node.path = newpath;
									node.label = newname;
									window.Repaint();
								} catch (e) { // eslint-disable-line no-unused-vars
									$.okCancelPopup('Rename Error', 'Check privileges on this folder or Check string entered: ' + newname, void (0), 'ok'); // Regorxxx <- Native themed popups | Code cleanup ->
								}
							}
						}
					}
				});
				menu.newEntry({
					entryText: 'Delete file', func: () => {
						_deleteFile(node.path);
						const item = this.root.getParent(node).item;
						item.splice(node.idx, 1);
						item.forEach((n, i) => n.idx = i);
						window.Repaint();
					}
				});
				menu.newEntry({
					entryText: 'Open in Windows Explorer...', func: () => {
						_explorer(this.root.getParent(node).path);
					}
				});
				break;
		}
		return menu.btn_up(x, y);
	}

	attachCallbacks() {
		addEventListener('on_size', () => {
			if (panel.isFileExplorerSource()) { this.on_size(); }
		});

		addEventListener('on_paint', (gr) => {
			if (panel.isFileExplorerSource()) {
				if (!window.ID) { return; }
				if (!window.Width || !window.Height) { return; }
				ui.draw(gr);
				ui.drawLine(gr);
				sbar.draw(gr);
				but.setHide(['search', 'scroll', 'filter']);
				but.draw(gr);
				find.draw(gr);
				// Regorxxx <- Fix HTML options panel error on panel reload when changing current library view or filter
				if (lib.initialised && ppt.get('Library Tree Dialog Box Reopen')) {
					ppt.set('Library Tree Dialog Box Reopen', false);
					setTimeout(() => panel.open(), 100);
				}
				// Regorxxx ->
				this.on_paint(gr);
			}
		});

		addEventListener('on_mouse_lbtn_down', (x, y) => {
			if (panel.isFileExplorerSource()) { this.on_mouse_lbtn_down(x, y); }
		});

		addEventListener('on_mouse_lbtn_dblclk', (x, y) => {
			if (panel.isFileExplorerSource()) {
				but.lbtn_dn(x, y);
				if (ppt.searchShow) search.lbtn_dblclk(x, y);
				this.on_mouse_lbtn_dblclk(x, y);
			}
		});

		addEventListener('on_mouse_lbtn_up', (x, y) => {
			if (panel.isFileExplorerSource()) { this.on_mouse_lbtn_up(x, y); }
		});

		addEventListener('on_mouse_rbtn_down', (x, y) => {
			if (panel.isFileExplorerSource()) { this.on_mouse_rbtn_down(x, y); }
		});

		addEventListener('on_mouse_move', (x, y) => {
			if (panel.isFileExplorerSource()) {
				if (panel.m.x == x && panel.m.y == y) { return; }
				pop.hand = false;
				if (ui.style.topBarShow || ppt.sbarShow) but.move(x, y);
				if (ppt.searchShow) search.move(x, y);
				sbar.move(x, y);
				ui.zoomDrag(x, y);
				panel.m.x = x;
				panel.m.y = y;
				this.on_mouse_move(x, y);
			}
		});

		addEventListener('on_mouse_wheel', (step) => {
			if (panel.isFileExplorerSource()) { this.on_mouse_wheel(step); }
		});

		addEventListener('on_mouse_leave', () => {
			if (panel.isFileExplorerSource()) { this.on_mouse_leave(); }
		});
	}

	resetTree() {
		this.root.child.splice(0, this.root.child.length);
		this.reset = true;
		on_size();
		window.Repaint();
	}
}

class FileNode {
	constructor({ label, path, level, idx, pIdx, type, collapsed, pathSum, data = {} } = {}) {
		this.childChecked = false;
		this.label = void (0);
		this.path = '';
		this.level = 0;
		this.idx = -1;
		this.pIdx = -1;
		this.type = '';
		this.enabled = true;
		this.ready = true;
		this.collapsed = false;
		this.child = [];
		this.item = [];
		this.totalChildren = 0;
		this.totalItems = 0;
		this.hover = false;
		this.markerHover = false;
		this.pathSum = [];
		this.data = {};
		this.fType = 'unknown';
		this.init({ label, path, level, idx, pIdx, type, collapsed, pathSum, data });
	}
	init({ label, path = '', level = 0, idx = -1, pIdx = -1, type = '', collapsed = false, pathSum = [], data = {} } = {}) {
		this.label = label;
		this.path = path;
		this.level = level;
		this.idx = idx;
		this.pIdx = pIdx;
		this.type = type;
		this.collapsed = collapsed;
		this.pathSum.length = 0;
		this.data = data || {};
		if (this.level > 0) {
			for (const element of pathSum) { this.pathSum.push(element); }
			this.pathSum.push(pIdx);
		}
	}
	addChild(label, path, data = {}) {
		this.totalChildren++;
		this.child.push(
			new FileNode({
				label, path, level: this.level + 1,
				idx: this.child.length, pIdx: this.idx, type: 'folder',
				collapsed: true, pathSum: this.pathSum,
				data
			})
		);
	};
	addItem(label, path, data = {}) {
		this.totalItems++;
		this.item.push(
			new FileNode({
				label, path, level: this.level + 1,
				idx: this.item.length, pIdx: this.idx, type: 'file',
				collapsed: true, pathSum: this.pathSum,
				data
			})
		);
	}
	checkPos(y) {
		this.Cx = Math.floor(explorer.treePadX + explorer.xOffset + explorer.treeIndentW * (this.level + 1));
		this.Cy = Math.floor(explorer.treePadY + y);
	}
	draw(gr, y) {
		let iconAlpha = 255;
		let labelCol = explorer.col.text;

		this.x = Math.floor(explorer.treePadX + explorer.xOffset + explorer.treeIndentW * (this.level + 1));
		this.y = Math.floor(explorer.treePadY + y);
		this.retroIndentW = explorer.treeIndentW;

		// we don't draw lines not visible
		if (this.y + explorer.treeLineH < 0 || this.y > ui.h) return true;
		if (this.y < explorer.y) { return true; }
		// end.
		let icon;
		switch (this.type) {
			case 'folder':
				icon = this.collapsed ? explorer.img.folder : explorer.img.folderOpen;
				break;
			case 'file': {
				let i;
				for (i = this.label.length; i >= 0; i--) {
					if (this.label.charAt(i) == '.') break;
				}
				this.fType = explorer.getType(this.label.substring(i + 1, this.label.length));
				switch (this.fType) {
					case 'music':
						icon = explorer.img.musicFile; break;
					case 'text':
						icon = explorer.img.textFile; break;
					case 'image':
						icon = explorer.img.imageFile; break;
					case 'archive':
						icon = explorer.img.archiveFile; break;
					default:
						icon = explorer.img.file;
				}
				break;
			}
			case 'favorites':
				icon = explorer.img.favorites;
				break;
			case 'favorite':
				icon = this.collapsed ? explorer.img.folderFav : explorer.img.folderFavOpen;
				if (fso.FolderExists(this.path)) {
					this.enabled = true;
					labelCol = explorer.col.text;
				} else {
					this.enabled = false;
					iconAlpha = 150;
					labelCol = $.RGB(150, 150, 150);
				}
				break;
			case 'computer':
				icon = explorer.img.computer;
				break;
			case 'drive':
				switch (this.sType) {
					case 0: icon = explorer.img.drive; break; // Unknown drive type
					case 1: icon = explorer.img.removableDrive; break; // Removable
					case 2: icon = explorer.img.drive; break; // fixed
					case 3: icon = explorer.img.networkDrive; break; // Network
					case 4: icon = explorer.img.cdRomDrive; break; // CD-ROM
					case 5: icon = explorer.img.drive; break; // RAM Disk
				}
				break;
			default:
				icon = explorer.img.root;
		}
		if (icon) {
			// collapse/expand icon
			if (this.type != 'root' && this.type != 'file') {
				this.retroIndentW += explorer.markerIndentW;
				const marker = this.collapsed ? explorer.img.plus : explorer.img.minus;
				if (!(this.childChecked && this.child.length == 0 && this.item.length == 0)) {
					gr.DrawImage(marker, this.x - explorer.treeIndentW - explorer.markerIndentW, this.y + 2, marker.Width, marker.Height, 0, 0, marker.Width, marker.Height, 0, iconAlpha);
				}
			}
			// type icon
			gr.DrawImage(icon, this.x - 20, this.y, icon.Width, icon.Height, 0, 0, icon.Width, icon.Height, 0, iconAlpha);
		}
		// calc label width and offsets
		this.labelWidth = gr.CalcTextWidth(this.label, explorer.font.main);
		let focusW;
		if (this.labelWidth > ui.w - this.x) {
			focusW = ui.w - this.x - 4;
			// width of the max offset truncated part of label (used to stop horizontal scrolling in mouse.move)
			this.maxDeltaH = Math.max(this.labelWidth - focusW + 4, explorer.maxDeltaH);
		} else {
			focusW = this.labelWidth;
		}
		// Draw focus rect
		if (this.focus) {
			gr.FillGradRect(this.x - 1, this.y - 1, focusW + 2, explorer.treeLineH - 2, 90, explorer.col.bgSelTop, explorer.col.bgSelBottom);
			gr.DrawRoundRect(this.x, this.y, focusW, explorer.treeLineH - 4, 1, 1, 1, explorer.col.bgSelFrame);
			gr.DrawRoundRect(this.x - 1, this.y - 1, focusW + 2, explorer.treeLineH - 2, 1, 1, 1, $.RGBA(0, 30, 100, 50));
		}
		// Draw label
		gr.GdiDrawText(this.label, (this.hover && !this.markerHover && this.type != 'root' ? explorer.font.hover : explorer.font.main), labelCol, this.x, this.y - explorer.treeLineH / 8, ui.w - this.x - 3, explorer.treeLineH, DT_END_ELLIPSIS | DT_SINGLELINE | DT_NOPREFIX);
	}
	checkMouse(event, x, y) {
		let tmpRetroIndentW = this.retroIndentW - explorer.treeIndentW;
		this.markerHover = x <= this.x - this.retroIndentW + tmpRetroIndentW;
		let textAreaW;
		if (this.labelWidth > ui.w - this.x) {
			textAreaW = ui.w - this.x;
		} else {
			textAreaW = this.labelWidth;
		}
		this.hover = x > this.x - this.retroIndentW && x < this.x + textAreaW && y > this.y && y < this.y + explorer.treeLineH;
		switch (event) {
			case 'down':
				if (!this.enabled) {
					this.hover = false;
					return true;
				}
				if (this.hover && !this.markerHover) {
					explorer.resetNodeFocus(explorer.root);
					this.focus = true;
				}

				if (ppt.autoCollapse) {
					if (this.hover && !this.markerHover && this.collapsed) {
						explorer.collapseAll(explorer.root);
						explorer.root.forEachParent(this, (n) => n.collapsed = false);
					}
				}
				if (this.hover) {
					this.held = true;
					switch (this.type) {
						case 'drive':
						case 'folder':
						case 'favorite':
						case 'favorites':
						case 'computer':
							// check if drive ready before resuming
							if (this.type == 'drive') {
								if (!fso.FolderExists(this.path)) {
									window.Repaint();
									return true;
								}
							}
							// ex node cloning: tmp_item = new objClone(this,true);
							if (this.collapsed && !this.childChecked) {
								window.SetCursor(IDC_APPSTARTING);
								explorer.fillTreeLevel(this.path, this, false);
								window.SetCursor(IDC_ARROW);
							}
							this.collapsed = !this.collapsed;

							if (!this.markerHover) {
								if (ppt.autoCollapse) explorer.yOffset = 0;
								explorer.lineCounter = 0;
								explorer.scanExpanded(null, explorer.root, false);
								if (ppt.autoCollapse) {
									if (this.Cy > ui.h - explorer.treeLineH) {
										explorer.yOffset = explorer.yOffset - this.Cy + ui.h / 2;
										if (explorer.yOffset > 0) explorer.yOffset = 0;
									}
								}
							}
							explorer.maxDeltaH = 0;
							window.Repaint();
							break;
						case 'file':
							window.Repaint();
							break;
						case 'root':
							window.Repaint();
							break;
						default:
					}
				} else {
					if (this.redrawDrives) window.Repaint();
				}
				break;
			case 'up':
				if (!this.enabled) return true;
				if (this.held) { this.held = false; }  // actions on mouse up if item held by a mouse down end.
				break;
			case 'move':
				if (!this.enabled) return true;
				if (this.hover && !this.markerHover) {
					let ttText;
					switch (this.type) {
						case 'root':
							ttText = 'R. Click to open settings menu';
							break;
						case 'favorite':
						case 'favorites':
							ttText = 'R. Click to open favorites menu';
							break;
						case 'computer':
							ttText = 'R. Click to open Filesystem menu';
							break;
						default:
							ttText = this.label +
								'\n' +
								'\nPath:\t' + (this.path || '-') +
								'\nType:\t' + capitalize(this.type) + (this.fType === 'unknown' ? '' : ' (' + this.fType + ')') +
								'\nSize:\t' + (this.data.size || '?');
					}
					if (tooltip.Text != ttText) {
						tooltip.Deactivate();
						tooltip.Text = ttText;
					}
					tooltip.Activate();
					if (this.y > explorer.treeLineH * -1 && this.y < ui.h) {
						if (!this.hoverPrec) window.RepaintRect(this.x, Math.floor(this.y), this.labelWidth, explorer.treeLineH);
					}
					this.hoverPrec = true;
				} else {
					if (this.y > explorer.treeLineH * -1 && this.y < ui.h) {
						if (this.hoverPrec) window.RepaintRect(this.x, Math.floor(this.y), this.labelWidth, explorer.treeLineH);
					}
					this.hoverPrec = false;
				}
				break;
			case 'dblclick':
				if (!this.enabled) return true;
				if (this.hover) {
					if (this.type == 'file') {
						switch (this.fType) {
							case 'archive':
							case 'music': {
								plman.AddLocations(plman.ActivePlaylist, [this.path], false);
								break;
							}
							case 'text':
								_run('notepad.exe', this.path);
								break;
							case 'image':
								if (fb.ShowPictureViewer) {
									fb.ShowPictureViewer(this.path);
								} else {
									_run('rundll32.exe', '%windir%\\System32\\shimgvw.dll,ImageView_Fullscreen', this.path);
								}
								break;
							default:
								_runCmd('CMD /C START ' + fso.GetFile(this.path).ShortPath, false, 0);
						}
					} else {
						plman.AddLocations(plman.ActivePlaylist, [this.path], false);
					}
				}
				break;
			case 'leave':
				this.hover = false;
				this.hoverPrec = false;
				break;
			case 'right':
				if (this.hover) {
					explorer.resetNodeFocus(explorer.root);
					explorer.focus = true;
				}
				if (this.hover) {
					switch (this.type) {
						case 'drive':
							if (this.ready) explorer.showContextMenu(this, x, y);
							break;
						default:
							explorer.showContextMenu(this, x, y);
							break;
					}
				}
				return true;
		}
	}
	getParent(node) {
		let parent = this; // NOSONAR
		for (let i = 1; i < node.pathSum.length; i++) {
			parent = parent.child[node.pathSum[i]];
		}
		return parent;
	}
	forEachParent(node, callback) {
		let parent = this; // NOSONAR
		for (let i = 1; i < node.pathSum.length; i++) {
			parent = parent.child[node.pathSum[i]];
			callback(parent);
		}
	}
}