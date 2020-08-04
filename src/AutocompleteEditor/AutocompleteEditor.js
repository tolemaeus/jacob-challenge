import React, { Component } from 'react';
import { EditorState } from 'draft-js';
import Editor from 'draft-js-plugins-editor';
import createMentionPlugin from 'draft-js-mention-plugin';
import editorStyles from './editorStyles.css';
import mentions from './mentions';
import hashtags from './hashtags';
import relations from './relations';
import 'draft-js-mention-plugin/lib/plugin.css';

const prefixSuggestionsFilter = (searchValue, suggestions) => {
  const value = searchValue.toLowerCase();
  const filteredSuggestions = suggestions.filter(suggestion => (
    !value || suggestion.name.toLowerCase().startsWith(value)
  ));
  return filteredSuggestions.slice(0, filteredSuggestions.length);
};

export default class AutocompleteEditor extends Component {

  constructor(props) {
    super(props);

    this.personPlugin = createMentionPlugin({
      mentions,
      entityMutability: 'IMMUTABLE',
      mentionPrefix: '@',
      mentionTrigger: '@',
      supportWhitespace: true
    });

    this.hashtagPlugin = createMentionPlugin({
      hashtags,
      entityMutability: 'IMMUTABLE',
      mentionPrefix: '#',
      mentionTrigger: '#',
      supportWhitespace: false
    });

    this.relationPlugin = createMentionPlugin({
      relations,
      entityMutability: 'IMMUTABLE',
      mentionPrefix: '<>',
      mentionTrigger: '<>',
      supportWhitespace: true
    });

    this.onSearchChange = this.onSearchChange.bind(this);
    this.handleEditorClick = this.handleEditorClick.bind(this);
    this.handleEditorChange = this.handleEditorChange.bind(this);
  }

  state = {
    editorState: EditorState.createEmpty(),
    personSuggestions: [],
    hashtagSuggestions: [],
    relationSuggestions: [],
  };

  onSearchChange(value, name, data) {
    // Pop previous intermediate autocomplete value
    const lastItem = (data.length > 0) ? data[data.length - 1] : null;
    if (lastItem !== null && 'inProg' in lastItem) data.pop();

    // Make sure to not push duplicates
    let toPush = value !== '' && data.filter(e => e.name === value).length === 0;
    switch (name) {
      case 'person':
        if (toPush) data.push({name: value, link: '', avatar: '', inProg: true});
        this.setState({
          personSuggestions: prefixSuggestionsFilter(value, data),
        });
        break;
      case 'hashtag':
        if (toPush) data.push({name: value, inProg: true});
        this.setState({
          hashtagSuggestions: prefixSuggestionsFilter(value, data),
        });
        break;
      case 'relation':
        if (toPush) data.push({name: value, inProg: true});
        this.setState({
          relationSuggestions: prefixSuggestionsFilter(value, data),
        });
        break;
      default:
        return;
    }
  }

  handleEditorChange(editorState) {
    this.setState({ editorState });
  }

  handleEditorClick() {
    this.editor.focus();
  }

  onAddMention(value, name, data) {
    if (data.filter(e => e.name === value.name && !('inProg' in e)).length > 0) {
      return;
    }

    // Delete inProg flag as way to commit new autocomplete entry
    const lastItem = (data.length > 0) ? data[data.length - 1] : null;
    if (lastItem !== null && 'inProg' in lastItem) {
      delete lastItem.inProg;
    }
    let dedupData = this.removeDuplicatesFromData(data);
    switch (name) {
      case 'person':
        this.setState({ personSuggestions: dedupData });
        break;
      case 'hashtag':
        this.setState({ hashtagSuggestions: dedupData });
        break;
      case 'relation':
        this.setState({ relationSuggestions: dedupData });
        break;
      default:
        return;
    }
  }
  
  removeDuplicatesFromData(data) {
    let st = new Set();
    var i = data.length;
    while (i--) {
        if (st.has(data[i].name)) { 
          data.splice(i, 1);
        } 
        st.add(data[i].name);
    }
    return data;
  }

  render() {
    const PersonSuggestions = this.personPlugin.MentionSuggestions;
    const HashtagSuggestions = this.hashtagPlugin.MentionSuggestions;
    const RelationSuggestions = this.relationPlugin.MentionSuggestions;

    const plugins = [this.personPlugin, this.hashtagPlugin, this.relationPlugin];

    return (
      <div className={editorStyles.editor} onClick={this.handleEditorClick}>
        <Editor
          editorState={this.state.editorState}
          onChange={this.handleEditorChange}
          plugins={plugins}
          ref={(element) => { this.editor = element; }}
        />
        <PersonSuggestions
          onSearchChange={({ value }) => this.onSearchChange(value, 'person', mentions)}
          suggestions={this.state.personSuggestions}
          onAddMention={( value ) => this.onAddMention(value, 'person', mentions)}
        />
        <HashtagSuggestions
          onSearchChange={({ value }) => this.onSearchChange(value, 'hashtag', hashtags)}
          suggestions={this.state.hashtagSuggestions}
          onAddMention={( value ) => this.onAddMention(value, 'hashtag', hashtags)}
        />
        <RelationSuggestions
          onSearchChange={({ value }) => this.onSearchChange(value, 'relation', relations)}
          suggestions={this.state.relationSuggestions}
          onAddMention={( value ) => this.onAddMention(value, 'relation', relations)}
        />
      </div>
    );
  }
}