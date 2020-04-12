import 'semantic-ui-css/semantic.min.css';
import $ from "jquery";

"use strict"
var srvDomains = ["fi1.node.check-host.net", "fr2.node.check-host.net", "de1.node.check-host.net", "ir1.node.check-host.net", "it1.node.check-host.net", "it2.node.check-host.net", "kz1.node.check-host.net", "lv2.node.check-host.net", "lt1.node.check-host.net", "md1.node.check-host.net", "nl1.node.check-host.net", "ru1.node.check-host.net", "ru3.node.check-host.net", "ru2.node.check-host.net", "sg1.node.check-host.net", "se2.node.check-host.net", "ch1.node.check-host.net", "us1.node.check-host.net", "us4.node.check-host.net", "ua1.node.check-host.net", "ua2.node.check-host.net", "vn1.node.check-host.net"];
var srvLocations = ["Finland, Helsinki", "France, Paris", "Germany, Falkenstein", "Iran, Tehran", "Italy, Milan", "Italy, Milan", "Kazakhstan, Karaganda", "Latvia, Riga", "Lithuania, Vilnius", "Moldova, Chisinau", "Netherlands, Amsterdam", "Russia, Moscow", "Russia, Novosibirsk", "Russia, Saint Petersburg", "Singapore, Singapore", "Sweden, Stockholm", "Switzerland, Zurich", "USA, Los Angeles", "USA, Miami", "Ukraine, Khmelnytskyi", "Ukraine, Kiev", "Vietnam, Binh Thanh"];


//Su dung fetch
function ping_check(getInputUrl){
	const req = fetch("https://check-host.net/check-http?host=" + String(getInputUrl),{
		method: "GET",
		headers: {
			"Accept":"application/json"
		},
	});
	req.then((response) => {
		return response.json();
	}).then((request) => {
		
		$("#form").find("p").remove();
		if(request.error === "limit_exceeded"){
			$("#form").append("<p style='color:red'>Bạn đã kiểm tra trang này quá nhiều lần. Vui lòng thử lại sau 5 phút.</p>");
			return;
		}
		$("body").append('<div class="ui active dimmer" id="loader"><div class="ui loader"></div></div>');
		$("html").css("overflow","hidden");
		$("#result").append("<table class=\"ui unstackable table\"><thead></thead><tbody></tbody></table>");
		$("#result").find("table thead").html("<tr><th>Location</th><th>Time</th><th>Code</th></tr>");
		

		let srv = {};
		for(let i=0; i < srvDomains.length; i++){
			srv[srvDomains[i]] = srvLocations[i];
		}
		Object.entries(srv).forEach(([domain,location]) => {
			$("#result").find("table tbody").append(`<tr><td title=${domain}>${location}</td><td>null</td><td>null</td></tr>`);
		});

		let result = [];
		(function trying(tries = 0){
			fetch('https://check-host.net/check-result/' + request['request_id'],{
				method: "GET",
				headers: {
					"Accept":"application/json"
				},
			}).then(response => {
				return response.json();
			}).then(data => {
				let slaves = Object.keys(srv);
				for (let slave in data) {
                    for (var i = 0; i < slaves.length; i++) {
                        if (slaves[i] === slave && data[slave] != null) {
                            slaves.splice(i, 1);
                            result.push({
                            	host: slave,
                            	name: request["nodes"][slave][1] + ", " + request["nodes"][slave][2],
                            	value: data[slave]
                            });
                            break;
                        }
                    }
                }

                if (slaves.length > 0 && tries <= 3) {
                    setTimeout(function() {
                    	tries+=1;
                        trying(tries);
                    }, 500);
                }
                else{
                	$("body").find("#loader").remove();
                	$("html").css("overflow-y","scroll");
                	result.forEach(element => {
                		$("#result").find("table tbody tr").each(function() {
                			if($(this).find("td:first").attr("title") === element["host"]){
                				if(element["value"][0][3] == null){
                					$(this).find("td:nth-child(3)").html(`<span style="color:red;">${element["value"][0][2]}</span>`);
		                		} 
		                		else {
                					$(this).find("td:nth-child(2)").html(Math.round(element["value"][0][1] * 1000) / 1000 + "s");
                					$(this).find("td:nth-child(3)").html(element["value"][0][3]  + " (" + element["value"][0][2] + ")");
		                		}
                			}
						});
                		
                	});
                }
			});
		})();
	});
}


