window.onload=()=>{
    const username = sessionStorage.getItem("username");
    $('.content').show();
    $("#user_username").text(username);
    $("#user_Name").text(sessionStorage.getItem("name"));

    farmerdt();
    addmill_data();
}

function checkUserLogin(){
	const username = sessionStorage.getItem("username");
	    if (!username) {
	        // no user stored → send to login once
	        if (window.location.pathname !== '/login') {
	            window.location.href = 'login';
	        }
	        return;
	    }
		if(username!="admin"){
			$.ajax({
	            url: 'isLoginedIn',
	            type: 'POST',
	            dataType: 'json',
	            contentType: 'application/json',
	            data: JSON.stringify({ "username": username }),
	            success: function(res) {
	                if (res.data !== "success") {
	                    console.warn("Session expired, redirecting to login");
	                    window.location.href = 'login';
	                }
	            },
	            error: function(xhr, textStatus, errorThrown) {
	                console.error('AJAX failed:', textStatus, errorThrown);
	                // only redirect if not already on login page
	                if (window.location.pathname !== '/login') {
	                    window.location.href = 'login';
	                }
	            }
	        });
		}
}
// Periodic check every 30s (only if still logged in)
setInterval(checkUserLogin, 1000);


function farmerdt(){
    var head=document.getElementById("head");
    
    $.ajax({
        url:"getFarmerDetail",
        dataType:'json',
        contentType:'application/json',
        type:'GET',
        success:(res)=>{
            var body=document.getElementById("tbody");
            body.innerHTML="<p></p>";
            body.innerHTML='';
            if (Array.isArray(res) && res.length > 0) {
				var name="";
                res.forEach(d => {
					name = (d.farmer).replaceAll(" ","_"); 
                    var row="<tr>";
                    row+="<td>"+d.farmer+"</td>";
                    row+="<td>"+d.bags+"</td>";
                    row+="<td>"+d.place+"</td>";
                    row+="<td>"+d.mobile+"</td>";
                    row+="<td>"+d.variety+"</td>";
                    row += "<td><button class='reject btn btn-outline-danger' data-toggle='modal' data-target='#RejectModal' onclick=reject('"+d.mobile+"','"+name+"')>Remove</button>&nbsp;<button class='accept btn btn-outline-success' onclick=Edit('"+d.mobile+"','"+d.bags+"','"+d.variety+"')>Edit</button></td></tr>";

                    body.innerHTML+=row;
                })
            }
            else {
                head.innerHTML='';
                head.innerHTML+="<p>No Farmer data Found </p>";
            }
            setTimeout(()=>{imageload()},500);
        },
        error:(res,err)=>{
            console.log(err);
        }
    })
}

var farmerdetails=document.getElementsByClassName("farmer-details")[0];
var milldata=document.getElementsByClassName("mill-data")[0];
var addnewmill=document.getElementsByClassName("add-new-mill")[0];
var addnewfarmer=document.getElementsByClassName("add-new-farmer")[0];
var charts=document.getElementsByClassName("charts")[0];
var dnmilldata=document.getElementById("dnmilldata");

$('.btn1').click(()=>{
    var fname=document.getElementById('fname');
    var fmobile=document.getElementById('fmobile');
    var fvariety=document.getElementById('fvariety');
    var flocation=document.getElementById('flocation');
    var fbags=document.getElementById('fbags');
	const today = new Date();
    var jsondata={
        fname:fname.value,
        fmobile:fmobile.value,
        fvariety:fvariety.value,
        flocation:flocation.value,
        fbags:fbags.value,
		"dt":formatDate(today)
	    }
	
    if(Object.values(jsondata).every(value => value !== "" && value !== null && value !== undefined && value.trim() !== "")
        && ((fmobile.value).length==10 && /^\d+$/.test(fmobile.value)))
    {
        $.ajax({
            url:'addfarmer',
            type:'POST',
            dataType:'json',
            contentType: 'application/json',
            data:JSON.stringify(jsondata),
            success:()=>{
                farmerdetails();
            },
            error:(messge)=>{
                console.log(messge);
            }
        })
    }
    else if((fmobile.value).length != 10 || !/^\d+$/.test(fmobile.value)){
        alert("Invalid mobile number "+fmobile.value);
    }
    else alert("All fields must be filled ");
})

