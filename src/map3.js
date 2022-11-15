import React, { useState, useRef, useCallback } from "react";
import {
  LoadScript,
  GoogleMap,
  DrawingManager,
  Polygon,
  Marker
} from "@react-google-maps/api";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";

import "./styles.css";
const libraries = ["drawing"];

const options = {
  drawingControl: true,
  drawingControlOptions: {
    drawingModes: ["polygon"]
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

export default function Map({ apiKey, center, paths = [], point }) {
  const [open, setOpen] = React.useState(false);
  const [pointSelect, setPointSelect] = React.useState(null);

  const [path, setPath] = useState(paths);
  const [state, setState] = useState({
    drawingMode: "polygon"
  });
  React.useEffect(() => {
    //console.log("s")
    let p = { lat: 38.832239081493036, lng: -77.09439122148439 };
    //returnPoint(p);
    setPath(paths);
  }, [paths]);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const calcCrow = (obj, obj2) => {
    let lat1 = obj.lat;
    let lon1 = obj.lng;
    let lat2 = obj2.lat;
    let lon2 = obj2.lng;

    var R = 6371; // km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    lat1 = toRad(lat1);
    lat2 = toRad(lat2);

    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
  };

  const toRad = Value => {
    return (Value * Math.PI) / 180;
  };

  const returnPoint = obj => {
    //console.log("returnPoint", obj, path);
    let number = [];
    path.map((el, key) => {
      number.push({ dist: calcCrow(obj, el), key });
      console.log("dist", calcCrow(obj, el), key);
    });
    number.sort(function(a, b) {
      return a.dist - b.dist;
    });
    return [number[0], number[1]];
    //console.log("s", number);
  };

  const noDraw = () => {
    setState(function set(prevState) {
      return Object.assign({}, prevState, {
        drawingMode: "marker"
      });
    });
  };

  const onPolygonComplete = React.useCallback(
    function onPolygonComplete(poly) {
      const polyArray = poly.getPath().getArray();
      let paths = [];
      polyArray.forEach(function(path) {
        paths.push({ lat: path.lat(), lng: path.lng() });
      });
      setPath(paths);
      console.log("onPolygonComplete", paths);
      point(paths);
      noDraw();
      poly.setMap(null);
    },
    [point]
  );

  /*const onLoad = React.useCallback(function onLoad(map) {
    //console.log(map);
  }, []);

  const onDrawingManagerLoad = React.useCallback(function onDrawingManagerLoad(
    drawingManager
  ) {
    // console.log(drawingManager);
  },
  []);*/

  /*React.useEffect(() => {
    setTimeout(() => {
      path.splice(0, 1);
      setPath(path);
      point(path);
    }, 2000);
  });*/

  // Define refs for Polygon instance and listeners
  const polygonRef = useRef(null);
  const listenersRef = useRef([]);

  // Call setPath with new edited path
  const onEdit = useCallback(() => {
    if (polygonRef.current) {
      const nextPath = polygonRef.current
        .getPath()
        .getArray()
        .map(latLng => {
          return { lat: latLng.lat(), lng: latLng.lng() };
        });
      console.log("nextPath", nextPath);
      setPath(nextPath);
      point(nextPath);
    }
  }, [setPath, point]);

  // Bind refs to current Polygon and listeners
  const onLoad = useCallback(
    polygon => {
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
    listenersRef.current.forEach(lis => lis.remove());
    polygonRef.current = null;
  }, []);

  console.log(path);

  return (
    <div className="App">
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
          zoom={10}
          version="weekly"
          //onLoad={onLoad}
        >
          <DrawingManager
            drawingMode={state.drawingMode}
            options={options}
            onPolygonComplete={onPolygonComplete}
            /*onMarkerComplete={maker => {
              let obj = {
                lat: maker.position.lat(),
                lng: maker.position.lng()
              };
              var copia = Object.assign([], path);

              console.log(path, returnPoint(obj));
              let op = copia.splice(returnPoint(obj)[1].key, 0, obj);
              setPath(copia);
              point(copia);
              //console.log(path, copia, op);
            }}*/
            //onLoad={onDrawingManagerLoad}
            /*editable
              draggable
              // Event used when manipulating and adding points
              onMouseUp={onEdit}
              // Event used when dragging the whole Polygon
              onDragEnd={onEdit}*/
          />
          {path.length > 0 && (
            <Polygon
              options={{
                fillColor: `#2196F3`,
                strokeColor: `#2196F3`,
                fillOpacity: 0.5,
                strokeWeight: 2
              }}
              // Make the Polygon editable / draggable
              editable
              draggable
              path={path}
              // Event used when manipulating and adding points
              onMouseUp={onEdit}
              // Event used when dragging the whole Polygon
              onDragEnd={onEdit}
              onLoad={onLoad}
              onUnmount={onUnmount}
            />
          )}
          {path.map((pos, key) => {
            return (
              <Marker
                key={key}
                label={"" + key}
                position={pos}
                onRightClick={pos => {
                  /*paths.splice(key, 1);
                  setPath(paths);
                  point(paths);*/
                  setPointSelect(key);
                  handleClickOpen();
                  console.log(key);
                }}
                title={"[" + pos.lat + "," + pos.lng + "]"}
                draggable
                /*onPositionChanged={(t, map, coord)  => {
                  //const position = this.getPosition();
                  console.log("marker2",a);
                }}
                onDraggableChanged={a => {
                  console.log("marker",a);
                }}*/
              />
            );
          })}
        </GoogleMap>
      </LoadScriptOnlyIfNeeded>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Vuoi eliminare il punto #{pointSelect}?
        </DialogTitle>

        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Annulla
          </Button>
          <Button
            onClick={() => {
              //path.splice(pointSelect, 1);
              let pp = paths.filter((_, i) => i !== pointSelect);
              setPath(pp);
              point(pp);
              handleClose();
            }}
            color="primary"
            autoFocus
          >
            Cancella
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
