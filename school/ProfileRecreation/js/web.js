$(document).ready(function(){
//==============================================================================

console.log("test\ntest");



/*==============================================================================
	jQuery events
==============================================================================*/

	// Change wrapper and <li> color on wrapper dblclick
	// jQuery("body").on("dblclick", ".wrapper", function() {
	// 	jQuery(this).css("background-color", "white");
	// 	jQuery("li").css("background-color", "yellow");
	// });

	jQuery("body").on("click", "h2", function() {
		jQuery('section h2').next().slideUp(1000);
		jQuery("section h2").removeClass('selected');
		jQuery(this).addClass('selected');
		jQuery(this).next().slideDown(1000);
		console.log('clicked');
	});

	jQuery("body").on("change", "#qualite", function() {
		if (jQuery(this).val() != '')
			jQuery(this).parent().before('<li>'+jQuery(this).val()+'</li>');
		jQuery(this).val('');
		console.log('new quality');
	});

	jQuery("body").on("change", '#sideColor', function() {
		jQuery("header").css('border-color', jQuery(this).val());
	});

	jQuery("body").on("change", "#bgColor", function() {
		jQuery("body").css('background-color', jQuery(this).val());
	});

//==============================================================================
});