$('#addmillbtn').click(()=>{
    var mname=document.getElementById('millname');
    var mlocation=document.getElementById('mlocation');
    var memail=document.getElementById('memail');
    var jsondata={
        mname:mname.value,
        mlocation:mlocation.value,
        memail:memail.value
    }
    // validateEmail(memail.value);
    if(! validateEmail(memail.value))
    {
        alert("Please enter validate email address ")
        return false;
    }
    if(Object.values(jsondata).every(value => value !== "" && value !== null && value !== undefined && value.trim() !== ""))
    {
        $.ajax({
            url:'addmill',
            type:'POST',
            dataType:'json',
            contentType:'application/json',
            data:JSON.stringify(jsondata),
            success:(res)=>{
                if(res.messg=='success')
                    addmill_data();
            },
            error:(resobj,err)=>{
                console.log(err)
            }
        })
    }
    else alert("All fields must be filled")
})

function addmill_data(){
    var head=document.getElementById("milldata_headingtag")
    $.ajax({
        url:"getMillDetails",
        dataType:'json',
        contentType:'application/json',
        type:'GET',
        success:(res)=>{
            var body=document.getElementById("milldata_body");
            body.innerHTML='';
            if (Array.isArray(res) && res.length > 0) {
                res.forEach(d => {
                    var row="<tr>";
                    row+="<td>"+d.millname+"</td>";
                    row+="<td>"+d.location+"</td>";
					row+="<td>"+d.email+"</td>";
					row+="</tr>";
					body.innerHTML+=row;
                })
            }
            else {
                head.innerHTML='';
                head.innerHTML+="<p>No Mill data Found </p>";
            }
            setTimeout(()=>{imageload()},500);
        },
        error:(err)=>{
            console.log(err);
        }
    })
}
function edited(messg)
{
	alert(messg);
}
function updateDateTime() {
    const dateTimeElement = document.getElementById('dateTime');
    const now = new Date();

    const options = { 
        year: 'numeric', month: '2-digit', day: '2-digit', 
        hour: '2-digit', minute: '2-digit', second: '2-digit', 
        hour12: true 
    };
    const formattedDateTime = now.toLocaleDateString('en-US', options);

    dateTimeElement.textContent = formattedDateTime;
}

updateDateTime();

setInterval(updateDateTime, 1000);

var logout=document.getElementById('logout');
/*logout.onclick=()=>{
	
    window.location.href='login';
}
*/

$('#logout').click(function() {
    var username = sessionStorage.getItem("username");
    $.ajax({
        url: 'logout', 
        type: 'POST',
		contentType: 'application/json', // Add this line
		        data: JSON.stringify({ // Convert to JSON string
		            username: username
		        }),
        success: function(response) {
            window.location.href = 'login';
        },
        error: function(xhr, status, error) {
            console.error('Logout error:', error);
            window.location.href = 'login';
        }
    });
});

function imageload(){
    fetch('imagedata',{
        method:'GET',
        headers:{
            'Content-Type':'application/json'
        }
    }).then(res=>{
        if(!res.ok)
            throw new Error('Network response')
        return res.json()
    }).then(d=>{
        var xlabels=Object.keys(d);
        var ylabels=Object.values(d);
        const colors = [
            '#4a90e2',
            '#50C878',
            '#FF7F50',
            '#9370DB',
            '#FFD700',
            '#FF6B6B',
            '#4CAF50',
            '#9C27B0',
            '#FF9800',
            '#00BCD4'
        ];
        new Chart("myChart", {
            type: "doughnut",
            data: {
                labels: xlabels,
                datasets: [{
                    backgroundColor: colors,
                    data: ylabels
                }]
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: "Types of Varieties "
                }
            }
        });
    }).catch(e=>console.error(e));
}

function toggleProfileDetails() {
    var profileInfo = document.getElementById("profile-info");
    if (profileInfo.style.display === "none" || profileInfo.style.display === "") {
        profileInfo.style.display = "flex";
    } else {
        profileInfo.style.display = "none";
    }
}

var todayLoad=document.getElementById("todayLoad");
var todaygraph=document.getElementById("todaygraph");

