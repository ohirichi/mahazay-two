import React from "react";
import { EditorState, RichUtils, convertFromRaw, convertToRaw, EditorChangeType, ContentState } from "draft-js";
import Editor from 'draft-js-plugins-editor';


import Button from "material-ui/Button";

import { getRootRef } from '../utils/componentUtils';
import { plugins, styles } from './../utils/singleEntryUtils';
import SingleEntrySidebar from './SingleEntrySidebar.jsx';

import { db } from '../utils/firebase.config.js';





export default class SingleEntry extends React.Component {
  state = {
    editorState: null, 
    alignment: 'left', 
    showStyleToolbar: false, 
    showAlignmentToolbar: false, 
    rootRef: getRootRef('entries', this.props.match.params.id)
  }
  
  componentDidMount(){
    
    this.state.rootRef.get()
      .then(snap => {
      const content = snap.data() ? convertFromRaw(snap.data().content) : ContentState.createFromText('')
        console.log('data', snap.data());
      this.setState({ editorState: EditorState.createWithContent(content) })
    })
  }
  onChange = editorState => {
    // to send data from entry to firebase WHILE USER IS UPDATING: use convertToRaw(editorState.getCurrentContent())
    // console.log(convertToRaw(editorState.getCurrentContent()))
    this.setState({editorState})
    this.state.rootRef.content 
      ? this.state.rootRef.update({ content: convertToRaw(editorState.getCurrentContent()) })
      : this.state.rootRef.set({ content: convertToRaw(editorState.getCurrentContent()) });

  }

  toggleInlineStyle = style => () => 
    this.onChange(RichUtils.toggleInlineStyle(
      this.state.editorState,
      style
    ))

  onBold = this.toggleInlineStyle('BOLD')
  onItalic = this.toggleInlineStyle('ITALIC')
  onUnderline = this.toggleInlineStyle('UNDERLINE')
  onStrikethrough = this.toggleInlineStyle('STRIKETHROUGH')

  onAlignmentChange(alignment){
    this.setState({ alignment })
  }

  showStyleToolbar(){
    this.setState({ showStyleToolbar: !this.state.showStyleToolbar })
  }
  showAlignmentToolbar(){
    this.setState({ showAlignmentToolbar: !this.state.showAlignmentToolbar })
  }

  renderStyleToolbar() {
    return <React.Fragment>
        <Button onClick={this.onBold}>Bold</Button>
        <Button onClick={this.onItalic}>Italic</Button>
        <Button onClick={this.onUnderline}>Underline</Button>
        <Button onClick={this.onStrikethrough}>Strikethrough</Button>
    </React.Fragment>
  }

  renderAlignmentToolbar(){
    return <React.Fragment>
        <Button onClick={this.onAlignmentChange.bind(this, 'left')}>Left</Button>
        <Button onClick={this.onAlignmentChange.bind(this, 'center')}>Center</Button>
        <Button onClick={this.onAlignmentChange.bind(this, 'right')}>Right</Button>
    </React.Fragment>
  }

  render() {
    const { alignment, showStyleToolbar, showAlignmentToolbar, editorState } = this.state;
    if (!editorState) return 'loading';
    console.log('single entry props: ', this.props)
    return (
      <div id="singleEntry">
        <div id="sidebar"> <SingleEntrySidebar/> </div>
        <div id="editor">
          <Button onClick={this.showStyleToolbar.bind(this)}><b>B</b><i>I</i><u>U</u></Button>
          {showStyleToolbar && <div>{this.renderStyleToolbar()}</div>}
          <Button onClick={this.showAlignmentToolbar.bind(this)}>Align</Button>
          {showAlignmentToolbar && <div>{this.renderAlignmentToolbar()}</div>}
          
              <Editor
                customStyleMap={styles.styleMap}
                editorState={this.state.editorState}
                onChange={this.onChange}
                placeholder="...start here"
                plugins={plugins}
                textAlignment={alignment}
              />
          </div>
       
      </div>
    );
  }
}
