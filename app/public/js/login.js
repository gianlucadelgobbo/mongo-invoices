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
				for(p in print) {
					if(print[p].name) {
						$("[name='"+print[p].name+"']").parent().parent().addClass("error");
						$("[name='"+print[p].name+"']").keydown(function() {$(this).parent().parent().removeClass("error")});
						$("[name='"+print[p].name+"']").change(function() {$(this).parent().parent().removeClass("error")});
					}
					if(print[p].m) str+= "<li>"+print[p].m+"</li>";
				}
				str+= "</ul>";
				console.log(str);
	        	showModal('error', str);
			} else {
				window.location.href = $("[name='from']").val() ? $("[name='from']").val() : '/home';
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

