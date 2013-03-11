function showModal(t, m, callback) {
	$('.modal-'+t+' .modal-body p').html(m);
	$('.modal-'+t).modal('show');
	if ($.isFunction(callback)) {
		/*
		$('.modal-'+t).on('hidden', function () {
		  callback();
		})
		*/
		$('#force').click(function () {
		  callback();
		})
	}
}
function is_numeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

/* DA RIVEDERE */
//Form to JSON Object
/*
$.fn.serializeObject = function()
{
    var objectedForm = {};
    var serializedForm = this.serializeArray();
    $.each(serializedForm, function() {
        if (objectedForm[this.name] !== undefined) {
            if (!objectedForm[this.name].push) {
                objectedForm[this.name] = [objectedForm[this.name]];
            }
            objectedForm[this.name].push(this.value || '');
        } else {
            objectedForm[this.name] = this.value || '';
        }
    });
    return objectedForm;
};


function controlZIP(){
	if($('#zipcode').val()!=""){
		if(!is_numeric($('#zipcode').val())){
			var id = $(this).attr("id");
			showModalError("Errore","Il CAP è formato da numeri.", function () {setTimeout("\$(\"#"+id+"\").focus()",50)});
			return false;
		}
		if($('#zipcode').val().length>5)
			var id = $(this).attr("id");
			showModalError("Errore","Il CAP è formato da 5 cifre.", function () {setTimeout("\$(\"#"+id+"\").focus()",50)});
			return false;
	}

}
function controlFC(){
	if($('#fiscal_code').val()!="")
		if($('#fiscal_code').val().length>16)
			var id = $(this).attr("id");
			showModalError("Errore","Il codice fiscale è formato da 11 caratteri.", function () {setTimeout("\$(\"#"+id+"\").focus()",50)});
			return false;
}

//vecchie
function is_date(aaaa,mm,gg){
	var res=true;
	mmNew = parseFloat(mm)-1;
	mm = (mmNew.toString().length==1 ? "0"+mmNew : mmNew);
	var dteDate=new Date(aaaa,mm,gg);
	if (!((gg==dteDate.getDate()) && (mm==dteDate.getMonth()) && (aaaa==dteDate.getFullYear())))
		res=false;
	return res;
}
function is_email(email){
	var res=0;
	email=trim(email);
	if(window.RegExp){
		var rexp=new RegExp("^[_a-zA-Z0-9-]+(\\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)*(\\.([a-zA-Z]){2,4})$");
		if(rexp.test(email))
			res=1;
	}else{
		if((email.indexOf("@") > 0) && (email.indexOf(".") > 0))
			res=1;
	}
	return res;
}
function trim(str) {
	var res="";
	if(str){
		if(str.length>0){
			res=ltrim(rtrim(str, "\\s"), "\\s");
		}
	}
	return res;
}
function ltrim(str, chars) {
//	chars = chars || "\\s";
	return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
}
 
function rtrim(str, chars) {
	chars = chars || "\\s";
	return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
}
*/
