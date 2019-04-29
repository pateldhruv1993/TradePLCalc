//TODO: Label profit percentage on the hover tooltip on the graph instead of z. Also change name for x and y on the saem tooltip
//TODO: Find a way to add profit numbers on that tooltip. should have something saved in the research tabs
//TODO: Expected Price field fucks up lot of the shit. Can probably fix most problems if you fix how stock price list array is calcualted when expected price is given
// Config
var maxStockPriceListLength = 100;
var maxNumberOfStocksListLength = 20;




//Init all the important variables in global scope
var currentPrice, expectedPrice, maxDollarInvest, maxStockInvest, comissionCharge, stockPriceIncrements, numberOfStocksIncrement;
var stockPriceList = [], numberOfStocksList = [], totalInvestmentList = [], profitPercentageMatrix = [], profitMatrix = [];

document.getElementById("generateGraphBtn").addEventListener("click", function(){
    // Clear all previous data
    stockPriceList = []; numberOfStocksList = []; totalInvestmentList = []; profitPercentageMatrix = []; profitMatrix = [];
    if(getFormValues()){
        generateStockPriceList();
        generateNumOfStocksList();
        //TODO: The profit and profit percentage matrices don't consider comission charges into account.
        generateAllMatrix();
        generatePlot();
    }
});

//Create Plot
function generatePlot(){

    var minProfitPercentage = Math.min.apply(null, profitPercentageMatrix[0]);
    var maxProfitPercentage = Math.max.apply(null, profitPercentageMatrix[profitPercentageMatrix.length-1]);
    var centerProfitPercentage =  0 - minProfitPercentage / (maxProfitPercentage - minProfitPercentage);
    var data = [
        {
          z: profitPercentageMatrix,
          x: numberOfStocksList,
          y: stockPriceList,
          type: 'heatmap',
          colorscale: [[0, 'rgba(214, 39, 40, 0.85)'],   
                    [centerProfitPercentage, 'rgba(255, 255, 255, 0.85)'],  
                    [1, 'rgba(16, 255, 0, 0.85)']],
        }
      ];
      
      Plotly.newPlot('PLGraph', data, {}, {showSendToCloud: true});
}

// Create Matrix
function generateAllMatrix(){
    stockPriceList.forEach(function(stockPrice, index){
        var profitPercentageList = [];
        var profitList = [];
        numberOfStocksList.forEach(function(numOfStocks, index){
            var profit = (numOfStocks * stockPrice) - totalInvestmentList[index];
            profitPercentageList.push(((profit / totalInvestmentList[index]) * 100).toFixed(2));
            profitList.push(profit.toFixed(2));
        });

        profitPercentageMatrix.push(profitPercentageList);
        profitMatrix.push(profitList);
    });
}


//TODO: Runtime error. Producces list of up to 63 item when it should stop at ~20
// Fill numberOfStocksList with all the possible stock num values
function generateNumOfStocksList(){
    var maxStockBuyable;
    if(!isNaN(maxDollarInvest)){
        maxStockBuyable = parseInt((maxDollarInvest - comissionCharge) / currentPrice);
    }
    else{
        maxStockBuyable = parseInt(maxStockInvest);
    }

    
    for(var i = 0; i <= 9; i++){
        numOfStocks = parseInt((maxStockBuyable + (i * numberOfStocksIncrement)));
        numberOfStocksList.push(numOfStocks);
        totalInvestmentList.push(numOfStocks * currentPrice);
    }

    for(i = 0; i <= 10; i++){
        numOfStocks = parseInt(maxStockBuyable - (i * numberOfStocksIncrement));
        numberOfStocksList.unshift(numOfStocks);
        totalInvestmentList.unshift(numOfStocks * currentPrice);
    }

}

