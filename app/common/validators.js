
var Validators = {}

Validators.checkClientID = function(clientID){
	var errors = [];
	if(!clientID){
		errors.push({name:"to_client[name]",m:__("You have to insert a valid client")});
	}
	return errors;
}

Validators.checkCF = function (cf) {
	var errors = [];
	var validi, i, s, set1, set2, setpari, setdisp;
	if( cf == '' ) {
		errors.push({name:"fiscal_code",m:__("La lunghezza del codice fiscale non è corretta: il codice fiscale dovrebbe essere lungo esattamente 16 caratteri.")});
	} else{
		cf = cf.toUpperCase();
		if( cf.length != 16 )
			errors.push({name:"fiscal_code",m:__("La lunghezza del codice fiscale non è corretta: il codice fiscale dovrebbe essere lungo esattamente 16 caratteri.")});
		validi = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		for( i = 0; i < 16; i++ ){
			if( validi.indexOf( cf.charAt(i) ) == -1 )
				errors.push({name:"fiscal_code",m:__("Il codice fiscale contiene un carattere non valido. I caratteri validi sono le lettere e le cifre.")});
		}
		set1 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		set2 = "ABCDEFGHIJABCDEFGHIJKLMNOPQRSTUVWXYZ";
		setpari = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		setdisp = "BAKPLCQDREVOSFTGUHMINJWZYX";
		s = 0;
		for( i = 1; i <= 13; i += 2 )
			s += setpari.indexOf( set2.charAt( set1.indexOf( cf.charAt(i) )));
		for( i = 0; i <= 14; i += 2 )
			s += setdisp.indexOf( set2.charAt( set1.indexOf( cf.charAt(i) )));
		if( s%26 != cf.charCodeAt(15)-'A'.charCodeAt(0) )
			errors.push({name:"fiscal_code",m:__("Il codice fiscale non è corretto: il codice di controllo non corrisponde.")});
	}
	return errors;
}
Validators.checkCFwithVAT = function (cf) {
	var errors = [];
	if( cf == '' ) {
		errors.push({name:"vat_number",m:__("La lunghezza del codice fiscale non è corretta: il codice fiscale dovrebbe essere lungo esattamente 11 caratteri.")});
	} else {
		if( cf.length != 11 )
			errors.push({name:"vat_number",m:__("La lunghezza del codice fiscale non è corretta: il codice fiscale dovrebbe essere lungo esattamente 11 caratteri.")});
		validi = "0123456789";
		for( i = 0; i < 11; i++ ){
			if( validi.indexOf( cf.charAt(i) ) == -1 )
				errors.push({name:"vat_number",m:__("Il codice fiscale contiene un carattere non valido. I caratteri validi sono le cifre.")});
		}
		s = 0;
		for( i = 0; i <= 9; i += 2 )
			s += cf.charCodeAt(i) - '0'.charCodeAt(0);
		for( i = 1; i <= 9; i += 2 ){
			c = 2*( cf.charCodeAt(i) - '0'.charCodeAt(0) );
			if( c > 9 )  c = c - 9;
			s += c;
		}
		if( ( 10 - s%10 )%10 != cf.charCodeAt(10) - '0'.charCodeAt(0) )
			errors.push({name:"vat_number",m:__("Il codice fiscale non è valido: il codice di controllo non corrisponde.")});
	}
	return errors;
}

Validators.checkVAT = function (pi, country, callback) {
	var errors = [];
	switch(country) {
		case "Italy" :
			if( pi == '' ) {
				errors.push({name:"vat_number",m:__("La lunghezza della partita IVA non è corretta: la partita IVA dovrebbe essere lunga esattamente 11 caratteri.")});
			} else {
				if( pi.length != 11 )
					errors.push({name:"vat_number",m:__("La lunghezza della partita IVA non è corretta: la partita IVA dovrebbe essere lunga esattamente 11 caratteri.")});
				validi = "0123456789";
				for( i = 0; i < 11; i++ ){
					if( validi.indexOf( pi.charAt(i) ) == -1 )
						errors.push({name:"vat_number",m:__("La partita IVA contiene un carattere non valido. I caratteri validi sono le cifre.")});
				}
				s = 0;
				for( i = 0; i <= 9; i += 2 )
					s += pi.charCodeAt(i) - '0'.charCodeAt(0);
				for( i = 1; i <= 9; i += 2 ){
					c = 2*( pi.charCodeAt(i) - '0'.charCodeAt(0) );
					if( c > 9 )  c = c - 9;
					s += c;
				}
				if( ( 10 - s%10 )%10 != pi.charCodeAt(10) - '0'.charCodeAt(0) )
					errors.push({name:"vat_number",m:__("La partita IVA non è valida: il codice di controllo non corrisponde.")});
			}
		break;
	}
	return errors;
}

Validators.checkInvoiceNumber = function(invoiceNumber){
	var errors = [];
	if (!invoiceNumber) errors.push({name:"invoice_number",m:__("No invoice number")});
	return errors;
}

Validators.checkInvoiceDate = function(invoiceDate){
	var errors = [];
	if (!invoiceDate) {
		errors.push({name:"invoice_date",m:__("No invoice date")});
	} else {
		var d = invoiceDate.split("/");
		if (!this.is_date(d[2],d[1],d[0])) errors.push({name:"invoice_date",m:__("Invoice date is not date")});
	}
	return errors;
}

Validators.checkDeliveryDate = function(deliveryDate){
	var errors = [];
	if(deliveryDate){
		var d = deliveryDate.split("/");
		if (!this.is_date(d[2],d[1],d[0])){
			errors.push({name:"delivery_date",m:__("Delivery date is not date")});
		}
	}
	return errors;
}

Validators.checkOfferNumber = function(offerNumber){
	var errors = [];
	if (!offerNumber) errors.push({name:"offer_number",m:__("No offer number")});
	return errors;
}

Validators.checkOfferDate = function(offerDate){
	var errors = [];
	if (!offerDate) {
		errors.push({name:"offer_date",m:__("No offer date")});
	} else {
		var d = offerDate.split("/");
		//if (!this.is_date(d[2],d[1],d[0])) errors.push({name:"invoice_date",m:__("Invoice date is not date")});
		if (!this.is_date(d[2],d[1],d[0])) errors.push({name:"invoice_date",m:__("Invoice date is not date")});
	}
	return errors;
}


// General Functions //
Validators.validateStringLength = function(s, min, max) {
	return s.length <= max && s.length >= min;
}

Validators.validateEmail = function(e) {
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(e);
}
Validators.is_date = function (aaaa,mm,gg){
	var res = true;
	mmNew = parseFloat(mm)-1;
	mm = (mmNew.toString().length==1 ? "0"+mmNew : mmNew);
	var dteDate=new Date(aaaa,mm,gg);
	if (!((gg==dteDate.getDate()) && (mm==dteDate.getMonth()) && (aaaa==dteDate.getFullYear())))
		res = false;
	return res;
}

if (typeof exports !== 'undefined') exports.Validators = Validators;
