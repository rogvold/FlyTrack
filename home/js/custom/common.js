/**
 * Created by sabir on 02.11.14.
 */

function initParse(){
//    var appId = 'h1QhtsSjeoyQSa8RDQBDPvgbnI7Ix6nadHTsepwN';
//    var jsKey = 'Ci34OXCgbv7TuVOiUJFOmoSwULbC7JRnxvFaT1ZI';
    var appId = "ZhlYHr1uAjC7CJB7l1QVfuzsJIwpp51J5KpQYOco";
    var jsKey = "kQpPbPSSJwvfnT9pJ2ZoxtEfbDdzr1bZQzxJGbzN";

    Parse.initialize(appId, jsKey);
}


function gup( name )
{
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( window.location.href );
    if( results == null )
        return null;
    else
        return results[1];
}

function enablePreloader(){
    $('.gallery-loader').removeClass('hide');
}

function disablePreloader(){
    $('.gallery-loader').addClass('hide');
}

function getMaxInArray(arr){
    if (arr == undefined || arr.length == 0){
        return undefined;
    }
    var max = arr[0];
    for (var i in arr){
        if (arr[i] > max){
            max = arr[i];
        }
    }
    return max;
}

function getMinInArray(arr){
    if (arr == undefined || arr.length == 0){
        return undefined;
    }
    var min = arr[0];
    for (var i in arr){
        if (arr[i] < min){
            min = arr[i];
        }
    }
    return min;
}


function randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}


function getRandowString(N)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < N; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


function getDistanceFromLatLon(lat1,lon1,lat2,lon2) {
    var R = 6371000;
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1);
    var a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}