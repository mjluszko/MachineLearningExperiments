// Author: Jakub Król <jakub.krol@poczta.fm>
var whois = require("whois-json");
var express = require("express");
var app = express();

function limitReached(result) {
  return result.some((res) => {
    return res.data.error && (
           res.data.error.includes("429") ||
           res.data.error.includes("201")
    );
  });
}

function hasError(result) {
  return result.some((res) => !!res.data.error);
}

app.get("/:url", function(request, response){

  var success = {"status":"ok", "whois":"whois"};
  var failure = {"status":"tryagain", "reason":"reason"};
  var url = request.params.url;
  if(url.includes(":") == true){
    success.whois = null;
    response.send(success);
    return;
  }
  whois(url, {verbose: true}, function(error, result){
    if(error){
      success.whois = null;
      response.send(success);
    } else if(limitReached(result)){
      console.log("Whois limit reached for ", url);
      failure.reason = result;
      response.status(400);
      response.send(failure);
    } else if(hasError(result)){
      failure.reason = result;
      response.send(failure);
      response.status(403);
    } else{
      success.whois = result;
      response.send(success);
    }

  });
});
app.listen(4001);
console.log("Whois scanner running on 4001");