todayLoad.addEventListener('click',()=>{ 
    $.ajax({
        url:'getTodayGraph',
        type:'GET',
        dataType:'json',
        contentType:'application/json',
        success:(res)=>{
            var xlabels=Object.keys(res);
            var ylabels=Object.values(res);
            const colors = [
                '#9370DB',
                '#FFD700',
                '#FF6B6B',
                '#4CAF50',
                '#9C27B0',
                '#FF9800',
                '#00BCD4',
                '#4a90e2',
                '#50C878',
                '#FF7F50'
            ];
            new Chart("todayChart",{
                type: "doughnut",
                data: {
                    labels: xlabels,
                    datasets: [{
                        backgroundColor: colors,
                        data: ylabels
                    }]
                },
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: "Types of Varieties "
                    }
                }
            })
        }
    })
});

function closeblur() {
    charts.style.filter='blur(0px)';
    addnewfarmer.style.filter='blur(0px)';
    addnewmill.style.filter='blur(0px)';
    milldata.style.filter='blur(0px)';
    farmerdetails.style.filter='blur(0px)';
}

function openblur() {
    charts.style.filter='blur(8px)';
    addnewfarmer.style.filter='blur(8px)';
    addnewmill.style.filter='blur(8px)';
    milldata.style.filter='blur(8px)';
    farmerdetails.style.filter='blur(8px)';
}

$("#downloadMillData").click(()=>{
    var selectMill=document.getElementById("selectmill");
    selectMill.innerHTML='';
    $.ajax({
        url: 'getMillDetails',
        type: 'GET',
        success: (res) => { 
            console.log("res : ",res)
            var head = "<option value='select'>Select</option>";
            selectMill.innerHTML += head;  
            var val = Object.values(res);
            val.forEach(d => {
                var r = `<option value='${d.millname}'> ${d.millname} </option>`;
                selectMill.innerHTML += r;
            });
        },
        error: (error) => {
            console.error("Error fetching mill details:", error); 
        }
    });
    $("#from").val('');
    $("#to").val('');
    $("#millrow").html('');
	$("#send_email").html('');
})

$("#GetDetails").click(()=>{

    var selectmill=document.getElementById("selectmill");
    var fromdate=document.getElementById("from");
    var todate=document.getElementById("to");
    var err=document.getElementById("err");
    err.style.display='none';
    var mill=(selectmill.value).trim();
    var from=(fromdate.value).trim();
    var to=(todate.value).trim();
    var tbody=document.getElementById("millrow");
    tbody.innerHTML='';
	if(!from_to_validate(from,to))
    {
     tbody.innerHTML='';
        return false;
    }
    
    if(mill!='' && from!='' && to!='')
    {
		$("#send_email").html('');
		//from=formateDate(from);
		//to=formateDate(to);
        mill=mill.replaceAll(" ","_");
		if ($("#send_email").find("p").length === 0) {
			$("#send_email").append("<p onclick=send_email('"+mill+"','"+from+"','"+to+"') style='cursor:pointer;text-decoration: underline;color:red;text-weight:bold'>Send Email</p>");
		}
		else if($("#send_email").find("p").length === 1)
			{
				$("#send_email").append("<p onclick=send_email('"+mill+"','"+from+"','"+to+"') style='cursor:pointer;text-decoration: underline;color:red;text-weight:bold'>Send Email</p>");						
			}
		var jsondata={
            'mill':mill,
            'from':from,
            'to':to
        }
		console.log("json "+jsondata);
        milldatadownload(jsondata).then((res) => {
            $('#downloadmilldataModal').modal('show');
            if(Array.from(res).length>0){
                Array.from(res).forEach(d=>{
                    var row = '<tr>';
                    
                    row += "<td>" + d.sno + "</td>";
                    row += "<td>" + d.date + "</td>";
                    row += "<td>" + d.farmername + "</td>";
                    row += "<td>" + d.vehicle + "</td>";
                    row += "<td>" + d.variety + "</td>";
                    row += "<td>" + d.bags + "</td>";
                    row += "<td>" + d.rate + "</td>";
                    row += "<td>" + d.weight + "</td>";
                    row += "<td>" + d.amt + "</td>";
					row += "<td>" + d.remarks +"</td>";
                    
                    row += '</tr>';
                    tbody.innerHTML+=row;
                })
            }
            else{
				$("#send_email").html('');
                var err=document.getElementById("err");
                err.textContent='No data Found'
            }
        }).catch((err) => {
            console.error(err); 
        });
    } 
});

