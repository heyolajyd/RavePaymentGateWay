import React, { Component, PropTypes } from 'react'
import { View, StyleSheet } from 'react-native'
import { Section, Input, CheckBox } from '../common'
import { PIN } from '../../selector'
import { formatCardNumber, formatExpiryDate } from '../../utils'

class CardDetailsForm extends Component {

  static propTypes = {
    onInputChange   : PropTypes.func,
    onCheckBoxChange: PropTypes.func,
    authModel       : PropTypes.string
  }
    
  constructor(props) {
    super(props)
    
    this.state = {
      cardno    : null,
      pin       : null,
      cvv       : null,
      expirydate: null,
      rememberMe: false     
    }
  }
  
  _handleInputChange(key, value) {
    let formattedValue = null
    
    switch(key) {
      case 'cardno':
        formattedValue = formatCardNumber(value)
        break;
      case 'expirydate':
        formattedValue = formatExpiryDate(value, this.state.expirydate)
        break;
      default:
        formattedValue = value
        break;
    }
   
    this.setState(
      { [key]: formattedValue }, 
      this.props.onInputChange(key, value)
    )
  }
  
  _handleCheckBoxChange = (value) => {
    this.setState(
      { 'rememberMe': value },
      this.props.onCheckBoxChange('rememberMe', value)
    )
  }
  
  renderPinInput() {
    const { pin } = this.state
    return (this.props.authModel === PIN)
    ? (
      <Section>
        <Input
          placeholder='PIN'
          value={pin}
          onChangeText={this._handleInputChange.bind(this, 'pin')}
          maxLength={4}
          secureTextEntry
        />
      </Section>
    )
    : null
  }

  render() {
    const { cardno, cvv, expirydate } = this.state
    return (
      <View>
        <Section>
          <Input
            placeholder='Card Number'
            value={cardno}
            onChangeText={this._handleInputChange.bind(this, 'cardno')}
          />
        </Section>
        <Section>
          <View style={styles.inputContainer}>
            <Input
              placeholder='MM / YY'
              value={expirydate}
              onChangeText={this._handleInputChange.bind(this, 'expirydate')}
              maxLength={7}
            />              
          </View>
          <View style={[styles.inputContainer, styles.spacing]}>
            <Input
              placeholder='CVV'
              value={cvv}
              onChangeText={this._handleInputChange.bind(this, 'cvv')}
              maxLength={3}
              secureTextEntry
            />             
          </View>
        </Section>
        {this.renderPinInput()}
        <Section>
          <View style={styles.checkboxContainer}>
            <CheckBox
              onChange={this._handleCheckBoxChange}
              isChecked={this.props.rememberMe}
              rightText={'Remember my card'}
            />
          </View>
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

export default CardDetailsForm
