var validators;
$(document).ready(function(){
	validators = new Validators();
	$('#client').ajaxForm({
		beforeSubmit : validateForm,
		success	: function(responseText, status, xhr, $form){
			//if (status == 'success') window.location.href = '/clients';
		},
		error : function(e){
            showModalError('Login Failure', 'Please check client data');
		}
	}); 
})

function validateForm(formData, jqForm, options) { 
    var form = $(jqForm[0]).formParams();
    console.log(form);
	if (!validators.validateStringLength(form.name, 3, 50)){
		showModalError('Whoops!', 'Please enter a valid client');
	} else if (!validators.validateStringLength(form.vat_number, 11, 11)){
		showModalError('Whoops!', 'Please enter a valid VAT number');
		return false;
	} else if (!validators.validateStringLength(form.fiscal_code, 11, 11)){
		showModalError('Whoops!', 'Please enter a valid Fiscal code');
		return false;
	} else if (!validators.validateStringLength(form.address.street, 3, 255)){
		showModalError('Whoops!', 'Please enter a valid Street');
		return false;
	} else if (!validators.validateStringLength(form.address.zipcode, 3, 11)){
		showModalError('Whoops!', 'Please enter a valid ZIP code');
		return false;
	} else if (!validators.validateStringLength(form.address.city, 2, 11)){
		showModalError('Whoops!', 'Please enter a valid City');
		return false;
	} else if (!validators.validateStringLength(form.address.country, 3, 11)){
		showModalError('Whoops!', 'Please enter a valid Country');
		return false;
	} else {
		return true;
	}
}
