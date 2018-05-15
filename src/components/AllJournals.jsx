import React, { Component } from 'react';
import Grid from 'material-ui/Grid';
import GridList, { GridListTile, GridListTileBar } from 'material-ui/GridList';
import Subheader from 'material-ui/List/ListSubheader';
import Button from 'material-ui/Button';
import { Link } from 'react-router-dom';
import { withAuth } from 'fireview';
import Add from '@material-ui/icons/Add';
import image from '../images/notebook.jpg';

import { getRootRef } from '../utils/componentUtils';
import  NewJournalForm  from './NewJournalForm.jsx';

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden'
  },
  gridList: {
    width: 500,
    height: "auto",
    spacing: 2
  },
  subheader: {
    fontSize: "3em",
    fontVariant: 'small-caps',
    color: 'grey'
  },
  image: {
    width: "50vh",
    height: "auto",
  }
};

export class AllJournals extends Component {
  constructor () {
    super();
    this.state = {
      rootRef: getRootRef('journals'),
      journals: [],
      allJournalIds: []
    };
  }

  componentWillReceiveProps(nextProps) {
    if(this.props._user !== nextProps._user) {
      const { rootRef } = this.state;
      rootRef.where("userId", "==", nextProps._user.uid).get()
        .then(querySnapshot => {
          querySnapshot.forEach(journal => {
            this.setState({ journals: [...this.state.journals, journal.data()], allJournalIds: [...this.state.allJournalIds, journal.id] });
          });
        });
      }
  }

  newJournal(){
    this.props.history.push(`${this.props._user.uid}/new-journal`);
  }

  render() {
    const journals = this.state.journals;
    const journalIds = this.state.allJournalIds;

    return (
      <div className={styles.root}>
        <GridList cellHeight="auto" className={styles.gridList} cols={2}>
        <GridListTile key="Subheader" cols={2}>
          <Subheader component="div" style={styles.subheader}>Journals</Subheader>
            {this.props && this.props._user ? <Button onClick={this.newJournal.bind(this)}><Add/></Button> : null}
          </GridListTile>
          {
            journals.map((journal, ind) => (
            <GridListTile key={journalIds[ind]}>
              <Link to={`/journals/${journalIds[ind]}`}>
                <img src={image} style={styles.image} alt=""/>
                <GridListTileBar
                  title={journal.title}
                  subtitle={<span>{journal.description}</span>}
                />
                </Link>
                </GridListTile>
            ))
          }
         </GridList>
        </div>
    );
  }
}

export default withAuth(AllJournals);
