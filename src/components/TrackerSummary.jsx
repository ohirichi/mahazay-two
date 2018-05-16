import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import TextField from 'material-ui/TextField';
import Subheader from 'material-ui/List/ListSubheader';
import { confirmAlert } from 'react-confirm-alert';
import Button from 'material-ui/Button';
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from 'material-ui/Table';
import Grid from 'material-ui/Grid';
import Add from '@material-ui/icons/Add';
import Checkbox from 'material-ui/Checkbox';
import { withTheme } from 'material-ui/styles';

import { Map, withAuth } from 'fireview';
import { db } from '../utils/firebase.config';
import { generateWeek, months } from '../utils/trackerSummaryUtils';

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    marginLeft: '30%',
  },
  textField: {
    width: 200,
  },
  menu: {
    width: 200,
  },
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 500
  }, 
  check: {
    color: 'green', 
    alignSelf: 'center', 
  }, 
  x: {
    color: 'red', 
    alignSelf: 'center'
  }, 
});

class TrackerSummary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      habits: [],
      habitToAdd: {}, 
      weeksAgo: 0, 
      week: generateWeek(0)
    };
    this.handleAdd = this.handleAdd.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getWeek = this.getWeek.bind(this);
  }

  componentDidMount() {
    db.collection('habits').get()
      .then(snaps => snaps.forEach(snap => this.setState({ habits: [...this.state.habits, snap.data()] })
    ));
  }

  handleChange(event) {
    event.preventDefault();
    const user = this.props._user;
    const userId = user && user.uid ? user.uid : null;
    this.setState({ habitToAdd : { name: event.target.value, userId: userId, datesCompleted: [] }});
  }

  handleAdd(e) {
    e.preventDefault();
    const habitToAdd = this.state.habitToAdd;
    db.collection('habits').add(habitToAdd)
      .then(() => {
        this.setState({ habitToAdd: { name: '' } });
        this.props.history.push(`/tracker/${habitToAdd.name}`);
      });
  }

  deleteHabit(e){
    e.preventDefault();
    e.persist();

    
    confirmAlert({
      title: `Are you sure you don't want to track ${e.target.name} anymore?`,
      message: `Click yes to confirm, no to keep tracking ${e.target.name}`,
      buttons: [
        {
          label: 'Yes, stop tracking',
          onClick: () => {
            db.collection('habits').where('name', '==', e.target.name).get()
              .then(querySnapshot => {
                querySnapshot.forEach(habit => {
                  if (habit.data().name === e.target.name) return habit.ref.delete();
                })
            })
          .then(() => this.props.history.push('/tracker'))
          .catch(console.error);
          }
        },
        {
          label: 'No, keep tracking',
          onClick: () => this.props.history.push(`/tracker`)
        }
      ]
    });
  }


  resetToThisWeek(){
    this.setState({ weeksAgo: 0 });
    this.setState({ week: this.getWeek(0) });
  }

  getWeeksAgo(){
    this.setState({ weeksAgo: this.state.weeksAgo += 1 });
    this.setState({ week: this.getWeek() })
  }

  getWeek(weeksAgo){
    if (weeksAgo === 0) return generateWeek(weeksAgo);
    return generateWeek(this.state.weeksAgo);
  }

  render() {
    const AllHabits = db.collection('habits');
    const user = this.props._user;
    const userId = user && user.uid ? user.uid : null;
    const { week } = this.state;
    const Habit = props => {
      const { name, datesCompleted } = props;
      return (
        <TableRow key={props}>
          <TableCell style={{ display: 'flex'}}>
            <form onSubmit={this.deleteHabit.bind(this)} name={name} value={name}><Button type="submit" style={{color: "grey"}}>{name}</Button></form>
          </TableCell>
          
            { week.map(day => {
             
              if (props){
                const datesCompletedArr = [];
                datesCompleted.forEach(date => datesCompletedArr.push(new Date(date).toString().split(' ')));
                const formattedDatesCompleted = datesCompletedArr.map(date => `${date[0]} ${months.indexOf(date[1]) + 1}/${date[2]}`);
                let isChecked = false;
                const datesMatch = day => {
                  for (let i = 0; i < formattedDatesCompleted.length; i++){
                    if (formattedDatesCompleted[i] === day) return true;
                  }
                  return false;
                }
                if (datesMatch(day)) return <TableCell key={day}><b style={{color: '#3ace3a'}}>Y</b></TableCell>
                else if (!datesMatch(day)) return <TableCell key={day}><b style={{ color: '#dd7777' }}>X</b></TableCell>
              }
              
              
              
              }) 
            }
        </TableRow>
      )
    };
    


    return (
      <Grid container style={{marginLeft: "5%", paddingRight: "15%", marginBottom: "5%", display: 'flex', flexDirection: "column"}}>
         <Subheader component="div" style={{ fontSize: "2.5em", fontVariant: 'small-caps',color: 'grey'}}>Your Habits</Subheader>
        <Grid item>
        <form onSubmit={this.handleAdd} style={{ marginLeft: "5%" }}> 
        <TextField
          id="name"
          label="Add Habit?"
          name="habitToAdd"
          style={styles.textField}
          onChange={this.handleChange}
          margin="normal"
          value={this.state.habitToAdd.name}
        />
        <Button type="submit"><Add style={{color: "grey", width: 30, height: "auto"}}/></Button>
        </form>
      </Grid>

      <Table>
      <TableHead>
        <TableRow>
        <TableCell><Button onClick={this.getWeeksAgo.bind(this)} style={{color: 'grey'}}>Previous Week</Button></TableCell>
        <TableCell><Button onClick={this.resetToThisWeek.bind(this)} style={{color: 'grey'}}>This Week</Button></TableCell>
        </TableRow>
      </TableHead>
        <TableBody>
        <TableCell></TableCell>
        {week.map(day => <TableCell key={day}><b style={{color: 'grey'}}>{day}</b></TableCell>)}
          <Map from={AllHabits.where('userId', '==', userId)}
          Render={Habit}
          />
        </TableBody>
      </Table>

      </Grid>
      );
  }
}

export default withTheme()(withAuth(TrackerSummary));

// const formattedDate = `${months.indexOf(dateArray[1]) + 1}/${dateArray[2]}`;
//                     console.log('formatted date', formattedDate);
