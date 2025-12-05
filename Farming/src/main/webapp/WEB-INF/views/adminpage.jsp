<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin</title>
    <style>
    body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
    margin: 0;
    padding: 20px;
}

.container {
    max-width: 800px;
    margin: auto;
    padding: 20px;
    background: white;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h1 {
    text-align: center;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
}

th, td {
    padding: 10px;
    border: 1px solid #ddd;
    text-align: left;
}

th {
    background-color: #007BFF;
    color: white;
}

button {
    padding: 5px 10px;
    border: none;
    border-radius: 3px;
    color: white;
    cursor: pointer;
}

.accept {
    background-color: #28a745; /* Green */
}

.reject,.logout {
    background-color: #dc3545; /* Red */
}
.logout{
	padding:10px 20px;
	font-weight:bold;
	font-size:18px;
}
.err{
font-size:20px;
color:red;
}
    
    </style>
</head>
<body>
	<button class='logout'>Logout</button>
    <div class="container">
        <h1>Agent Login Data</h1>
        
        <c:if test="${not empty data}">
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>UserName</th>
                    <th>Password</th>
                    <th>Mobile</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody id="agentTableBody">
            	<c:forEach items="${data}" var="obj"> 
            		<tr>
            			<td>${obj.name}</td>
            			<td>${obj.username}</td>
            			<td>${obj.password}</td>
            			<td>${obj.mobile}</td>
            			<td>
            				<button class='accept' onclick=accept('${obj.username}')>Accept</button>
            				<button class='reject' onclick=reject('${obj.username}')>Reject</button>
            			</td>
            		</tr>
            	</c:forEach>
            </tbody>
        </table>
        </c:if>
        <c:if test="${empty data}">
        	<p>No data found</p>
        </c:if>
    </div>

    <script>
    	var logout=document.getElementsByClassName('logout')[0];
    	
    	logout.onclick=()=>{
    		window.location.href='login';
    	}
    	
    	function accept(user)
    	{
    		fetch('acceptadmin',{
    			method:'POST',
    			headers:{
    				'Content-Type':'application/json'
    			},
    			body:JSON.stringify({'user':user})
    		}).then(res=>{
    			if(!res.ok)
    				throw new Error('Response invalid')
    			return res.text()
    		}).then(d=>window.location.href='getAdmindata').catch(e=>console.error(e))
    	}
    	
    	function reject(user)
    	{
			fetch('rejectadmin',{
    			method:'POST',
    			headers:{
    				'Content-Type':'application/json'
    			},
    			body:JSON.stringify({'user':user})
    		}).then(res=>{
    			if(!res.ok)
    				throw new Error('Response invalid')
    			return res.text()
    		}).then(d=>window.location.href='getAdmindata').catch(e=>console.error(e))	
    	}
    </script> 
</body>
</html>
