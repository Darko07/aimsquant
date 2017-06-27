var stockData = [];
        var current_data = [];
var chartTitles = [];

var recents_arr = {};
        
        var charts_shown = 0;
        
        //var current_from = getCookie("last_from");
        //var current_to = getCookie("last_to");

var highchart = Highcharts.stockChart('chart-container', {
    rangeSelector: {
    enabled: false,
    },
    navigator: {
    enabled: false
    },
    title: {
    text: "AimsQuant"
    },
    series: [],
});

console.log(highchart.series);

var series_count = 0;

var recents = getCookie("recents").split(',');

recents = recents.slice(0, 5);

var xhr = new XMLHttpRequest();
xhr.open("GET", "https://darko07.github.io/aimsquant/XNSE-datasets-codes.csv", async=true);
xhr.onreadystatechange = function() {
    if(xhr.status == 200 && xhr.readyState == 4) {
    var res = xhr.response;
    console.log("Response");
    stockData = parseData(res.split('\n'));

    // Add search event to input after search data is loaded
    document.getElementById("search").addEventListener("keyup", getSymbol);
    console.log(stockData);
    }
}
xhr.send();

function showRecents() {
    console.log(recents);
    console.log(document.cookie);
    var dom = document.getElementById("recents");
    dom.innerHTML = "";
    for(var i = 0; i < recents.length; i++) {
    if(recents[i] != "") {

        fetchStockData(recents[i], getYesterday(), getToday(), function(e){
        var xhr = e.target;
        if(xhr.status == 200 && xhr.readyState == 4) {
            var dataset = JSON.parse(e.target.response).dataset;

            dataset.data.forEach(function(element) {
            var temp = element[1];
            element[1] = element[4];
            element[4] = temp;
            }, this);

            var curid = dataset.dataset_code;
            recents_arr[curid] = dataset;

            //console.log(recents_arr[rec]);
            dom.innerHTML += "<li class='recent-selector'><input type='checkbox' onchange='selectRecent(this)' value='"+recents_arr[curid].dataset_code+"'>";
            dom.innerHTML += "<p class='recent-id'>"+recents_arr[curid].dataset_code+"</p>";
            dom.innerHTML += "<p class='recent-name'>"+recents_arr[curid].name+"</p>";
            dom.innerHTML += "<p class='recent-stock'>"+recents_arr[curid].data[0][1].toFixed(2)+"</p></li>";
        }
        });
    }
    }
    console.log(recents_arr);
}

showRecents();

