<!DOCTYPE html>
<html lang="en">
<head>
	<title>Login V1</title>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
<!--===============================================================================================-->	
	<link rel="icon" type="image/png" href="images/icons/favicon.ico"/>
<!--===============================================================================================-->
	<link rel="stylesheet" type="text/css" href="vendor/bootstrap/css/bootstrap.min.css">
<!--===============================================================================================-->
	<link rel="stylesheet" type="text/css" href="fonts/font-awesome-4.7.0/css/font-awesome.min.css">
<!--===============================================================================================-->
	<link rel="stylesheet" type="text/css" href="vendor/animate/animate.css">
<!--===============================================================================================-->	
	<link rel="stylesheet" type="text/css" href="vendor/css-hamburgers/hamburgers.min.css">
<!--===============================================================================================-->
	<link rel="stylesheet" type="text/css" href="vendor/select2/select2.min.css">
<!--===============================================================================================-->
	<link rel="stylesheet" type="text/css" href="css/util.css">
	<link rel="stylesheet" type="text/css" href="css/main.css">
<!--===============================================================================================-->
</head>
<body>
	
	<div class="limiter">
		<div class="container-login100">
			<div class="wrap-login100">
				<div class="login100-pic js-tilt" data-tilt style="cursor:pointer">
					<img src="images/img-01.png" alt="IMG">
				</div>

				<form class="login100-form validate-form" autocomplete=off>
					<span class="login100-form-title">
						User Login
					</span>

					<div class="wrap-input100 validate-input" data-validate = "Username is required">
						<input class="input100" type="text" id="username" name="email" placeholder="Username">
						<span class="focus-input100"></span>
						<span class="symbol-input100">
							<i class="fa fa-envelope" aria-hidden="true"></i>
						</span>
					</div>

					<div class="wrap-input100 validate-input" data-validate = "Password is required">
						<input class="input100" type="password" id="password" name="pass" placeholder="Password">
						<span class="focus-input100"></span>
						<span class="symbol-input100">
							<i class="fa fa-lock" aria-hidden="true"></i>
						</span>
					</div>
					
					<div class="container-login100-form-btn">
						<button class="login100-form-btn btn">
							Login
						</button>
					</div>

					 <div class="text-center p-t-12">
						<p class="error" style="display: none;">Invalid credentials, please try again.</p>
					</div> 

					<div class="text-center p-t-136">
						<a class="txt2" href="register" style="text-decoration:none;font-size:20px">
							Create your Account
							<i class="fa fa-long-arrow-right m-l-5" aria-hidden="true"></i>
						</a>
					</div>
				</form>
			</div>
		</div>
	</div>
	
	

	
<!--===============================================================================================-->	
	<script src="vendor/jquery/jquery-3.2.1.min.js"></script>
<!--===============================================================================================-->
	<script src="vendor/bootstrap/js/popper.js"></script>
	<script src="vendor/bootstrap/js/bootstrap.min.js"></script>
<!--===============================================================================================-->
	<script src="vendor/select2/select2.min.js"></script>
<!--===============================================================================================-->
	<script src="vendor/tilt/tilt.jquery.min.js"></script>
	<script >
		$('.js-tilt').tilt({
			scale: 1.1
		})
	</script>
<!--===============================================================================================-->
	<script src="js/main.js"></script>

<script>
    	var user=document.getElementById('username');
    	var pass=document.getElementById('password');
    	var btn=document.getElementsByClassName('btn')[0];
    	var err=document.getElementsByClassName('error')[0];
    	
    	btn.addEventListener('click',(e)=>{
		  e.preventDefault();
    		if((user.value).trim()!='' && (pass.value).trim()!='')
    		{
    			err.style.display='none';
    			var jsondata={
    					"username":user.value,
    					"password":pass.value
    			}
    			console.log(jsondata);
    			fetch('/checklogindata',{
    				method:'POST',
    				headers:{
    					'Content-Type':'application/json'
    				},
    				body:JSON.stringify(jsondata)
    			}).then(res=>{
    				if(!res.ok)
    					throw new Error('Response error')
    				return res.json()
    			}).then(data=>{
    				if(data.messg=='success')
    					{ 
    						window.location.href='dashboard';
    					}
    				else if(data.messg=='admin')
    					{ 
    						window.location.href='Admin';
    					}
    				else{
    					err.style.display='block';
    					err.textContent='Username or Password incorrect / Please contact admin';  
    					setTimeout(()=>{
    						err.style.display='none';
    					},5000);
    				}
    			})
    			.catch(err=>console.log(err))
    		}
    		else{
    			err.style.display='block';
    		}
    	})
    	
    </script>
</body>
</html>