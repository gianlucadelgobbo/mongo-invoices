$(document).ready(function(){
	$('#client-form').ajaxForm({
		beforeSubmit:  function(formData, jqForm, options) {
			formData.push({ name: 'ajax', value: true });
		},
		success	: function(response, status, xhr, $form){
			var str = "<ul>";
			var print = response.msg && response.msg.e && response.msg.e.length ? response.msg.e : response.msg.c;
			for(p in print) {
				if(print[p].name) {
					$("[name='"+print[p].name+"']").parent().parent().addClass("error");
					$("[name='"+print[p].name+"']").keydown(function() {$(this).parent().parent().removeClass("error")});
					$("[name='"+print[p].name+"']").change(function() {$(this).parent().parent().removeClass("error")});
				}
				if(print[p].m) str+= "<li>"+print[p].m+"</li>";
			}
			str+= "</ul>";
        	showModal((response.msg && response.msg.e && response.msg.e.length ? 'error' : 'confirm'), str, forceClient);
			$("h1 #name_new").html($("[name='name']").val());
		},
		error : function(e){
        	showModal('error', 'Please check client data');
		}
	});
});
function forceClient() {
	$('#client-form').append("<input type=\"hidden\" name=\"force\" value=\"1\" />");
	setTimeout("$('#client-form').submit()",500);
//	$('#account-form-btn1').click();
}

/*
function validateForm(formData, jqForm, options) { 
    var form = $(jqForm[0]).formParams();
    console.log(form);
    errors = [];
	if (!Validators.validateStringLength(form.name, 3, 50)){
		errors.push('Please enter a valid Client');
	}
	errors = errors.concat(Validators.checkVAT(form.vat_number));
	errors = errors.concat(Validators.checkCF(form.fiscal_code));
	if (!Validators.validateStringLength(form.address.street, 3, 255)){
		errors.push('Please enter a valid Street');
	}
	if (!Validators.validateStringLength(form.address.zipcode, 3, 11)){
		errors.push('Please enter a valid ZIP code');
	}
	if (!Validators.validateStringLength(form.address.city, 2, 11)){
		errors.push('Please enter a valid City');
	}
	if (!Validators.validateStringLength(form.address.country, 3, 11)){
		errors.push('Please enter a valid Country');
	}
	if (errors.length){
		str = "<ul>";
		console.log(errors);
		for (error in errors) str+="<li>"+errors[error]+"</li>";
		str+= "</ul>";
		showModalError('Whoops!', str);
		return false;
	} else {
		return true;
	}
}
*/