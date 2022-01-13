$(document).ready(function(){

	/*************************************************/
	/****************** EVENEMENTS *******************/
	/*************************************************/

	// Clic on title toggle next article
	jQuery("body").on("click", "section h2", function() {
		jQuery("section h2").removeClass("selected");
		jQuery("section article").slideUp(500);
		jQuery(this).addClass('selected');
		jQuery(this).next().slideDown(500);
	});

	// Change input value updates it on header
	jQuery("body").on("change", ".inputEmail", function() {
		var email = jQuery(this).val();
		jQuery(".email").html(email);
	});
	jQuery("body").on("change", ".inputPhone", function() {
		var phone = jQuery(this).val();
		jQuery(".phone").html(phone);
	});

	// Change color value updates website color
	jQuery("body").on("change", ".inputColor1", function() {
		var color = jQuery(this).val();
		jQuery("header").css("border-color", color);
	});
	jQuery("body").on("change", ".inputColor2", function() {
		var color = jQuery(this).val();
		jQuery("body").css("background-color", color);
	});

	// Clic on selectable li select it and update header list
	jQuery("body").on("click", ".selectable li", function() {
		jQuery(this).toggleClass('selected');
		var qualities = jQuery(this).parent().html();
		jQuery(".qualities").html(qualities);
	});

	// Add new quality
	jQuery("body").on("change", ".inputQuality", function() {
		var quality = jQuery(this).val();
		jQuery(this).prev().append("<li>" + quality + "</li>");
	});







	// jQuery(this).css("background-color", "red");
});
