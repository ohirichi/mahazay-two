import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import './App.css';
import { 
  Navbar, 
  SingleEntry,
  Dashboard,
  Home,
  AllEntries,
  AllJournals,
  SingleJournal, 
  NewJournalForm
} from './components/index.js';

const theme = createMuiTheme();


function App() {
  return (
    <Router>
      <MuiThemeProvider theme={theme}>
        <div className="App">
          <div className="col-xs-10">
            <Navbar />
          </div>
          <div className="col-xs-10">
          <Switch>
            <Route exact path="/" />
            <Route exact path="/entries" component={AllEntries}/>
            <Route exact path="/entries/:id" component={SingleEntry}/>
            <Route exact path="/journals" component={AllJournals} />
            <Route exact path="/journals/:id" component={SingleJournal} />
            <Route exact path="/new-journal" component={NewJournalForm}/>
          </Switch>
          </div>
        </div>
      </MuiThemeProvider>
    </Router>
  );
}


export default App;