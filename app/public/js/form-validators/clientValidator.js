
function ClientValidator(){

// bind a simple alert window to this controller to display any errors //

	this.loginErrors = $('.modal-alert');
	this.loginErrors.modal({ show : false, keyboard : true, backdrop : true });

	this.showLoginError = function(t, m)
	{
		$('.modal-alert .modal-header h3').text(t);
		$('.modal-alert .modal-body p').text(m);
		this.loginErrors.modal('show');
	}

}

ClientValidator.prototype.validateForm = function()
{
	console.log("ciao");
	if ($('#cliente_new').val() == ''){
		this.showLoginError('Whoops!', 'Please enter a valid cliente');
		return false;
	}	/*else if (!controlIVA()){
		this.showLoginError('Whoops!', 'Please enter a valid IVA');
		return false;
	}	else if (!controlCF()){
		this.showLoginError('Whoops!', 'Please enter a valid codice fiscale');
		return false;
	}	*/else if ($('#indirizzo').val() == ''){
		this.showLoginError('Whoops!', 'Please enter a valid indirizzo');
		return false;
	}	/*else if (!controlCAP()){
		this.showLoginError('Whoops!', 'Please enter a valid CAP');
		return false;
	}	*/else if ($('#citta').val() == ''){
		this.showLoginError('Whoops!', 'Please enter a valid città');
		return false;
	}	else{
		return true;
	}
}