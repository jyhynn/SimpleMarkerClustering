/**
 * armton.SimpleCluster - armton.SimpleCluster is a simple marker clustering library for Naver Map API
 * Author: JiHyun <letsjamm@naver.com> 
 * Version: v1.0.0
 * Url: https://velog.io/@armton/
 * License(s): MIT
 * 
 * Custom Marker Clustering
 * 화면에 표시된 Map 영역을 분할하여 마커 개수 및 좌표의 평균 값을 계산해 클러스터링 마커를 표시
 * 최적화 룰은 Naver Map API를 따릅니다. 
 */

/**
 * 클러스터 마커 객체 
**/
var ClusterArrObj = function(){
	this.options = null;
	this.blockMarker = [];
	this.blockListener = [];
	this.blockLatLngArr = [];
	this.blockLatArr = [], blockLngArr = [];
	this.blockCntMap = [];
}

/**
 * 클러스터 마커 기본 옵션 및 클러스터 객체 생성
 * @param {Object} options 사용자 지정 옵션
**/
var SimpleCluster = function(options){
	this.DEFAULT_OPTIONS = {
		map: map,			// {naver.map}
		markers: markers,	// {naver.map.Maker[]}
		contentHtml: false,	// 사용자정의 클러스터링 마커 html
		divX: 2,			// 가로 분할 값
		divY: 2, 			// 세로 분할 값
		maxZoom: 17			// 개별 마커를 표시할 최대 줌 레벨. 이보다 작은 레벨부터 클러스터링.
	};
	
	_clusterObj = new ClusterArrObj();
	_clusterObj.options = $.extend({}, this.DEFAULT_OPTIONS, options);
}

var _clusterObj = null;

/**
 * 클러스터링 관련 함수.
**/