function formatDate(date1) {
    const date = new Date(date1);
    // Check if the date is valid
    /*if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
    }*/

    // Format the date as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function from_to_validate(from,to)
{
	console.log("from ",from," to ",to);
	var fromDateObj = new Date(from);
		var toDateObj = new Date(to);
		var currentDate = new Date();
        var message='';
		if (fromDateObj > currentDate || toDateObj > currentDate) {
		    alert("The selected dates cannot be greater than the current date.");
            return false;
		}
		 else if (fromDateObj > toDateObj) {
		    alert("The From date cannot be greater than the To date.");
            return false;
		}
		 else if (fromDateObj.getFullYear() === toDateObj.getFullYear() && fromDateObj.getMonth() === toDateObj.getMonth()) {
		    // console.log("The selected dates are in the same month.");
            return true;
		} 
        else if (fromDateObj.getMonth() < currentDate.getMonth() && fromDateObj.getFullYear() === currentDate.getFullYear()) {
            message = " The 'from' date is in the previous month.";
		    alert(message);
            return false;
        } else if (fromDateObj.getMonth() > currentDate.getMonth() && fromDateObj.getFullYear() === currentDate.getFullYear()) {
            message = " The 'from' date cannot be greater than the current month.";
		    alert(message);
            return false;
        }
        else if (toDateObj.getMonth() < currentDate.getMonth() && toDateObj.getFullYear() === currentDate.getFullYear()) {
            message = " The 'to' date is in the previous month.";
		    alert(message);
            return false;
        } else if (toDateObj.getMonth() > currentDate.getMonth() && toDateObj.getFullYear() === currentDate.getFullYear()) {
            message = " The 'to' date cannot be greater than the current month.";
		    alert(message);
            return false;
        }
		else {
            return true;
		}
		
}

function milldatadownload(jsondata) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url:"getSelectedMilldata",
            type:'POST',
            dataType:'json',
            data:JSON.stringify(jsondata),
            contentType:'application/json',
            success:(res)=>{
				console.log("res ",res);
                resolve(res); 
            },
            error:(resobj,err)=>{
                reject(err);
            }
        })
    })
}

$("#millBill").click(()=>{
    var selectCommision=document.getElementById("selectCommision");
    selectCommision.innerHTML='';
	const now = new Date();
	const options = { 
	        year: 'numeric', month: '2-digit', day: '2-digit'
	    };
	var formattedDateTime = now.toLocaleDateString('en-US', options);

	const dateParts = formattedDateTime.split('/');
	formattedDateTime = dateParts[1]+"/"+dateParts[0]+"/"+dateParts[2]; 
	$("#Milldate").val(formattedDateTime);
	$("#Milldate").attr("value", formattedDateTime);

    $.ajax({
        url:"ComDetails",
        type:"GET",
        dataType:"json",
        success:(res)=>{
            selectCommision.innerHTML+=`
                <option>Select</option>
            `;
            var val=Object.values(res);
            val.forEach(d=>{
                var opt='<option value='+d.replaceAll(" ","_")+'>'+d+'</option>';
                selectCommision.innerHTML+=opt;
            })
            selectCommision.innerHTML+='<option value=none>None</option>';
        },
        error:(obj,res)=>{
            console.log(res)
        }
    });
	var selectMillnames=document.getElementById("millSelected");
	selectMillnames.innerHTML='';
	$.ajax({
		url : "getMillDetails",
		type:"GET",
		dataType:"json",
		success:(res)=>{
			selectMillnames.innerHTML+=`
			<option>Select</option>`;
			
			var val=Object.values(res);
			val.forEach(d=>{
				selectMillnames.innerHTML+='<option value='+(d.millname).replaceAll(" ","_")+'>'+d.millname+'</option>';
			})
		}
	})
})

$("#millclose").click(()=>{
})

