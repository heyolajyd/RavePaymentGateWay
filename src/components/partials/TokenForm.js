import React, { Component, PropTypes } from 'react'
import { View, StyleSheet } from 'react-native'
import { Section, Input } from '../common'

class TokenForm extends Component {

  static propTypes = {
    onInputChange   : PropTypes.func,
    useEmbedToken   : PropTypes.bool
  }

  static defaultProps = {
    useEmbedToken: false
  }
    
  constructor(props) {
    super(props)
    
    this.state = {
      sortcode  : null,
      cvv       : null    
    }
  }
  
  _handleInputChange(key, value) {
    this.setState(
      { [key]: value }, 
      this.props.onInputChange(key, value)
    )
  }

  renderSection(placeholder, value, callback, maxLength, isSecuredText) {
    return (
      <Section>
        <Input
          placeholder={placeholder}
          value={value}
          onChangeText={callback}
          maxLength={maxLength}
          secureTextEntry={isSecuredText}
        />
      </Section>
    )
  }  

  renderForm() {
    const { sortcode, cvv } = this.state;
    const { useEmbedToken } = this.props;
    return !useEmbedToken
    ? (
      <View>
        {this.renderSection('Token', sortcode, this._handleInputChange.bind(this, 'shortcode'), 10)}
        {this.renderSection('CVV', cvv, this._handleInputChange.bind(this, 'cvv'), 3, true)}
      </View>
    ) : (
      <View>
        {this.renderSection('CVV', cvv, this._handleInputChange.bind(this, 'cvv'), 3, true)}
      </View>
    );
  }
  
  render() {
    return this.renderForm();
  }
}

const styles = StyleSheet.create({
  inputContainer: {
    flex: 1,
    height: 36
  },
  spacing: {
    marginLeft: 12
  },
  checkboxContainer: {
    flex: 1,
    flexDirection: 'row'
  },
})

export default TokenForm
