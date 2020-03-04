function get_check_results(getUrl,mySlaves,result){
	$.ajax({
		url: 'https://check-host.net/check-http?host=' + String(getUrl),
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
		let resultId = $("#result"), formId = $("#form");
		resultId.find("tbody").empty();
		resultId.find("thead").empty();
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
	                        trying(getUrl, mySlaves, tries + 1);
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
$(document).ready(function(){
	$("#ping").on('click',function(){
		var mySlaves = ["lv2.node.check-host.net","kz1.node.check-host.net","it1.node.check-host.net","ru3.node.check-host.net","de2.node.check-host.net","nl1.node.check-host.net","fr1.node.check-host.net","us4.node.check-host.net","ru2.node.check-host.net","fi1.node.check-host.net","vn1.node.check-host.net","ir1.node.check-host.net","it2.node.check-host.net","sg1.node.check-host.net","md1.node.check-host.net","us3.node.check-host.net","de1.node.check-host.net","ua2.node.check-host.net","ru1.node.check-host.net","fr2.node.check-host.net","se2.node.check-host.net","lt1.node.check-host.net","ua1.node.check-host.net","ch1.node.check-host.net","us1.node.check-host.net"];
		var result = [];
		let getUrl = $("#url").val();
		get_check_results(getUrl,mySlaves,result);
	});
});