$("#MillMObile").keyup(()=>{
    var val=$("#MillMObile").val();
    $.ajax({
        url:"getFarmerDetailsForMillBill",
        type:"POST",
        datType:"json",
        contentType:'application/json',
        data:JSON.stringify({mobile:val}),
        success:(res)=>{
            if(res)
            {
                $("#farmerplace").val(res.location);
                $("#MillVariety").val(res.variety);
                $("#millbags").val(res.bags);
                $("#farmername").val(res.name);
            }
        }
    })
})

$("#millbillbtn").click(()=>{
    var farmername= $.trim($("#farmername").val()).toLowerCase().replace(/\b\w/g, function(char) {
        return char.toUpperCase();
    });
    var commission=document.getElementById("selectCommision").value;
    

    var date=$.trim($("#Milldate").val());
    var farmerloc=$.trim($("#farmerplace").val());
    var vehicle=$.trim($("#vehicle").val()).toUpperCase();
    var variety = $.trim($("#MillVariety").val());
    var bags=$.trim($("#millbags").val());
    var weight=$.trim($("#millweight").val());
	var remarks= $("#millbillremarks").val();
	remarks = remarks.replaceAll(" ","_");
    var cost=$.trim($("#millcost").val());
    var MillMObile=$.trim($("#MillMObile").val());
    var millname= $.trim($("#millSelected").val()).toLowerCase().replace(/\b\w/g, function(char) {
        return char.toUpperCase();
    });
	date = formatDate($("#Milldate").val()); 

    if(farmername!=''&&commission!=''&&date!=''&& farmerloc!=''&&vehicle!=''&&variety!=''&&bags!=''&&weight!=''&&cost!=''&&millname!=''&&(millname!='Select')||(millname!='select'))
    {
        var jsondata={
            farmer:farmername,
            comm:commission,
            dt:date,
            farmerplace:farmerloc,
            vehicleno:vehicle,
            item:variety,
            bag:bags,
            weights:weight,
            amt:cost,
            mill:millname,
            mobile:MillMObile,
			remark : remarks
        }
        $.ajax({
            url:"savemillbilldata",
            type:'POST',
            dataType:'json',
            data:JSON.stringify(jsondata),
            contentType:'application/json',
            success:(res)=>{
                if(res.messg=="success"){
                   // settle(MillMObile);
                }
                else alert(res.messg);
            },
            error:(obj,err)=>{
                console.log(obj,err)
            }
        });
    }
    else alert("Please fill all fields");
})

$(".downloadBtn").click((e)=>{
    e.preventDefault();
    var selectmill=document.getElementById("selectmill");
    var fromdate=document.getElementById("from");
    var todate=document.getElementById("to");
    
    var mill=(selectmill.value).trim();
    var from=(fromdate.value).trim();
    var to=(todate.value).trim();
  //  from=formateDate(from);
   // to = formateDate(to);
	mill= mill.replaceAll(" ","_");
	console.log("mill ",mill," from ",from," to ",to);
	//var tbody=document.getElementById("millrow");
    //tbody.innerHTML='';

    
    if(mill!='' && from!='' && to!='')
    {
        var jsondata={
            'mill':mill,
            'from':from,
            'to':to
        }
		err.textContent="";
        milldatadownload(jsondata).then((res) => {
            if(Array.from(res).length>0){
                const ws=XLSX.utils.json_to_sheet(res);
                const wx=XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wx,ws,"sheet1");
                XLSX.writeFile(wx,mill+".xlsx");
            }
            else{
                var err=document.getElementById("err");
                err.textContent="No data Found";
            }
        }).catch((err) => {
            console.error(err); 
        });
    }
})

var addcomission=document.getElementById("addcomission");
$("#comission").click(()=>{
	
})

$("#combtn").click(()=>{
    var cname=document.getElementById("comname").value;
    var cmobile=document.getElementById("commobile").value;
    var clocation=document.getElementById("complace").value;

    if(cname.trim()!='' && cmobile.trim()!='' && clocation.trim()!='' && cmobile.length==10)
    {
        var jsondata={
            'name':cname,
            'mobile':cmobile,
            'clocation':clocation
        }
        
        $.ajax({
            url:'saveComDetails',
            type:'POST',
            dataType:'text',
            data:JSON.stringify(jsondata),
            contentType:'application/json',
            success:(res)=>{
                var error=document.getElementById("error");
                error.textContent=res;
            },
            error:(obj,er)=>{
                console.log(er)
            }
        })
    }
	else if(cmobile.length!=10){
		alert("Invalid Mobile number")
	}
    else alert("Please Fill all fields");
})


