$(document).ready(function(){
//==============================================================================





/*==============================================================================
	jQuery events
==============================================================================*/

	// Ajax polling every 60s
	window.setInterval(sendAjax, 60000, "ajaxPage.php");

	// Ajax on keyup : input login
	jQuery("body").on("keyup", "input[name='login']", function(key) {
		var login = jQuery(this).val();
		if (key.which == 13) {
			alert("Vous avez appuyé sur ENTREE : login=" + login);
		}
		sendAjax("ajaxPage.php", {login: login});
	});





/*==============================================================================
	AJAX functions
==============================================================================*/


	// General function sending JSON data to server
	function sendAjax(serverUrl, jsonData) {
		serializedData = JSON.stringify(jsonData);
		jQuery.ajax({type: 'POST', url: serverUrl, dataType: 'json', data: "data=" + serializedData,
			success: function(data) {
				displayAjax(data);
			}
		});
	}



	// --- General function displaying JSON data from server
	// Syntax from server : [{target:".htmlClass", html:"html"}, {target:"htmlElement", html:"html", insert:"append"}, {action:"reloadPage"}]
	function displayAjax(data) {
		for (var val of data) {
			// Insert data into HTML (insert or replace)
			if (defined(val.target) && defined(val.html)) {
				if (val.insert == "prepend") {
					jQuery(val.target).prepend(val.html);
				} else if (val.insert == "append") {
					jQuery(val.target).append(val.html);
				} else {
					jQuery(val.target).html(val.html);
				}
			}

			// Update CSS property
			else if (defined(val.target) && defined(val.cssKey) && defined(val.cssVal)) {
				jQuery(val.target).css(val.cssKey, val.cssVal);
			}

			// Update CSS class
			else if (defined(val.target) && (defined(val.addClass) || defined(val.removeClass)) ) {
				jQuery(val.target).addClass(val.addClass).removeClass(val.removeClass);
			}

			// Reload page
			else if (val.action == "reloadPage") {
				location.reload();
			}
		}
	}



	// --- Test whether a variable is defined or not
	function defined(myVar) {
		if (typeof myVar != 'undefined') return true;
		return false;
	}

//==============================================================================
});
