/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*jshint unused: vars*/

(function() {
	var XML_ADDRESS = "http://boeheim.duckdns.org/status/soc.txt",
	XML_METHOD = "GET",
	MSG_ERR_NODATA = "No PV power status available.",
	MSG_ERR_NOTCONNECTED = "Connection aborted. Check your internet connection.",
	NUM_MAX_NEWS = 5,
	NUM_MAX_LENGTH_SUBJECT = 64,
	arrayData = [],
	TFT_WHITE = "#ffffff",
	TFT_DARKGREY = "#222222",
	lengthNews = 0;

	
	/**
	 * Removes all child of the element.
	 * @private
	 * @param {Object} elm - The object to be emptied
	 * @return {Object} The emptied element
	 */
	function emptyElement(elm) {
		while (elm.firstChild) {
			elm.removeChild(elm.firstChild);
		}

		return elm;
	}

	/**
	 * Handles the hardware key events.
	 * @private
	 * @param {Object} event - The object contains data of key event
	 */
	function keyEventHandler(event) {
		if (event.keyName === "back") {
			try {
				tizen.application.getCurrentApplication().exit();
			} catch (ignore) {}
		}
	}

	/**
	 * Adds a text node with specific class to an element.
	 * @private
	 * @param {Object} objElm - The target element to be added the text
	 * @param {string} textClass - The class to be applied to the text
	 * @param {string} textContent - The text string to add
	 */
	function addTextElement(objElm, textClass, textContent) {
		var newElm = document.createElement("p");

		newElm.className = textClass;
		newElm.appendChild(document.createTextNode(textContent));
		objElm.appendChild(newElm);
	}

	/**
	 * Cuts the text by length and put ellipsis marks at the end if needed.
	 * @private
	 * @param {string} text - The original string to be cut
	 * @param {number} maxLength - The maximum length of the string
	 */
	function trimText(text, maxLength) {
		var trimmedString;

		if (text.length > maxLength) {
			trimmedString = text.substring(0, maxLength - 3) + "...";
		} else {
			trimmedString = text;
		}
		return trimmedString;
	}

	
	
	
	function drawPowerLinks()
	{
		if (arrayData.length < 4) {
			return;
		}
		//Battery usage animation
		var fbattuse = parseFloat(arrayData[4]);
		var linkbatt = document.getElementById("linkbatt");
		if (fbattuse < -0.1 || fbattuse > 0.1) {
			linkbatt.style.display = "block";
		} else {
			linkbatt.style.display = "none";
		}
			

		//Grid usage animation
		var fgrid = parseFloat(arrayData[3]);
		var linkgrid = document.getElementById("linkgrid");
		if (fgrid < -0.1 || fgrid > 0.1) {
			linkgrid.style.display = "block";
		} else {
			linkgrid.style.display = "none";
		}

		//PV usage animation
		var fpv = parseFloat(arrayData[1]);
		var linkgrid = document.getElementById("linkgrid");
		if (fpv < -0.1 || fpv > 0.1) {
			linkpv.style.display = "block";
		} else {
			linkpv.style.display = "none";
		}

		//house consumer usage animation
		var fuse = parseFloat(arrayData[2]);
		var linkuse = document.getElementById("linkuse");
		if (fuse < -0.1 || fuse > 0.1) {
			linkuse.style.display = "block";
		} else {
			linkuse.style.display = "none";
		}

	}


	/**
	 * Displays a news and page number of the selected index.
	 * @private
	 */
	function showNews() {
		var soc  = document.getElementById("soc");
		emptyElement(soc);
		addTextElement(soc, "subject", arrayData[0]+"%");
		var pv  = document.getElementById("pv");
		emptyElement(pv);
		addTextElement(pv, "subject", arrayData[1]+"kW");
		var use  = document.getElementById("use");
		emptyElement(use);
		addTextElement(use, "subject", arrayData[2]+"kW");
		var grid  = document.getElementById("grid");
		emptyElement(grid);
		addTextElement(grid, "subject", arrayData[3]+"kW");
		var battuse  = document.getElementById("battuse");
		emptyElement(battuse);
		addTextElement(battuse, "subject", arrayData[4]+"kW");
		var battfill  = document.getElementById("battfill");
		battfill.style.height = Math.round((parseFloat(arrayData[0]) / 100.0) * 70.0) + "px";


	}





	/**
	 * Reads data from internet by XMLHttpRequest, and store received data to the local array.
	 * @private
	 */
	function getDataFromXML() {
		var objNews = document.getElementById("soc");
		var xmlhttp = new XMLHttpRequest();
		var txtDoc;
		var i;

		lengthNews = 0;
		emptyElement(objNews);
		console.log("Getting Data...");

		xmlhttp.open(XML_METHOD, XML_ADDRESS, false);
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
				console.log("Fetch result: "+xmlhttp.responseText);
				var result = xmlhttp.responseText.split('\n');
				if (result.length >4) {
					arrayData = result;
					showNews();
					drawPowerLinks();
				}
				xmlhttp = null;
			} else {
				addTextElement(objNews, "subject", MSG_ERR_NOTCONNECTED);
			}
		};

		xmlhttp.send();
		getHistogram("pv", 60, 20);
		getHistogram("use", 215, 185);
		getHistogram("grid", 215, 20);
		getHistogram("battsoc", 60, 185);
	}

	function clearHistogram(name){
		var toremove = document.getElementById("histogram_"+name);
		if (toremove) {
			toremove.parentNode.removeChild(toremove);
		}
		
	}
	function drawHistogram(data, name, xpos, ypos, minvalue) {
		var outerdiv = document.createElement('div');
		outerdiv.id = "histogram_"+name;
		outerdiv.style.position = "absolute";
		outerdiv.style.top = ypos+50 + "px" ;
		outerdiv.style.left = xpos+"px";
		outerdiv.style.height = 51 + "px";
		outerdiv.style.width = (data.length - 40 + 1)+"px";
		outerdiv.style.backgroundColor="#222222";
		if (name != "battsoc") {
			var maxvalue = 1;
			for (var i=40; i< data.length; i++) {
				if (data[i]> maxvalue)
					maxvalue = data[i];
			}
			if (maxvalue < minvalue) 
				maxvalue = minvalue;
		} else {
			maxvalue = 100;
			minvalue = 1;
		}
		for (var i=40; i< data.length; i++) {
			var innerdiv = document.createElement('div');
			innerdiv.style.position = "absolute";
			innerdiv.style.bottom = "0px";
			innerdiv.style.left = i-40+"px";
			innerdiv.style.height = parseInt(parseFloat(data[i]) / parseFloat(maxvalue) * 50.0)+"px";
			innerdiv.style.width = "1px";
			innerdiv.style.z_index = "4";
			if (name == "use")
				innerdiv.style.backgroundColor = "#00ff00";
			else if (name == "pv")
				innerdiv.style.backgroundColor = "#ffff00";
			else if (name == "grid")
				innerdiv.style.backgroundColor = "#ff0000";
			else
				innerdiv.style.backgroundColor = "#2233ff";
			outerdiv.appendChild(innerdiv);
		}
		document.getElementsByTagName('body')[0].appendChild(outerdiv);
		
	}
	
	function getHistogram(type, xpos, ypos) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open(XML_METHOD, "http://boeheim.duckdns.org/status/last"+type+".txt", false);
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
				var result = xmlhttp.responseText.split('\n');
				if (result.length >4) {
					clearHistogram(type);
					drawHistogram(result, type, xpos, ypos);
				}
				xmlhttp = null;
			}
		};

		xmlhttp.send();
	}


	var dataFetchTimer = false;
	
	/**
	 * Initiates the application.
	 * @private
	 */
	function init() {
		getDataFromXML();
		dataFetchTimer = setInterval(getDataFromXML, 60000);
		document.addEventListener('visibilitychange', handleVisibilityChange);
	}

	function handleVisibilityChange(){
		if (document.visibilityState === 'hidden') {
			console.log("Page is now hidden.");
			if (dataFetchTimer !== false) {
				clearInterval(dataFetchTimer);
				dataFetchTimer = false;
			}
		} else {
			console.log("Page is now visible.");
			getDataFromXML();
			if (dataFetchTimer === false)
				dataFetchTimer = setInterval(getDataFromXML, 60000);
		}
	}
	
	window.onload = init;
	
}());