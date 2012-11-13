
$(document).ready(function(){
	
	var lv = new ClientValidator();
	var lc = new ClientController();
	
})

function checkForm(formData){
	if ($('#cliente_new').val() == ''){
	console.log("ciao");
		showLoginError('Whoops!', 'Please enter a valid cliente');
		return false;
	}	/*else if (!controlIVA()){
		showLoginError('Whoops!', 'Please enter a valid IVA');
		return false;
	}	else if (!controlCF()){
		showLoginError('Whoops!', 'Please enter a valid codice fiscale');
		return false;
	}	*/else if ($('#indirizzo').val() == ''){
		showLoginError('Whoops!', 'Please enter a valid indirizzo');
		return false;
	}	/*else if (!controlCAP()){
		showLoginError('Whoops!', 'Please enter a valid CAP');
		return false;
	}	*/else if ($('#citta').val() == ''){
		showLoginError('Whoops!', 'Please enter a valid città');
		return false;
	}	else{
		return true;
	}
}
	function showLoginError(t, m)
	{
		$('.modal-alert .modal-header h3').text(t);
		$('.modal-alert .modal-body p').text(m);
		$('.modal-alert').modal('show');
	}
