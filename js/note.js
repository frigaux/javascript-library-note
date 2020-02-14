var NOTE = NOTE || {
	timeout: [], // [ idTimeout, ...]
	notesOrderedByStartTime: [], // [{"node": ..., "parameters": ..., "nodesCreated": [...]}, ...]
	currentNoteDisplayedIndex: 0, // index in notesOrderedByStartTime
	init: function() {
		// 1 - query all elements with attribute "data-note"
		var elementsQSA = document.querySelectorAll("[data-note]");
		for (var i = 0; i < elementsQSA.length; i++) {
			var elementWithNoteAttribute = elementsQSA[i];
			try {
				var dataNoteAttributeValue = JSON.parse(elementWithNoteAttribute.getAttribute('data-note'));
				NOTE.notesOrderedByStartTime.push({"node": elementWithNoteAttribute, "parameters": dataNoteAttributeValue});
				if (!dataNoteAttributeValue.hasOwnProperty('htmlContent') || !dataNoteAttributeValue.hasOwnProperty('startTime')
					|| !dataNoteAttributeValue.hasOwnProperty('runningTime')) {
					console.log("Paramètres invalides : " + dataNoteAttributeValue);
				}
			}
			catch (e) {
				console.log(elementWithNoteAttribute.getAttribute('data-note'));
				console.log(e);
			}
		}
		// 2 - sort array in order to display notes step by step
		NOTE.notesOrderedByStartTime.sort(function (elementA, elementB) {
			var dataNoteAttributeValueA = elementA.parameters;
			var dataNoteAttributeValueB = elementB.parameters;
			if (dataNoteAttributeValueA.startTime > dataNoteAttributeValueB.startTime) {
				return 1;
			}
			if (dataNoteAttributeValueA.startTime < dataNoteAttributeValueB.startTime) {
				return -1;
			}
			return 0;
		});
		// 3 - use setTimeout int order to display notes according to starting and running time
		for (var i = 0; i < NOTE.notesOrderedByStartTime.length; i++) {
			(function (i) {
				var note = NOTE.notesOrderedByStartTime[i];
				try {
					NOTE.timeout.push(window.setTimeout(function() {
						NOTE.displayNote(note, true);
					}, note.parameters.startTime));
				}
				catch (e) {
					console.log(note.getAttribute('data-note'));
					console.log(e);
				}
			}) (i);
		}
		// display navigation buttons
		NOTE.displayNavigationButtons();
	},

	displayNote: function (note, isHideWithTimeout) {
		var nodesCreated = [];
		note.node.style.borderStyle = 'solid';
		note.node.style.borderWidth = '1px';
		note.node.style.borderColor = 'black';
		note.node.style.backgroundColor = 'bisque';
		oSpanArrow = document.createElement('span');
		oSpanArrow.style.position = 'absolute';
		oSpanArrow.style.width = '50px';
		oSpanArrow.style.height = '0px';
		oSpanArrow.style.borderStyle = 'dotted';
		oSpanArrow.style.borderTopWidth = '1px';
		oSpanArrow.style.borderBottomWidth = '0px';
		oSpanArrow.style.borderLeftWidth = '0px';
		oSpanArrow.style.borderRightWidth = '0px';
		oSpanArrow.style.borderColor = 'black';
		oSpanArrow.style.top = note.node.offsetTop + note.node.offsetHeight / 2;
		oSpanArrow.style.left = note.node.offsetLeft + note.node.offsetWidth;
		document.body.appendChild(oSpanArrow);
		nodesCreated.push(oSpanArrow);
		oSpanContent = document.createElement('span');
		oSpanContent.style.position = 'absolute';
		oSpanContent.style.borderStyle = 'solid';
		oSpanContent.style.borderWidth = '1px';
		oSpanContent.style.borderColor = 'black';
		oSpanContent.style.backgroundColor = 'lightskyblue';
		oSpanContent.style.top = note.node.offsetTop;
		oSpanContent.style.left = note.node.offsetLeft + note.node.offsetWidth + 51;
		oSpanContent.innerHTML = note.parameters.htmlContent;
		document.body.appendChild(oSpanContent);
		nodesCreated.push(oSpanContent);
		note['nodesCreated'] = nodesCreated;

		if (isHideWithTimeout) {
			NOTE.timeout.push(window.setTimeout(function() {
				NOTE.hideNote(note);
			}, note.parameters.runningTime));
		}
	},

	displayNavigationButtons: function () {
		var oSpanToolbar = document.createElement('span');
		oSpanToolbar.style.position = 'absolute';
		oSpanToolbar.style.borderWidth = '0px';
		oSpanToolbar.style.top = '10px';
		oSpanToolbar.style.left = window.document.body.offsetWidth - 200;
		document.body.appendChild(oSpanToolbar);
		var oButtonDisplayNav = NOTE.displayButton(oSpanToolbar, "Afficher préc/suiv");
		var oButtonPrevious = NOTE.displayButton(oSpanToolbar, "Précédent");
		var oButtonNext = NOTE.displayButton(oSpanToolbar, "Suivant");
		oButtonDisplayNav.addEventListener('click', function() {
			NOTE.cancelTimer();
			NOTE.hideNotes();
			oButtonDisplayNav.style.display = 'none';
			NOTE.currentNoteDisplayedIndex = 0;
			NOTE.displayNotesCurrentStep(NOTE.currentNoteDisplayedIndex);
			NOTE.displayOrNotNavigationButtons(oButtonPrevious, oButtonNext, oButtonDisplayNav);
		});
		oButtonPrevious.addEventListener('click', function() {
			NOTE.hideNotes();
			if (NOTE.currentNoteDisplayedIndex > 0) {
				NOTE.currentNoteDisplayedIndex--;
				while (NOTE.currentNoteDisplayedIndex > 0
				&& NOTE.notesOrderedByStartTime[NOTE.currentNoteDisplayedIndex - 1].parameters.startTime == NOTE.notesOrderedByStartTime[NOTE.currentNoteDisplayedIndex].parameters.startTime) {
					NOTE.currentNoteDisplayedIndex--;
				}
			}
			NOTE.displayNotesCurrentStep(NOTE.currentNoteDisplayedIndex);
			NOTE.displayOrNotNavigationButtons(oButtonPrevious, oButtonNext, oButtonDisplayNav);
		});
		oButtonNext.addEventListener('click', function() {
			NOTE.hideNotes();
			if (NOTE.currentNoteDisplayedIndex < NOTE.notesOrderedByStartTime.length) {
				while (NOTE.currentNoteDisplayedIndex < NOTE.notesOrderedByStartTime.length
				&& NOTE.notesOrderedByStartTime[NOTE.currentNoteDisplayedIndex].parameters.startTime == NOTE.notesOrderedByStartTime[NOTE.currentNoteDisplayedIndex + 1].parameters.startTime) {
					NOTE.currentNoteDisplayedIndex++;
				}
				NOTE.currentNoteDisplayedIndex++;
			}
			NOTE.displayNotesCurrentStep(NOTE.currentNoteDisplayedIndex);
			NOTE.displayOrNotNavigationButtons(oButtonPrevious, oButtonNext, oButtonDisplayNav);
		});
		NOTE.displayOrNotNavigationButtons(oButtonPrevious, oButtonNext, oButtonDisplayNav);
	},

	displayNotesCurrentStep: function (idx) {
		if (idx < NOTE.notesOrderedByStartTime.length) {
			var previousStartTime = NOTE.notesOrderedByStartTime[idx].parameters.startTime;
			while (idx < NOTE.notesOrderedByStartTime.length
			&& previousStartTime == NOTE.notesOrderedByStartTime[idx].parameters.startTime) {
				NOTE.displayNote(NOTE.notesOrderedByStartTime[idx], false);
				previousStartTime = NOTE.notesOrderedByStartTime[idx++].parameters.startTime;
			}
		}
	},

	displayOrNotNavigationButtons: function (oButtonPrevious, oButtonNext, oButtonDisplayNav) {
		if (oButtonDisplayNav.style.display != 'none') {
			oButtonPrevious.style.display = 'none';
			oButtonNext.style.display = 'none';
		}
		else {
			oButtonPrevious.style.display = 'inline-block';
			oButtonNext.style.display = 'inline-block';
		}
		if (NOTE.currentNoteDisplayedIndex <= 0) {
			oButtonPrevious.disabled = true;
		} else {
			oButtonPrevious.disabled = false;
		}
		var end = true;
		var idx = NOTE.currentNoteDisplayedIndex;
		while (idx < NOTE.notesOrderedByStartTime.length - 1) {
			if (NOTE.notesOrderedByStartTime[idx].parameters.startTime != NOTE.notesOrderedByStartTime[idx + 1].parameters.startTime) {
				end = false;
				break;
			}
			idx++;
		}
		if (end) {
			oButtonNext.disabled = true;
		} else {
			oButtonNext.disabled = false;
		}
	},

	hideNotes: function () {
		for (var i = 0; i < NOTE.notesOrderedByStartTime.length; i++) {
			NOTE.hideNote(NOTE.notesOrderedByStartTime[i]);
		}
	},

	cancelTimer: function () {
		for (var i = 0; i < NOTE.timeout.length; i++) {
			window.clearTimeout(NOTE.timeout[i]);
		}
		NOTE.timeout = [];
	},

	displayButton: function (parentElement, innerHTML) {
		var oButton = document.createElement('button');
		oButton.style.fontSize = '1rem';
		oButton.style.marginLeft = '1rem';
		oButton.innerHTML = innerHTML;
		parentElement.appendChild(oButton);
		return oButton;
	},

	hideNote: function (note) {
		if (note.nodesCreated != null) {
			note.node.style.borderWidth = '0px';
			note.node.style.backgroundColor = 'white';
			for (var i = 0; i < note['nodesCreated'].length; i++) {
				var el = note['nodesCreated'][i];
				document.body.removeChild(el);
			}
			note['nodesCreated'] = null;
		}
	}
};
window.addEventListener("load", function(e) {
	NOTE.init();
});
