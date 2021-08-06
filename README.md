

# SimpleMarkerClustering
Simplified map marker clustering API based on Naver Map API

화면에 표시된 지도 영역을 일정하게 분할하여 분할 영역 별로 마커 개수 및 좌표의 평균 값을 계산해 클러스터링 마커를 표시합니다. 

![image](https://user-images.githubusercontent.com/48939257/128468363-c6d0ad38-0d25-47fa-a42d-9a5a1c15d799.png)


* * *
### 기본 사용 코드

```   	
window.onload = function(){
    makeMarkers(data);
	   
    // 마커 클러스터링 객체 생성
    var cmc = new SimpleCluster({
        divX: 5,	// 가로로 나눌 화면 칸
        divY: 3,	// 세로로 나눌 화면 칸
        maxZoom: 17 // 클러스터링 적용 시작 줌 레벨
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
```

### 설명
* ```SimpleCluster``` : 클러스터 마커
* ```divX```: (number)가로로 나눌 화면 칸(default: 2)
* ```divY```: (number)가로로 나눌 화면 칸(default: 2)
* ```maxZoom```: (number)클러스터링이 적용될 줌 레벨. 이 값보다 높은 레벨에서는 개별 마커가 보여집니다.
* ```idle```: map 최적화 이벤트. ```maxZoom``` 값을 기준으로 클러스터링하게 됩니다.
* ```map.getZoom()```: 현재 줌 레벨 

### 사용방법
1. map과 marker 생성 완료 시점 이후에 ```SimpleCluster``` 객체를 생성합니다.
2. 생성 시 ```divX```, ```divY```, ```maxZoom```에 원하는 값을 입력합니다.  
3. ```idle``` 함수에서 클러스터링이 적용되고 해제될 시점을 설정합니다. 

    

#### 붙이는 말

이 라이브러리는 Naver Map API 기준으로 작성되었으나, 대부분의 map api가 제공하는 기본 기능이 비슷하기 때문에 상황에 맞게 적용 가능할 것으로 보입니다. 

Naver Map API 이용 중 지도에 표시될 마커의 개수가 많고, 모든 마커를 지도 상에 필수로 표시해야 하는 경우
네이버에서 제공되는 클러스터링 API를 쓰면 성능이 매우 떨어지는 현상이 있어서 만들게 되었습니다. 

성능저하의 원인으로는 안그래도 많은 마커, map에 할당되는 idle 함수와 클러스터링의 idle 함수가 함께 돌아가면서 생기는 것으로 파악되고 있습니다. 
