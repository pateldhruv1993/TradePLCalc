// Config
var maxStockPriceListLength = 100;
var maxNumberOfStocksListLength = 20;




//Init all the important variables in global scope
var currentPrice, expectedPrice, maxDollarInvest, maxStockInvest, comissionCharge, stockPriceIncrements, numberOfStocksIncrement;
var stockPriceList = [], numberOfStocksList = [];

document.getElementById("generateGraphBtn").addEventListener("click", function(){

    
    getFormValues();
    generateStockPriceList();
    generateNumOfStocksList();

});


// Fill numberOfStocksList will all the possible stock num values
function generateNumOfStocksList(){
    
}

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
            break
        }
        lastItemAdded = lowerLimit + (multiplierCount * stockPriceIncrements);
        stockPriceList.push(lastItemAdded);
        multiplierCount++;
    }

}


// Get upper and lower limit of the stock prices list
function findUpperLowerLimits(targetUpperLimit){
    var upperLimit = targetUpperLimit + (stockPriceIncrements * 3);
    var remainingSpace = maxStockPriceListLength - ((upperLimit - currentPrice) / stockPriceIncrements);
    var lowerLimit = currentPrice - (stockPriceIncrements * remainingSpace);
    return {Upper: upperLimit, Lower: lowerLimit}; 
}


//Gets all the values from the form
function getFormValues() {
    currentPrice = parseFloat(document.getElementById("currentPrice").value);
    if(currentPrice == "undefined" || currentPrice == ""){
        showMainError("Current Price is required");
        return false;
    }

    expectedPrice = parseFloat(document.getElementById("expectedPrice").value);
    if(expectedPrice == "undefined" || expectedPrice == ""){
        expectedPrice = undefined;
    }
    
    maxDollarInvest = parseFloat(document.getElementById("maxDollarInvest").value);
    maxStockInvest = parseFloat(document.getElementById("maxStockInvest").value);
    
    if((maxDollarInvest == "undefined" || maxDollarInvest == "") && (maxStockInvest == "undefined" || maxStockInvest == "")){
        showMainError("Fill out either the Maximum dollar or Maximum stock amount");
        return false;
    }
    
    comissionCharge = parseFloat(document.getElementById("comissionCharge").value);
    if(comissionCharge == "undefined" || comissionCharge == ""){
        comissionCharge = 0;
        showMainFriendlyMsg("Commission Charge field was left empty so the charge is set to $0");
    }

    stockPriceIncrements = parseFloat(document.getElementById("stockPriceIncrements").value);
    if(stockPriceIncrements == "undefined" || stockPriceIncrements == ""){
        showMainError("Stock Price Increments is required");
        return false;
    }

    numberOfStocksIncrement = parseFloat(document.getElementById("numberOfStocksIncrement").value);
    if(numberOfStocksIncrement == "undefined" || numberOfStocksIncrement == ""){
        showMainError("No. of Stocks Increments is required");
        return false;
    }
}























function showMainError(msg){
    document.getElementById("errorMsgBox").innerHTML = msg;
}

function showMainFriendlyMsg(msg){
    document.getElementById("friendlyMsgBox").innerHTML = msg;
}