import React, { Component } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableHighlight
} from 'react-native'
import { find } from 'underscore'
import Picker from './SelectPicker'
import Icon from 'react-native-vector-icons/FontAwesome'

const deviceWidth = Dimensions.get('window').width
const deviceHeight = Dimensions.get('window').height

class Select extends Component {
  state = {
    selectedValue: null,
    modalVisible: false,
    offSet: new Animated.Value(deviceHeight),
    options: this.props.options
  }
  
  _closeModal = () => {
    this.setState({ modalVisible: false })
  }
  
  _setModalVisible =() => {
    this.setState({ modalVisible: true })
  }
  
  _changeValue = (value) => {
    const selectedOption = find(this.state.options, option =>  option.code === value)
    this.setState({ selectedValue: selectedOption.name, modalVisible: false }, this.props.changeValue(value))
  }
  
  render() {
    const { modalVisible, offSet, selectedValue, options } = this.state
    return (
      <View style={styles.container}>
        <TouchableHighlight 
          style={styles.button} 
          underlayColor='transparent' 
          onPress={this._setModalVisible}>
          <View style={styles.buttonTextContainer}>
            <Text style={[styles.buttonText]}>
              {selectedValue ? selectedValue : this.props.defaultLabel}
            </Text>
            <Text style={[styles.buttonText]}>
              <Icon name='angle-down' size={16}/>
            </Text>
          </View>
        </TouchableHighlight>
        { modalVisible 
          ? (
              <Picker
                visible={modalVisible}
                options={options}
                closeModal={this._closeModal} 
                offSet={offSet} 
                changeValue={this._changeValue} 
                selectedValue={selectedValue}
              />
            ) 
          : null 
        }  
      </View>
    ) 
  }
}

Select.propTypes = {}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },  
  button: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#E4E4E4'
  },
  buttonTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  buttonText: {
    borderColor: '#E4E4E4',
    fontSize: 14
  }
});

export { Select }
