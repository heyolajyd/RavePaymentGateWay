import React, { Component, } from 'react'
import { View, Animated, Picker, Dimensions } from 'react-native'

const deviceWidth = Dimensions.get('window').width
const deviceHeight = Dimensions.get('window').height


const SelectPicker = ({ options = [], selectedValue, changeValue }) => {
  return (
    <Picker
      style={styles.picker}
      itemStyle={styles.itemStyle}
      selectedValue={ selectedValue }
      onValueChange={ changeValue }
      mode='dropdown'>
      { options.map(option => {
        return (
          <Picker.Item 
           key={option.code} 
           label={option.name} 
           value={option.code}
          />
        )
      })}
    </Picker>
  )
}

const styles = {
  itemStyle: {
    fontSize: 14,
    textAlign: 'center', 
    fontWeight: 'bold'
  } 
}

export default SelectPicker
