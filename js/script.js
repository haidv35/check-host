function ping_check(getInputUrl,mySlaves,result){
	$.ajax({
		url: 'https://check-host.net/check-http?host=' + String(getInputUrl),
		method: "GET",
		headers: {
			"Accept":"application/json"
		},
		success: function(data,status,xhr){
			// console.log(data);
		},
		error: function(){
		}
	}).done(function(request){
		$("#result").append("<table class=\"ui unstackable table\"><thead></thead><tbody></tbody></table>");
		let resultId = $("#result").find("table"), formId = $("#form");
		if(request.error === "limit_exceeded"){
			formId.find("p").remove();
			formId.append("<p style='color:red'>Bạn đã kiểm tra trang này quá nhiều lần. Vui lòng thử lại sau 5 phút.</p>");
			return;
		}
		formId.find("p").remove();
		$("body").append('<div class="ui active dimmer" id="loader"><div class="ui loader"></div></div>');
		resultId.find("thead").html("<tr><th>Location</th><th>Time</th><th>Code</th></tr>");
		
		let tries = 0;
		function trying(salves,tries){
			$.ajax({
				url: 'https://check-host.net/check-result/' + request['request_id'],
				method: "GET",
				headers: {
					"Accept":"application/json"
				},
				success: function(data,status,xhr){
					for (slave in data) {
	                    for (var i = 0; i < mySlaves.length; i++) {
	                        if (mySlaves[i] === slave && data[slave] != null) {
	                            let spliceSlave = mySlaves.splice(i, 1);
	                            result.push({
	                            	host: request["nodes"][slave][1] + ", " + request["nodes"][slave][2],
	                            	value: data[slave]
	                            });
	                            break;
	                        }
	                    }
	                    // console.log(slave + ": " +data[slave]);
	                }
	                if (mySlaves.length > 0) {
	                    setTimeout(function() {
	                        trying(getInputUrl, mySlaves, tries + 1);
	                    }, 1000);
	                }
	                else{
	                	$("body").find("#loader").remove();
	                	result.forEach(element => {
	                		if(element["value"][0][3] == null){
	                			$("#result").find("tbody").append("<tr><td>" + element["host"] +"</td><td></td><td style='color:red'>" + element["value"][0][2] +"</td></tr>");
	                		} 
	                		else {
	                			$("#result").find("tbody").append("<tr><td>" + element["host"] +"</td><td>" + Math.round(element["value"][0][1] * 1000) / 1000 + "s" + "</td><td>" + element["value"][0][3]  + " (" + element["value"][0][2] + ")" +"</td></tr>");
	                		}
	                	});
	                }
				},
				error: function(){

				}
			});
		}
		if(tries < 25){
			trying(mySlaves,0);
		}
		
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
				$("#result").append("<div class='ui one column centered grid'><span style='color:red'>Không tìm thấy</span></div>");
			}
			
		}
	});
}
function info_check(getInputUrl){
	let resultId = $("#result");
	resultId.append('<table class="ui celled striped unstackable table"><tbody></tbody></table>');
	let resultTbody = resultId.find("tbody");
	let appendDefaultRow = function(content){
		resultTbody.append(content);
	}

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
			console.log(data);
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
function dns_check(getInputUrl,mySlaves,result){
	$.ajax({
		url: 'https://check-host.net/check-dns?host=' + String(getInputUrl),
		method: "GET",
		headers: {
			"Accept":"application/json"
		},
		success: function(data,status,xhr){
			// console.log(data);
		},
		error: function(){
		}
	}).done(function(request){
		$("#result").append("<table class=\"ui unstackable table\"><thead></thead><tbody></tbody></table>");
		let resultId = $("#result").find("table"), formId = $("#form");
		$("body").append('<div class="ui active dimmer" id="loader"><div class="ui loader"></div></div>');
		resultId.find("thead").html("<tr><th>Location</th><th>Result</th><th>TTL</th></tr>");
		
		let tries = 0;
		function trying(salves,tries){
			$.ajax({
				url: 'https://check-host.net/check-result/' + request['request_id'],
				method: "GET",
				headers: {
					"Accept":"application/json"
				},
				success: function(data,status,xhr){
					for (slave in data) {
	                    for (var i = 0; i < mySlaves.length; i++) {
	                        if (mySlaves[i] === slave && data[slave] != null) {
	                            let spliceSlave = mySlaves.splice(i, 1);
	                            let dataSlave = data[slave][0];
	                            result.push({
	                            	host: request["nodes"][slave][1],
	                            	res: [...dataSlave['A'],...dataSlave['AAAA']],
	                            	ttl: dataSlave['TTL']
	                            });
	                            break;
	                        }
	                    }
	                }
	                if (mySlaves.length > 0) {
	                    setTimeout(function() {
	                        trying(getInputUrl, mySlaves, tries + 1);
	                    }, 1000);
	                }
	                else{
	                	$("body").find("#loader").remove();
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
                			$("#result").find("tbody").append("<tr><td>" + element["host"] +"</td><td>" + convertRes(element["res"]) + "</td><td>" + convertTTL(element["ttl"]) + "</td></tr>");
	                	});
	                }
				},
				error: function(){

				}
			});
		}
		if(tries < 25){
			trying(mySlaves,0);
		}
		
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
		let getInputUrl = $("#url").val();
		info_check(getInputUrl);
	});
	$("#ping").on('click',function(){
		$("#result").empty();
		let getInputUrl = $("#url").val();
		let mySlaves = ["lv2.node.check-host.net","kz1.node.check-host.net","it1.node.check-host.net","ru3.node.check-host.net","de2.node.check-host.net","nl1.node.check-host.net","fr1.node.check-host.net","us4.node.check-host.net","ru2.node.check-host.net","fi1.node.check-host.net","vn1.node.check-host.net","ir1.node.check-host.net","it2.node.check-host.net","sg1.node.check-host.net","md1.node.check-host.net","us3.node.check-host.net","de1.node.check-host.net","ua2.node.check-host.net","ru1.node.check-host.net","fr2.node.check-host.net","se2.node.check-host.net","lt1.node.check-host.net","ua1.node.check-host.net","ch1.node.check-host.net","us1.node.check-host.net"];
		let result = [];
		ping_check(getInputUrl,mySlaves,result);
	});
	$("#whois").on('click',function(){
		$("#result").empty();
		let getInputUrl = $("#url").val();
		whois_check(getInputUrl);
	});
	$("#dns").on('click',function(){
		$("#result").empty();
		let getInputUrl = $("#url").val();
		let mySlaves = ["lv2.node.check-host.net","kz1.node.check-host.net","it1.node.check-host.net","ru3.node.check-host.net","de2.node.check-host.net","nl1.node.check-host.net","fr1.node.check-host.net","us4.node.check-host.net","ru2.node.check-host.net","fi1.node.check-host.net","vn1.node.check-host.net","ir1.node.check-host.net","it2.node.check-host.net","sg1.node.check-host.net","md1.node.check-host.net","us3.node.check-host.net","de1.node.check-host.net","ua2.node.check-host.net","ru1.node.check-host.net","fr2.node.check-host.net","se2.node.check-host.net","lt1.node.check-host.net","ua1.node.check-host.net","ch1.node.check-host.net","us1.node.check-host.net"];
		let result = [];
		dns_check(getInputUrl,mySlaves,result);
	});
});