var getComData=document.getElementsByClassName("getComData")[0];
var selectCom=document.getElementById("selectCom");

getComData.onclick=()=>{
    selectCom.innerHTML='';
	$("#comdatato").val("");
	$("#comdatafrom").val("");
	$("#comrow").html("");
    $.ajax({
        url:"ComDetails",
        type:'GET',
        dataType:'json',
        contentType:'application/json',
        success:(res)=>{
            var head="<option value=select>Select</option>";
            selectCom.innerHTML+=head;
            var val=Object.values(res);
            val.forEach(d=>{
                var r = "<option value='" + d.replaceAll(" ", "_") + "'>" + d + "</option>";
                selectCom.innerHTML += r;
            })
        },
        error:(obj,er)=>{
            console.log(er)
        }
    })
}


$("#comgetdata").click((e)=>{
    e.preventDefault();
    var comm=$.trim($("#selectCom").val());
    var from=$.trim($("#comdatafrom").val())
    var to=$.trim($("#comdatato").val())
    var comrow=document.getElementById("comrow");
    comrow.innerHTML='';

	if(!from_to_validate(from,to))
    {
        comrow.innerHTML='';
        return false;
    }
    if(comm!=''&&from!=''&&to!='')
    {
	    //from = formateDate(from);
		//to = formateDate(to);
        var json={
            'comm':comm,
            'from':from,
            'to':to
        }
		$("#comerr").text("");
        $.ajax({
            url:"displayComdetails",
            type:'POST',
            dataType:'json',
            data:JSON.stringify(json),
            contentType:'application/json',
            success:(res)=>{
                var comthead=document.getElementById("comthead");

                
                if(Array.from(res).length>0){
                    res.forEach(d=>{
                        var row="<tr>";
                        row+="<td>"+d.Sno+"</td>";
                        row+="<td>"+d.Date+"</td>";
                        row+="<td>"+d.Farmer_Name+"</td>";
                        row+="<td>"+d.Bags+"</td>";
                        row+="<td>"+d.Variety+"</td>";
                        row+="<td>"+d.Rate+"</td>";
                        row+="<td>"+d.Weight+"</td>";
                        row+="<td>"+d.Amount+"</td>";
                        comrow.innerHTML+=row;
                    })
                }
                else {
                    comthead.innerHTML='';
                    $("#comerr").text("No data Found");
                }
            },
            error:(res,err)=>{
                console.log(res,err)
            }
        })
    }	 
    else alert("All flieds must be filled")
	
})

$("#comdwbtn").click(()=>{
    var comm=$.trim($("#selectCom").val());
    var from=$.trim($("#comdatafrom").val())
    var to=$.trim($("#comdatato").val())

    if(comm!=''&&from!=''&&to!='')
    {
        var json={
            'comm':comm,
            'from':from,
            'to':to
        }
        $.ajax({
            url:"displayComdetails",
            type:'POST',
            dataType:'json',
            data:JSON.stringify(json),
            contentType:'application/json',
            success:(res)=>{
                const ws=XLSX.utils.json_to_sheet(res);
                const wx=XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wx,ws,"sheet1");
                XLSX.writeFile(wx,comm+".xlsx");
            },
            error:(res,err)=>{
                console.log(res,err)
            }
        })
    }
    else alert("please fill all fields");
})

$("#farmerBill").click(()=>{
    var arr=["name","mobile","place","Variety","Bags","Weight","Cost","Amt","OldAmt","LabourBill","LoadingAmt"];
    
    for(let i=0;i<arr.length;i++)
    {
        $("#receipt"+arr[i]).val("");
    }
})