SimpleCluster.prototype = {
	constructor: _clusterObj,
	/**
	 * 클러스터 초기화.
	**/
	clearClusters: function(){
		if(!_clusterObj) return;
		
		for(var i = 0; i<_clusterObj.blockMarker.length; i++){
			_clusterObj.blockMarker[i].setMap(null);
		}
		
		for(var i = 0; i<_clusterObj.blockListener.length; i++){
			naver.maps.Event.removeListener(_clusterObj.blockListener[i]);
		}
		
		_clusterObj.blockMarker = [];
		_clusterObj.blockListener = [];
		_clusterObj.blockLatLngArr = [];
		_clusterObj.blockLatArr = [];
		_clusterObj.blockLngArr = [];
		_clusterObj.blockCntMap = [];
	},
	
	/**
	 * 클러스터 생성.
	**/
	doMarkerClustering: function(){
		
		if(!_clusterObj) return;
		
		var _cluster = this.__proto__;
		
		var zoom = map.getZoom();
		if(zoom >= this.getMaxZoom()) {
			this.clearClusters();
			return;
		}
		
		if(_clusterObj.blockMarker.length > 0) _cluster.clearClusters();
		
		// 마커 hide
		for(var i=0; i<markers.length; i++){
			if(markers[i].getMap != null){
				markers[i].setMap(null);
			}
		}
		
		var _blockMarker = [];
		var _blockListener = [];
		var _blockLatLngArr = [];
		var _blockLatArr = [], _blockLngArr = [];
		var _blockCntMap = [];
		
		// 지도 경계
		var mapBounds = map.getBounds();
		var maxX = mapBounds._max.x, minX = mapBounds._min.x;
		var maxY = mapBounds._max.y, minY = mapBounds._min.y;
		
		// 지도 분할 수
		const _divX = _cluster.getDivX();
		const _divY = _cluster.getDivY();
		
		// 사용자 분할 수에 따른 기준 단위 거리
		const _unitX = Number(((maxX-minX)/_divX).toFixed(7));
		const _unitY = Number(((maxY-minY)/_divY).toFixed(7));
		
		// 단위블록 별 지도 경계
		for(var i=_divY; i>0; i--){
			for(var j=0; j<_divX; j++){
				var blockLatLngMap = {
						min: {x: Number(((_unitX * j) + minX).toFixed(7)), y: Number(((_unitY * (i-1)) + minY).toFixed(7))}, 
						max: {x: Number(((_unitX * (j+1)) + minX).toFixed(7)), y: Number(((_unitY * i) + minY).toFixed(7))}
				};
				var blockLatLng = new naver.maps.LatLngBounds(new naver.maps.LatLng(blockLatLngMap.min.y, blockLatLngMap.min.x), 
						new naver.maps.LatLng(blockLatLngMap.max.y, blockLatLngMap.max.x ));
				_blockLatLngArr.push(blockLatLng);
			}
		}
		_clusterObj.blockLatLngArr = _blockLatLngArr;
		
		// 블록 경계 별 마커 개수
		for (var i = 0; i < _blockLatLngArr.length; i++) {
			let _blockLat = [], _blockLng = []
			let totalCnt = 0, supCnt = 0, subCnt = 0;
			
			for (var j = 0; j < markers.length; j++) {
				marker = markers[j];
				position = marker.getPosition();
				
				if (_blockLatLngArr[i].hasLatLng(position)) {
					_blockLat.push(position._lat);
					_blockLng.push(position._lng);
					totalCnt++;
				}
			}
			_blockCntMap.push({total: totalCnt, sup: supCnt, sub: subCnt});
			_blockLatArr.push(_cluster.getAverage(_blockLat));
			_blockLngArr.push(_cluster.getAverage(_blockLng));
		}
		
		_clusterObj.blockCntMap = _blockCntMap;
		_clusterObj.blockLatArr = _blockLatArr;
		_clusterObj.blockLngArr = _blockLngArr;
		
		// 클러스터링 마커 아이콘 및 클릭 이벤트 생성
		for (var i = 0; i < _clusterObj.blockLatLngArr.length; i++) {
			blockClusteringMarker = new naver.maps.Marker({
				map: map,
				position: {lat: _clusterObj.blockLatArr[i] , lng: _clusterObj.blockLngArr[i]},
				draggable: false,
				visible:true,
				icon: {
					content: '<div class="cluster-marker"><div class="cluster-inner"><p class="total">' + _clusterObj.blockCntMap[i].total + '</p></div></div>', 
					//content: _cluster.getContentHtml() ? _cluster.getContentHtml() : '<div class="cluster-marker"><div class="cluster-inner"><p class="total">' + _clusterObj.blockCntMap[i].total + '</p></div></div>', 
					anchor: new naver.maps.Point(12, 13)
				},
				zIndex: 999		
			});
			
			blockClusteringListener = naver.maps.Event.addListener(blockClusteringMarker, 'click', function(e) {
				map.morph(e.coord, map.getZoom() + 1)
			});
			
			_blockMarker.push(blockClusteringMarker);
			_blockListener.push(blockClusteringListener);
		}
		
		_clusterObj.blockMarker = _blockMarker;    
		_clusterObj.blockListener = _blockListener;    
	},
	
	/**
	 * 좌표 평균 계산
	 * @param {Array} arr 좌표 배열
	**/
	getAverage: function(arr){
		if(arr == undefined || arr.length == 0) return;
		
		const result = arr.reduce(function add(sum, currValue) {
	        return sum + currValue;
	    }, 0);
		
	    const average = result / arr.length;

	    return Number(average.toFixed(7));
	},
	
	/**
	 * 사용자 지정 클러스터 options 반환.
	 **/
	getOptions: function(){
		return _clusterObj.options;
	},
	
	/**
	 * 사용자 지정 클러스터 contentHtml 반환.
	 **/
	getContentHtml: function(){
		return _clusterObj.options.contentHtml;
	},
	
	/**
	 * 사용자 지정 클러스터 divX 반환.
	 **/
	getDivX: function(){
		return _clusterObj.options.divX;
	},
	
	/**
	 * 사용자 지정 클러스터 divY 반환.
	 **/
	getDivY: function(){
		return _clusterObj.options.divY;
	},
	
	/**
	 * 사용자 지정 클러스터 maxZoom 반환.
	**/
	getMaxZoom: function(){
		return _clusterObj.options.maxZoom;
	}
		
};
