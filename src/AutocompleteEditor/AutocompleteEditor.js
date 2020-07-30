import React, { Component } from 'react';
import { EditorState } from 'draft-js';
import Editor from 'draft-js-plugins-editor';
import createMentionPlugin from 'draft-js-mention-plugin';
import editorStyles from './editorStyles.css';
import mentions from './mentions';
import hashtags from './hashtags';
import relations from './relations';
import 'draft-js-mention-plugin/lib/plugin.css';

const size = list => (list.constructor.name === 'List'
  ? list.size
  : list.length);

const get = (obj, attr) => (obj.get
  ? obj.get(attr)
  : obj[attr]);

const prefixSuggestionsFilter = (searchValue, suggestions, maxResults) => {
  const value = searchValue.toLowerCase();
  const filteredSuggestions = suggestions.filter(suggestion => (
    !value || get(suggestion, 'name').toLowerCase().startsWith(value)
  ));
  const length = size(filteredSuggestions) < maxResults ? size(filteredSuggestions) : maxResults;
  return filteredSuggestions.slice(0, length);
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
    switch (name) {
      case 'person':
        this.setState({
          personSuggestions: prefixSuggestionsFilter(value, data),
        });
        break;
      case 'hashtag':
        this.setState({
          hashtagSuggestions: prefixSuggestionsFilter(value, data),
        });
        break;
      case 'relation':
        this.setState({
          relationSuggestions: prefixSuggestionsFilter(value, data),
        });
        break;
      default:
        return;
    }
  }

  // onAddMention = () => {
  //   // get the mention object selected
  //   console.log("INSIDE onAddMention");
  // }

  // onOpen = (name, data) => {
  //   console.log("INSIDE onOpen: ", name, ", data: ", data);
  // }

  // onClose = (name, data) => {
  //   console.log("INSIDE onClose: ", name, ", data: ", data);
  // }

  handleEditorChange(editorState) {
    this.setState({ editorState });
  }

  handleEditorClick() {
    this.editor.focus();
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
          suggestions={(() => {
            // console.log("INSIDE PERSON SUGGESTIONS");
            return this.state.personSuggestions;
          })()}
          onAddMention={this.onAddMention}
          // onOpen={() => this.onOpen('person', mentions)}
          // onClose={() => this.onClose('person', mentions)}
        />
        <HashtagSuggestions
          onSearchChange={({ value }) => this.onSearchChange(value, 'hashtag', hashtags)}
          suggestions={(() => {
            // console.log("INSIDE HASHTAG SUGGESTIONS: ", this.state.hashtagSuggestions);
            return this.state.hashtagSuggestions;
          })()}
          onAddMention={this.onAddMention}
          // onOpen={() => this.onOpen('hashtag', hashtags)}
          // onClose={() => this.onClose('hashtag', hashtags)}
        />
        <RelationSuggestions
          onSearchChange={({ value }) => this.onSearchChange(value, 'relation', relations)}
          suggestions={(() => {
            // console.log("INSIDE RELATION SUGGESTIONS");
            return this.state.relationSuggestions;
          })()}
          onAddMention={this.onAddMention}
          // onOpen={() => this.onOpen('relation', relations)}
          // onClose={() => this.onClose('relation', relations)}
        />
      </div>
    );
  }
}