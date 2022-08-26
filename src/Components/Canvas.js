import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer} from "react-konva";
import shortid from "shortid";

import Rectangle from "./Rectangle/Rectangle";
import RectTransformer from "./Rectangle/RectTransformer";
import AnnotationImage from "./AnnotationImage/AnnotationImage";
import "./Canvas.css";

const Canvas = () => {
  const stageRef = useRef();
  const imgLayerRef = useRef();

  const [rectangles, setRectangles] = useState([]);
  const [rectCount, setRectCount] = useState(0);
  const [selectedShapeName, setSelectedShapeName] = useState("");
  const [mouseDown, setMouseDown] = useState(false);
  const [mouseDraw, setMouseDraw] = useState(false);
  const [newRectX, setNewRectX] = useState(0);
  const [newRectY, setNewRectY] = useState(0);

  useEffect(() => {
    imgLayerRef && imgLayerRef.current.moveToBottom();
  }, [imgLayerRef]);

  const _onStageMouseDown = event => {
    if (event.target.className === "Image") {
      const stage = event.target.getStage();
      const mousePos = stage.getPointerPosition();
      setMouseDown(true);
      setNewRectX(mousePos.x);
      setNewRectY(mousePos.y);
      setSelectedShapeName("");
      return;
    }

    const clickedOnTransformer =
      event.target.getParent().className === "Transformer";
    if (clickedOnTransformer) {
      return;
    }

    const name = event.target.name();
    const rect = rectangles.find(r => r.name === name);
    if (rect) {
      setSelectedShapeName(name);
    } else {
      setSelectedShapeName("");
    }
  };

  const _onRectChange = (index, newProps) => {
    let updatedRect = {
      ...rectangles[index],
      ...newProps
    };
    let newRects = [
      ...rectangles.slice(0, index),
      (rectangles[index] = updatedRect),
      ...rectangles.slice(index + 1)
    ];

    setRectangles(newRects);
  };

  const _onNewRectChange = event => {
    const stage = event.target.getStage();
    const mousePos = stage.getPointerPosition();

    if (!rectangles[rectCount]) {
      let newRect = {
        x: newRectX,
        y: newRectY,
        width: mousePos.x - newRectX,
        height: mousePos.y - newRectY,
        name: `rect${rectCount + 1}`,
        stroke: "black",
        key: shortid.generate()
      };
      setMouseDraw(true);
      setRectangles([...rectangles, newRect]);
      return;
    }

    let updatedRect = {
      ...rectangles[rectCount],
      width: mousePos.x - newRectX,
      height: mousePos.y - newRectY
    };

    let newRects = [
      ...rectangles.slice(0, rectCount),
      (rectangles[rectCount] = updatedRect),
      ...rectangles.slice(rectCount + 1)
    ];

    return setRectangles(newRects);
  };

  const _onStageMouseUp = () => {
    if (mouseDraw) {
      setRectCount(rectCount + 1);
      setMouseDraw(false);
    }
    setMouseDown(false);
  };

  const scaleBy = 1.13;

  const _onWheel = e => {
    e.evt.preventDefault();
    var oldScale = stageRef.current.scaleX();

    var mousePointTo = {
      x:
        stageRef.current.getPointerPosition().x / oldScale -
        stageRef.current.x() / oldScale,
      y:
        stageRef.current.getPointerPosition().y / oldScale -
        stageRef.current.y() / oldScale
    };

    let newScale = Math.max(
      1,
      e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy
    );

    stageRef.current.scale({ x: newScale, y: newScale });

    var newPos = {
      x:
        -(mousePointTo.x - stageRef.current.getPointerPosition().x / newScale) *
        newScale,
      y:
        -(mousePointTo.y - stageRef.current.getPointerPosition().y / newScale) *
        newScale
    };
    stageRef.current.position(newPos);
    stageRef.current.batchDraw();
  };

  return (
    <div>
      <div className="Details">
        <h2>{selectedShapeName}</h2>
      </div>
      <div id="stageContainer">
        <Stage
          ref={stageRef}
          container={"stageContainer"}
          width={800}
          height={450}
          onMouseDown={_onStageMouseDown}
          onTouchStart={_onStageMouseDown}
          onMouseMove={mouseDown && _onNewRectChange}
          onTouchMove={mouseDown && _onNewRectChange}
          onMouseUp={mouseDown && _onStageMouseUp}
          onTouchEnd={mouseDown && _onStageMouseUp}
          onWheel={_onWheel}
        >
          <Layer>
            {rectangles.map((rect, i) => (
              <Rectangle
                key={i}
                {...rect}
                onTransform={newProps => {
                  _onRectChange(i, newProps);
                }}
              />
            ))}
            <RectTransformer selectedShapeName={selectedShapeName} />
          </Layer>
          <Layer ref={imgLayerRef}>
            <AnnotationImage />
          </Layer>
        </Stage>
      </div>
      {/* <div>
        <button onClick={_onWheel} >Zoom In</button>
        <button onClick={_onWheel} >Zoom Out</button>
      </div> */}
    </div>
  );
};

export default Canvas;
