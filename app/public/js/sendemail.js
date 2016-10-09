function sendByEmail() {
	$('.modal-sendbyemail .alert.alert-success').hide();
	$('.modal-sendbyemail .alert.alert-danger' ).hide();
	$('.modal-sendbyemail .alert.alert-info' ).show("fast", function() {
		$.ajax({
			'async': false,
			url: "/sendemail",
			dataType: "json",
			method: "POST",
			data: $('#sendbyemail').serializeArray().reduce(function(obj, item) {
				obj[item.name] = item.value;
				return obj;
			}, {})
		}).done(function( err ) {
			console.log("done");
			var stocazzo = err;
			console.log(err);
			$('.modal-sendbyemail .alert.alert-info' ).hide("fast");
			if (err) {
				$('.modal-sendbyemail .alert.alert-danger' ).show("fast");
				$('.modal-sendbyemail .alert-danger .alert-body').html(err);

			} else {
				$('.modal-sendbyemail .alert.alert-success').show("fast");
				$('.modal-sendbyemail .alert-success .alert-body').html("Messagge sent");
			}
		}).fail(function( jqXHR, msg ) {
			console.log("fail");
			console.log(msg);
			$('.modal-sendbyemail .alert.alert-success').show("fast");
			$('.modal-sendbyemail .alert-danger .alert-body').html(msg);
		});
	});

}
