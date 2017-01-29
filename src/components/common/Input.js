import React, { Component, PropTypes } from 'react';
import {
  View,
  TextInput,
  StyleSheet
} from 'react-native'

class Input extends Component {
  state = {
    borderColor: '#E4E4E4'
  }
  
  onFocus = () => {
    this.setState({
      borderColor: '#FEBE12'
    })
  }
  
  onBlur = () => {
    this.setState({
      borderColor: '#E4E4E4'
    })
  }  
  
  render() {
    const {
      placeholder, 
      value, 
      onChangeText, 
      maxLength, 
      secureTextEntry, 
      returnKeyType, 
      onSubmitEditing
    } = this.props
    
    return (
      <TextInput
        autoCorrect={false}
        secureTextEntry={secureTextEntry}
        keyboardType='numeric'
        placeholder={placeholder}
        value={value}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        onChangeText={onChangeText}
        maxLength={maxLength}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        underlineColorAndroid='transparent'
        style={[styles.input, { borderColor: this.state.borderColor }]}
      />
    )    
  }
}

Input.propTypes = {
  value           : PropTypes.string,
  placeholder     : PropTypes.string,
  onChangeText    : PropTypes.func,
  maxLength       : PropTypes.number,
  secureTextEntry : PropTypes.bool
}

const styles = {
  input: {
    padding: 10,
    height: 36,
    flex: 1,
    flexDirection: 'row',
    fontSize: 14,
    borderWidth: 1,
    borderRadius: 4,
    color: '#000',
    paddingLeft: 15,
    paddingRight: 15
  }
}

export { Input }