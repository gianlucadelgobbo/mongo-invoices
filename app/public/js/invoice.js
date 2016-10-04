var queryResult;
$(function() {
	$(".disabled").attr('disabled', 'disabled');
	var to_client = $("#to_client");
	to_client.bind("keypress", function(event) {
		console.log(event.keyCode);
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
	to_client.autocomplete({
		source: function(req,res){
			getAutoCompleteList(req,"/api/clients");
			var x = [];
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
			var x = [];
			for(var i=0;i<queryResult.length;i++){
				x[i] = {"label" : queryResult[i], "value" : queryResult[i], idx : i};
			}
			res(x);
		},
		minLength:3,
		select: function(event, ui) {
			console.log(ui);
		}
	});

	$("#invoice").submit(function() {
		$(".disabled").removeAttr('disabled');
		return checkInvoice();
	});
	
	// datepicker
	$("#delivery_date").datepicker({
		changeMonth: true,
		changeYear: true,
		dateFormat: "dd/mm/yy",
		showOtherMonths: true
	});
	
	$("#invoice_date").datepicker({
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
function showOffers() {
	$('.modal-alert .modal-title').html("Offers");
	showModal("alert", "Loading...");
	$.ajax({
        'async': false,
		url: "/api/offers",
		dataType: "json",
		success: function( data ) {
			var str = "<div class=\"list-group\">";
			for(var a=0;a<data.result.length;a++){
				var d = new Date(data.result[a].offer_date);
				var date = d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear();
				str+="<a href=\"#\" onclick=\"setOffer('"+data.result[a]._id+"','"+date+"','"+data.result[a].offer_number+"');\" class=\"list-group-item\"><h4 class=\"list-group-item-heading\"><span class=\"label label-default\">"+data.result[a].offer_number+"</span> "+date+" "+data.result[a].to_client.name+"</h4><p class=\"list-group-item-text\">"+data.result[a].description+"</p></a>"
			}
			str+= "</div>";
			$('.modal-alert .modal-body').html(str);
		}
	});
}
function setOffer(_id,date,offer_number) {
	$('#offer_id').val(_id);
	$('#offer_number').val(offer_number);
	$('#offer_date').val(date);
	$('#offer_url').attr('href', '/offer/?id='+_id).removeAttr('disabled');
	$('.modal-alert').modal('hide');
	return false;
}

function setBinds(){
	$(".quantity").unbind("blur").bind("blur",function() {
		checkQuantity($(this));
		getAmount($(this).parent().parent());
		updateTotal();
	});
	$(".price").unbind("blur").bind("blur",function() {
		if(checkPrice($(this))) $(this).val(accounting.formatMoney(accounting.unformat($(this).val(), ",")));
		getAmount($(this).parent().parent().parent());
		updateTotal();
		addNewRow();
	});
	$('.description').autocomplete({
		source: function(req,res){
			getAutoCompleteList(req,"/api/products");
			var x = [];
			for(var i=0;i<queryResult.length;i++){
				x[i] = {"label" : queryResult[i], "value" : queryResult[i], idx : i};
			}
			res(x);
		},
		minLength:3,
		select: function(event, ui) {
			console.log(ui);
		}
	});

}

function checkDate() {
	var invoice_date = $("#invoice_date");
	var d = invoice_date.val().split("/");
	$.ajax({
		url: "/api/invoices",
		dataType: "json",
		data: {
			ajax: true,
			invoice_date:invoice_date.val(),
			invoice_number:$("#invoice_number").val()
		},
		success: function( data ) {
			if (data.result.length) {
				var d = new Date(data.result[data.result.length-1].invoice_date);
				showModalError("Errore","La data deve essere uguale o successiva al "+d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear(), function () {setTimeout("\$(\"#invoice_date\").focus()",50)});
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

function checkInvoice(){
	console.log("checkInvoice");
	var res = true;
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
	var subtot=0;
	var vat_perc = $('#vat_perc');
	var shipping_costs = $('#shipping_costs')
	$('.amount').each(function(){
		if($(this).val()!="")
			subtot += parseFloat(accounting.unformat($(this).val(), ","));
	});
	$('.subtotal').val(accounting.formatMoney(subtot));
	var failed = false;
	if (checkVATPerc(vat_perc)) {
		$('.vat_amount').val(accounting.formatMoney((subtot/100)*vat_perc.val()));
	} else {
		failed = true;
	}
	if(checkShippingCosts(shipping_costs)) {
		shipping_costs.val(accounting.formatMoney(accounting.unformat(shipping_costs.val(), ",")));
	} else {
		failed = true;
	}
	var tot;
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
	var rowNumber = $("#items tbody tr").length;
	if($("#items tbody tr:last .price").val()!=""){
	
		$("#items tbody tr:last").clone().find("input,textarea").each(function() {
		    $(this).attr({
		      'id': function(_, id) { return (id.slice(0, id.lastIndexOf("_"))) + "_" + rowNumber },
		      'name': function(_, name) { return (name = name.replace(rowNumber-1,rowNumber))},
		      'value': ''
		    });
		    if ($(this).html()) $(this).html("");
		}).end().appendTo("#items");
		setBinds();
	}
}


function removeRow(t){
	if($(t).parent().parent().parent().find(".price").length>1) {
		$(t).parent().parent().remove();
	}
	updateTotal();
}
