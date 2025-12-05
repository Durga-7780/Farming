  
     	//getting farmer details
     	
     	window.onload=()=>{
			if(sessionStorage.getItem("login")=="yes")
				{
					$("#user_username").text(sessionStorage.getItem("username"));
					$("#user_Name").text(sessionStorage.getItem("name"));
				}
			else window.location.href='login';
     		farmerdt();
			addmill_data();
     	}
     	
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
                     res.forEach(d => {
        			var row="<tr>";
        			row+="<td>"+d.farmer+"</td>";
        			row+="<td>"+d.bags+"</td>";
        			row+="<td>"+d.place+"</td>";
        			row+="<td>"+d.mobile+"</td>";
        			row+="<td>"+d.variety+"</td>";
        			row += "<td><button class='reject btn btn-outline-danger' onclick=reject('"+d.mobile+"')>Remove</button>&nbsp;<button class='accept btn btn-outline-success' onclick=Edit('"+d.mobile+"','"+d.bags+"','"+d.variety+"')>Edit</button></td></tr>";

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
     		
     		
     		var jsondata={
     				fname:fname.value,
     				fmobile:fmobile.value,
     				fvariety:fvariety.value,
     				flocation:flocation.value,
     				fbags:fbags.value
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
     		var mmobile=document.getElementById('mmobile');
     		var jsondata={
     				mname:mname.value,
     				mlocation:mlocation.value,
     				mmobile:mmobile.value
     		}
			if((mmobile.value).length!=10)
			{
				alert("Please enter validate mobile number ")
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
        logout.onclick=()=>{
        	window.location.href='login';
        }
			
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
		        	//var colors = ['#FF0000', '#0000FF', '#FFFF00', '#008000', '#FFA500', '#808080', '#000000', '#800080', '#FFC0CB', '#A52A2A', '#00FFFF', '#FF00FF', '#00FF00', '#808000', '#000080', '#008080', '#800000', '#C0C0C0', '#FFD700', '#EE82EE', '#4B0082', '#FF7F50'];
					const colors = [
							        	    '#4a90e2',  // Blue
							        	    '#50C878',  // Emerald Green
							        	    '#FF7F50',  // Coral
							        	    '#9370DB',  // Medium Purple
							        	    '#FFD700',  // Gold
							        	    '#FF6B6B',  // Salmon Pink
							        	    '#4CAF50',  // Material Green
							        	    '#9C27B0',  // Purple
							        	    '#FF9800',  // Orange
							        	    '#00BCD4'   // Cyan
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
		
       // Today loadings
            var todayLoad=document.getElementById("todayLoad");
            var todaygraph=document.getElementById("todaygraph");
            
            /*todaygraph.addEventListener('mouseleave',()=>{
            	todaygraph.style.display='none';
            	closeblur();
            })*/

            todayLoad.addEventListener('click',()=>{ 
            	//$("#addcomission").css("display","none");
            	//todaygraph.style.display='block';
            	//$(".formContainer").css("display","none");
            	//$("#farmerReceipt").hide();
            	//$("#editform").hide();
            	$.ajax({
            		url:'getTodayGraph',
            		type:'GET',
            		dataType:'json',
            		contentType:'application/json',
            		success:(res)=>{
            			var xlabels=Object.keys(res);
            			var ylabels=Object.values(res);
            			//var colors = ['#FF0000', '#0000FF', '#FFFF00', '#008000', '#FFA500', '#808080', '#000000', '#800080', '#FFC0CB', '#A52A2A', '#00FFFF', '#FF00FF', '#00FF00', '#808000', '#000080', '#008080', '#800000', '#C0C0C0', '#FFD700', '#EE82EE', '#4B0082', '#FF7F50'];
						const colors = [
								        	    
								        	    '#9370DB',  // Medium Purple
								        	    '#FFD700',  // Gold
								        	    '#FF6B6B',  // Salmon Pink
								        	    '#4CAF50',  // Material Green
								        	    '#9C27B0',  // Purple
								        	    '#FF9800',  // Orange
								        	    '#00BCD4',   // Cyan
												'#4a90e2',  // Blue
								        	    '#50C878',  // Emerald Green
								        	    '#FF7F50',  // Coral
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
          
          
         function closeblur()
            {
            	charts.style.filter='blur(0px)';
            	addnewfarmer.style.filter='blur(0px)';
            	addnewmill.style.filter='blur(0px)';
            	milldata.style.filter='blur(0px)';
            	farmerdetails.style.filter='blur(0px)';
            }
        function openblur()
        {
        	charts.style.filter='blur(8px)';
        	addnewfarmer.style.filter='blur(8px)';
        	addnewmill.style.filter='blur(8px)';
        	milldata.style.filter='blur(8px)';
        	farmerdetails.style.filter='blur(8px)';
        }
 
        // downloadMillData
        
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
	        
        	if(mill!='' && from!='' && to!='')
	        {
	        	var jsondata={
	        			'mill':mill,
	        			'from':from,
	        			'to':to
	        	}
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
		     	            
		     	            row += '</tr>';
		     			tbody.innerHTML+=row;
		        	  })
	        		}
			        	else{
			        		var err=document.getElementById("err");
			        		err.textContent='No data Found'
			        	}
	        	}).catch((err) => {
	        	    console.error(err); 
	        	});
	        } 
        })
        
        function milldatadownload(jsondata)
        {
        	return new Promise((resolve, reject) => {
        	$.ajax({
        		url:"getSelectedMilldata",
        		type:'POST',
        		dataType:'json',
        		data:JSON.stringify(jsondata),
        		contentType:'application/json',
        		success:(res)=>{
        			resolve(res); 
        		},
        		error:(resobj,err)=>{
        			reject(err);
        		}
        	})
        	})
        }
        
        
        
        // Adding mill Bill
        $("#millBill").click(()=>{
        	//$(".formContainer").css("display","block"); 
        	//$("#todaygraph").css("display","none");
        	//$("#addcomission").css("display","none");
        	//$("#farmerReceipt").css("display","none");
        	//$("#editform").hide();
        	//openblur();
        	var selectCommision=document.getElementById("selectCommision");
        	
        	selectCommision.innerHTML='';
        	
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
        				var opt='<option value='+d.replace(" ","_")+'>'+d+'</option>';
        				selectCommision.innerHTML+=opt;
        			})
        			selectCommision.innerHTML+='<option value=none>None</option>';
        		},
        		error:(obj,res)=>{
        			console.log(res)
        		}
        	})
        	
        })
        $("#millclose").click(()=>{
        	//$(".formContainer").css("display","none");
        	//closeblur();
        })
        // getting farmer details for mill bill
        
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
        
        
        
        // saving Mill bill data
        $("#millbillbtn").click(()=>{
        	var farmername= $.trim($("#farmername").val()).toLowerCase().replace(/\b\w/g, function(char) {
        	    return char.toUpperCase();
        	});
         	var commission=document.getElementById("selectCommision").value;
         	
         	console.log(commission)
         	var date=$.trim($("#Milldate").val());
         	var farmerloc=$.trim($("#farmerplace").val());
         	var vehicle=$.trim($("#vehicle").val()).toUpperCase();
         	var variety = $.trim($("#MillVariety").val());
         	var bags=$.trim($("#millbags").val());
         	var weight=$.trim($("#millweight").val());
         	var cost=$.trim($("#millcost").val());
         	var MillMObile=$.trim($("#MillMObile").val());
         	var millname= $.trim($("#millSelected").val()).toLowerCase().replace(/\b\w/g, function(char) {
         	    return char.toUpperCase();
         	});

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
                     mobile:MillMObile
                 }
                 $.ajax({
                     url:"savemillbilldata",
                     type:'POST',
                     dataType:'json',
                     data:JSON.stringify(jsondata),
                     contentType:'application/json',
                     success:(res)=>{
                    	 if(res.messg=="success"){
							settle(MillMObile);
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
        
        //downloadBtn excel
        
        $(".downloadBtn").click((e)=>{
        	e.preventDefault();
        	 var selectmill=document.getElementById("selectmill");
             var fromdate=document.getElementById("from");
             var todate=document.getElementById("to");
             
             	var mill=(selectmill.value).trim();
             	var from=(fromdate.value).trim();
             	var to=(todate.value).trim();
             	
             	var tbody=document.getElementById("millrow");
     	        tbody.innerHTML='';
     	        
             	if(mill!='' && from!='' && to!='')
     	        {
     	        	var jsondata={
     	        			'mill':mill,
     	        			'from':from,
     	        			'to':to
     	        	}
     	        	milldatadownload(jsondata).then((res) => {
    	        	    if(Array.from(res).length>0){
		     	        	const ws=XLSX.utils.json_to_sheet(res);
		     	        	const wx=XLSX.utils.book_new();
		     	        	XLSX.utils.book_append_sheet(wx,ws,"sheet1");
		     	        	XLSX.writeFile(wx,mill+".xlsx");
    	        	    }
    	        	    else{
    	        	    	var err=document.getElementById("err");
    	        	    	err.textContent="No data Found"
    	        	    }
    	        	}).catch((err) => {
    	        	    console.error(err); 
    	        	});
     	        }
        })
        
        var addcomission=document.getElementById("addcomission");
        //adding comission 
        $("#comission").click(()=>{
        	//$(".formContainer").css("display","none"); 
        	//$("#todaygraph").css("display","none");
        	//$("#farmerReceipt").hide();
        	//$("#editform").hide();
        	//addcomission.style.display='block';
        	//openblur();
        })
        $("#combtn").click(()=>{
        	
        	var cname=document.getElementById("comname").value;
        	var cmobile=document.getElementById("commobile").value;
        	var clocation=document.getElementById("complace").value;
        
	        if(cname.trim()!='' && cmobile.trim()!='' && clocation.trim()!='')
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
        else alert("Please Fill al fields");
        })
        
        var addcomissionclose=document.getElementById("addcomissionclose");
        addcomissionclose.onclick=()=>{
        	closeblur();
        	addcomission.style.display='none';
        }
        var getComData=document.getElementsByClassName("getComData")[0];
        var selectCom=document.getElementById("selectCom");
        
        getComData.onclick=()=>{
        	selectCom.innerHTML='';
        	$("#addcomission").hide();
        	$("#displayCommData").show();
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
        				 var r = "<option value='" + d.replace(" ", "_") + "'>" + d + "</option>";
        			    selectCom.innerHTML += r;
        			})
        		},
        		error:(obj,er)=>{
        			console.log(er)
        		}
        	})
        }
        $("#displayCommclose").click(()=>{
        	closeblur();
        	$("#displayCommData").hide();
        })
        
        
        $("#comgetdata").click((e)=>{
        	e.preventDefault();
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
						var comthead=document.getElementById("comthead");
						var comrow=document.getElementById("comrow");
						comrow.innerHTML='';
					
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
							("#comerr").textContent="No data Found";
						}
        			},
        			error:(res,err)=>{
        				console.log(res,err)
        			}
        			
        		})
        	}
        	else alert("All flieds must be filled")
        	
        })
        
		// download for comission details
		
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
	        /*$("#farmerReceipt").show();
	        $("#addcomission").hide();
        	$(".formContainer").css("display","none");
        	$("#dnmilldata").css("display","none");
        	$("#todaygraph").css("display","none");
	        openblur();
   			    	*/
        })
        
    $("#receiptbtn").click(() => {
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

            // Title
            pdf.setFontSize(22);
            pdf.setTextColor(0, 0, 128); // Dark blue color
            pdf.text("Farmer Bill", 80, 20);

            // Header divider
            pdf.setDrawColor(255, 215, 0); // Yellow color
            pdf.setLineWidth(1.5);
            pdf.line(10, 25, 200, 25);

            // Invoice Details
            pdf.setFontSize(12);
            pdf.setTextColor(0, 0, 0); // Black color
            pdf.text(`Name: `+name, 10, 40);
            pdf.text(`Mobile: `+mobile, 10, 50);
            pdf.text(`Address: `+place, 150, 50);
            pdf.text(`Date: `+date, 150, 40);

            // Table Header
            pdf.setFontSize(12);
            pdf.setFillColor(230, 230, 250); // Light blue background
            pdf.rect(10, 80, 180, 10, 'F'); // Table header background
            pdf.setTextColor(0, 0, 0);
            pdf.text("Variety", 15, 85);
            pdf.text("Weight",40,85);
            pdf.text("Bags", 80, 85);
            pdf.text("Rate", 120, 85);
            pdf.text("Amount", 160, 85);
            pdf.text("Loading Bill ", 125, 105);
            pdf.text("Labour Bill", 125, 115);
            pdf.text("Due Amount",125, 125);

            // Product Details (Example: Adjust as per your dynamic data)
            pdf.setTextColor(0, 0, 0);
            pdf.text(variety, 15, 95); // Product name
            pdf.text(weight, 40,95);
            pdf.text(bags, 80, 95);    // Quantity
            pdf.text(cost, 120, 95);   // Unit Price
            pdf.text(amt, 160, 95);    // Amount
            pdf.text("- "+loadbill, 160, 104);
            pdf.text("- "+labbill, 160 , 115);
            pdf.text("- "+oldamt, 160 , 125);
			
            // Total Amount
            pdf.setFillColor(255, 215, 0); // Yellow background for total
            pdf.rect(125, 130, 52, 12, 'F'); // Total box
            pdf.setTextColor(0, 0, 0);
            pdf.text("Total", 127, 135);
            pdf.text(totalbal, 160, 135); // Display total amount

            // Footer
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
// Usage example:
 
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
	        		error:(obj,err)=>{
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
        
        function settle(mobile)
            {
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
            		success:( )=>{
            			setTimeout(() => {
            				farmerdt();
            			}, 500);
            		},
            		error:(err)=>{
            			console.log(err)
            		}
            	})
            }
			
            function reject(mobile)
            {
            	var val=mobile;
            	var jsondata={
            			'mobile':val
            	}
				
				if (confirm("Are you sure you want to delete this user?")) {
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
	            			console.log(resobj,err)	
	            		}
	            	});
				}
            }
            
            $("#editformclose").click(()=>{
            	$("#editform").hide();
            	closeblur();
            })
            
            function Edit(mobile,bags,variety)
            {
            	openblur();
            	var form=document.getElementById("editform");
            	form.style.display="block";
            	console.log("variety ",variety);
				var jsondt={"mobile":mobile,"bags":bags,"variety":variety};
				console.log(jsondt);
				$.ajax({
				    url: "getEditFarmerdetails",
				    dataType: 'json',
				    type: "POST",
				    contentType: 'application/json',
				    data:JSON.stringify(jsondt),
				    success: (res) => {
						res=JSON.stringify(res); 
						res=JSON.parse(res);
						console.log("fvariety ",res['name']);
				        $("#editFname").val(res.name);
				        $("#editFbag").val(res.bag);
				        $("#editFplace").val(res.place);
				        $("#editFmobile").val(res.mobile);
				        $("#editFvariety").val(res.variety);
				        $("#edithidden").val(res.mobile);
				    },
				    error: (xhr, status, error) => {
				        console.error(xhr.responseText); // use xhr.responseText to get the actual error message
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
						    	$("#editform").hide();
						    	closeblur();
						    },
						    error: function(error) {
						        console.log('Error:', error);
						    }
						});
					}
				else alert("All fields must be filled")
				
            })

