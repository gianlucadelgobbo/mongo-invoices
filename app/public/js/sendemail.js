function sendByEmail() {
	$('.modal-sendbyemail .alert.alert-success').hide();
	$('.modal-sendbyemail .alert.alert-danger' ).hide();
	$('.modal-sendbyemail .alert.alert-info' ).show("fast", function() {
		var data = $('#sendbyemail').serializeArray().reduce(function(obj, item) {
			obj[item.name] = item.value;
			return obj;
		}, {});
		$.ajax({
			'async': false,
			url: "/sendemail",
			dataType: "json",
			method: "POST",
			data: data
		}).done(function( err ) {
			$('.modal-sendbyemail .alert.alert-info' ).hide("fast");
			if (err) {
				$('.modal-sendbyemail .alert.alert-danger' ).show("fast");
				$('.modal-sendbyemail .alert-danger .alert-body').html(err);

			} else {
				$('.modal-sendbyemail .alert.alert-success').show("fast");
				$('.modal-sendbyemail .alert-success .alert-body').html("Messagge sent");
			}
		}).fail(function(msg ) {
			$('.modal-sendbyemail .alert.alert-info' ).hide("fast");
			$('.modal-sendbyemail .alert.alert-danger').show("fast");
			$('.modal-sendbyemail .alert-danger .alert-body').html(msg.responseText);
		});
	});

}
