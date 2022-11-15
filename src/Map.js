import React, { useState, useRef, useCallback } from "react";
import {
  LoadScript,
  GoogleMap,
  DrawingManager,
  Polygon,
  Marker,
  OverlayView
} from "@react-google-maps/api";
import Switch from "@material-ui/core/Switch";

import Paper from "@material-ui/core/Paper";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";

import "./styles.css";
const libraries = ["drawing"];

const options = {
  drawingControl: true,
  drawingControlOptions: {
    drawingModes: ["marker", "polygon", "polyline", "rectangle", "circle"]
  },
  polygonOptions: {
    fillColor: `#2196F3`,
    strokeColor: `#2196F3`,
    fillOpacity: 0.5,
    strokeWeight: 2,
    clickable: true,
    editable: true,
    draggable: true,
    zIndex: 1
  },
  rectangleOptions: {
    fillColor: `green`,
    strokeColor: `pink`,
    fillOpacity: 0.5,
    strokeWeight: 2,
    clickable: true,
    editable: true,
    draggable: true,
    zIndex: 1
  },
  polylineOptions: {
    fillColor: `green`,
    strokeColor: `pink`,
    fillOpacity: 0.5,
    strokeWeight: 2,
    clickable: true,
    editable: true,
    draggable: true,
    zIndex: 1
  }
};

class LoadScriptOnlyIfNeeded extends LoadScript {
  componentDidMount() {
    const cleaningUp = true;
    const isBrowser = typeof document !== "undefined"; // require('@react-google-maps/api/src/utils/isbrowser')
    const isAlreadyLoaded =
      window.google &&
      window.google.maps &&
      document.querySelector("body.first-hit-completed"); // AJAX page loading system is adding this class the first time the app is loaded
    if (!isAlreadyLoaded && isBrowser) {
      // @ts-ignore
      if (window.google && !cleaningUp) {
        console.error("google api is already presented");
        return;
      }

      this.isCleaningUp().then(this.injectScript);
    }

    if (isAlreadyLoaded) {
      this.setState({ loaded: true });
    }
  }
}

const defaultPaths = [];

