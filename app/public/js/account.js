$(document).ready(function(){
	$('#account-form').ajaxForm({
		beforeSerialize: function(formData, jqForm, options) {
			$("[disabled]").removeAttr("disabled");
		},
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
        	showModal((response.msg && response.msg.e && response.msg.e.length ? 'error' : 'confirm'), str);
			if (response.msg.redirect) setTimeout("location.href='"+response.msg.redirect+"'", 3000);
			$("h1 #name_new").html($("[name='name']").val());
		},
		error : function(e){
			console.log(e);
        	showModal('error', 'Please check account data');
		}
	}); 
})
