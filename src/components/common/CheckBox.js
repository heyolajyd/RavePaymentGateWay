import React, { Component, PropTypes } from 'react'
import { View, StyleSheet, Image, Text, TouchableHighlight } from 'react-native'

const CB_ENABLED_IMAGE = require('../../assets/check_box.png');
const CB_DISABLED_IMAGE = require('../../assets/check_box_outline_blank.png');

class CheckBox extends Component {

  static propTypes = {  
    ...View.propTypes,
    leftText: PropTypes.string,
    leftTextView: PropTypes.element,
    rightText: PropTypes.string,
    leftTextStyle: Text.propTypes.style,
    rightTextView: PropTypes.element,
    rightTextStyle: Text.propTypes.style,
    onChange: PropTypes.func.isRequired,
    isChecked: PropTypes.bool    
  }

  static defaultProps = {
    checkedImage: CB_ENABLED_IMAGE,
    unCheckedImage: CB_DISABLED_IMAGE,
    isChecked: false,
    leftTextStyle: {},
    rightTextStyle: {}
  }

  constructor(props) {
    super(props)
    this.state = {
      isChecked: this.props.isChecked,
    }
    
    this.onChange = this.onChange.bind(this);
  }
  
  onChange() {
    this.props.onChange()
  }
  
  genCheckedImage() {
    const { checkedImage, unCheckedImage } = this.props;
    const source = this.props.isChecked ? checkedImage : unCheckedImage;
    
    return (
      <Image style={styles.imageContainer} source={source} />
    )
  }
  
  _renderImage() {
    return this.genCheckedImage();   
  }
  
  _renderLeftLabel() {
    if (this.props.leftTextView) return this.props.leftTextView;
    if (!this.props.leftText) return null;
    return (
      <Text style={[styles.leftText]}>
        {this.props.leftText}
      </Text>
    )
  }
  
  _renderRightLabel() {
    if (!this.props.rightText) return null;
    return (
      <Text style={[styles.rightText]}>
        {this.props.rightText}
      </Text>
    )
  }  

  render() {
    return (
      <View>
        <TouchableHighlight 
          onPress={this.onChange}
          underlayColor='transparent'>
          <View style={styles.container}>
            {this._renderLeftLabel()}
            {this._renderImage()}
            {this._renderRightLabel()}
          </View>
        </TouchableHighlight>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  imageContainer: {
    width: 15,
    height: 15
  },
  rightText: {
    marginLeft: 5
  },
  leftText: {
    marginRight: 5
  }
})

export { CheckBox }