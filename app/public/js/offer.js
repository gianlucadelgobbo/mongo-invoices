var rowNumber = 1;
var queryResult;
$(function() {
	$(".disabled").attr('disabled', 'disabled');

	$("#to_client").bind("keypress", function(event) {
		//console.log(event.keyCode);
		if ($("#client_id").val()!="" &&  event.keyCode != 13) {
			$("#client_id").val("");
			$(".street").val("");
			$(".zipcode").val("");
			$(".city").val("");
			$(".country").val("");
			$(".vat_number").val("");
			$(".fiscal_code").val("");
		}
	});
	
	//autocomplete
	$('#to_client').autocomplete({
		source: function(req,res){
			getAutoCompleteList(req,"/api/clients");
			var x = new Array();
			for(var i=0;i<queryResult.length;i++){
				x[i] = {"label" : queryResult[i].name, "value" : queryResult[i].name, idx : i};
			}
			res(x);
		},
		minLength:3,
		select: function(event, ui) {
			var i= ui.item.idx;
			$("#client_id").val(queryResult[i]._id);
			$(".street").val(queryResult[i].address.street);
			$(".zipcode").val(queryResult[i].address.zipcode);
			$(".city").val(queryResult[i].address.city);
			$(".country").val(queryResult[i].address.country);
			$(".vat_number").val(queryResult[i].vat_number);
			$(".fiscal_code").val(queryResult[i].fiscal_code);
		}
	});
	$('#payment').autocomplete({
		source: function(req,res){
			getAutoCompleteList(req,"/api/payments");
			var x = new Array();
			for(var i=0;i<queryResult.length;i++){
				x[i] = {"label" : queryResult[i], "value" : queryResult[i], idx : i};
			}
			res(x);
		},
		minLength:3,
		select: function(event, ui) {
			//console.log(ui);
		}
	});

	$("#offer").submit(function() {
		$(".disabled").removeAttr('disabled');
		return checkOffer();
	});
	
	// datepicker
	$("#delivery_date").datepicker({
		changeMonth: true,
		changeYear: true,
		dateFormat: "dd/mm/yy",
		showOtherMonths: true
	});
	
	$("#offer_date").datepicker({
		changeMonth: true,
		changeYear: true,
		dateFormat: "dd/mm/yy",
		showOtherMonths: true,
		onSelect: checkDate
	});
	
	// Binds
	$("#vat_perc").bind("blur", function() {
		updateTotal();
	});
	$("#shipping_costs").bind("blur", function() {
		updateTotal();
	});
	setBinds();
	accounting.settings = _config.accountingSettings;
});

function getAutoCompleteList(req, url){
	$.ajax({
        'async': false,
		url: url,
		dataType: "json",
		data: {
			term: req.term
		},
		success: function( data ) {
	        queryResult=data;
		}
	});
}

function setBinds(){
	$(".quantity").unbind("blur");
	$(".price").unbind("blur");
	$(".quantity").bind("blur",function() {
		checkQuantity($(this));
		getAmount($(this).parent().parent());
		updateTotal();
	});
	$(".price").bind("blur",function() {
		if(checkPrice($(this))) $(this).val(accounting.formatMoney(accounting.unformat($(this).val(), ",")));
		getAmount($(this).parent().parent());
		updateTotal();
		addNewRow();
	});
	$('.description').autocomplete({
		source: function(req,res){
			getAutoCompleteList(req,"/api/products");
			var x = new Array();
			for(var i=0;i<queryResult.length;i++){
				x[i] = {"label" : queryResult[i], "value" : queryResult[i], idx : i};
			}
			res(x);
		},
		minLength:3,
		select: function(event, ui) {
			//console.log(ui);
		}
	});

}

function checkDate() {
	var d = $("#offer_date").val().split("/");
	$.ajax({
		url: "/api/offers",
		dataType: "json",
		data: {
			ajax: true,
			offer_date:$("#offer_date").val(),
			offer_number:$("#offer_number").val()
		},
		success: function( data ) {
			if (data.result.length) {
				var d = new Date(data.result[data.result.length-1].offer_date);
				showModalError("Errore","La data deve essere uguale o successiva al "+d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear(), function () {setTimeout("\$(\"#offer_date\").focus()",50)});
			}
		}
	});
}

