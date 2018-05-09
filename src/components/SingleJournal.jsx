import React, { Component } from 'react';
import Button from "material-ui/Button";

import { getRootRef } from '../utils/componentUtils';

export default class SingleJournal extends Component {
  constructor(props){
    super(props);
    this.addEntry = this.addEntry.bind(this);

  }

  addEntry(){
    getRootRef('entries').add({})
      .then(docRef => this.props.history.push(`/entries/${docRef.id}`));
  };

  render() {
    return (
      <div>
        <Button onClick={this.addEntry}>New Entry</Button>
      </div>
    )
  }
}