export default function Map({ apiKey, center, paths = defaultPaths, point }) {
  const [state, setState] = useState({
    drawingMode: "circle",
    pointSelect: null,
    checkedA: true
  });

  const noDraw = () => {
    setState(function set(prevState) {
      return Object.assign({}, prevState, {
        drawingMode: "maker"
      });
    });
  };

  const onPolygonComplete = React.useCallback(
    function onPolygonComplete(poly) {
      const polyArray = poly.getPath().getArray();
      let paths = [];
      polyArray.forEach(function (path) {
        paths.push({ lat: path.lat(), lng: path.lng() });
      });
      console.log("onPolygonComplete", paths);
      point(paths);
      noDraw();
      poly.setMap(null);
    },
    [point]
  );

  // Define refs for Polygon instance and listeners
  const polygonRef = useRef(null);
  const listenersRef = useRef([]);

  // Call setPath with new edited path
  const onEdit = useCallback(() => {
    if (polygonRef.current) {
      const nextPath = polygonRef.current
        .getPath()
        .getArray()
        .map((latLng) => {
          return { lat: latLng.lat(), lng: latLng.lng() };
        });
      console.log("nextPath", nextPath);
      //setPath(nextPath);
      point(nextPath);
    }
  }, [point]);

  // Bind refs to current Polygon and listeners
  const onLoad = useCallback(
    (polygon) => {
      polygonRef.current = polygon;
      const path = polygon.getPath();
      listenersRef.current.push(
        path.addListener("set_at", onEdit),
        path.addListener("insert_at", onEdit),
        path.addListener("remove_at", onEdit)
      );
    },
    [onEdit]
  );

  // Clean up refs
  const onUnmount = useCallback(() => {
    listenersRef.current.forEach((lis) => lis.remove());
    polygonRef.current = null;
  }, []);

  const deletePoint = (key) => {
    let pp = paths.filter((_, i) => i !== key);
    point(pp);
    setState(function set(prevState) {
      return Object.assign({}, prevState, {
        pointSelect: null
      });
    });
  };

  console.log("Map", paths);

  const handleChange = (name) => (event) => {
    console.log("Name", event.target.checked);
    setState({ ...state, [name]: event.target.checked });
  };

  return (
    <div className="App">
      Hi Web!!
      <LoadScriptOnlyIfNeeded
        id="script-loader"
        googleMapsApiKey={apiKey}
        libraries={libraries}
        language="it"
        region="us"
      >
        <GoogleMap
          mapContainerClassName="App-map"
          center={center}
          zoom={18}
          version="weekly"
        >
          {state.checkedA && state.pointSelect !== null && (
            <OverlayView
              position={paths[state.pointSelect]}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <Paper>
                <MenuList>
                  <MenuItem disabled={true}>
                    Punto #{state.pointSelect}
                  </MenuItem>
                  <MenuItem onClick={() => deletePoint(state.pointSelect)}>
                    Elimina punto
                  </MenuItem>
                  <MenuItem>Modifica Punto</MenuItem>
                  <MenuItem
                    onClick={() => {
                      setState(function set(prevState) {
                        return Object.assign({}, prevState, {
                          pointSelect: null
                        });
                      });
                    }}
                  >
                    Annulla
                  </MenuItem>
                </MenuList>
              </Paper>
            </OverlayView>
          )}
          <div
            style={{
              backgroundColor: "green",
              borderRadius: 4,
              border: "1px solid #ccc",
              padding: 10,
              zIndex: 99999999,
              position: "absolute",
              top: "5px",
              right: "5px",
              width: "200px"
            }}
          >
            <b>Controls</b>
            <hr
              style={{
                //color: "#3794ff",
                backgroundColor: "#3794ff",
                height: 1
              }}
            />
            <Switch
              value="checkedA"
              inputProps={{ "aria-label": "secondary checkbox" }}
            />
            Show
            <br />
            <Switch
              checked={state.checkedA}
              value="checkedA"
              inputProps={{ "aria-label": "secondary checkbox" }}
              onChange={handleChange("checkedA")}
            />
            Show menu
          </div>
          {paths.length < 1 ? (
            <DrawingManager
              drawingMode={state.drawingMode}
              options={options}
              onPolygonComplete={onPolygonComplete}
            />
          ) : (
            <Polygon
              options={{
                fillColor: `#2196F3`,
                strokeColor: "red",
                fillOpacity: 0.5,
                strokeWeight: 1
              }}
              // Make the Polygon editable / draggable
              editable
              draggable
              path={paths}
              // Event used when manipulating and adding points
              onMouseUp={onEdit}
              // Event used when dragging the whole Polygon
              onDragEnd={onEdit}
              onLoad={onLoad}
              onUnmount={onUnmount}
            />
          )}
          {paths.length > 0 &&
            paths.map((pos, key) => {
              return (
                <Marker
                  key={key}
                  label={"" + key}
                  position={pos}
                  onRightClick={(pos) => {
                    //let pp = paths.filter((_, i) => i !== key);
                    //point(pp);
                    console.log(key);
                    setState(function set(prevState) {
                      return Object.assign({}, prevState, {
                        pointSelect: key
                      });
                    });
                  }}
                  title={"[" + pos.lat + "," + pos.lng + "]"}
                  draggable
                  onDragEnd={(pos) => {
                    let obj = { lat: pos.latLng.lat(), lng: pos.latLng.lng() };
                    var copia = Object.assign([], paths);
                    copia[key] = obj;
                    point(copia);
                    if (state.pointSelect !== null)
                      setState(function set(prevState) {
                        return Object.assign({}, prevState, {
                          pointSelect: null
                        });
                      });
                  }}
                />
              );
            })}
        </GoogleMap>
      </LoadScriptOnlyIfNeeded>
    </div>
  );
}