function whois_check(getInputUrl){
	$.ajax({
		url: "https://check-host.net/ip-info/whois",
		method: "POST",
		dataType: "text",
		data: "host=" + getInputUrl,
		success: function(data,status,xhr){
			if($.trim(data)){
				$("#result").append($("<div class='ui piled segment'>").append($("<pre style='font-size:0.75em;overflow:auto'>" + data +"</pre>").append("</div>")));
			}
			else{
				$("#result").append("<div class='ui one column centered grid'><span style='color:red'>Không tồn tại</span></div>");
			}
			
		}
	});
}
function info_check(getInputUrl){
	function extractDomain(url){
		let domain;
		if(url.indexOf("//") > -1){
			domain = url.split("/")[2];
		}
		else{
			domain = url.split("/")[0];
		}
		domain = domain.split(":")[0];
		domain = domain.split("?")[0];
		return domain;
	}
	$.ajax({
		url: "http://ip-api.com/json/" + extractDomain(getInputUrl) + "?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query",
		type: "GET",
		success: function(data,s,x){
			if(data["status"] == "fail"){
				return;
			}
			let resultId = $("#result");
			resultId.append('<table class="ui celled striped unstackable table"><tbody></tbody></table>');
			let resultTbody = resultId.find("tbody");
			let appendDefaultRow = function(content){
				resultTbody.append(content);
			}
			appendDefaultRow("<tr><td>IP address</td><td>" + data["query"] + "</td></tr>");
			appendDefaultRow("<tr><td>Host name</td><td>" + data["reverse"] + "</td></tr>");
			appendDefaultRow("<tr><td>ISP</td><td>" + data["isp"] + "</td></tr>");
			appendDefaultRow("<tr><td>Organization</td><td>" + data["as"] + "</td></tr>");
			appendDefaultRow("<tr><td>Country</td><td>" + data["country"] + "</td></tr>");
			appendDefaultRow("<tr><td>Region</td><td>" + data["region"] + "</td></tr>");
			appendDefaultRow("<tr><td>City</td><td>" + data["city"] + "</td></tr>");
			appendDefaultRow("<tr><td>Time zone</td><td>" + data["timezone"] + "</td></tr>");
			appendDefaultRow("<tr><td>Postal Code</td><td>" + data["zip"] + "</td></tr>");
		}
	});
}
function dns_check(getInputUrl){
	const req = fetch("https://check-host.net/check-dns?host=" + String(getInputUrl),{
		method: "GET",
		headers: {
			"Accept":"application/json"
		},
	});
	req.then((response) => {
		return response.json();
	}).then((request) => {
		
		$("#form").find("p").remove();
		if(request.error === "limit_exceeded"){
			$("#form").append("<p style='color:red'>Bạn đã kiểm tra trang này quá nhiều lần. Vui lòng thử lại sau 5 phút.</p>");
			return;
		}
		$("body").append('<div class="ui active dimmer" id="loader"><div class="ui loader"></div></div>');
		$("html").css("overflow","hidden");
		$("#result").append("<table class=\"ui unstackable table\"><thead></thead><tbody></tbody></table>");
		$("#result").find("table thead").html("<tr><th>Location</th><th>Result</th><th>TTL</th></tr>");
		

		let srv = {};
		for(let i=0; i < srvDomains.length; i++){
			srv[srvDomains[i]] = srvLocations[i];
		}
		Object.entries(srv).forEach(([domain,location]) => {
			$("#result").find("table tbody").append(`<tr><td title=${domain}>${location}</td><td>null</td><td>null</td></tr>`);
		});

		let result = [];
		(function trying(tries = 0){
			fetch('https://check-host.net/check-result/' + request['request_id'],{
				method: "GET",
				headers: {
					"Accept":"application/json"
				},
			}).then(response => {
				return response.json();
			}).then(data => {
                let slaves = Object.keys(srv);
                for (let slave in data) {
                    for (var i = 0; i < slaves.length; i++) {
                        if (slaves[i] === slave && data[slave] != null) {
                            slaves.splice(i, 1);
                            let dataSlave = data[slave][0];
                            result.push({
                            	host: slave,
                            	res: [...dataSlave['A'],...dataSlave['AAAA']],
                            	ttl: dataSlave['TTL']
                            });
                            break;
                        }
                    }
                }

                if (slaves.length > 0 && tries <= 3) {
                    setTimeout(function() {
                    	tries+=1;
                        trying(tries);
                    }, 500);
                }
                else{
                	$("body").find("#loader").remove();
                	$("html").css("overflow-y","scroll");
                	result.forEach(element => {
                		function convertTTL(oldTTL){
            				let newTTL = String(oldTTL).substr(0,1) + "m " + String(oldTTL).substr(1) + "s";
            				return newTTL;
            			}
            			function convertRes(res){
            				let newRes = '';
            				res.forEach(item => newRes += "<p>" + item + "</p>");
            				return newRes;
            			}

                		$("#result").find("table tbody tr").each(function() {
                			if($(this).find("td:first").attr("title") === element["host"]){
                				if(null === element['ttl'] && 0 === element['res'].length){
                					$(this).find("td:nth-child(2)").html(`<span style="color:red;">null</span>`);
		                		} 
		                		else {
                					$(this).find("td:nth-child(2)").html(convertRes(element["res"]));
                					$(this).find("td:nth-child(3)").html(convertTTL(element["ttl"]));
		                		}
                			}
						});
                		
                	});
                }
			});
		})();
	});

}

$(document).ready(function(){
	//get IP,country,ISP
	$.ajax({
		url: "https://api.ipify.org?format=json",
		dataType: "JSON",
		type: "GET",
		success: function(data,s,x){
			$("#yourIP").append(data["ip"]);
			function getGeolocation(ipAddr){
				$.ajax({
					url: "https://geo.ipify.org/api/v1?apiKey=at_geam2vZ5jQrVOUcE36i00goWqmz8a&ipAddress=" + ipAddr,
					dataType: "JSON",
					type: "GET",
					success: function(data,s,x){
						$("#yourCountry").append('<i class="' + data["location"]["country"].toLowerCase() + ' flag"></i>' + data["location"]["region"] + ", " + data["location"]["country"]);
						$("#yourISP").append(data["isp"]);
					}
				});
			}
			getGeolocation(data["ip"]);
		}
	});



	$("#info").on('click',function(){
		$("#result").empty();
		var getInputUrl = $("#url").val();
		info_check(getInputUrl);
	});
	$("#http").on('click',function(){
		$("#result").empty();
		var getInputUrl = $("#url").val();
		ping_check(getInputUrl);
	});
	$("#whois").on('click',function(){
		$("#result").empty();
		var getInputUrl = $("#url").val();
		whois_check(getInputUrl);
	});
	$("#dns").on('click',function(){
		$("#result").empty();
		var getInputUrl = $("#url").val();
		dns_check(getInputUrl);
	});
});