//TODO: Runtime error. Produces exteremly long list sometimes. E.g.: when current price was set to 11 and expected price was set to 13 it also produced about 100 itesm below 11 when it shuoldve stopped much sooner.
// Fill stockPriceList with all the price values
function generateStockPriceList(){
    var upperLimit, lowerLimit;
    var targetUpperLimit;
    if(!isNaN(expectedPrice)){
        if(expectedPrice >= currentPrice){
            targetUpperLimit = expectedPrice;
            var limits = findUpperLowerLimits(targetUpperLimit);
            upperLimit = limits.Upper;
            lowerLimit = limits.Lower;
        } else{
            lowerLimit = expectedPrice - (stockPriceIncrements * 3);
            var remainingSpace = maxStockPriceListLength - ((currentPrice - lowerLimit) / stockPriceIncrements);
            upperLimit = currentPrice + (stockPriceIncrements * remainingSpace);
        }
    } else{
        targetUpperLimit = currentPrice + (stockPriceIncrements * 70);
        var limits = findUpperLowerLimits(targetUpperLimit);
        upperLimit = limits.Upper;
        lowerLimit = limits.Lower;
    }

    var multiplierCount = 0;
    var lastItemAdded;
    while(true){
        if(!isNaN(lastItemAdded) && lastItemAdded >= upperLimit){
            break;
        }
        lastItemAdded = lowerLimit + (multiplierCount * stockPriceIncrements);
        stockPriceList.push(lastItemAdded.toFixed(2));
        multiplierCount++;
    }

}


// Get upper and lower limit of the stock prices list
function findUpperLowerLimits(targetUpperLimit){
    var upperLimit = targetUpperLimit + (stockPriceIncrements * 3);
    var remainingSpace = maxStockPriceListLength - ((upperLimit - currentPrice) / stockPriceIncrements);
    if(remainingSpace <= 0){
        remainingSpace = 5;
    }
    var lowerLimit = currentPrice - (stockPriceIncrements * remainingSpace);
    return {Upper: upperLimit, Lower: lowerLimit}; 
}


//Gets all the values from the form
function getFormValues() {
    currentPrice = parseFloat(document.getElementById("currentPrice").value);
    if(currentPrice == "undefined" || currentPrice == "" || isNaN(currentPrice)){
        showMainError("Current Price is required");
        return false;
    }

    expectedPrice = parseFloat(document.getElementById("expectedPrice").value);
    if(expectedPrice == "undefined" || expectedPrice == "" || isNaN(expectedPrice)){
        expectedPrice = undefined;
    }
    
    maxDollarInvest = parseFloat(document.getElementById("maxDollarInvest").value);
    maxStockInvest = parseFloat(document.getElementById("maxStockInvest").value);
    
    if((maxDollarInvest == "undefined" || maxDollarInvest == "" || isNaN(maxDollarInvest)) && (maxStockInvest == "undefined" || isNaN(maxStockInvest) || maxStockInvest == "")){
        showMainError("Fill out either the Maximum dollar or Maximum stock amount");
        return false;
    }
    
    comissionCharge = parseFloat(document.getElementById("comissionCharge").value);
    if(comissionCharge == "undefined" || comissionCharge == "" || isNaN(comissionCharge)){
        comissionCharge = 0;
        showMainFriendlyMsg("Commission Charge field was left empty so the charge is set to $0");
    }

    stockPriceIncrements = parseFloat(document.getElementById("stockPriceIncrements").value);
    if(stockPriceIncrements == "undefined" || stockPriceIncrements == "" || isNaN(stockPriceIncrements)){
        showMainError("Stock Price Increments is required");
        return false;
    }

    numberOfStocksIncrement = parseFloat(document.getElementById("numberOfStocksIncrement").value);
    if(numberOfStocksIncrement == "undefined" || numberOfStocksIncrement == "" || isNaN(numberOfStocksIncrement)){
        showMainError("No. of Stocks Increments is required");
        return false;
    }
    return true;
}






















function showMainError(msg){
    document.getElementById("errorMsgBox").innerHTML = msg;
}

function showMainFriendlyMsg(msg){
    document.getElementById("friendlyMsgBox").innerHTML = msg;
}