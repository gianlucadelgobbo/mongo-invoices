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

$(function() {
	$('.dropdown-toggle').dropdown();
	$('#cliente').autocomplete({
		source: function(req,res){
			getSource(req);
			var x = new Array();
			for(var i=0;i<queryResult.length;i++){
				x[i] = {"label" : queryResult[i].name, "value" : queryResult[i].name, idx : i};
			}
			res(x);
		},
		minLength:3,
		select: function(event, ui) {
			var i= ui.item.idx;
			$(".indirizzo").val(queryResult[i].indirizzo.via)
			$(".cap").val(queryResult[i].indirizzo.cap);
			$(".citta").val(queryResult[i].indirizzo.citta);
			$(".p_iva").val(queryResult[i].p_iva);
			$(".c_fiscale").val(queryResult[i].cf);
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
	$(".importo").keypress(function() {
		addNewRow();
	});
});

function addNewRow(){
	if($($("#articoli tr:last").find("input")[2]).val()!=""){
		$("#articoli tr:last").clone().find("input").each(function() {
		    $(this).attr({
		      'id': function(_, id) { return (id.slice(0, id.lastIndexOf("_"))) + "_" + rowNumber },
		      'name': function(_, name) { return (name = name.replace(rowNumber-1,rowNumber))},
		      'value': ''
		    });
		  }).end().appendTo("#articoli");
		rowNumber++;
		$("#articoli tr:last").keypress(function() {
			addNewRow();
		});
		$(".importo:last").blur(function() {
			controlImporto($(this));
		});
		$(function() {
			$(".quantita:last").blur(function() {
				controlQuantita($(this));
			});
		});
		return false;
	}
}

//datepicker
$(function() {
	$("#data").datepicker({
		changeMonth: true,
		changeYear: true,
		dateFormat: "dd/mm/yy",
		showOtherMonths: true
	});
});
$(function() {
	$("#in_data").datepicker({
		changeMonth: true,
		changeYear: true,
		dateFormat: "dd/mm/yy",
		showOtherMonths: true
	});
});
$(function() {
	$("#data_consegna").datepicker({
		changeMonth: true,
		changeYear: true,
		dateFormat: "dd/mm/yy",
		showOtherMonths: true
	});
});

//validate forms
//controlli
$(function() {
	$("#cap").blur(function() {
		controlCAP();
	});
});
function controlCAP(){
	if($('#cap').val()!=""){
		if(!is_numeric($('#cap').val())){
			alert("Il CAP è formato da numeri.");
			return false;
		}
		if($('#cap').val().length>5)
			alert("Il CAP è formato da 5 cifre.");
			return false;
	}

}
$(function() {
	$("#p_iva").blur(function() {
		controlIVA();
	});
});
function controlIVA(){
	if($('#p_iva').val()!=""){
		if(!is_numeric($('#p_iva').val())){
			alert("La partita IVA è formata da numeri.");
			return false;
		}
		if($('#p_iva').val().length>11){
			alert("La partita IVA è formata da 11 cifre.");
			return false;
		}
	}

}
$(function() {
	$("#iva_perc").blur(function() {
		controlIVAP();
	});
});
function controlIVAP(){
	if($('#iva_perc').val()!=""){
		if(!is_numeric($('#iva_perc').val())){
			alert("L'IVA percentuale è un numero.");
			return false;
		}
		if($("iva_perc").val()>100)
			alert("L'IVA percentile dave essere minore di 100.");
		else{
			if($("#imp_totale").val()!="")
				calcoloIVA($("#imp_totale").val());
				calcoloTotale();
		}
	}

}
$(function() {
	$("#c_fiscale").blur(function() {
		controlCF();
	});
});
function controlCF(){
	if($('#c_fiscale').val()!="")
		if($('#c_fiscale').val().length>16)
			alert("Il codice fiscale è formato da 11 caratteri.");
			return false;
}
$(function() {
	$(".quantita").blur(function() {
		controlQuantita($(this));
	});
});
function controlQuantita(quantita){
	if($(quantita).val()!="")
		if(!is_numeric($(quantita).val()))
			alert("La quantità è un numero.");
}

//totali
$(function() {
	$(".importo").blur(function() {
		controlImporto($(this));
	});
});
function controlImporto(importo){
	if($(importo).val()!="")
		if(!is_numeric($(importo).val())){
			alert("L'importo deve essere un numero.");
			//$(importo).focus();
		} else {
			impTot=0;
			$('input.importo').each(function(){
				if($(this).val()!="")
					impTot += parseFloat($(this).val());
			});
			$(".imp_totale").val(impTot);
			if($('#iva_perc')!="")
				calcoloIVA(impTot);
			calcoloTotale();
		}
}
function calcoloIVA(impTot){
	$('.iva').val((impTot/100)*$('#iva_perc').val());
}
$(function() {
	$("#spedizione").blur(function() {
		calcoloTotale();
	});
});
function calcoloTotale(){
	if($('#spedizione').val() != "" && !is_numeric($('#spedizione').val())){
		alert("Le spese di spedizione devono essere un numero.");
		//$("#spedizione").focus();
	}else {
		tot=0;
		$('.totali').each(function(){
			if($(this).val()!="")
				tot += parseFloat($(this).val());
		});
		$('.totale').val(tot);
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