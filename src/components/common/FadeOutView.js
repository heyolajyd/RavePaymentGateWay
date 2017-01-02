import React, { Component, } from 'react'
import { View, Animated } from 'react-native'

class FadeOutView extends Component {
  state: any;

  constructor(props) {
    super(props);
    this.state = {
      heightAnimation: new Animated.Value(),
    };
  }
    
  componentDidMount() {
    this.errorTransitions = setTimeout(() => {
      return this.props.callback(this.props.type)
    }, 3000)
  }
  
  componentWillUnmount() {
    clearTimeout(this.errorTransitions);
  }
  
  // Going to  implement but seems animation is slow
  animateHeight() {
    const { maxHeight } = this.state
    this.state.heightAnimation.setValue(maxHeight)
    Animated.spring(
      this.state.heightAnimation,
      {
        toValue: 0,
      }
    ).start(event => {
      if (event.finished) {
        return this.props.callback()
      }
    })
  }

  _setMaxHeight(event) {
    this.setState({
      maxHeight: event.nativeEvent.layout.height
    }, this.animateHeight);
  }
  
  render() {
    return (
      <View>
        {this.props.children}    
      </View>
    );
  }
}

FadeOutView.defaultProps = {
  callback() {}
}

export { FadeOutView }