$(document).ready(function(){
	$('#login-form').ajaxForm({
		beforeSubmit:  function(formData, jqForm, options) {
			formData.push({ name: 'ajax', value: true });
		},
		success	: function(response, status, xhr, $form){
			if (response.msg && response.msg.e && response.msg.e.length) {
				console.log(response);
				var str = "<ul>";
				var print = response.msg.e;
				for(var p in print) {
					if(print[p].name) {
						var jsel = $("[name='"+print[p].name+"']");
						jsel.parent().parent().addClass("error");
						jsel.keydown(function() {$(this).parent().parent().removeClass("error")});
						jsel.change(function() {$(this).parent().parent().removeClass("error")});
					}
					if(print[p].m) str+= "<li>"+print[p].m+"</li>";
				}
				str+= "</ul>";
				console.log(str);
	        	showModal('error', str);
			} else {
				var from = $("[name='from']");
				window.location.href = from.val() ? from.val() : '/home';
			}
		},
		error : function(e){
            showModal('error', 'Please check your username and/or password');
		}
	}); 
	//$('#user-tf').focus();
	
// login retrieval form via email //
	$('#get-credentials-form').ajaxForm({
		url: '/lost-password',
		beforeSubmit : function(formData, jqForm, options){
			if (Validators.validateEmail($('#email-tf').val())){
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
var get_credentials_alert = $('#get-credentials .alert');
function showEmailAlert(m) {
	get_credentials_alert.attr('class', 'alert alert-error').html(m).show();
}

function hideEmailAlert() {
	get_credentials_alert.hide();
}

function showEmailSuccess(m) {
	get_credentials_alert.attr('class', 'alert alert-success').html(m).fadeIn(500);
}