function checkQuantity(input){
	if(!is_numeric(input.val())){
		var id = input.attr("id");
		showModalError("Errore","La quantità è un numero.", function () {setTimeout("\$(\"#"+id+"\").focus()",50)});
		return false;
	}
	return true;
}

function checkPrice(input){
	if(!is_numeric(accounting.unformat(input.val(), ","))){
		var id = input.attr("id");
		showModalError("Errore","Il prezzo è un numero.", function () {setTimeout("\$(\"#"+id+"\").focus()",50)});
		return false;
	}
	return true;
}

function checkShippingCosts(input){
	if(input.val()!="" && !is_numeric(accounting.unformat(input.val()))){
		var id = input.attr("id");
		showModalError("Errore","L'importo deve essere un numero.", function () {setTimeout("\$(\"#"+id+"\").focus()",50)});
		return false;
	}
	return true;
}

function checkVATPerc(input){
	if(!is_numeric(input.val())){
		var id = input.attr("id");
		showModalError("Errore","L'IVA percentuale non è un numero.", function () {setTimeout("\$(\"#"+id+"\").focus()",50)});
		return false;
	} else if(input.val()>100||input.val()<0) {
		var id = input.attr("id");
		showModalError("Errore","L'IVA percentuale deve essere compresa tra 0 e 100.", function () {setTimeout("\$(\"#"+id+"\").focus()",50)});
		return false;
	} else {
		return true;
	}
}

function checkOffer(){
	//console.log("checkOffer");
	res = true;
	// Check _id client
	if (!$("#client_id").val()){
		showModalError("Errore","Selezionare una ragione sociale", function () {setTimeout("\$(\"#client_id\").focus()",50)});
		res = false;
	}
	// Check counts
	return res;
}

function getAmount(row){
	if (is_numeric(row.find(".quantity").val()) && is_numeric(accounting.unformat(row.find(".price").val(), ","))) {
		row.find(".amount").val(accounting.formatMoney(row.find(".quantity").val()*accounting.unformat(row.find(".price").val(), ",")));
	}
}

function updateTotal(){
	subtot=0;
	$('.amount').each(function(){
		if($(this).val()!="")
			subtot += parseFloat(accounting.unformat($(this).val(), ","));
	});
	$('.subtotal').val(accounting.formatMoney(subtot));
	var failed = false;
	if (checkVATPerc($('#vat_perc'))) {
		$('.vat_amount').val(accounting.formatMoney((subtot/100)*$('#vat_perc').val()));
	} else {
		failed = true;
	}
	if(checkShippingCosts($('#shipping_costs'))) {
		$('#shipping_costs').val(accounting.formatMoney(accounting.unformat($('#shipping_costs').val(), ",")));
	} else {
		failed = true;
	}
	if (failed) {
		tot = "";
	} else {
		tot = 0;
		$('.totals').each(function(){
			if($(this).val()!="")
				tot += parseFloat(accounting.unformat($(this).val(), ","));
		});
	}
	$('.total').val(accounting.formatMoney(tot));
}

//Add row to table
function addNewRow(){
	rowNumber = $("#items tbody tr").length;
	if($("#items tbody tr:last .price").val()!=""){
	
		$("#items tbody tr:last").clone().find("input,textarea").each(function() {
		    $(this).attr({
		      'id': function(_, id) { 
		      		//console.log(id);
		      		//console.log(_);
		      		//console.log((id.slice(0, id.lastIndexOf("_"))) + "_" + rowNumber);return (id.slice(0, id.lastIndexOf("_"))) + "_" + rowNumber
		      },
		      'name': function(_, name) { return (name = name.replace(rowNumber-1,rowNumber))},
		      'value': ''
		    });
		}).end().appendTo("#items");
		setBinds();
	}
}


function removeRow(t){
	if($(t).parent().parent().parent().find(".price").length>1) {
		$(t).parent().parent().remove();
	}
}
