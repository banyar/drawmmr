import React from "react";
import ReactDOM from "react-dom";

import Map from "./Map";
import "./styles.css";

//import { makeStyles } from "@material-ui/core/styles";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ClearIcon from "@material-ui/icons/Clear";
import TextField from "@material-ui/core/TextField";

const API_KEY = "AIzaSyBgzldajYkQdMUFSWvOwcy6GIdsNoBSLZI";

/*const useStyles = makeStyles(theme => ({
  root: {
    width: "100%"
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular
  }
}));*/

const useStyles = (theme) => ({
  root: {
    width: "100%"
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular
  }
});

const center = {
  lat: 16.807484,
  lng: 96.122955
};

//const classes = useStyles();
//className={classes.heading}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      paths: [
        /*{ lat: 38.97330905858943, lng: -77.10469090410157 },
        { lat: 38.9209748864926, lng: -76.9083102888672 },
        { lat: 38.82689001319151, lng: -76.92204319902345 },
        { lat: 38.82261046915962, lng: -77.0181735701172 },
        { lat: 38.90174038629909, lng: -77.14314305253907 }*/
      ]
    };
  }

  render() {
    const { paths } = this.state;

    return (
      <div className="App2">
        <Map
          apiKey={API_KEY}
          center={center}
          paths={paths}
          point={(paths) => this.setState({ paths })}
        />
      </div>
    );
  }
}

//export default withStyles(useStyles)(App);
const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