function selectRecent(obj) {
    var val = obj.value;
    console.log(recents_arr);
            //alert(obj.checked);
            if(obj.checked) {
                if(charts_shown > 3) {
                    alert("More than 4 charts cannot be shown at a time.");
                    obj.checked = false;
                } else {
        var dataset = recents_arr[val];
        chartTitles.unshift(dataset.dataset_code);
                    chartTitles = chartTitles.filter(onlyUnique);
        highchart.setTitle({text: chartTitles.join(" and ")});
        
        highchart.addSeries({
        name: dataset.dataset_code,
                        id: dataset.dataset_code,
        data: dataset.data,
        tooltip: {
            valueDecimals: 5
        }
        });

        document.getElementById("stock-data-id").innerHTML = dataset.dataset_code;
        document.getElementById("stock-data-name").innerHTML = dataset.name;
                    charts_shown += 1;

        //show stock data in div
        var stock_data_field = document.getElementById("closing-data-div");

        var diff = dataset.data[0][1] - dataset.data[1][1];
        stock_data_field.innerHTML = ""
        
        if(diff > 1) {
        stock_data_field.innerHTML = "<img class='close-point-img' src='up.png'/><p>"+dataset.data[0][1].toFixed(2)+"</p>";
        } else {
        stock_data_field.innerHTML = "<img class='close-point-img down-img' src='down.png'/><p>"+dataset.data[0][1].toFixed(2)+"</p>";
        }
    }
            } else {
                chartTitles = chartTitles.filter(function(a){return a !== val});
                highchart.setTitle({text: chartTitles.join(" and ")});
                highchart.get(val).remove();
                obj.checked = false;
                charts_shown -= 1;
            }
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
        
        function showCurrentData(id) {
            var obj = document.getElementById(id);
            var data_var = [];
    //Clear current data
    obj.innerHTML = "";
            
    /*
                Say to use the name of current_data
                console.log(current_data.name);
            */	
            //To append a field called name from current_data - 
            obj.innerHTML += "<div> <p class='field'> Name </p> <p class='value'> "+current_data.name+" <p> </div>";
            
            //To append a field called dataset_code from current_data - 
            obj.innerHTML += "<div> <p class='field'> Code </p> <p class='value'> "+current_data.dataset_code+" <p> </div>";
            
            //To append a field called refreshed_at from current_data - 
            obj.innerHTML += "<div> <p class='field'> Refreshed At </p> <p class='value'> "+current_data.refreshed_at+" <p> </div>";
        }


function fetchStockData(company_id, from=null, to=null, callback=null) {
    console.log("From=>", from, "To=>", to);
    var url = "https://www.quandl.com/api/v3/datasets/XNSE/"+company_id+".json?api_key=gWf2CLShwrGUBVnqzsT4&start_date="+from+"&end_date="+to;
    
    var xhr = new XMLHttpRequest;
    xhr.open("get", url, async=true);

    xhr.onreadystatechange = callback;

    xhr.send();
}


function showChart(company_id, clear=false) {
            if(charts_shown > 3) {
                return false;
            }
            //var from = getCookie("last_from");
            //var to = getCookie("last_to");
    if(clear) {
                chartTitles = [];
                //array.filter(function(a){return a !== 'deleted'})
                document.getElementById("search-results").style.display = 'none';
                document.getElementById("search").value = "";
                charts_shown = 0;
    while(highchart.series.length > 0)
        highchart.series[0].remove(true);
                
                //document.cookie = "last_from="+from+";";
                //document.cookie = "last_to="+to+";";
                showRecents();
    }
    var from = document.getElementById("date-from").value;
            var to = document.getElementById("date-to").value;
    
    if(from == "")
    from = getYesterday()
    
    if(to == "")
    to = getToday()

    fetchStockData(company_id, from, to, function(e) {
    var xhr = e.target;
    if(xhr.status == 200 && xhr.readyState == 4) {
        //console.log(e.target.response);
        var dataset = JSON.parse(e.target.response).dataset;
        console.log(dataset);
                    current_data = dataset;
        
                    dataset.data.forEach(function(element) {
        var temp = element[1];
        element[1] = element[4];
        element[4] = temp;
        }, this);

        var curid = dataset.dataset_code;
        recents_arr[curid] = dataset;

        highchart.addSeries({
        name: dataset.dataset_code,
                        id: dataset.dataset_code,
        data: dataset.data,
        tooltip: {
            valueDecimals: 5
        }
        });

        document.getElementById("stock-data-id").innerHTML = dataset.dataset_code;
        document.getElementById("stock-data-name").innerHTML = dataset.name;

        chartTitles.unshift(dataset.dataset_code);
                    chartTitles = chartTitles.filter(onlyUnique);
        highchart.setTitle({text: chartTitles.join(" and ")});
        recents.unshift(dataset.dataset_code);
        recents = recents.filter(onlyUnique);
        recents = recents.slice(0, 5);
        console.log(recents);
        document.cookie = "recents="+recents.join(",")+";";
        recents = getCookie("recents").split(',');
                    charts_shown += 1;

        //show stock data in div
        var stock_data_field = document.getElementById("closing-data-div");

        var diff = dataset.data[0][1] - dataset.data[1][1];
        stock_data_field.innerHTML = ""
        
        if(diff > 1) {
        stock_data_field.innerHTML = "<img class='close-point-img' src='up.png'/><p>"+dataset.data[0][1].toFixed(2)+"</p>";
        } else {
        stock_data_field.innerHTML = "<img class='close-point-img down-img' src='down.png'/><p>"+dataset.data[0][1].toFixed(2)+"</p>";
        }
    }
    });

            return true;
        }
        
        function onlyUnique(value, index, self) { 
            return self.indexOf(value) === index;
        }

function arrayToHtml(array, htmlObject) {
    htmlObject.innerHTML = "";
    for(var i = 0; i < array.length; i++) {
    htmlObject.innerHTML += "<div class='search-results' onclick=\"showChart('"+array[i].id+"', true)\"><p class='code-search'>"+array[i].id+"</p><p class='name-search'>"+array[i].name+"</p></div>";
    }
}

function getSymbol(e) {
    var val = e.target.value.toLowerCase();
            document.getElementById("search-results").style.display = "block";
    var searchData = [];
    if(val.length >= 3) {
    //Search
    console.log(val);
    for(var i = 0; i < stockData.length; i++) {
        var index = stockData[i].name.toLowerCase().indexOf(val);
        if(index != -1) {
        console.log("found");
        var data = {
            index: index,
            id: stockData[i].id,
            name: stockData[i].name
        };
        var j = 0;
        //while(searchData.length > 0 && data.index > searchData[j++].index);
        searchData.splice(j, 0, data);
        }
    }
    console.log(searchData);
    }
    arrayToHtml(searchData.slice(0, 10), document.getElementById("search-results"));
}

function parseData(response_array) {
    var parsed_data = [];
    for(var i = 0; i < response_array.length; i++) {
    if(response_array[i].indexOf(",") != -1) {
        var cur_data = response_array[i].split(",");
        parsed_data.push({id: cur_data[0].substr(5), name: cur_data[1]});
    }
    }
    return parsed_data;
}

function getToday() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!

    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd;
    } 
    if(mm<10){
        mm='0'+mm;
    } 
    var today = yyyy+'-'+mm+'-'+dd;
    return today;
}

function getYesterday() {
    var yday = new Date(new Date() - 240*3600*1000);
    var dd = yday.getDate();
    var mm = yday.getMonth()+1; //January is 0!

    var yyyy = yday.getFullYear();
    if(dd<10){
        dd='0'+dd;
    } 
    if(mm<10){
        mm='0'+mm;
    } 
    var yday = yyyy+'-'+mm+'-'+dd;
    return yday;
}