import React, { Component, PropTypes } from 'react'
import { View, StyleSheet } from 'react-native'
import { Section, Input } from '../common'

class TokenForm extends Component {

  static propTypes = {
    onInputChange   : PropTypes.func
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
  
  render() {
    const { sortcode, cvv } = this.state
    return (
      <View>
        <Section>
          <Input
            placeholder='Token'
            value={sortcode}
            onChangeText={this._handleInputChange.bind(this, 'sortcode')}
            maxLength={10}
          />
        </Section>
        <Section>
          <Input
            placeholder='CVV'
            value={cvv}
            onChangeText={this._handleInputChange.bind(this, 'cvv')}
            maxLength={3}
            secureTextEntry
          />
        </Section>                
      </View>
    )
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
