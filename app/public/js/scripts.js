var queryResult;

function getSource(req){
	$.ajax({
        'async': false,
		url: "api/clients",
		dataType: "json",
		data: {
			term: req.term
		},
		success: function( data ) {
	        queryResult=data;
		}
	});
};
function showModalError(t, m) {
	$('.modal-alert .modal-header h3').text(t);
	$('.modal-alert .modal-body p').text(m);
	$('.modal-alert').modal('show');
}


$(function() {
	//$('.dropdown-toggle').dropdown();
	$('#to_client').autocomplete({
		source: function(req,res){
			getSource(req);
			var x = new Array();
			console.log(queryResult);
			for(var i=0;i<queryResult.length;i++){
				x[i] = {"label" : queryResult[i].name, "value" : queryResult[i].name, idx : i};
			}
			res(x);
		},
		minLength:3,
		select: function(event, ui) {
			var i= ui.item.idx;
			$(".address").val(queryResult[i].address.street)
			$(".zipcode").val(queryResult[i].address.zipcode);
			$(".city").val(queryResult[i].address.city);
			$(".country").val(queryResult[i].address.country);
			$(".vat_number").val(queryResult[i].vat_number);
			$(".fiscal_code").val(queryResult[i].fiscal_code);
		}
	});
});

//Form to JSON Object
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

//Add row to table
$(function() {
	$(".amount").keypress(function() {
		addNewRow();
	});
});

function addNewRow(){
	if($($("#items tbody tr:last").find("input")[3]).val()!=""){
		$("#items tbody tr:last").clone().find("input").each(function() {
		    $(this).attr({
		      'id': function(_, id) { return (id.slice(0, id.lastIndexOf("_"))) + "_" + rowNumber },
		      'name': function(_, name) { return (name = name.replace(rowNumber-1,rowNumber))},
		      'value': ''
		    });
		  }).end().appendTo("#items");
		rowNumber++;
		$("#items tbody tr:last").keypress(function() {
			addNewRow();
		});
		$(".amount:last").blur(function() {
			controlAmount($(this));
		});
		$(function() {
			$(".quantity:last").blur(function() {
				controlQuantity($(this));
			});
		});
		return false;
	}
}

//datepicker
$(function() {
	$(".date").datepicker({
		changeMonth: true,
		changeYear: true,
		dateFormat: "dd/mm/yy",
		showOtherMonths: true
	});
});

//validate forms
//controlli
$(function() {
	$("#zipcode").blur(function() {
		controlZIP();
	});
});
function controlZIP(){
	if($('#zipcode').val()!=""){
		if(!is_numeric($('#zipcode').val())){
			alert("Il CAP è formato da numeri.");
			return false;
		}
		if($('#zipcode').val().length>5)
			alert("Il CAP è formato da 5 cifre.");
			return false;
	}

}
$(function() {
	$("#vat_number").blur(function() {
		controlVAT();
	});
});
function controlVAT(){
	if($('#vat_number').val()!=""){
		if(!is_numeric($('#vat_number').val())){
			alert("La partita IVA è formata da numeri.");
			return false;
		}
		if($('#vat_number').val().length>11){
			alert("La partita IVA è formata da 11 cifre.");
			return false;
		}
	}

}
$(function() {
	$("#vat_perc").blur(function() {
		controlVATP();
	});
});
function controlVATP(){
	if($('#vat_perc').val()!=""){
		if(!is_numeric($('#vat_perc').val())){
			alert("L'IVA percentuale è un numero.");
			return false;
		}
		if($("vat_perc").val()>100)
			alert("L'IVA percentile dave essere minore di 100.");
		else{
			if($(".subtotal").val()!="")
				calcoloVAT($(".subtotal").val());
				calcoloTotal();
		}
	}

}
$(function() {
	$("#fiscal_code").blur(function() {
		controlFC();
	});
});
function controlFC(){
	if($('#fiscal_code').val()!="")
		if($('#fiscal_code').val().length>16)
			alert("Il codice fiscale è formato da 11 caratteri.");
			return false;
}
$(function() {
	$(".quantity").blur(function() {
		controlQuantity($(this));
	});
});
function controlQuantity(quantity){
	if($(quantity).val()!="")
		if(!is_numeric($(quantity).val()))
			alert("La quantità è un numero.");
}

//totali
$(function() {
	$(".amount").blur(function() {
		controlAmount($(this));
	});
});
function controlAmount(amount){
	if($(amount).val()!="")
		if(!is_numeric($(amount).val())){
			alert("L'importo deve essere un numero.");
			//$(amount).focus();
		} else {
			impTot=0;
			$('input.amount').each(function(){
				if($(this).val()!="")
					impTot += parseFloat($(this).val());
			});
			$(".subtotal").val(impTot);
			if($('#vat_perc')!="")
				calcoloVAT(impTot);
			calcoloTotal();
		}
}
function calcoloVAT(impTot){
	$('.vat_amount').val((impTot/100)*$('#vat_perc').val());
}
$(function() {
	$("#shipping_costs").blur(function() {
		calcoloTotal();
	});
});
function calcoloTotal(){
	if($('#shipping_costs').val() != "" && !is_numeric($('#shipping_costs').val())){
		alert("Le spese di spedizione devono essere un numero.");
		//$("#shipping_costs").focus();
	}else {
		tot=0;
		$('.totals').each(function(){
			if($(this).val()!="")
				tot += parseFloat($(this).val());
		});
		$('.total').val(tot);
	}
}

//vecchie
function is_numeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
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