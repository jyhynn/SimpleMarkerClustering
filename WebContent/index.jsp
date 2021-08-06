<%@ page language="java" contentType="text/html; charset=EUC-KR"
    pageEncoding="EUC-KR"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="EUC-KR">
<title>armton Simple Clustering</title>
<script src="https://code.jquery.com/jquery-3.6.0.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
<script type="text/javascript" src="https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=yourId"></script>
<script type="text/javascript" src="./js/armton.simpleClustering.js"></script>
<script type="text/javascript" src="./js/lamps.js"></script>
<link rel="stylesheet" type="text/css" href="./css/armton.simpleClustering.css">
</head>
<body>

	<div id="map" style="width:100%;height:900px;"></div>

<script type="text/javascript">
	var markers = [];
    let map = new naver.maps.Map(document.getElementById('map'), {
        zoom: 17,
        minZoom:8,
        center: new naver.maps.LatLng(37.46875301655531, 126.62468593028933)
    });
  
   	var cmc = null;
    window.onload = function(){
	   makeMarkers(data);
	   
		// 마커 클러스터링 객체 생성
 		cmc = new SimpleCluster({
		    divX: 5,	// 가로로 나눌 화면 칸
		    divY: 3,	// 세로로 나눌 화면 칸
		    maxZoom: 17
		})  
	   
	   naver.maps.Event.addListener(map, 'idle', function() {
			if(map.getZoom() < cmc.getMaxZoom()){
		    	setTimeout(cmc.doMarkerClustering(), 1000);
	 		}else{
	 			cmc.clearClusters();
			    setTimeout(updateMarkers(map, markers), 500);
	 		}
		});
    }

var makeMarkers = function(obj){
	for (var i = 0, ii = obj.length; i < ii; i++) {
		var spot = obj[i];
		var latlng = new naver.maps.LatLng(spot.latitude, spot.longitude),
			marker = new naver.maps.Marker({
			map: map,
			id : spot.id,
			title: spot.title,
			latitude: spot.latitude, 
			longitude: spot.longitude, 
			position: latlng,
			draggable: false,
			visible:true,
			zIndex: 999
		});
		markers.push(marker);
	}
}
    
    
function updateMarkers(map, markers) {
    var mapBounds = map.getBounds();
    var marker, position;
    
   	for (var i = 0; i < markers.length; i++) {
           marker = markers[i];
           position = marker.getPosition();
           
           if (mapBounds.hasLatLng(position)) {
               showMarker(map, marker);
           } else {
               hideMarker(map, marker);
           }
       }
}

function showMarker(map, marker) {
	if (marker.getMap()) return;
	marker.setMap(map);
}

function hideMarker(map, marker) {
	if (!marker.getMap()) return;
	marker.setMap(null);
}   
      
</script>

</body>
</html>
