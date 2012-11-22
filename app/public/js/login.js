var validators;
$(document).ready(function(){
	validators = new Validators();
	
// bind event listeners to button clicks //
	$('#login-form #forgot-password').click(function(){ $('#get-credentials').modal('show');return false;});
	
	$('#login-form').ajaxForm({
		beforeSubmit : validateForm,
		success	: function(responseText, status, xhr, $form){
			if (status == 'success') window.location.href = '/home';
		},
		error : function(e){
            showModalError('Login Failure', 'Please check your username and/or password');
		}
	}); 
	$('#user-tf').focus();
	
// login retrieval form via email //
	$('#get-credentials-form').ajaxForm({
		url: '/lost-password',
		beforeSubmit : function(formData, jqForm, options){
			if (validators.validateEmail($('#email-tf').val())){
				hideEmailAlert();
				return true;
			}	else{
				showEmailAlert("<b> Error!</b> Please enter a valid email address");
				return false;
			}
		},
		success	: function(responseText, status, xhr, $form){
			showEmailSuccess("Check your email on how to reset your password.");
		},
		error : function(){
			showEmailAlert("Sorry. There was a problem, please try again later.");
		}
	});
	
});
function validateForm(formData, jqForm, options) { 
    var form = jqForm[0]; 
	if (!validators.validateStringLength(form.user.value, 3, 15)){
		showModalError('Whoops!', 'Please enter a valid username');
		return false;
	} else if (!validators.validateStringLength(form.pass.value, 6, 15)){
		showModalError('Whoops!', 'Please enter a valid password');
		return false;
	} else {
		return true;
	}
}

function showEmailAlert(m) {
	$('#get-credentials .alert').attr('class', 'alert alert-error');
	$('#get-credentials .alert').html(m);
	$('#get-credentials .alert').show();
}

function hideEmailAlert() {
    $('#get-credentials .alert').hide();
}

function showEmailSuccess(m) {
	$('#get-credentials .alert').attr('class', 'alert alert-success');
	$('#get-credentials .alert').html(m);
	$('#get-credentials .alert').fadeIn(500);
}

