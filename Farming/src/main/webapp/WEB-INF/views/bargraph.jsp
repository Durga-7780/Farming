<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html>
<html>
<head>
    <style>
        .chart-container {
            display: flex;
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
            font-family: Arial, sans-serif;
        }

        #yAxis {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            width: 50px;
            margin-right: 10px;
            height: 400px;
        }

        .y-axis-label {
            text-align: right;
            font-size: 12px;
            color: #666;
        }

        .chart {
            flex-grow: 1;
            position: relative;
        }

        #barsContainer {
            display: flex;
            height: 400px;
            border-bottom: 1px solid #ccc;
            border-left: 1px solid #ccc;
            gap: 40px;
            padding-top: 20px;
        }

        .month-group {
            display: flex;
            gap: 4px;
            align-items: flex-end;
        }

        .bar-wrapper {
            width: 20px;
            position: relative;
        }

        .bar {
            width: 100%;
            transition: height 0.3s ease;
            border-radius: 2px 2px 0 0;
        }

        .month-label {
            position: absolute;
            bottom: -25px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 12px;
            color: #666;
        }

        #legend {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            margin-top: 40px;
            justify-content: center;
        }

        .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
        }

        .color-box {
            width: 16px;
            height: 16px;
            border-radius: 3px;
        }

        #tooltips {
            position: absolute;
            display: none;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            pointer-events: none;
            z-index: 100;
        }
    </style>
	<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>
    <div class="chart-container">
        <div id="yAxis"></div>
        <div class="chart">
            <div id="barsContainer"></div>
            <div id="tooltips"></div>
            <div id="legend"></div>
        </div>
    </div>

    <script>
    $(function() {
    $.ajax({
    	url:'yearilyData',
    	dataType:'json',
    	type:'GET',
    	success:(res)=>{
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
console.log(res);
        const responseData = [
           res[0]
        ];

        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        function createVerticalChart(data) {
            const barsContainer = document.getElementById('barsContainer');
            const legendContainer = document.getElementById('legend');
            const yAxis = document.getElementById('yAxis');
            const tooltip = document.getElementById('tooltips');
            
            // Clear previous content
            barsContainer.innerHTML = '';
            legendContainer.innerHTML = '';
            yAxis.innerHTML = '';
            
            // Get all unique categories
            const categories = new Set();
            data.forEach(response => {
                Object.keys(response).forEach(category => categories.add(category));
            });
            
            // Create color mapping
            const colorMap = {};
            Array.from(categories).forEach((category, index) => {
                colorMap[category] = colors[index % colors.length];
            });
            
            // Create legend
            categories.forEach(category => {
                const legendItem = document.createElement('div');
                legendItem.className = 'legend-item';
                
                const colorBox = document.createElement('div');
                colorBox.className = 'color-box';
                colorBox.style.backgroundColor = colorMap[category];
                
                const label = document.createElement('span');
                label.textContent = category;
                
                legendItem.appendChild(colorBox);
                legendItem.appendChild(label);
                legendContainer.appendChild(legendItem);
            });
            
            // Find maximum value for scaling
            const maxValue = Math.max(...data.map(response => 
                Math.max(...Object.values(response))
            ));
            
            // Create y-axis labels
            const yAxisSteps = 5;
            for (let i = yAxisSteps; i >= 0; i--) {
                const label = document.createElement('div');
                label.className = 'y-axis-label';
                label.textContent = Math.round(maxValue * i / yAxisSteps);
                yAxis.appendChild(label);
            }
            
            // Create month groups with bars
            data.forEach((response, monthIndex) => {
                const monthGroup = document.createElement('div');
                monthGroup.className = 'month-group';
                
                // Create bars for each category
                Object.entries(response).forEach(([category, value]) => {
                    const barWrapper = document.createElement('div');
                    barWrapper.className = 'bar-wrapper';
                    
                    const bar = document.createElement('div');
                    bar.className = 'bar';
                    const height = (value / maxValue) * 400; // 400px is max height
                    bar.style.height = height+'px';
                    bar.style.backgroundColor = colorMap[category];
                    
                    // Tooltip event listeners
                    bar.addEventListener('mouseover', (e) => {
                        tooltip.style.display = 'block';
                        tooltip.textContent = category+':'+ value;
                        tooltip.style.left = e.pageX + 10+'px';
                        tooltip.style.top = e.pageY - 25+'px';
                    });
                    
                    bar.addEventListener('mousemove', (e) => {
                        tooltip.style.left = e.pageX + 10+'px';
                        tooltip.style.top = e.pageY - 25+'px';
                    });
                    
                    bar.addEventListener('mouseout', () => {
                        tooltip.style.display = 'none';
                    });
                    
                    barWrapper.appendChild(bar);
                    
                    // Add month label to the first bar of each group
                    if (Object.keys(response)[0] === category) {
                        const monthLabel = document.createElement('div');
                        monthLabel.className = 'month-label';
                        monthLabel.textContent = months[monthIndex];
                        barWrapper.appendChild(monthLabel);
                    }
                    
                    monthGroup.appendChild(barWrapper);
                });
                
                barsContainer.appendChild(monthGroup);
            });
        }
	
        
        // Initialize chart with sample data
        createVerticalChart(responseData);

        // Function to update chart with new data
        function updateChart(newData) {
            createVerticalChart(newData);
        }
        
    	}
    });
    
    });
    </script>
</body>
</html>