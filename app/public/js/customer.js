$(document).ready(function(){
	$('#customer-form').ajaxForm({
		beforeSubmit:  function(formData, jqForm, options) {
			formData.push({ name: 'ajax', value: true });
		},
		success	: function(response, status, xhr, $form){
			var str = "<ul>";
			var print = response.msg && response.msg.e && response.msg.e.length ? response.msg.e : response.msg.c;
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
        	showModal((response.msg && response.msg.e && response.msg.e.length ? 'error' : 'confirm'), str, forceCustomer);
			if (response.msg.redirect) setTimeout("location.href='"+response.msg.redirect+"'", 3000);
			$("h1 #name_new").html($("[name='name']").val());
		},
		error : function(e){
        	showModal('error', 'Please check customer data');
		}
	});
});
function forceCustomer() {
	$('#customer-form').append("<input type=\"hidden\" name=\"force\" value=\"1\" />");
	setTimeout("$('#customer-form').submit()",500);
//	$('#account-form-btn1').click();
}
function addNewRow(){
	var clone = $("#contacts .input-group:last").clone();
	clone.find("input").each(function() {
		$(this).val('');
	});
	clone = clone.find("button").each(function() {
		$(this).removeClass("disabled");
	});
	clone.end().appendTo("#contacts");
	resetItemNamesAndIDs();
}

function resetItemNamesAndIDs(){
	$("#contacts .input-group").each(function(index){
		$(this).find("input,button").each(function() {
			//$(this).removeClass("disabled");
			$(this).attr({
				'id': function(_, id) { return (id.slice(0, id.lastIndexOf("_"))) + "_" + index },
				'name': function(_, name) { return (name = name.substring(0,name.indexOf("[")+1)+index+name.substring(name.indexOf("]")))},
			});
		});
	});
}
/*
function validateForm(formData, jqForm, options) { 
    var form = $(jqForm[0]).formParams();
    console.log(form);
    errors = [];
	if (!Validators.validateStringLength(form.name, 3, 50)){
		errors.push('Please enter a valid Customer');
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