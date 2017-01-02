import React, { PropTypes } from 'react'
import { Text, TouchableHighlight, StyleSheet } from 'react-native'
import { formatCurrency } from '../../utils'

const Button = ({ onPress, labelText, loading, buttonTextStyle, buttonStyle, underlayColor }) => {
  const { button, buttonText } = styles;
  return (
    <TouchableHighlight 
      style={[button, buttonStyle]} 
      onPress={onPress}
      underlayColor={underlayColor}>
      <Text style={[buttonText, buttonTextStyle]}>
        {loading ? 'Please wait...' : labelText }
      </Text>
    </TouchableHighlight>
  )
}

Button.propTypes = {
  onPress     : PropTypes.func,
  labelText   : PropTypes.string,
  loading     : PropTypes.bool
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'stretch',
    flex: 1,
    flexDirection: 'row',
    borderRadius: 5,
    borderWidth: 1,
    justifyContent: 'center',
  },
  buttonText: {
    alignSelf: 'center',
    fontSize: 16,
    fontWeight: '600',
    paddingTop: 10,
    paddingBottom: 10
  }
});

export { Button }