$("#receiptbtn").click(async (e) => {
	e.preventDefault();
    var name = $("#receiptname").val();
    var mobile = $("#receiptmobile").val();
    var place = $("#receiptplace").val();
    var variety = $("#receiptVariety").val();
    var bags = $("#receiptBags").val();
    var cost = $("#receiptCost").val();
    var amt = $("#receiptAmt").val();
    var weight = $("#receiptWeight").val();
    var date = $("#receiptDate").val();
    var oldamt=$("#receiptOldAmt").val();
    var labbill=$("#receiptLabourBill").val();
    var loadbill=$("#receiptLoadingAmt").val();

    var totalbal=(amt-oldamt-labbill-loadbill).toString();
    if (name.trim() && mobile.trim() && place.trim() && variety.trim() && bags.trim() && cost.trim() && amt.trim() && weight.trim()) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();

        pdf.setFontSize(22);
        pdf.setTextColor(0, 0, 128);
        pdf.text("Farmer Bill", 80, 20);

        pdf.setDrawColor(255, 215, 0);
        pdf.setLineWidth(1.5);
        pdf.line(10, 25, 200, 25);

        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Name: `+name, 10, 40);
        pdf.text(`Mobile: `+mobile, 10, 50);
        pdf.text(`Address: `+place, 150, 50);
        pdf.text(`Date: `+date, 150, 40);

        pdf.setFontSize(12);
        pdf.setFillColor(230, 230, 250);
        pdf.rect(10, 80, 180, 10, 'F');
        pdf.setTextColor(0, 0, 0);
        pdf.text("Variety", 15, 85);
        pdf.text("Weight",40,85);
        pdf.text("Bags", 80, 85);
        pdf.text("Rate", 120, 85);
        pdf.text("Amount", 160, 85);
        pdf.text("MC Cuttings ", 125, 105);
        pdf.text("Labour Bill", 125, 115);
        pdf.text("Due Amount",125, 125);

        pdf.setTextColor(0, 0, 0);
        pdf.text(variety, 15, 95);
        pdf.text(weight, 40,95);
        pdf.text(bags, 80, 95);
        pdf.text(cost, 120, 95);
        pdf.text(amt, 160, 95);
        pdf.text("- "+loadbill, 160, 104);
        pdf.text("- "+labbill, 160 , 115);
        pdf.text("- "+oldamt, 160 , 125);

        pdf.setFillColor(255, 215, 0);
        pdf.rect(125, 130, 52, 12, 'F');
        pdf.setTextColor(0, 0, 0);
        pdf.text("Total", 127, 135);
        pdf.text(totalbal, 160, 135);

        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text("Thank you for your business!", 80, 160);
        pdf.text("Company Name - Sri Naga Lakshmi Lorry Service", 65, 167);

        pdf.save(name+".pdf");
		
        var jsondt={
            "cost":cost,
            "amt":amt,
            "mobile":mobile
        }
        
        $.ajax({
            url:"modifyFarmerdetails",
            dataType:"json",
            contentType:'application.json',
            type:"POST",
            data:JSON.stringify(jsondt),
            success:(res)=>{
                console.log(res)
            },
            error:(res,err)=>{
                console.log(err)
            }
        })
    } else {
        alert("All fields must be filled");
    }
});

$("#receiptmobile").keyup(()=>{
    var amt=$("#receiptAmt").val();
    var err=document.getElementById("receipterr"); 
    var mobile=$("#receiptmobile").val();
    var jsondata={
        'mobile':mobile
    }
    if(mobile.trim()!='' && mobile.length==10){
        err.style.display="none";
        $.ajax({
            url:'getFarmerBill',
            dataType:'json',
            type:'POST',
            contentType:'application/json',
            data:JSON.stringify(jsondata),
            success:(res)=>{
                $("#receiptname").val(res.name);
                $("#receiptmobile").val(res.mobile);
                $("#receiptplace").val(res.place);
                $("#receiptVariety").val(res.variety);
                $("#receiptBags").val(res.bags);
                $("#receiptWeight").val(res.weight);
                $("#receiptDate").val(res.date);
                $("#receiptCost").keyup(()=>{
                    var cost=$("#receiptCost").val();
                    var bags=$("#receiptBags").val();
                    var weight=$("#receiptWeight").val();
                    var total=((weight-bags)/75)*cost;
                    total = Math.round(total);
                    $("#receiptAmt").val(total);
                })
            },
            error:(err)=>{
                console.error(err)
            }
        })
    }
    else {
        err.style.display="block";
        err.textContent="Invalid Mobile";
        $("#receiptname").val('');
        $("#receiptplace").val('');
        $("#receiptVariety").val('');
        $("#receiptBags").val('');
        $("#receiptWeight").val('');
        $("#receiptCost").val('');
    }
})

$("#receiptclose").click(()=>{
    $("#farmerReceipt").hide();
    closeblur();
})

function settle(mobile) {
    var val=mobile;
    var jsondata={
        'mobile':val
    }
    $.ajax({
        url:'settlefarmer',
        type:'POST',
        dataType:'json',
        contentType:'application/json',
        data:JSON.stringify(jsondata),
        success:()=>{
            setTimeout(() => {
                farmerdt();
            }, 500);
        },
        error:(err)=>{
            console.log(err)
        }
    })
}

function reject(mobile,name) {
    var val=mobile;
    var jsondata={
        'mobile':val
    }
	name = name.replaceAll("_"," ");
    $("#RejectModalLabel").html("<p>Are you sure you want to delete this user ?<br>"+name.toUpperCase()+"</p>");
	$("#delete_user").click(()=>{ 
        $.ajax({
            url:'rejectFarmer',
            type:'POST',
            dataType:'json',
            contentType:'application/json',
            data:JSON.stringify(jsondata),
            success:(res)=>{
                setTimeout(() => {
                    farmerdt();
                }, 500);
                console.log(res);
            },
            error:(resobj,err)=>
            {
                console.log(resobj,err);    
            }
        });
	});
}

/*$("#editformclose").click(()=>{
    $("#editform").hide();
    closeblur();
})*/

function Edit(mobile,bags,variety) {
    /*openblur();
    var form=document.getElementById("editform");
    form.style.display="block";*/
	$("#EditScrollable").modal('show');
    var jsondt={"mobile":mobile,"bags":bags,"variety":variety};
    $.ajax({
        url: "getEditFarmerdetails",
        dataType: 'json',
        type: "POST",
        contentType: 'application/json',
        data:JSON.stringify(jsondt),
        success: (res) => {
            res=JSON.stringify(res); 
            res=JSON.parse(res);
            $("#editFname").val(res.name);
            $("#editFbag").val(res.bag);
            $("#editFplace").val(res.place);
            $("#editFmobile").val(res.mobile);
            $("#editFvariety").val(res.variety);
            $("#edithidden").val(res.mobile);
        },
        error: (xhr, error) => {
            console.error(xhr.responseText);
            console.error(error);
        }
    })
}

$("#editsubmit").click(()=>{
    var name=$.trim($("#editFname").val());
    var bag=$.trim($("#editFbag").val());
    var place=$.trim($("#editFplace").val());
    var mob=$.trim($("#editFmobile").val());
    var item=$.trim($("#editFvariety").val());
    var hiddenmob=$.trim($("#edithidden").val());
    
    if(name!=''&& bag!=''&&place!=''&&mob!=''&&item!='')
    {
        var jsonData = {
            "name": name,
            "bag": bag,
            "place": place,
            "mobile": hiddenmob,
            "chmobile":mob,
            "variety": item
        };
        $.ajax({
            url: 'updateFarmerdata',
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(jsonData),
            success: function() {
                farmerdt();
				$("#EditScrollable").modal('hide');
            },
            error: function(error) {
                console.log('Error:', error);
            }
        });
    }
    else alert("All fields must be filled");
});

function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function send_email(mill,from,to)
{
	//from = formateDate(from);
	//to =formateDate(to);
	let userEmail = prompt("Please enter your email address:");

	if (userEmail && validateEmail(userEmail)) {
	    //alert("Thank you! Your email is: " + userEmail);
	} else {
	    alert("Invalid email entered. Please try again.");
	}
	console.log("mill ",mill,"from ",from,"to ",to);
	if(mill!='' && from !='' && to!='' && userEmail){
		var jsondata={
		"mill":mill,
		"from":from,
		"to":to,
		"to_Email":userEmail
		}
		
				$.ajax({
			           url: 'generate',
			           method: 'POST',
			           contentType: 'application/json',
			           data: JSON.stringify(jsondata),
			           success: function(response) {
			               alert("Email sent "); // Notify user that file has been saved successfully
			           },
			           error: function(err) {
			               console.error(err);
			               alert("Email Sent Failed ");
			           }
			       });
	 }
}
