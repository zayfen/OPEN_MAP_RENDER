import { useState, useMemo } from "react";
import "./styles.css";
import RawMapDataFromBackend from "./raw-map-data-from-backend.json";
import { transformRawMapData } from "./transform-raw-map-data";
import {
  Stage,
  Layer,
  Image,
  Circle,
  Text,
  Group,
  Line,
  Star
} from "react-konva";
import useImage from "use-image";

const transformedMapData = transformRawMapData(RawMapDataFromBackend.data);

function App() {
  const [mapData, setMapData] = useState(transformedMapData);
  const [robotPos, setRobotPos] = useState({ x: 0, y: 0 });

  const mapImageUrl = useMemo(() => {
    if (!mapData) {
      return "";
    }

    return mapData.mapImage.url;
  }, [mapData]);

  const [mapImage] = useImage(mapImageUrl);

  const [imageOriginX, imageOriginY] = useMemo(() => {
    if (!mapData) {
      return [0, 0];
    }
    return [mapData.mapImage.x, mapData.mapImage.y];
  }, [mapData]);


  const [translateX, translateY] = useMemo(() => {
    if (!mapData) {
      return [0, 0];
    }
    return [mapData.mapImage.translate.x, mapData.mapImage.translate.y];
  }, [mapData]);

  function handleMapDataChange(evt) {
    const mapDataText = evt.target.value;

    try {
      const mapDataJson = JSON.parse(mapDataText.trim());

      setMapData(transformRawMapData(mapDataJson.data));
    } catch (error) {
      console.error("请输入合法的JSON字符串");
    }
  }

  return (
    <div className="App">
      <div className="json-container">
        <textarea
          id="json"
          className="json-input"
          placeholder="输入接口返回的json地图数据"
          onChange={(evt) => handleMapDataChange(evt)}
        />
      </div>

      {!mapData && <div className="stage">请先输入地图接口返回的数据</div>}
      {mapData && (
        <div className="robot-pos">
          <label>Robot Position:</label>
          <input
            placeholder="x"
            onChange={(evt) => {
              if ((Number, isFinite(+evt.target.value))) {
                setRobotPos((pos) => ({ ...pos, x: +evt.target.value }));
              }
            }}
          />
          <input
            placeholder="y"
            onChange={(evt) => {
              if (Number.isFinite(+evt.target.value)) {
                setRobotPos((pos) => ({ ...pos, y: +evt.target.value }));
              }
            }}
          />
        </div>
      )}
      {mapData && (
        <Stage className="stage" width={1200} height={800}>
          <Layer draggable={true}>
            <Group
              x={translateX}
              y={translateY}
              scaleX={1}
              scaleY={1}
            >
              <Image image={mapImage} x={imageOriginX} y={imageOriginY} />

              {mapData.elementList.map((item, index) => {
                if (item.type === "area" || item.type === "edge") {
                  return (
                    <>
                      <Line
                        key={index + "_1"}
                        points={item.vector_list}
                        stroke={"green"}
                        closed={true}
                      />
                      <Line
                        key={index + "_2"}
                        points={item.clean_path_list
                          .map((p) => [p.x, p.y])
                          .flat()}
                        stroke={"red"}
                      />
                    </>
                  );
                } else if (item.type === "track") {
                  return (
                    <Line
                      key={index + "_track"}
                      points={item.vector_list}
                      stroke="red"
                      strokeWidth={6}
                    />
                  );
                } else {
                  return (
                    <>
                      <Circle
                        key={index + "_circle"}
                        fill="purple"
                        x={item.vector_list[0]}
                        y={item.vector_list[1]}
                        radius={8}
                      />
                      <Text
                        key={index + "_text"}
                        x={item.vector_list[0]}
                        y={item.vector_list[1]}
                        text={item.name}
                        fill="red"
                      />
                    </>
                  );
                }
              })}

              {mapData.zoneList.map((zone, index) => {
                return (
                  <Line
                    key={index + "_zone"}
                    points={zone.zone_node_list
                      .map((node) => node.vector_list)
                      .flat()}
                    fill="blue"
                    stroke={"blue"}
                    closed={true}
                    opacity={0.5}
                  />
                );
              })}

              <Star
                x={robotPos.x}
                y={robotPos.y}
                numberPoints={3}
                innerRadius={12}
                outerRadius={20}
                fill="yellow"
                stroke="purple"
              />
            </Group>
          </Layer>
        </Stage>
      )}
    </div>
  );
}

export default App;
