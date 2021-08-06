

# SimpleMarkerClustering
Simplified map marker clustering API based on Naver Map API

화면에 표시된 지도 영역을 일정하게 분할하여 분할 영역 별로 마커 개수 및 좌표의 평균 값을 계산해 클러스터링 마커를 표시합니다. 

![이미지 50](https://user-images.githubusercontent.com/48939257/128497904-aa6de4ef-65ce-449c-8932-3f8d0ef2c006.png)


## 적용 예시 
### 마커 개수와 상관 없이 빠른 클러스터링

#### * 클러스터링 마커 클릭 시 해당 위치를 중심으로 1레벨씩 확대됩니다. 

![run1](https://user-images.githubusercontent.com/48939257/128496094-6a87376a-ce35-46ab-9491-07abebc6a031.gif)

#### * 지도 영역이 넓어져도 딜레이 없이 바로 적용됩니다. 
![ezgif com-gif-maker](https://user-images.githubusercontent.com/48939257/128496841-e49a34c8-13d4-429c-9782-a5a65bc28095.gif)

* * *
## 기본 사용 코드
index.jsp 中
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
* ```SimpleCluster``` : 클러스터 마커 객체
* ```divX```: (number)가로로 나눌 화면 칸(default: 2)
* ```divY```: (number)가로로 나눌 화면 칸(default: 2)
* ```maxZoom```: (number)클러스터링이 적용될 줌 레벨. 이 값보다 높은 레벨에서는 개별 마커가 보여집니다.
* ```idle```: map 최적화 이벤트(naver.Map) ```maxZoom``` 값을 기준으로 클러스터링하게 됩니다.
* ```map.getZoom()```: 현재 줌 레벨 

### 사용방법
1. map과 marker 생성 완료 시점 이후에 ```SimpleCluster``` 객체를 생성합니다.
2. 생성 시 ```divX```, ```divY```, ```maxZoom```에 원하는 값을 입력합니다.  
3. ```idle``` 함수에서 클러스터링이 적용되고 해제될 시점을 설정합니다. 

    

#### 붙이는 말

Naver 개발자 센터에서는 GitHub 링크를 통하여 MarkerClustering api를 제공하고 있습니다. 
- 샘플 링크: https://navermaps.github.io/maps.js.ncp/docs/tutorial-marker-cluster.example.html
- 샘플 소스: https://github.com/navermaps/marker-tools.js/tree/master/marker-clustering
- 
하지만 지도에 표시될 마커의 개수가 많고, 모든 마커를 지도 상에 필수로 표시해야 하는 경우 
공개된 클러스터링 API를 쓰면 성능이 매우 떨어지는 현상이 있어서 만들게 되었습니다. 
성능저하의 원인으로는 1,000개 이상의 마커, map에 할당되는 idle 함수와 클러스터링의 idle 함수가 동시에 함께 돌아가면서 생기는 것으로 파악되고 있습니다. 

이 소스는 Naver Map API 기준으로 작성되었으나, 대부분의 map api가 제공하는 기본 기능이 비슷하고 소스 내용이 간단하여 상황에 맞게 적용 가능할 것으로 보입니다. 
